import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  StudentEST,
  Book,
  Loan,
  LibrarySettings,
  UserSession,
  OverdueSeverity,
  AutomatedEmailRecord,
  BookReservation,
  ReservationStatus,
  LibrarianUser,
} from '../types';
import * as api from '../services/api';
import { googleSignIn, googleSignOut, initAuth } from '../services/firebaseAuth';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface OverdueEmailData {
  severity: OverdueSeverity;
  to: string;
  studentName: string;
  bookTitle: string;
  dueDate: string;
  overdueDays: number;
  subject: string;
  body: string;
  gmailComposeUrl: string;
}

interface LibraryContextType {
  // Session & Auth (Student or Responsable)
  session: UserSession;
  loginWithGooglePopup: () => Promise<{ success: boolean; error?: string; reason?: string }>;
  loginWithGoogleEmail: (email: string) => Promise<{ success: boolean; error?: string; reason?: string }>;
  loginAsResponsable: (email?: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Data
  studentsEST: StudentEST[];
  allTestStudents: StudentEST[];
  books: Book[];
  availableBooks: Book[];
  loans: Loan[];
  reservations: BookReservation[];
  automatedEmails: AutomatedEmailRecord[];
  settings: LibrarySettings;
  toasts: Toast[];
  currentDateStr: string;

  // Actions
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  createLoan: (bookId: string, studentId: string, durationDays?: number, notes?: string) => Promise<{ success: boolean; error?: string }>;
  returnLoanWithQR: (qrData: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  createReservation: (bookId: string, studentId: string, notes?: string) => Promise<{ success: boolean; error?: string; reservation?: BookReservation }>;
  updateReservationStatus: (id: string, status: ReservationStatus, pickupDeadline?: string, notes?: string) => Promise<{ success: boolean; error?: string }>;
  convertReservationToLoan: (id: string) => Promise<{ success: boolean; loan?: Loan; message?: string; error?: string }>;
  cancelReservation: (id: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  refreshData: () => Promise<void>;
  triggerAutomatedCheck: () => Promise<void>;
  simulateLoanDueDate: (loanId: string, daysOffset?: number, resetToNormal?: boolean) => Promise<void>;

  // Helpers
  getBookById: (id: string) => Book | undefined;
  getStudentById: (id: string) => StudentEST | undefined;
  getStudentActiveLoans: (studentId: string) => Loan[];
  getStudentReservations: (studentId: string) => BookReservation[];
  getOverdueDays: (dueDate: string) => number;
  getOverdueSeverity: (dueDate: string) => OverdueSeverity;
  getOverdueEmailData: (loan: Loan) => OverdueEmailData | null;
}

const DEFAULT_SETTINGS: LibrarySettings = {
  libraryName: 'Bibliothèque Universitaire de l\'EST Fès',
  institution: 'Université Sidi Mohamed Ben Abdellah (USMBA)',
  defaultLoanDurationDays: 14,
  extensionDays: 7,
  maxExtensions: 2,
  defaultMaxLoans: 3,
  emailContact: 'bu.est@usmba.ac.ma',
  phoneContact: '+212 535 60 05 84',
  address: 'Km 5, Route d\'Imouzzer, BP 2427, Fès, Maroc',
};

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export const LibraryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentDateStr = new Date().toISOString().split('T')[0];

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [settings] = useState<LibrarySettings>(DEFAULT_SETTINGS);

  // Authentication session
  const [session, setSession] = useState<UserSession>(() => {
    try {
      const stored = localStorage.getItem('est_library_session_v3');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      isAuthenticated: false,
      role: null,
    };
  });

  const [studentsEST, setStudentsEST] = useState<StudentEST[]>([]);
  const [allTestStudents, setAllTestStudents] = useState<StudentEST[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [reservations, setReservations] = useState<BookReservation[]>([]);
  const [automatedEmails, setAutomatedEmails] = useState<AutomatedEmailRecord[]>([]);

  // Livres strictement disponibles en rayon (pour l'Espace Étudiant)
  const availableBooks = useMemo(() => books.filter((b) => b.availableCopies > 0), [books]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load initial data from API
  const refreshData = async () => {
    const [estStudentsData, allStudentsData, booksData, loansData, emailsData, reservationsData] = await Promise.all([
      api.fetchESTStudents(),
      api.fetchAllStudents(),
      api.fetchBooks(),
      api.fetchLoans(),
      api.fetchAutomatedEmails(),
      api.fetchReservations(),
    ]);

    if (estStudentsData.length > 0) setStudentsEST(estStudentsData);
    if (allStudentsData.length > 0) setAllTestStudents(allStudentsData);
    if (booksData.length > 0) setBooks(booksData);
    if (loansData.length > 0) setLoans(loansData);
    if (emailsData.length > 0) setAutomatedEmails(emailsData);
    if (reservationsData.length > 0) setReservations(reservationsData);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Surveillance automatique en temps réel des relances et des réservations (toutes les 8 secondes)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [latestEmails, latestReservations, latestLoans] = await Promise.all([
          api.fetchAutomatedEmails(),
          api.fetchReservations(),
          api.fetchLoans(),
        ]);

        if (latestReservations.length > 0) {
          setReservations(latestReservations);
        }
        if (latestLoans.length > 0) {
          setLoans(latestLoans);
        }

        setAutomatedEmails((prev) => {
          if (latestEmails.length > prev.length) {
            const newlySent = latestEmails.filter((ne) => !prev.some((p) => p.id === ne.id));
            if (newlySent.length > 0 && session.isAuthenticated && session.student) {
              const myNewEmails = newlySent.filter((m) => m.studentId === session.student?.id);
              if (myNewEmails.length > 0) {
                const latestOne = myNewEmails[0];
                addToast(
                  `[Robot Automatique EST Fès] Email envoyé à ${latestOne.studentEmail} (${latestOne.gravityLabel})`,
                  'info'
                );
              }
            }
            return latestEmails;
          }
          return prev;
        });
      } catch {}
    }, 8000);
    return () => clearInterval(interval);
  }, [session]);

