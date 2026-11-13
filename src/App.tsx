/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { SplashScreen } from './components/public/SplashScreen';
import { PublicWebsite } from './views/public/PublicWebsite';
import { Layout } from './components/Layout';
import { Dashboard } from './views/Dashboard';
import { Projects } from './views/Projects';
import { Properties } from './views/Properties';
import { Leads } from './views/Leads';
import { Settings } from './views/Settings';
import { OwnerHotspotSimulator } from './views/admin/OwnerHotspotSimulator';
import { PropertyDetailDrawer } from './components/PropertyDetailDrawer';
import { PropertyFormModal } from './components/PropertyFormModal';
import { ProjectFormModal } from './components/ProjectFormModal';
import { LeadDetailDrawer } from './components/LeadDetailDrawer';
import { Login } from './views/Login';

const AdminViewRouter: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'projects' && <Projects />}
      {activeTab === 'properties' && <Properties />}
      {activeTab === 'leads' && <Leads />}
      {activeTab === 'hotspot-simulator' && <OwnerHotspotSimulator />}
      {activeTab === 'settings' && <Settings />}

      {/* Global Drawers & Modals for Admin Portal */}
      <PropertyDetailDrawer />
      <PropertyFormModal />
      <ProjectFormModal />
      <LeadDetailDrawer />
    </>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, currentMode } = useApp();

  // 5-Second Mandatory Splash Screen on initial application entry
  const [showSplash, setShowSplash] = useState<boolean>(false);

  if (showSplash) {
    return (
      <AnimatePresence>
        <SplashScreen onComplete={() => setShowSplash(false)} />
      </AnimatePresence>
    );
  }

  // Strictly separate Public Customer Website and Authenticated Admin Portal
  if (currentMode === 'admin') {
    if (!isAuthenticated) {
      return <Login />;
    }

    return (
      <Layout>
        <AdminViewRouter />
      </Layout>
    );
  }

  // Default: Public Customer Website (NO LOGIN REQUIRED)
  return <PublicWebsite />;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

