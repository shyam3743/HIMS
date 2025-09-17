import React, { useState, useEffect } from "react";
import { Appointment } from "@/api/entities";
import { Patient } from "@/api/entities";
import { Employee } from "@/api/entities";
import { Department } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Stethoscope, Clock, CheckCircle, ArrowRight, User, Calendar, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import OPDPipeline from "../components/opd/OPDPipeline";
import OPDDepartmentOverview from "../components/opd/OPDDepartmentOverview";
import OPDPatientFlow from "../components/opd/OPDPatientFlow";

export default function OPDManagement() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [appointmentData, patientData, employeeData, departmentData] = await Promise.all([
        Appointment.list('-created_date'),
        Patient.list(),
        Employee.list(),
        Department.list()
      ]);
      
      setAppointments(appointmentData);
      setPatients(patientData);
      setEmployees(employeeData);
      setDepartments(departmentData.filter(d => d.has_opd && d.status === 'Active'));
    } catch (error) {
      console.error('Error loading OPD data:', error);
    }
    setIsLoading(false);
  };

  // Get today's appointments for pipeline
  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter(apt => apt.appointment_date === today);

  // Statistics for different stages
  const demographicsCount = todayAppointments.filter(apt => apt.department === "Demographics").length;
  const preOPDCount = todayAppointments.filter(apt => apt.department === "Pre-OPD" || apt.status === "Pre-OPD").length;
  const scheduledCount = todayAppointments.filter(apt => apt.status === "Scheduled").length;
  const inProgressCount = todayAppointments.filter(apt => apt.status === "In Progress").length;
  const completedCount = todayAppointments.filter(apt => apt.status === "Completed").length;

  // Department-wise breakdown
  const departmentStats = departments.map(dept => {
    const deptAppointments = todayAppointments.filter(apt => apt.department === dept.name);
    return {
      ...dept,
      totalPatients: deptAppointments.length,
      waiting: deptAppointments.filter(apt => apt.status === "Scheduled").length,
      inProgress: deptAppointments.filter(apt => apt.status === "In Progress").length,
      completed: deptAppointments.filter(apt => apt.status === "Completed").length
    };
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OPD Management Hub</h1>
          <p className="text-gray-600">Central OPD oversight - monitor patient flow across all departments</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>Today: {new Date().toLocaleDateString()}</span>
          <Badge className="bg-blue-100 text-blue-800 ml-3">
            {todayAppointments.length} Total Patients
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-bold text-gray-700">{demographicsCount}</div>
            <div className="text-sm text-gray-500">Demographics</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{preOPDCount}</div>
            <div className="text-sm text-gray-500">Pre OPD</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{scheduledCount}</div>
            <div className="text-sm text-gray-500">Waiting</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">{inProgressCount}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div className="text-2xl font-bold text-green-600">{completedCount}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            <Building2 className="w-4 h-4 mr-2" />
            Department Overview
          </TabsTrigger>
          <TabsTrigger value="pipeline">
            <ArrowRight className="w-4 h-4 mr-2" />
            Patient Pipeline
          </TabsTrigger>
          <TabsTrigger value="flow">
            <Users className="w-4 h-4 mr-2" />
            Patient Flow Today
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OPDDepartmentOverview
            departments={departmentStats}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="pipeline">
          <OPDPipeline
            appointments={todayAppointments}
            departments={departments}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="flow">
          <OPDPatientFlow
            appointments={todayAppointments}
            patients={patients}
            departments={departments}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}