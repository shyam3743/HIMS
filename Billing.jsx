import React, { useState, useEffect, useCallback } from "react";
import { Bill } from "@/api/entities";
import { Patient } from "@/api/entities";
import { PatientCharge } from "@/api/entities";
import { Bed } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Receipt, Plus, Search, Building, Stethoscope } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import BillForm from "../components/billing/BillForm";
import BillList from "../components/billing/BillList";
import BillingStats from "../components/billing/BillingStats";
import PaymentForm from "../components/billing/PaymentForm";
import BillDetails from "../components/billing/BillDetails";

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [beds, setBeds] = useState([]);
  const [patientCharges, setPatientCharges] = useState([]);
  const [opdBills, setOpdBills] = useState([]);
  const [ipdBills, setIpdBills] = useState([]);
  const [activeTab, setActiveTab] = useState("opd");

  const [showForm, setShowForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [editingBill, setEditingBill] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [billData, patientData, bedData, chargeData] = await Promise.all([
        Bill.list('-created_date'),
        Patient.list(),
        Bed.list(),
        PatientCharge.list('-created_date')
      ]);
      setBills(billData);
      setPatients(patientData);
      setBeds(bedData);
      setPatientCharges(chargeData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Create virtual IPD bills for admitted patients with charges
  const generateIPDBillsFromCharges = useCallback(() => {
    const admittedBeds = beds.filter(bed => bed.status === 'Occupied');
    const ipdPatientBills = [];

    admittedBeds.forEach(bed => {
      const patientId = bed.current_patient_id;
      const patientName = bed.current_patient_name;
      
      // Get all charges for this patient
      const patientChargeItems = patientCharges.filter(charge => charge.patient_id === patientId);
      
      // Calculate room charges based on admission days
      const admissionDate = new Date(bed.admission_date);
      const currentDate = new Date();
      const daysDiff = Math.ceil((currentDate - admissionDate) / (1000 * 60 * 60 * 24));
      const roomCharges = daysDiff * (bed.daily_rate || 0);
      
      // Create room charge line item
      const roomChargeItem = {
        item_name: `Room Charges - ${bed.bed_number} (${daysDiff} days)`,
        item_type: "Room",
        quantity: daysDiff,
        price_per_unit: bed.daily_rate || 0,
        total_price: roomCharges
      };

      // Convert patient charges to line items
      const chargeLineItems = patientChargeItems.map(charge => ({
        item_name: charge.item_name,
        item_type: charge.item_type,
        quantity: charge.quantity,
        price_per_unit: charge.price_per_unit,
        total_price: charge.total_price
      }));

      // Combine all line items
      const allLineItems = [roomChargeItem, ...chargeLineItems];
      const totalAmount = allLineItems.reduce((sum, item) => sum + item.total_price, 0);

      // Find existing bill or create virtual one
      let existingBill = bills.find(bill => bill.patient_id === patientId && bill.bill_type === 'IPD');
      
      if (existingBill) {
        // Update existing bill with new charges
        ipdPatientBills.push({
          ...existingBill,
          line_items: allLineItems,
          total_amount: totalAmount,
          amount_due: totalAmount - (existingBill.payments || []).reduce((sum, p) => sum + p.amount_paid, 0)
        });
      } else {
        // Create virtual IPD bill if there are any charges
        if (allLineItems.length > 1) { // >1 because room charge is always there
          ipdPatientBills.push({
            id: `virtual-ipd-${patientId}`,
            patient_id: patientId,
            patient_name: patientName,
            bill_number: `IPD-${patientId}-RUNNING`,
            bill_date: new Date().toISOString().split('T')[0],
            line_items: allLineItems,
            total_amount: totalAmount,
            amount_due: totalAmount,
            payment_status: "Pending",
            bill_type: "IPD",
            payments: [],
            isVirtual: true // Flag to identify virtual bills
          });
        }
      }
    });

    return ipdPatientBills;
  }, [beds, patientCharges, bills]);

  const filterAndSetBills = useCallback((allBills, query) => {
    const lowercasedQuery = query.toLowerCase();
    const filtered = allBills.filter(bill =>
      bill.patient_name?.toLowerCase().includes(lowercasedQuery) ||
      bill.patient_id?.toLowerCase().includes(lowercasedQuery) ||
      bill.bill_number?.toLowerCase().includes(lowercasedQuery)
    );
    
    // Separate OPD and IPD bills (exclude pharmacy)
    setOpdBills(filtered.filter(b => b.bill_type === 'OPD'));
    
    // For IPD, combine existing IPD bills with virtual bills from patient charges
    const existingIpdBills = filtered.filter(b => b.bill_type === 'IPD');
    const virtualIpdBills = generateIPDBillsFromCharges();
    
    // Merge and deduplicate
    const combinedIpdBills = [...existingIpdBills];
    virtualIpdBills.forEach(virtualBill => {
      if (!existingIpdBills.find(existing => existing.patient_id === virtualBill.patient_id)) {
        combinedIpdBills.push(virtualBill);
      }
    });
    
    setIpdBills(combinedIpdBills);
  }, [generateIPDBillsFromCharges]);

  useEffect(() => {
    filterAndSetBills(bills, searchQuery);
  }, [bills, searchQuery, filterAndSetBills]);

  const handleCreateBill = async (billData) => {
    const patient = patients.find(p => p.id === billData.patient_id);
    if (!patient) {
      alert("Patient not found!");
      return;
    }

    try {
        const patientBillData = {
          ...billData,
          patient_id: patient.mrn,
          patient_name: `${patient.first_name} ${patient.last_name}`,
        };
      await Bill.create(patientBillData);
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating bill:', error);
    }
  };

   const handlePaymentSubmit = async (paymentData) => {
    const currentBill = selectedBill;
    
    // Handle virtual IPD bills differently
    if (currentBill.isVirtual) {
      // Create a real bill first, then add payment
      const realBillData = {
        ...currentBill,
        bill_number: `BILL-IPD-${Date.now()}`,
        payments: [paymentData],
        amount_due: currentBill.total_amount - paymentData.amount_paid,
        payment_status: currentBill.total_amount - paymentData.amount_paid <= 0 ? "Paid" : "Partially Paid"
      };
      
      delete realBillData.id; // Remove virtual ID
      delete realBillData.isVirtual; // Remove virtual flag
      
      try {
        await Bill.create(realBillData);
        setShowPaymentForm(false);
        setSelectedBill(null);
        loadData();
        alert("Payment recorded successfully!");
      } catch (error) {
        console.error('Error creating bill with payment:', error);
        alert("Failed to record payment.");
      }
    } else {
      // Handle existing bills normally
      const existingPayments = currentBill.payments || [];
      const updatedPayments = [...existingPayments, paymentData];
      
      const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount_paid, 0);
      const newAmountDue = currentBill.total_amount - totalPaid;

      const updatedBill = {
          ...currentBill,
          payments: updatedPayments,
          amount_due: newAmountDue,
          payment_status: newAmountDue <= 0 ? "Paid" : "Partially Paid",
      };
      
      try {
        await Bill.update(currentBill.id, updatedBill);
        setShowPaymentForm(false);
        setSelectedBill(null);
        loadData();
      } catch (error) {
        console.error('Error recording payment:', error);
      }
    }
  };
  
  const handleEditBill = async (billData) => {
    try {
      await Bill.update(editingBill.id, billData);
      setShowForm(false);
      setEditingBill(null);
      loadData();
    } catch (error) {
      console.error('Error updating bill:', error);
    }
  };

  const handleRecordPayment = (bill) => {
    setSelectedBill(bill);
    setShowPaymentForm(true);
  };

  const handleViewBill = (bill) => {
    setSelectedBill(bill);
    setShowBillDetails(true);
  };

  const handleEditBillClick = (bill) => {
    if (bill.isVirtual) {
      alert("Cannot edit virtual IPD bills. Please record payment to create a real bill first.");
      return;
    }
    setEditingBill(bill);
    setShowForm(true);
  };

  const billsForCurrentTab = activeTab === 'opd' ? opdBills : ipdBills;
  const statsForCurrentTab = activeTab === 'opd' 
    ? bills.filter(b => b.bill_type === 'OPD')
    : bills.filter(b => b.bill_type === 'IPD');

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hospital Billing</h1>
          <p className="text-gray-600">Manage patient bills and payments for OPD and IPD</p>
        </div>
        <Button 
          onClick={() => { setShowForm(true); setEditingBill(null); }}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Manual Charges
        </Button>
      </div>

      <BillingStats bills={statsForCurrentTab} />

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by patient name, MRN, or bill number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="opd">
                <Stethoscope className="w-4 h-4 mr-2"/>
                OPD Billing ({opdBills.length})
              </TabsTrigger>
              <TabsTrigger value="ipd">
                <Building className="w-4 h-4 mr-2"/>
                IPD Billing ({ipdBills.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>
      
      <BillList
        bills={billsForCurrentTab}
        beds={beds}
        isLoading={isLoading}
        onRefresh={loadData}
        onRecordPayment={handleRecordPayment}
        onViewBill={handleViewBill}
        onEditBill={handleEditBillClick}
        listTitle={`${activeTab.toUpperCase()} Bills`}
      />

      {/* Forms and Modals */}
      {showForm && (
        <BillForm
          patients={patients}
          onSubmit={editingBill ? handleEditBill : handleCreateBill}
          onCancel={() => { setShowForm(false); setEditingBill(null); }}
          bill={editingBill}
          isEditing={!!editingBill}
        />
      )}
      {showPaymentForm && selectedBill && (
        <PaymentForm
          bill={selectedBill}
          onSubmit={handlePaymentSubmit}
          onCancel={() => { setShowPaymentForm(false); setSelectedBill(null); }}
        />
      )}
      {showBillDetails && selectedBill && (
        <BillDetails
          bill={selectedBill}
          onClose={() => { setShowBillDetails(false); setSelectedBill(null); }}
          onEdit={() => { setShowBillDetails(false); handleEditBillClick(selectedBill); }}
          onRecordPayment={() => { setShowBillDetails(false); handleRecordPayment(selectedBill); }}
        />
      )}
    </div>
  );
}