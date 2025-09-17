import React from 'react';
import { format } from 'date-fns';
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Clock } from 'lucide-react';

// Safe date formatting function
const safeFormatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, 'MMM dd, yyyy HH:mm');
  } catch (error) {
    return 'Invalid date';
  }
};

const NursingNotesView = ({ notes = [] }) => {
    if (notes.length === 0) {
        return <p className="text-gray-500 text-center py-4">No nursing notes recorded yet.</p>;
    }

    return (
        <ScrollArea className="h-72 w-full rounded-md border p-4">
            <div className="space-y-4">
                {notes.map(note => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-800 mb-2">{note.note || 'No note content'}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                             <div className="flex items-center gap-2">
                                <User className="w-3 h-3"/>
                                <span>{note.nurse_name || 'Unknown nurse'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3"/>
                                <span>{safeFormatDateTime(note.created_date)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
};

export default NursingNotesView;