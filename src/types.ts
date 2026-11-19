export type SchoolEST = 'EST' | 'FST' | 'ENCG' | 'ENSA';

export interface StudentEST {
  id: string;
  cne: string;
  fullName: string;
  email: string;
  school: SchoolEST;
  schoolName: string;
  department: string;
  level: string;
  phone: string;
  status: 'Actif' | 'Suspendu';
  avatarUrl?: string;
}

export interface BookChapter {
  chapitre: number;
  titre: string;
}

export interface Book {
  id: string;
  catalogId?: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  shelfLocation: string;
  publishedYear: number;
  totalCopies: number;
  availableCopies: number;
  description: string;
  sommaire?: BookChapter[];
  niveau?: string;
  publisher?: string;
  coverImage?: string;
}

export type LoanStatus = 'en_cours' | 'en_retard' | 'retourne';
export type BookCondition = 'Comme neuf' | 'Très bon' | 'Bon' | 'Dégradé' | 'Perdu';

export type OverdueSeverity = 'mild' | 'moderate' | 'critical';

export interface Loan {
  id: string;
  loanNumber: string;
  bookId: string;
  studentId: string;
  borrowDate: string; // YYYY-MM-DD
  dueDate: string;    // YYYY-MM-DD
  returnDate?: string; // YYYY-MM-DD
  status: LoanStatus;
  qrToken: string;
  extensionsCount?: number;
  conditionAtReturn?: BookCondition;
  notes?: string;
  lastRemindedAt?: string;
}

export interface LibrarySettings {
  libraryName: string;
  institution: string;
  defaultLoanDurationDays: number;
  extensionDays: number;
  maxExtensions: number;
  defaultMaxLoans: number;
  emailContact: string;
  phoneContact: string;
  address: string;
}

export type AutomatedGravity = 'pre_alerte' | 'moderee' | 'elevee' | 'critique';

export interface AutomatedEmailRecord {
  id: string;
  loanId: string;
  loanNumber: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  cne: string;
  bookTitle: string;
  dueDate: string;
  overdueDays: number;
  gravity: AutomatedGravity;
  gravityLabel: string;
  gravityColor: string;
  subject: string;
  body: string;
  sentAt: string;
  status: 'SENT_AUTOMATICALLY';
  gmailDirectLink: string;
  triggerReason: string;
}

export type ReservationStatus = 'en_attente' | 'validee' | 'prete' | 'annulee' | 'terminee';

export interface BookReservation {
  id: string;
  reservationNumber: string;
  bookId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentCne: string;
  studentDepartment: string;
  reservedAt: string; // ISO date string
  status: ReservationStatus;
  pickupDeadline?: string;
  notes?: string;
}

export interface LibrarianUser {
  id: string;
  fullName: string;
  email: string;
  roleTitle: string;
  school: 'EST';
}

export interface UserSession {
  isAuthenticated: boolean;
  role: 'student' | 'responsable' | null;
  student?: StudentEST;
  librarian?: LibrarianUser;
}
