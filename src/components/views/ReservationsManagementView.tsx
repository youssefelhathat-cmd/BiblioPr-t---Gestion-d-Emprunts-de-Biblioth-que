import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { BookReservation, ReservationStatus } from '../../types';
import { BookCoverPhoto } from '../common/BookCoverPhoto';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  User,
  AlertCircle,
  Calendar,
  Layers,
  ArrowRight,
  XCircle,
  Sparkles,
  RefreshCw,
  FileCheck,
} from 'lucide-react';

export const ReservationsManagementView: React.FC = () => {
  const {
    reservations,
    books,
    getBookById,
    updateReservationStatus,
    convertReservationToLoan,
    cancelReservation,
    refreshData,
  } = useLibrary();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'en_attente' | 'prete' | 'terminee' | 'annulee'>('all');
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const totalCount = reservations.length;
  const pendingCount = reservations.filter((r) => r.status === 'en_attente').length;
  const readyCount = reservations.filter((r) => r.status === 'prete' || r.status === 'validee').length;
  const completedCount = reservations.filter((r) => r.status === 'terminee').length;

  const filteredReservations = reservations.filter((r) => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'prete') {
        if (r.status !== 'prete' && r.status !== 'validee') return false;
      } else if (r.status !== statusFilter) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const book = getBookById(r.bookId);
      const match =
        r.reservationNumber.toLowerCase().includes(q) ||
        r.studentName.toLowerCase().includes(q) ||
        r.studentCne.toLowerCase().includes(q) ||
        r.studentEmail.toLowerCase().includes(q) ||
        (book && book.title.toLowerCase().includes(q)) ||
        (book && book.shelfLocation.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const handleMarkAsReady = async (res: BookReservation) => {
    setIsProcessingId(res.id);
    await updateReservationStatus(res.id, 'prete');
    setIsProcessingId(null);
  };

  const handleConvertToLoan = async (res: BookReservation) => {
    setIsProcessingId(res.id);
    await convertReservationToLoan(res.id);
    setIsProcessingId(null);
  };

  const handleCancel = async (res: BookReservation) => {
    if (!window.confirm(`Confirmer l'annulation de la réservation ${res.reservationNumber} pour ${res.studentName} ?`)) {
      return;
    }
    setIsProcessingId(res.id);
    await cancelReservation(res.id);
    setIsProcessingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
              Administration BU · EST Fès
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 tracking-tight mt-0.5">
            Gestion des Réservations Étudiants
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualisez en temps réel les réservations demandées depuis l'Espace Étudiant, préparez les exemplaires et convertissez-les en prêts officiels au guichet.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-700 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Actualiser le flux</span>
          </button>
        </div>
      </div>

      {/* Stats KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-medium">Total Réservations</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">{totalCount}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Depuis l'ouverture du service</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs bg-gradient-to-br from-amber-50/50 to-white">
          <div className="text-xs text-amber-800 font-bold flex items-center justify-between">
            <span>En attente de mise de côté</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-900 mt-1">{pendingCount}</div>
          <div className="text-[11px] text-amber-700 mt-0.5">À préparer en rayon</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs bg-gradient-to-br from-blue-50/50 to-white">
          <div className="text-xs text-blue-800 font-bold flex items-center justify-between">
            <span>Prêtes au guichet</span>
            <span className="w-2 h-2 rounded-full bg-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-950 mt-1">{readyCount}</div>
          <div className="text-[11px] text-blue-700 mt-0.5">En attente de l'étudiant</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs bg-gradient-to-br from-emerald-50/50 to-white">
          <div className="text-xs text-emerald-800 font-bold flex items-center justify-between">
            <span>Délivrées en prêts</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-900 mt-1">{completedCount}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5">Converties avec succès</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center p-1 bg-slate-100 rounded-lg overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Toutes ({totalCount})
          </button>

          <button
            onClick={() => setStatusFilter('en_attente')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'en_attente'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-800 hover:text-amber-950'
            }`}
          >
            <span>À Préparer</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('prete')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'prete'
                ? 'bg-blue-900 text-white shadow-xs'
                : 'text-blue-900 hover:text-blue-950'
            }`}
          >
            <span>Prêtes au Guichet</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
              {readyCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('terminee')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap cursor-pointer ${
              statusFilter === 'terminee'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Délivrées ({completedCount})
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par étudiant, CNE, livre, n° réf..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
          />
        </div>
      </div>

      {/* Reservations List */}
      {filteredReservations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800">
            Aucune réservation ne correspond à vos critères
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Les nouvelles réservations passées par les étudiants depuis leur espace apparaîtront automatiquement ici en temps réel.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((res) => {
            const book = getBookById(res.bookId);
            const isPending = res.status === 'en_attente';
            const isReady = res.status === 'prete' || res.status === 'validee';
            const isCompleted = res.status === 'terminee';
            const isCancelled = res.status === 'annulee';

            return (
              <div
                key={res.id}
                className={`bg-white rounded-xl border p-5 shadow-xs transition-all hover:border-slate-300 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 ${
                  isPending
                    ? 'border-l-4 border-l-amber-500 bg-amber-50/15'
                    : isReady
                    ? 'border-l-4 border-l-blue-700 bg-blue-50/15'
                    : isCompleted
                    ? 'border-l-4 border-l-emerald-600'
                    : 'border-l-4 border-l-slate-300 opacity-75'
                }`}
              >
                {/* Book & Reservation Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {book && (
                    <div className="w-16 shrink-0 hidden sm:block">
                      <BookCoverPhoto book={book} aspectClass="h-24" />
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                        {res.reservationNumber}
                      </span>

                      {isPending && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                          <Clock className="w-3 h-3" />
                          <span>En attente de mise de côté</span>
                        </span>
                      )}

                      {isReady && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-300">
                          <CheckCircle2 className="w-3 h-3 text-blue-700" />
                          <span>Prête au guichet BU</span>
                        </span>
                      )}

                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                          <FileCheck className="w-3 h-3 text-emerald-700" />
                          <span>Prêt délivré à l'étudiant</span>
                        </span>
                      )}

                      {isCancelled && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300">
                          <XCircle className="w-3 h-3 text-rose-700" />
                          <span>Réservation Annulée</span>
                        </span>
                      )}

                      <span className="text-[11px] text-slate-500 font-mono">
                        Demandée le {new Date(res.reservedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 font-serif leading-snug">
                      {book ? book.title : `Livre ref #${res.bookId}`}
                    </h3>

                    {book && (
                      <div className="text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>{book.author}</span>
                        <span>·</span>
                        <span className="font-mono font-semibold text-blue-900 bg-blue-50 px-1.5 py-0.2 rounded">
                          Cote: {book.shelfLocation}
                        </span>
                        <span>·</span>
                        <span className="text-slate-500">
                          Stock actuel : {book.availableCopies} dispo / {book.totalCopies}
                        </span>
                      </div>
                    )}

                    {/* Student Info Box */}
                    <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <User className="w-3.5 h-3.5 text-blue-800" />
                        <span>{res.studentName}</span>
                      </div>
                      <div className="font-mono text-blue-800 font-medium">CNE: {res.studentCne}</div>
                      <div className="text-slate-500">{res.studentDepartment}</div>
                      <div className="text-slate-500 font-mono text-[11px]">{res.studentEmail}</div>
                    </div>

                    {res.notes && (
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 mt-1 max-w-2xl">
                        <strong className="text-slate-800">Motif de l'étudiant :</strong> {res.notes}
                      </div>
                    )}

                    {res.pickupDeadline && !isCompleted && !isCancelled && (
                      <div className="text-[11px] text-amber-900 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                        <span>Date limite de retrait au guichet : <strong>{res.pickupDeadline}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Responsable Actions Panel */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-stretch gap-2 shrink-0 w-full sm:w-auto lg:w-56 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  {isPending && (
                    <button
                      onClick={() => handleMarkAsReady(res)}
                      disabled={isProcessingId === res.id}
                      className="w-full py-2 px-3 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                      <span>{isProcessingId === res.id ? 'Traitement...' : 'Valider & Marquer Prête'}</span>
                    </button>
                  )}

                  {(isPending || isReady) && (
                    <button
                      onClick={() => handleConvertToLoan(res)}
                      disabled={isProcessingId === res.id}
                      className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      title="L'étudiant est présent au guichet : valider la délivrance physique du livre et créer le prêt officiel"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-emerald-200" />
                      <span>{isProcessingId === res.id ? 'Conversion...' : 'Délivrer (Créer Prêt)'}</span>
                    </button>
                  )}

                  {!isCompleted && !isCancelled && (
                    <button
                      onClick={() => handleCancel(res)}
                      disabled={isProcessingId === res.id}
                      className="w-full py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Refuser / Annuler</span>
                    </button>
                  )}

                  {isCompleted && (
                    <div className="text-center py-2 px-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-xs font-semibold">
                      ✓ Prêt en cours actif
                    </div>
                  )}

                  {isCancelled && (
                    <div className="text-center py-2 px-3 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                      Exemplaire remis en rayon
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
