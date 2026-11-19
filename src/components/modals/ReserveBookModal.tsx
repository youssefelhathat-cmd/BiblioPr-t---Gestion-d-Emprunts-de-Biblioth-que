import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Book } from '../../types';
import { BookCoverPhoto } from '../common/BookCoverPhoto';
import {
  X,
  Calendar,
  CheckCircle2,
  Clock,
  BookOpen,
  User,
  ShieldCheck,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface ReserveBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
}

export const ReserveBookModal: React.FC<ReserveBookModalProps> = ({
  isOpen,
  onClose,
  book,
}) => {
  const { session, createReservation } = useLibrary();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedReservationNumber, setConfirmedReservationNumber] = useState<string | null>(null);

  if (!isOpen || !book) return null;

  const student = session.student;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    setIsSubmitting(true);
    const result = await createReservation(book.id, student.id, notes);
    setIsSubmitting(false);

    if (result.success && result.reservation) {
      setConfirmedReservationNumber(result.reservation.reservationNumber);
    }
  };

  const handleClose = () => {
    setConfirmedReservationNumber(null);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center border border-white/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif">
                Réserver un Ouvrage Universitaire
              </h3>
              <p className="text-[11px] text-blue-200">
                Service du Prêt & Réservations · BU EST Fès (USMBA)
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedReservationNumber ? (
          /* Confirmation Success View */
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Réservation transmise au Responsable de la BU
              </span>
              <h4 className="text-xl font-bold font-serif text-slate-900 pt-1">
                Réservation Confirmée !
              </h4>
              <div className="text-sm font-mono font-bold text-blue-900 bg-blue-50 py-1.5 px-3 rounded-lg max-w-xs mx-auto border border-blue-200 mt-2">
                Réf: {confirmedReservationNumber}
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs text-slate-700 space-y-2">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-800" />
                <span>Modalités de retrait au guichet :</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>
                  L'exemplaire physique de <strong>"{book.title}"</strong> est mis de côté par l'équipe de la bibliothèque.
                </li>
                <li>
                  Délai de garde : <strong>72 heures ouvrées</strong> au guichet de la BU EST Fès.
                </li>
                <li>
                  Présentez votre <strong>Pass Étudiant EST</strong> ou ce numéro de référence lors de votre venue.
                </li>
              </ul>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 px-4 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Fermer et consulter mes réservations
            </button>
          </div>
        ) : (
          /* Reservation Form View */
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Book preview card */}
            <div className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="w-20 shrink-0">
                <BookCoverPhoto book={book} aspectClass="h-28" />
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                  {book.category}
                </span>
                <h4 className="text-sm font-bold text-slate-900 font-serif leading-snug line-clamp-2">
                  {book.title}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-1">{book.author}</p>
                
                <div className="flex items-center gap-2 pt-1 text-[11px] font-mono">
                  <span className="text-slate-500">Cote :</span>
                  <span className="font-bold text-slate-800">{book.shelfLocation}</span>
                </div>
                
                <div className="text-[11px] text-emerald-700 font-semibold">
                  ✓ {book.availableCopies} exemplaire(s) disponible(s) en rayon
                </div>
              </div>
            </div>

            {/* Student info reminder */}
            {student && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-[11px]">
                    {student.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{student.fullName}</div>
                    <div className="text-[11px] text-blue-800 font-mono">
                      {student.cne} · {student.department}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Étudiant EST
                </span>
              </div>
            )}

            {/* Notes / Motif */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Motif ou commentaire pour le Responsable (Optionnel)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Ex : Pour préparation de projet DUT, révision examens..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Notice */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Notice d'engagement :</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Dès validation, l'ouvrage est réservé pour vous dans l'Espace Responsable de la bibliothèque. Vous disposerez de 72h ouvrées pour retirer l'exemplaire au guichet.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="submit"
                disabled={isSubmitting || book.availableCopies <= 0}
                className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Envoi de la réservation...</span>
                ) : (
                  <>
                    <BookOpen className="w-4 h-4 text-amber-300" />
                    <span>Confirmer la réservation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
