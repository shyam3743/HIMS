
import React, { useState, useEffect } from "react";
import { Appointment } from "@/api/entities";
import { Patient } from "@/api/entities";
import { Employee } from "@/api/entities";
import { Department } from "@/api/entities";
import { MedicalRecord } from "@/api/entities";
import { LabOrder } from "@/api/entities";
import { Prescription } from "@/api/entities";
import { Bill } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardEdit, User, Clock, ArrowRight, FlaskConical, Pill, Receipt, Building2 } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import PreOPDPatientCard from "../components/pre-opd/PreOPDPatientCard";
import QuickLabOrderForm from "../components/pre-opd/QuickLabOrderForm";
import QuickPrescriptionForm from "../components/pre-opd/QuickPrescriptionForm";
// QuickBillForm is removed as per requirements
import { MedicalRecordLogger } from "../components/medical-records/MedicalRecordLogger";

export default function PreOPD() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]); // Doctors state is not used in the final render logic in this file, but kept if other parts depend on it.
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [activeAction, setActiveAction] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [apptData, patientData, recordData, deptData, empData] = await Promise.all([
        Appointment.list('-created_date'),
        Patient.list(),
        MedicalRecord.list('-created_date'),
        Department.list(),
        Employee.filter({ role: "Doctor" })
      ]);
      setAppointments(apptData);
      setPatients(patientData);
      setMedicalRecords(recordData);
      setDepartments(deptData);
      setDoctors(empData);
      
      console.log('All appointments:', apptData); // Debug log
      console.log('Pre-OPD appointments:', apptData.filter(apt => apt.status === "Pre-OPD")); // Debug log
    } catch (error) {
      console.error("Error loading Pre-OPD data:", error);
    }
    setIsLoading(false);
  };

  const handleCreateLabOrder = async (orderData) => {
    try {
      const newOrder = await LabOrder.create(orderData);
      
      // Auto-log to medical record
      await MedicalRecordLogger.logLabOrder(
        orderData.patient_id,
        orderData.patient_name,
        orderData
      );
      
      setActiveAction(null);
      setSelectedPatient(null);
      loadData();
    } catch (error) {
      console.error('Error creating lab order:', error);
    }
  };

  const handleCreatePrescription = async (prescriptionData) => {
    try {
      await Prescription.create(prescriptionData);
      
      // Auto-log to medical record
      await MedicalRecordLogger.logPrescription(
        prescriptionData.patient_id,
        prescriptionData.patient_name,
        prescriptionData
      );
      
      setActiveAction(null);
      setSelectedPatient(null);
      loadData();
    } catch (error) {
      console.error('Error creating prescription:', error);
    }
  };

  // handleCreateBill function is removed as bills are now auto-created on consultation complete

  const handleSendToOPD = async (appointment, selectedDepartment) => {
    try {
      await Appointment.update(appointment.id, {
        status: "Scheduled",
        department: selectedDepartment,
        notes: `${appointment.notes || ''} | Referred from Pre-OPD on ${format(new Date(), 'MMM dd, yyyy')}`
      });
      
      // Auto-log to medical record
      await MedicalRecordLogger.logOPDVisit(
        appointment.patient_id,
        appointment.patient_name,
        {
          department: selectedDepartment,
          doctor_name: "Pre-OPD Staff",
          chief_complaint: "Referred from Pre-OPD",
          diagnosis: "Pending OPD consultation",
          treatment_plan: `Referred to ${selectedDepartment} department`,
          notes: `Patient referred from Pre-OPD to ${selectedDepartment} on ${format(new Date(), 'MMM dd, yyyy')}`
        }
      );
      
      alert(`Patient ${appointment.patient_name} has been referred to ${selectedDepartment} department.`);
      loadData();
    } catch (error) {
      console.error('Error referring to OPD:', error);
    }
  };

  const handleCompleteConsultation = async (appointment) => {
    try {
      // Update appointment status to completed
      await Appointment.update(appointment.id, {
        status: "Completed",
        notes: `${appointment.notes || ''} | Consultation completed in Pre-OPD on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`
      });

      // Automatically create a bill for the consultation
      const billData = {
        patient_id: appointment.patient_id,
        patient_name: appointment.patient_name,
        bill_number: `BILL-OPD-${Date.now()}`,
        bill_date: new Date().toISOString().split('T')[0],
        line_items: [
          {
            item_id: "consultation_001",
            item_name: "Pre-OPD Consultation",
            item_type: "Service",
            price_per_unit: 500,
            quantity: 1,
            total_price: 500
          }
        ],
        total_amount: 500,
        discount_amount: 0,
        amount_due: 500,
        payment_status: "Pending",
        bill_type: "OPD"
      };

      await Bill.create(billData);
      
      // Auto-log to medical record
      await MedicalRecordLogger.logPreOPDConsultation(
        appointment.patient_id,
        appointment.patient_name,
        {
          complaint: "Pre-OPD consultation",
          diagnosis: "Consultation completed",
          treatment_plan: "Pre-OPD assessment completed",
          notes: "Consultation completed in Pre-OPD and sent to billing"
        }
      );
      
      alert(`Consultation completed for ${appointment.patient_name} and sent to billing.`);
      loadData();
    } catch (error) {
      console.error('Error completing consultation:', error);
    }
  };

  const preOPDAppointments = appointments.filter(apt => {
    const dateMatch = apt.appointment_date === selectedDate;
    const statusMatch = apt.status === "Pre-OPD"; // This should now match
    const deptMatch = selectedDepartment === "all" || apt.department === selectedDepartment;
    return dateMatch && statusMatch && deptMatch;
  });

  const getPatientData = (patientId) => {
    const patient = patients.find(p => p.mrn === patientId);
    const patientRecords = medicalRecords.filter(r => r.patient_id === patientId);
    const latestRecord = patientRecords.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
    return { patient, records: patientRecords, latestRecord };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pre-OPD Management</h1>
          <p className="text-gray-600">Initial patient screening and consultation</p>
        </div>
      </div>

      {/* Date and Department Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.name}>{dept.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Patient Queue */}
      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="queue">Patient Queue ({preOPDAppointments.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="queue">
          <div className="grid gap-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading patients...</p>
              </div>
            ) : preOPDAppointments.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <ClipboardEdit className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No patients in Pre-OPD queue</h3>
                  <p className="text-gray-500">Patients sent from Demographic will appear here for {format(new Date(selectedDate), 'MMM dd, yyyy')}</p>
                </CardContent>
              </Card>
            ) : (
              preOPDAppointments.map((appointment) => {
                const patientData = getPatientData(appointment.patient_id);
                return (
                  <PreOPDPatientCard
                    key={appointment.id}
                    appointment={appointment}
                    patientData={patientData}
                    departments={departments.filter(d => d.has_opd && d.status === 'Active')}
                    onLabOrder={(patient) => {
                      setSelectedPatient(patient);
                      setActiveAction('lab');
                    }}
                    onPrescription={(patient) => {
                      setSelectedPatient(patient);
                      setActiveAction('prescription');
                    }}
                    onSendToOPD={handleSendToOPD}
                    onCompleteConsultation={handleCompleteConsultation}
                  />
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Action Modals */}
      {activeAction === 'lab' && selectedPatient && (
        <QuickLabOrderForm
          patient={selectedPatient}
          onSubmit={handleCreateLabOrder}
          onCancel={() => {
            setActiveAction(null);
            setSelectedPatient(null);
          }}
        />
      )}

      {activeAction === 'prescription' && selectedPatient && (
        <QuickPrescriptionForm
          patient={selectedPatient}
          onSubmit={handleCreatePrescription}
          onCancel={() => {
            setActiveAction(null);
            setSelectedPatient(null);
          }}
        />
      )}
      {/* QuickBillForm is removed */}
    </div>
  );
}
