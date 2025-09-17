
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save, Search, AlertTriangle, Package } from "lucide-react";
import { format } from "date-fns"; // Added for potential date formatting, though not directly used in this form's scope

export default function PrescriptionForm({ patients = [], inventory = [], onSubmit, onCancel, prescription = null }) {
  const [formData, setFormData] = useState(() => {
    const initialPatientId = prescription?.patient_id || "";
    const initialPatientName = prescription?.patient_name || "";

    // If no prescription and only one patient, pre-select them for convenience
    // This logic was previously in the initial state for native select, adapting it for Select component initial state
    const autoSelectedPatient = !prescription && patients.length === 1 ? patients[0] : null;

    return {
      patient_id: initialPatientId || (autoSelectedPatient ? autoSelectedPatient.mrn : ""),
      patient_name: initialPatientName || (autoSelectedPatient ? `${autoSelectedPatient.first_name} ${autoSelectedPatient.last_name}` : ""),
      doctor_name: prescription?.doctor_name || "",
      prescription_date: prescription?.prescription_date || new Date().toISOString().split('T')[0],
      medication_name: prescription?.medication_name || "",
      dosage: prescription?.dosage || "",
      frequency: prescription?.frequency || "",
      duration: prescription?.duration || "",
      quantity: prescription?.quantity || 1,
      instructions: prescription?.instructions || ""
    };
  });

  const [searchQuery, setSearchQuery] = useState(formData.medication_name || "");
  const [filteredMeds, setFilteredMeds] = useState([]);
  const [showMedicationDropdown, setShowMedicationDropdown] = useState(false);

  useEffect(() => {
    if (searchQuery.trim() && searchQuery !== formData.medication_name && Array.isArray(inventory)) {
      const filtered = inventory.filter(item =>
        item.category === "Medications" &&
        item.item_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMeds(filtered.slice(0, 5));
      setShowMedicationDropdown(true);
    } else {
      setShowMedicationDropdown(false);
    }
  }, [searchQuery, inventory, formData.medication_name]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    if (field === 'medication_search_query') {
      setSearchQuery(value);
      // Clear medication_name if search query changes and doesn't match current medication_name
      if (formData.medication_name && value !== formData.medication_name) {
        setFormData(prev => ({...prev, medication_name: ''}));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };
  
  const handleMedicationSelect = (med) => {
    setFormData(prev => ({ ...prev, medication_name: med.item_name }));
    setSearchQuery(med.item_name); // Set search query to selected medication name
    setShowMedicationDropdown(false);
  };

  // Safe check for inventory
  const lowStockItems = Array.isArray(inventory) ? inventory.filter(item => item.status === "Low Stock" || item.status === "Out of Stock") : [];
  const expiringItems = Array.isArray(inventory) ? inventory.filter(item => {
    if (!item.expiry_date) return false;
    const expiryDate = new Date(item.expiry_date);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiryDate <= threeMonthsFromNow;
  }) : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            <CardTitle>{prescription ? "Edit Prescription" : "New Prescription"}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* Alerts */}
          {(lowStockItems.length > 0 || expiringItems.length > 0) && (
            <div className="space-y-2 mb-4">
              {lowStockItems.length > 0 && (
                <div className="p-3 rounded-md bg-orange-50 border border-orange-200 flex items-center gap-2 text-sm text-orange-800">
                  <AlertTriangle className="w-4 h-4" />
                  {lowStockItems.length} medication(s) are low on stock.
                </div>
              )}
              {expiringItems.length > 0 && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-800">
                  <AlertTriangle className="w-4 h-4" />
                  {expiringItems.length} medication(s) are expiring soon.
                </div>
              )}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Patient Selection */}
            <div>
              <Label htmlFor="patient">Patient *</Label>
              <Select
                value={formData.patient_id}
                onValueChange={(mrn) => {
                  const selectedPatient = patients.find(p => p.mrn === mrn);
                  if (selectedPatient) {
                    setFormData(prev => ({
                      ...prev,
                      patient_id: selectedPatient.mrn,
                      patient_name: `${selectedPatient.first_name} ${selectedPatient.last_name}`
                    }));
                  } else {
                    setFormData(prev => ({ ...prev, patient_id: '', patient_name: '' }));
                  }
                }}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Patient">
                    {formData.patient_name ? formData.patient_name + (formData.patient_id ? ` (${formData.patient_id})` : '') : "Select Patient"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.mrn}>
                      {p.first_name} {p.last_name} ({p.mrn})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Prescribing Doctor */}
            <div>
              <Label htmlFor="doctor_name">Prescribing Doctor *</Label>
              <Input
                id="doctor_name"
                value={formData.doctor_name}
                onChange={(e) => handleChange("doctor_name", e.target.value)}
                placeholder="Dr. John Doe"
                required
              />
            </div>
            
            {/* Medication Search */}
            <div className="relative">
              <Label htmlFor="medication_search">Medication *</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="medication_search"
                  value={searchQuery}
                  onChange={(e) => handleChange('medication_search_query', e.target.value)}
                  placeholder="Search for medication from inventory..."
                  className="pl-9"
                  autoComplete="off"
                  required
                />
              </div>
              {showMedicationDropdown && filteredMeds.length > 0 && (
                <div className="absolute z-10 w-full bg-white border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                  {filteredMeds.map(med => (
                    <div 
                      key={med.id} 
                      onClick={() => handleMedicationSelect(med)}
                      className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    >
                      <div className="font-medium">{med.item_name}</div>
                      <div className="text-sm text-gray-500">In Stock: {med.quantity_on_hand}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Dosage & Frequency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dosage">Dosage *</Label>
                <Input id="dosage" value={formData.dosage} onChange={(e) => handleChange("dosage", e.target.value)} placeholder="e.g., 500mg" required />
              </div>
              <div>
                <Label htmlFor="frequency">Frequency *</Label>
                <Input id="frequency" value={formData.frequency} onChange={(e) => handleChange("frequency", e.target.value)} placeholder="e.g., Twice daily" required />
              </div>
            </div>
            
            {/* Duration & Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input id="duration" value={formData.duration} onChange={(e) => handleChange("duration", e.target.value)} placeholder="e.g., 7 days" />
              </div>
              <div>
                <Label htmlFor="quantity">Quantity *</Label>
                <Input id="quantity" type="number" value={formData.quantity} onChange={(e) => handleChange("quantity", e.target.value)} required min="1" />
              </div>
            </div>
            
            {/* Instructions */}
            <div>
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea id="instructions" value={formData.instructions} onChange={(e) => handleChange("instructions", e.target.value)} placeholder="e.g., Take after meals" />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                {prescription ? "Update Prescription" : "Save Prescription"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
