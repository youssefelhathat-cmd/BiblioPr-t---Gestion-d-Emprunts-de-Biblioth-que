import React from 'react';
import { Book } from '../../types';
import { X, BookOpen, Layers, QrCode, Tag, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import { BookCoverPhoto } from '../common/BookCoverPhoto';

interface BookDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
  onOpenQRCode?: (book: Book) => void;
  onLoanBook?: (bookId: string) => void;
  canLoan?: boolean;
}

export const BookDetailsModal: React.FC<BookDetailsModalProps> = ({
  isOpen,
  onClose,
  book,
  onOpenQRCode,
  onLoanBook,
  canLoan = false,
}) => {
  if (!isOpen || !book) return null;

  const isAvailable = book.availableCopies > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-900 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
                Fiche Ouvrage & Sommaire Pédagogique
              </span>
              <h2 className="text-base font-bold font-serif text-slate-900 line-clamp-1">
                {book.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Book Hero with Cover Image */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-24 sm:w-28 h-36 sm:h-40 rounded-xl overflow-hidden shadow-sm shrink-0 border border-slate-200">
              <BookCoverPhoto book={book} aspectClass="h-full" />
            </div>
            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <div className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-blue-100 text-blue-900">
                {book.category}
              </div>
              <h1 className="text-base sm:text-lg font-bold font-serif text-slate-900 leading-snug">
                {book.title}
              </h1>
              <p className="text-xs text-slate-600 font-medium">Auteur(s) : {book.author}</p>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mt-1">
                {book.description}
              </p>
            </div>
          </div>

          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">Catégorie</span>
              <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">{book.category}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">Niveau</span>
              <div className="text-xs font-bold text-blue-900 mt-0.5">{book.niveau || 'Standard'}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">Cote Rayon</span>
              <div className="text-xs font-bold font-mono text-slate-800 mt-0.5">{book.shelfLocation}</div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium">Disponibilité</span>
              <div className={`text-xs font-bold font-mono mt-0.5 ${isAvailable ? 'text-emerald-700' : 'text-rose-700'}`}>
                {book.availableCopies} / {book.totalCopies} dispo
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Présentation de l'ouvrage
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {book.description}
            </p>
          </div>

          {/* Sommaire / Table des matières */}
          {book.sommaire && book.sommaire.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-800" />
                  <span>Sommaire & Chapitres du document</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {book.sommaire.length} chapitres
                </span>
              </div>

              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden bg-white">
                {book.sommaire.map((chap) => (
                  <div key={chap.chapitre} className="p-3.5 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-900 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                      {chap.chapitre}
                    </span>
                    <span className="text-xs font-medium text-slate-800">
                      {chap.titre}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bibliographic information */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-500 space-y-1 font-mono">
            <div><span className="font-semibold text-slate-700">Auteur :</span> {book.author}</div>
            <div><span className="font-semibold text-slate-700">ISBN :</span> {book.isbn}</div>
            <div><span className="font-semibold text-slate-700">Année d'édition :</span> {book.publishedYear}</div>
            {book.publisher && <div><span className="font-semibold text-slate-700">Éditeur :</span> {book.publisher}</div>}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
          {onOpenQRCode && (
            <button
              onClick={() => {
                onClose();
                onOpenQRCode(book);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-blue-900" />
              <span>Code QR Google Livres</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {canLoan && onLoanBook && (
              <button
                onClick={() => {
                  onClose();
                  onLoanBook(book.id);
                }}
                disabled={!isAvailable}
                className={`px-4 py-2 text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer ${
                  isAvailable
                    ? 'bg-blue-900 hover:bg-blue-800 text-white'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Prêter cet ouvrage
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
