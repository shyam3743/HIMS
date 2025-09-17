
import React, { useState, useEffect } from "react";
import { Patient } from "@/api/entities";
import { MedicalRecord } from "@/api/entities";
import { Department } from "@/api/entities";
import { Appointment } from "@/api/entities"; // Added Appointment import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, Plus, FileText, ArrowRight, X, Send } from "lucide-react"; // Added Send icon
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription, // Added DialogDescription
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import PatientForm from "../components/patients/PatientForm";
import DemographicRecordForm from "../components/demographic/DemographicRecordForm";
import { MedicalRecordLogger } from "../components/medical-records/MedicalRecordLogger";

export default function Demographic() {
  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showDemographicForm, setShowDemographicForm] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralDept, setReferralDept] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  // Real-time search as user types
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setIsSearching(true);
      const query = searchQuery.toLowerCase();
      const results = patients.filter(p => 
        p.mrn?.toLowerCase().includes(query) ||
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(query) ||
        p.phone?.includes(query) ||
        p.email?.toLowerCase().includes(query)
      );
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, patients]);

  const loadInitialData = async () => {
    const [patientData, deptData] = await Promise.all([Patient.list(), Department.list()]);
    setPatients(patientData);
    // Filter for departments that have OPD and are Active
    setDepartments(deptData.filter(d => d.has_opd && d.status === 'Active'));
  };
  
  const handleCreatePatient = async (patientData) => {
    try {
      const mrn = `MRN${Date.now()}`;
      const newPatient = await Patient.create({ ...patientData, mrn });
      setShowPatientForm(false);
      await loadInitialData();
      setSelectedPatient(newPatient);
      setSearchQuery(`${newPatient.first_name} ${newPatient.last_name}`);
    } catch(error) {
      console.error("Error creating patient:", error);
    }
  };

  const handleCreateDemographicRecord = async (recordData) => {
    try {
      // Auto-log to medical record
      await MedicalRecordLogger.logDemographics(
        selectedPatient.mrn,
        `${selectedPatient.first_name} ${selectedPatient.last_name}`,
        recordData
      );

      alert(`Demographic record created for ${selectedPatient.first_name} ${selectedPatient.last_name}.`);
      setShowDemographicForm(false);
      setSelectedPatient(null);
      setSearchQuery("");
    } catch(error) {
      console.error("Error creating demographic record:", error);
      alert("Failed to create demographic record.");
    }
  };

  const handleReferToPreOPD = async () => {
    if(!selectedPatient) {
      alert("Please select a patient first.");
      return;
    }
    try {
      await Appointment.create({
        patient_id: selectedPatient.mrn,
        patient_name: `${selectedPatient.first_name} ${selectedPatient.last_name}`,
        department: "Pre-OPD",
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        status: "Pre-OPD", // FIXED: Changed from "Checked-in" to "Pre-OPD"
        appointment_type: "OPD"
      });
      alert(`Patient ${selectedPatient.first_name} ${selectedPatient.last_name} referred to Pre OPD successfully.`);
      setSelectedPatient(null);
      setSearchQuery("");
    } catch(error) {
      console.error("Error referring patient to Pre-OPD:", error);
      alert("Failed to refer patient. Please try again.");
    }
  };

  const handleReferToOPD = async () => {
    if (!selectedPatient || !referralDept) {
      alert("Please select a patient and a department.");
      return;
    }
    try {
      await Appointment.create({
        patient_id: selectedPatient.mrn,
        patient_name: `${selectedPatient.first_name} ${selectedPatient.last_name}`,
        department: referralDept,
        appointment_date: new Date().toISOString().split('T')[0],
        appointment_time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        status: "Scheduled", // Goes into waiting queue for the selected department
        appointment_type: "OPD"
      });
      alert(`Patient ${selectedPatient.first_name} referred to ${referralDept} OPD.`);
      setShowReferralModal(false);
      setReferralDept("");
      setSelectedPatient(null);
      setSearchQuery("");
    } catch (error) {
      console.error(`Error referring patient to ${referralDept} OPD:`, error);
      alert("Failed to refer patient. Please try again.");
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Demographic & Initial Assessment</h1>
          <p className="text-gray-600">Search for existing patients or register new ones and capture initial assessment</p>
        </div>
        <Button onClick={() => setShowPatientForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Register New Patient
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Find Patient Record
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, MRN, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-lg py-3"
            />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Search Results:</h4>
              <div className="grid gap-3">
                {searchResults.map(patient => (
                  <div 
                    key={patient.id}
                    onClick={() => {
                      setSelectedPatient(patient);
                      setSearchResults([]);
                    }}
                    className="p-4 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-lg">{patient.first_name} {patient.last_name}</div>
                        <div className="text-sm text-gray-500">MRN: {patient.mrn}</div>
                        <div className="text-sm text-gray-500">Phone: {patient.phone}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">DOB: {patient.date_of_birth}</div>
                        <div className="text-sm text-gray-500">Gender: {patient.gender}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Patient Actions */}
          {selectedPatient && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-3">
                Selected Patient: {selectedPatient.first_name} {selectedPatient.last_name}
              </h4>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={() => setShowDemographicForm(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Add Demographic Record
                </Button>
                <Button 
                  onClick={handleReferToPreOPD}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Refer to Pre OPD
                </Button>
                <Button 
                  onClick={() => setShowReferralModal(true)}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Refer to OPD Department
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Registration Form */}
      {showPatientForm && (
        <PatientForm
          onSubmit={handleCreatePatient}
          onCancel={() => setShowPatientForm(false)}
        />
      )}

      {/* Demographic Record Form */}
      {showDemographicForm && selectedPatient && (
        <DemographicRecordForm
          patient={selectedPatient}
          onSubmit={handleCreateDemographicRecord}
          onCancel={() => setShowDemographicForm(false)}
        />
      )}

      {/* Refer to OPD Modal */}
      <Dialog open={showReferralModal} onOpenChange={setShowReferralModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refer Patient to OPD</DialogTitle>
            <DialogDescription>
              Select a department to refer {selectedPatient?.first_name} {selectedPatient?.last_name} to. The patient will be added to the department's waiting queue.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select onValueChange={setReferralDept} value={referralDept}>
              <SelectTrigger>
                <SelectValue placeholder="Select a department..." />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.name}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReferralModal(false)}>Cancel</Button>
            <Button onClick={handleReferToOPD} disabled={!referralDept}>
              <Send className="w-4 h-4 mr-2" />
              Refer Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
