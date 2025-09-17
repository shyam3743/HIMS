import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save, Pill } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AddChargeForm({ patient, bed, inventory = [], onAddCharge, onCancel }) {
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customItemName, setCustomItemName] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [itemType, setItemType] = useState("Medication");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let pricePerUnit;
    let itemName;

    if (selectedItem === "custom") {
      itemName = customItemName;
      pricePerUnit = parseFloat(customPrice);
      
      if (!itemName || !pricePerUnit || pricePerUnit <= 0) {
        alert("Please enter valid item name and price");
        return;
      }
    } else {
      const item = inventory.find(i => i.id === selectedItem);
      if (!item) {
        alert("Please select an item");
        return;
      }
      itemName = item.item_name;
      pricePerUnit = item.selling_price || item.unit_cost || 0;
    }

    if (quantity <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    const chargeData = {
      item_id: selectedItem === "custom" ? `custom-${Date.now()}` : selectedItem,
      item_name: itemName,
      item_type: itemType,
      quantity: parseInt(quantity),
      price_per_unit: pricePerUnit,
      total_price: pricePerUnit * parseInt(quantity),
      is_billed: false
    };

    onAddCharge(chargeData);
  };

  const availableItems = inventory.filter(item => 
    item.quantity_on_hand > 0 && 
    item.status === 'In Stock' &&
    (item.category === 'Medications' || item.category === 'Medical Supplies' || item.category === 'Equipment')
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5" />
            <CardTitle>Add Patient Charge</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900">Patient: {patient.first_name} {patient.last_name}</h3>
            <p className="text-sm text-blue-700">MRN: {patient.mrn}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="item_type">Item Type</Label>
              <Select value={itemType} onValueChange={setItemType}>
                <SelectTrigger id="item_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medication">Medication</SelectItem>
                  <SelectItem value="Supply">Medical Supply</SelectItem>
                  <SelectItem value="Equipment">Equipment Usage</SelectItem>
                  <SelectItem value="Service">Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="item">Select Item</Label>
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger id="item">
                  <SelectValue placeholder="Choose from inventory or add custom item" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">+ Add Custom Item</SelectItem>
                  {availableItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.item_name} - ₹{item.selling_price?.toFixed(2) || item.unit_cost?.toFixed(2) || '0.00'} (Stock: {item.quantity_on_hand})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedItem === "custom" && (
              <>
                <div>
                  <Label htmlFor="custom_item_name">Custom Item Name *</Label>
                  <Input
                    id="custom_item_name"
                    value={customItemName}
                    onChange={(e) => setCustomItemName(e.target.value)}
                    placeholder="Enter item name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="custom_price">Price per Unit (₹) *</Label>
                  <Input
                    id="custom_price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>

            {selectedItem && selectedItem !== "custom" && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm space-y-1">
                  <div>Item: {inventory.find(i => i.id === selectedItem)?.item_name}</div>
                  <div>Price per unit: ₹{(inventory.find(i => i.id === selectedItem)?.selling_price || inventory.find(i => i.id === selectedItem)?.unit_cost || 0).toFixed(2)}</div>
                  <div className="font-medium">Total: ₹{((inventory.find(i => i.id === selectedItem)?.selling_price || inventory.find(i => i.id === selectedItem)?.unit_cost || 0) * quantity).toFixed(2)}</div>
                </div>
              </div>
            )}

            {selectedItem === "custom" && customPrice && quantity && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm space-y-1">
                  <div>Custom Item: {customItemName}</div>
                  <div>Price per unit: ₹{parseFloat(customPrice || 0).toFixed(2)}</div>
                  <div className="font-medium">Total: ₹{(parseFloat(customPrice || 0) * parseInt(quantity || 0)).toFixed(2)}</div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Add Charge
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}