'use client';

import React from 'react';
import useSWR from 'swr';
import axios from 'axios';
import { toast } from 'sonner';
import { GPClient, axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { Role } from '@/types/permissions/role';
import { Checkbox } from '@/components/ui/checkbox';

type RolesResponse = Role[] | null;

const roleModulesPermissionsKey = '/api/role-modules/getRoleModulesAndPermissions';

type ItemCheckLoose = { uuid: string | null; isChecked?: boolean | null } | null;

const toCheckedSet = (items?: ItemCheckLoose[] | null) => {
  const set = new Set<string>();
  for (const it of items ?? []) {
    if (it && it.uuid && !!it.isChecked) {
      set.add(it.uuid);
    }
  }
  return set;
};

const diffSets = (before: Set<string>, after: Set<string>) => {
  const link: string[] = [];
  const unlink: string[] = [];

  after.forEach((v) => {
    if (!before.has(v)) link.push(v);
  });
  before.forEach((v) => {
    if (!after.has(v)) unlink.push(v);
  });

  return { link, unlink };
};

export default function Permissions() {
  const { data: serverData, isLoading } = useSWR<RolesResponse>(
    roleModulesPermissionsKey,
    axiosFetcher
  );

  const [rolesData, setRolesData] = React.useState<RolesResponse>(serverData || null);
  const [originalData, setOriginalData] = React.useState<RolesResponse>(null);

  React.useEffect(() => {
    if (serverData) {
      setRolesData(serverData);
      setOriginalData(serverData);
    }
  }, [serverData]);

  const handlePermissionChange = (roleIdx: number, permIdx: number) => {
    setRolesData((prev) => {
      if (!prev) return prev;
      return prev.map((role, rIdx) => {
        if (rIdx !== roleIdx) return role;
        if (!role.permissions) return role;

        const newPerms = role.permissions.map((perm, pIdx) =>
          pIdx !== permIdx ? perm : { ...perm, isChecked: !perm.isChecked }
        );

        return { ...role, permissions: newPerms };
      });
    });
  };

  const handleSave = async () => {
    if (!rolesData || !originalData) return;

    try {
      const changes = rolesData.map((roleAfter) => {
        const roleBefore = originalData.find((r) => r?.uuid === roleAfter?.uuid);

        const beforeModules = toCheckedSet(roleBefore?.modules as ItemCheckLoose[] | null);
        const afterModules = toCheckedSet(roleAfter?.modules as ItemCheckLoose[] | null);
        const modDiff = diffSets(beforeModules, afterModules);

        const beforePerms = toCheckedSet(roleBefore?.permissions as ItemCheckLoose[] | null);
        const afterPerms = toCheckedSet(roleAfter?.permissions as ItemCheckLoose[] | null);
        const permDiff = diffSets(beforePerms, afterPerms);

        const role_uuid = roleAfter?.uuid;

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
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : String(err);
      toast.error(msg);
      console.error(err);
    }
  };

  if (isLoading) return <p>Cargando...</p>;
  if (!rolesData) return <p>No hay datos</p>;

  return (
    <div className="p-4 space-y-8">
      {rolesData.map((role, roleIdx) => {
        const groups: Record<string, { perm: any; permIdx: number }[]> = {};

        (role.permissions ?? []).forEach((perm, permIdx) => {
          const prefix = perm.action?.split('_')[0] || 'OTROS';
          if (!groups[prefix]) groups[prefix] = [];
          groups[prefix].push({ perm, permIdx });
        });

        const sortedGroupKeys = Object.keys(groups).sort();

        sortedGroupKeys.forEach((key) => {
          groups[key].sort((a, b) => (a.perm.action || '').localeCompare(b.perm.action || ''));
        });

        return (
          <div key={role.uuid ?? roleIdx} className="border p-4 rounded">
            <h3 className="font-bold mb-2">{role.name}</h3>

            {sortedGroupKeys.map((groupKey) => (
              <div key={groupKey} className="mb-4">
                <p className="font-semibold mb-2">{groupKey}</p>

                {groups[groupKey].map(({ perm, permIdx }) => (
                  <label key={perm.uuid ?? permIdx} className="flex items-center space-x-2 mb-1">
                    <Checkbox
                      checked={!!perm.isChecked}
                      onChange={() => handlePermissionChange(roleIdx, permIdx)}
                    />
                    <span>
                      {perm.action} - {perm.description}
                    </span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        );
      })}

      <button
        onClick={handleSave}
        className="px-4 py-2 border rounded bg-blue-600 text-white text-sm"
      >
        Guardar cambios
      </button>
    </div>
  );
}
