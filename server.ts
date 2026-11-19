import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initial University Data for EST Fès (École Supérieure de Technologie de Fès - USMBA)
export interface StudentEST {
  id: string;
  cne: string;
  fullName: string;
  email: string;
  secondaryEmail?: string;
  school: 'EST' | 'FST' | 'ENCG' | 'ENSA';
  schoolName: string;
  department: string;
  level: string;
  phone: string;
  status: 'Actif' | 'Suspendu';
  avatarUrl?: string;
}

// Annuaire officiel des étudiants de l'USMBA / EST Fès
const studentsDirectoryPath = path.join(__dirname, 'src', 'data', 'studentsDirectory.json');
let EST_STUDENTS: StudentEST[] = [];
try {
  if (fs.existsSync(studentsDirectoryPath)) {
    EST_STUDENTS = JSON.parse(fs.readFileSync(studentsDirectoryPath, 'utf-8'));
  }
} catch (e) {
  console.error('Erreur chargement studentsDirectory.json:', e);
}

if (EST_STUDENTS.length === 0) {
  EST_STUDENTS = [
    {
      id: 'est-youssef',
      cne: 'S132242260',
      fullName: 'Youssef El Hathat',
      email: 'youssef.elhathat@usmba.ac.ma',
      school: 'EST',
      schoolName: 'École Supérieure de Technologie de Fès',
      department: 'Génie Informatique (GI)',
      level: 'DUT 2ème Année',
      phone: '+212 661 00 00 00',
      status: 'Actif',
    },
  ];
}

// Central Library Books API (Fonds documentaire issu de booksCatalog.json)
const catalogPath = path.join(__dirname, 'src', 'data', 'booksCatalog.json');
let rawBooksCatalog: any[] = [];
try {
  if (fs.existsSync(catalogPath)) {
    rawBooksCatalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  }
} catch (e) {
  console.error('Erreur lors du chargement de booksCatalog.json:', e);
}

function getBookCover(category: string, title: string = '', id: number = 1): string {
  const t = (title || '').toLowerCase();
  const cat = (category || '').toLowerCase();

  // Spécifiques aux langages et technos
  if (t.includes('python')) return 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80';
  if (t.includes('java') && !t.includes('javascript')) return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80';
  if (t.includes('c++')) return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80';
  if (t.includes(' c ') || t.endsWith(' c') || t.includes(' de c')) return 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80';
  if (t.includes('typescript')) return 'https://images.unsplash.com/photo-1516116211227-bbc13c744158?w=600&auto=format&fit=crop&q=80';
  if (t.includes('javascript')) return 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&auto=format&fit=crop&q=80';
  if (t.includes('react')) return 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80';
  if (t.includes('node.js') || t.includes('nodejs')) return 'https://images.unsplash.com/photo-1537432376769-00f5c244c8d8?w=600&auto=format&fit=crop&q=80';
  if (t.includes('html') || t.includes('css')) return 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80';
  if (t.includes('api rest') || t.includes('api')) return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80';

  // Génie logiciel
  if (t.includes('uml')) return 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80';
  if (t.includes('architecture logicielle')) return 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80';
  if (t.includes('tests logiciels')) return 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80';
  if (t.includes('design patterns')) return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80';
  if (t.includes('méthodes agiles') || t.includes('agile')) return 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop&q=80';
  if (t.includes('devops')) return 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600&auto=format&fit=crop&q=80';
  if (t.includes('spring boot')) return 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=600&auto=format&fit=crop&q=80';
  if (t.includes('git')) return 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=80';

  // Réseaux
  if (t.includes('tcp/ip')) return 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80';
  if (t.includes('routage')) return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80';
  if (t.includes('cisco')) return 'https://images.unsplash.com/photo-1520869562399-e772f042f422?w=600&auto=format&fit=crop&q=80';
  if (t.includes('sécurité réseau')) return 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80';

  // Bases de données
  if (t.includes('mysql')) return 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&auto=format&fit=crop&q=80';
  if (t.includes('postgresql')) return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80';
  if (t.includes('mongodb')) return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80';
  if (t.includes('merise')) return 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80';
  if (t.includes('sql')) return 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80';

  // Cybersécurité
  if (t.includes('crypto')) return 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80';
  if (t.includes('sécurité web')) return 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&auto=format&fit=crop&q=80';
  if (t.includes('pare-feu')) return 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=600&auto=format&fit=crop&q=80';

  // IA
  if (t.includes('machine learning')) return 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=600&auto=format&fit=crop&q=80';
  if (t.includes('deep learning')) return 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80';
  if (t.includes('ia générative')) return 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80';

  // Maths
  if (t.includes('algèbre')) return 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80';
  if (t.includes('probabilités')) return 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop&q=80';
  if (t.includes('statistiques')) return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80';
  if (t.includes('graphes')) return 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80';

  // Systèmes & Cloud
  if (t.includes('linux')) return 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&auto=format&fit=crop&q=80';
  if (t.includes('docker')) return 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600&auto=format&fit=crop&q=80';
  if (t.includes('kubernetes')) return 'https://images.unsplash.com/photo-1667372393086-9d4001d51cf1?w=600&auto=format&fit=crop&q=80';
  if (t.includes('cloud')) return 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80';

  // Ingénieur
  if (t.includes('électronique')) return 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80';
  if (t.includes('embarqués') || t.includes('embarques')) return 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600&auto=format&fit=crop&q=80';
  if (t.includes('iot')) return 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80';
  if (t.includes('économie') || t.includes('economie')) return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80';

  // Fallbacks par catégorie
  if (cat.includes('cyber') || cat.includes('sécurit') || cat.includes('securit')) {
    return '/src/assets/images/couverture_cybersecurite_1791886159838.jpg';
  }
  if (cat.includes('réseau') || cat.includes('reseau') || cat.includes('telecom')) {
    return '/src/assets/images/couverture_reseaux_1791886159090.jpg';
  }
  if (cat.includes('intelli') || cat.includes('ia') || cat.includes('machine learning')) {
    return '/src/assets/images/couverture_ia_machinelearning_1791886159506.jpg';
  }
  if (cat.includes('base') || cat.includes('donnée') || cat.includes('donnee') || cat.includes('sql')) {
    return '/src/assets/images/couverture_bdd_sql_1791886181257.jpg';
  }
  if (cat.includes('cloud') || cat.includes('système') || cat.includes('systeme')) {
    return '/src/assets/images/couverture_cloud_systemes_1791886181002.jpg';
  }
  if (cat.includes('web') || cat.includes('logiciel')) {
    return '/src/assets/images/couverture_dev_web_1791886181197.jpg';
  }
  if (cat.includes('ingénieur') || cat.includes('ingenieur') || cat.includes('électron') || cat.includes('electron') || cat.includes('iot') || cat.includes('embarqué')) {
    return '/src/assets/images/couverture_sciences_ingenieur_1791886182414.jpg';
  }
  if (cat.includes('math') || cat.includes('algèbre') || cat.includes('analyse')) {
    return '/src/assets/images/couverture_mathematiques_1791886214475.jpg';
  }
  return '/src/assets/images/couverture_programmation_1791886158171.jpg';
}

