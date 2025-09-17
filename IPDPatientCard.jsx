import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Bed, Calendar, FlaskConical, Pill, FileText } from 'lucide-react';
import { formatDistanceToNow, differenceInYears } from 'date-fns';

const getAge = (dob) => {
    if (!dob) return 'N/A';
    try {
        const age = differenceInYears(new Date(), new Date(dob));
        return isNaN(age) ? 'N/A' : age;
    } catch {
        return 'N/A';
    }
};

const getAdmissionDuration = (admissionDate) => {
    if (!admissionDate) return 'N/A';
    try {
        const date = new Date(admissionDate);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return formatDistanceToNow(date, { addSuffix: true });
    } catch {
        return 'Invalid Date';
    }
};

export default function IPDPatientCard({ bed, patient, onSelect }) {
    const isSelected = onSelect && true;

    return (
        <Card className={`transition-all hover:shadow-md ${isSelected ? 'border-blue-500' : ''}`}>
            <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5"/> 
                            {patient.first_name} {patient.last_name}
                        </CardTitle>
                        <CardDescription>MRN: {patient.mrn} • Age: {getAge(patient.date_of_birth)}</CardDescription>
                    </div>
                    <Badge variant="secondary">{patient.gender}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                        <Bed className="w-4 h-4 text-gray-500"/>
                        <span>Bed: <strong>{bed.bed_number}</strong> ({bed.ward_name})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500"/>
                        <span>Admitted: {getAdmissionDuration(bed.admission_date)}</span>
                    </div>
                </div>
                {onSelect && (
                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                        <Button size="sm" variant="outline" onClick={() => onSelect('order_test')}>
                            <FlaskConical className="w-4 h-4 mr-2"/> Order Test
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onSelect('order_prescription')}>
                            <Pill className="w-4 h-4 mr-2"/> Order Prescription
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => onSelect('add_note')}>
                            <FileText className="w-4 h-4 mr-2"/> Add Doctor's Note
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}