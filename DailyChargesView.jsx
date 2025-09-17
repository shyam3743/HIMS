
import React from 'react';
import { format, eachDayOfInterval, startOfDay } from 'date-fns';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const DailyChargesView = ({ charges, roomRate, admissionDate }) => {
    const groupedCharges = charges.reduce((acc, charge) => {
        const date = format(new Date(charge.created_date), 'yyyy-MM-dd');
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(charge);
        return acc;
    }, {});
    
    // Add room charges for each day of stay
    if (admissionDate) {
      try {
        const stayDays = eachDayOfInterval({
            start: new Date(admissionDate),
            end: new Date()
        });

        stayDays.forEach(day => {
            const date = format(day, 'yyyy-MM-dd');
            if (!groupedCharges[date]) {
                groupedCharges[date] = [];
            }
        });
      } catch (e) {
        console.error("Invalid admissionDate for DailyChargesView:", admissionDate, e);
      }
    }

    const sortedDates = Object.keys(groupedCharges).sort((a, b) => new Date(b) - new Date(a));

    if (sortedDates.length === 0) {
        return <p className="text-gray-500 text-center py-4">No charges logged yet.</p>;
    }

    return (
        <ScrollArea className="h-72 w-full rounded-md border p-4">
            <div className="space-y-4">
                {sortedDates.map(date => {
                    const dailyTotal = groupedCharges[date].reduce((sum, item) => sum + item.total_price, 0);
                    const isToday = format(new Date(), 'yyyy-MM-dd') === date;
                    const isAdmissionDay = format(new Date(admissionDate), 'yyyy-MM-dd') === date;

                    return (
                        <div key={date}>
                            <h4 className="font-semibold mb-2 text-gray-800">{format(new Date(date), 'MMMM dd, yyyy')}</h4>
                            <div className="space-y-2 text-sm">
                                {/* Room Charge */}
                                 <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                                    <div>
                                        <span className="font-medium text-blue-800">Room Charge</span>
                                    </div>
                                    <div className="font-semibold text-blue-800">₹{roomRate.toFixed(2)}</div>
                                </div>
                                {/* Item Charges */}
                                {groupedCharges[date].map(charge => (
                                    <div key={charge.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <div>
                                            <span className="font-medium">{charge.item_name}</span>
                                            <span className="text-gray-500 ml-2">(Qty: {charge.quantity})</span>
                                        </div>
                                        <div className="font-semibold">₹{charge.total_price.toFixed(2)}</div>
                                    </div>
                                ))}
                                <div className="flex justify-end font-bold text-base pt-2 border-t">
                                    Daily Total: ₹{(dailyTotal + roomRate).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </ScrollArea>
    );
};

export default DailyChargesView;
