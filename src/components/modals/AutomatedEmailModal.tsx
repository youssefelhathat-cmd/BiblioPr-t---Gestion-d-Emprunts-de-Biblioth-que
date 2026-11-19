import React, { useState } from 'react';
import { AutomatedEmailRecord } from '../../types';
import {
  X,
  Mail,
  ShieldAlert,
  AlertTriangle,
  Copy,
  Check,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Printer,
} from 'lucide-react';

interface AutomatedEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: AutomatedEmailRecord | null;
}

export const AutomatedEmailModal: React.FC<AutomatedEmailModalProps> = ({
  isOpen,
  onClose,
  email,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !email) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Objet : ${email.subject}\n\n${email.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getGravityBadge = (gravity: string) => {
    switch (gravity) {
      case 'critique':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          dot: 'bg-rose-600',
          label: 'Niveau 4 : Gravité Critique (Sanction Académique & Blocage de Scolarité)',
        };
      case 'elevee':
        return {
          bg: 'bg-orange-100 text-orange-800 border-orange-300',
          dot: 'bg-orange-600',
          label: 'Niveau 3 : Gravité Élevée (Suspension des droits de prêt)',
        };
      case 'moderee':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          dot: 'bg-amber-600',
          label: 'Niveau 2 : Gravité Modérée (1ère Relance Automatique)',
        };
      default:
        return {
          bg: 'bg-sky-100 text-sky-800 border-sky-300',
          dot: 'bg-sky-600',
          label: 'Niveau 1 : Rappel Préventif (Échéance imminente)',
        };
    }
  };

  const badgeInfo = getGravityBadge(email.gravity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="no-print bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-blue-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-800/80 text-amber-400 border border-amber-400/40 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Expédition 100% Automatique par la Plateforme</span>
              </div>
              <h2 className="text-base font-bold font-serif leading-tight">
                {email.subject}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Automatic Dispatch Confirmation Banner */}
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between gap-3 text-emerald-950">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-900">
                  Message envoyé automatiquement sans aucune intervention humaine
                </div>
                <div className="text-[11px] text-emerald-800">
                  Transmis au serveur académique USMBA pour le compte de l'étudiant
                </div>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
              ENVOYÉ
            </span>
          </div>

          {/* Gravity Banner */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between ${badgeInfo.bg}`}>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${badgeInfo.dot}`} />
              <span className="text-xs font-bold">{badgeInfo.label}</span>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-white/70">
              {email.overdueDays > 0 ? `+${email.overdueDays} jours de retard` : 'Échéance J'}
            </span>
          </div>

          {/* Email Transmission Metadata Grid */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-slate-200 pb-2">
              <span className="text-slate-500">Expéditeur automatique :</span>
              <span className="font-semibold text-slate-800 font-mono">
                Bibliothèque Universitaire EST Fès &lt;bu.est@usmba.ac.ma&gt;
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-slate-200 pb-2">
              <span className="text-slate-500">Destinataire académique (@usmba.ac.ma) :</span>
              <span className="font-semibold text-blue-900 font-mono">
                {email.studentName} &lt;{email.studentEmail}&gt; (CNE: {email.cne})
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-slate-200 pb-2">
              <span className="text-slate-500">Horodatage d'envoi automatique :</span>
              <span className="font-mono text-slate-700">
                {new Date(email.sentAt).toLocaleString('fr-FR', {
                  dateStyle: 'full',
                  timeStyle: 'medium',
                })}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
              <span className="text-slate-500">Déclencheur autonome (Date de délivrance) :</span>
              <span className="font-medium text-slate-800">{email.triggerReason}</span>
            </div>
          </div>

          {/* Email Body */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                Texte officiel transmis à l'étudiant :
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le texte</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed border border-slate-800 select-all shadow-inner">
              {email.body}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="no-print p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Système autonome EST Fès · Aucun envoi manuel requis</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Texte copié</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier l'avis</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
