import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, DollarSign, TrendingDown } from "lucide-react";

export default function InventoryStats({ inventory }) {
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter(item => item.status === 'Low Stock').length;
  const outOfStockItems = inventory.filter(item => item.status === 'Out of Stock').length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.unit_cost * item.quantity_on_hand), 0);
  const expiredItems = inventory.filter(item => {
    if (!item.expiry_date) return false;
    return new Date(item.expiry_date) < new Date();
  }).length;

  const stats = [
    {
      title: "Total Items",
      value: totalItems,
      icon: Package,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    {
      title: "Low Stock Items",
      value: lowStockItems,
      icon: AlertTriangle,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600"
    },
    {
      title: "Out of Stock",
      value: outOfStockItems,
      icon: TrendingDown,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600"
    },
    {
      title: "Total Value",
      value: `$${totalValue.toLocaleString()}`,
      icon: DollarSign,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
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
              Updated just now
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}