
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bed, Plus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function OccupiedBedList({ beds, isLoading, selectedBedId, onSelectBed, onAssignBed }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
            <Bed className="w-5 h-5"/>
            In-Patient List
        </CardTitle>
        <Button size="sm" onClick={onAssignBed}>
            <Plus className="w-4 h-4 mr-2" /> Assign Bed
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Loading patient list...</p>
        ) : beds.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No patients are currently admitted.</p>
        ) : (
          <div className="space-y-2">
            {beds.map(bed => (
              <button
                key={bed.id}
                onClick={() => onSelectBed(bed)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                  selectedBedId === bed.id 
                    ? 'bg-blue-100 border-blue-500' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="font-semibold">{bed.current_patient_name}</div>
                <div className="text-sm text-gray-600">
                  <span>Bed: {bed.bed_number} ({bed.ward_name})</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {bed.admission_date ? `Admitted ${formatDistanceToNow(new Date(bed.admission_date), { addSuffix: true })}` : 'Admission date not set'}
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
