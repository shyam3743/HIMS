
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, User, Phone, Mail, Calendar, MapPin, AlertTriangle, Edit, Trash2 } from 'lucide-react';
import { differenceInYears, format } from 'date-fns';

// Safe age calculation
const getAge = (dob) => {
  if (!dob) return "N/A";
  try {
    const age = differenceInYears(new Date(), new Date(dob));
    return isNaN(age) ? "N/A" : age;
  } catch (error) {
    return "N/A";
  }
};

// Safe date formatting
const safeFormat = (dateString, formatStr) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    return format(date, formatStr);
  } catch (error) {
    return "Invalid Date";
  }
};

export default function PatientDetails({ patient, onClose, onEdit, onDelete }) {
  if (!patient) {
    return null;
  }

  const statusColors = {
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    deceased: "bg-red-100 text-red-800"
  };

  const handleEdit = () => {
    onClose();
    onEdit(patient);
  };

  const handleDelete = () => {
    onClose();
    onDelete(patient);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">{patient.first_name} {patient.last_name}</CardTitle>
              <code className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{patient.mrn}</code>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6 flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium text-gray-800">{getAge(patient.date_of_birth)} years old</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-50 text-red-700">{patient.blood_group || 'N/A'}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{patient.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">{patient.email || 'No email provided'}</span>
            </div>
            <div className="col-span-1 md:col-span-2 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-1" />
              <span className="text-gray-700">{patient.address || 'No address provided'}</span>
            </div>
            <div className="col-span-1 md:col-span-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">Registered on: {safeFormat(patient.created_date, "PPpp")}</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Emergency Contact</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span>{patient.emergency_contact_name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>{patient.emergency_contact_phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-2">Insurance Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Provider: {patient.insurance_provider || 'N/A'}</div>
              <div>Policy #: {patient.insurance_number || 'N/A'}</div>
            </div>
          </div>

          {patient.allergies && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500" /> Allergies</h4>
              <p className="text-sm text-gray-700">{patient.allergies}</p>
            </div>
          )}

          {patient.medical_history && (
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Medical History</h4>
              <p className="text-sm text-gray-700">{patient.medical_history}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="secondary" onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
