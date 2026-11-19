import React, { useState, useMemo } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Book } from '../../types';
import {
  Search,
  BookOpen,
  QrCode,
  Clock,
  RefreshCw,
  PlusCircle,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { BookQRCodeModal } from '../modals/BookQRCodeModal';
import { BookDetailsModal } from '../modals/BookDetailsModal';
import { BookCoverPhoto } from '../common/BookCoverPhoto';
import { ReserveBookModal } from '../modals/ReserveBookModal';

interface CatalogViewProps {
  onOpenNewLoanWithBook?: (bookId: string) => void;
  onBackToStudentPortal?: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  onOpenNewLoanWithBook,
  onBackToStudentPortal,
}) => {
  const { books, refreshData, session } = useLibrary();

  const isStudent = session.role === 'student';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | 'available' | 'borrowed'>('all');
  const [selectedBookForQR, setSelectedBookForQR] = useState<Book | null>(null);
  const [selectedBookForDetails, setSelectedBookForDetails] = useState<Book | null>(null);
  const [selectedBookForReservation, setSelectedBookForReservation] = useState<Book | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Catégories thématiques normales extraites dynamiquement du fonds documentaire
  const categories = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.category && b.category.trim()) {
        set.add(b.category.trim());
      }
    });
    return ['all', ...Array.from(set).sort()];
  }, [books]);

  const filteredBooks = books.filter((book) => {
    // Si connecté en tant qu'étudiant : n'afficher STRICTEMENT que les livres disponibles en rayon !
    if (isStudent && book.availableCopies <= 0) return false;

    if (selectedCategory !== 'all' && book.category !== selectedCategory) return false;
    if (availabilityFilter === 'available' && book.availableCopies <= 0) return false;
    if (availabilityFilter === 'borrowed' && book.availableCopies === book.totalCopies) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.isbn.includes(q) ||
        book.shelfLocation.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      {onBackToStudentPortal && (
        <div className="pb-1">
          <button
            onClick={onBackToStudentPortal}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-900 hover:text-blue-950 transition-colors cursor-pointer"
          >
            <span>&larr; Retour à mon Espace Étudiant (Mes Emprunts & Pass QR)</span>
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            Fonds Documentaire EST Fès (API Centrale)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Catalogue synchronisé en temps réel avec le service d'inventaire universitaire · 55 ouvrages
          </p>
        </div>

        {/* Sync Button (No Add/Delete buttons per user requirements!) */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-700 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Synchroniser avec l'API</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Availability filter tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg self-start">
            <button
              onClick={() => setAvailabilityFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                availabilityFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tous ({books.length})
            </button>
            <button
              onClick={() => setAvailabilityFilter('available')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                availabilityFilter === 'available'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Disponibles en rayon ({books.filter((b) => b.availableCopies > 0).length})
            </button>
            <button
              onClick={() => setAvailabilityFilter('borrowed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                availabilityFilter === 'borrowed'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              En circulation ({books.filter((b) => b.availableCopies < b.totalCopies).length})
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par titre, auteur, cote, ISBN..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>
        </div>

        {/* Category Horizontal Buttons (Normal Library Categories) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap text-xs font-medium cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-900 text-white font-semibold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {cat === 'all' ? `Toutes les catégories (${books.length})` : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-16 text-center">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-700">Aucun ouvrage trouvé</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Modifiez vos filtres ou effectuez une autre recherche dans le fonds documentaire.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBooks.map((book) => {
            const isAvailable = book.availableCopies > 0;

            return (
              <div
                key={book.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs flex flex-col justify-between overflow-hidden transition-all group"
              >
                <div>
                  {/* Cover Photo */}
                  <div className="relative">
                    <BookCoverPhoto book={book} aspectClass="h-44" />

                    <div className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-xs">
                      {book.shelfLocation}
                    </div>

                    {book.niveau && (
                      <div className="absolute top-2.5 left-2.5 bg-blue-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xs">
                        {book.niveau}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] gap-2">
                      <span className="text-blue-900 font-semibold truncate bg-blue-50 px-2 py-0.5 rounded">
                        {book.category}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        Éd. {book.publishedYear}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 font-serif leading-snug line-clamp-2" title={book.title}>
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-1">{book.author}</p>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                      {book.description}
                    </p>
                  </div>
                </div>

                {/* Actions & QR Code Generator */}
                <div className="p-4 pt-2 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Exemplaires :</span>
                    <span
                      className={`font-mono tabular-nums font-semibold ${
                        isAvailable ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {book.availableCopies} dispo{book.availableCopies > 1 ? 's' : ''} / {book.totalCopies}
                    </span>
                  </div>

                  {/* Primary Action */}
                  {isStudent && isAvailable && (
                    <button
                      onClick={() => setSelectedBookForReservation(book)}
                      className="w-full py-2 px-3 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                      <span>Réserver cet ouvrage</span>
                    </button>
                  )}

                  {!isStudent && onOpenNewLoanWithBook && isAvailable && (
                    <button
                      onClick={() => onOpenNewLoanWithBook(book.id)}
                      className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Créer un prêt au guichet</span>
                    </button>
                  )}

                  <div className="flex items-center justify-between gap-1.5 pt-1">
                    {/* Bouton Sommaire */}
                    <button
                      onClick={() => setSelectedBookForDetails(book)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer"
                      title="Consulter le sommaire et les chapitres de l'ouvrage"
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-600" />
                      <span>Sommaire</span>
                    </button>

                    {/* Générer Code QR pour chaque livre */}
                    <button
                      onClick={() => setSelectedBookForQR(book)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-blue-950 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors shadow-2xs cursor-pointer"
                      title="Générer le code QR Google Livres scannable sur smartphone"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-blue-800" />
                      <span>QR Google Livres</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reserve Book Modal */}
      <ReserveBookModal
        isOpen={Boolean(selectedBookForReservation)}
        onClose={() => setSelectedBookForReservation(null)}
        book={selectedBookForReservation}
      />

      {/* Book QR Code Modal */}
      <BookQRCodeModal
        isOpen={Boolean(selectedBookForQR)}
        onClose={() => setSelectedBookForQR(null)}
        book={selectedBookForQR}
      />

      {/* Book Details & Sommaire Modal */}
      <BookDetailsModal
        isOpen={Boolean(selectedBookForDetails)}
        onClose={() => setSelectedBookForDetails(null)}
        book={selectedBookForDetails}
        onOpenQRCode={(book) => setSelectedBookForQR(book)}
        canLoan={false}
      />
    </div>
  );
};
