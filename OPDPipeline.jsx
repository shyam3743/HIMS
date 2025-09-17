import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ArrowRight, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function OPDPipeline({ appointments, departments, isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  // Create pipeline stages
  const pipelineStages = [
    {
      name: "Demographics",
      icon: Users,
      color: "bg-gray-500",
      patients: appointments.filter(apt => apt.department === "Demographics" || apt.status === "Demographics"),
      description: "Patient registration"
    },
    {
      name: "Pre OPD",
      icon: AlertCircle,
      color: "bg-orange-500",
      patients: appointments.filter(apt => apt.department === "Pre-OPD" || apt.status === "Pre-OPD"),
      description: "Pre-consultation screening"
    },
    {
      name: "Waiting Queue",
      icon: Clock,
      color: "bg-blue-500",
      patients: appointments.filter(apt => apt.status === "Scheduled" && apt.department !== "Demographics" && apt.department !== "Pre-OPD"),
      description: "Waiting for doctor"
    },
    {
      name: "Consultation",
      icon: Users,
      color: "bg-yellow-500",
      patients: appointments.filter(apt => apt.status === "In Progress"),
      description: "With doctor"
    },
    {
      name: "Completed",
      icon: CheckCircle,
      color: "bg-green-500",
      patients: appointments.filter(apt => apt.status === "Completed"),
      description: "Visit finished"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Pipeline Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRight className="w-5 h-5" />
            Patient Flow Pipeline - Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 justify-center">
            {pipelineStages.map((stage, index) => (
              <div key={stage.name} className="flex items-center">
                <div className="text-center">
                  <div className={`w-16 h-16 ${stage.color} rounded-full flex items-center justify-center mx-auto mb-2 relative`}>
                    <stage.icon className="w-8 h-8 text-white" />
                    {stage.patients.length > 0 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">{stage.patients.length}</span>
                      </div>
                    )}
                  </div>
                  <div className="font-medium text-sm">{stage.name}</div>
                  <div className="text-xs text-gray-500">{stage.description}</div>
                </div>
                {index < pipelineStages.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-gray-400 mx-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => {
          const deptPatients = appointments.filter(apt => apt.department === dept.name);
          const waiting = deptPatients.filter(apt => apt.status === "Scheduled");
          const inProgress = deptPatients.filter(apt => apt.status === "In Progress");
          const completed = deptPatients.filter(apt => apt.status === "Completed");

          return (
            <Card key={dept.name}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{dept.name}</h3>
                  <Badge className="bg-blue-100 text-blue-800">
                    {deptPatients.length} patients
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Waiting</span>
                    <Badge variant="outline" className="text-yellow-600">
                      {waiting.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">In Progress</span>
                    <Badge variant="outline" className="text-orange-600">
                      {inProgress.length}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed</span>
                    <Badge variant="outline" className="text-green-600">
                      {completed.length}
                    </Badge>
                  </div>
                </div>

                {/* Queue Details */}
                {waiting.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-xs text-gray-500 mb-1">Patients in queue:</div>
                    {waiting.slice(0, 3).map((patient, idx) => (
                      <div key={patient.id} className="text-xs text-gray-600">
                        {idx + 1}. {patient.patient_name}
                      </div>
                    ))}
                    {waiting.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{waiting.length - 3} more patients
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}