
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Save, Scissors } from "lucide-react";
import { format } from "date-fns";

export default function OTForm({ patients = [], surgeons = [], onSubmit, onCancel, schedule = null }) {
  const [formData, setFormData] = useState({
    patient_id: schedule?.patient_id || "",
    patient_name: schedule?.patient_name || "",
    surgery_name: schedule?.surgery_name || "",
    surgery_code: schedule?.surgery_code || "",
    ot_room: schedule?.ot_room || "",
    scheduled_date: schedule?.scheduled_date ? format(new Date(schedule.scheduled_date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    scheduled_start_time: schedule?.scheduled_start_time || "",
    estimated_duration: schedule?.estimated_duration || "",
    primary_surgeon: schedule?.primary_surgeon || "",
    assisting_surgeons: schedule?.assisting_surgeons || "",
    anesthesiologist: schedule?.anesthesiologist || "",
    ot_nurse: schedule?.ot_nurse || "",
    anesthesia_type: schedule?.anesthesia_type || "",
    pre_op_requirements: schedule?.pre_op_requirements || "",
    implants_required: schedule?.implants_required || "",
    priority: schedule?.priority || "Elective",
    notes: schedule?.notes || ""
  });

  const otRooms = ["OT-1", "OT-2", "OT-3", "OT-4", "Minor OT-1", "Minor OT-2"];
  const anesthesiaTypes = ["General", "Spinal", "Local", "Regional"];
  const priorities = ["Elective", "Urgent", "Emergency"];

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      estimated_duration: parseInt(formData.estimated_duration) || 0
    };
    onSubmit(submitData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePatientSelect = (value) => {
    const selectedPatient = patients.find(p => p.mrn === value);
    if (selectedPatient) {
      setFormData(prev => ({
        ...prev,
        patient_id: selectedPatient.mrn,
        patient_name: `${selectedPatient.first_name} ${selectedPatient.last_name}`
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        patient_id: "",
        patient_name: ""
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5" />
            <CardTitle>{schedule ? "Edit Surgery Schedule" : "Schedule Surgery"}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient & Surgery Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Patient & Surgery Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patient-select">Select Patient *</Label>
                  <Select
                    value={formData.patient_id}
                    onValueChange={handlePatientSelect}
                    required
                  >
                    <SelectTrigger id="patient-select">
                      <SelectValue placeholder="Choose a patient..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Patients</SelectLabel>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.mrn}>
                            {patient.first_name} {patient.last_name} ({patient.mrn})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="surgery_name">Surgery Name *</Label>
                  <Input
                    id="surgery_name"
                    value={formData.surgery_name}
                    onChange={(e) => handleChange("surgery_name", e.target.value)}
                    placeholder="e.g., Appendectomy"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="surgery_code">Surgery Code</Label>
                  <Input
                    id="surgery_code"
                    value={formData.surgery_code}
                    onChange={(e) => handleChange("surgery_code", e.target.value)}
                    placeholder="e.g., SRG001"
                  />
                </div>
                <div>
                  <Label htmlFor="priority-select">Priority *</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleChange("priority", value)}
                  >
                    <SelectTrigger id="priority-select">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {priorities.map(priority => (
                          <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Scheduling Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Scheduling Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="ot-room-select">OT Room *</Label>
                  <Select
                    value={formData.ot_room}
                    onValueChange={(value) => handleChange("ot_room", value)}
                    required
                  >
                    <SelectTrigger id="ot-room-select">
                      <SelectValue placeholder="Select OT Room" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {otRooms.map(room => (
                          <SelectItem key={room} value={room}>{room}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="scheduled_date">Surgery Date *</Label>
                  <Input
                    id="scheduled_date"
                    type="date"
                    value={formData.scheduled_date}
                    onChange={(e) => handleChange("scheduled_date", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="scheduled_start_time">Start Time *</Label>
                  <Input
                    id="scheduled_start_time"
                    type="time"
                    value={formData.scheduled_start_time}
                    onChange={(e) => handleChange("scheduled_start_time", e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="estimated_duration">Estimated Duration (minutes)</Label>
                <Input
                  id="estimated_duration"
                  type="number"
                  value={formData.estimated_duration}
                  onChange={(e) => handleChange("estimated_duration", e.target.value)}
                  placeholder="e.g., 120"
                />
              </div>
            </div>

            {/* Medical Team */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Medical Team</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-surgeon-select">Primary Surgeon *</Label>
                  <Select
                    value={formData.primary_surgeon}
                    onValueChange={(value) => handleChange("primary_surgeon", value)}
                    required
                  >
                    <SelectTrigger id="primary-surgeon-select">
                      <SelectValue placeholder="Select Surgeon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {surgeons.map((surgeon) => (
                          <SelectItem key={surgeon.id} value={`${surgeon.first_name} ${surgeon.last_name}`}>
                            Dr. {surgeon.first_name} {surgeon.last_name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="anesthesiologist">Anesthesiologist</Label>
                  <Input
                    id="anesthesiologist"
                    value={formData.anesthesiologist}
                    onChange={(e) => handleChange("anesthesiologist", e.target.value)}
                    placeholder="Dr. Name"
                  />
                </div>
                <div>
                  <Label htmlFor="assisting_surgeons">Assisting Surgeons</Label>
                  <Input
                    id="assisting_surgeons"
                    value={formData.assisting_surgeons}
                    onChange={(e) => handleChange("assisting_surgeons", e.target.value)}
                    placeholder="Comma-separated names"
                  />
                </div>
                <div>
                  <Label htmlFor="ot_nurse">OT Nurse</Label>
                  <Input
                    id="ot_nurse"
                    value={formData.ot_nurse}
                    onChange={(e) => handleChange("ot_nurse", e.target.value)}
                    placeholder="Nurse name"
                  />
                </div>
              </div>
            </div>

            {/* Anesthesia & Requirements */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Anesthesia & Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="anesthesia-type-select">Anesthesia Type</Label>
                  <Select
                    value={formData.anesthesia_type}
                    onValueChange={(value) => handleChange("anesthesia_type", value)}
                  >
                    <SelectTrigger id="anesthesia-type-select">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {anesthesiaTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="implants_required">Implants/Equipment Required</Label>
                  <Input
                    id="implants_required"
                    value={formData.implants_required}
                    onChange={(e) => handleChange("implants_required", e.target.value)}
                    placeholder="List required implants/equipment"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label htmlFor="pre_op_requirements">Pre-operative Requirements</Label>
                <Textarea
                  id="pre_op_requirements"
                  value={formData.pre_op_requirements}
                  onChange={(e) => handleChange("pre_op_requirements", e.target.value)}
                  placeholder="Special preparations, tests, etc."
                  rows={3}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Any additional information..."
                rows={3}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-red-600 hover:bg-red-700">
                <Save className="w-4 h-4 mr-2" />
                {schedule ? "Update Schedule" : "Schedule Surgery"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
