
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, Clock, User, Calendar, FileText, Upload, Play, CheckCircle, Eye } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const safeFormat = (dateString, formatStr) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        return format(date, formatStr);
    } catch (e) {
        // Log error for debugging if necessary, but return 'Invalid date' for display
        console.error("Error formatting date:", e);
        return 'Invalid date';
    }
};

export default function LabOrderList({ orders, isLoading, onUpdateStatus, onUploadReport, onRefresh, statusType }) {
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

  const getActionButton = (order) => {
    switch (statusType) {
      case "ordered":
        return (
          <Button
            size="sm"
            onClick={() => onUpdateStatus(order.id, "In Process")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Play className="w-4 h-4 mr-1" />
            Start Process
          </Button>
        );
      case "in-process":
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUploadReport(order)}
            >
              <Upload className="w-4 h-4 mr-1" />
              Upload Report
            </Button>
            <Button
              size="sm"
              onClick={() => onUpdateStatus(order.id, "Completed")}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Complete
            </Button>
          </div>
        );
      case "completed":
        return (
          <div className="flex gap-2">
            {order.report_file_url && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(order.report_file_url, '_blank')}
              >
                <Eye className="w-4 h-4 mr-1" />
                View Report
              </Button>
            )}
            <Badge variant="outline" className="bg-green-100 text-green-800">
              ₹{order.test_cost?.toFixed(2) || '500.00'}
            </Badge>
          </div>
        );
      default:
        return null;
    }
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
          {statusType === "ordered" && "Lab Orders - Ready to Process"}
          {statusType === "in-process" && "Lab Orders - In Process"}
          {statusType === "completed" && "Lab Orders - Completed"}
          ({orders.length})
        </CardTitle>
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
                  <TableHead>Patient Details</TableHead>
                  <TableHead>Test Information</TableHead>
                  <TableHead>Doctor & Department</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status & Results</TableHead>
                  <TableHead>Actions</TableHead>
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
                          <div className="font-medium">{order.patient_name}</div>
                          <div className="text-sm text-gray-500">MRN: {order.patient_id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.test_name}</div>
                        <Badge variant="outline" className={categoryColors[order.test_category]}>
                          {order.test_category}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{order.doctor_name}</div>
                        {order.prescribed_by_department && (
                          <div className="text-xs text-gray-500">{order.prescribed_by_department}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={priorityColors[order.priority]}>
                        {order.priority}
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
                            <Clock className="w-3 h-3" />
                            <span>Started: {safeFormat(order.process_date, 'MMM dd')}</span>
                          </div>
                        )}
                        {order.completed_date && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            <span>Done: {safeFormat(order.completed_date, 'MMM dd')}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {order.result_value && (
                          <div className="text-sm">
                            <span className="font-medium">Result:</span> {order.result_value}
                          </div>
                        )}
                        {order.report_file_name && (
                          <div className="flex items-center gap-1 text-green-600">
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
                    <TableCell>
                      {getActionButton(order)}
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
