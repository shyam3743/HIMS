import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2,
  Users,
  Stethoscope,
  Activity
} from "lucide-react";

export default function DepartmentStats({ departments, employees }) {
  const totalDepartments = departments.length;
  const totalEmployees = employees.length;
  const activeDepartments = departments.filter(d => d.status === "Active").length;
  
  const departmentStaffCount = departments.map(dept => ({
    name: dept.name,
    count: employees.filter(emp => emp.department_id === dept.id).length
  }));

  const busiestDepartment = departmentStaffCount.reduce((max, dept) => 
    dept.count > max.count ? dept : max, { name: "N/A", count: 0 }
  );

  const statCards = [
    {
      title: "Total Departments",
      value: totalDepartments,
      icon: Building2,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "Active Departments",
      value: activeDepartments,
      icon: Activity,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      title: "Total Employees",
      value: totalEmployees,
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      title: "Busiest Department",
      value: busiestDepartment.name,
      description: `${busiestDepartment.count} staff`,
      icon: Stethoscope,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="text-2xl font-bold text-gray-900 truncate">
              {stat.value}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stat.description || "Updated just now"}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}