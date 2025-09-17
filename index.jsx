import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Patients from "./Patients";

import Appointments from "./Appointments";

import Laboratory from "./Laboratory";

import MedicalRecords from "./MedicalRecords";

import Pharmacy from "./Pharmacy";

import Billing from "./Billing";

import BedManagement from "./BedManagement";

import Inventory from "./Inventory";

import Departments from "./Departments";

import Employees from "./Employees";

import Services from "./Services";

import OTManagement from "./OTManagement";

import UserManagement from "./UserManagement";

import OPDManagement from "./OPDManagement";

import Demographic from "./Demographic";

import PreOPD from "./PreOPD";

import DepartmentOPD from "./DepartmentOPD";

import IPDNursingStation from "./IPDNursingStation";

import LabDepartment from "./LabDepartment";

import Accounts from "./Accounts";

import IPDDoctorStation from "./IPDDoctorStation";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Patients: Patients,
    
    Appointments: Appointments,
    
    Laboratory: Laboratory,
    
    MedicalRecords: MedicalRecords,
    
    Pharmacy: Pharmacy,
    
    Billing: Billing,
    
    BedManagement: BedManagement,
    
    Inventory: Inventory,
    
    Departments: Departments,
    
    Employees: Employees,
    
    Services: Services,
    
    OTManagement: OTManagement,
    
    UserManagement: UserManagement,
    
    OPDManagement: OPDManagement,
    
    Demographic: Demographic,
    
    PreOPD: PreOPD,
    
    DepartmentOPD: DepartmentOPD,
    
    IPDNursingStation: IPDNursingStation,
    
    LabDepartment: LabDepartment,
    
    Accounts: Accounts,
    
    IPDDoctorStation: IPDDoctorStation,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Patients" element={<Patients />} />
                
                <Route path="/Appointments" element={<Appointments />} />
                
                <Route path="/Laboratory" element={<Laboratory />} />
                
                <Route path="/MedicalRecords" element={<MedicalRecords />} />
                
                <Route path="/Pharmacy" element={<Pharmacy />} />
                
                <Route path="/Billing" element={<Billing />} />
                
                <Route path="/BedManagement" element={<BedManagement />} />
                
                <Route path="/Inventory" element={<Inventory />} />
                
                <Route path="/Departments" element={<Departments />} />
                
                <Route path="/Employees" element={<Employees />} />
                
                <Route path="/Services" element={<Services />} />
                
                <Route path="/OTManagement" element={<OTManagement />} />
                
                <Route path="/UserManagement" element={<UserManagement />} />
                
                <Route path="/OPDManagement" element={<OPDManagement />} />
                
                <Route path="/Demographic" element={<Demographic />} />
                
                <Route path="/PreOPD" element={<PreOPD />} />
                
                <Route path="/DepartmentOPD" element={<DepartmentOPD />} />
                
                <Route path="/IPDNursingStation" element={<IPDNursingStation />} />
                
                <Route path="/LabDepartment" element={<LabDepartment />} />
                
                <Route path="/Accounts" element={<Accounts />} />
                
                <Route path="/IPDDoctorStation" element={<IPDDoctorStation />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}