
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Pill, Search, MapPin } from "lucide-react";

const getAge = (dob) => {
  if (!dob) return 'N/A';
  try {
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) { // Check for "Invalid Date"
      return 'N/A';
    }
    return new Date().getFullYear() - dobDate.getFullYear();
  } catch (e) {
    console.error("Error calculating age:", e);
    return 'N/A';
  }
}

export default function IPDPrescriptionForm({ patient, bed, inventory = [], onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    patient_id: patient?.mrn || "",
    patient_name: patient ? `${patient.first_name} ${patient.last_name}` : "",
    doctor_name: "",
    prescription_date: new Date().toISOString().split('T')[0],
    medication_name: "",
    dosage: "",
    frequency: "",
    duration: "",
    quantity: 1,
    instructions: ""
  });

  const [searchQuery, setSearchQuery] = useState("");
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
      if (formData.medication_name && value !== formData.medication_name) {
        setFormData(prev => ({...prev, medication_name: ''}));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleMedicationSelect = (med) => {
    setFormData(prev => ({ ...prev, medication_name: med.item_name }));
    setSearchQuery(med.item_name);
    setShowMedicationDropdown(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5" />
            <CardTitle>Prescribe Medication - IPD</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* Patient & Bed Info */}
          <div className="bg-indigo-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {patient?.first_name?.charAt(0)}{patient?.last_name?.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold">{patient?.first_name} {patient?.last_name}</h3>
                  <p className="text-sm text-gray-600">MRN: {patient?.mrn} | Age: {getAge(patient?.date_of_birth)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <div className="text-right">
                  <div className="font-medium">Bed {bed?.bed_number}</div>
                  <div className="text-sm text-gray-600">{bed?.ward_name}</div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="doctor_name">Prescribing Doctor</Label>
                <Input
                  id="doctor_name"
                  value={formData.doctor_name}
                  onChange={(e) => handleChange("doctor_name", e.target.value)}
                  placeholder="Doctor name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="prescription_date">Prescription Date</Label>
                <Input
                  id="prescription_date"
                  type="date"
                  value={formData.prescription_date}
                  onChange={(e) => handleChange("prescription_date", e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Medication Search */}
            <div className="relative">
              <Label htmlFor="medication_search">Medication</Label>
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={formData.dosage}
                  onChange={(e) => handleChange("dosage", e.target.value)}
                  placeholder="e.g., 500mg"
                  required
                />
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Input
                  id="frequency"
                  value={formData.frequency}
                  onChange={(e) => handleChange("frequency", e.target.value)}
                  placeholder="e.g., Twice daily"
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleChange("duration", e.target.value)}
                  placeholder="e.g., 7 days"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", parseInt(e.target.value))}
                required
              />
            </div>

            <div>
              <Label htmlFor="instructions">Instructions for IPD Administration</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => handleChange("instructions", e.target.value)}
                placeholder="Special instructions for nursing staff..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                <Save className="w-4 h-4 mr-2" />
                Create Prescription
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
