import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, User, Activity } from 'lucide-react';

export default function DemographicRecordForm({ patient, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    attending_nurse: '',
    complaint: '',
    blood_pressure: '',
    heart_rate: '',
    temperature: '',
    weight: '',
    height: '',
    bmi: '',
    notes: '',
    diagnosis: ''
  });

  // Auto-calculate BMI when height or weight changes
  useEffect(() => {
    if (formData.height && formData.weight) {
      const heightInMeters = parseFloat(formData.height) / 100; // Convert cm to meters
      const weightInKg = parseFloat(formData.weight);
      
      if (heightInMeters > 0 && weightInKg > 0) {
        const bmiValue = (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
        setFormData(prev => ({ ...prev, bmi: bmiValue }));
      }
    }
  }, [formData.height, formData.weight]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.attending_nurse || !formData.complaint) {
      alert("Please fill in required fields: Attending Nurse and Complaint");
      return;
    }
    onSubmit(formData);
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return '';
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return 'Underweight';
    if (bmiValue < 25) return 'Normal weight';
    if (bmiValue < 30) return 'Overweight';
    return 'Obese';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Add Demographic Record - {patient.first_name} {patient.last_name}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Attending Nurse *</Label>
                <Input
                  value={formData.attending_nurse}
                  onChange={(e) => setFormData(prev => ({ ...prev, attending_nurse: e.target.value }))}
                  placeholder="Nurse name"
                  required
                />
              </div>
              <div>
                <Label>Patient MRN</Label>
                <Input
                  value={patient.mrn}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>

            {/* Chief Complaint */}
            <div>
              <Label>Chief Complaint *</Label>
              <Textarea
                value={formData.complaint}
                onChange={(e) => setFormData(prev => ({ ...prev, complaint: e.target.value }))}
                placeholder="Patient's primary complaint or reason for visit"
                rows={3}
                required
              />
            </div>

            {/* Vital Signs */}
            <div>
              <Label className="text-lg font-medium flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5" />
                Vital Signs
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <Label className="text-sm">Blood Pressure</Label>
                  <Input
                    value={formData.blood_pressure}
                    onChange={(e) => setFormData(prev => ({ ...prev, blood_pressure: e.target.value }))}
                    placeholder="120/80"
                  />
                </div>
                <div>
                  <Label className="text-sm">Heart Rate (bpm)</Label>
                  <Input
                    type="number"
                    value={formData.heart_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, heart_rate: e.target.value }))}
                    placeholder="72"
                  />
                </div>
                <div>
                  <Label className="text-sm">Temperature (°F)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => setFormData(prev => ({ ...prev, temperature: e.target.value }))}
                    placeholder="98.6"
                  />
                </div>
                <div>
                  <Label className="text-sm">Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="70"
                  />
                </div>
                <div>
                  <Label className="text-sm">Height (cm)</Label>
                  <Input
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                    placeholder="170"
                  />
                </div>
              </div>

              {/* BMI Display */}
              {formData.bmi && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">BMI: {formData.bmi}</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      getBMICategory(formData.bmi) === 'Normal weight' 
                        ? 'bg-green-100 text-green-800'
                        : getBMICategory(formData.bmi) === 'Underweight'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getBMICategory(formData.bmi)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Diagnosis and Notes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Initial Diagnosis</Label>
                <Textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="Initial assessment or tentative diagnosis"
                  rows={4}
                />
              </div>
              <div>
                <Label>Additional Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional observations or notes"
                  rows={4}
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                <Save className="w-4 h-4 mr-2" />
                Save Demographic Record
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}