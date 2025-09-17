import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, Calendar, MapPin, Phone, Mail, Heart, Activity, 
  FileText, FlaskConical, Pill, Building2, Download, Eye, Clock,
  Stethoscope, AlertTriangle, TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

// Safe date formatting function
const safeFormatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, 'MMM dd, yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

// Safe date time formatting function
const safeFormatDateTime = (dateString, timeString) => {
  if (!dateString) return 'N/A';
  try {
    const dateTimeString = timeString ? `${dateString} ${timeString}` : dateString;
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, 'MMM dd, yyyy HH:mm');
  } catch (error) {
    return 'Invalid date';
  }
};

const EntryTypeIcon = ({ type }) => {
  switch(type) {
    case 'Demographics': return <User className="w-4 h-4" />;
    case 'OPD Visit': return <Stethoscope className="w-4 h-4" />;
    case 'IPD Admission': return <Building2 className="w-4 h-4" />;
    case 'Lab Order': return <FlaskConical className="w-4 h-4" />;
    case 'Lab Result': return <Activity className="w-4 h-4" />;
    case 'Prescription': return <Pill className="w-4 h-4" />;
    case 'Emergency': return <AlertTriangle className="w-4 h-4" />;
    case 'Nursing Note': return <FileText className="w-4 h-4 text-blue-500" />;
    case 'Patient Charge': return <Pill className="w-4 h-4 text-orange-500"/>;
    case 'Discharge': return <Building2 className="w-4 h-4 text-green-500" />;
    case 'Billing': return <TrendingUp className="w-4 h-4 text-green-500" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

const getEntryTypeColor = (type) => {
  switch(type) {
    case 'Demographics': return 'bg-gray-100 text-gray-800';
    case 'OPD Visit': return 'bg-blue-100 text-blue-800';
    case 'IPD Admission': return 'bg-red-100 text-red-800';
    case 'Lab Order': return 'bg-purple-100 text-purple-800';
    case 'Lab Result': return 'bg-green-100 text-green-800';
    case 'Prescription': return 'bg-orange-100 text-orange-800';
    case 'Emergency': return 'bg-red-100 text-red-800';
    case 'Nursing Note': return 'bg-blue-100 text-blue-800';
    case 'Patient Charge': return 'bg-orange-100 text-orange-800';
    case 'Discharge': return 'bg-green-100 text-green-800';
    case 'Billing': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function UnifiedMedicalRecord({ record, onRefresh }) {
  const [selectedEntry, setSelectedEntry] = useState(null);

  const handleDownloadReport = async (attachment) => {
    try {
      const link = document.createElement('a');
      link.href = attachment.url || '';
      link.download = attachment.file_name || 'report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file');
    }
  };

  // Safe access to entries with proper validation
  const entries = record?.entries || [];
  const validEntries = entries.filter(entry => entry && entry.entry_date);
  const sortedEntries = validEntries.sort((a, b) => {
    try {
      const dateA = new Date(a.entry_date + ' ' + (a.entry_time || '00:00'));
      const dateB = new Date(b.entry_date + ' ' + (b.entry_time || '00:00'));
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
      return dateB - dateA;
    } catch (error) {
      return 0;
    }
  });

  if (!record) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Record Selected</h3>
          <p className="text-gray-500">Select a patient to view their medical record</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Summary Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">{record.patient_name || 'Unknown Patient'}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>MRN: {record.patient_id || 'N/A'}</span>
                  {record.current_status && (
                    <Badge className={
                      record.current_status === 'IPD' ? 'bg-red-100 text-red-800' :
                      record.current_status === 'OPD' ? 'bg-blue-100 text-blue-800' :
                      record.current_status === 'Discharged' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {record.current_status}
                    </Badge>
                  )}
                  {record.current_status === 'IPD' && record.bed_number && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>Bed: {record.bed_number}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div>Last Updated</div>
              <div>{safeFormatDateTime(record.last_updated)}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {record.allergies && (
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="font-medium text-red-800">Allergies</div>
                <div className="text-sm text-red-600">{record.allergies}</div>
              </div>
            )}
            {record.chronic_conditions && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="font-medium text-yellow-800">Chronic Conditions</div>
                <div className="text-sm text-yellow-600">{record.chronic_conditions}</div>
              </div>
            )}
            {record.primary_doctor && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-blue-800">Primary Doctor</div>
                <div className="text-sm text-blue-600">{record.primary_doctor}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medical Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Medical Timeline ({sortedEntries.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedEntries.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Medical Entries</h3>
              <p className="text-gray-500">Medical entries will appear here as patient receives care</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedEntries.map((entry, index) => (
                <div key={entry.entry_id || index} className="border-l-2 border-gray-200 pl-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 bg-white border rounded-full">
                      <EntryTypeIcon type={entry.entry_type} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getEntryTypeColor(entry.entry_type)}>
                            {entry.entry_type || 'Unknown'}
                          </Badge>
                          {entry.department && (
                            <span className="text-sm text-gray-500">• {entry.department}</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {safeFormatDateTime(entry.entry_date, entry.entry_time)}
                        </div>
                      </div>
                      
                      {entry.doctor_name && (
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Provider:</strong> {entry.doctor_name}
                        </div>
                      )}
                      
                      <div className="mt-3">
                        {entry.chief_complaint && (
                          <div className="mb-2">
                            <strong>Chief Complaint:</strong> {entry.chief_complaint}
                          </div>
                        )}
                        
                        {entry.vital_signs && Object.keys(entry.vital_signs).length > 0 && (
                          <div className="mb-2">
                            <strong>Vital Signs:</strong>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1 text-sm bg-gray-50 p-2 rounded">
                              {entry.vital_signs.blood_pressure && (
                                <div>BP: {entry.vital_signs.blood_pressure}</div>
                              )}
                              {entry.vital_signs.heart_rate && (
                                <div>HR: {entry.vital_signs.heart_rate} bpm</div>
                              )}
                              {entry.vital_signs.temperature && (
                                <div>Temp: {entry.vital_signs.temperature}°F</div>
                              )}
                              {entry.vital_signs.weight && (
                                <div>Weight: {entry.vital_signs.weight} kg</div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {entry.diagnosis && (
                          <div className="mb-2">
                            <strong>Diagnosis:</strong> {entry.diagnosis}
                          </div>
                        )}
                        
                        {entry.treatment_plan && (
                          <div className="mb-2">
                            <strong>Treatment Plan:</strong> {entry.treatment_plan}
                          </div>
                        )}
                        
                        {entry.prescriptions && Array.isArray(entry.prescriptions) && entry.prescriptions.length > 0 && (
                          <div className="mb-2">
                            <strong>Prescriptions:</strong>
                            <ul className="list-disc list-inside mt-1 text-sm">
                              {entry.prescriptions.map((rx, idx) => (
                                <li key={idx}>
                                  {rx.medication || ''} {rx.dosage || ''} - {rx.frequency || ''} for {rx.duration || ''}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {entry.lab_orders && Array.isArray(entry.lab_orders) && entry.lab_orders.length > 0 && (
                          <div className="mb-2">
                            <strong>Lab Orders/Results:</strong>
                            <ul className="list-disc list-inside mt-1 text-sm">
                              {entry.lab_orders.map((lab, idx) => (
                                <li key={idx} className="flex items-center justify-between">
                                  <span>
                                    {lab.test_name || ''} ({lab.test_category || ''})
                                    {lab.result && `: ${lab.result}`}
                                  </span>
                                  {lab.report_url && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDownloadReport({
                                        url: lab.report_url,
                                        file_name: lab.report_filename || 'report.pdf'
                                      })}
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {entry.attachments && Array.isArray(entry.attachments) && entry.attachments.length > 0 && (
                          <div className="mb-2">
                            <strong>Attachments:</strong>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {entry.attachments.map((attachment, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDownloadReport(attachment)}
                                  className="text-xs"
                                >
                                  <Download className="w-3 h-3 mr-1" />
                                  {attachment.title || attachment.file_name || `Attachment ${idx + 1}`}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {entry.notes && (
                          <div className="mb-2">
                            <strong>Notes:</strong> {entry.notes}
                          </div>
                        )}
                        
                        {entry.follow_up_date && (
                          <div className="mb-2">
                            <strong>Follow-up Date:</strong> {safeFormatDate(entry.follow_up_date)}
                          </div>
                        )}
                        
                        {entry.created_by && (
                          <div className="text-xs text-gray-500 mt-2">
                            Recorded by: {entry.created_by}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}