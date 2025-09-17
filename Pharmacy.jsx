import React, { useState, useEffect } from "react";
import { Prescription } from "@/api/entities";
import { Patient } from "@/api/entities";
import { Bill } from "@/api/entities";
import { Inventory } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill, Plus, AlertTriangle, FileText, Banknote, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import PrescriptionForm from "../components/pharmacy/PrescriptionForm";
import OPDPrescriptionList from "../components/pharmacy/OPDPrescriptionList";
import IPDPrescriptionList from "../components/pharmacy/IPDPrescriptionList";
import PharmacyBillHistory from "../components/pharmacy/PharmacyBillHistory";
import { MedicalRecordLogger } from "../components/medical-records/MedicalRecordLogger";

export default function Pharmacy() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [pharmacyBills, setPharmacyBills] = useState([]);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [activeTab, setActiveTab] = useState("opd");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prescriptionData, patientData, inventoryData, billData] = await Promise.all([
        Prescription.list('-created_date'),
        Patient.list(),
        Inventory.list(),
        Bill.filter({ bill_type: "Pharmacy" }, "-created_date")
      ]);
      setPrescriptions(prescriptionData);
      setPatients(patientData);
      setInventory(inventoryData);
      setPharmacyBills(billData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  const handleCreatePrescription = async (prescriptionData) => {
    try {
      await Prescription.create(prescriptionData);
      
      // Auto-log to medical record
      await MedicalRecordLogger.logPrescription(
        prescriptionData.patient_id,
        prescriptionData.patient_name,
        prescriptionData
      );
      
      setShowPrescriptionForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating prescription:', error);
    }
  };
  
  const handleDispenseAndBill = async (prescription, dispensedItems) => {
    const patient = patients.find(p => p.mrn === prescription.patient_id);
    if (!patient) {
      console.error("Patient not found for billing");
      return;
    }
    
    const totalAmount = dispensedItems.reduce((sum, item) => sum + item.total_price, 0);

    const billData = {
        patient_id: patient.mrn,
        patient_name: `${patient.first_name} ${patient.last_name}`,
        bill_number: `BILL-PHARM-${Date.now()}`,
        bill_date: new Date().toISOString().split('T')[0],
        line_items: dispensedItems,
        total_amount: totalAmount,
        amount_due: totalAmount,
        payment_status: "Pending",
        bill_type: "Pharmacy"
    };

    try {
        await Bill.create(billData);
        // Update prescription status
        await Prescription.update(prescription.id, { status: "Dispensed" });
        
        alert(`Bill created successfully for ${patient.first_name}.`);
        loadData(); // Refresh all data
    } catch(error) {
        console.error("Error creating pharmacy bill:", error);
        alert("Failed to create bill.");
    }
  };

  // Separate OPD and IPD prescriptions
  const opdPrescriptions = prescriptions.filter(p => 
    p.status === 'Prescribed' && (!p.prescribed_by_department || p.prescribed_by_department !== "IPD")
  );
  
  const ipdPrescriptions = prescriptions.filter(p => 
    p.status === 'Prescribed' && p.prescribed_by_department === "IPD"
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy Management</h1>
          <p className="text-gray-600">Manage OPD & IPD prescriptions and pharmacy billing</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowPrescriptionForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Prescription
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="opd">
            <Pill className="w-4 h-4 mr-2" />
            OPD Prescriptions ({opdPrescriptions.length})
          </TabsTrigger>
          <TabsTrigger value="ipd">
            <Building2 className="w-4 h-4 mr-2" />
            IPD Prescriptions ({ipdPrescriptions.length})
          </TabsTrigger>
          <TabsTrigger value="billing">
            <Banknote className="w-4 h-4 mr-2" />
            Billing & History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="opd">
          <OPDPrescriptionList
            prescriptions={opdPrescriptions}
            inventory={inventory}
            isLoading={isLoading}
            onRefresh={loadData}
            onDispenseAndBill={handleDispenseAndBill}
          />
        </TabsContent>

        <TabsContent value="ipd">
          <IPDPrescriptionList
            prescriptions={ipdPrescriptions}
            inventory={inventory}
            isLoading={isLoading}
            onRefresh={loadData}
            onDispenseAndBill={handleDispenseAndBill}
          />
        </TabsContent>

        <TabsContent value="billing">
            <PharmacyBillHistory
                bills={pharmacyBills}
                isLoading={isLoading}
                onRefresh={loadData}
            />
        </TabsContent>
      </Tabs>

      {/* Prescription Form Modal */}
      {showPrescriptionForm && (
        <PrescriptionForm
          patients={patients}
          inventory={inventory}
          onSubmit={handleCreatePrescription}
          onCancel={() => setShowPrescriptionForm(false)}
        />
      )}
    </div>
  );
}