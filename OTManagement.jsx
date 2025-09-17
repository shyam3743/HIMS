
import React, { useState, useEffect } from "react";
import { OTSchedule } from "@/api/entities";
import { Patient } from "@/api/entities";
import { Employee } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scissors, Plus, Calendar, Clock, Users } from "lucide-react";

import OTForm from "../components/ot-management/OTForm";
import OTList from "../components/ot-management/OTList";
import OTStats from "../components/ot-management/OTStats";

export default function OTManagement() {
  const [otSchedules, setOtSchedules] = useState([]);
  const [patients, setPatients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [otData, patientData, empData] = await Promise.all([
        OTSchedule.list('-created_date'),
        Patient.list(),
        Employee.filter({ role: 'Doctor' })
      ]);
      setOtSchedules(otData);
      setPatients(patientData);
      setEmployees(empData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  const handleCreateOTSchedule = async (otData) => {
    try {
      await OTSchedule.create(otData);
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Error creating OT schedule:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Operation Theater Management</h1>
          <p className="text-gray-600">Schedule and manage surgical procedures</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Schedule Surgery
        </Button>
      </div>

      {/* Stats */}
      <OTStats otSchedules={otSchedules} />

      {/* OT Schedule List */}
      <OTList
        otSchedules={otSchedules}
        isLoading={isLoading}
        onRefresh={loadData}
      />

      {/* OT Form Modal */}
      {showForm && (
        <OTForm
          patients={patients}
          surgeons={employees}
          onSubmit={handleCreateOTSchedule}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
