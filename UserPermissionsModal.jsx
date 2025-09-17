import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X, Save } from "lucide-react";

const modules = [
  { id: "dashboard", name: "Dashboard", permissions: ["view"] },
  { id: "patients", name: "Patients", permissions: ["view", "edit", "create", "delete"] },
  { id: "opdManagement", name: "OPD Management", permissions: ["view", "edit", "create"] }, // NEW
  { id: "demographic", name: "Demographic", permissions: ["view", "edit", "create"] },
  { id: "preOpd", name: "Pre OPD", permissions: ["view", "edit", "create"] },
  { id: "medicalRecords", name: "Medical Records", permissions: ["view", "edit", "create", "delete"] },
  { id: "laboratory", name: "Laboratory", permissions: ["view", "edit", "create", "delete"] },
  { id: "pharmacy", name: "Pharmacy", permissions: ["view", "edit", "create", "delete"] },
  { id: "billing", name: "Hospital Billing", permissions: ["view", "edit", "create", "delete"] },
  { id: "accounts", name: "Accounts", permissions: ["view"] },
  { id: "ipdDoctorStation", name: "IPD Doctor Station", permissions: ["view", "edit", "create"] }, // NEW
  { id: "nursingStation", name: "IPD Nursing Station", permissions: ["view", "edit", "create", "delete"] },
  { id: "bedManagement", name: "IPD Bed Management", permissions: ["view", "edit", "create", "delete"] },
  { id: "inventory", name: "Inventory Management", permissions: ["view", "edit", "create", "delete"] },
  { id: "departments", name: "Departments", permissions: ["view", "edit", "create", "delete"] },
  { id: "employees", name: "Employees", permissions: ["view", "edit", "create", "delete"] },
  { id: "services", name: "Services", permissions: ["view", "edit", "create", "delete"] },
  { id: "otManagement", name: "OT Management", permissions: ["view", "edit", "create", "delete"] },
  { id: "departmentOPD", name: "Department OPD Pages", permissions: ["view", "edit", "create"] }, // NEW
  { id: "labDepartment", name: "Lab Department Pages", permissions: ["view", "edit", "create"] }, // NEW
  { id: "userManagement", name: "User Management", permissions: ["view"] },
];

export default function UserPermissionsModal({ user, onClose, onSave }) {
  const [permissions, setPermissions] = useState(user.permissions || {});

  const handlePermissionChange = (module, permission, value) => {
    setPermissions(prev => ({
      ...prev,
      [module]: {
        ...prev[module],
        [permission]: value,
      },
    }));
  };

  const handleSave = () => {
    onSave(user.id, permissions);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Edit Permissions for {user.full_name}</CardTitle>
            <p className="text-sm text-gray-500">Note: Admins have all permissions by default unless explicitly denied.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map(module => (
              <div key={module.id} className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-3">{module.name}</h4>
                <div className="space-y-2">
                  {module.permissions.map(p => (
                    <div key={p} className="flex items-center justify-between">
                      <Label htmlFor={`${module.id}-${p}`} className="capitalize">{p}</Label>
                      <Switch
                        id={`${module.id}-${p}`}
                        checked={permissions[module.id]?.[p] || false}
                        onCheckedChange={(value) => handlePermissionChange(module.id, p, value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Permissions
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}