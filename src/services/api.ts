import { StudentEST, Book, Loan, AutomatedEmailRecord, BookReservation, ReservationStatus, LibrarianUser } from '../types';
import rawBooksCatalog from '../data/booksCatalog.json';
import rawStudentsDirectory from '../data/studentsDirectory.json';
import { getBookCoverUrl } from '../utils/bookCovers';

export const API_BASE = '';

export async function authenticateWithGoogle(
  email: string,
  displayName?: string,
  photoUrl?: string
): Promise<{
  allowed: boolean;
  role?: 'student';
  student?: StudentEST;
  reason?: string;
  message?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, displayName, photoUrl }),
    });
    return await res.json();
  } catch (err) {
    console.warn('API /api/auth/google offline, using internal validation', err);
    const normalized = email.trim().toLowerCase();

    // RÈGLE 1 : Doit obligatoirement être une adresse académique @usmba.ac.ma
    if (!normalized.endsWith('@usmba.ac.ma')) {
      return {
        allowed: false,
        reason: `Compte personnel refusé (${normalized}) : Vous devez impérativement vous connecter avec votre adresse académique Google de l'université (@usmba.ac.ma). Les comptes @gmail.com personnels ne sont pas autorisés.`,
      };
    }

    const student = (rawStudentsDirectory as any[]).find(
      (s) => s.email.toLowerCase() === normalized
    );

    if (!student) {
      return {
        allowed: false,
        reason: `Étudiant introuvable : L'adresse ${normalized} n'est pas répertoriée dans la base académique des étudiants de l'EST Fès.`,
      };
    }

    if (student.school !== 'EST') {
      return {
        allowed: false,
        reason: `Accès refusé : Ce portail de bibliothèque est strictement réservé aux étudiants de l'École Supérieure de Technologie (EST Fès). Votre compte académique est enregistré auprès de : ${student.schoolName} (${student.school}).`,
      };
    }

    return {
      allowed: true,
      role: 'student',
      student: {
        ...student,
        fullName: displayName || student.fullName,
        avatarUrl: photoUrl || student.avatarUrl,
      },
    };
  }
}

export async function fetchESTStudents(): Promise<StudentEST[]> {
  try {
    const res = await fetch(`${API_BASE}/api/students/est`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Error fetching EST students:', e);
  }
  return (rawStudentsDirectory as StudentEST[]).filter((s) => s.school === 'EST');
}

export async function fetchAllStudents(): Promise<StudentEST[]> {
  try {
    const res = await fetch(`${API_BASE}/api/students/all`);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Error fetching all students:', e);
  }
  return rawStudentsDirectory as StudentEST[];
}

export async function fetchBooks(): Promise<Book[]> {
  try {
    const res = await fetch(`${API_BASE}/api/books`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch (e) {
    console.warn('Error fetching books from API:', e);
  }

  // Fallback direct sur le fichier catalogue fourni par l'utilisateur
  return (rawBooksCatalog as any[]).map((b) => ({
    id: String(b.id),
    catalogId: b.id,
    title: b.titre,
    author: b.auteur,
    isbn: b.isbn,
    category: b.categorie,
    shelfLocation: `Rayon ${b.categorie?.slice(0, 4)?.toUpperCase() || 'GEN'}-${String(b.id).padStart(2, '0')}`,
    publishedYear: b.annee,
    totalCopies: 4,
    availableCopies: 3,
    description: b.description,
    sommaire: b.sommaire || [],
    niveau: b.niveau || 'Standard',
    publisher: 'Collectif pédagogique & universitaire',
    coverImage: getBookCoverUrl({ title: b.titre, category: b.categorie, id: b.id }),
  }));
}

export async function fetchLoans(studentId?: string): Promise<Loan[]> {
  try {
    const url = studentId ? `${API_BASE}/api/loans?studentId=${studentId}` : `${API_BASE}/api/loans`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Error fetching loans:', e);
  }
  return [];
}

export async function returnLoanViaQR(qrCodeData: string): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  loan?: Loan;
  book?: Book;
  student?: StudentEST;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/loans/return-qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ qrCodeData }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: 'Erreur réseau lors de la validation du code QR.' };
  }
}

