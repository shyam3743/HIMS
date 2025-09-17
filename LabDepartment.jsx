
import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { LabOrder } from "@/api/entities";
import { Bill } from "@/api/entities";
import { MedicalRecord } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlaskConical, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import LabOrderList from "../components/laboratory/LabOrderList";
import LabReportUpload from "../components/laboratory/LabReportUpload";

export default function LabDepartment() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const departmentCategory = searchParams.get('category');

  const [labOrders, setLabOrders] = useState([]);
  const [showReportUpload, setShowReportUpload] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ordered");

  const loadData = useCallback(async () => {
    if (!departmentCategory) return; // Guard clause for when departmentCategory is not yet available
    setIsLoading(true);
    try {
      const orderData = await LabOrder.filter({ test_category: departmentCategory }, '-created_date');
      setLabOrders(orderData);
    } catch (error) {
      console.error(`Error loading data for ${departmentCategory} lab:`, error);
    }
    setIsLoading(false);
  }, [departmentCategory]); // Dependency array for useCallback

  useEffect(() => {
    // This effect runs when loadData changes (which means departmentCategory has changed)
    loadData();
  }, [loadData]); // Now depends on loadData, which itself depends on departmentCategory

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const order = labOrders.find(o => o.id === orderId);
      if (!order) return;

      const updateData = { 
        status: newStatus,
        ...(newStatus === 'In Process' && { process_date: new Date().toISOString() }),
        ...(newStatus === 'Completed' && { completed_date: new Date().toISOString(), test_cost: order.test_cost || 500 })
      };

      await LabOrder.update(orderId, updateData);

      if (newStatus === 'Completed') {
        await handleCompleteLabOrder({ ...order, ...updateData });
      }

      loadData();
    } catch (error) {
      console.error('Error updating lab order status:', error);
    }
  };

  const handleCompleteLabOrder = async (order) => {
    try {
      // Create billing entry
      if (!order.is_billed) {
        await Bill.create({
          patient_id: order.patient_id,
          patient_name: order.patient_name,
          bill_number: `LAB-${Date.now()}`,
          bill_date: new Date().toISOString().split('T')[0],
          line_items: [{
            item_id: order.id,
            item_name: `${order.test_name} (${order.test_category})`,
            item_type: "Laboratory Test",
            price_per_unit: order.test_cost || 500,
            quantity: 1,
            total_price: order.test_cost || 500
          }],
          total_amount: order.test_cost || 500,
          amount_due: order.test_cost || 500,
          payment_status: "Pending",
          bill_type: "OPD"
        });
        await LabOrder.update(order.id, { is_billed: true });
      }

      // Add to medical records if report is available
      if (order.report_file_url) {
        await MedicalRecord.create({
          patient_id: order.patient_id,
          patient_name: order.patient_name,
          doctor_name: order.doctor_name,
          visit_date: order.completed_date,
          chief_complaint: `Lab Report: ${order.test_name}`,
          diagnosis: `Laboratory Test Results - ${order.test_name}`,
          notes: `Test: ${order.test_name}, Category: ${order.test_category}, Result: ${order.result_value || 'Report attached'}`,
          attachments: [{
            title: `Lab Report: ${order.test_name}`,
            file_name: order.report_file_name,
            url: order.report_file_url
          }]
        });
      }
    } catch (error) {
      console.error('Error completing lab order:', error);
    }
  };
  
  const handleReportUpload = async (orderId, reportData) => {
    try {
      await LabOrder.update(orderId, reportData);
      setShowReportUpload(false);
      setSelectedOrder(null);
      loadData();
    } catch (error) {
      console.error('Error uploading report:', error);
    }
  };

  const orderedOrders = labOrders.filter(o => o.status === 'Ordered');
  const inProcessOrders = labOrders.filter(o => o.status === 'In Process');
  const completedOrders = labOrders.filter(o => o.status === 'Completed');

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{departmentCategory} Laboratory</h1>
          <p className="text-gray-600">Manage test orders for the {departmentCategory} department.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ordered"><AlertCircle className="w-4 h-4 mr-2"/>Ordered ({orderedOrders.length})</TabsTrigger>
          <TabsTrigger value="in-process"><Clock className="w-4 h-4 mr-2"/>In Process ({inProcessOrders.length})</TabsTrigger>
          <TabsTrigger value="completed"><CheckCircle className="w-4 h-4 mr-2"/>Completed ({completedOrders.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="ordered">
          <LabOrderList orders={orderedOrders} isLoading={isLoading} onUpdateStatus={handleUpdateStatus} onUploadReport={(order) => { setSelectedOrder(order); setShowReportUpload(true); }} onRefresh={loadData} statusType="ordered"/>
        </TabsContent>
        <TabsContent value="in-process">
          <LabOrderList orders={inProcessOrders} isLoading={isLoading} onUpdateStatus={handleUpdateStatus} onUploadReport={(order) => { setSelectedOrder(order); setShowReportUpload(true); }} onRefresh={loadData} statusType="in-process"/>
        </TabsContent>
        <TabsContent value="completed">
          <LabOrderList orders={completedOrders} isLoading={isLoading} onUpdateStatus={handleUpdateStatus} onUploadReport={(order) => { setSelectedOrder(order); setShowReportUpload(true); }} onRefresh={loadData} statusType="completed"/>
        </TabsContent>
      </Tabs>
      
      {showReportUpload && selectedOrder && (
        <LabReportUpload order={selectedOrder} onSubmit={handleReportUpload} onCancel={() => { setSelectedOrder(null); setShowReportUpload(false); }}/>
      )}
    </div>
  );
}