  // Save session
  useEffect(() => {
    localStorage.setItem('est_library_session_v3', JSON.stringify(session));
  }, [session]);

  // Real Google Sign-In with official Popup
  const loginWithGooglePopup = async () => {
    try {
      const authResult = await googleSignIn();
      if (!authResult || !authResult.user) {
        return { success: false, reason: 'Connexion Google annulée.' };
      }

      const googleUser = authResult.user;
      const email = googleUser.email || '';
      const displayName = googleUser.displayName || undefined;
      const photoUrl = googleUser.photoURL || undefined;

      const result = await api.authenticateWithGoogle(email, displayName, photoUrl);

      if (result.allowed && result.student) {
        const newSession: UserSession = {
          isAuthenticated: true,
          role: 'student',
          student: result.student,
        };
        setSession(newSession);
        addToast(
          `Authentifié avec succès avec Google : ${result.student.fullName} (CNE : ${result.student.cne} · EST Fès)`
        );
        return { success: true };
      }

      // Rejection
      const errorMsg = result.reason || 'Accès refusé pour ce compte Google.';
      addToast(errorMsg, 'error');
      return { success: false, reason: errorMsg };
    } catch (err: any) {
      console.warn('Erreur Popup Google:', err);
      // If popup blocked or error, provide clear guidance
      const message = err.message?.includes('popup-closed')
        ? 'La fenêtre de connexion Google a été fermée.'
        : 'Impossible d\'ouvrir la fenêtre Google. Vous pouvez également saisir votre email ci-dessous.';
      addToast(message, 'error');
      return { success: false, reason: message };
    }
  };

  const loginWithGoogleEmail = async (email: string) => {
    const result = await api.authenticateWithGoogle(email);

    if (result.allowed && result.student) {
      const newSession: UserSession = {
        isAuthenticated: true,
        role: 'student',
        student: result.student,
      };
      setSession(newSession);
      addToast(`Connexion réussie : ${result.student.fullName} (CNE : ${result.student.cne} - EST Fès)`);
      return { success: true };
    }

    const errorMsg = result.reason || 'Accès refusé pour ce compte Google.';
    addToast(errorMsg, 'error');
    return { success: false, reason: errorMsg };
  };

  const loginAsResponsable = async (email?: string, password?: string) => {
    const result = await api.authenticateResponsable(email, password);
    if (result.allowed && result.librarian) {
      const newSession: UserSession = {
        isAuthenticated: true,
        role: 'responsable',
        librarian: result.librarian,
      };
      setSession(newSession);
      addToast(result.message || 'Bienvenue dans l\'Espace Responsable Bibliothèque EST Fès');
      return { success: true };
    }
    const errorMsg = result.reason || 'Identifiants Responsable incorrects.';
    addToast(errorMsg, 'error');
    return { success: false, error: errorMsg };
  };

