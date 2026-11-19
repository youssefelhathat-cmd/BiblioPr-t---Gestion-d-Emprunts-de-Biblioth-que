import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Loan } from '../../types';
import {
  Search,
  Plus,
  RotateCcw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  BookOpen,
  QrCode,
  Smartphone,
} from 'lucide-react';
import { LoanQRCodeModal } from '../modals/LoanQRCodeModal';
import { BookCoverPhoto } from '../common/BookCoverPhoto';

interface LoansViewProps {
  onOpenNewLoan: () => void;
  onOpenQRScanner: () => void;
}

export const LoansView: React.FC<LoansViewProps> = ({
  onOpenNewLoan,
  onOpenQRScanner,
}) => {
  const {
    loans,
    books,
    getStudentById,
    getBookById,
    getOverdueDays,
    getOverdueSeverity,
    returnLoanWithQR,
  } = useLibrary();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLoanForQR, setSelectedLoanForQR] = useState<Loan | null>(null);

  const filteredLoans = loans.filter((loan) => {
    if (filterStatus === 'active' && loan.status !== 'en_cours') return false;
    if (filterStatus === 'overdue' && loan.status !== 'en_retard') return false;
    if (filterStatus === 'returned' && loan.status !== 'retourne') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const book = getBookById(loan.bookId);
      const student = getStudentById(loan.studentId);

      const matchNum = loan.loanNumber.toLowerCase().includes(q);
      const matchBook = book && (book.title.toLowerCase().includes(q) || book.isbn.includes(q));
      const matchStudent =
        student &&
        (student.fullName.toLowerCase().includes(q) ||
          student.cne.toLowerCase().includes(q) ||
          student.email.toLowerCase().includes(q));

      if (!matchNum && !matchBook && !matchStudent) return false;
    }

    return true;
  });

  const activeCount = loans.filter((l) => l.status === 'en_cours').length;
  const overdueCount = loans.filter((l) => l.status === 'en_retard').length;
  const returnedCount = loans.filter((l) => l.status === 'retourne').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            Registre des Emprunts (EST Fès)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Suivi des prêts actifs, génération des passes QR et retours scannés
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenQRScanner}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-blue-700" />
            <span>Scanner retour QR</span>
          </button>

          <button
            onClick={onOpenNewLoan}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel emprunt EST</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Segmented controls */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg self-start overflow-x-auto max-w-full">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tous les prêts ({loans.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filterStatus === 'active'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            En cours ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus('overdue')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filterStatus === 'overdue'
                ? 'bg-white text-rose-700 shadow-xs font-bold'
                : 'text-rose-600 hover:text-rose-800'
            }`}
          >
            En retard ({overdueCount})
          </button>
          <button
            onClick={() => setFilterStatus('returned')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
              filterStatus === 'returned'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Restitués ({returnedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par titre, étudiant EST, CNE, n° prêt..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredLoans.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            Aucun dossier d'emprunt ne correspond à ces critères.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Réf Prêt</th>
                  <th className="py-3 px-4">Ouvrage EST</th>
                  <th className="py-3 px-4">Étudiant EST</th>
                  <th className="py-3 px-4">Dates & Statut</th>
                  <th className="py-3 px-4 text-center">Pass QR</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLoans.map((loan) => {
                  const book = getBookById(loan.bookId);
                  const student = getStudentById(loan.studentId);
                  const overdueDays = getOverdueDays(loan.dueDate);
                  const severity = getOverdueSeverity(loan.dueDate);

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Ref */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {loan.loanNumber}
                        {loan.notes && (
                          <div className="text-[11px] text-slate-400 font-sans italic truncate max-w-[130px]">
                            {loan.notes}
                          </div>
                        )}
                      </td>

                      {/* Book */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-12 rounded overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                            <BookCoverPhoto book={book || { title: 'Livre' }} aspectClass="h-12" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 line-clamp-1 max-w-xs">
                              {book?.title || 'Titre inconnu'}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              <span>{book?.author}</span>
                              <span className="mx-1">·</span>
                              <span className="font-mono text-blue-900">{book?.shelfLocation}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Student */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {student?.fullName || 'Étudiant'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          <span className="font-mono">{student?.cne}</span>
                          <span className="mx-1">·</span>
                          <span>{student?.department}</span>
                        </div>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="text-[11px] text-slate-500">
                          Prêté le : {loan.borrowDate}
                        </div>

                        {loan.status === 'retourne' ? (
                          <div className="text-emerald-700 font-sans font-medium text-xs mt-0.5">
                            Restitué le {loan.returnDate}
                          </div>
                        ) : loan.status === 'en_retard' ? (
                          <div className="font-sans font-bold text-xs mt-0.5">
                            {severity === 'mild' ? (
                              <span className="text-amber-800">🟡 Retard {overdueDays}j (éch. {loan.dueDate})</span>
                            ) : severity === 'moderate' ? (
                              <span className="text-orange-900">🟠 Retard {overdueDays}j (éch. {loan.dueDate})</span>
                            ) : (
                              <span className="text-rose-700">🔴 Retard {overdueDays}j (CRITIQUE)</span>
                            )}
                          </div>
                        ) : (
                          <div className="text-slate-800 font-sans text-xs mt-0.5">
                            Échéance : {loan.dueDate}
                          </div>
                        )}
                      </td>

                      {/* QR Code Pass button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedLoanForQR(loan)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-blue-50 text-blue-900 rounded-md transition-colors"
                          title="Afficher le Code QR pour mobile ou restitution"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Pass QR</span>
                        </button>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        {loan.status !== 'retourne' ? (
                          <button
                            onClick={() => returnLoanWithQR(loan.qrToken)}
                            className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                          >
                            Restituer
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Clôturé</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LoanQRCodeModal
        isOpen={Boolean(selectedLoanForQR)}
        onClose={() => setSelectedLoanForQR(null)}
        loan={selectedLoanForQR}
      />
    </div>
  );
};
