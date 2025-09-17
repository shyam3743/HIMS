import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Save } from "lucide-react";

export default function AddNoteForm({ patient, bed, onClose, onSubmit }) {
    const [note, setNote] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!note.trim()) {
            alert("Note cannot be empty.");
            return;
        }

        const noteData = {
            patient_id: patient.mrn,
            patient_name: `${patient.first_name} ${patient.last_name}`,
            bed_id: bed.id,
            note: note,
            nurse_name: "Nurse Jane Doe", // TODO: Replace with actual logged-in user name
        };
        
        onSubmit(noteData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Add Nursing Note</CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="note">Note for {patient.first_name} {patient.last_name}</Label>
                            <Textarea
                                id="note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Enter clinical observations, patient status, etc."
                                rows={5}
                                required
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                <Save className="w-4 h-4 mr-2" />
                                Save Note
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}