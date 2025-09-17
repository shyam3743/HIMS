
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Users, 
  Calendar, 
  Bed, 
  FlaskConical,
  BarChart,
  Activity
} from "lucide-react";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

const StatCard = ({ title, value, icon: Icon, color, link, queryParams = {} }) => {
  const url = link ? createPageUrl(link, queryParams) : '#';
  const Wrapper = link ? Link : 'div';

  return (
    <Wrapper to={url}>
      <Card className={`hover:shadow-lg transition-shadow duration-200 border-l-4 ${color}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              <p className="text-2xl font-bold text-gray-800">{value}</p>
            </div>
            <div className={`p-3 rounded-full bg-gray-100`}>
              <Icon className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Wrapper>
  );
};

export default function StatsGrid({ stats, isLoading }) {
  const today = new Date().toISOString().split('T')[0];

  const statCards = [
    { title: "Total Patients", value: stats.totalPatients, icon: Users, color: "border-blue-500", link: "Patients" },
    { title: "Today's Appointments", value: stats.todayAppointments, icon: Calendar, color: "border-purple-500", link: "Appointments", queryParams: { date: today } },
    { title: "Available Beds", value: stats.availableBeds, icon: Bed, color: "border-green-500", link: "BedManagement", queryParams: { status: 'Available' } },
    { title: "Pending Lab Orders", value: stats.pendingLabOrders, icon: FlaskConical, color: "border-yellow-500", link: "Laboratory", queryParams: { status: 'Pending' } },
    { title: "Total Revenue", value: formatCurrency(stats.totalRevenue), icon: BarChart, color: "border-emerald-500", link: "Billing" },
    { title: "Occupancy Rate", value: `${stats.occupancyRate}%`, icon: Activity, color: "border-red-500", link: "BedManagement" },
  ];
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array(6).fill(0).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((card, index) => (
        <StatCard key={index} {...card} />
      ))}
    </div>
  );
}
