
import React, { useState, useEffect } from "react";
import { Inventory as InventoryEntity } from "@/api/entities";
import { InventoryHistory } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus, AlertTriangle, TrendingDown, Edit, Trash2, History } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import InventoryForm from "../components/inventory/InventoryForm";
import InventoryList from "../components/inventory/InventoryList";
import InventoryStats from "../components/inventory/InventoryStats";
import InventoryHistoryComponent from "../components/inventory/InventoryHistoryComponent";

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [inventoryHistory, setInventoryHistory] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("inventory");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [inventoryData, historyData] = await Promise.all([
        InventoryEntity.list('-created_date'),
        InventoryHistory.list('-created_date')
      ]);
      setInventory(inventoryData);
      setInventoryHistory(historyData);
    } catch (error) {
      console.error('Error loading inventory data:', error);
    }
    setIsLoading(false);
  };

  const handleCreateItem = async (itemData) => {
    try {
      const newItem = await InventoryEntity.create(itemData);
      
      // Create history entry
      await InventoryHistory.create({
        inventory_item_id: newItem.id,
        item_name: itemData.item_name,
        action_type: "Created",
        new_values: itemData,
        performed_by: "Current User", // TODO: Get actual user
        reason: "New inventory item created"
      });
      
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating inventory item:', error);
    }
  };

  const handleEditItem = async (itemData) => {
    if (!editingItem) return;
    
    try {
      await InventoryEntity.update(editingItem.id, itemData);
      
      // Create history entry
      await InventoryHistory.create({
        inventory_item_id: editingItem.id,
        item_name: itemData.item_name,
        action_type: "Updated",
        previous_values: editingItem,
        new_values: itemData,
        performed_by: "Current User", // TODO: Get actual user
        reason: "Inventory item updated"
      });
      
      setShowForm(false);
      setEditingItem(null);
      loadData();
    } catch (error) {
      console.error('Error updating inventory item:', error);
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    
    try {
      await InventoryEntity.delete(deletingItem.id);
      
      // Create history entry
      await InventoryHistory.create({
        inventory_item_id: deletingItem.id,
        item_name: deletingItem.item_name,
        action_type: "Deleted",
        previous_values: deletingItem,
        performed_by: "Current User", // TODO: Get actual user
        reason: "Inventory item deleted"
      });
      
      setDeletingItem(null);
      loadData();
    } catch (error) {
      console.error('Error deleting inventory item:', error);
    }
  };

  const handleStockUpdate = async (itemId, quantityChange, reason) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity_on_hand + quantityChange;
    if (newQuantity < 0) {
      alert("Cannot reduce stock below zero");
      return;
    }

    try {
      const updatedData = { 
        ...item, 
        quantity_on_hand: newQuantity,
        status: newQuantity <= item.minimum_stock_level ? "Low Stock" : 
                newQuantity === 0 ? "Out of Stock" : "In Stock"
      };
      
      await InventoryEntity.update(itemId, updatedData);
      
      // Create history entry
      await InventoryHistory.create({
        inventory_item_id: itemId,
        item_name: item.item_name,
        action_type: quantityChange > 0 ? "Stock Added" : "Stock Reduced",
        quantity_change: quantityChange,
        previous_values: { quantity_on_hand: item.quantity_on_hand },
        new_values: { quantity_on_hand: newQuantity },
        performed_by: "Current User", // TODO: Get actual user
        reason: reason || (quantityChange > 0 ? "Stock replenishment" : "Stock usage")
      });
      
      loadData();
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const categoryMatch = filterCategory === "all" || item.category === filterCategory;
    const statusMatch = filterStatus === "all" || item.status === filterStatus;
    return categoryMatch && statusMatch;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">Track and manage hospital inventory with complete audit trail</p>
        </div>
        <Button 
          onClick={() => {
            setShowForm(true);
            setEditingItem(null);
          }}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Inventory Item
        </Button>
      </div>

      {/* Stats */}
      <InventoryStats inventory={inventory} />

      {/* Tabs for Inventory and History */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="inventory">
            <Package className="w-4 h-4 mr-2" />
            Inventory Items
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            Inventory History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Medications">Medications</option>
                  <option value="Medical Supplies">Medical Supplies</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Consumables">Consumables</option>
                  <option value="Reagents">Reagents</option>
                  <option value="Surgical Instruments">Surgical Instruments</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Status</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low Stock">Low Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Inventory List */}
          <InventoryList
            inventory={filteredInventory}
            isLoading={isLoading}
            onRefresh={loadData}
            onEdit={(item) => {
              setEditingItem(item);
              setShowForm(true);
            }}
            onDelete={setDeletingItem}
            onStockUpdate={handleStockUpdate}
          />
        </TabsContent>

        <TabsContent value="history">
          <InventoryHistoryComponent 
            history={inventoryHistory}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Inventory Form Modal */}
      {showForm && (
        <InventoryForm
          onSubmit={editingItem ? handleEditItem : handleCreateItem}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          item={editingItem}
        />
      )}

      {/* Delete Confirmation */}
      {deletingItem && (
        <AlertDialog open onOpenChange={() => setDeletingItem(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Inventory Item</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingItem.item_name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteItem} className="bg-red-600 hover:bg-red-700">
                Delete Item
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
