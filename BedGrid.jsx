import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bed as BedIcon, User, Edit, Clock, RefreshCw, MoreVertical, Check, X, SprayCan } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BedGrid({ beds, isLoading, onRefresh, onEdit, onStatusUpdate }) {
  const statusConfig = {
    Available: { color: 'bg-green-500', text: 'Available', icon: BedIcon },
    Occupied: { color: 'bg-red-500', text: 'Occupied', icon: User },
    Cleaning: { color: 'bg-blue-500', text: 'Cleaning', icon: SprayCan },
    'Under Maintenance': { color: 'bg-yellow-500', text: 'Maintenance', icon: Edit },
    Reserved: { color: 'bg-purple-500', text: 'Reserved', icon: Clock },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (beds.length === 0) {
    return (
        <div className="text-center py-8">
            <BedIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No beds found</h3>
            <p className="text-gray-500">Try adjusting your filters or add a new bed.</p>
        </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {beds.map((bed) => {
        const config = statusConfig[bed.status] || { color: 'bg-gray-400', text: 'Unknown', icon: BedIcon };
        const Icon = config.icon;

        return (
          <Card key={bed.id} className="flex flex-col relative overflow-hidden">
            <div className={`absolute top-0 left-0 h-full w-1.5 ${config.color}`}></div>
            <CardHeader className="flex flex-row items-start justify-between pl-6 pr-2 py-4">
              <div>
                <CardTitle className="text-lg font-bold">{bed.bed_number}</CardTitle>
                <p className="text-sm text-gray-500">{bed.ward_name}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onEdit(bed)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit Bed Details</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onStatusUpdate(bed, 'Available')}>
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    <span>Set as Available</span>
                  </DropdownMenuItem>
                   <DropdownMenuItem onClick={() => onStatusUpdate(bed, 'Cleaning')}>
                    <SprayCan className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Set for Cleaning</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onStatusUpdate(bed, 'Under Maintenance')}>
                    <Edit className="mr-2 h-4 w-4 text-yellow-500" />
                    <span>Set for Maintenance</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="flex-grow pl-6">
              {bed.status === 'Occupied' ? (
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-red-500" />
                    <span className="font-semibold text-gray-800">{bed.current_patient_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>Admitted on {bed.admission_date}</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Check className="w-4 h-4" />
                  <span>Available</span>
                </div>
              )}
            </CardContent>
            <CardFooter className="bg-gray-50 pl-6 py-2">
                <Badge variant="secondary">₹{bed.daily_rate}/day</Badge>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}