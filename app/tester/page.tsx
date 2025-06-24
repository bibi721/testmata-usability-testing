"use client";

import React from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import TesterDashboardComponent from '@/components/TesterDashboardComponent';

const TesterPage = () => {
  return (
    <ProtectedRoute requiredUserType="tester">
      <TesterDashboardComponent />
    </ProtectedRoute>
  );
};

export default TesterPage;