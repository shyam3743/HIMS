
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Appointment, Patient, Employee, Department, MedicalRecord, LabOrder, Prescription, Bill } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCheck, User, Clock, ArrowRight, FlaskConical, Pill, Receipt, Building2, Users, Calendar } from "lucide-react";
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

export default function DepartmentOPD() {
  const [searchParams] = useSearchParams();
  const departmentName = searchParams.get('department');
  
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [department, setDepartment] = useState(null);
  const [departmentDoctors, setDepartmentDoctors] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDoctor, setSelectedDoctor] = useState("all");
  const [activeAction, setActiveAction] = useState(null); // Used for Lab Order and Prescription
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [assigningDoctor, setAssigningDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [apptData, patientData, recordData, deptData, empData] = await Promise.all([
        Appointment.list('-created_date'),
        Patient.list(),
        MedicalRecord.list('-created_date'),
        Department.list(),
        Employee.list()
      ]);

      const currentDept = deptData.find(d => d.name === departmentName);
      const deptDoctors = empData.filter(emp => 
        emp.role === "Doctor" && 
        emp.department_name === departmentName &&
        emp.status === "Active"
      );

      setAppointments(apptData);
      setPatients(patientData);
      setMedicalRecords(recordData);
      setDepartment(currentDept);
      setDepartmentDoctors(deptDoctors);
    } catch (error) {
      console.error("Error loading Department OPD data:", error);
    }
    setIsLoading(false);
  }, [departmentName]);

  useEffect(() => {
    if (departmentName) {
      loadData();
    }
  }, [departmentName, loadData]);

  const handleAssignDoctor = async (appointment, doctorId) => {
    try {
      const selectedDoc = departmentDoctors.find(d => d.id === doctorId);
      if (!selectedDoc) return;

      await Appointment.update(appointment.id, {
        doctor_name: `${selectedDoc.first_name} ${selectedDoc.last_name}`,
        status: "Checked-in",
        notes: `${appointment.notes || ''} | Doctor assigned: Dr. ${selectedDoc.first_name} ${selectedDoc.last_name} on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`
      });
      
      alert(`Dr. ${selectedDoc.first_name} ${selectedDoc.last_name} has been assigned to ${appointment.patient_name}.`);
      setAssigningDoctor(null);
      loadData();
    } catch (error) {
      console.error('Error assigning doctor:', error);
    }
  };

  const handleCreateLabOrder = async (orderData) => {
    try {
      await LabOrder.create(orderData);
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
      setActiveAction(null);
      setSelectedPatient(null);
      loadData();
    } catch (error) {
      console.error('Error creating prescription:', error);
    }
  };

  const handleCompleteConsultation = async (appointment, lineItems, total) => {
    try {
      // Update appointment status
      await Appointment.update(appointment.id, {
        status: "Billed",
        notes: `${appointment.notes || ''} | Consultation completed & billed in ${departmentName} OPD on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`
      });

      // Automatically create a comprehensive bill
      const billData = {
        patient_id: appointment.patient_id,
        patient_name: appointment.patient_name,
        bill_number: `BILL-OPD-${Date.now()}`,
        bill_date: new Date().toISOString().split('T')[0],
        line_items: lineItems,
        total_amount: total,
        discount_amount: 0,
        amount_due: total,
        payment_status: "Pending",
        bill_type: "OPD"
      };

      await Bill.create(billData);
      
      alert(`Consultation completed for ${appointment.patient_name}. A bill for ₹${total} has been sent to the billing department.`);
      loadData();
    } catch (error) {
      console.error('Error completing consultation:', error);
    }
  };

  const handleSendBackToPreOPD = async (appointment) => {
    try {
      await Appointment.update(appointment.id, {
        status: "Pre-OPD",
        doctor_name: null, // Clear the assigned doctor
        notes: `${appointment.notes || ''} | Sent back to Pre-OPD from ${departmentName} on ${format(new Date(), 'MMM dd, yyyy HH:mm')}`
      });
      alert(`${appointment.patient_name} has been sent back to the Pre-OPD queue.`);
      loadData();
    } catch (error) {
      console.error('Error sending patient back to Pre-OPD:', error);
    }
  };

  // Filter appointments for this department
  const departmentAppointments = appointments.filter(apt => {
    const dateMatch = apt.appointment_date === selectedDate;
    const deptMatch = apt.department === departmentName;
    const doctorMatch = selectedDoctor === "all" || apt.doctor_name?.includes(selectedDoctor);
    const statusMatch = apt.status === "Scheduled" || apt.status === "Checked-in" || apt.status === "In Progress";
    return dateMatch && deptMatch && statusMatch && doctorMatch;
  });

  // Separate appointments that need doctor assignment
  const unassignedAppointments = departmentAppointments.filter(apt => !apt.doctor_name && apt.status === 'Scheduled');
  const assignedAppointments = departmentAppointments.filter(apt => apt.doctor_name && apt.status !== 'Scheduled');

  const getPatientData = (patientId) => {
    const patient = patients.find(p => p.mrn === patientId);
    const patientRecords = medicalRecords.filter(r => r.patient_id === patientId);
    const latestRecord = patientRecords.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];
    return { patient, records: patientRecords, latestRecord };
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Department Not Found</h3>
            <p className="text-gray-500">The requested department could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{department.name} OPD</h1>
          <p className="text-gray-600">
            {department.specialty} | OPD Timings: {department.opd_timings} | {department.opd_days}
          </p>
          {department.head_doctor_name && (
            <p className="text-sm text-gray-500">Head: Dr. {department.head_doctor_name}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
            <SelectTrigger className="w-[200px]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <SelectValue placeholder="Filter by Doctor" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Doctors</SelectItem>
              {departmentDoctors.map(doc => (
                <SelectItem key={doc.id} value={`${doc.first_name} ${doc.last_name}`}>
                  Dr. {doc.first_name} {doc.last_name}
                  {doc.specialization && ` - ${doc.specialization}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold">{departmentAppointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Waiting for Doctor</p>
                <p className="text-2xl font-bold">{unassignedAppointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Assigned to Doctors</p>
                <p className="text-2xl font-bold">{assignedAppointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Available Doctors</p>
                <p className="text-2xl font-bold">{departmentDoctors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Tabs */}
      <Tabs defaultValue="unassigned" className="space-y-4">
        <TabsList>
          <TabsTrigger value="unassigned">
            Awaiting Doctor Assignment ({unassignedAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="assigned">
            With Doctor ({assignedAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unassigned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Patients Waiting for Doctor Assignment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {unassignedAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">All patients assigned</h3>
                  <p className="text-gray-500">No patients waiting for doctor assignment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {unassignedAppointments.map((appointment) => {
                    const patientData = getPatientData(appointment.patient_id);
                    return (
                      <div key={appointment.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{appointment.patient_name}</h3>
                              <p className="text-sm text-gray-600">
                                {appointment.appointment_time} | {appointment.appointment_type}
                              </p>
                              {appointment.priority !== "Normal" && (
                                <Badge className="mt-1 bg-red-100 text-red-800">
                                  {appointment.priority}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Select
                              onValueChange={(doctorId) => handleAssignDoctor(appointment, doctorId)}
                            >
                              <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="Assign Doctor" />
                              </SelectTrigger>
                              <SelectContent>
                                {departmentDoctors.map(doctor => (
                                  <SelectItem key={doctor.id} value={doctor.id}>
                                    Dr. {doctor.first_name} {doctor.last_name}
                                    {doctor.specialization && ` - ${doctor.specialization}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assigned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Patients Assigned to Doctors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignedAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assigned appointments</h3>
                  <p className="text-gray-500">Assigned patients will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedAppointments.map((appointment) => {
                    const patientData = getPatientData(appointment.patient_id);
                    return (
                      <PreOPDPatientCard
                        key={appointment.id}
                        appointment={appointment}
                        patientData={patientData}
                        showDepartmentReferral={false}
                        onLabOrder={() => {
                          setSelectedPatient(patientData.patient);
                          setActiveAction('lab');
                        }}
                        onPrescription={() => {
                          setSelectedPatient(patientData.patient);
                          setActiveAction('prescription');
                        }}
                        onCompleteConsultation={handleCompleteConsultation}
                        onSendBackToPreOPD={handleSendBackToPreOPD} // Pass the handler
                      />
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Action Modals */}
      {activeAction === 'lab' && selectedPatient && (
        <QuickLabOrderForm
          patient={selectedPatient}
          onSubmit={handleCreateLabOrder}
          onCancel={() => { setActiveAction(null); setSelectedPatient(null); }}
        />
      )}

      {activeAction === 'prescription' && selectedPatient && (
        <QuickPrescriptionForm
          patient={selectedPatient}
          onSubmit={handleCreatePrescription}
          onCancel={() => { setActiveAction(null); setSelectedPatient(null); }}
        />
      )}
    </div>
  );
}
