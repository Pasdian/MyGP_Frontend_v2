'use client';
import React from 'react';
import useSWR from 'swr';
import { axiosFetcher } from '@/lib/axiosUtils/axios-instance';
import { getRolesWithModulesAndPermissions } from '@/types/users/getRolesWithModulesAndPermissions';
import { getAllModules } from '@/types/getAllModules/getAllModules';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

type PermissionState = {
  [permissionUuid: string]: boolean;
};

type ModuleState = {
  [module_uuid: string]: {
    checked: boolean;
    permissions: PermissionState;
  };
};

type RoleState = {
  [role_uuid: string]: ModuleState;
};

export default function Permissions() {
  const { data: rolesModulesPermissions, isLoading: isRolesModulesPermissionsLoading } = useSWR<
    getRolesWithModulesAndPermissions[]
  >('/api/role-modules/getRolesWithModulesAndPermissions', axiosFetcher);

  const { data: allModules, isLoading: isAllModulesLoading } = useSWR<getAllModules[]>(
    '/api/modules',
    axiosFetcher
  );

  const [rolesState, setRolesState] = React.useState<RoleState>({});

  React.useEffect(() => {
    if (!rolesModulesPermissions) return;

    const newState: RoleState = {};

    rolesModulesPermissions.forEach((role) => {
      newState[role.uuid] = {};
      if (!role.modules) return;

      role.modules.forEach((module) => {
        const permissionsState: PermissionState = {};
        if (!module.permissions) return;

        module.permissions.forEach((perm) => {
          permissionsState[perm.uuid] = true; // permisos activos inicialmente
        });

        newState[role.uuid][module.uuid] = {
          checked: true, // módulo activo
          permissions: permissionsState,
        };
      });
    });

    setRolesState(newState);
  }, [rolesModulesPermissions]);

  if (isRolesModulesPermissionsLoading || isAllModulesLoading) return;
  if (!rolesModulesPermissions || !allModules) return <p>No hay datos</p>;

  const toggleModule = (role_uuid: string, module_uuid: string) => {
    setRolesState((prev) => {
      const roleModules = prev[role_uuid] || {};
      const currentModule = roleModules[module_uuid];

      if (!currentModule) return prev;

      const newChecked = !currentModule.checked;

      // If module gets deativated, also the permissions
      const newPermissions = Object.fromEntries(
        Object.keys(currentModule.permissions).map((permUuid) => [
          permUuid,
          newChecked ? true : false,
        ])
      );

      return {
        ...prev,
        [role_uuid]: {
          ...roleModules,
          [module_uuid]: {
            checked: newChecked,
            permissions: newPermissions,
          },
        },
      };
    });
  };

  // Toggle individual permission, if permission is enabled, also enable module
  const togglePermission = (role_uuid: string, module_uuid: string, permUuid: string) => {
    setRolesState((prev) => {
      const roleModules = prev[role_uuid] || {};
      const currentModule = roleModules[module_uuid];

      if (!currentModule) return prev;

      const currentPermChecked = currentModule.permissions[permUuid] || false;
      const newPermChecked = !currentPermChecked;

      // Update permission
      const newPermissions = {
        ...currentModule.permissions,
        [permUuid]: newPermChecked,
      };

      // If you enable a permission, it activates the module
      const newModuleChecked = newPermChecked ? true : Object.values(newPermissions).some((v) => v);

      return {
        ...prev,
        [role_uuid]: {
          ...roleModules,
          [module_uuid]: {
            checked: newModuleChecked,
            permissions: newPermissions,
          },
        },
      };
    });
  };

  const handleSave = async () => {
    try {
      const payload = Object.entries(rolesState).map(([role_uuid, modules]) => ({
        role_uuid,
        modules: Object.entries(modules).map(([module_uuid, { checked, permissions }]) => ({
          module_uuid,
          checked,
          permissions: Object.entries(permissions)
            .filter(([, isChecked]) => isChecked)
            .map(([permUuid]) => permUuid),
        })),
      }));

      // TO-DO: Send to api
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {rolesModulesPermissions.map((role) => (
        <div key={role.uuid} className="mb-12 border p-4 rounded shadow-sm">
          <h3 className="font-bold mb-3 text-lg">Rol: {role.role}</h3>

          {role.modules && role.modules.length > 0 ? (
            Object.entries(rolesState[role.uuid] || {}).map(([module_uuid, moduleState]) => {
              if (!role.modules) return;
              const moduleData = role.modules.find((m) => m.uuid === module_uuid);
              if (!moduleData) return null;

              return (
                <div key={module_uuid} className="mb-4">
                  <div className="flex items-center mb-1">
                    <Checkbox
                      checked={moduleState.checked}
                      onCheckedChange={() => toggleModule(role.uuid, module_uuid)}
                      className="mr-2"
                    />
                    <p className="font-semibold">Módulo: {moduleData.name}</p>
                  </div>

                  <div className="ml-8 space-y-1">
                    {moduleData.permissions && moduleData.permissions.length > 0 ? (
                      moduleData.permissions.map((perm) => (
                        <div key={perm.uuid} className="flex items-center">
                          <Checkbox
                            checked={moduleState.permissions[perm.uuid] || false}
                            onCheckedChange={() =>
                              togglePermission(role.uuid, module_uuid, perm.uuid)
                            }
                            className="mr-2"
                          />
                          <span>
                            <strong>{perm.action}</strong> - {perm.description}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="italic text-gray-500">Este módulo no tiene permisos.</p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="italic text-gray-500">Este rol no tiene módulos asignados.</p>
          )}

          {role.users && role.users.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold">Usuarios con este rol:</p>
              <ul className="list-disc ml-6">
                {role.users.map((user) => (
                  <li key={user.user_uuid}>
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
