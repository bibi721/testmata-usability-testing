"use client";

import ProtectedRoute from '@/components/ProtectedRoute';
import TesterDashboardComponent from '@/components/TesterDashboardComponent';

export default function TesterDashboardPage() {
  return (
    <ProtectedRoute requiredUserType="tester">
      <TesterDashboardComponent />
    </ProtectedRoute>
  );
}
