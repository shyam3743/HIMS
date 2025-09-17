import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, Calendar, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";

const statusColors = {
  "Scheduled": "bg-blue-100 text-blue-800 border-blue-200",
  "Checked-in": "bg-green-100 text-green-800 border-green-200", 
  "In Progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Completed": "bg-gray-100 text-gray-800 border-gray-200",
  "Cancelled": "bg-red-100 text-red-800 border-red-200"
};

const priorityColors = {
  "Normal": "bg-gray-100 text-gray-600",
  "Urgent": "bg-orange-100 text-orange-700", 
  "Critical": "bg-red-100 text-red-700"
};

export default function AppointmentOverview({ appointments, isLoading }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold">Today's Appointments</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            {appointments.length} appointments scheduled for today
          </p>
        </div>
        <Link to={createPageUrl("Appointments")}>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments today</h3>
            <p className="text-gray-500 mb-4">Schedule new appointments to get started.</p>
            <Link to={createPageUrl("Appointments")}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Appointment
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{appointment.patient_name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.appointment_time}</span>
                      <span>•</span>
                      <span>{appointment.department}</span>
                      <span>•</span>
                      <span>Dr. {appointment.doctor_name}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {appointment.priority !== "Normal" && (
                    <Badge variant="outline" className={priorityColors[appointment.priority]}>
                      {appointment.priority}
                    </Badge>
                  )}
                  <Badge variant="outline" className={statusColors[appointment.status]}>
                    {appointment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}