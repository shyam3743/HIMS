import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, FileCheck, FileWarning, Receipt } from "lucide-react";

export default function BillingStats({ bills }) {
  const totalInvoices = bills.length;
  const paidInvoices = bills.filter(bill => bill.payment_status === "Paid").length;
  const pendingInvoices = bills.filter(bill => ["Pending", "Partially Paid"].includes(bill.payment_status)).length;
  const totalRevenue = bills
    .filter(bill => bill.payment_status === "Paid")
    .reduce((sum, bill) => sum + (bill.total_amount || 0), 0);

  const stats = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Total Invoices",
      value: totalInvoices,
      icon: Receipt,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Paid Invoices",
      value: paidInvoices,
      icon: FileCheck,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    {
      title: "Pending Invoices",
      value: pendingInvoices,
      icon: FileWarning,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200">
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-4 h-4 ${stat.textColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stat.value}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Based on current filter
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}