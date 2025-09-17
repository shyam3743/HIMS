import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, LogOut, PlusCircle } from 'lucide-react';
import { differenceInYears } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddChargeForm from './AddChargeForm';
import AddNoteForm from './AddNoteForm';
import DailyChargesView from './DailyChargesView';
import NursingNotesView from './NursingNotesView';

export default function PatientCareLog({ bed, patient, charges, notes, inventory, onAddCharge, onAddNote, onDischarge }) {
  const [showAddCharge, setShowAddCharge] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  
  if (!bed || !patient) return null;

  const getPatientAge = (dob) => dob ? differenceInYears(new Date(), new Date(dob)) : 'N/A';

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex items-start justify-between">
              <div>
                  <CardTitle className="text-xl">{patient.first_name} {patient.last_name}</CardTitle>
                  <div className="text-sm text-gray-500 space-x-4 mt-1">
                      <span>MRN: {patient.mrn}</span>
                      <span>Age: {getPatientAge(patient.date_of_birth)}</span>
                      <span>Bed: {bed.bed_number} ({bed.ward_name})</span>
                  </div>
              </div>
              <Button variant="destructive" size="sm" onClick={onDischarge}>
                  <LogOut className="w-4 h-4 mr-2" /> Discharge
              </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
            <Tabs defaultValue="charges" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="charges">Charges Log</TabsTrigger>
                    <TabsTrigger value="notes">Nursing Notes</TabsTrigger>
                </TabsList>
                <TabsContent value="charges">
                    <DailyChargesView charges={charges} roomRate={bed.daily_rate} admissionDate={bed.admission_date} />
                </TabsContent>
                <TabsContent value="notes">
                    <NursingNotesView notes={notes} />
                </TabsContent>
            </Tabs>
        </CardContent>
        <CardFooter className="grid grid-cols-2 gap-4">
          <Button className="w-full" onClick={() => setShowAddCharge(true)}>
              <PlusCircle className="w-4 h-4 mr-2" /> Add New Charge
          </Button>
          <Button className="w-full" variant="outline" onClick={() => setShowAddNote(true)}>
              <PlusCircle className="w-4 h-4 mr-2" /> Add Nursing Note
          </Button>
        </CardFooter>
      </Card>

      {showAddCharge && (
        <AddChargeForm
            patient={patient}
            inventory={inventory}
            onClose={() => setShowAddCharge(false)}
            onSubmit={onAddCharge}
        />
      )}
      {showAddNote && (
          <AddNoteForm 
              patient={patient}
              bed={bed}
              onClose={() => setShowAddNote(false)}
              onSubmit={onAddNote}
          />
      )}
    </>
  );
}