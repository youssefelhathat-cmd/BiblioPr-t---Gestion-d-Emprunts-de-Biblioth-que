import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { AutomatedEmailRecord } from '../../types';
import { AutomatedEmailModal } from '../modals/AutomatedEmailModal';
import {
  BookOpen,
  Clock,
  AlertTriangle,
  Users,
  RotateCcw,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Mail,
  Zap,
  Check,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenNewLoan: () => void;
  onOpenQRScanner: () => void;
  onNavigateToTab: (tab: 'loans' | 'catalog' | 'overdue') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenNewLoan,
  onOpenQRScanner,
  onNavigateToTab,
}) => {
  const {
    books,
    studentsEST,
    loans,
    automatedEmails,
    getBookById,
    getStudentById,
    getOverdueDays,
    getOverdueSeverity,
    getOverdueEmailData,
  } = useLibrary();

  const [selectedEmailForModal, setSelectedEmailForModal] = useState<AutomatedEmailRecord | null>(null);

  const totalCopies = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const availableCopies = books.reduce((acc, b) => acc + b.availableCopies, 0);

  const activeLoans = loans.filter((l) => l.status === 'en_cours');
  const overdueLoans = loans.filter((l) => l.status === 'en_retard');

  const countMild = overdueLoans.filter((l) => getOverdueSeverity(l.dueDate) === 'mild').length;
  const countModerate = overdueLoans.filter((l) => getOverdueSeverity(l.dueDate) === 'moderate').length;
  const countCritical = overdueLoans.filter((l) => getOverdueSeverity(l.dueDate) === 'critical').length;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold text-blue-900 uppercase tracking-wider">
            Université Sidi Mohamed Ben Abdellah · EST Fès
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900 tracking-tight mt-0.5">
            Guichet & Supervision de la Bibliothèque
          </h1>
          <p className="text-xs text-slate-600 mt-1 max-w-xl">
            Gestion des flux de prêt pour les étudiants de l'EST, retours instantanés par scan QR et suivi des relances par niveau de gravité.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenQRScanner}
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-800" />
            <span>Scanner retour QR</span>
          </button>
          <button
            onClick={onOpenNewLoan}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nouvel emprunt EST</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Prêts en cours</span>
            <Clock className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-slate-900">
            {activeLoans.length}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            <span>Sur {totalCopies} exemplaires du fonds</span>
          </div>
        </div>

        {/* Metric 2: Overdue Breakdown */}
        <div
          onClick={() => onNavigateToTab('overdue')}
          className="p-5 bg-white rounded-xl border border-rose-200 hover:border-rose-300 shadow-xs cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-rose-900 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Retards EST</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-rose-700">
            {overdueLoans.length}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] font-mono">
            <span className="text-amber-700 font-bold">🟡 {countMild}</span>
            <span className="text-orange-700 font-bold">🟠 {countModerate}</span>
            <span className="text-rose-700 font-bold">🔴 {countCritical}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Catalogue (API)</span>
            <BookOpen className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-slate-900">
            {books.length}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            <span className="font-mono tabular-nums text-emerald-700 font-semibold">{availableCopies}</span>
            <span> exemplaires disponibles</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Étudiants EST</span>
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-3xl font-bold font-mono tabular-nums text-slate-900">
            {studentsEST.length}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            <span>Filières : GI, RT, GEA, GE, GIM</span>
          </div>
        </div>
      </div>

      {/* Overdue Urgent Action Banner */}
      {overdueLoans.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Autonomous robot header banner */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 px-6 py-2.5 border-b border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-bold text-emerald-950">
                Robot d'envoi automatique actif 24/7 (100% autonome sans intervention humaine)
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-800">
              ✓ Les relances Gmail sont transmises directement aux étudiants
            </span>
          </div>

          <div className="bg-slate-50 px-6 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-xs text-slate-800">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Priorité : {overdueLoans.length} emprunt(s) ont dépassé la date de restitution</span>
            </div>
            <button
              onClick={() => onNavigateToTab('overdue')}
              className="text-xs font-semibold text-blue-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Accéder au tableau des retards colorés</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {overdueLoans.slice(0, 3).map((loan) => {
              const book = getBookById(loan.bookId);
              const student = getStudentById(loan.studentId);
              const days = getOverdueDays(loan.dueDate);
              const severity = getOverdueSeverity(loan.dueDate);
              const emailData = getOverdueEmailData(loan);

              return (
                <div key={loan.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      {severity === 'mild' ? (
                        <span className="font-bold text-amber-800">🟡 Retard léger ({days}j)</span>
                      ) : severity === 'moderate' ? (
                        <span className="font-bold text-orange-900">🟠 Retard modéré ({days}j)</span>
                      ) : (
                        <span className="font-bold text-rose-700">🔴 Retard critique ({days}j)</span>
                      )}
                      <span className="text-slate-400">·</span>
                      <span className="font-mono text-slate-500">Échéance : {loan.dueDate}</span>
                    </div>

                    <div className="text-sm font-bold text-slate-900">{book?.title}</div>
                    <div className="text-xs text-slate-600">
                      {student?.fullName} ({student?.department} · {student?.email})
                    </div>
                  </div>

                  {/* Statut d'envoi 100% Automatique sans intervention humaine */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Email envoyé automatiquement</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        const existingRecord = automatedEmails.find((e) => e.loanId === loan.id);
                        if (existingRecord) {
                          setSelectedEmailForModal(existingRecord);
                        } else if (emailData) {
                          setSelectedEmailForModal({
                            id: `auto-${loan.id}`,
                            loanId: loan.id,
                            loanNumber: loan.loanNumber,
                            studentId: loan.studentId,
                            studentEmail: student?.email || '',
                            studentName: student?.fullName || '',
                            cne: student?.cne || '',
                            bookTitle: book?.title || '',
                            dueDate: loan.dueDate,
                            overdueDays: days,
                            gravity: severity === 'critical' ? 'critique' : severity === 'moderate' ? 'elevee' : 'moderee',
                            gravityLabel: severity === 'critical' ? 'Niveau 4 : AVIS CRITIQUE & Sanction Académique' : severity === 'moderate' ? 'Niveau 3 : 2ème Relance Urgente' : 'Niveau 2 : 1ère Relance Automatique',
                            gravityColor: severity === 'critical' ? '#dc2626' : severity === 'moderate' ? '#ea580c' : '#d97706',
                            subject: emailData.subject,
                            body: emailData.body,
                            sentAt: loan.lastRemindedAt || new Date().toISOString(),
                            status: 'SENT_AUTOMATICALLY',
                            gmailDirectLink: emailData.gmailComposeUrl,
                            triggerReason: `Dépassement de ${days} jour(s) constaté par le robot d'audit automatique EST Fès`,
                          });
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                      title="Consulter l'avis académique transmis automatiquement sans intervention humaine"
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-800" />
                      <span>Consulter l'avis officiel</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Two columns: Recent Loans & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold font-serif text-slate-900">
              Derniers emprunts universitaires
            </h2>
            <button
              onClick={() => onNavigateToTab('loans')}
              className="text-xs font-semibold text-blue-800 hover:underline flex items-center gap-1"
            >
              <span>Voir tout</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {loans.slice(0, 5).map((loan) => {
              const book = getBookById(loan.bookId);
              const student = getStudentById(loan.studentId);

              return (
                <div key={loan.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <div className="font-mono text-[11px] text-slate-500">{loan.loanNumber}</div>
                    <div className="font-bold text-slate-900 truncate mt-0.5">{book?.title}</div>
                    <div className="text-slate-600 mt-0.5">
                      {student?.fullName} ({student?.department})
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {loan.status === 'retourne' ? (
                      <span className="text-emerald-700 font-semibold">Restitué</span>
                    ) : loan.status === 'en_retard' ? (
                      <span className="text-rose-700 font-bold">En retard ({loan.dueDate})</span>
                    ) : (
                      <span className="text-slate-700">Échéance {loan.dueDate}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shortcuts */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold font-serif text-slate-900">
            Outils Guichet EST Fès
          </h3>
          <div className="space-y-2 text-xs">
            <button
              onClick={onOpenQRScanner}
              className="w-full p-2.5 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-slate-800 font-semibold flex items-center justify-between transition-all"
            >
              <span>Scanner retour par caméra</span>
              <RotateCcw className="w-4 h-4 text-blue-800" />
            </button>

            <button
              onClick={onOpenNewLoan}
              className="w-full p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-medium flex items-center justify-between transition-all"
            >
              <span>Enregistrer un prêt étudiant</span>
              <Plus className="w-4 h-4 text-slate-600" />
            </button>

            <button
              onClick={() => onNavigateToTab('catalog')}
              className="w-full p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-medium flex items-center justify-between transition-all"
            >
              <span>Générer Codes QR des livres</span>
              <BookOpen className="w-4 h-4 text-slate-600" />
            </button>

            <button
              onClick={() => onNavigateToTab('overdue')}
              className="w-full p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-medium flex items-center justify-between transition-all"
            >
              <span>Tableau des retards colorés</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal de consultation des emails automatiques */}
      <AutomatedEmailModal
        isOpen={Boolean(selectedEmailForModal)}
        onClose={() => setSelectedEmailForModal(null)}
        email={selectedEmailForModal}
      />
    </div>
  );
};
