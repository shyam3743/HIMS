import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Banknote, FileText, Eye } from "lucide-react";
import { format } from "date-fns";
import BillDetails from '../billing/BillDetails';
import PaymentForm from '../billing/PaymentForm';
import { Bill } from '@/api/entities';

export default function PharmacyBillHistory({ bills, isLoading, onRefresh }) {
    const [viewingBill, setViewingBill] = useState(null);
    const [payingBill, setPayingBill] = useState(null);

    const handlePaymentSubmit = async (updatedBillData) => {
        try {
            await Bill.update(payingBill.id, updatedBillData);
            setPayingBill(null);
            onRefresh();
            alert("Payment recorded successfully!");
        } catch (error) {
            console.error("Error updating bill payment:", error);
            alert("Failed to record payment.");
        }
    };
    
    const statusColors = {
        Paid: "bg-green-100 text-green-800",
        Pending: "bg-orange-100 text-orange-800",
        "Partially Paid": "bg-yellow-100 text-yellow-800",
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Banknote className="w-5 h-5" />
                    Bill & Payment History
                </CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <p>Loading bill history...</p>
                ) : bills.length === 0 ? (
                    <p>No pharmacy bills found.</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Bill Number</TableHead>
                                <TableHead>Patient</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bills.map(bill => (
                                <TableRow key={bill.id}>
                                    <TableCell className="font-mono">{bill.bill_number}</TableCell>
                                    <TableCell>{bill.patient_name}</TableCell>
                                    <TableCell>{format(new Date(bill.bill_date), 'MMM dd, yyyy')}</TableCell>
                                    <TableCell>₹{bill.total_amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge className={statusColors[bill.payment_status]}>{bill.payment_status}</Badge>
                                    </TableCell>
                                    <TableCell className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => setViewingBill(bill)}>
                                            <Eye className="w-4 h-4 mr-1" /> View
                                        </Button>
                                        {bill.payment_status !== 'Paid' && (
                                            <Button size="sm" onClick={() => setPayingBill(bill)}>
                                                Record Payment
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            {viewingBill && (
                <BillDetails 
                    bill={viewingBill}
                    onClose={() => setViewingBill(null)}
                />
            )}
            {payingBill && (
                <PaymentForm
                    bill={payingBill}
                    onSubmit={handlePaymentSubmit}
                    onCancel={() => setPayingBill(null)}
                />
            )}
        </Card>
    );
}