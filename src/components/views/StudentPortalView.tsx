import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import {
  User,
  BookOpen,
  Calendar,
  Smartphone,
  QrCode,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  LogOut,
  Layers,
  ArrowRight,
  Mail,
  ShieldAlert,
  Zap,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
  Check,
  RefreshCw,
} from 'lucide-react';
import { Loan, Book, AutomatedEmailRecord } from '../../types';
import { ActiveTab } from '../Navbar';
import { LoanQRCodeModal } from '../modals/LoanQRCodeModal';
import { BookQRCodeModal } from '../modals/BookQRCodeModal';
import { BookDetailsModal } from '../modals/BookDetailsModal';
import { BookCoverPhoto } from '../common/BookCoverPhoto';
import { AutomatedEmailModal } from '../modals/AutomatedEmailModal';
import { ReserveBookModal } from '../modals/ReserveBookModal';

interface StudentPortalViewProps {
  onNavigateToTab?: (tab: ActiveTab) => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({ onNavigateToTab }) => {
  const {
    session,
    logout,
    getStudentActiveLoans,
    getStudentReservations,
    books,
    availableBooks,
    getBookById,
    getOverdueDays,
    automatedEmails,
    triggerAutomatedCheck,
    simulateLoanDueDate,
    cancelReservation,
  } = useLibrary();

  const student = session.student;

  const [selectedLoanForQR, setSelectedLoanForQR] = useState<Loan | null>(null);
  const [selectedBookForQR, setSelectedBookForQR] = useState<Book | null>(null);
  const [selectedBookForDetails, setSelectedBookForDetails] = useState<Book | null>(null);
  const [selectedEmailForModal, setSelectedEmailForModal] = useState<AutomatedEmailRecord | null>(null);
  const [selectedBookForReservation, setSelectedBookForReservation] = useState<Book | null>(null);
  const [cancellingResId, setCancellingResId] = useState<string | null>(null);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [simulatingLoanId, setSimulatingLoanId] = useState<string | null>(null);

  if (!student) return null;

  const activeLoans = getStudentActiveLoans(student.id);
  const myReservations = getStudentReservations(student.id);
  const pendingReservations = myReservations.filter((r) => r.status === 'en_attente' || r.status === 'prete' || r.status === 'validee');

  // Emails automatiques adressés à cet étudiant
  const myAutomatedEmails = automatedEmails.filter((e) => e.studentId === student.id);

  // Strictement les livres disponibles en rayon pour l'Espace Étudiant
  const filteredBooks = availableBooks.filter((b) => {
    if (!catalogSearch.trim()) return true;
    const q = catalogSearch.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      b.isbn.includes(q)
    );
  });

  const handleManualAudit = async () => {
    setIsAuditing(true);
    await triggerAutomatedCheck();
    setIsAuditing(false);
  };

  const handleSimulate = async (loanId: string, daysOffset?: number, resetToNormal?: boolean) => {
    setSimulatingLoanId(loanId);
    await simulateLoanDueDate(loanId, daysOffset, resetToNormal);
    setSimulatingLoanId(null);
  };

