'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import { GPClient, axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { Checkbox } from '@/components/ui/checkbox';
import MyGPSpinner from '@/components/MyGPUI/Spinners/MyGPSpinner';
import PermissionGuard from '@/components/PermissionGuard/PermissionGuard';
import { PERM } from '@/lib/modules/permissions';
import MyGPButtonSubmit from '@/components/MyGPUI/Buttons/MyGPButtonSubmit';
import { SaveAllIcon } from 'lucide-react';

type RoleUser = { name: string; email: string };

type RoleModule = {
  uuid: string | null;
  name: string;
  alias: string;
  isChecked?: boolean | null;
};

type RolePermission = {
  uuid: string | null;
  action: string;
  description: string;
  isChecked?: boolean | null;
};

type Role = {
  uuid: string | null;
  name: string;
  users?: RoleUser[];
  modules?: RoleModule[];
  permissions?: RolePermission[];
};

type RolesResponse = Role[] | null;

const roleModulesPermissionsKey = '/api/role-modules/getRoleModulesAndPermissions';

type FormValues = {
  roles: Record<
    string,
    {
      permissions: Record<string, boolean>;
      modules: Record<string, boolean>;
    }
  >;
};

const buildDefaultValues = (roles: Role[]): FormValues => {
  const values: FormValues = { roles: {} };

  for (const role of roles) {
    if (!role?.uuid) continue;

    const perms: Record<string, boolean> = {};
    for (const p of role.permissions ?? []) {
      if (p?.uuid) perms[p.uuid] = !!p.isChecked;
    }

    const mods: Record<string, boolean> = {};
    for (const m of role.modules ?? []) {
      if (m?.uuid) mods[m.uuid] = !!m.isChecked;
    }

    values.roles[role.uuid] = { permissions: perms, modules: mods };
  }

  return values;
};

const diffBoolMaps = (before: Record<string, boolean>, after: Record<string, boolean>) => {
  const link: string[] = [];
  const unlink: string[] = [];

  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const k of keys) {
    const b = !!before[k];
    const a = !!after[k];
    if (a && !b) link.push(k);
    if (!a && b) unlink.push(k);
  }

  return { link, unlink };
};

// Simple fuzzy: checks query chars appear in order. Returns a score (lower is better).
const fuzzyMatchScore = (text: string, query: string) => {
  const t = text.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return { matched: true, score: 0 };

  let ti = 0;
  let score = 0;

  for (let qi = 0; qi < q.length; qi++) {
    const ch = q[qi];
    const foundAt = t.indexOf(ch, ti);
    if (foundAt === -1) return { matched: false, score: Number.POSITIVE_INFINITY };

    score += foundAt - ti;
    ti = foundAt + 1;
  }

  // Small boost for prefix matches
  if (t.startsWith(q)) score -= 5;

  return { matched: true, score };
};

