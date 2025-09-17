import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save, Plus, Trash2, Edit } from "lucide-react";
import { Bed } from "@/api/entities"; // Assuming 'Bed' entity can be used to infer existing types

// This is a mock implementation. In a real scenario, you'd have Ward and BedType entities.
// For now, we'll manage them in a simplified way.
const MOCK_WARDS = ["General Ward", "ICU", "NICU", "Maternity", "Surgical"];
const MOCK_BED_TYPES = ["General", "ICU", "Ventilator", "Pediatric"];

export default function WardTypeManager({ onClose }) {
  const [wards, setWards] = useState(MOCK_WARDS);
  const [bedTypes, setBedTypes] = useState(MOCK_BED_TYPES);
  const [newWard, setNewWard] = useState("");
  const [newBedType, setNewBedType] = useState("");

  const handleAddWard = () => {
    if (newWard && !wards.includes(newWard)) {
      setWards([...wards, newWard]);
      setNewWard("");
    }
  };

  const handleAddBedType = () => {
    if (newBedType && !bedTypes.includes(newBedType)) {
      setBedTypes([...bedTypes, newBedType]);
      setNewBedType("");
    }
  };

  const handleDeleteWard = (wardToDelete) => {
    setWards(wards.filter(w => w !== wardToDelete));
  };

  const handleDeleteBedType = (typeToDelete) => {
    setBedTypes(bedTypes.filter(t => t !== typeToDelete));
  };
  
  // NOTE: This is a simplified settings manager. In a production app,
  // these values would be saved to a dedicated 'Settings' entity or their own entities.

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Wards & Bed Types</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ward Management */}
          <div>
            <Label className="font-semibold">Wards</Label>
            <div className="space-y-2 mt-2">
              {wards.map(ward => (
                <div key={ward} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>{ward}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteWard(ward)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                value={newWard}
                onChange={(e) => setNewWard(e.target.value)}
                placeholder="New ward name..."
              />
              <Button onClick={handleAddWard}><Plus className="w-4 h-4 mr-2" /> Add Ward</Button>
            </div>
          </div>
          
          {/* Bed Type Management */}
          <div>
            <Label className="font-semibold">Bed Types</Label>
            <div className="space-y-2 mt-2">
              {bedTypes.map(type => (
                <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span>{type}</span>
                   <Button variant="ghost" size="icon" onClick={() => handleDeleteBedType(type)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                value={newBedType}
                onChange={(e) => setNewBedType(e.target.value)}
                placeholder="New bed type name..."
              />
              <Button onClick={handleAddBedType}><Plus className="w-4 h-4 mr-2" /> Add Type</Button>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 pt-4 border-t">
              Note: This is a simplified manager. In a real-world app, changes here would be saved permanently.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}