  const handleCancelReservation = async (resId: string) => {
    setCancellingResId(resId);
    await cancelReservation(resId);
    setCancellingResId(null);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Student Badge Card (EST Fès Student Card) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg border border-blue-800 relative overflow-hidden">
        {/* Subtle background emblem */}
        <div className="absolute -right-10 -bottom-10 opacity-10 font-serif text-9xl font-bold select-none pointer-events-none">
          EST
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-white text-blue-900 flex items-center justify-center font-bold text-2xl shadow-md shrink-0 border-2 border-amber-400">
              {student.fullName.charAt(0)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded">
                  {student.school} FÈS · ÉTUDIANT VÉRIFIÉ
                </span>
                <span className="text-xs text-blue-200 font-mono">CNE: {student.cne}</span>
              </div>

              <h1 className="text-2xl font-bold font-serif">{student.fullName}</h1>
              <div className="text-xs text-blue-200">
                <span>{student.department}</span>
                <span className="mx-1.5">·</span>
                <span>{student.level}</span>
              </div>
              <div className="text-xs text-blue-300/90 font-mono flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-blue-300" />
                <span>{student.email}</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-4 sm:pt-0 border-blue-800/80">
            <div className="flex items-center gap-4 text-left sm:text-right">
              <div>
                <div className="text-xs text-blue-300">Emprunts actifs</div>
                <div className="text-2xl font-bold font-mono text-amber-300">
                  {activeLoans.length} / 3
                </div>
              </div>

              <div className="pl-3 border-l border-blue-800">
                <div className="text-xs text-blue-300">Réservations</div>
                <div className="text-2xl font-bold font-mono text-emerald-300">
                  {pendingReservations.length}
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Robot Status & System Overview Banner */}
      <div className="bg-white rounded-xl border border-blue-100 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-900 to-indigo-900 text-amber-400 flex items-center justify-center shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Système Automatisé de Relance par Email
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Actif 24/7 sans intervention humaine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Lorsque la date de délivrance / restitution est dépassée, le robot analyse l'échéance et envoie automatiquement l'email selon le degré de gravité.
              </p>
            </div>
          </div>

          <button
            onClick={handleManualAudit}
            disabled={isAuditing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-950 rounded-lg text-xs font-semibold border border-blue-200 transition-colors whitespace-nowrap cursor-pointer self-start sm:self-auto"
            title="Lancer l'audit automatique du robot immédiatement"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-800 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'Audit en cours...' : 'Vérification automatique instantanée'}</span>
          </button>
        </div>

        {/* Gravity Levels Scale (Échelle de Gravité EST Fès) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
          <div className="p-2.5 rounded-lg bg-sky-50/70 border border-sky-200 text-xs">
            <div className="font-bold text-sky-900 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>Niveau 1 : Rappel Préventif</span>
            </div>
            <div className="text-[11px] text-sky-800 mt-0.5">
              Échéance J-1 ou Jour J · Courtoisie
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Niveau 2 : Gravité Modérée</span>
            </div>
            <div className="text-[11px] text-amber-800 mt-0.5">
              Retard de 1 à 3 jours · 1ère Relance
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-200 text-xs">
            <div className="font-bold text-orange-900 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
              <span>Niveau 3 : Gravité Élevée</span>
            </div>
            <div className="text-[11px] text-orange-800 mt-0.5">
              Retard 4 à 7 jours · Prêt suspendu
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200 text-xs">
            <div className="font-bold text-rose-900 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Niveau 4 : Gravité Critique</span>
            </div>
            <div className="text-[11px] text-rose-800 mt-0.5">
              Retard &gt; 7 jours · Blocage Scolarité EST
            </div>
          </div>
        </div>
      </div>

      {/* Active Loans Section: Mobile QR Return Passes & Severity Simulator */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold font-serif text-slate-900 flex items-center gap-2">
              <span>Mes Ouvrages Empruntés ({activeLoans.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Générez votre Pass QR pour le retour au guichet · Testez le déclenchement autonome des relances par gravité
            </p>
          </div>
        </div>

        {activeLoans.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3 shadow-xs">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-semibold text-slate-800">
              Vous n'avez aucun livre en prêt pour le moment
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Consultez le catalogue ci-dessous et rendez-vous au guichet de la BU EST Fès pour emprunter vos documents.
            </p>
            <button
              onClick={() => onNavigateToTab?.('catalog')}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ouvrir le Catalogue du Fonds EST &rarr;</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeLoans.map((loan) => {
              const book = getBookById(loan.bookId);
              const overdueDays = getOverdueDays(loan.dueDate);
              const isLate = overdueDays > 0;

              return (
                <div
                  key={loan.id}
                  className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                    isLate ? 'border-rose-300 bg-rose-50/15' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-500 font-semibold">{loan.loanNumber}</span>
                      {isLate ? (
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-100/70 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Retard de {overdueDays}j
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Dans les délais
                        </span>
                      )}
                    </div>

                    {/* Book Hero with Photo Thumbnail */}
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-22 rounded-lg overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                        <BookCoverPhoto
                          book={book || { title: 'Livre EST' }}
                          aspectClass="h-22"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                          {book?.title || 'Titre inconnu'}
                        </h3>
                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{book?.author}</p>
                        {book?.category && (
                          <span className="inline-block mt-1 text-[10px] font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded">
                            {book.category}
                          </span>
                        )}
                        <div className="text-[11px] text-slate-500 mt-1 font-mono">
                          Cote : {book?.shelfLocation}
                        </div>
                      </div>
                    </div>

                    {/* Due Date & Loan Details */}
                    <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1.5 border border-slate-100">
                      <div className="flex justify-between text-slate-600">
                        <span>Date d'emprunt :</span>
                        <span className="font-mono">{loan.borrowDate}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-slate-800">
                        <span>Date d'échéance :</span>
                        <span className={`font-mono ${isLate ? 'text-rose-700 font-bold' : 'text-blue-900'}`}>
                          {loan.dueDate}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Simulator Bar: Test Automated Emails by Gravity */}
                    <div className="p-3 bg-gradient-to-r from-blue-50/60 to-slate-50 rounded-lg border border-blue-200/60 space-y-2">
                      <div className="text-[11px] font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-600" />
                        <span>Simulateur temporel (Test d'envoi automatique selon la gravité) :</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                        <button
                          type="button"
                          onClick={() => handleSimulate(loan.id, -2)}
                          disabled={simulatingLoanId === loan.id}
                          className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold rounded text-[10px] border border-amber-300 transition-colors cursor-pointer text-center"
                          title="Simuler un retard de 2 jours (Relance automatique Modérée)"
                        >
                          Retard 2j (Modéré)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSimulate(loan.id, -5)}
                          disabled={simulatingLoanId === loan.id}
                          className="py-1.5 px-2 bg-orange-50 hover:bg-orange-100 text-orange-900 font-semibold rounded text-[10px] border border-orange-300 transition-colors cursor-pointer text-center"
                          title="Simuler un retard de 5 jours (Relance Urgente avec suspension)"
                        >
                          Retard 5j (Élevé)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSimulate(loan.id, -10)}
                          disabled={simulatingLoanId === loan.id}
                          className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-900 font-semibold rounded text-[10px] border border-rose-300 transition-colors cursor-pointer text-center"
                          title="Simuler un retard de 10 jours (Mise en demeure critique)"
                        >
                          Retard 10j (Critique)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSimulate(loan.id, undefined, true)}
                          disabled={simulatingLoanId === loan.id}
                          className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold rounded text-[10px] border border-emerald-300 transition-colors cursor-pointer text-center"
                          title="Régulariser l'emprunt dans les délais normaux"
                        >
                          Régulariser (+14j)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Primary Action: QR Code Button */}
                  <div className="pt-4 mt-3 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedLoanForQR(loan)}
                      className="w-full py-2.5 px-3 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4 text-amber-300" />
                      <span>Afficher mon Pass QR de retour</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mes Réservations d'Ouvrages */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-blue-900" />
              </div>
              <h2 className="text-lg font-bold font-serif text-slate-900">
                Mes Réservations en cours ({pendingReservations.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Suivi en direct des ouvrages réservés auprès du Responsable de la bibliothèque EST Fès
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-900 rounded-lg text-xs font-semibold border border-blue-200 shadow-2xs self-start sm:self-auto">
            <span>Délai de garde au guichet : 72h ouvrées</span>
          </div>
        </div>

        {myReservations.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center space-y-2">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-sm font-semibold text-slate-800">
              Aucune réservation enregistrée
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Vous pouvez réserver dès maintenant n'importe quel livre disponible du catalogue ci-dessous pour qu'il vous soit préparé au guichet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myReservations.map((res) => {
              const book = getBookById(res.bookId);
              const isPending = res.status === 'en_attente';
              const isReady = res.status === 'prete' || res.status === 'validee';
              const isCompleted = res.status === 'terminee';
              const isCancelled = res.status === 'annulee';

              return (
                <div
                  key={res.id}
                  className={`bg-white rounded-xl border p-4 shadow-xs flex flex-col justify-between space-y-3 ${
                    isPending
                      ? 'border-l-4 border-l-amber-500'
                      : isReady
                      ? 'border-l-4 border-l-blue-600 bg-blue-50/20'
                      : isCompleted
                      ? 'border-l-4 border-l-emerald-600'
                      : 'border-l-4 border-l-slate-300 opacity-70'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {book && (
                      <div className="w-14 shrink-0">
                        <BookCoverPhoto book={book} aspectClass="h-20" />
                      </div>
                    )}

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold bg-slate-800 text-white px-2 py-0.5 rounded">
                          {res.reservationNumber}
                        </span>

                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                            <Clock className="w-3 h-3" />
                            <span>En préparation</span>
                          </span>
                        )}

                        {isReady && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-300 animate-pulse">
                            <CheckCircle2 className="w-3 h-3 text-blue-700" />
                            <span>Prête au guichet !</span>
                          </span>
                        )}

                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                            <span>Délivrée en prêt</span>
                          </span>
                        )}

                        {isCancelled && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300">
                            <span>Annulée</span>
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-serif leading-snug line-clamp-1">
                        {book ? book.title : `Livre #${res.bookId}`}
                      </h4>

                      {book && (
                        <div className="text-[11px] text-slate-600 flex items-center gap-2">
                          <span className="truncate">{book.author}</span>
                          <span>·</span>
                          <span className="font-mono text-blue-900 font-semibold bg-blue-50 px-1 py-0.2 rounded">
                            {book.shelfLocation}
                          </span>
                        </div>
                      )}

                      {res.pickupDeadline && !isCompleted && !isCancelled && (
                        <div className="text-[11px] text-amber-900 font-medium pt-0.5 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-700" />
                          <span>Retrait avant : <strong>{res.pickupDeadline}</strong></span>
                        </div>
                      )}

                      {res.notes && (
                        <div className="text-[10px] text-slate-500 italic line-clamp-1">
                          "{res.notes}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      Demandée le {new Date(res.reservedAt).toLocaleDateString('fr-FR')}
                    </span>

                    {(isPending || isReady) && (
                      <button
                        onClick={() => handleCancelReservation(res.id)}
                        disabled={cancellingResId === res.id}
                        className="text-xs text-rose-700 hover:text-rose-900 font-semibold transition-colors cursor-pointer"
                      >
                        {cancellingResId === res.id ? 'Annulation...' : 'Annuler la réservation'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Official Automated Emails Inbox for this Student (@usmba.ac.ma) */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-900" />
              </div>
              <h2 className="text-lg font-bold font-serif text-slate-900">
                Boîte Académique & Relances Automatiques Reçues ({myAutomatedEmails.length})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Historique des emails envoyés automatiquement par le système sur votre adresse <strong className="font-mono text-blue-900">{student.email}</strong> selon la gravité
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200 shadow-2xs self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Envois 100% automatiques par la plateforme</span>
          </div>
        </div>

        {myAutomatedEmails.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
            <div className="text-sm font-semibold text-slate-800">
              Aucune relance automatique envoyée
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Tous vos emprunts sont actuellement en règle. Si une date d'échéance est dépassée, le système expédiera automatiquement un avertissement sur votre compte académique.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myAutomatedEmails.map((email) => {
              const isCritique = email.gravity === 'critique';
              const isElevee = email.gravity === 'elevee';
              const isModeree = email.gravity === 'moderee';

              return (
                <div
                  key={email.id}
                  className={`bg-white rounded-xl border p-4 shadow-2xs transition-all hover:border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCritique
                      ? 'border-l-4 border-l-rose-600 bg-rose-50/10'
                      : isElevee
                      ? 'border-l-4 border-l-orange-500'
                      : isModeree
                      ? 'border-l-4 border-l-amber-500'
                      : 'border-l-4 border-l-sky-500'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          isCritique
                            ? 'bg-rose-100 text-rose-800'
                            : isElevee
                            ? 'bg-orange-100 text-orange-800'
                            : isModeree
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {email.gravityLabel}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {new Date(email.sentAt).toLocaleString('fr-FR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Transmis automatiquement au serveur USMBA</span>
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {email.subject}
                    </h4>

                    <div className="text-[11px] text-slate-600 line-clamp-1">
                      <strong className="text-slate-800">Déclencheur autonome :</strong> {email.triggerReason}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => setSelectedEmailForModal(email)}
                      className="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      Consulter l'avis officiel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* University Catalog Section (Consultation Only) */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold font-serif text-slate-900">
                Fonds Documentaire de l'EST Fès
              </h2>
              <span className="text-xs font-mono font-semibold bg-blue-50 text-blue-900 px-2 py-0.5 rounded">
                55 ouvrages
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Chaque ouvrage possède sa photo de couverture thématique haute définition et son sommaire académique
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateToTab?.('catalog')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Voir le catalogue complet &rarr;</span>
            </button>

            <div className="relative max-w-xs w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Rechercher par titre, auteur..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBooks.slice(0, 6).map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between group hover:border-slate-300 transition-all"
            >
              <div>
                {/* Book Cover Photo avec composant dédié */}
                <div className="relative">
                  <BookCoverPhoto book={book} aspectClass="h-40" />

                  <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-xs">
                    {book.shelfLocation}
                  </div>

                  {book.niveau && (
                    <div className="absolute top-2.5 left-2.5 bg-blue-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs">
                      {book.niveau}
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] gap-2">
                    <span className="text-blue-900 font-semibold truncate bg-blue-50 px-2 py-0.5 rounded">
                      {book.category}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      Éd. {book.publishedYear}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 font-serif line-clamp-2 leading-snug">
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-1">{book.author}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-1">
                    {book.description}
                  </p>
                </div>
              </div>

              {/* Actions: Réserver, QR & Sommaire */}
              <div className="p-4 pt-2 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    ✓ {book.availableCopies} dispo{book.availableCopies > 1 ? 's' : ''} en rayon
                  </div>

                  <button
                    onClick={() => setSelectedBookForReservation(book)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                    title="Réserver cet exemplaire pour retrait au guichet"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                    <span>Réserver</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedBookForDetails(book)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:bg-slate-100 text-[11px] font-medium rounded transition-colors cursor-pointer"
                    title="Consulter les chapitres"
                  >
                    <Layers className="w-3 h-3 text-slate-500" />
                    <span>Sommaire</span>
                  </button>

                  <button
                    onClick={() => setSelectedBookForQR(book)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-blue-900 hover:bg-blue-50 text-[11px] font-medium rounded transition-colors cursor-pointer"
                    title="Générer le code QR Google Livres scannable sur smartphone"
                  >
                    <BookOpen className="w-3 h-3 text-blue-800" />
                    <span>QR Google Livres</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredBooks.length > 6 && (
          <div className="text-center pt-2">
            <button
              onClick={() => onNavigateToTab?.('catalog')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 hover:border-blue-900 hover:text-blue-900 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-all cursor-pointer"
            >
              <span>Afficher tous les ouvrages disponibles dans le Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <ReserveBookModal
        isOpen={Boolean(selectedBookForReservation)}
        onClose={() => setSelectedBookForReservation(null)}
        book={selectedBookForReservation}
      />

      <LoanQRCodeModal
        isOpen={Boolean(selectedLoanForQR)}
        onClose={() => setSelectedLoanForQR(null)}
        loan={selectedLoanForQR}
      />

      <BookQRCodeModal
        isOpen={Boolean(selectedBookForQR)}
        onClose={() => setSelectedBookForQR(null)}
        book={selectedBookForQR}
      />

      <BookDetailsModal
        isOpen={Boolean(selectedBookForDetails)}
        onClose={() => setSelectedBookForDetails(null)}
        book={selectedBookForDetails}
        onOpenQRCode={(b) => setSelectedBookForQR(b)}
      />

      <AutomatedEmailModal
        isOpen={Boolean(selectedEmailForModal)}
        onClose={() => setSelectedEmailForModal(null)}
        email={selectedEmailForModal}
      />
    </div>
  );
};
