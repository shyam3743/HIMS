import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, AlertTriangle, Calendar, RefreshCw } from "lucide-react";
import { format } from "date-fns";

const statusColors = {
  "In Stock": "bg-green-100 text-green-800 border-green-200",
  "Low Stock": "bg-orange-100 text-orange-800 border-orange-200",
  "Out of Stock": "bg-red-100 text-red-800 border-red-200",
  "Expired": "bg-gray-100 text-gray-800 border-gray-200"
};

const categoryColors = {
  "Medications": "bg-blue-100 text-blue-700",
  "Medical Supplies": "bg-green-100 text-green-700",
  "Equipment": "bg-purple-100 text-purple-700",
  "Consumables": "bg-yellow-100 text-yellow-700",
  "Reagents": "bg-pink-100 text-pink-700",
  "Surgical Instruments": "bg-indigo-100 text-indigo-700"
};

export default function InventoryManagement({ inventory, isLoading, onRefresh }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Inventory Items ({inventory.length})
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory items found</h3>
            <p className="text-gray-500">No inventory items have been added yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inventory.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{item.item_name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Code: {item.item_code}</span>
                      {item.manufacturer && (
                        <>
                          <span>•</span>
                          <span>{item.manufacturer}</span>
                        </>
                      )}
                      {item.batch_number && (
                        <>
                          <span>•</span>
                          <span>Batch: {item.batch_number}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <span className="text-gray-600">
                        Qty: <strong>{item.quantity_on_hand}</strong>
                      </span>
                      <span className="text-gray-600">
                        Min: {item.minimum_stock_level}
                      </span>
                      {item.unit_cost && (
                        <span className="text-gray-600">
                          Cost: ${item.unit_cost}
                        </span>
                      )}
                    </div>
                    {item.expiry_date && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Calendar className="w-4 h-4" />
                        <span>Expires: {format(new Date(item.expiry_date), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={categoryColors[item.category]}>
                    {item.category}
                  </Badge>
                  <Badge variant="outline" className={statusColors[item.status]}>
                    {item.status}
                  </Badge>
                  {(item.status === "Low Stock" || item.status === "Out of Stock") && (
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}