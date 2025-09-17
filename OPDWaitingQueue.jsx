import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users,
  Clock,
  User,
  ArrowRight,
  UserCheck
} from "lucide-react";
import { format } from "date-fns";

export default function OPDWaitingQueue({ appointments, doctors, onStatusUpdate }) {
  const [selectedDoctor, setSelectedDoctor] = useState("all");

  // Group appointments by doctor
  const appointmentsByDoctor = appointments.reduce((acc, apt) => {
    const doctor = apt.doctor_name;
    if (!acc[doctor]) {
      acc[doctor] = [];
    }
    acc[doctor].push(apt);
    return acc;
  }, {});

  // Filter appointments based on selected doctor
  const filteredAppointments = selectedDoctor === "all" 
    ? appointments 
    : appointmentsByDoctor[selectedDoctor] || [];

  // Sort by queue number and status priority
  const sortedAppointments = filteredAppointments.sort((a, b) => {
    const statusPriority = {
      "Scheduled": 1,
      "Checked-in": 2,
      "In Progress": 3,
      "Completed": 4,
      "Billed": 5
    };
    
    if (statusPriority[a.status] !== statusPriority[b.status]) {
      return statusPriority[a.status] - statusPriority[b.status];
    }
    
    return (a.queue_number || 0) - (b.queue_number || 0);
  });

  const getStatusColor = (status) => {
    const colors = {
      "Scheduled": "bg-blue-100 text-blue-800 border-blue-200",
      "Checked-in": "bg-green-100 text-green-800 border-green-200", 
      "In Progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Completed": "bg-purple-100 text-purple-800 border-purple-200",
      "Billed": "bg-gray-100 text-gray-800 border-gray-200"
    };
    return colors[status] || colors.Scheduled;
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      "Scheduled": "Checked-in",
      "Checked-in": "In Progress", 
      "In Progress": "Completed",
      "Completed": "Billed"
    };
    return statusFlow[currentStatus];
  };

  const uniqueDoctors = [...new Set(appointments.map(apt => apt.doctor_name))];

  return (
    <div className="space-y-6">
      {/* Doctor Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="font-medium text-gray-700">Filter by Doctor:</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Doctors</option>
              {uniqueDoctors.map((doctor) => (
                <option key={doctor} value={doctor}>Dr. {doctor}</option>
              ))}
            </select>
            <span className="text-sm text-gray-500">
              {filteredAppointments.length} patients in queue
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Doctor-wise Queue Cards */}
      {selectedDoctor === "all" ? (
        <div className="grid gap-6">
          {Object.entries(appointmentsByDoctor).map(([doctor, doctorAppointments]) => (
            <Card key={doctor}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Dr. {doctor}
                  <Badge variant="outline" className="ml-auto">
                    {doctorAppointments.length} patients
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {doctorAppointments
                    .sort((a, b) => (a.queue_number || 0) - (b.queue_number || 0))
                    .map((appointment) => (
                    <QueueItem
                      key={appointment.id}
                      appointment={appointment}
                      onStatusUpdate={onStatusUpdate}
                      getStatusColor={getStatusColor}
                      getNextStatus={getNextStatus}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Queue for Dr. {selectedDoctor}
              <Badge variant="outline" className="ml-auto">
                {filteredAppointments.length} patients
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sortedAppointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No patients in queue
                </div>
              ) : (
                sortedAppointments.map((appointment) => (
                  <QueueItem
                    key={appointment.id}
                    appointment={appointment}
                    onStatusUpdate={onStatusUpdate}
                    getStatusColor={getStatusColor}
                    getNextStatus={getNextStatus}
                  />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Queue Item Component
function QueueItem({ appointment, onStatusUpdate, getStatusColor, getNextStatus }) {
  const nextStatus = getNextStatus(appointment.status);
  
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {appointment.queue_number || '—'}
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{appointment.patient_name}</h4>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{appointment.appointment_time}</span>
            </div>
            <span>•</span>
            <span>{appointment.appointment_type}</span>
            {appointment.priority === "Urgent" && (
              <>
                <span>•</span>
                <Badge variant="outline" className="bg-orange-100 text-orange-700">
                  Urgent
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className={getStatusColor(appointment.status)}>
          {appointment.status}
        </Badge>
        {nextStatus && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onStatusUpdate(appointment.id, nextStatus)}
            className="flex items-center gap-1"
          >
            {nextStatus === "Checked-in" && <UserCheck className="w-4 h-4" />}
            <ArrowRight className="w-4 h-4" />
            {nextStatus}
          </Button>
        )}
      </div>
    </div>
  );
}