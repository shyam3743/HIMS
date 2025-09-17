import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Edit, DollarSign, Bed } from 'lucide-react';
import { format } from "date-fns";

export default function BillList({ bills, beds, isLoading, onRefresh, onRecordPayment, onViewBill, onEditBill, listTitle }) {

  const getPatientAdmissionStatus = (patientId) => {
    return beds.find(bed => bed.current_patient_id === patientId && bed.status === 'Occupied');
  };

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800",
    "Partially Paid": "bg-blue-100 text-blue-800",
    Paid: "bg-green-100 text-green-800",
  };

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Bill Number</TableHead>
              <TableHead>Bill Date</TableHead>
              <TableHead>Total Amount (₹)</TableHead>
              <TableHead>Amount Due (₹)</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan="7" className="text-center">Loading bills...</TableCell></TableRow>
            ) : bills.length > 0 ? (
              bills.map((bill) => {
                const isAdmitted = getPatientAdmissionStatus(bill.patient_id);
                return (
                  <TableRow key={bill.id}>
                    <TableCell>
                      <div className="font-medium">{bill.patient_name}</div>
                      <div className="text-sm text-gray-500">{bill.patient_id}</div>
                      {isAdmitted && (
                        <Badge variant="destructive" className="mt-1 flex items-center gap-1 w-fit">
                          <Bed className="w-3 h-3" /> Admitted
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{bill.bill_number}</TableCell>
                    <TableCell>{format(new Date(bill.bill_date), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>₹{bill.total_amount?.toFixed(2)}</TableCell>
                    <TableCell className="font-semibold">₹{bill.amount_due?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[bill.payment_status] || "bg-gray-100"}>
                        {bill.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onViewBill(bill)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => onEditBill(bill)}><Edit className="h-4 w-4" /></Button>
                        {bill.payment_status !== 'Paid' && (
                          <Button variant="ghost" size="icon" onClick={() => onRecordPayment(bill)}><DollarSign className="h-4 w-4" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow><TableCell colSpan="7" className="text-center">No bills found for this category.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}