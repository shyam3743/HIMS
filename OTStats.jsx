import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Scissors,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar
} from "lucide-react";

export default function OTStats({ otSchedules }) {
  const totalScheduled = otSchedules.length;
  const todayScheduled = otSchedules.filter(s => {
    const today = new Date().toISOString().split('T')[0];
    return s.scheduled_date === today;
  }).length;
  
  const inProgress = otSchedules.filter(s => s.status === "In Progress").length;
  const completed = otSchedules.filter(s => s.status === "Completed").length;
  const upcoming = otSchedules.filter(s => {
    const scheduleDate = new Date(s.scheduled_date);
    const today = new Date();
    return scheduleDate > today && s.status === "Scheduled";
  }).length;

  const statCards = [
    {
      title: "Total Scheduled",
      value: totalScheduled,
      icon: Scissors,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600"
    },
    {
      title: "Today's Surgeries",
      value: todayScheduled,
      icon: Calendar,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      title: "In Progress",
      value: inProgress,
      icon: Clock,
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600"
    },
    {
      title: "Completed",
      value: completed,
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
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