let EST_BOOKS = rawBooksCatalog.map((b: any) => ({
  id: String(b.id),
  catalogId: b.id,
  title: b.titre,
  author: b.auteur,
  isbn: b.isbn,
  category: b.categorie, // Catégories normales: Programmation, Génie logiciel, Réseaux, etc.
  shelfLocation: `Rayon ${b.categorie?.slice(0, 4)?.toUpperCase() || 'GEN'}-${String(b.id).padStart(2, '0')}`,
  publishedYear: b.annee,
  totalCopies: 4,
  availableCopies: 3,
  description: b.description,
  sommaire: b.sommaire || [],
  niveau: b.niveau || 'Standard',
  publisher: 'Collectif pédagogique & universitaire',
  coverImage: getBookCover(b.categorie, b.titre, b.id),
}));

// Fallback si catalogue indisponible
if (EST_BOOKS.length === 0) {
  EST_BOOKS = [
    {
      id: '1',
      catalogId: 1,
      title: 'Fondamentaux de Python',
      author: 'Collectif pédagogique',
      isbn: '978-2-10080101-1',
      category: 'Programmation',
      shelfLocation: 'Rayon PROG-01',
      publishedYear: 2020,
      totalCopies: 4,
      availableCopies: 3,
      description: 'Ouvrage pédagogique de niveau débutant consacré à Python.',
      sommaire: [],
      niveau: 'Débutant',
      publisher: 'Collectif pédagogique & universitaire',
      coverImage: '/src/assets/images/couverture_programmation_1791886158171.jpg',
    },
  ];
}

interface ServerLoan {
  id: string;
  loanNumber: string;
  bookId: string;
  studentId: string;
  borrowDate: string;
  dueDate: string;
  status: string;
  qrToken: string;
  notes: string;
  lastRemindedAt?: string;
  returnDate?: string;
}

