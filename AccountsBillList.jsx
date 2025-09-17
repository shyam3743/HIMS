import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Banknote, Calendar as CalendarIcon, Hash } from 'lucide-react';
import { format } from 'date-fns';

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  "Partially Paid": "bg-blue-100 text-blue-800",
  Paid: "bg-green-100 text-green-800",
};

export default function AccountsBillList({ bills, isLoading }) {
  if (isLoading) {
    return <div className="text-center p-8">Loading bills...</div>;
  }

  if (!bills || bills.length === 0) {
    return <div className="text-center p-8 text-gray-500">No bills found.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12"></TableHead>
          <TableHead>Patient</TableHead>
          <TableHead>Bill Number</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Total (₹)</TableHead>
          <TableHead>Amount Due (₹)</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bills.map(bill => (
          <Collapsible key={bill.id} asChild>
            <>
              <TableRow>
                <TableCell>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{bill.patient_name}</div>
                  <div className="text-sm text-gray-500">{bill.patient_id}</div>
                </TableCell>
                <TableCell>{bill.bill_number}</TableCell>
                <TableCell>{format(new Date(bill.bill_date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{bill.total_amount?.toFixed(2)}</TableCell>
                <TableCell className="font-semibold">{bill.amount_due?.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className={statusColors[bill.payment_status] || "bg-gray-100"}>
                    {bill.payment_status}
                  </Badge>
                </TableCell>
              </TableRow>
              <CollapsibleContent asChild>
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <div className="p-4 bg-gray-50/50">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Banknote className="h-4 w-4" /> Payment History
                      </h4>
                      {bill.payments && bill.payments.length > 0 ? (
                        <div className="space-y-2">
                          {bill.payments.map((p, index) => (
                            <div key={index} className="flex justify-between items-center p-2 bg-white border rounded-lg">
                              <div className="flex gap-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <CalendarIcon className="h-4 w-4 text-gray-500"/>
                                  <span>{format(new Date(p.payment_date), 'PPP')}</span>
                                </div>
                                <div className="font-medium">
                                  ₹{p.amount_paid.toFixed(2)}
                                </div>
                                <div className="text-sm text-gray-600">
                                  via {p.payment_method}
                                </div>
                              </div>
                              {p.transaction_id && (
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Hash className="h-3 w-3" /> {p.transaction_id}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 py-2">No payments have been recorded for this bill.</p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              </CollapsibleContent>
            </>
          </Collapsible>
        ))}
      </TableBody>
    </Table>
  );
}