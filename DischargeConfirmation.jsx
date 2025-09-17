import React, { useState } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function DischargeConfirmation({ bed, onConfirm, onCancel }) {
  const [dischargeDetails, setDischargeDetails] = useState({
    doctorName: "",
    finalDiagnosis: "",
    dischargeSummary: ""
  });

  if (!bed || !bed.admission_date) {
    return (
      <AlertDialog open onOpenChange={onCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>
              Cannot calculate discharge details. Admission date is missing or bed information is incomplete.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancel}>Close</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  const admissionDate = parseISO(bed.admission_date);
  const dischargeDate = new Date();
  let stayDays = differenceInDays(dischargeDate, admissionDate);
  if (stayDays < 1) stayDays = 1;

  const roomCharges = stayDays * (bed.daily_rate || 0);

  const handleConfirm = () => {
    if (!dischargeDetails.doctorName) {
      alert("Please enter the discharging doctor's name");
      return;
    }
    onConfirm(bed, dischargeDetails);
  };

  return (
    <AlertDialog open onOpenChange={onCancel}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Patient Discharge</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to discharge <span className="font-semibold">{bed.current_patient_name}</span> from bed <span className="font-semibold">{bed.bed_number}</span>?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-2">Billing Summary</h4>
            <p>Stay Duration: {stayDays} day(s)</p>
            <p>Room Rate: ₹{bed.daily_rate} / day</p>
            <p className="font-bold text-lg mt-2">Total Room Charges: ₹{roomCharges.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">A new IPD bill will be generated with these charges.</p>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="doctorName">Discharging Doctor Name *</Label>
              <Input
                id="doctorName"
                value={dischargeDetails.doctorName}
                onChange={(e) => setDischargeDetails({...dischargeDetails, doctorName: e.target.value})}
                placeholder="Enter doctor's name"
                required
              />
            </div>

            <div>
              <Label htmlFor="finalDiagnosis">Final Diagnosis</Label>
              <Input
                id="finalDiagnosis"
                value={dischargeDetails.finalDiagnosis}
                onChange={(e) => setDischargeDetails({...dischargeDetails, finalDiagnosis: e.target.value})}
                placeholder="Enter final diagnosis"
              />
            </div>

            <div>
              <Label htmlFor="dischargeSummary">Discharge Summary</Label>
              <Textarea
                id="dischargeSummary"
                value={dischargeDetails.dischargeSummary}
                onChange={(e) => setDischargeDetails({...dischargeDetails, dischargeSummary: e.target.value})}
                placeholder="Enter discharge summary and instructions"
                rows={3}
              />
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} className="bg-red-600 hover:bg-red-700">
            Confirm Discharge & Bill
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}