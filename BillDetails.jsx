import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Printer, Edit, CreditCard, Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function BillDetails({ bill, onClose, onEdit, onRecordPayment }) {
  if (!bill) return null;

  const totalPaid = (bill.payments || []).reduce((sum, p) => sum + p.amount_paid, 0);

  const statusColors = {
    Pending: "bg-yellow-100 text-yellow-800",
    "Partially Paid": "bg-blue-100 text-blue-800",
    Paid: "bg-green-100 text-green-800",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Bill Details</CardTitle>
            <p className="text-sm text-gray-500">Bill #{bill.bill_number}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto space-y-6">
          <div className="p-4 border rounded-lg">
            <h3 className="font-semibold">{bill.patient_name}</h3>
            <p className="text-sm text-gray-500">MRN: {bill.patient_id}</p>
            <p className="text-sm text-gray-500">Bill Date: {format(new Date(bill.bill_date), 'PPP')}</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Line Items</h4>
            <div className="space-y-2">
              {bill.line_items.map((item, index) => (
                <div key={index} className="flex justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{item.item_name}</p>
                    <p className="text-xs text-gray-500">{item.quantity} x ₹{item.price_per_unit?.toFixed(2)}</p>
                  </div>
                  <p className="font-semibold">₹{item.total_price?.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t space-y-2">
             <div className="flex justify-between"><span className="text-gray-600">Subtotal:</span><span>₹{bill.total_amount?.toFixed(2)}</span></div>
             <div className="flex justify-between"><span className="text-gray-600">Discount:</span><span className="text-red-600">- ₹{bill.discount_amount?.toFixed(2) || '0.00'}</span></div>
             <div className="flex justify-between font-bold text-lg"><span >Total Amount:</span><span>₹{bill.total_amount?.toFixed(2)}</span></div>
             <div className="flex justify-between text-green-600"><span >Total Paid:</span><span>₹{totalPaid.toFixed(2)}</span></div>
             <div className="flex justify-between font-bold text-xl"><span >Amount Due:</span><span>₹{bill.amount_due?.toFixed(2)}</span></div>
          </div>

          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2"><Receipt className="w-4 h-4"/>Payment History</h4>
            <div className="space-y-2">
              {(bill.payments && bill.payments.length > 0) ? bill.payments.map((p, index) => (
                <div key={index} className="flex justify-between p-2 bg-green-50 rounded">
                  <div>
                    <p className="font-medium">₹{p.amount_paid.toFixed(2)} via {p.payment_method}</p>
                    <p className="text-xs text-gray-500">{format(new Date(p.payment_date), 'PPP HH:mm')}</p>
                  </div>
                  <Badge variant="secondary">Success</Badge>
                </div>
              )) : (
                <p className="text-sm text-gray-500 text-center py-2">No payments recorded yet.</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Badge className={statusColors[bill.payment_status] || "bg-gray-100"}>{bill.payment_status}</Badge>
          <div className="flex gap-2">
            <Button variant="outline"><Printer className="w-4 h-4 mr-2" /> Print</Button>
            {bill.payment_status !== "Paid" && (
                <Button onClick={onRecordPayment}><CreditCard className="w-4 h-4 mr-2" /> Record Payment</Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}