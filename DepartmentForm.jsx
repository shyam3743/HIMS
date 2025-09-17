import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X, Save, Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DepartmentForm({ employees, onSubmit, onCancel, department = null }) {
  const [formData, setFormData] = useState({
    name: department?.name || "",
    code: department?.code || "",
    description: department?.description || "",
    head_doctor_id: department?.head_doctor_id || "",
    head_doctor_name: department?.head_doctor_name || "",
    specialty: department?.specialty || "",
    phone: department?.phone || "",
    email: department?.email || "",
    location: department?.location || "",
    has_opd: department?.has_opd || false,
    opd_timings: department?.opd_timings || "9:00 AM - 5:00 PM",
    opd_days: department?.opd_days || "Monday to Friday",
    status: department?.status || "Active"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDoctorSelect = (doctorId) => {
    const selectedDoctor = employees.find(emp => emp.id === doctorId);
    if (selectedDoctor) {
      setFormData(prev => ({
        ...prev,
        head_doctor_id: doctorId,
        head_doctor_name: `${selectedDoctor.first_name} ${selectedDoctor.last_name}`
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            <CardTitle>{department ? "Edit Department" : "Add Department"}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Department Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g., Cardiology"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="code">Department Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => handleChange("code", e.target.value.toUpperCase())}
                    placeholder="e.g., CARD"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Department description..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialty">Specialty</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => handleChange("specialty", e.target.value)}
                    placeholder="e.g., Cardiovascular Medicine"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="e.g., 2nd Floor, Block A"
                  />
                </div>
              </div>
            </div>

            {/* Head of Department */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Head of Department</h3>
              
              <div>
                <Label htmlFor="head_doctor">Select Head Doctor</Label>
                <Select 
                  value={formData.head_doctor_id} 
                  onValueChange={handleDoctorSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select head doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(doctor => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialization || 'General'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* OPD Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">OPD Configuration</h3>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base font-medium">Enable OPD for this Department</Label>
                  <p className="text-sm text-gray-500 mt-1">
                    This will create a dedicated OPD section for this department in the navigation
                  </p>
                </div>
                <Switch
                  checked={formData.has_opd}
                  onCheckedChange={(checked) => handleChange("has_opd", checked)}
                />
              </div>

              {formData.has_opd && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <Label htmlFor="opd_timings">OPD Timings</Label>
                    <Input
                      id="opd_timings"
                      value={formData.opd_timings}
                      onChange={(e) => handleChange("opd_timings", e.target.value)}
                      placeholder="e.g., 9:00 AM - 5:00 PM"
                    />
                  </div>
                  <div>
                    <Label htmlFor="opd_days">OPD Days</Label>
                    <Input
                      id="opd_days"
                      value={formData.opd_days}
                      onChange={(e) => handleChange("opd_days", e.target.value)}
                      placeholder="e.g., Monday to Friday"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Contact Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="Department contact number"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="Department email"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                {department ? "Update Department" : "Create Department"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}