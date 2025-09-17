import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Receipt, Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function QuickBillForm({ patient, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    patient_id: patient?.mrn || "",
    patient_name: patient ? `${patient.first_name} ${patient.last_name}` : "",
    bill_date: new Date().toISOString().split('T')[0],
    service_type: "OPD Consultation",
    consultation_fee: 500,
    lab_charges: 0,
    medication_charges: 0,
    procedure_charges: 0,
    other_charges: 0,
    discount_amount: 0,
    insurance_coverage: 0
  });

  const [services, setServices] = useState([
    { name: "OPD Consultation", amount: 500 }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const totalAmount = services.reduce((sum, service) => sum + service.amount, 0);
    const amountDue = totalAmount - formData.discount_amount - formData.insurance_coverage;
    
    const billData = {
      ...formData,
      total_amount: totalAmount,
      amount_due: Math.max(0, amountDue)
    };
    
    onSubmit(billData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addService = () => {
    setServices(prev => [...prev, { name: "", amount: 0 }]);
  };

  const updateService = (index, field, value) => {
    setServices(prev => prev.map((service, i) => 
      i === index ? { ...service, [field]: value } : service
    ));
  };

  const removeService = (index) => {
    if (services.length > 1) {
      setServices(prev => prev.filter((_, i) => i !== index));
    }
  };

  const totalAmount = services.reduce((sum, service) => sum + (parseFloat(service.amount) || 0), 0);
  const amountDue = totalAmount - (parseFloat(formData.discount_amount) || 0) - (parseFloat(formData.insurance_coverage) || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            <CardTitle>Generate Bill</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {/* Patient Info */}
          <div className="bg-emerald-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                {patient?.first_name?.charAt(0)}{patient?.last_name?.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold">{patient?.first_name} {patient?.last_name}</h3>
                <p className="text-sm text-gray-600">MRN: {patient?.mrn} | Age: {patient ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : 'N/A'}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bill_date">Bill Date</Label>
                <Input
                  id="bill_date"
                  type="date"
                  value={formData.bill_date}
                  onChange={(e) => handleChange("bill_date", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="service_type">Service Type</Label>
                <Select value={formData.service_type} onValueChange={(value) => handleChange("service_type", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OPD Consultation">OPD Consultation</SelectItem>
                    <SelectItem value="Laboratory">Laboratory</SelectItem>
                    <SelectItem value="Pharmacy">Pharmacy</SelectItem>
                    <SelectItem value="Emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Services */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-semibold">Services & Charges</Label>
                <Button type="button" variant="outline" size="sm" onClick={addService}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Service
                </Button>
              </div>
              <div className="space-y-3">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1">
                      <Input
                        placeholder="Service name"
                        value={service.name}
                        onChange={(e) => updateService(index, "name", e.target.value)}
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={service.amount}
                        onChange={(e) => updateService(index, "amount", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    {services.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeService(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Discounts and Insurance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discount_amount">Discount Amount</Label>
                <Input
                  id="discount_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount_amount}
                  onChange={(e) => handleChange("discount_amount", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="insurance_coverage">Insurance Coverage</Label>
                <Input
                  id="insurance_coverage"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.insurance_coverage}
                  onChange={(e) => handleChange("insurance_coverage", parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Bill Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Services:</span>
                  <span className="font-medium">₹{totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span className="font-medium text-red-600">-₹{(parseFloat(formData.discount_amount) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Insurance Coverage:</span>
                  <span className="font-medium text-green-600">-₹{(parseFloat(formData.insurance_coverage) || 0).toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Amount Due:</span>
                  <span>₹{Math.max(0, amountDue).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="w-4 h-4 mr-2" />
                Generate Bill
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}