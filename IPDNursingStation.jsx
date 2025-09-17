
import React, { useState, useEffect, useCallback } from "react";
import { Bed } from "@/api/entities";
import { Patient } from "@/api/entities";
import { PatientCharge } from "@/api/entities";
import { NursingNote } from "@/api/entities";
import { Inventory } from "@/api/entities"; // ADDED
import { MedicalRecordLogger } from "../components/medical-records/MedicalRecordLogger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bed as BedIcon, Plus, UserPlus, LogOut, FileText, Pill } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import OccupiedBedList from "../components/nursing-station/OccupiedBedList";
import AssignPatientForm from "../components/bed-management/AssignPatientForm";
import DischargeConfirmation from "../components/bed-management/DischargeConfirmation";
import AddChargeForm from "../components/nursing-station/AddChargeForm";
import DailyChargesView from "../components/nursing-station/DailyChargesView";
import NursingNotesView from "../components/nursing-station/NursingNotesView";
import AddNoteForm from "../components/nursing-station/AddNoteForm";

export default function IPDNursingStation() {
  const [beds, setBeds] = useState([]);
  const [patients, setPatients] = useState([]);
  const [inventory, setInventory] = useState([]); // RE-ADDED
  const [patientCharges, setPatientCharges] = useState([]);
  const [nursingNotes, setNursingNotes] = useState([]);
  
  const [selectedBed, setSelectedBed] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [dischargingBed, setDischargingBed] = useState(null);

  // New state for handling actions and forms
  const [selectedBedForAction, setSelectedBedForAction] = useState(null); // Which bed's patient we are acting upon
  const [activeAction, setActiveAction] = useState(null); // 'addCharge', 'addNote'
  const [activeTab, setActiveTab] = useState("charges"); // 'charges' or 'notes' for PatientCareLog area

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [bedData, patientData, chargeData, noteData, invData] = await Promise.all([
        Bed.list(),
        Patient.list(),
        PatientCharge.list('-created_date'),
        NursingNote.list('-created_date'),
        Inventory.list() // ADDED
      ]);
      setBeds(bedData);
      setPatients(patientData);
      setInventory(invData); // ADDED
      setPatientCharges(chargeData);
      setNursingNotes(noteData);
    } catch (error) {
      console.error("Error loading data for Nursing Station:", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const handleAssignPatient = async (bedId, patientId, admissionDate) => {
    const bed = beds.find(b => b.id === bedId);
    const patient = patients.find(p => p.id === patientId);
    if (!bed || !patient) return;
    
    try {
      await Bed.update(bed.id, { 
        status: "Occupied",
        current_patient_id: patient.mrn,
        current_patient_name: `${patient.first_name} ${patient.last_name}`,
        admission_date: admissionDate,
      });

      // Log admission to medical record
      await MedicalRecordLogger.logAdmission(
        patient.mrn,
        `${patient.first_name} ${patient.last_name}`,
        { bed_number: bed.bed_number, doctor_name: "Admission Staff" }
      );
      
      setShowAssignForm(false);
      loadData();
      alert(`Patient ${patient.first_name} ${patient.last_name} successfully assigned to bed ${bed.bed_number}.`);
    } catch(error) {
      console.error("Error assigning patient:", error);
      alert("Error assigning patient. Please try again.");
    }
  };

  const handleDischargePatient = async (bed, dischargeDetails) => {
    if (!bed || !bed.id) {
      console.error("Invalid bed data:", bed);
      alert("Error: Invalid bed information. Cannot discharge.");
      return;
    }

    try {
      await Bed.update(bed.id, {
        status: "Cleaning",
        current_patient_id: null,
        current_patient_name: null,
        admission_date: null,
      });
      
      // Log discharge to medical record
      await MedicalRecordLogger.logDischarge(
        bed.current_patient_id,
        bed.current_patient_name,
        {
          bed_number: bed.bed_number,
          doctor_name: dischargeDetails.doctorName,
          final_diagnosis: dischargeDetails.finalDiagnosis,
          discharge_summary: dischargeDetails.dischargeSummary,
        }
      );

      setDischargingBed(null);
      setSelectedBed(null); // Deselect the bed after discharge
      loadData();
      alert(`Patient ${bed.current_patient_name} has been successfully discharged from bed ${bed.bed_number}`);
    } catch(error) {
      console.error("Error during discharge:", error);
      alert("Error during discharge process. Please try again.");
    }
  };
  
  const handleAddCharge = async (chargeData) => {
    const bed = selectedBedForAction;
    if (!bed) return;
    try {
      const fullChargeData = {
        ...chargeData,
        patient_id: bed.current_patient_id,
        patient_name: bed.current_patient_name,
        recorded_by_nurse_name: "Nurse Jane" // Placeholder
      };
      await PatientCharge.create(fullChargeData);
      
      // Log charge to medical record
      await MedicalRecordLogger.logPatientCharge(
        bed.current_patient_id,
        bed.current_patient_name,
        fullChargeData
      );

      setSelectedBedForAction(null);
      setActiveAction(null);
      loadData();
    } catch (error) {
      console.error("Error adding charge:", error);
    }
  };

  const handleAddNote = async (noteData) => {
    const bed = selectedBedForAction;
    if (!bed) return;
    try {
      const fullNoteData = {
        ...noteData,
        patient_id: bed.current_patient_id,
        patient_name: bed.current_patient_name,
        bed_id: bed.id,
        nurse_name: "Nurse Jane" // Placeholder
      };
      await NursingNote.create(fullNoteData);
      
      // Log note to medical record
      await MedicalRecordLogger.logNursingNote(
        bed.current_patient_id,
        bed.current_patient_name,
        fullNoteData
      );

      setSelectedBedForAction(null);
      setActiveAction(null);
      loadData();
    } catch (error) {
      console.error("Error adding nursing note:", error);
    }
  };

  const occupiedBeds = beds.filter(b => b.status === 'Occupied');
  const availableBeds = beds.filter(b => b.status === 'Available' || b.status === 'Cleaning');

  // Find the selected patient for display
  const selectedPatient = selectedBed ? patients.find(p => p.mrn === selectedBed.current_patient_id) : null;
  const selectedPatientCharges = selectedPatient ? patientCharges.filter(c => c.patient_id === selectedPatient.mrn) : [];
  const selectedPatientNotes = selectedPatient ? nursingNotes.filter(n => n.patient_id === selectedPatient.mrn) : [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IPD Nursing Station</h1>
          <p className="text-gray-600">Manage in-patient care, assign beds, and log service charges.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <OccupiedBedList 
            beds={occupiedBeds}
            isLoading={isLoading}
            selectedBedId={selectedBed?.id}
            onSelectBed={setSelectedBed}
            onAssignBed={() => setShowAssignForm(true)} // Updated
          />
        </div>

        <div className="lg:col-span-2">
          {selectedBed && selectedPatient ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" /> Patient Details: {selectedPatient.first_name} {selectedPatient.last_name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">MRN:</p>
                    <p className="font-medium">{selectedPatient.mrn}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bed:</p>
                    <p className="font-medium">{selectedBed.bed_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Admission Date:</p>
                    <p className="font-medium">{selectedBed.admission_date ? new Date(selectedBed.admission_date).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  {/* Add more patient details as needed */}
                  <div className="col-span-2 flex flex-wrap gap-2 pt-4 border-t mt-4">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => { setSelectedBedForAction(selectedBed); setActiveAction('addCharge'); }}
                      className="flex items-center gap-1"
                    >
                      <Pill className="h-4 w-4" /> Add Charge
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => { setSelectedBedForAction(selectedBed); setActiveAction('addNote'); }}
                      className="flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4" /> Add Note
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => setDischargingBed(selectedBed)}
                      className="flex items-center gap-1"
                    >
                      <LogOut className="h-4 w-4" /> Discharge
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="charges">Daily Charges</TabsTrigger>
                  <TabsTrigger value="notes">Nursing Notes</TabsTrigger>
                </TabsList>
                <TabsContent value="charges">
                  <DailyChargesView 
                    charges={selectedPatientCharges} 
                    isLoading={isLoading} 
                    patient={selectedPatient}
                  />
                </TabsContent>
                <TabsContent value="notes">
                  <NursingNotesView 
                    notes={selectedPatientNotes} 
                    isLoading={isLoading} 
                    patient={selectedPatient}
                  />
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <Card className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <BedIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Patient Selected</h3>
                <p className="mt-1 text-sm text-gray-500">Select a patient from the list to view details.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {showAssignForm && ( // Changed from assigningBed
        <AssignPatientForm
          beds={availableBeds}
          patients={patients.filter(p => !occupiedBeds.some(b => b.current_patient_id === p.mrn))}
          onSubmit={handleAssignPatient}
          onCancel={() => setShowAssignForm(false)}
        />
      )}
      {dischargingBed && (
        <DischargeConfirmation
          bed={dischargingBed}
          onConfirm={handleDischargePatient} // Pass the handler directly
          onCancel={() => setDischargingBed(null)}
        />
      )}

      {activeAction === 'addCharge' && selectedBedForAction && (
        <AddChargeForm
          patient={patients.find(p => p.mrn === selectedBedForAction.current_patient_id)}
          bed={selectedBedForAction}
          inventory={inventory} // ADDED
          onAddCharge={handleAddCharge}
          onCancel={() => { setSelectedBedForAction(null); setActiveAction(null); }}
        />
      )}

      {activeAction === 'addNote' && selectedBedForAction && (
        <AddNoteForm
          patient={patients.find(p => p.mrn === selectedBedForAction.current_patient_id)}
          bed={selectedBedForAction}
          onAddNote={handleAddNote}
          onCancel={() => { setSelectedBedForAction(null); setActiveAction(null); }}
        />
      )}
    </div>
  );
}
