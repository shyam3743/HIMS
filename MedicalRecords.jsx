import React, { useState, useEffect } from "react";
import { MedicalRecord } from "@/api/entities";
import { Patient } from "@/api/entities";
import { Bed } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, User, Calendar, Stethoscope, FlaskConical, Pill, Building2 } from "lucide-react";

import UnifiedMedicalRecord from "../components/medical-records/UnifiedMedicalRecord";

export default function MedicalRecords() {
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [beds, setBeds] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  // Real-time search for patients
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const results = patients.filter(p => 
        (p.mrn && p.mrn.toLowerCase().includes(query)) ||
        (p.first_name && p.last_name && `${p.first_name} ${p.last_name}`.toLowerCase().includes(query)) ||
        (p.phone && p.phone.includes(query))
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, patients]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [recordData, patientData, bedData] = await Promise.all([
        MedicalRecord.list('-last_updated'),
        Patient.list(),
        Bed.list()
      ]);
      
      // Filter out any invalid records
      const validRecords = (recordData || []).filter(record => record && record.patient_id && record.patient_name);
      
      setMedicalRecords(validRecords);
      setPatients(patientData || []);
      setBeds(bedData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      // Set empty arrays to prevent crashes
      setMedicalRecords([]);
      setPatients([]);
      setBeds([]);
    }
    setIsLoading(false);
  };

  const handleSelectPatient = async (patient) => {
    if (!patient || !patient.mrn) {
      alert("Invalid patient data");
      return;
    }

    // Find existing medical record for this patient
    let record = medicalRecords.find(r => r.patient_id === patient.mrn);
    
    if (!record) {
      // Create new medical record for this patient
      const admittedBed = beds.find(bed => bed.current_patient_id === patient.mrn);
      
      const newRecordData = {
        patient_id: patient.mrn,
        patient_name: `${patient.first_name || ''} ${patient.last_name || ''}`.trim(),
        entries: [],
        current_status: admittedBed ? "IPD" : "OPD",
        admitted_date: admittedBed?.admission_date || null,
        bed_number: admittedBed?.bed_number || null,
        allergies: patient.allergies || "",
        chronic_conditions: patient.medical_history || "",
        last_updated: new Date().toISOString()
      };
      
      try {
        const newRecord = await MedicalRecord.create(newRecordData);
        setMedicalRecords([...medicalRecords, newRecord]);
        setSelectedRecord(newRecord);
      } catch (error) {
        console.error('Error creating medical record:', error);
        // Show the record anyway with local data
        setSelectedRecord(newRecordData);
      }
    } else {
      // Update current status if patient is now admitted
      const admittedBed = beds.find(bed => bed.current_patient_id === patient.mrn);
      if (admittedBed && record.current_status !== "IPD") {
        try {
          const updatedRecord = {
            ...record,
            current_status: "IPD",
            admitted_date: admittedBed.admission_date,
            bed_number: admittedBed.bed_number
          };
          await MedicalRecord.update(record.id, updatedRecord);
          setSelectedRecord(updatedRecord);
        } catch (error) {
          console.error('Error updating medical record:', error);
          setSelectedRecord(record);
        }
      } else {
        setSelectedRecord(record);
      }
    }
    
    setSearchQuery("");
    setSearchResults([]);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'IPD': return 'bg-red-100 text-red-800';
      case 'OPD': return 'bg-blue-100 text-blue-800';
      case 'Discharged': return 'bg-green-100 text-green-800';
      case 'Follow-up': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const safeFormatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Unified Medical Records</h1>
          <p className="text-gray-600">Complete patient medical history - automatically captured from all departments</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Patient Search & List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Find Patient Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by name, MRN, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h4 className="font-medium text-sm text-gray-700">Search Results:</h4>
                  {searchResults.map(patient => (
                    <div 
                      key={patient.id || patient.mrn}
                      onClick={() => handleSelectPatient(patient)}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-medium">{patient.first_name || ''} {patient.last_name || ''}</div>
                      <div className="text-sm text-gray-500">MRN: {patient.mrn || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{patient.phone || 'No phone'}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Active Medical Records */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-3">Recent Medical Records:</h4>
                {isLoading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : medicalRecords.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No medical records found</div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {medicalRecords.slice(0, 10).map(record => (
                      <div 
                        key={record.id || record.patient_id}
                        onClick={() => setSelectedRecord(record)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedRecord?.id === record.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-medium">{record.patient_name || 'Unknown Patient'}</div>
                          <Badge className={getStatusColor(record.current_status)}>
                            {record.current_status || 'N/A'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">MRN: {record.patient_id || 'N/A'}</div>
                        {record.current_status === 'IPD' && record.bed_number && (
                          <div className="text-sm text-blue-600">Bed: {record.bed_number}</div>
                        )}
                        <div className="text-xs text-gray-400">
                          {(record.entries && record.entries.length) || 0} entries • Updated: {safeFormatDate(record.last_updated)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Medical Record Details */}
        <div className="lg:col-span-2">
          <UnifiedMedicalRecord 
            record={selectedRecord}
            onRefresh={loadData}
          />
        </div>
      </div>
    </div>
  );
}