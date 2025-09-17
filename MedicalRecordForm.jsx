
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
import { format } from "date-fns";

export default function MedicalRecordForm({ patients = [], onSubmit, onCancel, record }) {
  const [formData, setFormData] = useState({
    patient_id: '',
    visit_date: format(new Date(), "yyyy-MM-dd"),
    doctor_name: '',
    chief_complaint: '',
    diagnosis: '',
    treatment_plan: '',
    notes: '',
  });

  useEffect(() => {
    if (record) {
      setFormData({
        patient_id: patients.find(p => p.mrn === record.patient_id)?.id || '',
        visit_date: format(new Date(record.visit_date), "yyyy-MM-dd"),
        doctor_name: record.doctor_name || '',
        chief_complaint: record.chief_complaint || '',
        diagnosis: record.diagnosis || '',
        treatment_plan: record.treatment_plan || '',
        notes: record.notes || '',
      });
    }
  }, [record, patients]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const patient = patients.find(p => p.id === formData.patient_id);
    if (!patient) {
        alert("Please select a patient.");
        return;
    }
    const finalData = {
        ...formData,
        patient_id: patient.mrn,
        patient_name: `${patient.first_name} ${patient.last_name}`,
    };
    
    // If editing, preserve attachments
    if(record?.attachments) {
        finalData.attachments = record.attachments;
    }

    onSubmit(finalData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{record ? 'Edit Medical Record' : 'New Medical Record'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="patient">Patient *</Label>
              <Select value={formData.patient_id} onValueChange={(value) => handleChange('patient_id', value)} disabled={!!record}>
                <SelectTrigger><SelectValue placeholder="Select a patient..." /></SelectTrigger>
                <SelectContent>
                  {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name} (MRN: {p.mrn})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="visit_date">Visit Date *</Label>
                    <Input id="visit_date" type="date" value={formData.visit_date} onChange={(e) => handleChange('visit_date', e.target.value)} required />
                </div>
                 <div>
                    <Label htmlFor="doctor_name">Doctor Name *</Label>
                    <Input id="doctor_name" value={formData.doctor_name} onChange={(e) => handleChange('doctor_name', e.target.value)} required />
                </div>
            </div>
            <div>
              <Label htmlFor="chief_complaint">Chief Complaint *</Label>
              <Textarea id="chief_complaint" value={formData.chief_complaint} onChange={(e) => handleChange('chief_complaint', e.target.value)} required />
            </div>
             <div>
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea id="diagnosis" value={formData.diagnosis} onChange={(e) => handleChange('diagnosis', e.target.value)} />
            </div>
             <div>
              <Label htmlFor="treatment_plan">Treatment Plan</Label>
              <Textarea id="treatment_plan" value={formData.treatment_plan} onChange={(e) => handleChange('treatment_plan', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
              <Button type="submit"><Save className="w-4 h-4 mr-2" />{record ? 'Save Changes' : 'Create Record'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
