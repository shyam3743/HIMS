import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, User, Calendar, FileText, Eye, Stethoscope } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Safe date formatting
const safeFormat = (dateString, formatStr) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, formatStr);
  } catch (e) {
    return 'Invalid date';
  }
};

export default function LabOrderViewList({ orders, isLoading, statusType, viewOnly = true }) {
  const priorityColors = {
    "Routine": "bg-blue-100 text-blue-800",
    "Urgent": "bg-orange-100 text-orange-800",
    "STAT": "bg-red-100 text-red-800"
  };

  const categoryColors = {
    "Blood Test": "bg-red-100 text-red-800",
    "Urine Test": "bg-yellow-100 text-yellow-800",
    "Radiology": "bg-purple-100 text-purple-800",
    "Pathology": "bg-green-100 text-green-800",
    "Microbiology": "bg-pink-100 text-pink-800",
    "Biochemistry": "bg-indigo-100 text-indigo-800",
    "Cardiology": "bg-teal-100 text-teal-800"
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5" />
          {statusType === "ordered" && "Lab Orders - Awaiting Processing"}
          {statusType === "in-process" && "Lab Orders - Currently Processing"}
          {statusType === "completed" && "Lab Orders - Completed"}
          ({orders.length})
        </CardTitle>
        {viewOnly && (
          <p className="text-sm text-gray-500">
            View-only mode. Use specific lab department pages for processing actions.
          </p>
        )}
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <FlaskConical className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {statusType.replace('-', ' ')} orders
            </h3>
            <p className="text-gray-500">
              {statusType === "ordered" && "New lab orders will appear here"}
              {statusType === "in-process" && "Orders being processed will appear here"}
              {statusType === "completed" && "Completed orders will appear here"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Patient</TableHead>
                  <TableHead>Test Details</TableHead>
                  <TableHead>Ordering Doctor</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status & Cost</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">{order.patient_name || 'Unknown Patient'}</div>
                          <div className="text-sm text-gray-500">MRN: {order.patient_id || 'N/A'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.test_name || 'Unknown Test'}</div>
                        <Badge variant="outline" className={categoryColors[order.test_category] || 'bg-gray-100 text-gray-800'}>
                          {order.test_category || 'General'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-sm">{order.doctor_name || 'Unknown Doctor'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.prescribed_by_department || 'Unknown Dept'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={priorityColors[order.priority] || 'bg-gray-100 text-gray-800'}>
                        {order.priority || 'Normal'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>Ordered: {safeFormat(order.order_date, 'MMM dd')}</span>
                        </div>
                        {order.process_date && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <span>Started: {safeFormat(order.process_date, 'MMM dd')}</span>
                          </div>
                        )}
                        {order.completed_date && (
                          <div className="flex items-center gap-1 text-green-600">
                            <span>Done: {safeFormat(order.completed_date, 'MMM dd')}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          ₹{order.test_cost?.toFixed(2) || '0.00'}
                        </Badge>
                        {order.result_value && (
                          <div className="text-sm text-green-600">
                            Result Available
                          </div>
                        )}
                        {order.report_file_url && (
                          <div className="flex items-center gap-1 text-blue-600">
                            <FileText className="w-3 h-3" />
                            <span className="text-xs">Report attached</span>
                          </div>
                        )}
                        {order.lab_technician && (
                          <div className="text-xs text-gray-500">
                            Tech: {order.lab_technician}
                          </div>
                        )}
                      </div>
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