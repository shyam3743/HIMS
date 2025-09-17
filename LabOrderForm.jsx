import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, FlaskConical, User, Stethoscope, Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LabOrderForm({ patients = [], doctors = [], departments = [], labTestCatalog = [], onSubmit, onCancel, order = null }) {
  const [formData, setFormData] = useState({
    patient_id: "",
    patient_name: "",
    doctor_id: "",
    doctor_name: "",
    prescribed_by_department: "",
    test_category: "",
    test_name: "",
    priority: "Routine",
    order_date: new Date().toISOString().split('T')[0],
    status: "Ordered",
    comments: "",
    test_cost: 0
  });
  const [availableTests, setAvailableTests] = useState([]);

  useEffect(() => {
    if (formData.test_category && labTestCatalog) {
      const selectedCat = labTestCatalog.find(cat => cat.category_name === formData.test_category);
      setAvailableTests(selectedCat ? selectedCat.tests : []);
    } else {
      setAvailableTests([]);
    }
  }, [formData.test_category, labTestCatalog]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.patient_id || !formData.doctor_id || !formData.test_category || !formData.test_name) {
      alert("Please fill all required fields");
      return;
    }
    
    onSubmit(formData);
  };

  const handlePatientSelect = (patientId) => {
    const selectedPatient = patients.find(p => p.mrn === patientId);
    if (selectedPatient) {
      setFormData(prev => ({
        ...prev,
        patient_id: selectedPatient.mrn,
        patient_name: `${selectedPatient.first_name} ${selectedPatient.last_name}`
      }));
    }
  };

  const handleDoctorSelect = (doctorId) => {
    const selectedDoctor = doctors.find(d => d.employee_code === doctorId);
    if (selectedDoctor) {
      setFormData(prev => ({
        ...prev,
        doctor_id: selectedDoctor.employee_code,
        doctor_name: `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name}`,
        prescribed_by_department: selectedDoctor.department_name
      }));
    }
  };

  // Get estimated cost based on test (you can enhance this with actual pricing)
  const getEstimatedCost = (testName) => {
    const costMap = {
      'ECG': 500,
      '2D Echo': 1500,
      'Stress Test': 2500,
      'Complete Blood Count': 300,
      'Blood Sugar': 150,
      'Lipid Profile': 800,
      'X-Ray Chest': 400,
      'CT Scan Brain': 3500,
      'MRI Spine': 8000,
      'Ultrasound Abdomen': 1200
    };
    return costMap[testName] || 500;
  };

  useEffect(() => {
    if (formData.test_name) {
      setFormData(prev => ({
        ...prev,
        test_cost: getEstimatedCost(formData.test_name)
      }));
    }
  }, [formData.test_name]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5" />
            <CardTitle>Create Lab Order</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Patient Selection */}
            <div>
              <Label htmlFor="patient">Select Patient *</Label>
              <Select value={formData.patient_id} onValueChange={handlePatientSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.mrn} value={patient.mrn}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {patient.first_name} {patient.last_name} ({patient.mrn})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Doctor Selection */}
            <div>
              <Label htmlFor="doctor">Ordering Physician *</Label>
              <Select value={formData.doctor_id} onValueChange={handleDoctorSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose ordering doctor..." />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.employee_code} value={doctor.employee_code}>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4" />
                        Dr. {doctor.first_name} {doctor.last_name} - {doctor.department_name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formData.prescribed_by_department && (
                <p className="text-xs text-gray-500 mt-1">
                  Department: {formData.prescribed_by_department}
                </p>
              )}
            </div>

            {/* Test Category and Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="test_category">Test Category *</Label>
                <Select 
                  value={formData.test_category} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, test_category: value, test_name: "" }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {labTestCatalog.map((category) => (
                      <SelectItem key={category.category_name} value={category.category_name}>
                        {category.category_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="test_name">Test Name *</Label>
                <Select 
                  value={formData.test_name}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, test_name: value }))}
                  disabled={!formData.test_category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Test" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTests.map((test) => (
                      <SelectItem key={test} value={test}>{test}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Priority and Cost */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Routine">Routine</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                    <SelectItem value="STAT">STAT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="order_date">Order Date</Label>
                <Input
                  id="order_date"
                  type="date"
                  value={formData.order_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, order_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="test_cost">Estimated Cost (₹)</Label>
                <Input
                  id="test_cost"
                  type="number"
                  value={formData.test_cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, test_cost: parseFloat(e.target.value) || 0 }))}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
            </div>

            {/* Comments */}
            <div>
              <Label htmlFor="comments">Clinical Notes</Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
                placeholder="Clinical indications, special instructions..."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                <Save className="w-4 h-4 mr-2" />
                Create Order
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}