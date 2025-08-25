'use client';
import React from 'react';
import useSWRImmutable, { mutate } from 'swr';
import axios from 'axios';
import { GPClient, axiosFetcher } from '@/lib/axiosUtils/axios-instance';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import { IconPlus } from '@tabler/icons-react';
import { Loader2, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { Role } from '@/types/permissions/role';
import { getAllRoles } from '@/types/roles/getAllRoles';

type getRoleModulesAndPermissions = Role[] | null;
const roleModulesPermissionsKey = '/api/role-modules/getRoleModulesAndPermissions';
type ItemCheckLoose = { uuid: string | null; isChecked?: boolean | null } | null;

const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export default function Permissions() {
  const {
    data: serverData,
    isLoading: isServerDataLoading,
    isValidating: isServerDataValidating,
  } = useSWRImmutable<getRoleModulesAndPermissions>(roleModulesPermissionsKey, axiosFetcher);

  // Local modifiable state
  const [rolesData, setRolesData] = React.useState<getRoleModulesAndPermissions>(serverData || []);
  // Original snapshot for diffs
  const [originalData, setOriginalData] = React.useState<getRoleModulesAndPermissions>([]);

  // Sincroniza cuando llega serverData
  React.useEffect(() => {
    if (serverData) {
      setRolesData(serverData);
      setOriginalData(serverData);
    }
  }, [serverData]);

  const handlePermissionChange = (roleIdx: number, permIdx: number) => {
    setRolesData(
      (prev) =>
        prev?.map((role, rIdx) => {
          if (rIdx !== roleIdx) return role;
          const newPerms =
            role.permissions?.map((perm, pIdx) =>
              pIdx !== permIdx ? perm : { ...perm, isChecked: !perm.isChecked }
            ) ?? [];
          return { ...role, permissions: newPerms };
        }) ?? []
    );
  };

  // Toggle de un módulo (marca/desmarca todos los permisos del módulo en UI)
  const handleModuleChange = (roleIdx: number, moduleIdx: number) => {
    setRolesData(
      (prev) =>
        prev?.map((role, rIdx) => {
          if (rIdx !== roleIdx) return role;
          const newModules = (role.modules ?? []).map((mod, mIdx) =>
            mIdx !== moduleIdx ? mod : { ...mod, isChecked: !mod.isChecked }
          );
          return { ...role, modules: newModules };
        }) ?? []
    );
  };

  // Helpers de diff
  type ItemCheck = { uuid: string; isChecked?: boolean };
  type RoleLike = {
    uuid: string;
    modules?: ItemCheck[];
    permissions?: ItemCheck[];
    users?: Array<{ name: string; email: string }>;
  };

  const toCheckedSet = (items?: ItemCheckLoose[] | null) => {
    const set = new Set<string>();
    for (const it of items ?? []) {
      if (it && it.uuid && !!it.isChecked) set.add(it.uuid);
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

  // Guarda solo cambios (link/unlink)
  const handleSave = async () => {
    if (!rolesData || !originalData) return;
    try {
      // Construye diffs por rol
      const changes = rolesData.map((roleAfter) => {
        const roleBefore = originalData.find((r) => r?.uuid === roleAfter?.uuid) as
          | RoleLike
          | undefined;

        const beforeModules = toCheckedSet(roleBefore?.modules);
        const afterModules = toCheckedSet(roleAfter?.modules);
        const modDiff = diffSets(beforeModules, afterModules);

        const beforePerms = toCheckedSet(roleBefore?.permissions);
        const afterPerms = toCheckedSet(roleAfter?.permissions);
        const permDiff = diffSets(beforePerms, afterPerms);

        return {
          role_uuid: roleAfter!.uuid,
          modules: {
            link: modDiff.link.map((module_uuid) => ({ role_uuid: roleAfter!.uuid, module_uuid })),
            unlink: modDiff.unlink.map((module_uuid) => ({
              role_uuid: roleAfter!.uuid,
              module_uuid,
            })),
          },
          permissions: {
            link: permDiff.link.map((permission_uuid) => ({
              role_uuid: roleAfter!.uuid,
              permission_uuid,
            })),
            unlink: permDiff.unlink.map((permission_uuid) => ({
              role_uuid: roleAfter!.uuid,
              permission_uuid,
            })),
          },
        };
      });

      // Payload aplanado (batch)
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
      mutate(roleModulesPermissionsKey);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : String(err);
      toast.error(msg);
      console.error(err);
    }
  };

  if (isServerDataLoading || isServerDataValidating) return <TailwindSpinner />;
  if (!rolesData) return <p>No hay datos</p>;

  return (
    <div className="overflow-y-auto max-h-full">
      <div className="mb-4">
        <AddPermissionDialog />
      </div>

      {rolesData.map((role, roleIdx) => (
        <div key={role.uuid} className="mb-12 border p-4 rounded shadow-sm">
          <h3 className="font-bold mb-3 text-lg">El rol: {role.name}</h3>

          <h2 className="font-bold mb-3 text-lg">Tiene acceso a los siguientes módulos:</h2>
          {role.modules?.map((mod, moduleIdx) => (
            <div key={mod.uuid} className="mb-2">
              <div className="flex items-center">
                <Checkbox
                  className="mr-2"
                  checked={!!mod.isChecked}
                  onCheckedChange={() => handleModuleChange(roleIdx, moduleIdx)}
                />
                <p>{mod.name}</p>
              </div>
            </div>
          ))}

          <h2 className="font-bold mb-3 text-lg">Y tiene los siguientes permisos:</h2>
          {role.permissions?.map((perm, permIdx) => (
            <div key={perm.uuid}>
              <div className="flex items-center">
                <Checkbox
                  className="mr-2"
                  checked={!!perm.isChecked}
                  onCheckedChange={() => handlePermissionChange(roleIdx, permIdx)}
                />
                {perm.action} - {perm.description}
              </div>
            </div>
          ))}

          {Array.isArray(role.users) && role.users.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold">Usuarios con este rol:</p>
              <ul className="list-disc ml-6">
                {role.users.map((user) => (
                  <li key={user.email}>
                    {user.name} ({user.email})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}

      <Button
        onClick={handleSave}
        className="fixed text-md bg-blue-600 hover:bg-blue-700 cursor-pointer bottom-5 right-13"
      >
        Guardar cambios
      </Button>
    </div>
  );
}

function AddPermissionDialog() {
  const { data: allRoles, isLoading: isAllRolesLoading } = useSWRImmutable<getAllRoles[]>(
    '/api/roles',
    axiosFetcher
  );

  const [selectValue, setSelectValue] = React.useState<string>('');
  const [permissions, setPermissions] = React.useState<
    Array<{ id: string; action: string; description: string }>
  >([{ id: uid(), action: '', description: '' }]);

  const addPermission = () => {
    setPermissions((prev) => [...prev, { id: uid(), action: '', description: '' }]);
  };

  const removePermission = (id: string) => {
    setPermissions((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== id) : prev));
  };

  const updatePermission = (id: string, action?: string, description?: string) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, action: action || '', description: description || '' } : p
      )
    );
  };

  const handleSave = async () => {
    // limpiar / normalizar
    const cleaned = permissions
      .map((p) => ({
        action: p.action.trim().toUpperCase(),
        description: p.description.trim(),
      }))
      .filter((p) => p.action.length > 0);

    // dedupe por action
    const uniqueByAction = Array.from(new Map(cleaned.map((p) => [p.action, p])).values());

    if (!selectValue || uniqueByAction.length === 0) {
      toast.warning('Selecciona un rol y agrega al menos un permiso.');
      return;
    }

    const payload = {
      role_uuid: selectValue,
      permissions: uniqueByAction, // [{ action, description }]
    };

    try {
      toast.info('Creando permisos...');
      const res = await GPClient.post('/api/role-permissions/createRolePermissions', payload);
      toast.success(res.data?.message ?? 'Permisos creados y asignados.');
      mutate(roleModulesPermissionsKey);
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.message ?? err.message
        : String(err);
      toast.error(msg);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-blue-500 hover:bg-blue-600 mb-4 cursor-pointer">
          <IconPlus className="mr-2 h-4 w-4" />
          Añadir Permiso
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md max-h-[800px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Añadir Permiso</DialogTitle>
          <DialogDescription>
            Crea uno o más permisos y asígnalos a un rol existente.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4">
          {isAllRolesLoading ? (
            <Select disabled>
              <SelectTrigger className="w-[260px]">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <SelectValue placeholder="Cargando roles" />
              </SelectTrigger>
            </Select>
          ) : (
            <Select value={selectValue} onValueChange={setSelectValue}>
              <SelectTrigger className="w-[260px]">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {allRoles?.map((role) => (
                  <SelectItem key={role.uuid} value={role.uuid}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {selectValue && (
          <div className="space-y-4">
            {permissions.map((perm, idx) => (
              <div key={perm.id} className="flex">
                <div className="flex-grow w-full mr-2 space-y-2">
                  <div className="flex flex-col">
                    <Label htmlFor={`action-${perm.id}`} className="mb-1 font-medium">
                      Acción {idx + 1}
                    </Label>
                    <Input
                      id={`action-${perm.id}`}
                      value={perm.action}
                      onChange={(e) =>
                        updatePermission(
                          perm.id,
                          e.target.value.replace(/\s/g, ''), // sin espacios
                          perm.description
                        )
                      }
                      placeholder="Ej: DEA_EXP_DIGITAL"
                      className="uppercase"
                    />
                  </div>

                  <div className="flex flex-col">
                    <Label htmlFor={`description-${perm.id}`} className="mb-1 font-medium">
                      Descripción {idx + 1}
                    </Label>
                    <Input
                      id={`description-${perm.id}`}
                      value={perm.description}
                      onChange={(e) => updatePermission(perm.id, perm.action, e.target.value)}
                      placeholder="Ej: Sirve para ver el expediente digital"
                      className="uppercase"
                    />
                  </div>
                </div>
                <div>
                  <Button
                    type="button"
                    className="h-full bg-red-500 hover:bg-red-600 cursor-pointer"
                    onClick={() => removePermission(perm.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectValue && (
          <Button
            type="button"
            className="h-full bg-blue-500 hover:bg-blue-600 cursor-pointer mt-2"
            onClick={addPermission}
          >
            <IconPlus />
            <span className="ml-2">Añadir permiso</span>
          </Button>
        )}

        <DialogFooter>
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
            onClick={handleSave}
            disabled={!selectValue || permissions.every((perm) => !perm.action.trim())}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
