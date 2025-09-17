
import React, { useState, useEffect } from "react";
import { Department } from "@/api/entities";
import { Employee } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Users, Phone, Mail, MapPin } from "lucide-react";
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

import DepartmentForm from "../components/departments/DepartmentForm";
import DepartmentList from "../components/departments/DepartmentList";
import DepartmentStats from "../components/departments/DepartmentStats";

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [deletingDepartment, setDeletingDepartment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [deptData, empData] = await Promise.all([
        Department.list('-created_date'),
        Employee.list()
      ]);
      setDepartments(deptData);
      setEmployees(empData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  const handleSaveDepartment = async (deptData) => {
    try {
      if (editingDepartment) {
        await Department.update(editingDepartment.id, deptData);
      } else {
        const code = deptData.code || deptData.name.substring(0, 4).toUpperCase();
        await Department.create({ ...deptData, code });
      }
      setShowForm(false);
      setEditingDepartment(null);
      loadData();
    } catch (error) {
      console.error('Error saving department:', error);
    }
  };
  
  const handleDeleteDepartment = async () => {
    if (!deletingDepartment) return;
    try {
      await Department.delete(deletingDepartment.id);
      setDeletingDepartment(null);
      loadData();
    } catch (error) {
      console.error('Error deleting department:', error);
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setShowForm(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Department Management</h1>
          <p className="text-gray-600">Manage hospital departments and staff</p>
        </div>
        <Button 
          onClick={() => { setShowForm(true); setEditingDepartment(null); }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Stats */}
      <DepartmentStats departments={departments} employees={employees} />

      {/* Department List */}
      <DepartmentList
        departments={departments}
        employees={employees}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={setDeletingDepartment}
      />

      {/* Department Form Modal */}
      {showForm && (
        <DepartmentForm
          employees={employees.filter(emp => emp.role === 'Doctor')}
          onSubmit={handleSaveDepartment}
          onCancel={() => {setShowForm(false); setEditingDepartment(null);}}
          department={editingDepartment}
        />
      )}

      {/* Delete Confirmation */}
      {deletingDepartment && (
        <AlertDialog open onOpenChange={() => setDeletingDepartment(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the department: {deletingDepartment.name}. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteDepartment} className="bg-red-600 hover:bg-red-700">
                Yes, delete department
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
