import React, { useState, useEffect, useCallback } from "react";
import { Bill } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Landmark, Receipt, Pill } from "lucide-react";
import AccountsBillList from "../components/billing/AccountsBillList";

export default function Accounts() {
  const [hospitalBills, setHospitalBills] = useState([]);
  const [pharmacyBills, setPharmacyBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const allBills = await Bill.list('-created_date');
      const hospital = allBills.filter(bill => bill.bill_type === 'OPD' || bill.bill_type === 'IPD');
      const pharmacy = allBills.filter(bill => bill.bill_type === 'Pharmacy');
      
      setHospitalBills(hospital);
      setPharmacyBills(pharmacy);
    } catch (error) {
      console.error('Error loading billing data:', error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts Overview</h1>
          <p className="text-gray-600">Review and manage all hospital and pharmacy financial records.</p>
        </div>
      </div>

      <Tabs defaultValue="hospital" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="hospital">
            <Receipt className="w-4 h-4 mr-2" />
            Hospital Billing ({hospitalBills.length})
          </TabsTrigger>
          <TabsTrigger value="pharmacy">
            <Pill className="w-4 h-4 mr-2" />
            Pharmacy Billing ({pharmacyBills.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="hospital" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Hospital Bills (OPD & IPD)</CardTitle>
            </CardHeader>
            <CardContent>
              <AccountsBillList bills={hospitalBills} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pharmacy" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pharmacy Bills</CardTitle>
            </CardHeader>
            <CardContent>
              <AccountsBillList bills={pharmacyBills} isLoading={isLoading} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}