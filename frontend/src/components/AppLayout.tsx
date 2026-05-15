import {
  Navigate,
  Outlet,
} from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import Sidebar from './Sidebar';

import type {
  UserRole,
} from '../api';

import './AppLayout.css';

interface Props {
  requiredRole?: UserRole;
}

export default function AppLayout({
  requiredRole,
}: Props) {
  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />

        <span
          className="mono"
          style={{
            color:
              'var(--text3)',

            fontSize: 13,
          }}
        >
          Authenticating…
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  const roleOrder: Record<
    UserRole,
    number
  > = {
    USER: 1,
    ADMIN: 2,
  };

  if (
    requiredRole &&
    roleOrder[
      user.role || 'USER'
    ] <
      roleOrder[
        requiredRole
      ]
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}