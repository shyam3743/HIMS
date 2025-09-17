
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Users, User, Phone, Mail, Edit, Eye, Trash2 } from "lucide-react";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

export default function EmployeeList({ employees, isLoading, onEdit, onDelete, onView }) {
  const roleColors = {
    "Doctor": "bg-blue-100 text-blue-800",
    "Nurse": "bg-green-100 text-green-800",
    "Pharmacist": "bg-indigo-100 text-indigo-800",
    "Receptionist": "bg-purple-100 text-purple-800",
    "Laboratorist": "bg-yellow-100 text-yellow-800",
    "Accountant": "bg-pink-100 text-pink-800",
    "default": "bg-gray-100 text-gray-800"
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading employees...</div>;
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900">No employees found</h3>
        <p className="text-gray-500">Try adjusting your search filters.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Employee</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Salary</TableHead>
            <TableHead>Joined On</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{employee.first_name} {employee.last_name}</div>
                    <div className="text-sm text-gray-500">{employee.employee_code}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={roleColors[employee.role] || roleColors.default}>
                  {employee.role}
                </Badge>
              </TableCell>
              <TableCell>{employee.department_name}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  {employee.phone && <div className="flex items-center gap-1 text-sm"><Phone className="w-3 h-3 text-gray-400"/>{employee.phone}</div>}
                  {employee.email && <div className="flex items-center gap-1 text-sm"><Mail className="w-3 h-3 text-gray-400"/>{employee.email}</div>}
                </div>
              </TableCell>
              <TableCell>{formatCurrency(employee.salary)}</TableCell>
              <TableCell>{format(new Date(employee.date_of_joining), 'MMM dd, yyyy')}</TableCell>
              <TableCell>
                <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'} className={employee.status === 'Active' ? 'bg-green-100 text-green-800' : ''}>
                  {employee.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onView(employee)} title="View Details"><Eye className="w-4 h-4"/></Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(employee)} title="Edit Employee"><Edit className="w-4 h-4"/></Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => onDelete(employee)} title="Delete Employee"><Trash2 className="w-4 h-4"/></Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
