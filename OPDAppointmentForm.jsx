
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Calendar, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';

export default function OPDAppointmentForm({ patients = [], departments, doctors = [], onSubmit, onCancel, appointment = null }) {
  const [formData, setFormData] = useState({
    patient_id: appointment?.patient_id || "",
    patient_name: appointment?.patient_name || "",
    department: appointment?.department || "",
    appointment_date: appointment?.appointment_date || new Date().toISOString().split('T')[0],
    appointment_time: appointment?.appointment_time || "",
    appointment_type: appointment?.appointment_type || "OPD",
    priority: appointment?.priority || "Normal",
    notes: appointment?.notes || ""
  });

  const [searchQuery, setSearchQuery] = useState(
    appointment ? `${appointment.patient_name} (${appointment.patient_id})` : ""
  );
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);

  useEffect(() => {
    if (searchQuery.trim() && !formData.patient_id) {
      const filtered = patients.filter(patient =>
        patient.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.mrn?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPatients(filtered.slice(0, 5));
      setShowPatientDropdown(true);
    } else if (formData.patient_id && searchQuery.trim() === `${formData.patient_name} (${formData.patient_id})`) {
      // If a patient is selected and the search query matches the selected patient, hide the dropdown
      setShowPatientDropdown(false);
    }
    else {
      setShowPatientDropdown(false);
    }
  }, [searchQuery, patients, formData.patient_id, formData.patient_name]);

  // If an appointment is being edited, ensure the search query reflects the selected patient
  useEffect(() => {
    if (appointment && appointment.patient_id && formData.patient_id === appointment.patient_id) {
      setSearchQuery(`${appointment.patient_name} (${appointment.patient_id})`);
    } else if (!appointment && !formData.patient_id) {
      setSearchQuery(""); // Clear search query if no patient is selected for new form
    }
  }, [appointment, formData.patient_id, formData.patient_name]);


  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    if (field === 'patient_search_query') {
      setSearchQuery(value);
      // Clear patient_id and patient_name if the search query is changed after a patient was selected
      if (formData.patient_id && value !== `${formData.patient_name} (${formData.patient_id})`) {
        setFormData(prev => ({...prev, patient_id: '', patient_name: ''}));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handlePatientSelect = (patient) => {
    setFormData(prev => ({
      ...prev,
      patient_id: patient.mrn,
      patient_name: `${patient.first_name} ${patient.last_name}`
    }));
    setSearchQuery(`${patient.first_name} ${patient.last_name} (${patient.mrn})`);
    setShowPatientDropdown(false);
  };
  
  const timeSlots = [
    "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <CardTitle>{appointment ? "Edit OPD Appointment" : "Schedule OPD Appointment"}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Patient Search */}
            <div className="relative">
              <Label htmlFor="patient_search">Search Patient *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="patient_search"
                  value={searchQuery}
                  onChange={(e) => handleChange('patient_search_query', e.target.value)}
                  placeholder="Search by name or MRN..."
                  className="pl-9"
                  autoComplete="off"
                  required
                />
              </div>
              
              {/* Patient Dropdown */}
              {showPatientDropdown && filteredPatients.length > 0 && (
                <div className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                  {filteredPatients.map(patient => (
                    <div 
                      key={patient.mrn} // Changed key from patient.id to patient.mrn as mrn is unique and often used for patient identification
                      onClick={() => handlePatientSelect(patient)} 
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    >
                      <div className="font-medium">{patient.first_name} {patient.last_name}</div>
                      <div className="text-sm text-gray-500">MRN: {patient.mrn}</div>
                      {patient.phone && <div className="text-sm text-gray-500">Phone: {patient.phone}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Department Selection */}
            <div>
              <Label htmlFor="department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleChange("department", value)}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Departments</SelectLabel>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Appointment Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.appointment_date}
                  onChange={(e) => handleChange("appointment_date", e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div>
                <Label htmlFor="time">Time Slot *</Label>
                <Select
                  value={formData.appointment_time}
                  onValueChange={(value) => handleChange("appointment_time", value)}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Type and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="appointment_type">Type *</Label>
                <Select
                  value={formData.appointment_type}
                  onValueChange={(value) => handleChange("appointment_type", value)}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPD">OPD</SelectItem>
                    <SelectItem value="Follow-up">Follow-up</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleChange("priority", value)}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
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
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {appointment ? "Update Appointment" : "Schedule Appointment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
