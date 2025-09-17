import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Stethoscope, DollarSign, Clock } from 'lucide-react';

export default function ServiceList({ services, isLoading, onRefresh, onEdit, onDelete }) {
  if (isLoading) {
    return <p>Loading services...</p>;
  }

  return (
    <Card>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Price (INR)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.length > 0 ? services.map((service) => (
              <TableRow key={service.id}>
                <TableCell className="font-medium">{service.service_name}</TableCell>
                <TableCell>{service.category}</TableCell>
                <TableCell>{service.department || 'N/A'}</TableCell>
                <TableCell>₹{service.base_price?.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={service.is_active ? "default" : "destructive"}>
                    {service.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(service)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(service)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan="6" className="text-center">No services found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}