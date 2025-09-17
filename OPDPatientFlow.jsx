import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, User, Calendar } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Safe date formatting
const safeFormatTime = (timeString) => {
  if (!timeString) return 'N/A';
  try {
    return timeString;
  } catch (error) {
    return 'N/A';
  }
};

export default function OPDPatientFlow({ appointments, patients, departments, isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  const statusColors = {
    "Scheduled": "bg-blue-100 text-blue-800",
    "Pre-OPD": "bg-orange-100 text-orange-800", 
    "Demographics": "bg-gray-100 text-gray-800",
    "In Progress": "bg-yellow-100 text-yellow-800",
    "Completed": "bg-green-100 text-green-800",
    "Cancelled": "bg-red-100 text-red-800",
    "No Show": "bg-red-100 text-red-800"
  };

  // Sort appointments by appointment time
  const sortedAppointments = appointments.sort((a, b) => {
    if (a.appointment_time && b.appointment_time) {
      return a.appointment_time.localeCompare(b.appointment_time);
    }
    return 0;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Today's Patient Flow ({appointments.length} patients)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments today</h3>
            <p className="text-gray-500">Patient appointments for today will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Patient</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Queue #</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAppointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">{appointment.patient_name || 'Unknown Patient'}</div>
                          <div className="text-sm text-gray-500">MRN: {appointment.patient_id || 'N/A'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {safeFormatTime(appointment.appointment_time)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{appointment.department || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{appointment.doctor_name || 'Not Assigned'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[appointment.status] || 'bg-gray-100 text-gray-800'}>
                        {appointment.status || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-purple-100 text-purple-800">
                        {appointment.appointment_type || 'OPD'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {appointment.queue_number ? (
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {appointment.queue_number}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}