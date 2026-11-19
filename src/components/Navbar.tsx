import React from 'react';
import { useLibrary } from '../context/LibraryContext';
import {
  LogOut,
  BookOpen,
  User,
  Mail,
  ShieldCheck,
  LayoutDashboard,
  Layers,
  Clock,
  Inbox,
  BookmarkCheck,
} from 'lucide-react';

export type ActiveTab =
  | 'student-portal'
  | 'catalog'
  | 'dashboard'
  | 'reservations'
  | 'loans'
  | 'overdue';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { session, logout, automatedEmails, reservations, availableBooks } = useLibrary();

  const isResponsable = session.role === 'responsable';
  const student = session.student;
  const librarian = session.librarian;

  // Emails automatiques destinés à l'étudiant
  const myAutomatedEmails = student
    ? automatedEmails.filter((e) => e.studentId === student.id)
    : [];
  const urgentEmailsCount = myAutomatedEmails.filter(
    (e) => e.gravity === 'moderee' || e.gravity === 'elevee' || e.gravity === 'critique'
  ).length;

  // Réservations en attente pour le Responsable
  const pendingReservationsCount = reservations.filter((r) => r.status === 'en_attente').length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark EST Fès */}
        <button
          onClick={() => setActiveTab(isResponsable ? 'dashboard' : 'student-portal')}
          className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-serif hover:text-blue-900 transition-colors whitespace-nowrap flex items-center gap-2.5 cursor-pointer text-left"
        >
          <span
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-sans shadow-xs border ${
              isResponsable
                ? 'bg-slate-900 text-amber-400 border-amber-400'
                : 'bg-blue-900 text-white border-amber-400'
            }`}
          >
            EST
          </span>
          <div className="flex flex-col">
            <span className="leading-tight">
              {isResponsable ? 'Administration BU EST Fès' : 'BiblioPrêt EST Fès'}
            </span>
            <span className="text-[10px] font-sans font-normal text-slate-500">
              {isResponsable ? 'Espace Responsable Bibliothèque' : 'Espace Numérique Étudiant · USMBA'}
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-stretch h-16 gap-1 lg:gap-2">
          {isResponsable ? (
            /* Navigation Responsable */
            <>
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className={`h-full flex items-center gap-1.5 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'border-slate-900 text-slate-950 font-bold bg-slate-100/60'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                <span>Tableau de Bord</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reservations')}
                className={`h-full flex items-center gap-2 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'reservations'
                    ? 'border-blue-900 text-blue-950 font-bold bg-blue-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-blue-700" />
                <span>Réservations</span>
                {pendingReservationsCount > 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                    {pendingReservationsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('loans')}
                className={`h-full flex items-center gap-1.5 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'loans'
                    ? 'border-blue-900 text-blue-950 font-bold bg-blue-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>Gestion Emprunts</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className={`h-full flex items-center gap-1.5 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'catalog'
                    ? 'border-blue-900 text-blue-950 font-bold bg-blue-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Fonds Documentaire (55)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('overdue')}
                className={`h-full flex items-center gap-1.5 px-3.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'overdue'
                    ? 'border-rose-900 text-rose-950 font-bold bg-rose-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                <span>Retards & Relances</span>
              </button>
            </>
          ) : (
            /* Navigation Étudiant */
            <>
              <button
                type="button"
                onClick={() => setActiveTab('student-portal')}
                className={`h-full flex items-center gap-2 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'student-portal'
                    ? 'border-blue-900 text-blue-950 font-bold bg-blue-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <span>Mon Espace Étudiant</span>
                {urgentEmailsCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 animate-pulse">
                    <Mail className="w-3 h-3" />
                    {urgentEmailsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('catalog')}
                className={`h-full flex items-center gap-1.5 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'catalog'
                    ? 'border-blue-900 text-blue-950 font-bold bg-blue-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>Livres disponibles ({availableBooks.length})</span>
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Profil & Déconnexion */}
        <div className="flex items-center gap-3">
          {isResponsable && librarian && (
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xs shadow-xs border border-amber-400">
                FA
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {librarian.fullName}
                </div>
                <div className="text-[10px] text-amber-900 font-semibold">
                  Responsable BU · EST Fès
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-1"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {!isResponsable && student && (
            <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xs shadow-xs border border-amber-300">
                {student.fullName.charAt(0)}
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {student.fullName}
                </div>
                <div className="text-[10px] text-blue-800 font-mono font-medium">
                  {student.cne} · {student.school} Fès
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer ml-1"
                title="Se déconnecter"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex items-center border-t border-slate-100 bg-slate-50/90 px-3 py-1.5 overflow-x-auto gap-1">
        {isResponsable ? (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`py-1.5 px-2.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Tableau de Bord
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reservations')}
              className={`py-1.5 px-2.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                activeTab === 'reservations' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              <span>Réservations</span>
              {pendingReservationsCount > 0 && (
                <span className="px-1 py-0.2 rounded-full bg-amber-500 text-white text-[9px]">
                  {pendingReservationsCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('loans')}
              className={`py-1.5 px-2.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'loans' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Emprunts
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`py-1.5 px-2.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'catalog' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Fonds EST
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('overdue')}
              className={`py-1.5 px-2.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'overdue' ? 'bg-rose-900 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              Retards
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setActiveTab('student-portal')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all text-center whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'student-portal'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              <span>Mon Espace Étudiant</span>
              {urgentEmailsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                  {urgentEmailsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('catalog')}
              className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-all text-center whitespace-nowrap cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Livres disponibles ({availableBooks.length})
            </button>
          </>
        )}
      </div>
    </header>
  );
};
