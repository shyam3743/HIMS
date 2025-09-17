import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Clock, CheckCircle, ArrowRight, User } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function OPDDepartmentOverview({ departments, isLoading }) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  // Add special departments
  const specialDepartments = [
    {
      name: "Demographics",
      description: "Patient registration and demographic data collection",
      location: "Ground Floor Reception",
      totalPatients: 0, // This would be calculated from actual data
      waiting: 0,
      inProgress: 0,
      completed: 0,
      isSpecial: true,
      link: "Demographic"
    },
    {
      name: "Pre OPD",
      description: "Pre-consultation screening and vital signs",
      location: "1st Floor Pre-OPD Area",
      totalPatients: 0,
      waiting: 0,
      inProgress: 0,
      completed: 0,
      isSpecial: true,
      link: "PreOPD"
    }
  ];

  const allDepartments = [...specialDepartments, ...departments];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {allDepartments.map((dept) => (
        <Card key={dept.name} className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  dept.isSpecial 
                    ? 'bg-gradient-to-r from-gray-500 to-gray-600' 
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                }`}>
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">{dept.name}</CardTitle>
                  <p className="text-sm text-gray-500">{dept.description || dept.specialty}</p>
                </div>
              </div>
              {dept.status && (
                <Badge className="bg-green-100 text-green-800 text-xs">
                  {dept.status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Location */}
              {dept.location && (
                <div className="text-sm text-gray-600">
                  📍 {dept.location}
                </div>
              )}

              {/* Patient Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{dept.totalPatients || 0}</div>
                  <div className="text-xs text-gray-600">Total Today</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-xl font-bold text-yellow-600">{dept.waiting || 0}</div>
                  <div className="text-xs text-gray-600">Waiting</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">{dept.inProgress || 0}</div>
                  <div className="text-xs text-gray-600">In Progress</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{dept.completed || 0}</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
              </div>

              {/* Department Details */}
              {dept.opd_timings && (
                <div className="text-sm text-gray-600 border-t pt-3">
                  <div>🕒 {dept.opd_timings}</div>
                  <div>📅 {dept.opd_days}</div>
                  {dept.phone && <div>📞 {dept.phone}</div>}
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2">
                {dept.isSpecial ? (
                  <Link to={createPageUrl(dept.link)} className="w-full">
                    <Button className="w-full bg-gray-600 hover:bg-gray-700 text-sm">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Go to {dept.name}
                    </Button>
                  </Link>
                ) : (
                  <Link to={createPageUrl("DepartmentOPD", { department: dept.name })} className="w-full">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Go to {dept.name} OPD
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {allDepartments.length === 0 && (
        <Card className="col-span-full">
          <CardContent className="text-center py-8">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No OPD Departments</h3>
            <p className="text-gray-500">Configure departments with OPD services to see them here</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}