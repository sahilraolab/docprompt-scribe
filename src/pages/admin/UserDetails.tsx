import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser, useDeleteUser, useUpdateUser } from "@/lib/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils/format";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SearchableSelect } from "@/components/SearchableSelect";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ACTION_MAP } from "@/lib/utils/permissions";

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: user, isLoading, refetch } = useUser(id!);
  const deleteUser = useDeleteUser();
  const updateUser = useUpdateUser();

  const [editableData, setEditableData] = useState({
    role: "",
    permissions: [] as { module: string; actions: string[] }[],
  });

  // Populate initial user data
  useEffect(() => {
    if (user) {
      setEditableData({
        role: user.role || "",
        permissions: user.permissions || [],
      });
    }
  }, [user]);

  // Save updated role & permissions
  const handleSaveRolePermissions = async () => {
    try {
      const userId = id as string;
      if (!userId) {
        toast.error("Invalid user ID");
        return;
      }

      // Normalize UI → backend actions
      const transformedData = {
        ...editableData,
        permissions: editableData.permissions.map((perm) => ({
          module: perm.module,
          actions: [...new Set(perm.actions.map((a) => ACTION_MAP[a] || a))],
        })),
      };

      // Perform update
      const response = await updateUser.mutateAsync({
        id: userId,
        data: transformedData,
      });

      // ✅ Handle both direct API response and axios-wrapped responses
      const result = response?.data || response;

      if (result?.success) {
        toast.success("Role & permissions updated successfully");
        setEditableData(result.data || transformedData);
        await refetch?.();
      } else {
        toast.error(result?.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update role & permissions");
    }
  };


  // Delete user
  const handleDelete = async () => {
    try {
      await deleteUser.mutateAsync(id!);
      navigate("/admin/users");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  // Loading state
  if (isLoading)
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );

  // No user found
  if (!user)
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold">User not found</h2>
        <Button onClick={() => navigate("/admin/users")} className="mt-4">
          Back to Users
        </Button>
      </div>
    );

  // Get initials for avatar
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/admin/users")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">User Details</h1>
            <p className="text-muted-foreground">
              View and manage user information
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/users/${id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the user and related data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* User Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <Avatar className="h-24 w-24 mx-auto">
              <AvatarFallback className="text-2xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-semibold">{user.name}</h3>
            <p className="text-sm text-muted-foreground">{user.role}</p>
            <Badge variant={user.active ? "default" : "secondary"}>
              {user.active ? "Active" : "Inactive"}
            </Badge>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Phone:</strong> {user.phone || "N/A"}
            </p>
            <p>
              <strong>Department:</strong> {user.department || "N/A"}
            </p>
            <p>
              <strong>Created:</strong> {formatDateTime(user.createdAt)}
            </p>
            <p>
              <strong>Updated:</strong> {formatDateTime(user.updatedAt)}
            </p>
          </CardContent>
        </Card>

        {/* Role & Permissions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Role & Permissions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Role Select */}
            <div className="space-y-2">
              <Label>Role</Label>
              <SearchableSelect
                options={[
                  { value: "Admin", label: "Admin" },
                  { value: "ProjectManager", label: "Project Manager" },
                  { value: "PurchaseOfficer", label: "Purchase Officer" },
                  { value: "SiteEngineer", label: "Site Engineer" },
                  { value: "Accountant", label: "Accountant" },
                  { value: "Approver", label: "Approver" },
                  { value: "Viewer", label: "Viewer" },
                ]}
                disabled
                value={editableData.role}
                onChange={(newRole) =>
                  setEditableData((prev) => ({ ...prev, role: newRole }))
                }
                placeholder="Select role"
              />
            </div>

            {/* Permissions Grid */}
            <div className="space-y-3">
              <Label>Permissions</Label>
              {editableData.permissions.map((perm, i) => (
                <div key={i} className="border rounded-md p-3">
                  <p className="font-semibold text-sm mb-2">{perm.module}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {["View", "Create", "Edit", "Delete", "Approve", "Config"].map(
                      (action) => {
                        const backendAction = ACTION_MAP[action] || action;
                        const isChecked = perm.actions.includes(backendAction);

                        return (
                          <div
                            key={action}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              checked={isChecked}
                              disabled
                              onCheckedChange={(checked) => {
                                const updated = [...editableData.permissions];
                                const updatedActions = checked
                                  ? [
                                    ...new Set([
                                      ...perm.actions,
                                      backendAction,
                                    ]),
                                  ]
                                  : perm.actions.filter(
                                    (a) => a !== backendAction
                                  );
                                updated[i] = {
                                  ...perm,
                                  actions: updatedActions,
                                };
                                setEditableData({
                                  ...editableData,
                                  permissions: updated,
                                });
                              }}
                            />
                            <label className="text-sm">{action}</label>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
