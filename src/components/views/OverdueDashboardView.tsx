import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import {
  AlertTriangle,
  Mail,
  Copy,
  Clock,
  RotateCcw,
  Check,
  User,
  BookOpen,
  Filter,
  CheckCircle2,
  Zap,
  ShieldCheck,
} from 'lucide-react';
import { Loan, OverdueSeverity } from '../../types';
import { BookCoverPhoto } from '../common/BookCoverPhoto';

interface OverdueDashboardViewProps {
  onScanReturn: () => void;
}

export const OverdueDashboardView: React.FC<OverdueDashboardViewProps> = ({ onScanReturn }) => {
  const {
    loans,
    books,
    getStudentById,
    getBookById,
    getOverdueDays,
    getOverdueSeverity,
    getOverdueEmailData,
    returnLoanWithQR,
    addToast,
  } = useLibrary();

  const [severityFilter, setSeverityFilter] = useState<'all' | OverdueSeverity>('all');
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const overdueLoans = loans.filter((l) => l.status === 'en_retard');

  const filteredLoans = overdueLoans.filter((loan) => {
    if (severityFilter === 'all') return true;
    return getOverdueSeverity(loan.dueDate) === severityFilter;
  });

  const activeSelectedLoan =
    filteredLoans.find((l) => l.id === selectedLoanId) || filteredLoans[0] || null;

  const emailData = activeSelectedLoan ? getOverdueEmailData(activeSelectedLoan) : null;

  const countMild = overdueLoans.filter((l) => getOverdueSeverity(l.dueDate) === 'mild').length;
  const countModerate = overdueLoans.filter((l) => getOverdueSeverity(l.dueDate) === 'moderate').length;
  const countCritical = overdueLoans.filter((l) => getOverdueSeverity(l.dueDate) === 'critical').length;

  const handleCopyEmail = () => {
    if (emailData) {
      navigator.clipboard.writeText(
        `Destinataire : ${emailData.to}\nObjet : ${emailData.subject}\n\n${emailData.body}`
      );
      setCopied(true);
      addToast('Courriel copié dans le presse-papier.');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleQuickReturn = (loanId: string) => {
    returnLoanWithQR(loanId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Audit Autonome 24/7 · Sans intervention humaine
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 tracking-tight mt-0.5">
            Tableau de Bord des Retards & Relances Automatisées
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Les alertes Gmail sont expédiées automatiquement par la plateforme dès dépassement d'échéance selon l'échelle de gravité académique.
          </p>
        </div>

        <button
          onClick={onScanReturn}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Scanner un retour QR</span>
        </button>
      </div>

      {/* KPI Cards: Color-Coded by Severity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Mild (Yellow/Amber) */}
        <button
          onClick={() => setSeverityFilter(severityFilter === 'mild' ? 'all' : 'mild')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            severityFilter === 'mild'
              ? 'ring-2 ring-amber-500 bg-amber-50/80 border-amber-300'
              : 'bg-white border-amber-200 hover:bg-amber-50/30'
          }`}
        >
          <div className="flex items-center justify-between text-amber-800 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              Retard Léger (1 à 7 j)
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-900 mt-2">
            {countMild}
          </div>
          <div className="text-[11px] text-amber-700 mt-1">
            Envoi auto : 1ère relance de courtoisie
          </div>
        </button>

        {/* Card 2: Moderate (Orange) */}
        <button
          onClick={() => setSeverityFilter(severityFilter === 'moderate' ? 'all' : 'moderate')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            severityFilter === 'moderate'
              ? 'ring-2 ring-orange-500 bg-orange-50/80 border-orange-300'
              : 'bg-white border-orange-200 hover:bg-orange-50/30'
          }`}
        >
          <div className="flex items-center justify-between text-orange-800 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              Retard Moyen (8 à 14 j)
            </span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-orange-950 mt-2">
            {countModerate}
          </div>
          <div className="text-[11px] text-orange-700 mt-1">
            Envoi auto : Avertissement & Suspension des droits
          </div>
        </button>

        {/* Card 3: Critical (Red) */}
        <button
          onClick={() => setSeverityFilter(severityFilter === 'critical' ? 'all' : 'critical')}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
            severityFilter === 'critical'
              ? 'ring-2 ring-rose-500 bg-rose-50/80 border-rose-300'
              : 'bg-white border-rose-200 hover:bg-rose-50/30'
          }`}
        >
          <div className="flex items-center justify-between text-rose-800 text-xs font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              Retard Critique (+ 14 j)
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-950 mt-2">
            {countCritical}
          </div>
          <div className="text-[11px] text-rose-700 mt-1">
            Envoi auto : Mise en demeure & Sanction académique
          </div>
        </button>
      </div>

      {/* Main Grid: Overdue Table + Email Preview Panel */}
      {overdueLoans.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
          <Check className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-base font-bold font-serif text-slate-800">Aucun retard en cours</h3>
          <p className="text-xs text-slate-500 mt-1">
            Tous les livres empruntés à l'EST Fès sont actuellement dans les délais !
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Overdue Table (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Étudiants en retard ({filteredLoans.length})</span>
              {severityFilter !== 'all' && (
                <button
                  onClick={() => setSeverityFilter('all')}
                  className="text-blue-700 hover:underline text-[11px]"
                >
                  Voir tous les retards
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 max-h-[550px] overflow-y-auto">
              {filteredLoans.map((loan) => {
                const book = getBookById(loan.bookId);
                const student = getStudentById(loan.studentId);
                const days = getOverdueDays(loan.dueDate);
                const severity = getOverdueSeverity(loan.dueDate);
                const isSelected = activeSelectedLoan?.id === loan.id;

                const severityBadge =
                  severity === 'mild' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      🟡 {days}j de retard
                    </span>
                  ) : severity === 'moderate' ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-950 border border-orange-300">
                      🟠 {days}j de retard
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-950 border border-rose-300">
                      🔴 {days}j CRITIQUE
                    </span>
                  );

                return (
                  <button
                    key={loan.id}
                    onClick={() => setSelectedLoanId(loan.id)}
                    className={`w-full p-4 text-left transition-colors flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-blue-50/70 border-l-4 border-blue-700'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-14 rounded overflow-hidden shrink-0 border border-slate-200 shadow-2xs mt-0.5">
                        <BookCoverPhoto book={book || { title: 'Livre' }} aspectClass="h-14" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {severityBadge}
                          <span className="text-[11px] font-mono text-slate-400">
                            {loan.loanNumber}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-slate-900 truncate">
                          {book?.title}
                        </div>

                        <div className="text-xs text-slate-600 mt-0.5">
                          {student?.fullName} ({student?.department})
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {student?.email}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Dedicated Gmail Email Composer (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            {activeSelectedLoan && emailData ? (
              <>
                {/* Header of message */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Modèle de courriel spécifique :
                      </span>
                      {emailData.severity === 'mild' ? (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-900">
                          Niveau 1 : Rappel courtois
                        </span>
                      ) : emailData.severity === 'moderate' ? (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-100 text-orange-950">
                          Niveau 2 : Avertissement
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-950">
                          Niveau 3 : Mise en demeure
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-slate-600 mt-1">
                      Destinataire : <strong>{emailData.studentName}</strong> ({emailData.to})
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Expédié automatiquement</span>
                    </span>

                    <button
                      onClick={() => handleQuickReturn(activeSelectedLoan.id)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                      title="Enregistrer la restitution"
                    >
                      Restituer
                    </button>
                  </div>
                </div>

                {/* Email Subject line */}
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-500">Objet : </span>
                  <span className="font-bold text-slate-900">{emailData.subject}</span>
                </div>

                {/* Email Body */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Corps du message expédié automatiquement à cet étudiant :</span>
                    <button
                      onClick={handleCopyEmail}
                      className="text-blue-700 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copié !' : 'Copier le texte'}</span>
                    </button>
                  </div>

                  <textarea
                    rows={12}
                    readOnly
                    value={emailData.body}
                    className="w-full p-4 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none leading-relaxed resize-none"
                  />
                </div>

                <div className="text-[11px] text-emerald-950 bg-emerald-50/90 p-3 rounded-xl border border-emerald-200/80 flex items-start gap-2.5">
                  <Zap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Système d'Expédition 100% Autonome (Sans intervention humaine) :</div>
                    <p className="mt-0.5 text-emerald-900 leading-relaxed">
                      Ce courriel officiel a été expédié automatiquement sur le compte Google académique de l'étudiant (<code className="font-mono">{emailData.to}</code>) dès dépassement de l'échéance. Le robot BU EST Fès audite le système 24h/24 sans aucune intervention humaine.
                    </p>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