export default function Permissions() {
  const { data, isLoading } = useSWR<RolesResponse>(roleModulesPermissionsKey, axiosFetcher);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const roles = data ?? [];

  const [query, setQuery] = useState('');

  const { control, reset, handleSubmit } = useForm<FormValues>({
    defaultValues: { roles: {} },
  });

  const initialRef = useRef<FormValues | null>(null);

  useEffect(() => {
    if (!roles.length) return;
    const defaults = buildDefaultValues(roles);
    initialRef.current = defaults;
    reset(defaults);
  }, [roles, reset]);

  const grouped = useMemo(() => {
    return roles
      .filter((r) => !!r?.uuid)
      .map((role) => {
        const groups: Record<string, RolePermission[]> = {};

        for (const perm of role.permissions ?? []) {
          const prefix = perm.action?.split('_')[0] || 'OTROS';
          if (!groups[prefix]) groups[prefix] = [];
          groups[prefix].push(perm);
        }

        const keys = Object.keys(groups).sort();
        for (const k of keys) {
          groups[k].sort((a, b) => (a.action || '').localeCompare(b.action || ''));
        }

        return { role, groups, keys };
      });
  }, [roles]);

  const filteredGrouped = useMemo(() => {
    const q = query.trim();
    if (!q) return grouped;

    return grouped
      .map((g) => {
        const { matched, score } = fuzzyMatchScore(g.role.name ?? '', q);
        return matched ? { ...g, _score: score } : null;
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x))
      .sort((a, b) => (a._score ?? 0) - (b._score ?? 0));
  }, [grouped, query]);

  const onSave = async (values: FormValues) => {
    setIsSubmitting(true);
    if (!initialRef.current) return;

    try {
      const changes = roles
        .filter((r) => !!r?.uuid)
        .map((role) => {
          const role_uuid = role.uuid as string;

          const beforeRole = initialRef.current!.roles[role_uuid] ?? {
            permissions: {},
            modules: {},
          };
          const afterRole = values.roles[role_uuid] ?? { permissions: {}, modules: {} };

          const modDiff = diffBoolMaps(beforeRole.modules, afterRole.modules);
          const permDiff = diffBoolMaps(beforeRole.permissions, afterRole.permissions);

          return {
            role_uuid,
            modules: {
              link: modDiff.link.map((module_uuid) => ({ role_uuid, module_uuid })),
              unlink: modDiff.unlink.map((module_uuid) => ({ role_uuid, module_uuid })),
            },
            permissions: {
              link: permDiff.link.map((permission_uuid) => ({ role_uuid, permission_uuid })),
              unlink: permDiff.unlink.map((permission_uuid) => ({ role_uuid, permission_uuid })),
            },
          };
        });

      const payload = {
        modules: {
          link: changes.flatMap((c) => c.modules.link),
          unlink: changes.flatMap((c) => c.modules.unlink),
        },
        permissions: {
          link: changes.flatMap((c) => c.permissions.link),
          unlink: changes.flatMap((c) => c.permissions.unlink),
        },
      };

      const res = await GPClient.post('/api/role-permissions/upsertRoles', payload);
      toast.success(res.data?.message ?? 'Cambios guardados.');
      initialRef.current = values;
      setIsSubmitting(false);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : String(err);
      toast.error(msg);
      console.error(err);
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <MyGPSpinner />;
  if (!roles.length) return <p>No hay datos</p>;

  return (
    <PermissionGuard requiredPermissions={[PERM.ADMIN_ACCESOS]}>
      <form onSubmit={handleSubmit(onSave)} className="p-4 space-y-6">
        <div className="flex items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar rol..."
            className="w-full md:w-[520px] px-3 py-2 border rounded text-sm"
          />
          {query.trim() && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="px-3 py-2 border rounded text-sm"
            >
              Limpiar
            </button>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          Mostrando {filteredGrouped.length} de {grouped.length} roles
        </div>

        <div className="space-y-8">
          {filteredGrouped.map(({ role, groups, keys }) => {
            const roleId = role.uuid as string;

            return (
              <div key={roleId} className="border p-4 rounded space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold">Rol: {role.name}</h3>
                  <span className="text-xs text-muted-foreground">
                    Usuarios: {(role.users ?? []).length}
                  </span>
                </div>

                <div className="space-y-4">
                  <p className="font-semibold">Permisos</p>

                  {keys.map((groupKey) => (
                    <div key={groupKey} className="space-y-2">
                      <p className="font-medium">Permisos {groupKey}</p>

                      <div className="space-y-1">
                        {groups[groupKey].map((perm) => {
                          if (!perm?.uuid) return null;

                          return (
                            <label key={perm.uuid} className="flex items-center gap-2">
                              <Controller
                                control={control}
                                name={`roles.${roleId}.permissions.${perm.uuid}` as const}
                                render={({ field }) => (
                                  <Checkbox
                                    checked={!!field.value}
                                    onCheckedChange={(v) => field.onChange(!!v)}
                                  />
                                )}
                              />
                              <span className="min-w-0 break-words whitespace-normal">
                                {perm.action} - {perm.description}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <MyGPButtonSubmit isSubmitting={isSubmitting}>
            <SaveAllIcon />
            Guardar cambios
          </MyGPButtonSubmit>

          <button
            type="button"
            onClick={() => {
              const initial = initialRef.current;
              if (initial) reset(initial);
            }}
            className="px-4 py-2 border rounded text-sm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </PermissionGuard>
  );
}
