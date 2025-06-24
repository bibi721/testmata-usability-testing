"use client";

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import CustomerDashboard from '@/components/CustomerDashboard';

const DashboardPage = () => {
  return (
    <ProtectedRoute requiredUserType="customer">
      <CustomerDashboard />
    </ProtectedRoute>
  );
};

export default DashboardPage;