"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { AdminProtectedRoute } from "@/components/auth/admin-protected-route";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Plus, Trash2, ArrowLeft, Pencil } from "lucide-react";
import { GET_DEPARTMENT_PURPOSES } from "@/lib/graphql/queries";
import {
  CREATE_DEPARTMENT_PURPOSE,
  DELETE_DEPARTMENT_PURPOSE,
  UPDATE_DEPARTMENT_PURPOSE,
} from "@/lib/graphql/purpose-mutations";

interface Purpose {
  id: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

interface PurposesData {
  departmentPurposes: Purpose[];
}

interface DepartmentPurposeResponse {
  success: boolean;
  message: string;
  purpose?: Purpose | null;
}

interface CreatePurposeData {
  createDepartmentPurpose: DepartmentPurposeResponse;
}

interface UpdatePurposeData {
  updateDepartmentPurpose: DepartmentPurposeResponse;
}

interface DeletePurposeData {
  deleteDepartmentPurpose: Omit<DepartmentPurposeResponse, 'purpose'>;
}

function toGeneratedCodePreview(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
}

export default function DepartmentPurposesPage() {
  const params = useParams<{ id: string }>();
  const categoryId = params?.id;

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [editingPurposeId, setEditingPurposeId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCode, setEditCode] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [autoGenerateEditCode, setAutoGenerateEditCode] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const { data, loading, refetch } = useQuery<PurposesData>(GET_DEPARTMENT_PURPOSES, {
    skip: !categoryId,
    variables: { categoryId, isActive: null },
    fetchPolicy: "network-only",
  });

  const purposes = useMemo(() => data?.departmentPurposes ?? [], [data]);

  const [createPurpose, { loading: creating }] = useMutation<CreatePurposeData>(CREATE_DEPARTMENT_PURPOSE);
  const [updatePurpose] = useMutation<UpdatePurposeData>(UPDATE_DEPARTMENT_PURPOSE);
  const [deletePurpose, { loading: deleting }] = useMutation<DeletePurposeData>(DELETE_DEPARTMENT_PURPOSE);

  const clearMessages = () => {
    setSuccess("");
    setError("");
  };

  const toErrorMessage = (err: unknown, fallback: string): string => {
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!categoryId) {
      setError("Invalid department id");
      return;
    }

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      const { data: response } = await createPurpose({
        variables: {
          categoryId,
          name: name.trim(),
          code: code.trim() ? code.trim().toUpperCase() : undefined,
          description: description.trim(),
        },
      });

      const result = response?.createDepartmentPurpose;
      if (result?.success) {
        setSuccess(result.message);
        setName("");
        setCode("");
        setDescription("");
        await refetch();
      } else {
        setError(result?.message || "Failed to create purpose");
      }
    } catch (err: unknown) {
      setError(toErrorMessage(err, "Failed to create purpose"));
    }
  };

  const handleToggleActive = async (purpose: Purpose) => {
    clearMessages();
    try {
      const { data: response } = await updatePurpose({
        variables: { purposeId: purpose.id, isActive: !purpose.isActive },
      });
      const result = response?.updateDepartmentPurpose;
      if (result?.success) {
        setSuccess(result.message);
        await refetch();
      } else {
        setError(result?.message || "Failed to update purpose");
      }
    } catch (err: unknown) {
      setError(toErrorMessage(err, "Failed to update purpose"));
    }
  };

  const handleDelete = async (purpose: Purpose) => {
    clearMessages();
    if (!window.confirm(`Delete purpose '${purpose.name}'?`)) return;

    try {
      const { data: response } = await deletePurpose({
        variables: { purposeId: purpose.id },
      });
      const result = response?.deleteDepartmentPurpose;
      if (result?.success) {
        setSuccess(result.message);
        await refetch();
      } else {
        setError(result?.message || "Failed to delete purpose");
      }
    } catch (err: unknown) {
      setError(toErrorMessage(err, "Failed to delete purpose"));
    }
  };

  const handleStartEdit = (purpose: Purpose) => {
    clearMessages();
    setEditingPurposeId(purpose.id);
    setEditName(purpose.name);
    setEditCode(purpose.code);
    setEditDescription(purpose.description || "");
    setAutoGenerateEditCode(true);
  };

  const handleCancelEdit = () => {
    setEditingPurposeId(null);
    setEditName("");
    setEditCode("");
    setEditDescription("");
    setAutoGenerateEditCode(true);
  };

  const handleSaveEdit = async (purposeId: string) => {
    clearMessages();

    if (!editName.trim()) {
      setError("Name is required");
      return;
    }

    try {
      const variables: {
        purposeId: string;
        name: string;
        description: string;
        code?: string;
      } = {
        purposeId,
        name: editName.trim(),
        description: editDescription.trim(),
      };

      if (!autoGenerateEditCode) {
        if (!editCode.trim()) {
          setError("Code is required when auto-generation is disabled");
          return;
        }
        variables.code = editCode.trim().toUpperCase();
      }

      const { data: response } = await updatePurpose({ variables });
      const result = response?.updateDepartmentPurpose;

      if (result?.success) {
        setSuccess(result.message);
        handleCancelEdit();
        await refetch();
      } else {
        setError(result?.message || "Failed to update purpose");
      }
    } catch (err: unknown) {
      setError(toErrorMessage(err, "Failed to update purpose"));
    }
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Department Purposes</h1>
              <p className="text-muted-foreground">Manage giving purposes for this department.</p>
            </div>
            <Link href="/admin/categories">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Departments
              </Button>
            </Link>
          </div>

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Purpose
              </CardTitle>
              <CardDescription>Create a giving purpose for this department.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="purpose-name">Purpose Name</Label>
                    <Input
                      id="purpose-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Camp Meeting"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purpose-code">Purpose Code (optional)</Label>
                    <Input
                      id="purpose-code"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="Auto-generated if blank"
                    />
                    {!code.trim() && name.trim() && (
                      <p className="text-xs text-muted-foreground">
                        Preview: {toGeneratedCodePreview(name) || "PURPOSE"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose-description">Description</Label>
                  <Textarea
                    id="purpose-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional description"
                    rows={2}
                  />
                </div>

                <Button type="submit" disabled={creating}>
                  {creating ? "Saving..." : "Save Purpose"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Purposes ({purposes.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && <p className="text-muted-foreground">Loading purposes...</p>}

              {!loading && purposes.length === 0 && (
                <p className="text-muted-foreground">No purposes yet for this department.</p>
              )}

              {!loading && purposes.length > 0 && (
                <div className="space-y-2">
                  {purposes.map((purpose) => (
                    <div
                      key={purpose.id}
                      className="border rounded-md p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      {editingPurposeId === purpose.id ? (
                        <div className="w-full space-y-3">
                          <div className="grid sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label htmlFor={`edit-name-${purpose.id}`}>Name</Label>
                              <Input
                                id={`edit-name-${purpose.id}`}
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`edit-code-${purpose.id}`}>Code Override</Label>
                              <Input
                                id={`edit-code-${purpose.id}`}
                                value={editCode}
                                onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                                disabled={autoGenerateEditCode}
                                placeholder="Auto-generated if enabled"
                              />
                            </div>
                          </div>

                          <label className="flex items-center gap-2 text-sm text-muted-foreground">
                            <input
                              type="checkbox"
                              checked={autoGenerateEditCode}
                              onChange={(e) => setAutoGenerateEditCode(e.target.checked)}
                            />
                            Auto-generate code from name
                          </label>

                          {autoGenerateEditCode && (
                            <p className="text-xs text-muted-foreground">
                              Preview: {toGeneratedCodePreview(editName) || "PURPOSE"}
                            </p>
                          )}

                          <div className="space-y-1">
                            <Label htmlFor={`edit-desc-${purpose.id}`}>Description</Label>
                            <Textarea
                              id={`edit-desc-${purpose.id}`}
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              rows={2}
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium">{purpose.name}</div>
                          <div className="text-sm text-muted-foreground">{purpose.code}</div>
                          {!purpose.isActive && (
                            <div className="text-xs text-amber-600 mt-1">Inactive</div>
                          )}
                          {purpose.description && (
                            <div className="text-sm text-muted-foreground mt-1">{purpose.description}</div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        {editingPurposeId === purpose.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(purpose.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartEdit(purpose)}
                            >
                              <Pencil className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleActive(purpose)}
                            >
                              {purpose.isActive ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(purpose)}
                              disabled={deleting}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}
