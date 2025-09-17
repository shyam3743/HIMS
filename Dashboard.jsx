
import React, { useState, useEffect } from "react";
import { Patient } from "@/api/entities";
import { Appointment } from "@/api/entities";
import { MedicalRecord } from "@/api/entities";
import { LabOrder } from "@/api/entities";
import { Prescription } from "@/api/entities";
import { Bill } from "@/api/entities";
import { Bed } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Users, 
  Calendar, 
  Activity, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Clock,
  UserCheck,
  Bed as BedIcon,
  AlertCircle,
  CheckCircle,
  FlaskConical,
  Heart
} from "lucide-react";
import { format } from "date-fns";

import StatsGrid from "../components/dashboard/StatsGrid";
import RecentActivity from "../components/dashboard/RecentActivity";
import AppointmentOverview from "../components/dashboard/AppointmentOverview";
import BedOccupancy from "../components/dashboard/BedOccupancy";
import QuickActions from "../components/dashboard/QuickActions";

// Safe date formatting function
const safeFormatDate = (dateString, formatStr = 'HH:mm') => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, formatStr);
  } catch (error) {
    return 'Invalid date';
  }
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    availableBeds: 0,
    pendingLabOrders: 0,
    totalRevenue: 0,
    occupancyRate: 0
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [patients, allAppointments, beds, labOrders, bills] = await Promise.all([
        Patient.list(),
        Appointment.list('-created_date'),
        Bed.list(),
        LabOrder.list(),
        Bill.list()
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayAppointments = allAppointments.filter(apt => apt.appointment_date === today);
      const availableBeds = beds.filter(bed => bed.status === 'Available');
      const pendingLabOrders = labOrders.filter(order => ['Ordered', 'Sample Collected', 'In Process'].includes(order.status));
      const totalRevenue = bills.reduce((sum, bill) => sum + (bill.total_amount || 0), 0);
      const occupancyRate = beds.length > 0 ? ((beds.length - availableBeds.length) / beds.length) * 100 : 0;

      setStats({
        totalPatients: patients.length,
        todayAppointments: todayAppointments.length,
        availableBeds: availableBeds.length,
        pendingLabOrders: pendingLabOrders.length,
        totalRevenue,
        occupancyRate: Math.round(occupancyRate)
      });

      setRecentAppointments(todayAppointments.slice(0, 5));
      
      const activity = [
        ...allAppointments.slice(0, 3).map(apt => ({
          id: apt.id,
          type: 'appointment',
          title: `New appointment scheduled`,
          description: `${apt.patient_name} - ${apt.department}`,
          time: apt.created_date,
          icon: Calendar,
          color: 'blue'
        })),
        ...labOrders.slice(0, 2).map(order => ({
          id: order.id,
          type: 'lab',
          title: `Lab order placed`,
          description: `${order.test_name} for ${order.patient_name}`,
          time: order.created_date,
          icon: FlaskConical,
          color: 'purple'
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
    setIsLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {getGreeting()}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                Here's what's happening at your hospital today
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {safeFormatDate(new Date().toISOString())}
                </div>
                <div className="text-blue-200 text-sm">
                  {safeFormatDate(new Date().toISOString(), 'EEEE, MMM dd')}
                </div>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={stats} isLoading={isLoading} />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AppointmentOverview 
            appointments={recentAppointments}
            isLoading={isLoading}
          />
          <RecentActivity 
            activities={recentActivity}
            isLoading={isLoading}
          />
        </div>

        <div className="space-y-6">
          <QuickActions />
          <BedOccupancy 
            occupancyRate={stats.occupancyRate}
            availableBeds={stats.availableBeds}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
