import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { X, Search, Calendar, User, Book as BookIcon, Check } from 'lucide-react';

interface NewLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedBookId?: string;
  preselectedStudentId?: string;
}

export const NewLoanModal: React.FC<NewLoanModalProps> = ({
  isOpen,
  onClose,
  preselectedBookId,
  preselectedStudentId,
}) => {
  const { books, studentsEST, createLoan, settings, getStudentActiveLoans } = useLibrary();

  const [selectedBookId, setSelectedBookId] = useState<string>(preselectedBookId || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(preselectedStudentId || '');
  const [durationDays, setDurationDays] = useState<number>(settings.defaultLoanDurationDays);
  const [notes, setNotes] = useState<string>('');
  const [bookSearch, setBookSearch] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');

  if (!isOpen) return null;

  const availableBooks = books.filter(
    (b) =>
      b.availableCopies > 0 &&
      (b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
        b.isbn.includes(bookSearch))
  );

  const filteredStudents = studentsEST.filter(
    (s) =>
      s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.cne.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.department.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const selectedBook = books.find((b) => b.id === selectedBookId);
  const selectedStudent = studentsEST.find((s) => s.id === selectedStudentId);

  const studentLoans = selectedStudent ? getStudentActiveLoans(selectedStudent.id) : [];
  const isQuotaReached = selectedStudent ? studentLoans.length >= settings.defaultMaxLoans : false;

  const canSubmit =
    selectedBookId &&
    selectedStudentId &&
    selectedBook &&
    selectedBook.availableCopies > 0 &&
    !isQuotaReached;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const res = await createLoan(selectedBookId, selectedStudentId, durationDays, notes);

    if (res.success) {
      setSelectedBookId('');
      setSelectedStudentId('');
      setNotes('');
      onClose();
    }
  };

  const calculatedDueDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + durationDays);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900">
              Enregistrer un prêt (EST Fès)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Affectation d'un ouvrage du fonds à un étudiant inscrit à l'EST
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Étape 1 : Choix de l'étudiant EST */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              1. Sélectionner l'étudiant de l'EST Fès
            </label>

            {!selectedStudent ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Rechercher par nom, CNE (N13...), filière (GI, RT, GEA)..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-lg divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <p className="p-3 text-xs text-slate-500 text-center">
                      Aucun étudiant EST correspondant.
                    </p>
                  ) : (
                    filteredStudents.map((s) => {
                      const active = getStudentActiveLoans(s.id);
                      const isFull = active.length >= settings.defaultMaxLoans;

                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedStudentId(s.id)}
                          className="w-full p-3 text-left hover:bg-slate-50 flex items-center justify-between transition-colors"
                        >
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{s.fullName}</div>
                            <div className="text-xs text-slate-500">
                              <span className="font-mono">{s.cne}</span>
                              <span className="mx-1.5">·</span>
                              <span>{s.department}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono tabular-nums font-medium text-slate-600">
                              {active.length} / {settings.defaultMaxLoans} prêts
                            </span>
                            {isFull && (
                              <div className="text-[11px] text-rose-600 font-medium">Quota atteint</div>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{selectedStudent.fullName}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      <span className="font-mono">{selectedStudent.cne}</span>
                      <span className="mx-1.5">·</span>
                      <span>{selectedStudent.department}</span>
                      <span className="mx-1.5">·</span>
                      <span className="font-mono">{selectedStudent.email}</span>
                    </div>

                    {isQuotaReached && (
                      <div className="mt-2 text-xs text-rose-700 font-medium">
                        Quota maximal atteint ({settings.defaultMaxLoans} livres en cours).
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudentId('')}
                  className="text-xs text-blue-700 hover:underline font-medium"
                >
                  Changer
                </button>
              </div>
            )}
          </div>

          {/* Étape 2 : Choix du livre de l'EST */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              2. Sélectionner l'ouvrage de la bibliothèque
            </label>

            {!selectedBook ? (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                    placeholder="Rechercher par titre de cours, auteur, ISBN..."
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-lg divide-y divide-slate-100">
                  {availableBooks.length === 0 ? (
                    <p className="p-3 text-xs text-slate-500 text-center">
                      Aucun livre disponible.
                    </p>
                  ) : (
                    availableBooks.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedBookId(b.id)}
                        className="w-full p-3 text-left hover:bg-slate-50 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <BookIcon className="w-5 h-5 text-blue-900 shrink-0" />
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{b.title}</div>
                            <div className="text-xs text-slate-500">
                              <span>{b.author}</span>
                              <span className="mx-1.5">·</span>
                              <span className="font-mono">{b.shelfLocation}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono tabular-nums font-semibold text-emerald-700">
                            {b.availableCopies} dispo
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-14 bg-blue-50 text-blue-900 rounded flex items-center justify-center shrink-0 border border-blue-200">
                    <BookIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{selectedBook.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      <span>{selectedBook.author}</span>
                      <span className="mx-1.5">·</span>
                      <span className="font-mono">{selectedBook.shelfLocation}</span>
                    </div>
                    <div className="text-xs text-emerald-700 font-medium mt-1 font-mono">
                      {selectedBook.availableCopies} exemplaire(s) disponible(s) en rayon
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBookId('')}
                  className="text-xs text-blue-700 hover:underline font-medium"
                >
                  Changer
                </button>
              </div>
            )}
          </div>

          {/* Étape 3 : Durée */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Durée du prêt
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[7, 14, 21].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => setDurationDays(days)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition-colors ${
                      durationDays === days
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {days} jours
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Date de restitution prévue
              </label>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Calendar className="w-4 h-4 text-blue-900" />
                <span>{calculatedDueDate()}</span>
              </div>
            </div>
          </div>

          {/* Observations */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Observations / Modules (optionnel)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: TP de Programmation Réseau, PFE..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold rounded-lg shadow-sm transition-colors ${
                canSubmit
                  ? 'bg-blue-900 hover:bg-blue-800 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Valider & Générer Pass QR</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
