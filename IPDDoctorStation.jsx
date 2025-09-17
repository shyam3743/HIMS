import React, { useState, useEffect } from "react";
import { Bed } from "@/api/entities";
import { Patient } from "@/api/entities";
import { LabOrder } from "@/api/entities";
import { Prescription } from "@/api/entities";
import { LabTestCatalog } from "@/api/entities";
import { Inventory } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Stethoscope, User, Bed as BedIcon, FlaskConical, Pill, FileText, Search } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import IPDPatientCard from "../components/ipd-doctor/IPDPatientCard";
import IPDLabOrderForm from "../components/ipd-doctor/IPDLabOrderForm";
import IPDPrescriptionForm from "../components/ipd-doctor/IPDPrescriptionForm";
import IPDDoctorNoteForm from "../components/ipd-doctor/IPDDoctorNoteForm";
import { MedicalRecordLogger } from "../components/medical-records/MedicalRecordLogger";

export default function IPDDoctorStation() {
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [labTestCatalog, setLabTestCatalog] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  
  const [activeAction, setActiveAction] = useState(null); // 'lab', 'prescription', 'note'
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bedData, patientData, labCatalogData, inventoryData] = await Promise.all([
        Bed.list(),
        Patient.list(),
        LabTestCatalog.list(),
        Inventory.list()
      ]);
      setBeds(bedData);
      setPatients(patientData);
      setLabTestCatalog(labCatalogData);
      setInventory(inventoryData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleCreateLabOrder = async (orderData) => {
    try {
      // Add IPD-specific information
      const ipdOrderData = {
        ...orderData,
        department: "IPD",
        bed_number: selectedBed.bed_number,
        ward_name: selectedBed.ward_name
      };
      
      await LabOrder.create(ipdOrderData);
      
      // Auto-log to medical record
      await MedicalRecordLogger.logLabOrder(
        orderData.patient_id,
        orderData.patient_name,
        ipdOrderData
      );
      
      setActiveAction(null);
      setSelectedPatient(null);
      setSelectedBed(null);
      alert("Lab order created successfully!");
      loadData();
    } catch (error) {
      console.error('Error creating lab order:', error);
      alert("Failed to create lab order. Please try again.");
    }
  };

  const handleCreatePrescription = async (prescriptionData) => {
    try {
      // Add IPD-specific information
      const ipdPrescriptionData = {
        ...prescriptionData,
        prescribed_by_department: "IPD",
        bed_number: selectedBed.bed_number,
        ward_name: selectedBed.ward_name
      };
      
      await Prescription.create(ipdPrescriptionData);
      
      // Auto-log to medical record
      await MedicalRecordLogger.logPrescription(
        prescriptionData.patient_id,
        prescriptionData.patient_name,
        ipdPrescriptionData
      );
      
      setActiveAction(null);
      setSelectedPatient(null);
      setSelectedBed(null);
      alert("Prescription created successfully!");
      loadData();
    } catch (error) {
      console.error('Error creating prescription:', error);
      alert("Failed to create prescription. Please try again.");
    }
  };

  const handleAddDoctorNote = async (noteData) => {
    try {
      // Auto-log doctor's note to medical record
      await MedicalRecordLogger.logOPDVisit(
        selectedPatient.mrn,
        `${selectedPatient.first_name} ${selectedPatient.last_name}`,
        {
          department: "IPD",
          doctor_name: noteData.doctor_name,
          chief_complaint: noteData.chief_complaint || "IPD Review",
          diagnosis: noteData.diagnosis,
          treatment_plan: noteData.treatment_plan,
          notes: noteData.notes,
          follow_up_date: noteData.follow_up_date
        }
      );
      
      setActiveAction(null);
      setSelectedPatient(null);
      setSelectedBed(null);
      alert("Doctor's note added successfully!");
    } catch (error) {
      console.error('Error adding doctor note:', error);
      alert("Failed to add doctor's note. Please try again.");
    }
  };

  // Filter occupied beds and match with patients
  const occupiedBeds = beds.filter(bed => bed.status === 'Occupied');
  const patientsWithBeds = occupiedBeds.map(bed => {
    const patient = patients.find(p => p.mrn === bed.current_patient_id);
    return { bed, patient };
  }).filter(item => item.patient);

  // Filter by search query
  const filteredPatientsWithBeds = patientsWithBeds.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.patient.first_name?.toLowerCase().includes(query) ||
      item.patient.last_name?.toLowerCase().includes(query) ||
      item.patient.mrn?.toLowerCase().includes(query) ||
      item.bed.bed_number?.toLowerCase().includes(query) ||
      item.bed.ward_name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IPD Doctor Station</h1>
          <p className="text-gray-600">Manage admitted patients - order tests, prescriptions, and add clinical notes</p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by patient name, MRN, bed number, or ward..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BedIcon className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{occupiedBeds.length}</p>
                <p className="text-sm text-gray-600">Admitted Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Stethoscope className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{beds.filter(b => b.ward_name === 'ICU' && b.status === 'Occupied').length}</p>
                <p className="text-sm text-gray-600">ICU Patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{filteredPatientsWithBeds.length}</p>
                <p className="text-sm text-gray-600">Search Results</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient List */}
      <Card>
        <CardHeader>
          <CardTitle>Admitted Patients ({filteredPatientsWithBeds.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading patients...</p>
            </div>
          ) : filteredPatientsWithBeds.length === 0 ? (
            <div className="text-center py-8">
              <BedIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? "No patients match your search" : "No admitted patients"}
              </h3>
              <p className="text-gray-500">
                {searchQuery ? "Try adjusting your search terms" : "Patients will appear here when they are admitted"}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPatientsWithBeds.map(({ bed, patient }) => (
                <IPDPatientCard
                  key={bed.id}
                  bed={bed}
                  patient={patient}
                  onLabOrder={() => {
                    setSelectedPatient(patient);
                    setSelectedBed(bed);
                    setActiveAction('lab');
                  }}
                  onPrescription={() => {
                    setSelectedPatient(patient);
                    setSelectedBed(bed);
                    setActiveAction('prescription');
                  }}
                  onAddNote={() => {
                    setSelectedPatient(patient);
                    setSelectedBed(bed);
                    setActiveAction('note');
                  }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Modals */}
      {activeAction === 'lab' && selectedPatient && selectedBed && (
        <IPDLabOrderForm
          patient={selectedPatient}
          bed={selectedBed}
          labTestCatalog={labTestCatalog}
          onSubmit={handleCreateLabOrder}
          onCancel={() => {
            setActiveAction(null);
            setSelectedPatient(null);
            setSelectedBed(null);
          }}
        />
      )}

      {activeAction === 'prescription' && selectedPatient && selectedBed && (
        <IPDPrescriptionForm
          patient={selectedPatient}
          bed={selectedBed}
          inventory={inventory}
          onSubmit={handleCreatePrescription}
          onCancel={() => {
            setActiveAction(null);
            setSelectedPatient(null);
            setSelectedBed(null);
          }}
        />
      )}

      {activeAction === 'note' && selectedPatient && selectedBed && (
        <IPDDoctorNoteForm
          patient={selectedPatient}
          bed={selectedBed}
          onSubmit={handleAddDoctorNote}
          onCancel={() => {
            setActiveAction(null);
            setSelectedPatient(null);
            setSelectedBed(null);
          }}
        />
      )}
    </div>
  );
}