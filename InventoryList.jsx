import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Edit, Trash2, Plus, Minus, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function InventoryList({ inventory, isLoading, onRefresh, onEdit, onDelete, onStockUpdate }) {
  const [stockUpdates, setStockUpdates] = useState({});

  const handleStockChange = (itemId, change) => {
    const reason = prompt(`Please enter reason for ${change > 0 ? 'adding' : 'reducing'} stock:`);
    if (reason) {
      onStockUpdate(itemId, change, reason);
    }
  };

  const statusColors = {
    "In Stock": "bg-green-100 text-green-800",
    "Low Stock": "bg-yellow-100 text-yellow-800",
    "Out of Stock": "bg-red-100 text-red-800",
    "Expired": "bg-gray-100 text-gray-800",
    "Recalled": "bg-purple-100 text-purple-800"
  };

  const categoryColors = {
    "Medications": "bg-blue-100 text-blue-800",
    "Medical Supplies": "bg-green-100 text-green-800",
    "Equipment": "bg-purple-100 text-purple-800",
    "Consumables": "bg-orange-100 text-orange-800",
    "Reagents": "bg-pink-100 text-pink-800",
    "Surgical Instruments": "bg-indigo-100 text-indigo-800"
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
          <Package className="w-5 h-5" />
          Inventory Items ({inventory.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {inventory.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items</h3>
            <p className="text-gray-500">Start by adding your first inventory item.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Item Details</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Pricing (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.item_name}</div>
                        <div className="text-sm text-gray-500">Code: {item.item_code}</div>
                        {item.manufacturer && (
                          <div className="text-xs text-gray-400">{item.manufacturer}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={categoryColors[item.category]}>
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.quantity_on_hand}</span>
                          <div className="flex gap-1">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6"
                              onClick={() => handleStockChange(item.id, -1)}
                              disabled={item.quantity_on_hand <= 0}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6"
                              onClick={() => handleStockChange(item.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Min: {item.minimum_stock_level}
                        </div>
                        {item.quantity_on_hand <= item.minimum_stock_level && (
                          <div className="flex items-center gap-1 text-yellow-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="text-xs">Low Stock</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">Cost: ₹{item.unit_cost?.toFixed(2) || '0.00'}</div>
                        <div className="text-sm">Sale: ₹{item.selling_price?.toFixed(2) || '0.00'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColors[item.status]}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.expiry_date ? (
                        <div className="text-sm">
                          {format(new Date(item.expiry_date), 'MMM dd, yyyy')}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No expiry</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onEdit(item)}
                          title="Edit Item"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => onDelete(item)}
                          title="Delete Item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}