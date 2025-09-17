
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Employee } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserCog, Plus, Key, Edit, Eye, EyeOff, Copy } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import UserPermissionsModal from "../components/user-management/UserPermissionsModal";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  
  // Create user form state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [userData, employeeData] = await Promise.all([
        User.list(),
        Employee.list()
      ]);
      setUsers(userData);
      setEmployees(employeeData);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
    setIsLoading(false);
  };

  const handleOpenPermissions = (user) => {
    setSelectedUser(user);
    setShowPermissionsModal(true);
  };

  const handleSavePermissions = async (userId, permissions) => {
    try {
      await User.update(userId, { permissions });
      setShowPermissionsModal(false);
      setSelectedUser(null);
      loadData();
    } catch (error) {
      console.error("Error saving permissions:", error);
    }
  };

  const generateCredentials = () => {
    const employee = employees.find(emp => emp.id === selectedEmployeeId);
    if (!employee) return;

    // Create a proper username from employee details
    const username = `${employee.first_name.toLowerCase()}.${employee.last_name.toLowerCase()}`.replace(/[^a-z.]/g, '');
    // Generate a secure password
    const password = Math.random().toString(36).slice(-8) + Math.floor(Math.random() * 100);
    
    setGeneratedCredentials({
      username,
      password,
      employee
    });
  };

  const handleCreateUser = async () => {
    if (!generatedCredentials) {
      alert("Please generate credentials first.");
      return;
    }

    try {
      // Create user with proper employee linking
      const userData = {
        username: generatedCredentials.username,
        employee_id: generatedCredentials.employee.id, // Use actual employee ID
        role: generatedCredentials.employee.role === 'Doctor' ? 'admin' : 'user',
        permissions: getDefaultPermissions(generatedCredentials.employee.role),
        // Store password securely (in real implementation, this should be hashed)
        credentials: {
          username: generatedCredentials.username,
          password: generatedCredentials.password
        }
      };

      await User.create(userData);
      
      alert(`User account created successfully!\n\nCredentials:\nUsername: ${generatedCredentials.username}\nPassword: ${generatedCredentials.password}\n\n⚠️ Please save these credentials securely. The password won't be shown again.`);
      
      setShowCreateUserModal(false);
      setSelectedEmployeeId("");
      setGeneratedCredentials(null);
      loadData();
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user account. Please try again.");
    }
  };

  const getDefaultPermissions = (role) => {
    // Set default permissions based on employee role
    const basePermissions = {
      dashboard: { view: true },
      patients: { view: true, create: true, edit: true },
      appointments: { view: true, create: true, edit: true },
      medicalRecords: { view: true, create: true, edit: true }
    };

    switch (role) {
      case 'Doctor':
        return {
          ...basePermissions,
          laboratory: { view: true, create: true, edit: true },
          pharmacy: { view: true, create: true },
          billing: { view: true },
        };
      case 'Nurse':
        return {
          ...basePermissions,
          nursingStation: { view: true, create: true, edit: true },
          bedManagement: { view: true },
          laboratory: { view: true },
        };
      case 'Pharmacist':
        return {
          ...basePermissions,
          pharmacy: { view: true, create: true, edit: true },
          inventory: { view: true, create: true, edit: true },
        };
      case 'Laboratorist':
        return {
          ...basePermissions,
          laboratory: { view: true, create: true, edit: true },
        };
      default:
        return basePermissions;
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const getEmployeeForUser = (user) => {
    return employees.find(emp => emp.id === user.employee_id);
  };
  
  const unlinkedEmployees = employees.filter(emp => 
    !users.some(u => u.employee_id === emp.id)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">User & Role Management</h1>
          <p className="text-gray-600">Create user accounts and manage permissions</p>
        </div>
        <Button onClick={() => setShowCreateUserModal(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Create User Account
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>System Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => {
                  const employee = getEmployeeForUser(user);
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{employee ? `${employee.first_name} ${employee.last_name}` : user.full_name}</p>
                          <p className="text-sm text-gray-500">{employee?.email || user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {user.username || user.email}
                        </code>
                      </TableCell>
                      <TableCell>{employee?.role || 'N/A'}</TableCell>
                      <TableCell>{employee?.department_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleOpenPermissions(user)}>
                          <Edit className="w-4 h-4 mr-2" /> Edit Permissions
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {showPermissionsModal && selectedUser && (
        <UserPermissionsModal
          user={selectedUser}
          onSave={handleSavePermissions}
          onClose={() => setShowPermissionsModal(false)}
        />
      )}

      <Dialog open={showCreateUserModal} onOpenChange={setShowCreateUserModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="employee-select">Select Employee *</Label>
               <Select value={selectedEmployeeId} onValueChange={(value) => {
                 setSelectedEmployeeId(value);
                 setGeneratedCredentials(null);
               }}>
                  <SelectTrigger id="employee-select">
                    <SelectValue placeholder="Choose an employee..." />
                  </SelectTrigger>
                  <SelectContent>
                    {unlinkedEmployees.length > 0 ? unlinkedEmployees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.first_name} {emp.last_name} - {emp.role}
                      </SelectItem>
                    )) : (
                      <div className="p-4 text-sm text-gray-500">No available employees to link.</div>
                    )}
                  </SelectContent>
                </Select>
            </div>

            {selectedEmployeeId && !generatedCredentials && (
              <Button onClick={generateCredentials} variant="outline" className="w-full">
                <Key className="w-4 h-4 mr-2" />
                Generate Login Credentials
              </Button>
            )}

            {generatedCredentials && (
              <div className="space-y-4 p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800">Generated Credentials</h4>
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm text-gray-600">Username</Label>
                    <div className="flex items-center gap-2">
                      <Input value={generatedCredentials.username} readOnly className="bg-white" />
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(generatedCredentials.username)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600">Password</Label>
                    <div className="flex items-center gap-2">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        value={generatedCredentials.password} 
                        readOnly 
                        className="bg-white" 
                      />
                      <Button variant="ghost" size="icon" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => copyToClipboard(generatedCredentials.password)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-green-700">
                  ⚠️ Please save these credentials securely. They won't be shown again.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateUserModal(false);
              setSelectedEmployeeId("");
              setGeneratedCredentials(null);
            }}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateUser} 
              disabled={!generatedCredentials}
              className="bg-green-600 hover:bg-green-700"
            >
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
