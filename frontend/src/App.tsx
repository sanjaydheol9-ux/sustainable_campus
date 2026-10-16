import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/hooks/useTheme';
import { ToastProvider } from '@/components/Toast';
import { LandingPage } from '@/pages/LandingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ReportViewPage } from '@/pages/ReportViewPage';

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/app" element={<DashboardPage />} />
            <Route path="/app/report/:id" element={<ReportViewPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
