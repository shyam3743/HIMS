import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ServiceForm({ departments, onSubmit, onCancel, service }) {
  const [formData, setFormData] = useState({
    service_name: '',
    service_code: '',
    category: 'Consultation',
    department: '',
    description: '',
    base_price: '',
    is_active: true,
  });

  useEffect(() => {
    if (service) {
      setFormData({
        service_name: service.service_name || '',
        service_code: service.service_code || '',
        category: service.category || 'Consultation',
        department: service.department || '',
        description: service.description || '',
        base_price: service.base_price || '',
        is_active: service.is_active !== undefined ? service.is_active : true,
      });
    }
  }, [service]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{service ? 'Edit Service' : 'Add New Service'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="service_name">Service Name *</Label>
                <Input id="service_name" value={formData.service_name} onChange={(e) => handleChange('service_name', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="service_code">Service Code</Label>
                <Input id="service_code" value={formData.service_code} onChange={(e) => handleChange('service_code', e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Consultation">Consultation</SelectItem>
                  <SelectItem value="Investigation">Investigation</SelectItem>
                  <SelectItem value="Procedure">Procedure</SelectItem>
                  <SelectItem value="Surgery">Surgery</SelectItem>
                  <SelectItem value="Room Charges">Room Charges</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="base_price">Base Price (INR) *</Label>
              <Input id="base_price" type="number" value={formData.base_price} onChange={(e) => handleChange('base_price', parseFloat(e.target.value))} required />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
                <SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger>
                <SelectContent>
                  {departments.map(dept => <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
              <Button type="submit"><Save className="w-4 h-4 mr-2" /> {service ? 'Save Changes' : 'Create Service'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}