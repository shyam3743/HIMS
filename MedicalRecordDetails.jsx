import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Edit, Download, Paperclip } from "lucide-react";
import { format } from 'date-fns';

export default function MedicalRecordDetails({ record, onClose, onEdit }) {
  if (!record) return null;

  const vitals = record.vital_signs || {};
  const prescriptions = record.prescriptions || [];
  const attachments = record.attachments || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Medical Record Details</CardTitle>
            <p className="text-sm text-gray-500">For {record.patient_name} (MRN: {record.patient_id})</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto space-y-4">
          {/* ... (rest of the component, with download button added) ... */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><span className="font-semibold">Doctor:</span> {record.doctor_name}</div>
            <div><span className="font-semibold">Visit Date:</span> {format(new Date(record.visit_date), 'PPP')}</div>
          </div>
          <div><span className="font-semibold">Chief Complaint:</span> <p className="text-gray-700">{record.chief_complaint}</p></div>
          <div><span className="font-semibold">Diagnosis:</span> <p className="text-gray-700">{record.diagnosis}</p></div>
          
           {attachments.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2"><Paperclip className="w-4 h-4" />Attachments</h4>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                    <div>
                        <p className="font-medium">{file.title}</p>
                        <p className="text-xs text-gray-500">{file.file_name}</p>
                    </div>
                    <Button asChild variant="outline" size="sm">
                        <a href={file.url} target="_blank" rel="noopener noreferrer" download>
                            <Download className="w-4 h-4 mr-2"/>
                            Download
                        </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={() => { onClose(); onEdit(record); }}>
            <Edit className="w-4 h-4 mr-2" /> Edit Record
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}