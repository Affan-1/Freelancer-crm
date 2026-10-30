import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Clients from '../pages/Clients';
import Projects from '../pages/Projects';
import Invoices from '../pages/Invoices';
import Home from "../pages/Home";

import Calendar from '../pages/Calendar';
import Team from '../pages/Team';
import Notifications from '../pages/Notifications';
import InvitationResponse from '../pages/InvitationResponse';
const NotFound = () => <div className="p-8 text-center"><h1 className="text-4xl font-bold">404</h1><p>Page Not Found</p></div>;

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/invitation" element={<InvitationResponse />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clients/*" element={<Clients />} />
          <Route path="/projects/*" element={<Projects />} />
          <Route path="/invoices/*" element={<Invoices />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/notifications" element={<Notifications />} />
          
          {/* Admin only routes */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/team" element={<Team />} />
          </Route>
        </Route>
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
