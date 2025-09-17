
import React, { useState, useEffect, useCallback } from "react";
import { Patient } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  Users, 
  Phone, 
  Mail, 
  Calendar,
  User,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2 // Added Trash2 icon
} from "lucide-react";
import { format } from "date-fns";
import { differenceInYears } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import PatientForm from "../components/patients/PatientForm";
import PatientDetails from "../components/patients/PatientDetails";
import PatientStats from "../components/patients/PatientStats";

// Safe date formatting function
const safeFormat = (dateString, formatString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return format(date, formatString);
  } catch (error) {
    return 'Invalid Date';
  }
};

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deletingPatient, setDeletingPatient] = useState(null); // New state for delete confirmation
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filterPatients = useCallback(() => {
    let filtered = patients;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.first_name?.toLowerCase().includes(query) ||
        patient.last_name?.toLowerCase().includes(query) ||
        patient.mrn?.toLowerCase().includes(query) ||
        patient.phone?.includes(query) ||
        patient.email?.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(patient => patient.status?.toLowerCase() === filterStatus);
    }

    setFilteredPatients(filtered);
  }, [patients, searchQuery, filterStatus]);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [filterPatients]);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const data = await Patient.list('-created_date');
      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
    setIsLoading(false);
  };

  const handleSavePatient = async (patientData) => {
    try {
      if (editingPatient) {
        await Patient.update(editingPatient.id, patientData);
      } else {
        const mrn = `MRN${Date.now()}`;
        await Patient.create({ ...patientData, mrn });
      }
      setShowForm(false);
      setEditingPatient(null);
      loadPatients();
    } catch (error) {
      console.error('Error saving patient:', error);
    }
  };

  const handleDeletePatient = async () => {
    if (!deletingPatient) return;
    try {
      await Patient.delete(deletingPatient.id);
      setDeletingPatient(null);
      loadPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  const handleEditPatient = (patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };
  
  const getPatientAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    try {
      const age = differenceInYears(new Date(), new Date(dateOfBirth));
      return isNaN(age) ? 'N/A' : age;
    } catch(e) {
      return 'N/A';
    }
  };

  const statusColors = {
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
    deceased: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-600">Manage patient records and information</p>
        </div>
        <Button 
          onClick={() => {
            setShowForm(true);
            setEditingPatient(null);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Patient
        </Button>
      </div>

      {/* Patient Statistics */}
      <PatientStats patients={patients} />

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              All Patients ({filteredPatients.length})
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full sm:w-64"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="deceased">Deceased</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || filterStatus !== "all" ? "No patients found" : "No patients yet"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || filterStatus !== "all" 
                  ? "Try adjusting your search or filter criteria."
                  : "Get started by adding your first patient."
                }
              </p>
              {!searchQuery && filterStatus === "all" && (
                <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Patient
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead>Patient</TableHead>
                    <TableHead>MRN</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Blood Group</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {patient.first_name} {patient.last_name}
                            </div>
                            {patient.email && (
                              <div className="text-sm text-gray-500">{patient.email}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {patient.mrn}
                        </code>
                      </TableCell>
                      <TableCell>{getPatientAge(patient.date_of_birth)} years</TableCell>
                      <TableCell>{patient.gender || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {patient.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3 text-gray-400" />
                              {patient.phone}
                            </div>
                          )}
                          {patient.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="w-3 h-3 text-gray-400" />
                              {patient.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {patient.blood_group ? (
                          <Badge variant="outline" className="bg-red-50 text-red-700">
                            {patient.blood_group}
                          </Badge>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={statusColors[patient.status?.toLowerCase()] || statusColors.active}
                        >
                          {patient.status || 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {safeFormat(patient.created_date, 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedPatient(patient)}
                            title="View Patient Details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditPatient(patient)}
                            title="Edit Patient"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => setDeletingPatient(patient)}
                            title="Delete Patient"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patient Form Modal */}
      {showForm && (
        <PatientForm
          onSubmit={handleSavePatient}
          onCancel={() => { setShowForm(false); setEditingPatient(null); }}
          patient={editingPatient}
        />
      )}

      {/* Patient Details Modal */}
      {selectedPatient && (
        <PatientDetails
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
          onEdit={handleEditPatient}
          onDelete={setDeletingPatient}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingPatient && (
        <AlertDialog open onOpenChange={() => setDeletingPatient(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the patient record for {deletingPatient.first_name} {deletingPatient.last_name}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeletePatient} className="bg-red-600 hover:bg-red-700">
                Yes, delete patient
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
