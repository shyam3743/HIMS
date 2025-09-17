
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Bed } from "lucide-react";

export default function BedForm({ onSubmit, onCancel, bed = null }) {
  const [formData, setFormData] = useState({
    bed_number: bed?.bed_number || "",
    ward_name: bed?.ward_name || "",
    bed_type: bed?.bed_type || "General",
    floor: bed?.floor || 1,
    room_number: bed?.room_number || "",
    status: bed?.status || "Available",
    daily_rate: bed?.daily_rate || 0,
    amenities: bed?.amenities || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const wardOptions = [
    "General Ward", "ICU", "NICU", "CCU", "Emergency", "Maternity", 
    "Pediatric", "Surgical", "Private Room", "Semi-Private"
  ];

  const bedTypes = [
    "General", "ICU", "Ventilator", "Isolation", "Maternity", "Pediatric"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Bed className="w-5 h-5" />
            <CardTitle>{bed ? "Edit Bed" : "Add New Bed"}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bed_number">Bed Number *</Label>
                <Input
                  id="bed_number"
                  value={formData.bed_number}
                  onChange={(e) => handleChange("bed_number", e.target.value)}
                  placeholder="e.g., B101"
                  required
                />
              </div>
              <div>
                <Label htmlFor="room_number">Room Number</Label>
                <Input
                  id="room_number"
                  value={formData.room_number}
                  onChange={(e) => handleChange("room_number", e.target.value)}
                  placeholder="e.g., R101"
                />
              </div>
            </div>

            {/* Ward and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ward_name">Ward *</Label>
                <select
                  id="ward_name"
                  value={formData.ward_name}
                  onChange={(e) => handleChange("ward_name", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Ward</option>
                  {wardOptions.map((ward) => (
                    <option key={ward} value={ward}>{ward}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="bed_type">Bed Type *</Label>
                <select
                  id="bed_type"
                  value={formData.bed_type}
                  onChange={(e) => handleChange("bed_type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {bedTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Floor and Rate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="floor">Floor *</Label>
                <Input
                  id="floor"
                  type="number"
                  value={formData.floor}
                  onChange={(e) => handleChange("floor", parseInt(e.target.value))}
                  min="1"
                  max="20"
                  required
                />
              </div>
              <div>
                <Label htmlFor="daily_rate">Daily Rate (₹) *</Label>
                <Input
                  id="daily_rate"
                  type="number"
                  step="0.01"
                  value={formData.daily_rate}
                  onChange={(e) => handleChange("daily_rate", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Amenities */}
            <div>
              <Label htmlFor="amenities">Amenities</Label>
              <Textarea
                id="amenities"
                value={formData.amenities}
                onChange={(e) => handleChange("amenities", e.target.value)}
                placeholder="AC, TV, Private bathroom, Wi-Fi..."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {bed ? "Save Changes" : "Add Bed"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
