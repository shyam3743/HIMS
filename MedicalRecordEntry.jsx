import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Save, Plus, Minus } from 'lucide-react';

export default function MedicalRecordEntry({ patient, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    entry_type: '',
    department: '',
    doctor_name: '',
    chief_complaint: '',
    vital_signs: {
      blood_pressure: '',
      heart_rate: '',
      temperature: '',
      weight: '',
      height: ''
    },
    diagnosis: '',
    icd_code: '',
    treatment_plan: '',
    prescriptions: [],
    notes: '',
    follow_up_date: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addPrescription = () => {
    setFormData(prev => ({
      ...prev,
      prescriptions: [...prev.prescriptions, {
        medication: '',
        dosage: '',
        frequency: '',
        duration: ''
      }]
    }));
  };

  const removePrescription = (index) => {
    setFormData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index)
    }));
  };

  const updatePrescription = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.map((rx, i) => 
        i === index ? { ...rx, [field]: value } : rx
      )
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add Medical Entry - {patient.patient_name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Entry Type & Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Entry Type *</Label>
                <Select value={formData.entry_type} onValueChange={(value) => setFormData(prev => ({ ...prev, entry_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select entry type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPD Visit">OPD Visit</SelectItem>
                    <SelectItem value="IPD Admission">IPD Admission</SelectItem>
                    <SelectItem value="Lab Order">Lab Order</SelectItem>
                    <SelectItem value="Lab Result">Lab Result</SelectItem>
                    <SelectItem value="Prescription">Prescription</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department</Label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Department name"
                />
              </div>
              <div>
                <Label>Doctor Name</Label>
                <Input
                  value={formData.doctor_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, doctor_name: e.target.value }))}
                  placeholder="Attending physician"
                />
              </div>
              <div>
                <Label>Follow-up Date</Label>
                <Input
                  type="date"
                  value={formData.follow_up_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, follow_up_date: e.target.value }))}
                />
              </div>
            </div>

            {/* Chief Complaint */}
            <div>
              <Label>Chief Complaint</Label>
              <Textarea
                value={formData.chief_complaint}
                onChange={(e) => setFormData(prev => ({ ...prev, chief_complaint: e.target.value }))}
                placeholder="Primary reason for visit"
                rows={2}
              />
            </div>

            {/* Vital Signs */}
            <div>
              <Label className="text-base font-medium">Vital Signs</Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                <div>
                  <Label className="text-sm">Blood Pressure</Label>
                  <Input
                    value={formData.vital_signs.blood_pressure}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      vital_signs: { ...prev.vital_signs, blood_pressure: e.target.value }
                    }))}
                    placeholder="120/80"
                  />
                </div>
                <div>
                  <Label className="text-sm">Heart Rate</Label>
                  <Input
                    type="number"
                    value={formData.vital_signs.heart_rate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      vital_signs: { ...prev.vital_signs, heart_rate: e.target.value }
                    }))}
                    placeholder="72"
                  />
                </div>
                <div>
                  <Label className="text-sm">Temperature (°F)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.vital_signs.temperature}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      vital_signs: { ...prev.vital_signs, temperature: e.target.value }
                    }))}
                    placeholder="98.6"
                  />
                </div>
                <div>
                  <Label className="text-sm">Weight (kg)</Label>
                  <Input
                    type="number"
                    value={formData.vital_signs.weight}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      vital_signs: { ...prev.vital_signs, weight: e.target.value }
                    }))}
                    placeholder="70"
                  />
                </div>
                <div>
                  <Label className="text-sm">Height (cm)</Label>
                  <Input
                    type="number"
                    value={formData.vital_signs.height}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      vital_signs: { ...prev.vital_signs, height: e.target.value }
                    }))}
                    placeholder="170"
                  />
                </div>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Diagnosis</Label>
                <Textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="Primary diagnosis"
                  rows={2}
                />
              </div>
              <div>
                <Label>ICD-10 Code</Label>
                <Input
                  value={formData.icd_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, icd_code: e.target.value }))}
                  placeholder="ICD-10 code"
                />
              </div>
            </div>

            {/* Treatment Plan */}
            <div>
              <Label>Treatment Plan</Label>
              <Textarea
                value={formData.treatment_plan}
                onChange={(e) => setFormData(prev => ({ ...prev, treatment_plan: e.target.value }))}
                placeholder="Recommended treatment and interventions"
                rows={3}
              />
            </div>

            {/* Prescriptions */}
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Prescriptions</Label>
                <Button type="button" onClick={addPrescription} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medication
                </Button>
              </div>
              {formData.prescriptions.map((prescription, index) => (
                <div key={index} className="border rounded-lg p-4 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm">Medication {index + 1}</Label>
                    <Button 
                      type="button" 
                      onClick={() => removePrescription(index)}
                      variant="ghost" 
                      size="sm"
                      className="text-red-600"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Input
                      placeholder="Medication name"
                      value={prescription.medication}
                      onChange={(e) => updatePrescription(index, 'medication', e.target.value)}
                    />
                    <Input
                      placeholder="Dosage"
                      value={prescription.dosage}
                      onChange={(e) => updatePrescription(index, 'dosage', e.target.value)}
                    />
                    <Input
                      placeholder="Frequency"
                      value={prescription.frequency}
                      onChange={(e) => updatePrescription(index, 'frequency', e.target.value)}
                    />
                    <Input
                      placeholder="Duration"
                      value={prescription.duration}
                      onChange={(e) => updatePrescription(index, 'duration', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div>
              <Label>Additional Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional clinical notes"
                rows={3}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Save Entry
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}