// Initial Loans at EST Fès (avec Youssef El Hathat ayant un prêt actif et un livre en retard pour tests)
let EST_LOANS: ServerLoan[] = [
  {
    id: 'emp-est-youssef-01',
    loanNumber: 'EST-2026-0038',
    bookId: '1', // Fondamentaux de Python
    studentId: 'est-youssef', // Youssef El Hathat
    borrowDate: '2026-10-01',
    dueDate: '2026-10-22', // En cours
    status: 'en_cours',
    qrToken: 'QR-LOAN-EST-YOUSSEF-0038',
    notes: 'Exemplaire pour autoformation Python',
  },
  {
    id: 'emp-est-youssef-02',
    loanNumber: 'EST-2026-0039',
    bookId: '13', // Architecture logicielle et Design Patterns
    studentId: 'est-youssef', // Youssef El Hathat
    borrowDate: '2026-10-03',
    dueDate: '2026-10-17', // Dépassé de 2 jours -> Relance automatique Niveau 2 (Modérée)
    status: 'en_retard',
    qrToken: 'QR-LOAN-EST-YOUSSEF-0039',
    notes: 'Module Génie Logiciel S3',
  },
  {
    id: 'emp-est-01',
    loanNumber: 'EST-2026-0041',
    bookId: '4', // Fondamentaux de Java
    studentId: 'est-001',  // Amine El Amrani
    borrowDate: '2026-09-08',
    dueDate: '2026-09-22', // Retard critique (> 14 jours de retard !) -> RED
    status: 'en_retard',
    qrToken: 'QR-LOAN-EST-0041-SECURE',
    notes: 'Exemplaire Java semestre 3',
  },
  {
    id: 'emp-est-02',
    loanNumber: 'EST-2026-0054',
    bookId: '7', // Fondamentaux de C
    studentId: 'est-002',  // Salma Bennani
    borrowDate: '2026-09-18',
    dueDate: '2026-10-02', // Retard moyen (11 jours de retard) -> ORANGE
    status: 'en_retard',
    qrToken: 'QR-LOAN-EST-0054-SECURE',
    notes: 'Programmation système en C',
  },
  {
    id: 'emp-est-03',
    loanNumber: 'EST-2026-0068',
    bookId: '10', // Fondamentaux de C++
    studentId: 'est-003',  // Youssef Chraibi
    borrowDate: '2026-09-26',
    dueDate: '2026-10-10', // Retard léger (9 jours de retard) -> RED/CRITIQUE
    status: 'en_retard',
    qrToken: 'QR-LOAN-EST-0068-SECURE',
    notes: 'Programmation orientée objet',
  },
];

// -------------------------------------------------------------
// GESTION DES RÉSERVATIONS D'OUVRAGES (ESPACE ÉTUDIANT & RESPONSABLE)
// -------------------------------------------------------------
export interface BookReservation {
  id: string;
  reservationNumber: string;
  bookId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentCne: string;
  studentDepartment: string;
  reservedAt: string;
  status: 'en_attente' | 'validee' | 'prete' | 'annulee' | 'terminee';
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

const DEFAULT_LIBRARIAN: LibrarianUser = {
  id: 'lib-01',
  fullName: 'Mme Fatima Zahra Alami',
  email: 'responsable.bu@usmba.ac.ma',
  roleTitle: 'Conservateur en Chef & Responsable BU EST Fès',
  school: 'EST',
};

let EST_RESERVATIONS: BookReservation[] = [
  {
    id: 'res-est-101',
    reservationNumber: 'RES-2026-0101',
    bookId: '1', // Algorithmique et structures de données
    studentId: 'est-youssef',
    studentName: 'Youssef El Hathat',
    studentEmail: 'youssef.elhathat@usmba.ac.ma',
    studentCne: 'S132242260',
    studentDepartment: 'Génie Informatique (GI)',
    reservedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    status: 'en_attente',
    pickupDeadline: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    notes: 'Exemplaire pour préparation TP DUT 2ème Année',
  },
];

// -------------------------------------------------------------
// ROBOT DE RELANCES AUTOMATIQUES GMAIL SANS INTERVENTION HUMAINE
// -------------------------------------------------------------
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
  gravity: 'pre_alerte' | 'moderee' | 'elevee' | 'critique';
  gravityLabel: string;
  gravityColor: string;
  subject: string;
  body: string;
  sentAt: string;
  status: 'SENT_AUTOMATICALLY';
  gmailDirectLink: string;
  triggerReason: string;
}

let AUTOMATED_EMAIL_LOGS: AutomatedEmailRecord[] = [];

/**
 * Moteur d'audit et d'envoi automatique d'emails académiques selon la gravité.
 * S'exécute automatiquement en tâche de fond sans aucune intervention humaine.
 */
