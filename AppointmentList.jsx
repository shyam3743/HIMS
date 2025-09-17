import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, User, Search, Filter, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  "Scheduled": "bg-blue-100 text-blue-800 border-blue-200",
  "Checked-in": "bg-green-100 text-green-800 border-green-200",
  "In Progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Completed": "bg-gray-100 text-gray-800 border-gray-200",
  "Cancelled": "bg-red-100 text-red-800 border-red-200",
  "No Show": "bg-orange-100 text-orange-800 border-orange-200"
};

const priorityColors = {
  "Normal": "bg-gray-100 text-gray-600",
  "Urgent": "bg-orange-100 text-orange-700",
  "Critical": "bg-red-100 text-red-700"
};

export default function AppointmentList({ 
  appointments, 
  selectedDate, 
  setSelectedDate, 
  filterStatus, 
  setFilterStatus,
  isLoading,
  onEdit,
  onDelete
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Appointments for {format(new Date(selectedDate), 'MMM dd, yyyy')}
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full sm:w-auto"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Checked-in">Checked-in</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No Show">No Show</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments scheduled</h3>
            <p className="text-gray-500">No appointments found for the selected date and filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-gray-900">{appointment.patient_name}</h4>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{appointment.appointment_time}</span>
                      </div>
                      <span className="hidden sm:inline">•</span>
                      <span>{appointment.department}</span>
                      <span className="hidden sm:inline">•</span>
                      <span>Dr. {appointment.doctor_name}</span>
                    </div>
                    <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-2">
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
                </div>
                <div className="flex items-center gap-1 mt-3 sm:mt-0 self-end sm:self-center">
                   <Button variant="ghost" size="icon" onClick={() => onEdit(appointment)} title="Edit Appointment"><Edit className="w-4 h-4"/></Button>
                   <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => onDelete(appointment)} title="Delete Appointment"><Trash2 className="w-4 h-4"/></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}