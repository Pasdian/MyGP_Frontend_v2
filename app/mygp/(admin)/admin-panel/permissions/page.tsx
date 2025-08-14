'use client';
import React from 'react';
import useSWR, { mutate } from 'swr';
import { axiosFetcher, GPClient } from '@/lib/axiosUtils/axios-instance';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import TailwindSpinner from '@/components/ui/TailwindSpinner';
import { Role } from '@/types/permissions/role';

type getRoleModulesAndPermissions = Role[] | null;

const roleModulesPermissionsKey = '/api/role-modules/getRoleModulesAndPermissions';

export default function Permissions() {
  const {
    data: serverData,
    isLoading: isServerDataLoading,
    isValidating: isServerDataValidating,
  } = useSWR<getRoleModulesAndPermissions>(roleModulesPermissionsKey, axiosFetcher);

  // Local state to track changes
  const [rolesData, setRolesData] = React.useState<getRoleModulesAndPermissions>(serverData || []);

  // Sync local state when serverData changes
  React.useEffect(() => {
    if (serverData) setRolesData(serverData);
  }, [serverData]);

  const handlePermissionChange = (roleIdx: number, moduleIdx: number, permIdx: number) => {
    setRolesData(
      (prev) =>
        prev?.map((role, rIdx) => {
          if (rIdx !== roleIdx) return role;
          const newModules =
            role.modules?.map((mod, mIdx) => {
              if (mIdx !== moduleIdx) return mod;
              const newPermissions =
                mod.permissions?.map((perm, pIdx) => {
                  if (pIdx !== permIdx) return perm;
                  return { ...perm, isChecked: !perm.isChecked };
                }) || [];
              // Update module isChecked if at least one permission is checked
              const moduleIsChecked = newPermissions.some((p) => p.isChecked);
              return { ...mod, permissions: newPermissions, isChecked: moduleIsChecked };
            }) || [];
          return { ...role, modules: newModules };
        }) || []
    );
  };

  const handleModuleChange = (roleIdx: number, moduleIdx: number) => {
    setRolesData(
      (prev) =>
        prev?.map((role, rIdx) => {
          if (rIdx !== roleIdx) return role;
          const newModules =
            role.modules?.map((mod, mIdx) => {
              if (mIdx !== moduleIdx) return mod;
              const newIsChecked = !mod.isChecked;
              const newPermissions =
                mod.permissions?.map((perm) => ({ ...perm, isChecked: newIsChecked })) || [];
              return { ...mod, isChecked: newIsChecked, permissions: newPermissions };
            }) || [];
          return { ...role, modules: newModules };
        }) || []
    );
  };

  const handleSave = async () => {
    try {
      toast.info('Cargando...');
      const res = await GPClient.post('/api/role-permissions/upsertRoles', rolesData);
      toast.success(res.data.message);
      mutate(roleModulesPermissionsKey);
    } catch (error) {
      console.error(error);
    }
  };

  if (isServerDataLoading) return;
  if (!rolesData) return <p>No hay datos</p>;
  if (isServerDataValidating) return <TailwindSpinner />;
  return (
    <div>
      {rolesData.map((role, roleIdx) => (
        <div key={role.uuid} className="mb-12 border p-4 rounded shadow-sm">
          <h3 className="font-bold mb-3 text-lg">Rol: {role.name}</h3>

          {role.modules?.map((mod, moduleIdx) => (
            <div key={mod.uuid}>
              <div className="flex items-center">
                <Checkbox
                  className="mr-2"
                  checked={mod.isChecked || false}
                  onCheckedChange={() => handleModuleChange(roleIdx, moduleIdx)}
                />
                <p>{mod.name}</p>
              </div>

              <div>
                {mod.permissions?.map((perm, permIdx) => (
                  <div key={perm.uuid} className="ml-4">
                    <div className="flex items-center">
                      <Checkbox
                        className="mr-2"
                        checked={perm.isChecked || false}
                        onCheckedChange={() => handlePermissionChange(roleIdx, moduleIdx, permIdx)}
                      />
                      {perm.action} - {perm.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {role.users && role.users.length > 0 && (
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
