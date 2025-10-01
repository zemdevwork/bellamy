"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  getAttributesWithValues,
  createAttribute,
  updateAttribute,
  createAttributeValue,
  updateAttributeValue,
} from "@/server/actions/attribute-actions";
import { Edit2, Check, X } from "lucide-react";

export default function VariationsPage() {
  const [attributes, setAttributes] = useState<Array<{ id: string; name: string; values: { id: string; value: string }[] }>>([]);
  const [newAttrName, setNewAttrName] = useState("");

  const refresh = async () => {
    const data = await getAttributesWithValues();
    setAttributes(data);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleCreateAttribute = async () => {
    if (!newAttrName.trim()) return;
    await createAttribute(newAttrName.trim());
    setNewAttrName("");
    await refresh();
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

  // Deletion disabled by request

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="New attribute name"
          value={newAttrName}
          onChange={(e) => setNewAttrName(e.target.value)}
        />
        <Button onClick={handleCreateAttribute}>Add Attribute</Button>
        <Button variant="outline" onClick={refresh}>Refresh</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {attributes.map(attr => (
          <Card key={attr.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between w-full gap-2">
                <InlineEditableText
                  initialValue={attr.name}
                  onSave={(val) => handleRenameAttribute(attr.id, val)}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {attr.values.map(v => (
                  <div key={v.id} className="flex items-center justify-between gap-2">
                    <InlineEditableText
                      initialValue={v.value}
                      onSave={(val) => handleUpdateValue(v.id, val)}
                    />
                  </div>
                ))}
              </div>
              <InlineAddValue onAdd={(val) => handleAddValue(attr.id, val)} />
            </CardContent>
          </Card>
        ))}
        {attributes.length === 0 && (
          <div className="text-sm text-muted-foreground">No attributes found.</div>
        )}
      </div>
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
          <span className={isHeader ? "font-medium" : "text-sm"}>{initialValue}</span>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setEditing(true)}
            className={`${isHovered ? 'opacity-100' : 'opacity-0'} transition-opacity`}
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
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


