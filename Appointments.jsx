
import React, { useState, useEffect } from "react";
import { Appointment } from "@/api/entities";
import { Patient } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Plus, User, Filter, Search } from "lucide-react";
import { format } from "date-fns";

import AppointmentForm from "../components/appointments/AppointmentForm";
import AppointmentCalendar from "../components/appointments/AppointmentCalendar";
import AppointmentList from "../components/appointments/AppointmentList";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [deletingAppointment, setDeletingAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [appointmentData, patientData] = await Promise.all([
        Appointment.list('-created_date'),
        Patient.list()
      ]);
      setAppointments(appointmentData);
      setPatients(patientData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setIsLoading(false);
  };

  const handleSaveAppointment = async (appointmentData) => {
    try {
      if (editingAppointment) {
        await Appointment.update(editingAppointment.id, appointmentData);
      } else {
        await Appointment.create(appointmentData);
      }
      setShowForm(false);
      setEditingAppointment(null);
      loadData();
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const handleDeleteAppointment = async () => {
    if (!deletingAppointment) return;
    try {
      await Appointment.delete(deletingAppointment.id);
      setDeletingAppointment(null);
      loadData();
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  const filteredAppointments = appointments.filter(apt => {
    const statusMatch = filterStatus === "all" || apt.status === filterStatus;
    const dateMatch = apt.appointment_date === selectedDate;
    return statusMatch && dateMatch;
  });

  const todayAppointments = appointments.filter(apt => 
    apt.appointment_date === new Date().toISOString().split('T')[0]
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
          <p className="text-gray-600">Schedule and manage patient appointments</p>
        </div>
        <Button 
          onClick={() => { setShowForm(true); setEditingAppointment(null); }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* ... Cards ... */}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AppointmentList
            appointments={filteredAppointments}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={setDeletingAppointment}
          />
        </div>
        <div>
          <AppointmentCalendar
            appointments={appointments}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        </div>
      </div>

      {/* Appointment Form Modal */}
      {showForm && (
        <AppointmentForm
          patients={patients}
          onSubmit={handleSaveAppointment}
          onCancel={() => { setShowForm(false); setEditingAppointment(null); }}
          appointment={editingAppointment}
        />
      )}
      
      {/* TODO: Add Delete Confirmation Dialog */}
    </div>
  );
}
