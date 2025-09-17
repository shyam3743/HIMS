import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Pill,
  Clock,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  Edit,
  Receipt // For billing
} from "lucide-react";
import { format } from "date-fns";

export default function PrescriptionList({ prescriptions, isLoading, onRefresh, onDispenseAndBill }) {
  const statusColors = {
    "Prescribed": "bg-blue-100 text-blue-800 border-blue-200",
    "Dispensed": "bg-green-100 text-green-800 border-green-200",
    "Partially Dispensed": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Cancelled": "bg-red-100 text-red-800 border-red-200"
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case "Prescribed": return Clock;
      case "Dispensed": return CheckCircle;
      default: return AlertCircle;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pill className="w-5 h-5" />
          All Prescriptions ({prescriptions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {prescriptions.length === 0 ? (
          <div className="text-center py-8">
            <Pill className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No prescriptions found</h3>
            <p className="text-gray-500">New prescriptions will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {prescriptions.map((p) => {
              const StatusIcon = getStatusIcon(p.status);
              return (
                <Card key={p.id} className="hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                       <div>
                          <h3 className="font-semibold text-lg text-gray-900">{p.medication_name}</h3>
                          <p className="text-gray-600">{p.patient_name} (MRN: {p.patient_id})</p>
                       </div>
                       <Badge variant="outline" className={statusColors[p.status] || statusColors.Prescribed}>
                         <StatusIcon className="w-3 h-3 mr-1" />
                         {p.status || "Prescribed"}
                       </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                      <div><span className="font-medium">Dosage:</span> {p.dosage}</div>
                      <div><span className="font-medium">Frequency:</span> {p.frequency}</div>
                      <div><span className="font-medium">Duration:</span> {p.duration}</div>
                    </div>

                    <div className="border-t pt-3 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Prescribed by Dr. {p.doctor_name} on {format(new Date(p.prescription_date), 'MMM dd, yyyy')}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm"><Edit className="w-4 h-4 mr-1" /> Edit</Button>
                        {p.status === "Prescribed" && (
                           <Button size="sm" onClick={() => onDispenseAndBill(p)} className="bg-green-600 hover:bg-green-700">
                             <Receipt className="w-4 h-4 mr-1" />
                             Dispense & Bill
                           </Button>
                        )}
                      </div>
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