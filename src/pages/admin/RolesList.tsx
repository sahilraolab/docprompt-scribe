import { useState } from 'react';
import { useRoles, useCreateRole, useAssignPermissions } from '@/lib/hooks/useAdminModule';
import {
    ROLE_SUGGESTIONS,
    formatRoleName,
    getUserTypes,
    PERMISSION_MODULES
} from '@/lib/constants/adminConstants';
import { ROLE_PERMISSION_DEFAULTS } from '@/lib/constants/permissionDefaults';
import type { UserType, SystemPermission } from '@/types/admin';
import type { BackendRole, BackendPermission } from '@/types/auth';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Plus,
    Search,
    Shield,
    Loader2,
    Edit,
    Key,
    CheckCircle2,
    Users,
    Settings,
    Ruler,
    ShoppingCart,
    FileText,
    Building,
    Calculator,
    GitBranch,
} from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { SYSTEM_PERMISSIONS } from '@/lib/constants/systemPermissions';


// Validation schema
const createRoleSchema = z.object({
    name: z.string().min(1, 'Role name is required').max(50, 'Role name must be less than 50 characters'),
});

// Icon mapping for modules
const ModuleIcons: Record<string, any> = {
    ADMIN: Shield,
    ENGINEERING: Ruler,
    PURCHASE: ShoppingCart,
    CONTRACTS: FileText,
    SITE: Building,
    ACCOUNTS: Calculator,
    WORKFLOW: GitBranch,
};

// Group permissions by module - defined before use
const getGroupedPermissions = (permissions: SystemPermission[] = []) => {
    const grouped: Record<string, SystemPermission[]> = {};
    permissions.forEach(p => {
        const module = p.module || 'OTHER';
        if (!grouped[module]) grouped[module] = [];
        grouped[module].push(p);
    });
    return grouped;
};

