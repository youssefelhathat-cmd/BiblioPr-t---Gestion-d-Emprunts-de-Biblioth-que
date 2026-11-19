/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LibraryProvider, useLibrary } from './context/LibraryContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { Toasts } from './components/Toasts';
import { LoginView } from './components/auth/LoginView';
import { StudentPortalView } from './components/views/StudentPortalView';
import { CatalogView } from './components/views/CatalogView';
import { DashboardView } from './components/views/DashboardView';
import { LoansView } from './components/views/LoansView';
import { OverdueDashboardView } from './components/views/OverdueDashboardView';
import { ReservationsManagementView } from './components/views/ReservationsManagementView';
import { NewLoanModal } from './components/modals/NewLoanModal';
import { QRScannerModal } from './components/scanner/QRScannerModal';

function AppContent() {
  const { session } = useLibrary();

  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    return session.role === 'responsable' ? 'dashboard' : 'student-portal';
  });

  const [isNewLoanOpen, setIsNewLoanOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [preselectedBookId, setPreselectedBookId] = useState<string | undefined>(undefined);

  // Sync active tab when session role changes
  useEffect(() => {
    if (session.role === 'responsable') {
      if (activeTab === 'student-portal') {
        setActiveTab('dashboard');
      }
    } else if (session.role === 'student') {
      if (activeTab === 'dashboard' || activeTab === 'loans' || activeTab === 'reservations' || activeTab === 'overdue') {
        setActiveTab('student-portal');
      }
    }
  }, [session.role]);

  // If user is not authenticated -> Show the official Authentication Portal (Student or Responsable)
  if (!session.isAuthenticated || (!session.student && !session.librarian)) {
    return (
      <LoginView
        onSuccess={() => {
          if (session.role === 'responsable') {
            setActiveTab('dashboard');
          } else {
            setActiveTab('student-portal');
          }
        }}
      />
    );
  }

  const isResponsable = session.role === 'responsable';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Dynamic Navbar based on role */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isResponsable ? (
          /* Espace Responsable de la Bibliothèque */
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                onOpenNewLoan={() => {
                  setPreselectedBookId(undefined);
                  setIsNewLoanOpen(true);
                }}
                onOpenQRScanner={() => setIsScannerOpen(true)}
                onNavigateToTab={(tab) => setActiveTab(tab as ActiveTab)}
              />
            )}

            {activeTab === 'reservations' && <ReservationsManagementView />}

            {activeTab === 'loans' && (
              <LoansView
                onOpenNewLoan={() => {
                  setPreselectedBookId(undefined);
                  setIsNewLoanOpen(true);
                }}
                onOpenQRScanner={() => setIsScannerOpen(true)}
              />
            )}

            {activeTab === 'catalog' && (
              <CatalogView
                onOpenNewLoanWithBook={(bookId) => {
                  setPreselectedBookId(bookId);
                  setIsNewLoanOpen(true);
                }}
              />
            )}

            {activeTab === 'overdue' && (
              <OverdueDashboardView onScanReturn={() => setIsScannerOpen(true)} />
            )}
          </>
        ) : (
          /* Espace Étudiant (Livres strictement disponibles & Tableau de bord réservé au Responsable) */
          <>
            {activeTab === 'catalog' ? (
              <CatalogView
                onOpenNewLoanWithBook={undefined}
                onBackToStudentPortal={() => setActiveTab('student-portal')}
              />
            ) : (
              <StudentPortalView onNavigateToTab={(tab) => setActiveTab(tab)} />
            )}
          </>
        )}
      </main>

      {/* Responsable Action Modals */}
      {isResponsable && (
        <>
          <NewLoanModal
            isOpen={isNewLoanOpen}
            onClose={() => {
              setIsNewLoanOpen(false);
              setPreselectedBookId(undefined);
            }}
            preselectedBookId={preselectedBookId}
          />

          <QRScannerModal
            isOpen={isScannerOpen}
            onClose={() => setIsScannerOpen(false)}
          />
        </>
      )}

      {/* Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="font-serif font-bold text-slate-800">
            École Supérieure de Technologie de Fès (EST) · Université Sidi Mohamed Ben Abdellah
          </div>
          <div>
            {isResponsable
              ? 'Administration Centrale · Service du Prêt & Gestion Documentaire'
              : 'Portail officiel du service des prêts et des réservations pour étudiants'}
          </div>
        </div>
      </footer>

      <Toasts />
    </div>
  );
}

export default function App() {
  return (
    <LibraryProvider>
      <AppContent />
    </LibraryProvider>
  );
}
