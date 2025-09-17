import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Package } from "lucide-react";

export default function InventoryForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    item_name: "",
    item_code: "",
    category: "",
    manufacturer: "",
    batch_number: "",
    expiry_date: "",
    quantity_on_hand: 0,
    minimum_stock_level: 0,
    unit_cost: 0,
    selling_price: 0,
    supplier: "",
    storage_location: "",
    status: "In Stock"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const itemCode = formData.item_code || `ITM${Date.now()}`;
    onSubmit({ ...formData, item_code: itemCode });
  };

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    
    // Auto-update status based on quantity
    if (field === 'quantity_on_hand' || field === 'minimum_stock_level') {
      const quantity = newData.quantity_on_hand;
      const minLevel = newData.minimum_stock_level;
      
      if (quantity === 0) {
        newData.status = "Out of Stock";
      } else if (quantity <= minLevel) {
        newData.status = "Low Stock";
      } else {
        newData.status = "In Stock";
      }
    }
    
    setFormData(newData);
  };

  const categories = [
    "Medications", "Medical Supplies", "Equipment", 
    "Consumables", "Reagents", "Surgical Instruments"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            <CardTitle>Add Inventory Item</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="item_name">Item Name *</Label>
                <Input
                  id="item_name"
                  value={formData.item_name}
                  onChange={(e) => handleChange("item_name", e.target.value)}
                  placeholder="e.g., Paracetamol 500mg"
                  required
                />
              </div>
              <div>
                <Label htmlFor="item_code">Item Code</Label>
                <Input
                  id="item_code"
                  value={formData.item_code}
                  onChange={(e) => handleChange("item_code", e.target.value)}
                  placeholder="Auto-generated if empty"
                />
              </div>
            </div>

            {/* Category and Manufacturer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => handleChange("manufacturer", e.target.value)}
                  placeholder="e.g., PharmaCorp"
                />
              </div>
            </div>

            {/* Batch and Expiry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="batch_number">Batch Number</Label>
                <Input
                  id="batch_number"
                  value={formData.batch_number}
                  onChange={(e) => handleChange("batch_number", e.target.value)}
                  placeholder="e.g., BT2024001"
                />
              </div>
              <div>
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => handleChange("expiry_date", e.target.value)}
                />
              </div>
            </div>

            {/* Quantity Management */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity_on_hand">Current Quantity *</Label>
                <Input
                  id="quantity_on_hand"
                  type="number"
                  value={formData.quantity_on_hand}
                  onChange={(e) => handleChange("quantity_on_hand", parseInt(e.target.value) || 0)}
                  min="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="minimum_stock_level">Minimum Stock Level *</Label>
                <Input
                  id="minimum_stock_level"
                  type="number"
                  value={formData.minimum_stock_level}
                  onChange={(e) => handleChange("minimum_stock_level", parseInt(e.target.value) || 0)}
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unit_cost">Unit Cost ($) *</Label>
                <Input
                  id="unit_cost"
                  type="number"
                  step="0.01"
                  value={formData.unit_cost}
                  onChange={(e) => handleChange("unit_cost", parseFloat(e.target.value) || 0)}
                  min="0"
                  required
                />
              </div>
              <div>
                <Label htmlFor="selling_price">Selling Price ($)</Label>
                <Input
                  id="selling_price"
                  type="number"
                  step="0.01"
                  value={formData.selling_price}
                  onChange={(e) => handleChange("selling_price", parseFloat(e.target.value) || 0)}
                  min="0"
                />
              </div>
            </div>

            {/* Supplier and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => handleChange("supplier", e.target.value)}
                  placeholder="e.g., MedSupply Co."
                />
              </div>
              <div>
                <Label htmlFor="storage_location">Storage Location</Label>
                <Input
                  id="storage_location"
                  value={formData.storage_location}
                  onChange={(e) => handleChange("storage_location", e.target.value)}
                  placeholder="e.g., Pharmacy - Shelf A1"
                />
              </div>
            </div>

            {/* Status Display */}
            <div>
              <Label>Current Status</Label>
              <div className={`mt-2 px-3 py-2 rounded-md border ${
                formData.status === 'In Stock' ? 'bg-green-50 border-green-200 text-green-800' :
                formData.status === 'Low Stock' ? 'bg-orange-50 border-orange-200 text-orange-800' :
                'bg-red-50 border-red-200 text-red-800'
              }`}>
                {formData.status}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
                <Save className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}