export default function RolesList() {
    const { data: roles = [], isLoading } = useRoles();
    const createRole = useCreateRole();
    const assignPermissions = useAssignPermissions();

    const [search, setSearch] = useState('');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
    const [selectedRole, setSelectedRole] = useState<BackendRole | null>(null);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    // Create role form state
    const [userType, setUserType] = useState<UserType | ''>('');
    const [roleName, setRoleName] = useState('');
    const [customRole, setCustomRole] = useState(false);
    const [error, setError] = useState('');

    const assignedKeys = selectedRole?.permissions?.map(p => p.key) || [];
    const groupedPermissions = getGroupedPermissions(SYSTEM_PERMISSIONS);

    // Filter roles
    const filteredRoles = roles.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
    );

    const resolvePermissions = (allPermissions: SystemPermission[], selected: string[]) => {
        if (selected.includes('*')) {
            return allPermissions.map(p => p.key);
        }
        return selected;
    };

    // Get role suggestions based on user type
    const getSuggestions = () => {
        if (!userType) return [];
        return ROLE_SUGGESTIONS.find(r => r.userType === userType)?.suggestions || [];
    };

    // Open create dialog
    const openCreateDialog = () => {
        setUserType('');
        setRoleName('');
        setCustomRole(false);
        setError('');
        setShowCreateDialog(true);
    };

    // Open permissions dialog
    const openPermissionsDialog = (role: BackendRole) => {
        setSelectedRole(role);

        // If role already has permissions → use them
        if (role.permissions && role.permissions.length > 0) {
            setSelectedPermissions(role.permissions.map(p => p.key));
        } else {
            // Apply frontend defaults
            const defaults = ROLE_PERMISSION_DEFAULTS[role.name] || [];

            setSelectedPermissions(defaults);
        }

        setShowPermissionsDialog(true);
    };

    // Handle create role
    const handleCreateRole = async () => {
        const roleKey = roleName.toUpperCase().replace(/\s+/g, '_');

        setIsSaving(true);
        try {
            const createdRole = await createRole.mutateAsync({ name: roleKey });

            // ✅ AUTO ASSIGN ONLY IF DEFAULT EXISTS
            const defaults = ROLE_PERMISSION_DEFAULTS[roleKey];
            if (defaults?.length) {
                await assignPermissions.mutateAsync({
                    roleId: createdRole.id,
                    permissions: defaults,
                });
            }

            setShowCreateDialog(false);
        } finally {
            setIsSaving(false);
        }
    };

    // Handle save permissions
    const handleSavePermissions = async () => {
        if (!selectedRole) return;

        setIsSaving(true);
        try {
            await assignPermissions.mutateAsync({
                roleId: selectedRole.id,
                permissions: selectedPermissions,
            });
            setShowPermissionsDialog(false);
        } catch (error: any) {
            toast.error(error?.message || 'Failed to assign permissions');
        } finally {
            setIsSaving(false);
        }
    };

    // Toggle permission
    const togglePermission = (key: string) => {
        setSelectedPermissions(prev =>
            prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
        );
    };

    // Toggle all permissions in a module
    const toggleModulePermissions = (permissions: SystemPermission[]) => {
        const keys = permissions.map(p => p.key);
        const allSelected = keys.every(k => selectedPermissions.includes(k));

        if (allSelected) {
            setSelectedPermissions(prev => prev.filter(p => !keys.includes(p)));
        } else {
            setSelectedPermissions(prev => [...new Set([...prev, ...keys])]);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage roles and configure access permissions
                    </p>
                </div>
                <Button onClick={openCreateDialog} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Role
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Roles</p>
                                <p className="text-2xl font-bold">{roles.length}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Roles with Permissions</p>
                                <p className="text-2xl font-bold text-success">
                                    {roles.filter(r => r.permissions && r.permissions.length > 0).length}
                                </p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                                <Key className="h-6 w-6 text-success" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Table */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <CardTitle className="text-lg">All Roles</CardTitle>
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search roles..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {filteredRoles.length > 0 ? (
                        <div className="rounded-lg border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="font-semibold">Role Name</TableHead>
                                        <TableHead className="font-semibold">Description</TableHead>
                                        <TableHead className="font-semibold">Permissions</TableHead>
                                        <TableHead className="font-semibold text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody>
                                    {filteredRoles.map((role, index) => (
                                        <TableRow
                                            key={role.id}
                                            className="hover:bg-muted/30 transition-colors"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                        <Shield className="h-5 w-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{formatRoleName(role.name)}</p>
                                                        <p className="text-xs text-muted-foreground font-mono">{role.name}</p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <span className="text-muted-foreground">
                                                    {role.description || '—'}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="gap-1">
                                                        <Key className="h-3 w-3" />
                                                        {role.permissions?.length || 0} permissions
                                                    </Badge>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openPermissionsDialog(role)}
                                                    className="gap-1"
                                                >
                                                    <Settings className="h-4 w-4" />
                                                    Manage Permissions
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="rounded-full bg-muted p-6 mb-4">
                                <Shield className="h-12 w-12 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No roles found</h3>
                            <p className="text-muted-foreground mb-6 max-w-md">
                                {search ? 'No roles match your search' : 'Get started by creating your first role'}
                            </p>
                            {!search && (
                                <Button onClick={openCreateDialog}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Role
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Role Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            Create New Role
                        </DialogTitle>
                        <DialogDescription>
                            Select a user type to see suggested role names, or create a custom role
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* User Type Selection */}
                        <div className="space-y-2">
                            <Label>User Type</Label>
                            <Select
                                value={userType}
                                onValueChange={(value) => {
                                    setUserType(value as UserType);
                                    setRoleName('');
                                    setCustomRole(false);
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select user type for suggestions" />
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                    {getUserTypes().map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Selecting a user type will show suggested role names to reduce typos
                            </p>
                        </div>

                        {/* Role Name Selection/Input */}
                        {userType && (
                            <div className="space-y-2">
                                <Label>Role Name *</Label>
                                {!customRole ? (
                                    <div className="space-y-2">
                                        <Select
                                            value={roleName}
                                            onValueChange={setRoleName}
                                        >
                                            <SelectTrigger className={error ? 'border-destructive' : ''}>
                                                <SelectValue placeholder="Select a suggested role" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover z-50">
                                                {getSuggestions().map((suggestion) => (
                                                    <SelectItem key={suggestion} value={suggestion}>
                                                        {formatRoleName(suggestion)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant="link"
                                            size="sm"
                                            onClick={() => setCustomRole(true)}
                                            className="p-0 h-auto text-primary"
                                        >
                                            Or enter a custom role name
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <Input
                                            placeholder="Enter custom role name"
                                            value={roleName}
                                            onChange={(e) => setRoleName(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                                            className={error ? 'border-destructive' : ''}
                                        />
                                        <Button
                                            type="button"
                                            variant="link"
                                            size="sm"
                                            onClick={() => {
                                                setCustomRole(false);
                                                setRoleName('');
                                            }}
                                            className="p-0 h-auto text-primary"
                                        >
                                            Use suggested roles instead
                                        </Button>
                                    </div>
                                )}
                                {error && <p className="text-sm text-destructive">{error}</p>}
                            </div>
                        )}

                        {/* Preview */}
                        {roleName && (
                            <div className="rounded-lg border bg-muted/50 p-4">
                                <p className="text-sm text-muted-foreground mb-1">Role will be created as:</p>
                                <div className="flex items-center gap-2">
                                    <Badge className="font-mono">{roleName}</Badge>
                                    <span className="text-sm text-muted-foreground">→</span>
                                    <span className="font-medium">{formatRoleName(roleName)}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateRole} disabled={isSaving || !roleName}>
                            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Create Role
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Permissions Dialog */}
            <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            Manage Permissions - {selectedRole && formatRoleName(selectedRole.name)}
                        </DialogTitle>
                        <DialogDescription>
                            Select which permissions this role should have access to
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto py-4">
                        <Accordion type="multiple" className="w-full">
                            {Object.entries(getGroupedPermissions(selectedRole.permissions)).map(([module, permissions]) => {
                                // const allSelected = permissions.every(p => selectedPermissions.includes(p.key));
                                const resolvedSelected = resolvePermissions(
                                    selectedRole?.permissions || [],
                                    selectedPermissions
                                );

                                const allSelected = permissions.every(p =>
                                    resolvedSelected.includes(p.key)
                                );

                                const someSelected = permissions.some(p => selectedPermissions.includes(p.key));
                                const Icon = ModuleIcons[module] || Settings;

                                return (
                                    <AccordionItem key={module} value={module}>
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${allSelected ? 'bg-success/10 text-success' :
                                                    someSelected ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
                                                    }`}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-medium">{module.replace(/_/g, ' ')}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {permissions.filter(p => selectedPermissions.includes(p.key)).length} / {permissions.length} selected
                                                    </p>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-2 pt-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => toggleModulePermissions(permissions)}
                                                    className="mb-2"
                                                >
                                                    {allSelected ? 'Deselect All' : 'Select All'}
                                                </Button>
                                                <div className="grid gap-2">
                                                    {permissions.map(permission => (
                                                        <div
                                                            key={permission.key}
                                                            className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                                                        >
                                                            <Checkbox
                                                                id={permission.key}
                                                                checked={selectedPermissions.includes(permission.key)}
                                                                onCheckedChange={() => togglePermission(permission.key)}
                                                            />
                                                            <div className="flex-1">
                                                                <Label
                                                                    htmlFor={permission.key}
                                                                    className="font-medium cursor-pointer"
                                                                >
                                                                    {permission.action?.replace(/_/g, ' ') || permission.key}
                                                                </Label>
                                                                {permission.description && (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {permission.description}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                                                {permission.key}
                                                            </code>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                );
                            })}
                        </Accordion>
                    </div>

                    <Accordion type="multiple">
                        {Object.entries(groupedPermissions).map(([module, permissions]) => {
                            const allSelected = permissions.every(p =>
                                assignedKeys.includes(p.key)
                            );

                            return (
                                <AccordionItem key={module} value={module}>
                                    <AccordionTrigger>{module}</AccordionTrigger>
                                    <AccordionContent>
                                        {permissions.map(permission => (
                                            <div key={permission.key} className="flex items-center gap-3">
                                                <Checkbox
                                                    checked={selectedPermissions.includes(permission.key)}
                                                    onCheckedChange={() => togglePermission(permission.key)}
                                                />
                                                <span>{permission.action}</span>
                                                <code>{permission.key}</code>
                                            </div>
                                        ))}
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>


                    <DialogFooter className="border-t pt-4">
                        <div className="flex items-center gap-2 mr-auto">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                            <span className="text-sm text-muted-foreground">
                                {selectedPermissions.length} permissions selected
                            </span>
                        </div>
                        <Button variant="outline" onClick={() => setShowPermissionsDialog(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSavePermissions} disabled={isSaving}>
                            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Save Permissions
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
