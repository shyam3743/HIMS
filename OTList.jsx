import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Scissors,
  Clock,
  User,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle,
  Play,
  Edit
} from "lucide-react";
import { format } from "date-fns";

export default function OTList({ otSchedules, isLoading, onRefresh }) {
  const statusColors = {
    "Scheduled": "bg-blue-100 text-blue-800 border-blue-200",
    "In Progress": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Completed": "bg-green-100 text-green-800 border-green-200",
    "Cancelled": "bg-red-100 text-red-800 border-red-200",
    "Postponed": "bg-orange-100 text-orange-800 border-orange-200"
  };

  const priorityColors = {
    "Elective": "bg-gray-100 text-gray-800",
    "Urgent": "bg-orange-100 text-orange-800",
    "Emergency": "bg-red-100 text-red-800"
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "Scheduled": return Clock;
      case "In Progress": return Play;
      case "Completed": return CheckCircle;
      case "Cancelled": case "Postponed": return AlertCircle;
      default: return Clock;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="w-5 h-5" />
          Surgery Schedule ({otSchedules.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {otSchedules.length === 0 ? (
          <div className="text-center py-8">
            <Scissors className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No surgeries scheduled</h3>
            <p className="text-gray-500">Schedule your first surgery to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {otSchedules.map((schedule) => {
              const StatusIcon = getStatusIcon(schedule.status);
              return (
                <Card key={schedule.id} className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                          <Scissors className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{schedule.surgery_name}</h3>
                          <p className="text-gray-600">{schedule.patient_name}</p>
                          {schedule.surgery_code && (
                            <code className="bg-gray-100 px-2 py-1 rounded text-xs mt-1 inline-block">
                              {schedule.surgery_code}
                            </code>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {schedule.priority !== "Elective" && (
                          <Badge variant="outline" className={priorityColors[schedule.priority]}>
                            {schedule.priority}
                          </Badge>
                        )}
                        <Badge variant="outline" className={statusColors[schedule.status] || statusColors.Scheduled}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {schedule.status || "Scheduled"}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Date:</span>
                        <span>{format(new Date(schedule.scheduled_date), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Time:</span>
                        <span>{schedule.scheduled_start_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Room:</span>
                        <span>{schedule.ot_room}</span>
                      </div>
                      {schedule.estimated_duration && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">Duration:</span>
                          <span>{schedule.estimated_duration} min</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Primary Surgeon:</span>
                        <span>{schedule.primary_surgeon}</span>
                      </div>
                      {schedule.anesthesiologist && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">Anesthesiologist:</span>
                          <span>{schedule.anesthesiologist}</span>
                        </div>
                      )}
                      {schedule.anesthesia_type && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Anesthesia:</span>
                          <span>{schedule.anesthesia_type}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      {schedule.status === "Scheduled" && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Play className="w-4 h-4 mr-1" />
                          Start Surgery
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}