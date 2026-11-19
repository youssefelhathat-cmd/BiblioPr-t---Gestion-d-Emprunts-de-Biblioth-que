import React, { useState } from 'react';
import { Book } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  BookOpen,
  QrCode,
  ExternalLink,
  Smartphone,
  Copy,
  Check,
} from 'lucide-react';

interface BookQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
}

export const BookQRCodeModal: React.FC<BookQRCodeModalProps> = ({
  isOpen,
  onClose,
  book,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);

  if (!isOpen || !book) return null;

  const cleanIsbn = book.isbn ? book.isbn.trim() : '';

  // URL Google Livres (Google Books) exclusive et directe
  // Lorsque l'appareil photo du smartphone (ou Google Lens) scanne ce QR,
  // il détecte immédiatement le lien Google Livres officiel pour cet ouvrage.
  const googleLivresUrl = `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(
    `${book.title} ${cleanIsbn || book.author}`
  )}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(googleLivresUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyEtiquette = () => {
    const etiquetteText = `EST FÈS · BIBLIOTHÈQUE UNIVERSITAIRE\nOuvrage : ${book.title}\nAuteur : ${book.author}\nCote Rayon : ${book.shelfLocation}\nISBN : ${book.isbn}\nLien Google Livres : ${googleLivresUrl}`;
    navigator.clipboard.writeText(etiquetteText);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-blue-300 flex items-center gap-1">
                <span>Scan Smartphone · Google Livres</span>
              </div>
              <h2 className="text-sm font-bold font-serif leading-tight">
                Code QR Google Livres
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Printable Book Badge / QR Card */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 flex flex-col items-center text-center space-y-3">
            {/* Book metadata */}
            <div className="border-b border-slate-200 pb-2.5 w-full">
              <div className="text-[10px] font-bold text-blue-900 tracking-wider uppercase font-serif">
                EST Fès · Bibliothèque Universitaire (USMBA)
              </div>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-1 mt-0.5">
                {book.title}
              </h3>
              <div className="text-xs text-slate-600 truncate">{book.author}</div>
            </div>

            {/* REAL Standard QR Code (ISO standard with white quiet margin) */}
            <div className="relative p-3 bg-white border-2 border-slate-900 rounded-2xl shadow-sm">
              <QRCodeSVG
                value={googleLivresUrl}
                size={200}
                level="M"
                includeMargin={true}
              />

              {/* Google Livres Brand Pill */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-white px-3 py-0.5 rounded-full border border-slate-300 shadow-2xs flex items-center gap-1.5 whitespace-nowrap">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="text-[10px] font-bold text-slate-800 font-sans">
                  Google Livres
                </span>
              </div>
            </div>

            {/* Quick reference tags */}
            <div className="w-full bg-white p-2.5 rounded-xl border border-slate-200 text-xs font-mono space-y-1 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Cote Rayon :</span>
                <span className="font-bold text-blue-900">{book.shelfLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">ISBN :</span>
                <span className="text-slate-800">{book.isbn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Catégorie :</span>
                <span className="text-slate-700 font-sans">{book.category}</span>
              </div>
            </div>
          </div>

          {/* Smartphone Scan Instructions */}
          <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-900">
              <Smartphone className="w-4 h-4 text-blue-700" />
              <span>Comment scanner avec votre smartphone :</span>
            </div>
            <ol className="list-decimal pl-4 space-y-1 text-blue-900/90 text-[11px] leading-relaxed">
              <li>Ouvrez l'appareil photo de votre smartphone (iPhone, Android, Samsung, Xiaomi...) ou <strong>Google Lens</strong>.</li>
              <li>Pointez l'objectif vers ce code QR.</li>
              <li>Appuyez sur le lien <strong>Google Livres</strong> qui s'affiche pour consulter la fiche complète du livre !</li>
            </ol>
          </div>

          {/* Action buttons (No window.print to prevent iframe locker errors) */}
          <div className="pt-1 flex flex-col sm:flex-row items-center gap-2">
            <a
              href={googleLivresUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Tester le scan (Ouvrir Google Livres)</span>
            </a>

            <button
              type="button"
              onClick={handleCopyUrl}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              title="Copier le lien Google Livres encodé"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Lien copié</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copier l'URL</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyEtiquette}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
              title="Copier les références complètes pour étiquette"
            >
              {copiedBadge ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Fiche copiée</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  <span>Fiche Étiquette</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Format ISO standard Google Livres</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
