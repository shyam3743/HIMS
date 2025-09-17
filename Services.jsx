
import React, { useState, useEffect } from "react";
import { Service } from "@/api/entities";
import { Department } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Plus } from "lucide-react";
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

import ServiceForm from "../components/services/ServiceForm";
import ServiceList from "../components/services/ServiceList";
import ServiceStats from "../components/services/ServiceStats";

export default function Services() {
  const [services, setServices] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [deletingService, setDeletingService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [serviceData, deptData] = await Promise.all([
        Service.list('-created_date'),
        Department.list()
      ]);
      setServices(serviceData);
      setDepartments(deptData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  const handleSaveService = async (serviceData) => {
    try {
      if (editingService) {
        await Service.update(editingService.id, serviceData);
      } else {
        const serviceCode = serviceData.service_code || `SRV${Date.now()}`;
        await Service.create({ ...serviceData, service_code: serviceCode });
      }
      setShowForm(false);
      setEditingService(null);
      loadData();
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const handleDeleteService = async () => {
    if (!deletingService) return;
    try {
      await Service.delete(deletingService.id);
      setDeletingService(null);
      loadData();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const filteredServices = services.filter(service => 
    filterCategory === "all" || service.category === filterCategory
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
          <p className="text-gray-600">Manage hospital services and pricing</p>
        </div>
        <Button 
          onClick={() => {
            setEditingService(null);
            setShowForm(true);
          }}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Stats */}
      <ServiceStats services={services} />

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Categories</option>
            <option value="Consultation">Consultation</option>
            <option value="Investigation">Investigation</option>
            <option value="Procedure">Procedure</option>
            <option value="Surgery">Surgery</option>
            <option value="Room Charges">Room Charges</option>
            <option value="Medication">Medication</option>
            <option value="Equipment">Equipment</option>
            <option value="Other">Other</option>
          </select>
        </CardContent>
      </Card>

      {/* Service List */}
      <ServiceList
        services={filteredServices}
        isLoading={isLoading}
        onRefresh={loadData}
        onEdit={handleEdit}
        onDelete={setDeletingService}
      />

      {/* Service Form Modal */}
      {showForm && (
        <ServiceForm
          departments={departments}
          onSubmit={handleSaveService}
          onCancel={() => {
            setShowForm(false);
            setEditingService(null);
          }}
          service={editingService}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingService && (
        <AlertDialog open onOpenChange={() => setDeletingService(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the service "{deletingService.service_name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteService} className="bg-red-600 hover:bg-red-700">
                Yes, delete service
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
