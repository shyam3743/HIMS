
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Calendar } from "lucide-react";
import { format } from 'date-fns';

export default function AppointmentForm({ patients = [], departments = [], doctors = [], onSubmit, onCancel, appointment = null }) {
  const [formData, setFormData] = useState({
    patient_id: appointment?.patient_id || "",
    patient_name: appointment?.patient_name || "",
    doctor_name: appointment?.doctor_name || "",
    department: appointment?.department || "",
    appointment_date: appointment?.appointment_date || "",
    appointment_time: appointment?.appointment_time || "",
    appointment_type: appointment?.appointment_type || "OPD",
    status: appointment?.status || "Scheduled",
    priority: appointment?.priority || "Normal",
    notes: appointment?.notes || "",
    estimated_duration: appointment?.estimated_duration || 30
  });

  // If no departments are provided via props, use a default list
  const effectiveDepartments = departments.length > 0 ? departments : [
    "Cardiology", "Neurology", "Orthopedics", "Pediatrics", "Gynecology",
    "General Medicine", "Emergency", "Surgery", "Dermatology", "ENT", "Ophthalmology"
  ];

  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePatientSelect = (e) => {
    const selectedPatient = patients.find(p => p.mrn === e.target.value);
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
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <CardTitle>{appointment ? "Edit Appointment" : "Schedule New Appointment"}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Patient Selection */}
            <div>
              <Label htmlFor="patient">Select Patient *</Label>
              <select
                id="patient"
                value={formData.patient_id}
                onChange={handlePatientSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose a patient...</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.mrn}>
                    {patient.first_name} {patient.last_name} ({patient.mrn})
                  </option>
                ))}
              </select>
            </div>

            {/* Doctor and Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="doctor_name">Doctor Name *</Label>
                <Input
                  id="doctor_name"
                  value={formData.doctor_name}
                  onChange={(e) => handleChange("doctor_name", e.target.value)}
                  placeholder="e.g., Dr. Smith"
                  required
                />
              </div>
              <div>
                <Label htmlFor="department">Department *</Label>
                <select
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleChange("department", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Department</option>
                  {effectiveDepartments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="appointment_date">Appointment Date *</Label>
                <Input
                  id="appointment_date"
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => handleChange("appointment_date", e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <Label htmlFor="appointment_time">Time Slot *</Label>
                <select
                  id="appointment_time"
                  value={formData.appointment_time}
                  onChange={(e) => handleChange("appointment_time", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="appointment_type">Type</Label>
                <select
                  id="appointment_type"
                  value={formData.appointment_type}
                  onChange={(e) => handleChange("appointment_type", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="OPD">OPD</option>
                  <option value="IPD">IPD</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Consultation">Consultation</option>
                </select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => handleChange("priority", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Checked-in">Checked-in</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="No Show">No Show</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Additional notes or special instructions..."
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
                {appointment ? 'Update Appointment' : 'Schedule Appointment'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
