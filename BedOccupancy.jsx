import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Bed, TrendingUp, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function BedOccupancy({ occupancyRate, availableBeds, isLoading }) {
  const getOccupancyColor = (rate) => {
    if (rate >= 90) return "text-red-600";
    if (rate >= 75) return "text-orange-600"; 
    return "text-green-600";
  };

  const getProgressColor = (rate) => {
    if (rate >= 90) return "bg-red-500";
    if (rate >= 75) return "bg-orange-500";
    return "bg-green-500";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Bed className="w-5 h-5" />
          Bed Occupancy
        </CardTitle>
        <p className="text-sm text-gray-500">Current hospital capacity</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-2 w-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <div className={`text-3xl font-bold ${getOccupancyColor(occupancyRate)}`}>
                {occupancyRate}%
              </div>
              <div className="text-sm text-gray-500">Occupied</div>
            </div>
            
            <Progress 
              value={occupancyRate} 
              className="h-2"
            />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Available Beds</span>
                <span className="font-medium text-green-600">{availableBeds}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Occupancy Status</span>
                <span className={`font-medium ${getOccupancyColor(occupancyRate)}`}>
                  {occupancyRate >= 90 ? "Critical" : occupancyRate >= 75 ? "High" : "Normal"}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <TrendingUp className="w-3 h-3" />
                <span>Updated in real-time</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}