export async function fetchAutomatedEmails(studentId?: string): Promise<AutomatedEmailRecord[]> {
  try {
    const url = studentId
      ? `${API_BASE}/api/automated-emails?studentId=${studentId}`
      : `${API_BASE}/api/automated-emails`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Erreur chargement emails automatiques:', e);
  }
  return [];
}

export async function checkAutomatedEmails(): Promise<{
  success: boolean;
  totalEmails: number;
  dispatchedCount: number;
  newEmails: AutomatedEmailRecord[];
}> {
  try {
    const res = await fetch(`${API_BASE}/api/automated-emails/check`, { method: 'POST' });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Erreur audit automatique:', e);
  }
  return { success: false, totalEmails: 0, dispatchedCount: 0, newEmails: [] };
}

export async function simulateLoanDueDate(
  loanId: string,
  daysOffset?: number,
  resetToNormal?: boolean
): Promise<{
  success: boolean;
  loan?: Loan;
  dispatchedCount: number;
  newEmails: AutomatedEmailRecord[];
  allEmailsForStudent: AutomatedEmailRecord[];
}> {
  try {
    const res = await fetch(`${API_BASE}/api/loans/simulate-due-date`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loanId, daysOffset, resetToNormal }),
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Erreur simulation date échéance:', e);
  }
  return { success: false, dispatchedCount: 0, newEmails: [], allEmailsForStudent: [] };
}

// -------------------------------------------------------------
// RESPONSABLE AUTHENTICATION API
// -------------------------------------------------------------
export async function authenticateResponsable(
  email?: string,
  password?: string
): Promise<{
  allowed: boolean;
  role?: 'responsable';
  librarian?: LibrarianUser;
  reason?: string;
  message?: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/responsable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return await res.json();
  } catch (err) {
    console.warn('Fallback offline responsable auth:', err);
    return {
      allowed: true,
      role: 'responsable',
      librarian: {
        id: 'lib-01',
        fullName: 'Mme Fatima Zahra Alami',
        email: 'responsable.bu@usmba.ac.ma',
        roleTitle: 'Conservateur en Chef & Responsable BU EST Fès',
        school: 'EST',
      },
      message: 'Bienvenue dans l\'Espace Responsable Bibliothèque de l\'EST Fès',
    };
  }
}

// -------------------------------------------------------------
// RESERVATIONS API
// -------------------------------------------------------------
export async function fetchReservations(studentId?: string): Promise<BookReservation[]> {
  try {
    const url = studentId
      ? `${API_BASE}/api/reservations?studentId=${studentId}`
      : `${API_BASE}/api/reservations`;
    const res = await fetch(url);
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Erreur fetchReservations:', e);
  }
  return [];
}

export async function createReservation(
  bookId: string,
  studentId: string,
  notes?: string
): Promise<{ success: boolean; reservation?: BookReservation; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookId, studentId, notes }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Erreur lors de la réservation.' };
    }
    return { success: true, reservation: data };
  } catch (e: any) {
    return { success: false, error: 'Erreur réseau lors de la réservation.' };
  }
}

export async function updateReservationStatus(
  id: string,
  status: ReservationStatus,
  pickupDeadline?: string,
  notes?: string
): Promise<{ success: boolean; reservation?: BookReservation; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/reservations/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, pickupDeadline, notes }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Erreur mise à jour statut.' };
    }
    return { success: true, reservation: data };
  } catch (e: any) {
    return { success: false, error: 'Erreur réseau mise à jour réservation.' };
  }
}

export async function convertReservationToLoan(
  id: string
): Promise<{ success: boolean; loan?: Loan; reservation?: BookReservation; message?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/reservations/${id}/convert-to-loan`, {
      method: 'POST',
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Erreur conversion réservation.' };
    }
    return data;
  } catch (e: any) {
    return { success: false, error: 'Erreur réseau conversion réservation.' };
  }
}

export async function cancelReservation(
  id: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/reservations/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || 'Erreur annulation réservation.' };
    }
    return data;
  } catch (e: any) {
    return { success: false, error: 'Erreur réseau annulation réservation.' };
  }
}
