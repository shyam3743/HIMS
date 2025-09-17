import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { UserPlus, Calendar, FileText, FlaskConical, Pill, Receipt } from "lucide-react";

const quickActions = [
  {
    title: "Add Patient",
    description: "Register new patient",
    icon: UserPlus,
    url: "Patients",
    color: "bg-blue-500 hover:bg-blue-600"
  },
  {
    title: "Schedule Appointment",
    description: "Book appointment",
    icon: Calendar, 
    url: "Appointments",
    color: "bg-green-500 hover:bg-green-600"
  },
  {
    title: "Create Record",
    description: "New medical record",
    icon: FileText,
    url: "MedicalRecords", 
    color: "bg-purple-500 hover:bg-purple-600"
  },
  {
    title: "Lab Order",
    description: "Place lab test order",
    icon: FlaskConical,
    url: "Laboratory",
    color: "bg-orange-500 hover:bg-orange-600"
  },
  {
    title: "Pharmacy",
    description: "Manage prescriptions",
    icon: Pill,
    url: "Pharmacy", 
    color: "bg-indigo-500 hover:bg-indigo-600"
  },
  {
    title: "Generate Bill",
    description: "Create patient bill",
    icon: Receipt,
    url: "Billing",
    color: "bg-emerald-500 hover:bg-emerald-600"
  }
];

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
        <p className="text-sm text-gray-500">Common tasks and shortcuts</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Link key={action.title} to={createPageUrl(action.url)}>
              <Button 
                variant="outline" 
                className="w-full h-auto p-4 flex flex-col items-center gap-2 hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${action.color} text-white`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm text-gray-900">{action.title}</div>
                  <div className="text-xs text-gray-500">{action.description}</div>
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}