
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X, Save, User, Bed } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

export default function AssignPatientForm({ beds = [], patients = [], onSubmit, onCancel }) {
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedBedId, setSelectedBedId] = useState("");
  const [admissionDate, setAdmissionDate] = useState(format(new Date(), "yyyy-MM-dd'T'HH:mm"));

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedBed = beds.find(b => b.id === selectedBedId);
    if (selectedPatientId && selectedBed && admissionDate) {
      onSubmit(selectedBed, selectedPatientId, admissionDate);
    } else {
      alert("Please select a patient, an available bed, and set an admission date.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Bed className="w-5 h-5" />
            <CardTitle>Assign Patient to Bed</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="patient">Select Patient *</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Select a patient to admit..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.first_name} {p.last_name} (MRN: {p.mrn})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bed">Select Available Bed *</Label>
              <Select value={selectedBedId} onValueChange={setSelectedBedId}>
                <SelectTrigger id="bed">
                  <SelectValue placeholder="Select an available bed..." />
                </SelectTrigger>
                <SelectContent>
                  {beds.map(b => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.bed_number} - {b.ward_name} ({b.bed_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="admission_date">Admission Date & Time *</Label>
              <input
                id="admission_date"
                type="datetime-local"
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Assign Patient
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
