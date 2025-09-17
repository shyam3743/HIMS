import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  UserCheck, 
  Clock, 
  Briefcase,
  TrendingUp,
  Activity
} from "lucide-react";

export default function EmployeeStats({ employees }) {
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === "Active").length;
  const onLeaveEmployees = employees.filter(emp => emp.status === "On Leave").length;
  
  const roleStats = employees.reduce((acc, emp) => {
    acc[emp.role] = (acc[emp.role] || 0) + 1;
    return acc;
  }, {});

  const topRole = Object.keys(roleStats).reduce((a, b) => 
    roleStats[a] > roleStats[b] ? a : b, "N/A"
  );

  const shiftStats = employees.reduce((acc, emp) => {
    if (emp.shift_schedule) {
      acc[emp.shift_schedule] = (acc[emp.shift_schedule] || 0) + 1;
    }
    return acc;
  }, {});

  const statCards = [
    {
      title: "Total Employees",
      value: totalEmployees,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Active Staff",
      value: activeEmployees,
      icon: UserCheck,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "On Leave",
      value: onLeaveEmployees,
      icon: Clock,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    {
      title: "Total Departments",
      value: new Set(employees.map(emp => emp.department_id).filter(Boolean)).size,
      icon: Briefcase,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      title: "Top Role",
      value: topRole,
      icon: Activity,
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600"
    },
    {
      title: "Doctors",
      value: employees.filter(emp => emp.role === "Doctor").length,
      icon: TrendingUp,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600"
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