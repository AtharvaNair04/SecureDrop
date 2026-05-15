import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/AppLayout';

import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SubmitPage   from './pages/SubmitPage';
import { MyDropsPage, DropDetailPage } from './pages/DropsPage';
import { AllDropsPage } from './pages/AllDropsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/"         element={<Navigate to="/dashboard" replace />} />

          {/* Authenticated — any role */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/submit"    element={<SubmitPage />} />
            <Route path="/drops"     element={<AllDropsPage />} />
            <Route path="/my-drops"  element={<MyDropsPage />} />
            <Route path="/my-drops/:id" element={<DropDetailPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
