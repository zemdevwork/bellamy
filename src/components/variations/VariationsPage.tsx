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
  createAttributeValue,
  updateAttributeValue,
} from "@/server/actions/attribute-actions";
import { Edit2, Check, X, Plus, RefreshCw, Tag } from "lucide-react";
import AdminLoader from "@/components/admin/AdminLoader";

export default function VariationsPage() {
  const [attributes, setAttributes] = useState<Array<{ id: string; name: string; values: { id: string; value: string }[] }>>([]);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleRenameAttribute = async (id: string, name: string) => {
    if (!name.trim()) return;
    await updateAttribute(id, name.trim());
    await refresh();
  };

  const handleAddValue = async (attributeId: string, value: string) => {
    if (!value.trim()) return;
    await createAttributeValue(attributeId, value.trim());
    await refresh();
  };

  const handleUpdateValue = async (id: string, value: string) => {
    if (!value.trim()) return;
    await updateAttributeValue(id, value.trim());
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
          />
          <Button onClick={handleCreateAttribute} disabled={isLoading || !newAttrName.trim()}>
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
            <Card key={attr.id} className="flex h-80 flex-col">
              <CardHeader className="pb-3">
                <CardTitle>
                  <InlineEditableText
                    initialValue={attr.name}
                    onSave={(val) => handleRenameAttribute(attr.id, val)}
                    isHeader
                  />
                </CardTitle>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4 flex flex-1 flex-col">
                <div className="space-y-2 mb-3 flex-1 overflow-y-auto pr-1">
                  {attr.values.map((v) => (
                    <div key={v.id}>
                      <InlineEditableText
                        initialValue={v.value}
                        onSave={(val) => handleUpdateValue(v.id, val)}
                      />
                    </div>
                  ))}
                  {attr.values.length === 0 && (
                    <div className="text-xs text-muted-foreground">No values yet</div>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t">
                  <InlineAddValue onAdd={(val) => handleAddValue(attr.id, val)} />
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
                    <p className="text-sm font-medium text-foreground">No attributes found</p>
                    <p className="text-sm text-muted-foreground">Create your first attribute to get started.</p>
                  </div>
                  <div className="pt-2">
                    <Button onClick={handleCreateAttribute} disabled={!newAttrName.trim()}>
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

function InlineEditableText({ initialValue, onSave, isHeader }: { initialValue: string; onSave: (value: string) => void; isHeader?: boolean }) {
  const [value, setValue] = useState(initialValue);
  const [editing, setEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => setValue(initialValue), [initialValue]);
  
  return (
    <div 
      className="flex items-center justify-between w-full group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {editing ? (
        <>
          <Input value={value} onChange={(e) => setValue(e.target.value)} className="flex-1" />
          <div className="flex items-center gap-2 ml-2">
            <Button size="sm" onClick={() => { onSave(value); setEditing(false); }}>
              <Check className="h-4 w-4 mr-1" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setValue(initialValue); setEditing(false); }}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <>
          <span className={isHeader ? "font-semibold text-base" : "text-sm"}>{initialValue}</span>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setEditing(true)}
            className={`${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}
          >
            <Edit2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}

function InlineAddValue({ onAdd }: { onAdd: (value: string) => void }) {
  const [value, setValue] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  if (!isAdding) {
    return (
      <Button size="sm" variant="outline" onClick={() => setIsAdding(true)} className="w-full">
        + Add Value
      </Button>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      <Input placeholder="New value" value={value} onChange={(e) => setValue(e.target.value)} />
      <Button size="sm" onClick={() => { onAdd(value); setValue(""); setIsAdding(false); }}>Add</Button>
      <Button size="sm" variant="ghost" onClick={() => { setValue(""); setIsAdding(false); }}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}