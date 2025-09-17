import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Stethoscope, 
  DollarSign, 
  TrendingUp, 
  Clock,
  Activity,
  Package
} from "lucide-react";

export default function ServiceStats({ services }) {
  const totalServices = services.length;
  const activeServices = services.filter(s => s.is_active).length;
  const avgPrice = services.length > 0 
    ? services.reduce((sum, s) => sum + (s.base_price || 0), 0) / services.length 
    : 0;
  
  const categoryStats = services.reduce((acc, service) => {
    acc[service.category] = (acc[service.category] || 0) + 1;
    return acc;
  }, {});

  const topCategory = Object.keys(categoryStats).reduce((a, b) => 
    categoryStats[a] > categoryStats[b] ? a : b, "N/A"
  );

  const bookingRequiredServices = services.filter(s => s.requires_booking).length;
  const totalRevenuePotential = services.reduce((sum, s) => sum + (s.base_price || 0), 0);

  const statCards = [
    {
      title: "Total Services",
      value: totalServices,
      icon: Package,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Active Services", 
      value: activeServices,
      icon: Activity,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Average Price",
      value: `$${avgPrice.toFixed(2)}`,
      icon: DollarSign,
      color: "from-emerald-500 to-emerald-600", 
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    {
      title: "Revenue Potential",
      value: `$${totalRevenuePotential.toFixed(2)}`,
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50", 
      textColor: "text-purple-600"
    },
    {
      title: "Top Category",
      value: topCategory,
      icon: Stethoscope,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600"
    },
    {
      title: "Booking Required",
      value: bookingRequiredServices,
      icon: Clock,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((stat) => (
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