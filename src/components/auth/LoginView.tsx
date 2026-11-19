import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { AlertCircle, CheckCircle2, User, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

interface LoginViewProps {
  onSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { loginWithGooglePopup, loginWithGoogleEmail, loginAsResponsable } = useLibrary();

  const [loginMode, setLoginMode] = useState<'student' | 'responsable'>('student');
  const [emailInput, setEmailInput] = useState('youssef.elhathat@usmba.ac.ma');
  const [passwordInput, setPasswordInput] = useState('••••••••');
  const [responsableEmail, setResponsableEmail] = useState('responsable.bu@usmba.ac.ma');
  const [responsablePassword, setResponsablePassword] = useState('adminbu2026');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoSelector, setShowDemoSelector] = useState(true);

  // Real Google Sign-In Popup with official Google OAuth flow
  const handleRealGooglePopup = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    const res = await loginWithGooglePopup();
    setIsLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setErrorMessage(res.reason || 'Erreur lors de la connexion Google.');
    }
  };

  const handleDirectEmailLogin = async (emailToUse?: string) => {
    const email = emailToUse || emailInput;
    if (!email) {
      setErrorMessage('Veuillez saisir votre adresse email académique @usmba.ac.ma.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await loginWithGoogleEmail(email);
    setIsLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setErrorMessage(res.reason || 'Erreur lors de l\'authentification.');
    }
  };

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMessage('Veuillez saisir votre nom d\'utilisateur ou email.');
      return;
    }
    if (emailInput.includes('@')) {
      handleDirectEmailLogin(emailInput);
    } else {
      handleDirectEmailLogin(`${emailInput.toLowerCase().trim()}@usmba.ac.ma`);
    }
  };

  const handleResponsableLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const res = await loginAsResponsable(responsableEmail, responsablePassword);
    setIsLoading(false);

    if (res.success) {
      onSuccess();
    } else {
      setErrorMessage(res.error || 'Erreur lors de la connexion au compte Responsable.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Banner with Official EST USMBA Header */}
      <div className="w-full bg-white border-b border-slate-200 shadow-xs py-4 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-900 text-white flex items-center justify-center font-serif font-bold text-xl shadow-xs border-2 border-amber-400">
              EST
            </div>
            <div>
              <div className="text-xs sm:text-sm font-semibold text-slate-800" dir="rtl">
                جامعة سيدي محمد بن عبد الله بفاس - المدرسة العليا للتكنولوجيا
              </div>
              <div className="text-xs text-slate-500 font-medium tracking-tight">
                UNIVERSITÉ SIDI MOHAMED BEN ABDELLAH DE FÈS · ÉCOLE SUPÉRIEURE DE TECHNOLOGIE
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-900 font-semibold rounded-md flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-blue-800" />
              <span>Portail Étudiant · EST Fès</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Authentication Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="bg-white rounded-xl shadow-md border border-slate-200 max-w-5xl w-full overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Left Column: Formulaire d'accès & Connexion Google (7 cols) */}
          <div className="md:col-span-6 p-6 sm:p-8 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
            <div className="space-y-6">
              {/* Header inside form */}
              <div className="text-center space-y-1 pb-2">
                <div className="text-xs font-bold text-slate-800" dir="rtl">
                  جامعة سيدي محمد بن عبد الله بفاس
                </div>
                <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                  École Supérieure de Technologie de Fès
                </div>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('student');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    loginMode === 'student'
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Espace Étudiant EST
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('responsable');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    loginMode === 'responsable'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Responsable BU</span>
                </button>
              </div>

              {/* Alert message if access denied */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-300 text-rose-900 rounded-lg text-xs leading-relaxed flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Contrôle d'accès universitaire :</div>
                    <div>{errorMessage}</div>
                  </div>
                </div>
              )}

              {loginMode === 'student' ? (
                <>
                  {/* Real Google Sign-In Primary Button */}
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleRealGooglePopup}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-blue-50/50 border-2 border-blue-700 hover:border-blue-800 rounded-xl text-slate-900 text-sm font-bold transition-all shadow-xs cursor-pointer group"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                      <span>{isLoading ? 'Ouverture fenêtre Google...' : 'Se connecter avec Google réel'}</span>
                    </button>
                    <div className="text-[11px] text-center text-slate-500">
                      Ouvre la boîte de dialogue officielle Google OAuth pour votre compte
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative py-1 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <span className="relative bg-white px-3 text-xs text-slate-500 font-medium">
                      Ou saisie directe de vos identifiants :
                    </span>
                  </div>

                  {/* Formulaire classique */}
                  <form onSubmit={handleStandardLogin} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Adresse Académique (@usmba.ac.ma)
                      </label>
                      <input
                        type="text"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="youssef.elhathat@usmba.ac.ma"
                        className="w-full px-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Mot de passe
                      </label>
                      <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm rounded-lg transition-colors shadow-xs cursor-pointer"
                    >
                      {isLoading ? 'Connexion en cours...' : 'Valider la connexion Étudiant'}
                    </button>
                  </form>
                </>
              ) : (
                /* Responsable Form */
                <div className="space-y-4">
                  <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-1 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-400 text-slate-900 rounded font-sans">
                        ADMINISTRATION BU
                      </span>
                      <span className="text-xs text-slate-300 font-serif font-bold">EST Fès</span>
                    </div>
                    <h3 className="text-sm font-bold font-serif text-white pt-1">
                      Mme Fatima Zahra Alami
                    </h3>
                    <p className="text-xs text-slate-300">
                      Conservateur en Chef & Responsable BU · Université Sidi Mohamed Ben Abdellah
                    </p>
                  </div>

                  <form onSubmit={handleResponsableLoginSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Email Responsable BU
                      </label>
                      <input
                        type="text"
                        value={responsableEmail}
                        onChange={(e) => setResponsableEmail(e.target.value)}
                        placeholder="responsable.bu@usmba.ac.ma"
                        className="w-full px-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Mot de passe administrateur
                      </label>
                      <input
                        type="password"
                        value={responsablePassword}
                        onChange={(e) => setResponsablePassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-lg transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>{isLoading ? 'Accès en cours...' : 'Connexion Espace Responsable'}</span>
                    </button>
                  </form>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => handleResponsableLoginSubmit()}
                      disabled={isLoading}
                      className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-950 font-semibold text-xs rounded-lg border border-amber-300 transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                      <span>⚡ Connexion Rapide Responsable BU (1 Clic)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profil principal de l'utilisateur demandé */}
            {loginMode === 'student' && showDemoSelector && (
              <div className="mt-6 pt-4 border-t border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-blue-950 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Votre Compte Étudiant EST Enregistré :</span>
                  </span>
                </div>

                {/* Youssef El Hathat card */}
                <button
                  onClick={() => handleDirectEmailLogin('youssef.elhathat@usmba.ac.ma')}
                  className="w-full p-3 text-left rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 text-blue-950 transition-all shadow-xs flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Youssef El Hathat</span>
                      <span className="px-1.5 py-0.2 bg-blue-900 text-white text-[10px] font-mono rounded">
                        CNE: S132242260
                      </span>
                    </div>
                    <div className="text-[11px] text-blue-800 mt-0.5">
                      youssef.elhathat@usmba.ac.ma · DUT Génie Informatique (EST Fès)
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-900 bg-white px-2.5 py-1 rounded border border-blue-300 shrink-0">
                    Connexion directe →
                  </span>
                </button>

                {/* Tests de filtrage de sécurité universitaire */}
                <div className="pt-2 border-t border-slate-200">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Tester les règles de filtrage strictes :
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleDirectEmailLogin('moncompte@gmail.com')}
                      className="p-1.5 text-left rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 transition-colors cursor-pointer"
                      title="Tester le blocage de tout compte grand public @gmail.com"
                    >
                      <div className="font-semibold text-[10px] text-rose-950">@gmail.com</div>
                      <div className="text-[9px] text-rose-700">→ Rejet immédiat</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDirectEmailLogin('omar.tazi@usmba.ac.ma')}
                      className="p-1.5 text-left rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 transition-colors cursor-pointer"
                      title="Tester le blocage des étudiants non-EST (ex: FST)"
                    >
                      <div className="font-semibold text-[10px]">Omar (FST)</div>
                      <div className="text-[9px] text-amber-800">→ Rejet non-EST</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDirectEmailLogin('kenza.drissi@usmba.ac.ma')}
                      className="p-1.5 text-left rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 transition-colors cursor-pointer"
                      title="Tester le blocage des étudiants non-EST (ex: ENCG)"
                    >
                      <div className="font-semibold text-[10px]">Kenza (ENCG)</div>
                      <div className="text-[9px] text-amber-800">→ Rejet non-EST</div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Information Panel (conforme à l'image fournie) (5 cols) */}
          {/* Right Column: Information Panel */}
          <div className="md:col-span-6 p-6 sm:p-8 md:p-10 bg-slate-50 flex flex-col justify-between space-y-6">
            {loginMode === 'responsable' ? (
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-900 text-amber-400 rounded-md text-[11px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Supervision Administrative BU EST Fès</span>
                </div>

                <h2 className="text-xl font-bold font-serif text-slate-900">
                  Fonctionnalités de l'Espace Responsable
                </h2>

                <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>📊 Tableau de Bord Central</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Indicateurs d'activité en temps réel, volume des emprunts en cours, répartition par département et taux de disponibilité du fonds.
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
                    <div className="font-bold text-blue-900 flex items-center gap-1.5">
                      <span>📥 Gestion des Réservations Étudiants</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Réception instantanée des demandes de réservation, mise de côté des exemplaires physiques et conversion en prêts au guichet en 1 clic.
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <span>⚡ Scanner de Retour par Code QR</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Validation immédiate des restitutions au guichet par lecture du pass QR de l'étudiant ou du livre.
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
                    <div className="font-bold text-rose-900 flex items-center gap-1.5">
                      <span>🚨 Surveillance des Retards & Relances</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Moteur autonome de notification par gravité (Pré-alerte, Modérée, Élevée, Critique) sans intervention humaine.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <h2 className="text-xl font-bold font-serif text-slate-900">
                  Première connexion à la BU ?
                </h2>

                <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg">
                    <span className="font-bold text-blue-900">ℹ️ Information compte académique :</span>
                    <p className="mt-1 text-blue-800">
                      L'accès au fonds documentaire et au service de prêt de l'EST Fès nécessite votre compte académique officiel <strong>USMBA</strong>.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="font-semibold text-slate-800 flex items-center gap-1">
                      <span>🔗 Compte non encore activé ?</span>
                    </div>
                    <p className="text-slate-600">
                      👉 Veuillez utiliser le lien institutionnel suivant :
                    </p>
                    <a
                      href="https://usmba.ac.ma"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-blue-700 font-semibold hover:underline"
                    >
                      <span>Activation du compte académique USMBA</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>✅ Modalités de prêt documentaire :</span>
                    </div>
                    <ol className="list-decimal pl-4 space-y-1.5 text-slate-600">
                      <li>
                        <strong>Seuls les livres disponibles</strong> en rayon peuvent être réservés.
                      </li>
                      <li>
                        <strong>Réservation immédiate</strong> : Choisissez votre ouvrage et venez le récupérer au guichet sous 72h.
                      </li>
                      <li>
                        <strong>Suivi automatisé</strong> : Le système surveille les délais et vous alerte automatiquement par email.
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
              <span>EST Fès · Bibliothèque Universitaire</span>
              <span>Année académique 2026/2027</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        Université Sidi Mohamed Ben Abdellah de Fès · École Supérieure de Technologie (EST Fès)
      </footer>
    </div>
  );
};
