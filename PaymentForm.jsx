
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, CreditCard } from "lucide-react"; // Changed icons: removed Save, DollarSign; added CreditCard
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MedicalRecordLogger } from "../medical-records/MedicalRecordLogger"; // Added MedicalRecordLogger import

export default function PaymentForm({ bill, onSubmit, onCancel }) {
  const [paymentData, setPaymentData] = useState({
    amount_paid: bill.amount_due.toFixed(2), // Initialize with bill.amount_due as a string for input
    payment_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    payment_method: "Cash",
    transaction_id: "",
    notes: ""
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setPaymentData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value) => {
    setPaymentData(prev => ({ ...prev, payment_method: value }));
  };

  const handleSubmit = async (e) => { // Made handleSubmit async
    e.preventDefault();

    const paidAmount = parseFloat(paymentData.amount_paid);

    if (isNaN(paidAmount) || paidAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    if (paidAmount > bill.amount_due) {
        alert("Payment cannot be greater than the amount due.");
        return;
    }

    const finalPaymentData = {
        ...paymentData,
        amount_paid: paidAmount, // Ensure amount is parsed to float before submission
        payment_date: new Date().toISOString(), // Use full ISO string for backend
    };

    // Auto-log payment to medical record
    try {
      await MedicalRecordLogger.logPayment(
        bill.patient_id,
        bill.patient_name,
        {
          ...finalPaymentData,
          bill_type: bill.bill_type
        }
      );
    } catch (error) {
      console.error('Error logging payment to medical record:', error);
      // Optionally, handle error gracefully (e.g., show a toast, prevent submission)
    }
    
    onSubmit(finalPaymentData); // Pass the final, parsed payment data
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Record Payment</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-4">
                <p className="text-sm text-gray-500">Amount Due for {bill.patient_name}</p>
                <p className="text-3xl font-bold">₹{bill.amount_due.toFixed(2)}</p>
            </div>
            <div>
              <Label htmlFor="amount_paid">Amount Paid (₹) *</Label>
              <Input
                id="amount_paid"
                type="number"
                value={paymentData.amount_paid}
                onChange={handleInputChange}
                step="0.01"
                required
              />
            </div>
            <div>
              <Label htmlFor="payment_method">Payment Method *</Label>
              <Select value={paymentData.payment_method} onValueChange={handleSelectChange}>
                <SelectTrigger><SelectValue placeholder="Select a payment method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Insurance">Insurance</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div>
                <Label htmlFor="transaction_id">Transaction ID / Reference</Label>
                <Input 
                  id="transaction_id" 
                  value={paymentData.transaction_id} 
                  onChange={handleInputChange} 
                />
            </div>
            <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea 
                  id="notes" 
                  value={paymentData.notes} 
                  onChange={handleInputChange} 
                  placeholder="e.g., Paid by patient's relative" 
                />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
              <Button type="submit"><CreditCard className="w-4 h-4 mr-2" /> Record Payment</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
