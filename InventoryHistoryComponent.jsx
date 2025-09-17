import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Package, Plus, Minus, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function InventoryHistoryComponent({ history, isLoading }) {
  const actionColors = {
    "Created": "bg-green-100 text-green-800",
    "Updated": "bg-blue-100 text-blue-800",
    "Deleted": "bg-red-100 text-red-800",
    "Stock Added": "bg-emerald-100 text-emerald-800",
    "Stock Reduced": "bg-orange-100 text-orange-800"
  };

  const actionIcons = {
    "Created": Package,
    "Updated": Edit,
    "Deleted": Trash2,
    "Stock Added": Plus,
    "Stock Reduced": Minus
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Inventory History ({history.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No history records</h3>
            <p className="text-gray-500">Inventory changes will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Changes</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((record) => {
                  const ActionIcon = actionIcons[record.action_type];
                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="text-sm">
                          {format(new Date(record.created_date), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(record.created_date), 'HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{record.item_name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {ActionIcon && <ActionIcon className="h-4 w-4" />}
                          <Badge variant="outline" className={actionColors[record.action_type]}>
                            {record.action_type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {record.quantity_change && (
                            <div>
                              Quantity: {record.quantity_change > 0 ? '+' : ''}{record.quantity_change}
                            </div>
                          )}
                          {record.action_type === 'Updated' && record.previous_values && (
                            <div className="text-xs text-gray-500">
                              Previous values changed
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{record.performed_by}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-600">
                          {record.reason || 'No reason provided'}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}