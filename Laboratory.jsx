import React, { useState, useEffect, useCallback } from "react";
import { LabOrder } from "@/api/entities";
import { Patient } from "@/api/entities";
import { Employee } from "@/api/entities";
import { Department } from "@/api/entities";
import { LabTestCatalog } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Plus, Clock, CheckCircle, AlertCircle, Settings, Eye, Stethoscope } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import LabOrderForm from "../components/laboratory/LabOrderForm";
import LabStats from "../components/laboratory/LabStats";
import LabCatalogManager from "../components/laboratory/LabCatalogManager";
import LabDepartmentGrid from "../components/laboratory/LabDepartmentGrid";
import LabOrderViewList from "../components/laboratory/LabOrderViewList";

export default function Laboratory() {
  const [labOrders, setLabOrders] = useState([]);
  const [patients, setPatients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [labTestCatalog, setLabTestCatalog] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showCatalogManager, setShowCatalogManager] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("departments");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [orderData, patientData, empData, deptData, catalogData] = await Promise.all([
        LabOrder.list('-created_date'),
        Patient.list(),
        Employee.list(),
        Department.list(),
        LabTestCatalog.list()
      ]);
      setLabOrders(orderData);
      setPatients(patientData);
      setEmployees(empData);
      setDepartments(deptData);
      setLabTestCatalog(catalogData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateLabOrder = async (orderData) => {
    try {
      // Ensure proper integration of patient and doctor names
      const patient = patients.find(p => p.mrn === orderData.patient_id);
      const doctor = employees.find(emp => emp.employee_code === orderData.doctor_id);
      
      const integratedOrderData = {
        ...orderData,
        patient_name: patient ? `${patient.first_name} ${patient.last_name}` : orderData.patient_name,
        doctor_name: doctor ? `Dr. ${doctor.first_name} ${doctor.last_name}` : orderData.doctor_name,
        prescribed_by_department: doctor ? doctor.department_name : orderData.prescribed_by_department
      };
      
      await LabOrder.create(integratedOrderData);
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating lab order:', error);
    }
  };

  const orderedOrders = labOrders.filter(o => o.status === 'Ordered');
  const inProcessOrders = labOrders.filter(o => o.status === 'In Process');
  const completedOrders = labOrders.filter(o => o.status === 'Completed');

  const stats = {
    totalOrders: labOrders.length,
    orderedCount: orderedOrders.length,
    inProcessCount: inProcessOrders.length,
    completedCount: completedOrders.length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laboratory Management Hub</h1>
          <p className="text-gray-600">Central laboratory oversight - view departments, orders, and manage test catalog</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCatalogManager(true)}
            variant="outline"
            className="border-purple-600 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage Lab Catalog
          </Button>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Lab Order
          </Button>
        </div>
      </div>

      {/* Stats */}
      <LabStats stats={stats} />

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="departments">
            <FlaskConical className="w-4 h-4 mr-2" />
            Lab Departments
          </TabsTrigger>
          <TabsTrigger value="ordered">
            <AlertCircle className="w-4 h-4 mr-2" />
            Ordered ({orderedOrders.length})
          </TabsTrigger>
          <TabsTrigger value="in-process">
            <Clock className="w-4 h-4 mr-2" />
            In Process ({inProcessOrders.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle className="w-4 h-4 mr-2" />
            Completed ({completedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="departments">
          <LabDepartmentGrid
            labTestCatalog={labTestCatalog}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="ordered">
          <LabOrderViewList
            orders={orderedOrders}
            isLoading={isLoading}
            statusType="ordered"
            viewOnly={true}
          />
        </TabsContent>

        <TabsContent value="in-process">
          <LabOrderViewList
            orders={inProcessOrders}
            isLoading={isLoading}
            statusType="in-process"
            viewOnly={true}
          />
        </TabsContent>

        <TabsContent value="completed">
          <LabOrderViewList
            orders={completedOrders}
            isLoading={isLoading}
            statusType="completed"
            viewOnly={true}
          />
        </TabsContent>
      </Tabs>

      {/* Lab Order Form Modal */}
      {showForm && (
        <LabOrderForm
          patients={patients}
          doctors={employees.filter(emp => emp.role === 'Doctor')}
          departments={departments}
          labTestCatalog={labTestCatalog}
          onSubmit={handleCreateLabOrder}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Catalog Manager Modal */}
      {showCatalogManager && (
        <LabCatalogManager
          catalog={labTestCatalog}
          onClose={() => {
            setShowCatalogManager(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}