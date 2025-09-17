
import React, { useState, useEffect, useCallback } from "react";
import { Employee } from "@/api/entities";
import { Department } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import EmployeeForm from "../components/employees/EmployeeForm";
import EmployeeList from "../components/employees/EmployeeList";
import EmployeeStats from "../components/employees/EmployeeStats";
import EmployeeDetails from "../components/employees/EmployeeDetails"; // Implemented: New import for EmployeeDetails

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deletingEmployee, setDeletingEmployee] = useState(null);
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");

  const filterEmployees = useCallback(() => {
    let filtered = employees;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.first_name?.toLowerCase().includes(query) ||
        emp.last_name?.toLowerCase().includes(query) ||
        emp.employee_code?.toLowerCase().includes(query) ||
        emp.email?.toLowerCase().includes(query)
      );
    }

    if (filterRole !== "all") {
      filtered = filtered.filter(emp => emp.role === filterRole);
    }

    if (filterDepartment !== "all") {
      filtered = filtered.filter(emp => emp.department_id === filterDepartment);
    }

    setFilteredEmployees(filtered);
  }, [employees, searchQuery, filterRole, filterDepartment]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [filterEmployees]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [empData, deptData] = await Promise.all([
        Employee.list('-created_date'),
        Department.list()
      ]);
      const employeesWithDept = empData.map(emp => {
        const dept = deptData.find(d => d.id === emp.department_id);
        return {...emp, department_name: dept?.name || 'N/A' };
      });
      setEmployees(employeesWithDept);
      setDepartments(deptData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  const handleSaveEmployee = async (empData) => {
    try {
      if (editingEmployee) {
        await Employee.update(editingEmployee.id, empData);
      } else {
        const empCode = empData.employee_code || `EMP${Date.now()}`;
        await Employee.create({ ...empData, employee_code: empCode });
      }
      setShowForm(false);
      setEditingEmployee(null);
      loadData();
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };
  
  const handleDeleteEmployee = async () => {
    if(!deletingEmployee) return;
    try {
      await Employee.delete(deletingEmployee.id);
      setDeletingEmployee(null);
      loadData();
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
    setViewingEmployee(null); // Close details modal if editing from it
  };

  const roles = ["Doctor", "Nurse", "Laboratorist", "Pharmacist", "Receptionist", "Accountant", "Representative", "Case Manager", "Technician"];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600">Manage hospital staff and their information</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(true);
            setEditingEmployee(null);
            setViewingEmployee(null); // Ensure details modal is closed when adding new employee
          }}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>

      {/* Stats */}
      <EmployeeStats employees={employees} />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Employee List */}
      <EmployeeList
        employees={filteredEmployees}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={setDeletingEmployee}
        onView={setViewingEmployee}
      />

      {/* Employee Form Modal */}
      {showForm && (
        <EmployeeForm
          departments={departments}
          onSubmit={handleSaveEmployee}
          onCancel={() => {
            setShowForm(false);
            setEditingEmployee(null);
          }}
          employee={editingEmployee}
        />
      )}
      
      {/* Delete Confirmation Dialog */}
      {deletingEmployee && (
        <AlertDialog open onOpenChange={() => setDeletingEmployee(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the employee record for {deletingEmployee.first_name} {deletingEmployee.last_name}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteEmployee} className="bg-red-600 hover:bg-red-700">
                Yes, delete employee
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Employee Details Modal - Implemented */}
      {viewingEmployee && (
        <EmployeeDetails 
          employee={viewingEmployee}
          onClose={() => setViewingEmployee(null)}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
