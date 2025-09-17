
import React, { useState, useEffect } from "react";
import { Bed } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bed as BedIcon, Plus, Users, MapPin, Edit, Settings } from "lucide-react";
import { differenceInDays, parseISO } from 'date-fns';

import BedForm from "../components/bed-management/BedForm";
import BedGrid from "../components/bed-management/BedGrid";
import BedStats from "../components/bed-management/BedStats";
import WardTypeManager from "../components/bed-management/WardTypeManager"; // New Component

export default function BedManagement() {
  const [beds, setBeds] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBed, setEditingBed] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterWard, setFilterWard] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showWardManager, setShowWardManager] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const bedData = await Bed.list();
      setBeds(bedData);
    } catch (error) {
      console.error('Error loading bed data:', error);
    }
    setIsLoading(false);
  };

  const handleSaveBed = async (bedData) => {
    try {
      if (editingBed) {
        await Bed.update(editingBed.id, bedData);
      } else {
        await Bed.create(bedData);
      }
      setShowForm(false);
      setEditingBed(null);
      loadData();
    } catch (error) {
      console.error('Error saving bed:', error);
    }
  };

  const handleEditBed = (bed) => {
    setEditingBed(bed);
    setShowForm(true);
  };

  const handleStatusUpdate = async (bed, newStatus) => {
    if (newStatus === "Occupied") {
        alert("Please assign patients through the IPD Nursing Station to set status to 'Occupied'.");
        return;
    }
    try {
        await Bed.update(bed.id, { status: newStatus });
        loadData();
    } catch (error) {
        console.error("Error updating bed status:", error);
    }
  };

  const filteredBeds = beds.filter(bed => {
    const wardMatch = filterWard === "all" || bed.ward_name === filterWard;
    const statusMatch = filterStatus === "all" || bed.status === filterStatus;
    return wardMatch && statusMatch;
  });

  const uniqueWards = [...new Set(beds.map(b => b.ward_name))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">IPD Bed Management</h1>
          <p className="text-gray-600">Monitor and manage hospital bed inventory and settings</p>
        </div>
        <div className="flex gap-2">
           <Button 
            onClick={() => { setShowForm(true); setEditingBed(null); }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Bed
          </Button>
          <Button 
            onClick={() => setShowWardManager(true)}
            variant="outline"
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage Wards & Types
          </Button>
        </div>
      </div>

      <BedStats beds={beds} />

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <select
              value={filterWard}
              onChange={(e) => setFilterWard(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Wards</option>
              {uniqueWards.map(ward => (
                <option key={ward} value={ward}>{ward}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Reserved">Reserved</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <BedGrid
        beds={filteredBeds}
        isLoading={isLoading}
        onRefresh={loadData}
        onEdit={handleEditBed}
        onStatusUpdate={handleStatusUpdate}
      />

      {showForm && (
        <BedForm
          onSubmit={handleSaveBed}
          onCancel={() => { setShowForm(false); setEditingBed(null); }}
          bed={editingBed}
        />
      )}
      
      {showWardManager && (
          <WardTypeManager
              onClose={() => setShowWardManager(false)}
          />
      )}
    </div>
  );
}
