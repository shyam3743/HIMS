
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, FileText, MapPin } from "lucide-react";

const getAge = (dob) => {
  if (!dob) return 'N/A';
  try {
    const birthDate = new Date(dob);
    // Check if birthDate is a valid date object after parsing
    if (isNaN(birthDate.getTime())) {
      return 'N/A';
    }
    return new Date().getFullYear() - birthDate.getFullYear();
  } catch (e) {
    return 'N/A';
  }
}

export default function IPDDoctorNoteForm({ patient, bed, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    doctor_name: "",
    chief_complaint: "",
    diagnosis: "",
    treatment_plan: "",
    notes: "",
    follow_up_date: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            <CardTitle>Add Doctor's Note - IPD</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* Patient & Bed Info */}
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  {patient?.first_name?.charAt(0)}{patient?.last_name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold">{patient?.first_name} {patient?.last_name}</h3>
                  <p className="text-sm text-gray-600">MRN: {patient?.mrn} | Age: {getAge(patient?.date_of_birth)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <div className="text-right">
                  <div className="font-medium">Bed {bed?.bed_number}</div>
                  <div className="text-sm text-gray-600">{bed?.ward_name}</div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="doctor_name">Doctor Name</Label>
              <Input
                id="doctor_name"
                value={formData.doctor_name}
                onChange={(e) => handleChange("doctor_name", e.target.value)}
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <Label htmlFor="chief_complaint">Current Complaint/Condition</Label>
              <Textarea
                id="chief_complaint"
                value={formData.chief_complaint}
                onChange={(e) => handleChange("chief_complaint", e.target.value)}
                placeholder="Patient's current condition or complaint..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="diagnosis">Assessment/Diagnosis</Label>
              <Textarea
                id="diagnosis"
                value={formData.diagnosis}
                onChange={(e) => handleChange("diagnosis", e.target.value)}
                placeholder="Current diagnosis or medical assessment..."
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="treatment_plan">Treatment Plan</Label>
              <Textarea
                id="treatment_plan"
                value={formData.treatment_plan}
                onChange={(e) => handleChange("treatment_plan", e.target.value)}
                placeholder="Treatment plan, medications, procedures..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Additional clinical notes, observations, instructions for nursing staff..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="follow_up_date">Follow-up Date (Optional)</Label>
              <Input
                id="follow_up_date"
                type="date"
                value={formData.follow_up_date}
                onChange={(e) => handleChange("follow_up_date", e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Add Note to Records
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
