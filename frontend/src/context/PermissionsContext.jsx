'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const PermissionsContext = createContext();

export const usePermissions = () => {
    return useContext(PermissionsContext);
};

export const PermissionsProvider = ({ children }) => {
    const [roles, setRoles] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);

    const defaultRoles = [
        {
            id: 1,
            name: 'Admin',
            description: 'Full access to all resources',
            permissions: {
                users: { view: true, create: true, edit: true, delete: true },
                content: { view: true, create: true, edit: true, delete: true, publish: true },
                settings: { view: true, edit: true },
                articles: { create: true },
                reminders: { create: true },
                chatbot: { edit: true }
            }
        },
        {
            id: 2,
            name: 'Editor',
            description: 'Access tailored per editor',
            permissions: {
                users: { view: false, create: false, edit: false, delete: false },
                content: { view: true, create: true, edit: true, delete: true, publish: true },
                settings: { view: true, edit: true },
                articles: { create: true },
                reminders: { create: true },
                chatbot: { edit: true }
            },
            editorOverrides: {}
        },
        {
            id: 3,
            name: 'User',
            description: 'Standard access',
            permissions: {
                users: { view: false, create: false, edit: false, delete: false },
                content: { view: true, create: false, edit: false, delete: false, publish: false },
                settings: { view: false, edit: false },
                articles: { create: false },
                reminders: { create: false },
                chatbot: { edit: false }
            }
        }
    ];

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const res = await api.get('/roles');
                if (res.data && res.data.roles && res.data.roles.length > 0) {
                    setRoles(res.data.roles);
                } else {
                    setRoles(defaultRoles);
                }
            } catch (err) {
                console.error("Failed to fetch roles from DB, using fallback", err);
                // Attempt to load from storage as a safe fallback
                const saved = localStorage.getItem('appRoles');
                if (saved) {
                    setRoles(JSON.parse(saved));
                } else {
                    setRoles(defaultRoles);
                }
            } finally {
                setIsLoaded(true);
            }
        };
        fetchRoles();
    }, []);

    const saveRolesToDb = async (newRoles) => {
        try {
            await api.post('/roles', { roles: newRoles });
        } catch (err) {
            console.error("Failed to save roles to server", err);
        }
        // Save to local auth tokens map fallback
        localStorage.setItem('appRoles', JSON.stringify(newRoles));
    };

    const _setRolesWrap = (newRolesOrFunc) => {
        setRoles(prevRoles => {
            const newR = typeof newRolesOrFunc === 'function' ? newRolesOrFunc(prevRoles) : newRolesOrFunc;
            saveRolesToDb(newR);
            return newR;
        });
    };

    const checkPermission = (roleName, group, action, editorId = null) => {
        if (!isLoaded) return false;

        const role = roles.find(r => r.name === roleName);
        if (!role) return false;

        if (roleName === 'Admin') return true;

        // If checking an Editor and we have a specific editorId, check overrides first
        if (roleName === 'Editor' && editorId && role.editorOverrides?.[editorId]) {
            const overrideAction = role.editorOverrides[editorId][group]?.[action];
            if (overrideAction !== undefined) return overrideAction;
        }

        // Fallback to base role permissions
        return role.permissions[group]?.[action] || false;
    };

    const updateRolePermissions = (roleId, updatedPermissions) => {
        _setRolesWrap(prevRoles =>
            prevRoles.map(role =>
                role.id === roleId ? { ...role, permissions: updatedPermissions } : role
            )
        );
    };

    const updateEditorOverrides = (editorId, updatedPermissions) => {
        _setRolesWrap(prevRoles =>
            prevRoles.map(role => {
                if (role.name === 'Editor') {
                    return {
                        ...role,
                        editorOverrides: {
                            ...(role.editorOverrides || {}),
                            [editorId]: updatedPermissions
                        }
                    };
                }
                return role;
            })
        );
    };

    const initializeEditorOverride = (editorId) => {
        const editorRole = roles.find(r => r.name === 'Editor');
        if (editorRole && (!editorRole.editorOverrides || !editorRole.editorOverrides[editorId])) {
            updateEditorOverrides(editorId, editorRole.permissions);
        }
    };

    return (
        <PermissionsContext.Provider value={{
            roles,
            isLoaded,
            setRoles: _setRolesWrap,
            checkPermission,
            updateRolePermissions,
            updateEditorOverrides,
            initializeEditorOverride
        }}>
            {children}
        </PermissionsContext.Provider>
    );
};