  const triggerAutomatedCheck = async () => {
    try {
      const result = await api.checkAutomatedEmails();
      if (result.success) {
        const latestEmails = await api.fetchAutomatedEmails();
        const latestLoans = await api.fetchLoans();
        setAutomatedEmails(latestEmails);
        setLoans(latestLoans);
        if (result.dispatchedCount > 0) {
          addToast(
            `[Audit Automatique BU EST Fès] ${result.dispatchedCount} nouvel(s) email(s) envoyé(s) selon la gravité.`,
            'info'
          );
        } else {
          addToast('Audit automatique exécuté : Aucun nouveau retard détecté.', 'info');
        }
      }
    } catch {
      addToast('Erreur lors du déclenchement de l\'audit automatique.', 'error');
    }
  };

  const simulateLoanDueDate = async (
    loanId: string,
    daysOffset?: number,
    resetToNormal?: boolean
  ) => {
    try {
      const result = await api.simulateLoanDueDate(loanId, daysOffset, resetToNormal);
      if (result.success && result.loan) {
        // Mettre à jour l'emprunt dans l'état local
        setLoans((prev) =>
          prev.map((l) => (l.id === result.loan!.id ? result.loan! : l))
        );
        // Rafraîchir les emails automatiques
        const latestEmails = await api.fetchAutomatedEmails();
        setAutomatedEmails(latestEmails);

        if (resetToNormal) {
          addToast('Échéance remise dans les délais normaux (+14 jours). Statut régularisé.');
        } else if (typeof daysOffset === 'number') {
          const delay = Math.abs(daysOffset);
          addToast(
            `Simulation appliquée : ${delay}j de retard. Le robot a évalué la gravité et déclenché l'envoi sans intervention humaine !`,
            'info'
          );
        }
      }
    } catch {
      addToast('Erreur lors de la simulation d\'échéance.', 'error');
    }
  };

  const logout = async () => {
    try {
      await googleSignOut();
    } catch {}
    setSession({
      isAuthenticated: false,
      role: null,
    });
    addToast('Vous avez été déconnecté.', 'info');
  };

  const getBookById = (id: string) => books.find((b) => b.id === id);
  const getStudentById = (id: string) =>
    studentsEST.find((s) => s.id === id) || allTestStudents.find((s) => s.id === id);

  const getStudentActiveLoans = (studentId: string) =>
    loans.filter(
      (l) => l.studentId === studentId && (l.status === 'en_cours' || l.status === 'en_retard')
    );