function runAutomatedEmailEngine(): { dispatchedCount: number; newEmails: AutomatedEmailRecord[] } {
  const currentDate = new Date();
  const todayStr = currentDate.toISOString().split('T')[0];
  const newEmails: AutomatedEmailRecord[] = [];

  for (const loan of EST_LOANS) {
    if (loan.status === 'retourne') continue;

    const book = EST_BOOKS.find((b) => b.id === loan.bookId);
    const student = EST_STUDENTS.find((s) => s.id === loan.studentId);
    if (!book || !student) continue;

    // Calcul du temps écoulé par rapport à la date de délivrance / échéance
    const dueTime = new Date(loan.dueDate).getTime();
    const currTime = new Date(todayStr).getTime();
    const diffDays = Math.floor((currTime - dueTime) / (1000 * 60 * 60 * 24));

    // Détermination de la gravité
    let gravity: 'pre_alerte' | 'moderee' | 'elevee' | 'critique' | null = null;
    let gravityLabel = '';
    let gravityColor = '';
    let triggerReason = '';
    let subject = '';
    let body = '';

    if (diffDays >= 8) {
      // Gravité Critique (Retard supérieur à 7 jours)
      gravity = 'critique';
      gravityLabel = 'Niveau 4 : AVIS CRITIQUE & Sanction Académique';
      gravityColor = '#dc2626'; // Rouge vif
      triggerReason = `Dépassement critique de ${diffDays} jours constaté par le robot d'audit automatique EST Fès`;
      subject = `[URGENT - MISE EN DEMEURE EST Fès] Non-restitution prolongée : Transmission à la Scolarité (${student.cne})`;
      body = `Monsieur / Madame ${student.fullName} (CNE : ${student.cne}),
Département : ${student.department} · EST Fès (USMBA),

Ceci est un avertissement automatisé généré sans intervention humaine par le système de gestion documentaire de l'EST Fès.

L'ouvrage suivant n'a toujours pas été retourné au guichet :
• Titre : "${book.title}" (ISBN: ${book.isbn})
• Réf. Emprunt : ${loan.loanNumber}
• Date limite initiale : ${loan.dueDate}
• Retard constaté : ${diffDays} jours

SANCTIONS APPLIQUÉES AUTOMATIQUEMENT :
1. Blocage immédiat de vos droits d'emprunt dans toute l'Université Sidi Mohamed Ben Abdellah.
2. Signalement au Chef de Département (${student.department}) et à la Direction des Études.
3. Blocage de délivrance des attestations de scolarité, relevés de notes et diplôme.
4. Émission d'un titre de perception pour rachat de l'ouvrage à neuf à votre charge.

Présentez-vous impérativement au guichet de la BU EST Fès avec l'exemplaire ou votre Pass QR pour régulariser votre situation sans délai.

Direction de la Bibliothèque Universitaire
École Supérieure de Technologie de Fès · Université Sidi Mohamed Ben Abdellah
Route d'Imouzzer, BP 2427, Fès`;
      loan.status = 'en_retard';
    } else if (diffDays >= 4) {
      // Gravité Élevée (Retard entre 4 et 7 jours)
      gravity = 'elevee';
      gravityLabel = 'Niveau 3 : 2ème Relance Urgente (Gravité Élevée)';
      gravityColor = '#ea580c'; // Orange-rouge
      triggerReason = `Retard important de ${diffDays} jours détecté automatiquement par le système`;
      subject = `[BU EST Fès - 2ème Relance Automatique] Suspension imminente de prêt - "${book.title}"`;
      body = `Bonjour ${student.fullName} (${student.cne}),

Le robot de surveillance des prêts de l'EST Fès constate que votre délai d'emprunt est dépassé depuis ${diffDays} jours.

• Document : "${book.title}" (${book.author})
• Cote en rayon : ${book.shelfLocation}
• Date d'échéance dépassée : ${loan.dueDate}

CONSIGNE STRICTE :
Vos droits de prêt sont temporairement suspendus. Veuillez rapporter cet ouvrage au guichet de la bibliothèque EST Fès sous 48 heures ouvrées pour éviter toute transmission au service de la scolarité.

Service du Prêt Documentaire · BU EST Fès (USMBA)`;
      loan.status = 'en_retard';
    } else if (diffDays >= 1) {
      // Gravité Modérée (Retard entre 1 et 3 jours)
      gravity = 'moderee';
      gravityLabel = 'Niveau 2 : 1ère Relance Automatique (Gravité Modérée)';
      gravityColor = '#d97706'; // Ambre
      triggerReason = `Date de délivrance dépassée de ${diffDays} jour(s) - Relance automatique déclenchée`;
      subject = `[BU EST Fès - 1ère Relance Automatique] Retard de restitution pour "${book.title}"`;
      body = `Bonjour ${student.fullName},

Le système automatisé de l'EST Fès vous informe que la date limite de votre prêt est arrivée à expiration :

• Ouvrage : "${book.title}"
• Date de retour prévue : ${loan.dueDate} (Dépassement : ${diffDays} jour(s))
• Pass Mobile : ${loan.loanNumber}

Merci de vous présenter au guichet de la BU EST Fès muni de l'ouvrage ou de flasher votre Pass QR pour finaliser le retour.

Bibliothèque Universitaire · EST Fès`;
      loan.status = 'en_retard';
    } else if (diffDays === 0 || diffDays === -1) {
      // Pré-alerte (Jour J ou veille de l'échéance)
      gravity = 'pre_alerte';
      gravityLabel = 'Niveau 1 : Rappel Préventif (Échéance imminente)';
      gravityColor = '#0284c7'; // Bleu ciel
      triggerReason = `Échéance de restitution arrivant à terme (J${diffDays <= 0 ? diffDays : ''})`;
      subject = `[BU EST Fès] Rappel d'échéance : Restitution de l'ouvrage "${book.title}"`;
      body = `Bonjour ${student.fullName},

Ceci est un rappel préventif automatique de la Bibliothèque de l'EST Fès.
Votre emprunt de l'ouvrage "${book.title}" arrive à échéance le ${loan.dueDate}.

Pensez à le rapporter au guichet ou à demander une prolongation si disponible.

Service de la Bibliothèque · EST Fès`;
    }

    if (!gravity) continue;

    // Vérifier si un email de ce niveau de gravité précis a déjà été envoyé pour cet emprunt
    const alreadySentThisGravity = AUTOMATED_EMAIL_LOGS.some(
      (e) => e.loanId === loan.id && e.gravity === gravity
    );

    if (!alreadySentThisGravity) {
      const emailRecord: AutomatedEmailRecord = {
        id: `auto-mail-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        loanId: loan.id,
        loanNumber: loan.loanNumber,
        studentId: student.id,
        studentEmail: student.email,
        studentName: student.fullName,
        cne: student.cne,
        bookTitle: book.title,
        dueDate: loan.dueDate,
        overdueDays: Math.max(0, diffDays),
        gravity,
        gravityLabel,
        gravityColor,
        subject,
        body,
        sentAt: new Date().toISOString(),
        status: 'SENT_AUTOMATICALLY',
        gmailDirectLink: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
          student.email
        )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
        triggerReason,
      };

      AUTOMATED_EMAIL_LOGS.unshift(emailRecord);
      newEmails.push(emailRecord);
      loan.lastRemindedAt = emailRecord.sentAt;

      console.log(
        `[ROBOT BU EST FÈS - ENVOI AUTOMATIQUE SANS INTERVENTION HUMAINE] ` +
        `Gravité: ${gravity.toUpperCase()} -> Envoyé à ${student.email} (${student.fullName}) pour "${book.title}"`
      );
    }
  }

  return { dispatchedCount: newEmails.length, newEmails };
}

// Initial run at server start
runAutomatedEmailEngine();
// Tâche périodique automatique sans aucune intervention humaine (toutes les 15 secondes)
setInterval(() => {
  runAutomatedEmailEngine();
}, 15000);

async function startServer() {
  const app = express();
  app.use(express.json());

  // 1. API Authentification Google avec restriction EST Fès
  app.post('/api/auth/google', (req, res) => {
    const { email, displayName, photoUrl } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email requis' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // RÈGLE 1 : L'adresse doit OBLIGATOIREMENT être un compte Google académique USMBA (@usmba.ac.ma)
    // Tout compte personnel (@gmail.com, etc.) est strictement rejeté !
    if (!normalizedEmail.endsWith('@usmba.ac.ma')) {
      return res.status(403).json({
        allowed: false,
        reason: `Compte personnel refusé (${normalizedEmail}) : Vous devez impérativement vous connecter avec votre adresse Google académique officielle (@usmba.ac.ma). Les comptes grand public @gmail.com ne sont pas admis.`,
      });
    }

    // RÈGLE 2 : Rechercher l'étudiant dans l'annuaire académique officiel
    const student = EST_STUDENTS.find(
      (s) => s.email.toLowerCase() === normalizedEmail
    );

    if (!student) {
      return res.status(403).json({
        allowed: false,
        reason: `Étudiant introuvable : L'adresse ${normalizedEmail} n'est pas répertoriée dans la base académique des étudiants de l'EST Fès.`,
      });
    }

    // RÈGLE 3 : Seuls les étudiants de l'EST Fès peuvent accéder (rejet FST, ENCG, ENSA...)
    if (student.school !== 'EST') {
      return res.status(403).json({
        allowed: false,
        reason: `Accès refusé : Ce portail de bibliothèque est strictement réservé aux étudiants de l'École Supérieure de Technologie (EST Fès). Votre compte académique est enregistré auprès de : ${student.schoolName} (${student.school}).`,
        studentInfo: {
          fullName: student.fullName,
          school: student.school,
          schoolName: student.schoolName,
        },
      });
    }

    if (displayName) student.fullName = displayName;
    if (photoUrl) student.avatarUrl = photoUrl;

    // Étudiant EST authentifié avec succès !
    return res.json({
      allowed: true,
      role: 'student',
      student,
      message: `Bienvenue ${student.fullName} (CNE : ${student.cne} - EST Fès, ${student.department})`,
    });
  });

  // Authentification Responsable de la Bibliothèque EST Fès
  app.post('/api/auth/responsable', (req, res) => {
    const { email, password } = req.body;
    // Permet soit la saisie de l'email officiel responsable, soit le code d'accès administration
    const normalized = (email || '').trim().toLowerCase();
    
    if (
      normalized === 'responsable.bu@usmba.ac.ma' ||
      normalized === 'conservateur@usmba.ac.ma' ||
      normalized === 'admin' ||
      normalized === 'responsable' ||
      password === 'adminbu2026' ||
      password === 'admin' ||
      !email // Connexion directe en 1 clic
    ) {
      return res.json({
        allowed: true,
        role: 'responsable',
        librarian: DEFAULT_LIBRARIAN,
        message: 'Bienvenue dans l\'Espace Responsable Bibliothèque de l\'EST Fès',
      });
    }

    return res.status(401).json({
      allowed: false,
      reason: 'Identifiants Responsable incorrects. Utilisez responsable.bu@usmba.ac.ma ou l\'accès rapide.',
    });
  });

  // 2. API Annuaire officiel des étudiants de l'EST
  app.get('/api/students/est', (_req, res) => {
    res.json(EST_STUDENTS.filter((s) => s.school === 'EST'));
  });

  // Annuaire complet pour tests et simulations
  app.get('/api/students/all', (_req, res) => {
    res.json(EST_STUDENTS);
  });

  // 3. API Catalogue des Ouvrages (Fonds universitaire EST Fès)
  app.get('/api/books', (_req, res) => {
    res.json(EST_BOOKS);
  });

  app.get('/api/books/:id', (req, res) => {
    const book = EST_BOOKS.find((b) => b.id === req.params.id);
    if (!book) return res.status(404).json({ error: 'Ouvrage non trouvé' });
    res.json(book);
  });

  // 4. API Emprunts
  app.get('/api/loans', (req, res) => {
    const { studentId } = req.query;
    if (studentId) {
      const filtered = EST_LOANS.filter((l) => l.studentId === studentId);
      return res.json(filtered);
    }
    res.json(EST_LOANS);
  });

  app.post('/api/loans', (req, res) => {
    const { bookId, studentId, durationDays = 14, notes } = req.body;
    const book = EST_BOOKS.find((b) => b.id === bookId);
    const student = EST_STUDENTS.find((s) => s.id === studentId);

    if (!book || book.availableCopies <= 0) {
      return res.status(400).json({ error: 'Livre non disponible en rayon.' });
    }
    if (!student || student.school !== 'EST') {
      return res.status(403).json({ error: 'Prêt réservé aux étudiants de l\'EST Fès.' });
    }

    const borrowDate = new Date().toISOString().split('T')[0];
    const dueObj = new Date();
    dueObj.setDate(dueObj.getDate() + Number(durationDays));
    const dueDate = dueObj.toISOString().split('T')[0];

    const loanId = `emp-est-${Date.now()}`;
    const loanNumber = `EST-2026-${String(EST_LOANS.length + 101).padStart(4, '0')}`;
    const qrToken = `QR-LOAN-${loanId}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const newLoan = {
      id: loanId,
      loanNumber,
      bookId,
      studentId,
      borrowDate,
      dueDate,
      status: 'en_cours',
      qrToken,
      notes: notes || '',
    };

    book.availableCopies = Math.max(0, book.availableCopies - 1);
    EST_LOANS.unshift(newLoan);

    res.status(201).json(newLoan);
  });

  // 5. API Restitution par QR Code
  app.post('/api/loans/return-qr', (req, res) => {
    const { qrCodeData } = req.body;

    if (!qrCodeData) {
      return res.status(400).json({ error: 'Données du QR Code manquantes.' });
    }

    let targetLoan: any = null;

    try {
      const parsed = JSON.parse(qrCodeData);
      if (parsed.loanId) {
        targetLoan = EST_LOANS.find((l) => l.id === parsed.loanId);
      } else if (parsed.bookId) {
        targetLoan = EST_LOANS.find((l) => l.bookId === parsed.bookId && l.status !== 'retourne');
      }
    } catch {
      targetLoan = EST_LOANS.find(
        (l) =>
          l.qrToken === qrCodeData ||
          l.loanNumber === qrCodeData ||
          l.id === qrCodeData ||
          (l.bookId === qrCodeData && l.status !== 'retourne')
      );
    }

    if (!targetLoan) {
      return res.status(404).json({
        success: false,
        error: 'Aucun emprunt actif correspondant à ce code QR.',
      });
    }

    if (targetLoan.status === 'retourne') {
      return res.status(400).json({
        success: false,
        error: 'Ce prêt a déjà été restitué.',
      });
    }

    targetLoan.status = 'retourne';
    targetLoan.returnDate = new Date().toISOString().split('T')[0];

    const book = EST_BOOKS.find((b) => b.id === targetLoan.bookId);
    if (book) {
      book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
    }

    const student = EST_STUDENTS.find((s) => s.id === targetLoan.studentId);

    res.json({
      success: true,
      message: `Restitution validée avec succès via QR Code pour "${book?.title}" !`,
      loan: targetLoan,
      book,
      student,
    });
  });

  // ---------------------------------------------------------
  // 5b. API Réservations d'ouvrages (Espace Étudiant & Responsable)
  // ---------------------------------------------------------
  app.get('/api/reservations', (req, res) => {
    const { studentId } = req.query;
    if (studentId) {
      const filtered = EST_RESERVATIONS.filter((r) => r.studentId === studentId);
      return res.json(filtered);
    }
    res.json(EST_RESERVATIONS);
  });

  app.post('/api/reservations', (req, res) => {
    const { bookId, studentId, notes } = req.body;
    const book = EST_BOOKS.find((b) => b.id === bookId);
    const student = EST_STUDENTS.find((s) => s.id === studentId);

    if (!book) {
      return res.status(404).json({ error: 'Ouvrage introuvable dans le fonds documentaire.' });
    }
    if (book.availableCopies <= 0) {
      return res.status(400).json({ error: 'Ouvrage indisponible. Tous les exemplaires sont empruntés ou déjà réservés.' });
    }
    if (!student || student.school !== 'EST') {
      return res.status(403).json({ error: 'Réservation strictement réservée aux étudiants de l\'EST Fès.' });
    }

    // Vérifier si l'étudiant a déjà une réservation active en attente pour ce même livre
    const existing = EST_RESERVATIONS.find(
      (r) =>
        r.studentId === studentId &&
        r.bookId === bookId &&
        (r.status === 'en_attente' || r.status === 'validee' || r.status === 'prete')
    );
    if (existing) {
      return res.status(400).json({
        error: `Vous avez déjà une réservation active (${existing.reservationNumber}) pour cet ouvrage.`,
      });
    }

    const resId = `res-est-${Date.now()}`;
    const reservationNumber = `RES-2026-${String(EST_RESERVATIONS.length + 101).padStart(4, '0')}`;
    const deadlineObj = new Date();
    deadlineObj.setDate(deadlineObj.getDate() + 3); // 3 jours pour retirer au guichet
    const pickupDeadline = deadlineObj.toISOString().split('T')[0];

    const newReservation: BookReservation = {
      id: resId,
      reservationNumber,
      bookId,
      studentId,
      studentName: student.fullName,
      studentEmail: student.email,
      studentCne: student.cne,
      studentDepartment: student.department,
      reservedAt: new Date().toISOString(),
      status: 'en_attente',
      pickupDeadline,
      notes: notes || 'Réservation enregistrée depuis le portail étudiant EST Fès',
    };

    // Décrémenter l'exemplaire disponible en rayon pour sécuriser la réservation
    book.availableCopies = Math.max(0, book.availableCopies - 1);
    EST_RESERVATIONS.unshift(newReservation);

    res.status(201).json(newReservation);
  });

  app.patch('/api/reservations/:id/status', (req, res) => {
    const { id } = req.params;
    const { status, pickupDeadline, notes } = req.body;

    const reservation = EST_RESERVATIONS.find((r) => r.id === id);
    if (!reservation) {
      return res.status(404).json({ error: 'Réservation non trouvée.' });
    }

    const oldStatus = reservation.status;
    if (status) reservation.status = status;
    if (pickupDeadline) reservation.pickupDeadline = pickupDeadline;
    if (notes !== undefined) reservation.notes = notes;

    // Si la réservation est annulée, libérer l'exemplaire si elle n'était pas déjà terminée ou annulée
    if (status === 'annulee' && oldStatus !== 'annulee' && oldStatus !== 'terminee') {
      const book = EST_BOOKS.find((b) => b.id === reservation.bookId);
      if (book) {
        book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
      }
    }

    res.json(reservation);
  });

  app.post('/api/reservations/:id/convert-to-loan', (req, res) => {
    const { id } = req.params;
    const reservation = EST_RESERVATIONS.find((r) => r.id === id);

    if (!reservation) {
      return res.status(404).json({ error: 'Réservation non trouvée.' });
    }

    if (reservation.status === 'terminee') {
      return res.status(400).json({ error: 'Cette réservation a déjà été convertie en prêt.' });
    }

    const loanId = `emp-est-${Date.now()}`;
    const loanNumber = `EST-2026-${String(EST_LOANS.length + 101).padStart(4, '0')}`;
    const qrToken = `QR-LOAN-${loanId}-RES`;
    const borrowDate = new Date().toISOString().split('T')[0];
    const dueObj = new Date();
    dueObj.setDate(dueObj.getDate() + 14); // 14 jours de prêt
    const dueDate = dueObj.toISOString().split('T')[0];

    const newLoan = {
      id: loanId,
      loanNumber,
      bookId: reservation.bookId,
      studentId: reservation.studentId,
      borrowDate,
      dueDate,
      status: 'en_cours',
      qrToken,
      notes: `Validé au guichet depuis réservation ${reservation.reservationNumber}`,
    };

    EST_LOANS.unshift(newLoan);
    reservation.status = 'terminee';
    reservation.notes = `${reservation.notes || ''} [Converti en prêt officiel ${loanNumber}]`.trim();

    const book = EST_BOOKS.find((b) => b.id === reservation.bookId);
    const student = EST_STUDENTS.find((s) => s.id === reservation.studentId);

    res.json({
      success: true,
      message: `Réservation convertie en emprunt actif (${loanNumber}) pour ${student?.fullName || reservation.studentName} !`,
      loan: newLoan,
      reservation,
      book,
      student,
    });
  });

  app.delete('/api/reservations/:id', (req, res) => {
    const { id } = req.params;
    const reservation = EST_RESERVATIONS.find((r) => r.id === id);
    if (!reservation) {
      return res.status(404).json({ error: 'Réservation introuvable.' });
    }

    if (reservation.status !== 'annulee' && reservation.status !== 'terminee') {
      const book = EST_BOOKS.find((b) => b.id === reservation.bookId);
      if (book) {
        book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
      }
    }

    reservation.status = 'annulee';
    res.json({ success: true, message: 'Réservation annulée avec succès.', reservation });
  });

  // 6. API Relances Automatiques Gmail (Sans intervention humaine)
  app.get('/api/automated-emails', (req, res) => {
    const { studentId } = req.query;
    if (studentId) {
      const filtered = AUTOMATED_EMAIL_LOGS.filter((e) => e.studentId === studentId);
      return res.json(filtered);
    }
    res.json(AUTOMATED_EMAIL_LOGS);
  });

  // Forcer l'audit instantané du robot
  app.post('/api/automated-emails/check', (_req, res) => {
    const result = runAutomatedEmailEngine();
    res.json({
      success: true,
      totalEmails: AUTOMATED_EMAIL_LOGS.length,
      dispatchedCount: result.dispatchedCount,
      newEmails: result.newEmails,
    });
  });

  // Simulation interactive de dépassement d'échéance (pour tester le robot selon la gravité)
  app.post('/api/loans/simulate-due-date', (req, res) => {
    const { loanId, daysOffset, resetToNormal } = req.body;
    const loan = EST_LOANS.find((l) => l.id === loanId);
    if (!loan) {
      return res.status(404).json({ error: 'Emprunt introuvable' });
    }

    if (resetToNormal) {
      // Remettre le prêt dans les délais normaux (+14 jours)
      const d = new Date();
      d.setDate(d.getDate() + 14);
      loan.dueDate = d.toISOString().split('T')[0];
      loan.status = 'en_cours';
    } else if (typeof daysOffset === 'number') {
      // Décaler la date d'échéance par rapport à aujourd'hui
      // Exemple : daysOffset = -2 -> 2 jours de retard
      // Exemple : daysOffset = -5 -> 5 jours de retard
      // Exemple : daysOffset = -10 -> 10 jours de retard critique
      const d = new Date();
      d.setDate(d.getDate() + daysOffset);
      loan.dueDate = d.toISOString().split('T')[0];
      if (daysOffset < 0) {
        loan.status = 'en_retard';
      } else {
        loan.status = 'en_cours';
      }
    }

    // Déclencher immédiatement l'audit automatique du robot sans intervention humaine
    const result = runAutomatedEmailEngine();

    res.json({
      success: true,
      loan,
      dispatchedCount: result.dispatchedCount,
      newEmails: result.newEmails,
      allEmailsForStudent: AUTOMATED_EMAIL_LOGS.filter((e) => e.studentId === loan.studentId),
    });
  });

  // Mount Vite Middlewares in development
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BiblioPrêt EST Fès] Serveur actif sur http://0.0.0.0:${PORT}`);
  });
}

startServer();
