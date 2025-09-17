import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Clock, 
  Phone, 
  Calendar, 
  FileText, 
  FlaskConical, 
  Pill, 
  Receipt, 
  ArrowRight, 
  CheckCircle,
  Building2,
  ChevronDown,
  ChevronUp,
  Undo // New icon
} from "lucide-react";
import { format, differenceInYears } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function PreOPDPatientCard({ 
  appointment, 
  patientData, 
  departments = [], 
  showDepartmentReferral = true,
  onLabOrder, 
  onPrescription, 
  onSendToOPD, 
  onCompleteConsultation,
  onSendBackToPreOPD // New prop
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedReferralDept, setSelectedReferralDept] = useState("");

  const { patient, records, latestRecord } = patientData;

  const handleReferralSubmit = () => {
    if (selectedReferralDept && onSendToOPD) {
      onSendToOPD(appointment, selectedReferralDept);
      setSelectedReferralDept("");
    }
  };

  const getPatientAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    return differenceInYears(new Date(), new Date(dateOfBirth));
  };

  const statusColors = {
    "Pre-OPD": "bg-blue-100 text-blue-800",
    "Scheduled": "bg-green-100 text-green-800",
    "Checked-in": "bg-yellow-100 text-yellow-800",
    "In Progress": "bg-purple-100 text-purple-800",
    "Completed": "bg-gray-100 text-gray-800"
  };

  const priorityColors = {
    "Normal": "bg-gray-100 text-gray-600",
    "Urgent": "bg-orange-100 text-orange-700",
    "Critical": "bg-red-100 text-red-700"
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        {/* Patient Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{appointment.patient_name}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                <span>MRN: {patient?.mrn}</span>
                <span>Age: {getPatientAge(patient?.date_of_birth)} years</span>
                <span>Gender: {patient?.gender || 'N/A'}</span>
                {patient?.blood_group && (
                  <Badge variant="outline" className="bg-red-50 text-red-700">
                    {patient.blood_group}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{appointment.appointment_time}</span>
                <span className="text-gray-400">•</span>
                <span className="text-sm">{appointment.department}</span>
                {appointment.doctor_name && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm">Dr. {appointment.doctor_name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[appointment.status] || statusColors["Pre-OPD"]}>
              {appointment.status}
            </Badge>
            {appointment.priority !== "Normal" && (
              <Badge className={priorityColors[appointment.priority]}>
                {appointment.priority}
              </Badge>
            )}
          </div>
        </div>

        {/* Patient Details Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="mb-4 text-blue-600 hover:text-blue-700"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
          {isExpanded ? 'Hide Details' : 'Show Patient Details'}
        </Button>

        {/* Expanded Patient Information */}
        {isExpanded && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
            {patient?.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{patient.phone}</span>
              </div>
            )}
            {patient?.emergency_contact_name && (
              <div className="text-sm">
                <span className="font-medium">Emergency Contact:</span> {patient.emergency_contact_name}
                {patient.emergency_contact_phone && ` (${patient.emergency_contact_phone})`}
              </div>
            )}
            {patient?.allergies && (
              <div className="text-sm">
                <span className="font-medium text-red-600">Allergies:</span> {patient.allergies}
              </div>
            )}
            {patient?.medical_history && (
              <div className="text-sm">
                <span className="font-medium">Medical History:</span> {patient.medical_history}
              </div>
            )}
            {latestRecord && (
              <div className="text-sm">
                <span className="font-medium">Latest Record:</span> {latestRecord.chief_complaint}
                {latestRecord.diagnosis && ` - ${latestRecord.diagnosis}`}
                <span className="text-gray-500 ml-2">
                  ({format(new Date(latestRecord.created_date), 'MMM dd, yyyy')})
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onLabOrder}
            className="flex items-center justify-center gap-2 text-purple-600 border-purple-200 hover:bg-purple-50"
          >
            <FlaskConical className="w-4 h-4" />
            Lab Order
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onPrescription}
            className="flex items-center justify-center gap-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          >
            <Pill className="w-4 h-4" />
            Prescription
          </Button>
          {onSendBackToPreOPD && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSendBackToPreOPD(appointment)}
              className="flex items-center justify-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              <Undo className="w-4 h-4" />
              Send to Pre-OPD
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={() => onCompleteConsultation(appointment)}
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4" />
            Complete & Bill
          </Button>
        </div>

        {/* Department Referral */}
        {showDepartmentReferral && departments.length > 0 && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <Building2 className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <Select value={selectedReferralDept} onValueChange={setSelectedReferralDept}>
                <SelectTrigger>
                  <SelectValue placeholder="Refer to Department OPD" />
                </SelectTrigger>
                <SelectContent>
                  {departments.filter(d => d.has_opd && d.status === 'Active').map(dept => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name} OPD
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              size="sm"
              onClick={handleReferralSubmit}
              disabled={!selectedReferralDept}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowRight className="w-4 h-4 mr-1" />
              Refer
            </Button>
          </div>
        )}

        {/* Notes */}
        {appointment.notes && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div>
                <span className="text-sm font-medium text-yellow-800">Notes:</span>
                <p className="text-sm text-yellow-700 mt-1">{appointment.notes}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}