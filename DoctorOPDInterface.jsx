import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Stethoscope,
  User,
  Clock,
  FileText,
  FlaskConical,
  Pill,
  Receipt,
  CheckCircle
} from "lucide-react";
import { MedicalRecord, LabOrder, Prescription, Inventory } from "@/api/entities";

import MedicalRecordForm from "../medical-records/MedicalRecordForm";
import LabOrderForm from "../laboratory/LabOrderForm";
import PrescriptionForm from "../pharmacy/PrescriptionForm";

export default function DoctorOPDInterface({ appointments, patients, onRefresh }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showMedicalRecordForm, setShowMedicalRecordForm] = useState(false);
  const [showLabOrderForm, setShowLabOrderForm] = useState(false);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  // Filter appointments that are in progress or checked-in
  const activeAppointments = appointments.filter(apt => 
    apt.status === "Checked-in" || apt.status === "In Progress"
  );

  const handlePatientSelect = (appointment) => {
    const patient = patients.find(p => p.mrn === appointment.patient_id);
    setSelectedPatient({ ...patient, appointment });
  };
  
  useEffect(() => {
    // Pre-load inventory when the component mounts or when prescription form is about to be shown
    if (showPrescriptionForm && inventory.length === 0 && !isLoadingInventory) {
      loadInventory();
    }
  }, [showPrescriptionForm, inventory.length, isLoadingInventory]);
  
  const loadInventory = async () => {
    setIsLoadingInventory(true);
    try {
      const inventoryData = await Inventory.list();
      setInventory(inventoryData);
    } catch (error) {
      console.error("Error loading inventory:", error);
    }
    setIsLoadingInventory(false);
  };

  const handleCreateMedicalRecord = async (recordData) => {
    try {
      await MedicalRecord.create(recordData);
      setShowMedicalRecordForm(false);
      // Optionally update appointment status
      onRefresh();
    } catch (error) {
      console.error('Error creating medical record:', error);
    }
  };

  const handleCreateLabOrder = async (orderData) => {
    try {
      await LabOrder.create(orderData);
      setShowLabOrderForm(false);
      onRefresh();
    } catch (error) {
      console.error('Error creating lab order:', error);
    }
  };

  const handleCreatePrescription = async (prescriptionData) => {
    try {
      await Prescription.create(prescriptionData);
      setShowPrescriptionForm(false);
      onRefresh();
    } catch (error) {
      console.error('Error creating prescription:', error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            Doctor OPD Interface
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Active Appointments */}
            <div>
              <h3 className="font-semibold mb-4">Active Appointments ({activeAppointments.length})</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activeAppointments.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    No active appointments
                  </div>
                ) : (
                  activeAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      onClick={() => handlePatientSelect(appointment)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedPatient?.appointment?.id === appointment.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                            {appointment.queue_number || '—'}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{appointment.patient_name}</h4>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>{appointment.appointment_time}</span>
                              <span>•</span>
                              <span>{appointment.appointment_type}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Patient Actions */}
            <div>
              {selectedPatient ? (
                <div>
                  <h3 className="font-semibold mb-4">
                    Patient: {selectedPatient.first_name} {selectedPatient.last_name}
                  </h3>
                  <div className="space-y-4">
                    {/* Patient Info Card */}
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>MRN:</strong> {selectedPatient.mrn}
                          </div>
                          <div>
                            <strong>Age:</strong> {selectedPatient.date_of_birth ? new Date().getFullYear() - new Date(selectedPatient.date_of_birth).getFullYear() : 'N/A'}
                          </div>
                          <div>
                            <strong>Phone:</strong> {selectedPatient.phone}
                          </div>
                          <div>
                            <strong>Blood Group:</strong> {selectedPatient.blood_group || 'N/A'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => setShowMedicalRecordForm(true)}
                        className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Medical Record
                      </Button>
                      <Button
                        onClick={() => setShowLabOrderForm(true)}
                        className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                      >
                        <FlaskConical className="w-4 h-4" />
                        Lab Order
                      </Button>
                      <Button
                        onClick={() => setShowPrescriptionForm(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
                      >
                        <Pill className="w-4 h-4" />
                        Prescription
                      </Button>
                      <Button
                        onClick={() => {
                          // Complete consultation and move to billing
                          // You would implement the billing integration here
                          alert("Moving to billing system...");
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
                      >
                        <Receipt className="w-4 h-4" />
                        Complete & Bill
                      </Button>
                    </div>

                    {/* Complete Consultation Button */}
                    <Button
                      onClick={() => {
                        // Mark appointment as completed
                        onRefresh();
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
                      size="lg"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Mark Consultation Complete
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium mb-2">Select a Patient</h3>
                  <p>Click on an appointment to view patient details and take actions.</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Forms */}
      {showMedicalRecordForm && selectedPatient && (
        <MedicalRecordForm
          patients={[selectedPatient]}
          onSubmit={handleCreateMedicalRecord}
          onCancel={() => setShowMedicalRecordForm(false)}
        />
      )}

      {showLabOrderForm && selectedPatient && (
        <LabOrderForm
          patients={[selectedPatient]}
          onSubmit={handleCreateLabOrder}
          onCancel={() => setShowLabOrderForm(false)}
        />
      )}

      {showPrescriptionForm && selectedPatient && (
        <PrescriptionForm
          patients={[selectedPatient]}
          inventory={inventory}
          onSubmit={handleCreatePrescription}
          onCancel={() => setShowPrescriptionForm(false)}
        />
      )}
    </div>
  );
}