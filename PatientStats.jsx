import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Heart } from "lucide-react";

export default function PatientStats({ patients }) {
  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.status?.toLowerCase() === 'active' || !p.status).length;
  const inactivePatients = patients.filter(p => p.status?.toLowerCase() === 'inactive').length;
  const criticalAlerts = patients.filter(p => p.allergies && p.allergies.toLowerCase().includes('severe')).length;

  const stats = [
    {
      title: "Total Patients",
      value: totalPatients,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Active Patients", 
      value: activePatients,
      icon: UserCheck,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Inactive Patients",
      value: inactivePatients,
      icon: UserX,
      color: "from-gray-500 to-gray-600",
      bgColor: "bg-gray-50",
      textColor: "text-gray-600"
    },
    {
      title: "Medical Alerts",
      value: criticalAlerts,
      icon: Heart,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600"
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