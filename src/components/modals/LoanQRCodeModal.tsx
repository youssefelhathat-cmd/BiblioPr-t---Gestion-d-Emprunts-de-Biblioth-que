import React, { useState } from 'react';
import { Loan } from '../../types';
import { useLibrary } from '../../context/LibraryContext';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, BookOpen, Calendar, Clock, CheckCircle, ExternalLink, QrCode } from 'lucide-react';

interface LoanQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
}

export const LoanQRCodeModal: React.FC<LoanQRCodeModalProps> = ({
  isOpen,
  onClose,
  loan,
}) => {
  const { getBookById, getStudentById } = useLibrary();
  const [scanTarget, setScanTarget] = useState<'guichet' | 'google'>('guichet');

  if (!isOpen || !loan) return null;

  const book = getBookById(loan.bookId);
  const student = getStudentById(loan.studentId);

  // Payload guichet standard
  const guichetPayload = JSON.stringify({
    type: 'EST_LOAN_RETURN',
    loanId: loan.id,
    loanNumber: loan.loanNumber,
    bookId: loan.bookId,
    studentId: loan.studentId,
    qrToken: loan.qrToken,
  });

  // URL Google au scan pour smartphone
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `EST Fes BU Restitution Emprunt ${loan.loanNumber} ${book?.title || ''}`
  )}`;

  const activePayload = scanTarget === 'google' ? googleSearchUrl : guichetPayload;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full overflow-hidden">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-300" />
            <span className="text-xs font-bold tracking-wide">Pass Restitution Mobile</span>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Présentez ce code au guichet BU
            </div>
            <div className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
              {book?.title || 'Ouvrage'}
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              Étudiant : <span className="font-semibold text-slate-900">{student?.fullName}</span>
            </div>
            <div className="text-[11px] font-mono text-slate-500">
              CNE : {student?.cne} · {student?.department}
            </div>
          </div>

          {/* Toggle format: Guichet BU vs Google Search Smartphone */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl text-xs w-full">
            <button
              type="button"
              onClick={() => setScanTarget('guichet')}
              className={`py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer ${
                scanTarget === 'guichet'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Scan Guichet BU
            </button>
            <button
              type="button"
              onClick={() => setScanTarget('google')}
              className={`py-1.5 px-2 rounded-lg font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                scanTarget === 'google'
                  ? 'bg-white text-blue-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Scan Google</span>
            </button>
          </div>

          {/* High Readability QR Code */}
          <div className="p-3 bg-white border-2 border-slate-900 rounded-xl shadow-sm">
            <QRCodeSVG
              value={activePayload}
              size={190}
              level="M"
              includeMargin={true}
            />
          </div>

          <div className="w-full bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1.5 text-left">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">N° Emprunt :</span>
              <span className="font-mono font-bold text-slate-800">{loan.loanNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Date limite de retour :</span>
              <span className="font-mono font-bold text-blue-950">{loan.dueDate}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-sans">Statut :</span>
              <span className={loan.status === 'en_retard' ? 'text-rose-600 font-bold' : 'text-emerald-700 font-medium'}>
                {loan.status === 'en_retard' ? 'En retard' : 'En cours'}
              </span>
            </div>
          </div>

          {scanTarget === 'google' && (
            <a
              href={googleSearchUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 font-semibold text-xs rounded-lg border border-blue-200 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Tester le résultat Google</span>
            </a>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Fermer le pass
          </button>
        </div>
      </div>
    </div>
  );
};
