import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, FlaskConical } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function QuickLabOrderForm({ patient, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    patient_id: patient?.mrn || "",
    patient_name: patient ? `${patient.first_name} ${patient.last_name}` : "",
    doctor_name: "",
    test_category: "",
    test_name: "",
    priority: "Routine",
    order_date: new Date().toISOString().split('T')[0],
    comments: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const testCategories = {
    "Blood Test": ["Complete Blood Count (CBC)", "Blood Sugar", "Lipid Profile", "Liver Function Test", "Kidney Function Test"],
    "Urine Test": ["Routine Urine Examination", "Urine Culture", "24-hour Urine Protein"],
    "Radiology": ["X-Ray Chest", "X-Ray Abdomen", "CT Scan", "MRI", "Ultrasound"],
    "Pathology": ["Biopsy", "Cytology", "Histopathology"],
    "Microbiology": ["Blood Culture", "Sputum Culture", "Stool Culture"],
    "Biochemistry": ["Electrolytes", "Cardiac Enzymes", "Tumor Markers"],
    "Cardiology": ["ECG", "Echo Cardiogram", "Stress Test"]
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5" />
            <CardTitle>Quick Lab Order</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* Patient Info */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {patient?.first_name?.charAt(0)}{patient?.last_name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold">{patient?.first_name} {patient?.last_name}</h3>
                <p className="text-sm text-gray-600">MRN: {patient?.mrn} | Age: {patient ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : 'N/A'}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="doctor_name">Ordering Doctor</Label>
                <Input
                  id="doctor_name"
                  value={formData.doctor_name}
                  onChange={(e) => handleChange("doctor_name", e.target.value)}
                  placeholder="Doctor name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleChange("priority", value)}>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="test_category">Test Category</Label>
                <Select 
                  value={formData.test_category} 
                  onValueChange={(value) => {
                    handleChange("test_category", value);
                    handleChange("test_name", ""); // Reset test name when category changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(testCategories).map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="test_name">Specific Test</Label>
                <Select 
                  value={formData.test_name} 
                  onValueChange={(value) => handleChange("test_name", value)}
                  disabled={!formData.test_category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select test" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.test_category && testCategories[formData.test_category]?.map(test => (
                      <SelectItem key={test} value={test}>{test}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="order_date">Order Date</Label>
              <Input
                id="order_date"
                type="date"
                value={formData.order_date}
                onChange={(e) => handleChange("order_date", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="comments">Comments/Instructions</Label>
              <Textarea
                id="comments"
                value={formData.comments}
                onChange={(e) => handleChange("comments", e.target.value)}
                placeholder="Special instructions or clinical notes..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                <Save className="w-4 h-4 mr-2" />
                Order Lab Test
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}