  const getOverdueDays = (dueDate: string): number => {
    if (dueDate >= currentDateStr) return 0;
    const dueTime = new Date(dueDate).getTime();
    const currTime = new Date(currentDateStr).getTime();
    const diff = Math.floor((currTime - dueTime) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const getOverdueSeverity = (dueDate: string): OverdueSeverity => {
    const days = getOverdueDays(dueDate);
    if (days <= 0) return 'mild';
    if (days <= 7) return 'mild';       // 1 - 7 jours : Jaune
    if (days <= 14) return 'moderate';  // 8 - 14 jours : Orange
    return 'critical';                  // > 14 jours : Rouge
  };

  // Dedicated email templates for each severity level with direct Gmail URL
  const getOverdueEmailData = (loan: Loan): OverdueEmailData | null => {
    const book = getBookById(loan.bookId);
    const student = getStudentById(loan.studentId);
    const days = getOverdueDays(loan.dueDate);

    if (!book || !student || days <= 0) return null;

    const severity = getOverdueSeverity(loan.dueDate);

    let subject = '';
    let body = '';

    if (severity === 'mild') {
      subject = `[BU EST Fès] Rappel amical : Restitution de "${book.title}"`;
      body = `Bonjour ${student.fullName},

Nous vous informons que le prêt suivant arrive à échéance à la Bibliothèque Universitaire de l'EST Fès :

• Ouvrage : "${book.title}" (${book.author})
• Cote en rayon : ${book.shelfLocation}
• Date de retour prévue : ${loan.dueDate} (Dépassement constaté : ${days} jour(s))

Merci de rapporter cet exemplaire au guichet de l'EST Fès ou de présenter votre QR code sur mobile. Si aucun autre étudiant n'attend cet ouvrage, une prolongation peut être accordée.

Cordialement,
Le service du prêt - EST Fès (USMBA)
${settings.emailContact} | Tél : ${settings.phoneContact}`;
    } else if (severity === 'moderate') {
      subject = `[BU EST Fès - 2e Avertissement] Retard important de restitution - ${student.cne}`;
      body = `Bonjour ${student.fullName} (Filière : ${student.department}),

Malgré notre premier message, l'ouvrage suivant n'a toujours pas été restitué à la Bibliothèque de l'EST Fès :

• Ouvrage : "${book.title}"
• Date d'échéance : ${loan.dueDate}
• Retard constaté : ${days} jours

Conformément au règlement des études de l'École Supérieure de Technologie de Fès, vos droits d'emprunt sont temporairement suspendus jusqu'à la régularisation de ce document.

Merci de vous présenter impérativement au guichet sous 48 heures muni de l'ouvrage.

Le Service de la Bibliothèque - EST Fès
Université Sidi Mohamed Ben Abdellah`;
    } else {
      subject = `[URGENT - MISE EN DEMEURE EST Fès] Non-restitution de livre documentaire - Blocage de scolarité`;
      body = `Monsieur / Madame ${student.fullName} (CNE : ${student.cne}),
Département : ${student.department} - EST Fès,

Nous constatons un retard critique de restitution d'ouvrage au sein du fonds documentaire de l'EST Fès :

• Document : "${book.title}" (ISBN: ${book.isbn})
• Réf. d'emprunt : ${loan.loanNumber}
• Date limite dépassée depuis : ${days} jours (échéance initiale : ${loan.dueDate})

À défaut de restitution immédiate sous 3 jours ouvrés, votre dossier sera transmis à l'Administration et à la Direction des Études de l'EST Fès pour blocage de vos attestations de scolarité et facturation du remplacement à neuf de l'ouvrage.

La Direction de l'EST Fès - Université Sidi Mohamed Ben Abdellah
Route d'Imouzzer, Fès`;
    }

    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      student.email
    )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    return {
      severity,
      to: student.email,
      studentName: student.fullName,
      bookTitle: book.title,
      dueDate: loan.dueDate,
      overdueDays: days,
      subject,
      body,
      gmailComposeUrl,
    };
  };

  const createLoan = async (
    bookId: string,
    studentId: string,
    durationDays = 14,
    notes = ''
  ) => {
    const book = getBookById(bookId);
    const student = getStudentById(studentId);

    if (!book || book.availableCopies <= 0) {
      addToast('Aucun exemplaire disponible en rayon pour ce livre.', 'error');
      return { success: false, error: 'Exemplaire indisponible.' };
    }

    if (!student || student.school !== 'EST') {
      addToast('Seuls les étudiants de l\'EST Fès peuvent emprunter.', 'error');
      return { success: false, error: 'Étudiant non éligible.' };
    }

    try {
      const res = await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId, studentId, durationDays, notes }),
      });
      if (res.ok) {
        const newLoan = await res.json();
        setLoans((prev) => [newLoan, ...prev]);
        setBooks((prev) =>
          prev.map((b) => (b.id === bookId ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) } : b))
        );
        addToast(`Emprunt validé pour ${student.fullName} ! Code QR d'emprunt généré.`);
        return { success: true };
      }
    } catch {}

    const loanId = `emp-est-${Date.now()}`;
    const dueObj = new Date();
    dueObj.setDate(dueObj.getDate() + durationDays);
    const dueDate = dueObj.toISOString().split('T')[0];

    const fallbackLoan: Loan = {
      id: loanId,
      loanNumber: `EST-2026-${String(loans.length + 101).padStart(4, '0')}`,
      bookId,
      studentId,
      borrowDate: currentDateStr,
      dueDate,
      status: 'en_cours',
      qrToken: `QR-LOAN-${loanId}-SECURE`,
      notes,
    };

    setLoans((prev) => [fallbackLoan, ...prev]);
    setBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) } : b))
    );
    addToast(`Emprunt enregistré avec succès pour ${student.fullName} !`);
    return { success: true };
  };

  const returnLoanWithQR = async (qrData: string) => {
    const result = await api.returnLoanViaQR(qrData);

    if (result.success && result.loan) {
      setLoans((prev) =>
        prev.map((l) => (l.id === result.loan!.id ? { ...l, status: 'retourne', returnDate: currentDateStr } : l))
      );
      if (result.book) {
        setBooks((prev) =>
          prev.map((b) => (b.id === result.book!.id ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) } : b))
        );
      }
      addToast(result.message || 'Restitution validée avec succès via QR Code !');
      return { success: true, message: result.message };
    }

    const targetLoan = loans.find(
      (l) =>
        l.qrToken === qrData ||
        l.loanNumber === qrData ||
        l.id === qrData ||
        (l.bookId === qrData && l.status !== 'retourne')
    );

    if (targetLoan && targetLoan.status !== 'retourne') {
      const book = getBookById(targetLoan.bookId);
      setLoans((prev) =>
        prev.map((l) => (l.id === targetLoan.id ? { ...l, status: 'retourne', returnDate: currentDateStr } : l))
      );
      if (book) {
        setBooks((prev) =>
          prev.map((b) => (b.id === book.id ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) } : b))
        );
      }
      addToast(`Restitution validée via QR Code pour "${book?.title}" !`);
      return { success: true, message: `Ouvrage "${book?.title}" restitué.` };
    }

    addToast(result.error || 'Code QR non reconnu ou prêt déjà restitué.', 'error');
    return { success: false, error: result.error || 'Code QR invalide.' };
  };

  const createReservation = async (bookId: string, studentId: string, notes?: string) => {
    const result = await api.createReservation(bookId, studentId, notes);
    if (result.success && result.reservation) {
      setReservations((prev) => [result.reservation!, ...prev]);
      setBooks((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) } : b))
      );
      addToast(`Réservation enregistrée avec succès ! Réf: ${result.reservation.reservationNumber}`);
      return { success: true, reservation: result.reservation };
    }
    const err = result.error || 'Erreur lors de la réservation.';
    addToast(err, 'error');
    return { success: false, error: err };
  };

  const updateReservationStatus = async (
    id: string,
    status: ReservationStatus,
    pickupDeadline?: string,
    notes?: string
  ) => {
    const result = await api.updateReservationStatus(id, status, pickupDeadline, notes);
    if (result.success && result.reservation) {
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? result.reservation! : r))
      );
      if (status === 'annulee') {
        const res = reservations.find((r) => r.id === id);
        if (res) {
          setBooks((prev) =>
            prev.map((b) => (b.id === res.bookId ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) } : b))
          );
        }
      }
      addToast(`Réservation mise à jour : Statut ${status.toUpperCase()}`);
      return { success: true };
    }
    const err = result.error || 'Erreur lors de la mise à jour.';
    addToast(err, 'error');
    return { success: false, error: err };
  };

  const convertReservationToLoan = async (id: string) => {
    const result = await api.convertReservationToLoan(id);
    if (result.success && result.loan && result.reservation) {
      setLoans((prev) => [result.loan!, ...prev]);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? result.reservation! : r))
      );
      addToast(result.message || 'Réservation convertie en emprunt actif au guichet !');
      return { success: true, loan: result.loan, message: result.message };
    }
    const err = result.error || 'Erreur lors de la conversion.';
    addToast(err, 'error');
    return { success: false, error: err };
  };

  const cancelReservation = async (id: string) => {
    const target = reservations.find((r) => r.id === id);
    const result = await api.cancelReservation(id);
    if (result.success) {
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'annulee' as ReservationStatus } : r))
      );
      if (target) {
        setBooks((prev) =>
          prev.map((b) => (b.id === target.bookId ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) } : b))
        );
      }
      addToast('Réservation annulée avec succès.');
      return { success: true };
    }
    const err = result.error || 'Erreur lors de l\'annulation.';
    addToast(err, 'error');
    return { success: false, error: err };
  };

  const getStudentReservations = (studentId: string) =>
    reservations.filter((r) => r.studentId === studentId);

  const value = useMemo(
    () => ({
      session,
      loginWithGooglePopup,
      loginWithGoogleEmail,
      loginAsResponsable,
      logout,
      studentsEST,
      allTestStudents,
      books,
      availableBooks,
      loans,
      reservations,
      automatedEmails,
      settings,
      toasts,
      currentDateStr,
      addToast,
      removeToast,
      createLoan,
      returnLoanWithQR,
      createReservation,
      updateReservationStatus,
      convertReservationToLoan,
      cancelReservation,
      refreshData,
      triggerAutomatedCheck,
      simulateLoanDueDate,
      getBookById,
      getStudentById,
      getStudentActiveLoans,
      getStudentReservations,
      getOverdueDays,
      getOverdueSeverity,
      getOverdueEmailData,
    }),
    [
      session,
      studentsEST,
      allTestStudents,
      books,
      availableBooks,
      loans,
      reservations,
      automatedEmails,
      settings,
      toasts,
      currentDateStr,
    ]
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

export const useLibrary = (): LibraryContextType => {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
};
