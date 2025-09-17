
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2,
  Users,
  Phone,
  Mail,
  MapPin,
  Edit,
  Trash2, // Added Trash2 icon
  UserCheck
} from "lucide-react";

// Updated props: removed onRefresh, added onEdit and onDelete
export default function DepartmentList({ departments, employees, isLoading, onEdit, onDelete }) {
  const getEmployeeCount = (deptId) => {
    return employees.filter(emp => emp.department_id === deptId).length;
  };

  const statusColors = {
    "Active": "bg-green-100 text-green-800 border-green-200",
    "Inactive": "bg-gray-100 text-gray-800 border-gray-200"
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          All Departments ({departments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {departments.length === 0 ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
            <p className="text-gray-500">Add your first department to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {departments.map((dept) => (
              // Added flex flex-col to Card for proper footer alignment
              <Card key={dept.id} className="hover:shadow-lg transition-shadow duration-200 flex flex-col">
                <CardHeader className="flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">{dept.name}</CardTitle>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs mt-1 inline-block">
                      {dept.code}
                    </code>
                  </div>
                  <Badge variant="outline" className={statusColors[dept.status] || statusColors.Active}>
                    {dept.status || 'Active'}
                  </Badge>
                </CardHeader>
                {/* Added flex-grow to CardContent */}
                <CardContent className="space-y-3 flex-grow">
                  {/* Added description field */}
                  {dept.description && (
                    <p className="text-sm text-gray-600 italic">"{dept.description}"</p>
                  )}
                  
                  <div className="space-y-2 border-t pt-3">
                    {dept.head_doctor_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <UserCheck className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">HOD:</span> {dept.head_doctor_name}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Staff:</span> {getEmployeeCount(dept.id)}
                    </div>
                    {dept.location && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Location:</span> {dept.location}
                      </div>
                    )}
                    {dept.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Phone:</span> {dept.phone}
                      </div>
                    )}
                    {dept.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Email:</span> {dept.email}
                      </div>
                    )}
                  </div>
                </CardContent>
                {/* Updated action buttons */}
                <div className="flex justify-end gap-2 p-4 border-t mt-auto">
                    {/* Changed variant and added onClick handler for Edit */}
                    <Button variant="outline" size="sm" onClick={() => onEdit(dept)}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    {/* Added Delete button */}
                    <Button variant="destructive" size="sm" onClick={() => onDelete(dept)}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
