import React from 'react';
import AlertBar from './AlertBar';
import ProfessionalNavbar from './ProfessionalNavbar';

const AppLayout = ({ children }) => {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Alert Bar */}
      <AlertBar />
      
      {/* Professional Navbar */}
      <ProfessionalNavbar />
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
