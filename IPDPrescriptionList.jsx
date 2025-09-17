import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, User, Calendar, Pill, MapPin, ChevronDown, ChevronUp, Building2 } from "lucide-react";
import { format } from "date-fns";
import DispenseForm from "./DispenseForm";

export default function IPDPrescriptionList({ prescriptions, inventory = [], isLoading, onRefresh, onDispenseAndBill }) {
  const [expandedId, setExpandedId] = useState(null);
  const [dispensingPrescription, setDispensingPrescription] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          IPD Prescriptions ({prescriptions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No IPD prescriptions</h3>
            <p className="text-gray-500">Prescriptions from IPD Doctor Station will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {prescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{prescription.patient_name}</h4>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>Dr. {prescription.doctor_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>Bed {prescription.bed_number || 'N/A'} - {prescription.ward_name || 'IPD'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(prescription.prescription_date), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-800">IPD</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpand(prescription.id)}
                    >
                      Details {expandedId === prescription.id ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                    </Button>
                    <Button size="sm" onClick={() => setDispensingPrescription(prescription)}>
                      Dispense & Bill
                    </Button>
                  </div>
                </div>

                {expandedId === prescription.id && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="bg-red-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <span className="font-semibold text-red-800">Location Details</span>
                      </div>
                      <div className="text-sm text-red-700">
                        <span className="font-medium">Bed:</span> {prescription.bed_number || 'Not specified'} • 
                        <span className="font-medium ml-2">Ward:</span> {prescription.ward_name || 'IPD'}
                      </div>
                    </div>
                    
                    <h5 className="font-semibold mb-2">Prescription Details:</h5>
                    <div className="space-y-1 text-sm">
                      <p><strong>Medication:</strong> {prescription.medication_name}</p>
                      <p><strong>Dosage:</strong> {prescription.dosage}</p>
                      <p><strong>Frequency:</strong> {prescription.frequency}</p>
                      <p><strong>Duration:</strong> {prescription.duration}</p>
                      <p><strong>Quantity:</strong> {prescription.quantity}</p>
                      <p><strong>Instructions:</strong> {prescription.instructions || 'N/A'}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {dispensingPrescription && (
        <DispenseForm
          prescription={dispensingPrescription}
          inventory={inventory}
          onClose={() => setDispensingPrescription(null)}
          onSubmit={onDispenseAndBill}
        />
      )}
    </Card>
  );
}