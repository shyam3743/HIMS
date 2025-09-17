import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";

export default function AppointmentCalendar({ appointments, selectedDate, setSelectedDate }) {
  const currentMonth = new Date(selectedDate);
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAppointmentsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return appointments.filter(apt => apt.appointment_date === dateStr);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Calendar View
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="font-semibold text-lg text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
        </div>
        
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {daysInMonth.map((day) => {
            const dayAppointments = getAppointmentsForDate(day);
            const isSelected = isSameDay(day, new Date(selectedDate));
            const isToday = isSameDay(day, new Date());
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(format(day, 'yyyy-MM-dd'))}
                className={`
                  p-2 min-h-[48px] text-sm border rounded-lg transition-colors
                  ${isSelected ? 'bg-blue-500 text-white border-blue-500' : 'hover:bg-gray-100 border-gray-200'}
                  ${isToday && !isSelected ? 'bg-blue-50 border-blue-200' : ''}
                `}
              >
                <div className="font-medium">{format(day, 'd')}</div>
                {dayAppointments.length > 0 && (
                  <div className="mt-1">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs px-1 ${isSelected ? 'bg-blue-400 text-blue-100' : 'bg-blue-100 text-blue-800'}`}
                    >
                      {dayAppointments.length}
                    </Badge>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-100 rounded"></div>
              <span>Has appointments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Selected date</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}