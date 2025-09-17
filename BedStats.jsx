import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bed, Users, AlertTriangle, CheckCircle } from "lucide-react";

export default function BedStats({ beds }) {
  const totalBeds = beds.length;
  const availableBeds = beds.filter(bed => bed.status === 'Available').length;
  const occupiedBeds = beds.filter(bed => bed.status === 'Occupied').length;
  const maintenanceBeds = beds.filter(bed => bed.status === 'Under Maintenance').length;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const stats = [
    {
      title: "Total Beds",
      value: totalBeds,
      icon: Bed,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Available Beds",
      value: availableBeds,
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Occupied Beds",
      value: occupiedBeds,
      icon: Users,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600"
    },
    {
      title: "Occupancy Rate",
      value: `${occupancyRate}%`,
      icon: AlertTriangle,
      color: occupancyRate > 80 ? "from-orange-500 to-orange-600" : "from-gray-500 to-gray-600",
      bgColor: occupancyRate > 80 ? "bg-orange-50" : "bg-gray-50",
      textColor: occupancyRate > 80 ? "text-orange-600" : "text-gray-600"
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