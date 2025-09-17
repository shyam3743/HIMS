
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Save, Plus, Trash2, Package, AlertTriangle, CheckCircle } from "lucide-react";

export default function DispenseForm({ prescription, inventory = [], onClose, onSubmit }) {
  const [dispensedItems, setDispensedItems] = useState([]);
  const [selectedMedication, setSelectedMedication] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [pricePerUnit, setPricePerUnit] = useState(0);

  // Find available medications from inventory
  const availableMedications = Array.isArray(inventory) ? inventory.filter(item => 
    item.category === "Medications" && 
    item.status !== "Out of Stock" &&
    item.quantity_on_hand > 0
  ) : [];

  useEffect(() => {
    // Auto-populate from prescription
    const inventoryItem = inventory.find(i => i.item_name.toLowerCase() === prescription.medication_name.toLowerCase());
    const initialItem = {
      item_id: inventoryItem?.id || prescription.medication_name,
      item_name: prescription.medication_name,
      item_type: 'Medication',
      quantity: prescription.quantity || 1,
      price_per_unit: inventoryItem?.selling_price || 0,
      total_price: (prescription.quantity || 1) * (inventoryItem?.selling_price || 0),
    };
    setDispensedItems([initialItem]);
  }, [prescription, inventory]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...dispensedItems];
    updatedItems[index][field] = value;
    
    if(field === 'quantity' || field === 'price_per_unit') {
        updatedItems[index].total_price = (updatedItems[index].quantity || 0) * (updatedItems[index].price_per_unit || 0);
    }
    
    setDispensedItems(updatedItems);
  };
  
  const handleAddItem = () => {
    setDispensedItems([...dispensedItems, { item_id: '', item_name: '', item_type: 'Medication', quantity: 1, price_per_unit: 0, total_price: 0 }]);
  };
  
  const handleRemoveItem = (index) => {
    setDispensedItems(dispensedItems.filter((_, i) => i !== index));
  };

  const grandTotal = dispensedItems.reduce((sum, item) => sum + item.total_price, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(prescription, dispensedItems);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Dispense & Bill for {prescription.patient_name}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {dispensedItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-end p-2 border rounded-lg">
                  <div className="col-span-4">
                    <Label>Medication</Label>
                    <Input value={item.item_name} onChange={(e) => handleItemChange(index, 'item_name', e.target.value)} />
                  </div>
                  <div className="col-span-2">
                    <Label>Quantity</Label>
                    <Input type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))} />
                  </div>
                  <div className="col-span-2">
                    <Label>Unit Price (₹)</Label>
                    <Input type="number" value={item.price_per_unit} onChange={(e) => handleItemChange(index, 'price_per_unit', parseFloat(e.target.value))} />
                  </div>
                  <div className="col-span-3">
                    <Label>Total (₹)</Label>
                    <Input type="number" value={item.total_price.toFixed(2)} readOnly className="bg-gray-100" />
                  </div>
                  <div className="col-span-1">
                    <Button variant="destructive" size="icon" onClick={() => handleRemoveItem(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" size="sm" onClick={handleAddItem}>
              <Plus className="w-4 h-4 mr-2" /> Add another item
            </Button>
            
            <div className="flex justify-end items-center pt-6 border-t mt-6">
                <div className="text-right">
                    <p className="text-gray-500">Grand Total</p>
                    <p className="text-2xl font-bold">₹{grandTotal.toFixed(2)}</p>
                </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" /> Create Bill
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
