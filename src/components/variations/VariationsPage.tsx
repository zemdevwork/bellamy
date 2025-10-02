"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  getAttributesWithValues,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  deleteAttributeValue,
  createAttributeValue,
  updateAttributeValue,
} from "@/server/actions/attribute-actions";
import { Edit2, Check, X, Plus, RefreshCw, Tag } from "lucide-react";
import AdminLoader from "@/components/admin/AdminLoader";
import { toast } from "sonner";
import DeleteDialog from "./delete-attribute-dialogue";

export default function VariationsPage() {
  const [attributes, setAttributes] = useState<
    Array<{ id: string; name: string; values: { id: string; value: string }[] }>
  >([]);
  const [newAttrName, setNewAttrName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const data = await getAttributesWithValues();
      setAttributes(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreateAttribute = async () => {
    if (!newAttrName.trim()) return;
    setIsLoading(true);
    try {
      await createAttribute(newAttrName.trim());
      setNewAttrName("");
      await refresh();
      toast.success("Attribute created successfully");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameAttribute = async (id: string, name: string) => {
    if (!name.trim()) return;
    await updateAttribute(id, name.trim());
    await refresh();
    toast.success("Attribute updated successfully");
  };

  const handleDeleteAttribute = async (id: string) => {
    await deleteAttribute(id);
    await refresh();
  };

  const handleAddValue = async (attributeId: string, value: string) => {
    if (!value.trim()) return;
    await createAttributeValue(attributeId, value.trim());
    await refresh();
    toast.success("Value added successfully");
  };

  const handleUpdateValue = async (id: string, value: string) => {
    if (!value.trim()) return;
    await updateAttributeValue(id, value.trim());
    await refresh();
    toast.success("Value updated successfully");
  };

  const handleDeleteValue = async (id: string) => {
    await deleteAttributeValue(id);
    await refresh();
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 min-w-64 flex-1 md:flex-none">
          <Input
            placeholder="Create new attribute"
            value={newAttrName}
            onChange={(e) => setNewAttrName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newAttrName.trim()) {
                handleCreateAttribute();
              }
            }}
          />
          <Button
            onClick={handleCreateAttribute}
            className="cursor-pointer"
            disabled={isLoading || !newAttrName.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add attribute
          </Button>
        </div>
        <Button variant="outline" onClick={refresh} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <AdminLoader label="Loading attributes" />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {attributes.map((attr) => (
            <Card key={attr.id} className="flex h-lg overflow-y-auto flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="cursor-pointer hover:bg-accent px-2 rounded-md">
                  <InlineEditableText
                    initialValue={attr.name}
                    onSave={(val) => handleRenameAttribute(attr.id, val)}
                    isHeader
                    deleteDialog={
                      <DeleteDialog
                        itemName={attr.name}
                        itemType="attribute"
                        onDelete={() => handleDeleteAttribute(attr.id)}
                        warningMessage={
                          attr.values.length > 0
                            ? `This will also delete ${attr.values.length} associated ${
                                attr.values.length === 1 ? "value" : "values"
                              }.`
                            : undefined
                        }
                        showOnHover
                      />
                    }
                  />
                </CardTitle>
              </CardHeader>
              <div className="w-full px-3">
                <Separator orientation="horizontal" />
              </div>
              <CardContent className="pt-4 flex flex-1 flex-col">
                <div className="space-y-2 mb-3 flex-1 overflow-y-auto pr-1">
                  {attr.values.map((v) => (
                    <div
                      className="hover:bg-accent px-2 rounded-md cursor-pointer"
                      key={v.id}
                    >
                      <InlineEditableText
                        initialValue={v.value}
                        onSave={(val) => handleUpdateValue(v.id, val)}
                        deleteDialog={
                          <DeleteDialog
                            itemName={v.value}
                            itemType="attribute value"
                            onDelete={() => handleDeleteValue(v.id)}
                            showOnHover
                          />
                        }
                      />
                    </div>
                  ))}
                  {attr.values.length === 0 && (
                    <div className="text-xs text-muted-foreground">
                      No values yet
                    </div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t">
                  <InlineAddValue
                    onAdd={(val) => handleAddValue(attr.id, val)}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          {attributes.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="py-10">
                <div className="flex flex-col items-center justify-center text-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Tag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      No attributes found
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Create your first attribute to get started.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Button
                      onClick={handleCreateAttribute}
                      disabled={!newAttrName.trim()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add attribute
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function InlineEditableText({
  initialValue,
  onSave,
  deleteDialog,
  isHeader,
}: {
  initialValue: string;
  onSave: (value: string) => void;
  deleteDialog?: React.ReactNode;
  isHeader?: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const [editing, setEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => setValue(initialValue), [initialValue]);

  const handleSave = () => {
    if (value.trim() && value !== initialValue) {
      onSave(value.trim());
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setValue(initialValue);
    setEditing(false);
  };

  return (
    <div
      className="flex items-center justify-between w-full group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {editing ? (
        <>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSave();
              } else if (e.key === "Escape") {
                handleCancel();
              }
            }}
            className="flex-1"
            autoFocus
          />
          <div className="flex items-center gap-2 ml-2">
            <Button size="sm" onClick={handleSave}>
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <span className={isHeader ? "font-semibold text-base" : "text-sm"}>
            {initialValue}
          </span>
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditing(true)}
              className={`${
                isHovered ? "opacity-100 cursor-pointer" : "opacity-0"
              } transition-opacity`}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            {deleteDialog && (
              <div
                className={`${
                  isHovered ? "opacity-100" : "opacity-0"
                } transition-opacity`}
              >
                {deleteDialog}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function InlineAddValue({ onAdd }: { onAdd: (value: string) => void }) {
  const [value, setValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (value.trim()) {
      onAdd(value.trim());
      setValue("");
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setValue("");
    setIsAdding(false);
  };

  if (!isAdding) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setIsAdding(true)}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Value
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="New value"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleAdd();
          } else if (e.key === "Escape") {
            handleCancel();
          }
        }}
        autoFocus
      />
      <Button size="sm" onClick={handleAdd} disabled={!value.trim()}>
        <Check className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" onClick={handleCancel}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}