
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save, Plus, Trash2, Receipt } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function BillForm({ patients = [], onSubmit, onCancel, bill = null, isEditing = false }) {
  const [formData, setFormData] = useState({
    patient_id: bill?.patient_id || "",
    bill_type: bill?.bill_type || "OPD",
  });
  const [lineItems, setLineItems] = useState(
    bill?.line_items || [{ item_name: "", item_type: "Service", quantity: 1, price_per_unit: "" }]
  );

  const handleFormDataChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLineItemChange = (index, field, value) => {
    const newItems = [...lineItems];
    newItems[index][field] = value;
    // Ensure quantity and price_per_unit are treated as numbers for calculation
    const quantity = parseFloat(newItems[index].quantity) || 0;
    const price_per_unit = parseFloat(newItems[index].price_per_unit) || 0;
    newItems[index].total_price = quantity * price_per_unit;
    setLineItems(newItems);
  };

  const addLineItem = () => {
    setLineItems([...lineItems, { item_name: "", item_type: "Service", quantity: 1, price_per_unit: "" }]);
  };

  const removeLineItem = (index) => {
    const newItems = lineItems.filter((_, i) => i !== index);
    setLineItems(newItems);
  };

  const totalAmount = lineItems.reduce((sum, item) => sum + (item.total_price || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.patient_id) {
        alert("Please select a patient.");
        return;
    }
    const patient = patients.find(p => p.id === formData.patient_id);

    if (!patient) {
        alert("Selected patient not found.");
        return;
    }

    const billData = {
      patient_id: patient.mrn, // Store MRN as patient_id in bill
      patient_name: `${patient.first_name} ${patient.last_name}`,
      bill_date: bill?.bill_date || new Date().toISOString().split('T')[0],
      line_items: lineItems.map(item => ({
        ...item,
        quantity: parseFloat(item.quantity) || 0,
        price_per_unit: parseFloat(item.price_per_unit) || 0,
        total_price: (parseFloat(item.quantity) || 0) * (parseFloat(item.price_per_unit) || 0)
      })),
      total_amount: totalAmount,
      amount_due: totalAmount, // Initially, amount due is total amount
      payment_status: "Pending", // Default status
      bill_type: formData.bill_type,
    };
    
    // For edits, we need to pass the complete original bill structure with updates
    if(isEditing) {
        onSubmit({ ...bill, ...billData });
    } else {
        onSubmit(billData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isEditing ? "Edit Bill" : "Generate Manual Bill"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="patient">Select Patient *</Label>
              <Select 
                value={formData.patient_id} 
                onValueChange={(value) => handleFormDataChange('patient_id', value)} 
                disabled={isEditing}
              >
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Select a patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.first_name} {p.last_name} (MRN: {p.mrn})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="billType">Bill Type *</Label>
              <Select 
                value={formData.bill_type} 
                onValueChange={(value) => handleFormDataChange('bill_type', value)} 
                disabled={isEditing}
              >
                  <SelectTrigger id="billType"><SelectValue /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="OPD">OPD (Out-Patient)</SelectItem>
                      <SelectItem value="IPD">IPD (In-Patient)</SelectItem>
                  </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label>Line Items</Label>
              {lineItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-end p-3 bg-gray-50 rounded-lg">
                  <div className="flex-grow">
                    <Label className="text-xs">Item Name</Label>
                    <Input
                      value={item.item_name}
                      onChange={(e) => handleLineItemChange(index, "item_name", e.target.value)}
                      placeholder="e.g., Consultation Fee"
                      required
                    />
                  </div>
                   <div className="w-24">
                    <Label className="text-xs">Qty</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, "quantity", e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                  <div className="w-32">
                    <Label className="text-xs">Price/Unit (₹)</Label>
                    <Input
                      type="number"
                      value={item.price_per_unit}
                      onChange={(e) => handleLineItemChange(index, "price_per_unit", e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeLineItem(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addLineItem}>
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </div>
            
            <div className="text-right font-bold text-lg">
                Total Amount: ₹{totalAmount.toFixed(2)}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? "Save Changes" : "Add Charges to Bill"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
