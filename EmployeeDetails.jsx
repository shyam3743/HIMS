import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Edit, User, Briefcase, Phone, Mail, MapPin, Calendar, DollarSign, Clock } from 'lucide-react';
import { format } from 'date-fns';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

export default function EmployeeDetails({ employee, onClose, onEdit }) {

  const statusColors = {
    Active: "bg-green-100 text-green-800",
    Inactive: "bg-gray-100 text-gray-800",
    "On Leave": "bg-yellow-100 text-yellow-800",
    Terminated: "bg-red-100 text-red-800"
  };

  const handleEditClick = () => {
    onClose(); // Close this modal
    onEdit(employee); // Open the edit modal
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            <div>
              <CardTitle className="text-2xl font-bold">{employee.first_name} {employee.last_name}</CardTitle>
              <p className="text-gray-500">{employee.role}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex justify-between items-center">
                <Badge className={statusColors[employee.status] || "bg-gray-100 text-gray-800"}>
                    {employee.status}
                </Badge>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    Employee Code: {employee.employee_code}
                </code>
            </div>

            {/* Professional Info */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-3"><Briefcase className="w-4 h-4 mt-1 text-gray-500"/><div><strong>Department:</strong> {employee.department_name}</div></div>
                    {employee.specialization && <div className="flex items-start gap-3"><User className="w-4 h-4 mt-1 text-gray-500"/><div><strong>Specialization:</strong> {employee.specialization}</div></div>}
                    {employee.qualifications && <div className="flex items-start gap-3"><Briefcase className="w-4 h-4 mt-1 text-gray-500"/><div><strong>Qualifications:</strong> {employee.qualifications}</div></div>}
                    {employee.license_number && <div className="flex items-start gap-3"><Briefcase className="w-4 h-4 mt-1 text-gray-500"/><div><strong>License No:</strong> {employee.license_number}</div></div>}
                    {employee.date_of_joining && <div className="flex items-start gap-3"><Calendar className="w-4 h-4 mt-1 text-gray-500"/><div><strong>Joining Date:</strong> {format(new Date(employee.date_of_joining), 'MMM dd, yyyy')}</div></div>}
                    {employee.shift_schedule && <div className="flex items-start gap-3"><Clock className="w-4 h-4 mt-1 text-gray-500"/><div><strong>Shift:</strong> {employee.shift_schedule}</div></div>}
                    {employee.salary && <div className="flex items-start gap-3"><DollarSign className="w-4 h-4 mt-1 text-gray-500"/><div><strong>Salary:</strong> {formatCurrency(employee.salary)}</div></div>}
                </div>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-3"><Phone className="w-4 h-4 mt-1 text-gray-500"/><div><strong>Phone:</strong> {employee.phone}</div></div>
                    <div className="flex items-start gap-3"><Mail className="w-4 h-4 mt-1 text-gray-500"/><div><strong>Email:</strong> {employee.email}</div></div>
                    <div className="flex items-start gap-3 md:col-span-2"><MapPin className="w-4 h-4 mt-1 text-gray-500"/><div><strong>Address:</strong> {employee.address}</div></div>
                </div>
            </div>
        </CardContent>
         <CardFooter className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handleEditClick}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Employee
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}