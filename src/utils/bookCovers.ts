/**
 * Système de gestion des photos de couverture pour chaque ouvrage du catalogue EST Fès.
 * Garantit que chaque livre possède une photo de couverture thématique haute définition,
 * avec basculement automatique sur les actifs locaux en cas d'absence de réseau.
 */

// Photos thématiques haute qualité (Unsplash CDN optimisé) pour chaque domaine
const THEME_PHOTOS: Record<string, string> = {
  // Programmation & Langages
  python: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&auto=format&fit=crop&q=80',
  java: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
  c_lang: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80',
  cpp: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
  javascript: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&auto=format&fit=crop&q=80',
  typescript: 'https://images.unsplash.com/photo-1516116211227-bbc13c744158?w=600&auto=format&fit=crop&q=80',

  // Génie Logiciel
  uml: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80',
  architecture: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop&q=80',
  testing: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
  patterns: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
  agile: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop&q=80',
  devops: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=600&auto=format&fit=crop&q=80',
  springboot: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=600&auto=format&fit=crop&q=80',
  git: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=80',

  // Réseaux
  tcp_ip: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80',
  routing: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
  cisco: 'https://images.unsplash.com/photo-1520869562399-e772f042f422?w=600&auto=format&fit=crop&q=80',
  network_security: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',

  // Bases de données
  sql: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80',
  mysql: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&auto=format&fit=crop&q=80',
  postgres: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
  mongodb: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
  merise: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop&q=80',

  // Cybersécurité
  crypto: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
  web_sec: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&auto=format&fit=crop&q=80',
  firewall: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=600&auto=format&fit=crop&q=80',

  // Intelligence Artificielle & Data
  ml: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=600&auto=format&fit=crop&q=80',
  deep_learning: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80',
  genai: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80',

  // Mathématiques
  algebra: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
  probability: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop&q=80',
  stats: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
  graphs: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',

  // Systèmes & Cloud
  linux: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&auto=format&fit=crop&q=80',
  docker: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600&auto=format&fit=crop&q=80',
  k8s: 'https://images.unsplash.com/photo-1667372393086-9d4001d51cf1?w=600&auto=format&fit=crop&q=80',
  cloud: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80',

  // Dév Web
  html_css: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
  react: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80',
  nodejs: 'https://images.unsplash.com/photo-1537432376769-00f5c244c8d8?w=600&auto=format&fit=crop&q=80',
  rest_api: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',

  // Sciences de l'ingénieur
  electronics: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
  embedded: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?w=600&auto=format&fit=crop&q=80',
  iot: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
  economy: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
};

// Actifs locaux pré-générés pour secours immédiat
const LOCAL_FALLBACKS: Record<string, string> = {
  programmation: '/src/assets/images/couverture_programmation_1791886158171.jpg',
  genie_logiciel: '/src/assets/images/couverture_dev_web_1791886181197.jpg',
  reseaux: '/src/assets/images/couverture_reseaux_1791886159090.jpg',
  bases_de_donnees: '/src/assets/images/couverture_bdd_sql_1791886181257.jpg',
  cybersecurite: '/src/assets/images/couverture_cybersecurite_1791886159838.jpg',
  intelligence_artificielle: '/src/assets/images/couverture_ia_machinelearning_1791886159506.jpg',
  mathematiques: '/src/assets/images/couverture_mathematiques_1791886214475.jpg',
  systemes_et_cloud: '/src/assets/images/couverture_cloud_systemes_1791886181002.jpg',
  developpement_web: '/src/assets/images/couverture_dev_web_1791886181197.jpg',
  sciences_de_l_ingenieur: '/src/assets/images/couverture_sciences_ingenieur_1791886182414.jpg',
};

export function getBookCoverUrl(book: {
  title?: string;
  titre?: string;
  category?: string;
  categorie?: string;
  id?: string | number;
}): string {
  const title = (book.title || book.titre || '').toLowerCase();
  const cat = (book.category || book.categorie || '').toLowerCase();

  // Spécifique par sujet / titre
  if (title.includes('python')) return THEME_PHOTOS.python;
  if (title.includes('java :') || title.includes('java') && !title.includes('javascript')) return THEME_PHOTOS.java;
  if (title.includes('c++')) return THEME_PHOTOS.cpp;
  if (title.includes(' c ') || title.endsWith(' c') || title.includes(' de c')) return THEME_PHOTOS.c_lang;
  if (title.includes('typescript')) return THEME_PHOTOS.typescript;
  if (title.includes('javascript')) return THEME_PHOTOS.javascript;
  if (title.includes('react')) return THEME_PHOTOS.react;
  if (title.includes('node.js') || title.includes('nodejs')) return THEME_PHOTOS.nodejs;
  if (title.includes('api rest') || title.includes('api')) return THEME_PHOTOS.rest_api;
  if (title.includes('html') || title.includes('css')) return THEME_PHOTOS.html_css;

  if (title.includes('uml')) return THEME_PHOTOS.uml;
  if (title.includes('architecture logicielle')) return THEME_PHOTOS.architecture;
  if (title.includes('tests logiciels')) return THEME_PHOTOS.testing;
  if (title.includes('design patterns')) return THEME_PHOTOS.patterns;
  if (title.includes('méthodes agiles') || title.includes('agile')) return THEME_PHOTOS.agile;
  if (title.includes('devops')) return THEME_PHOTOS.devops;
  if (title.includes('spring boot')) return THEME_PHOTOS.springboot;
  if (title.includes('git')) return THEME_PHOTOS.git;

  if (title.includes('tcp/ip')) return THEME_PHOTOS.tcp_ip;
  if (title.includes('routage')) return THEME_PHOTOS.routing;
  if (title.includes('cisco')) return THEME_PHOTOS.cisco;
  if (title.includes('sécurité réseau')) return THEME_PHOTOS.network_security;

  if (title.includes('sql') && !title.includes('mysql') && !title.includes('postgres')) return THEME_PHOTOS.sql;
  if (title.includes('mysql')) return THEME_PHOTOS.mysql;
  if (title.includes('postgresql')) return THEME_PHOTOS.postgres;
  if (title.includes('mongodb')) return THEME_PHOTOS.mongodb;
  if (title.includes('merise')) return THEME_PHOTOS.merise;

  if (title.includes('crypto')) return THEME_PHOTOS.crypto;
  if (title.includes('sécurité web')) return THEME_PHOTOS.web_sec;
  if (title.includes('pare-feu')) return THEME_PHOTOS.firewall;

  if (title.includes('machine learning')) return THEME_PHOTOS.ml;
  if (title.includes('deep learning')) return THEME_PHOTOS.deep_learning;
  if (title.includes('ia générative')) return THEME_PHOTOS.genai;

  if (title.includes('algèbre')) return THEME_PHOTOS.algebra;
  if (title.includes('probabilités')) return THEME_PHOTOS.probability;
  if (title.includes('statistiques')) return THEME_PHOTOS.stats;
  if (title.includes('graphes')) return THEME_PHOTOS.graphs;

  if (title.includes('linux')) return THEME_PHOTOS.linux;
  if (title.includes('docker')) return THEME_PHOTOS.docker;
  if (title.includes('kubernetes')) return THEME_PHOTOS.k8s;
  if (title.includes('cloud')) return THEME_PHOTOS.cloud;

  if (title.includes('électronique')) return THEME_PHOTOS.electronics;
  if (title.includes('embarqués') || title.includes('embarques')) return THEME_PHOTOS.embedded;
  if (title.includes('iot')) return THEME_PHOTOS.iot;
  if (title.includes('économie') || title.includes('economie')) return THEME_PHOTOS.economy;

  // Par catégorie générale
  if (cat.includes('cyber')) return LOCAL_FALLBACKS.cybersecurite;
  if (cat.includes('réseau') || cat.includes('reseau')) return LOCAL_FALLBACKS.reseaux;
  if (cat.includes('intelli')) return LOCAL_FALLBACKS.intelligence_artificielle;
  if (cat.includes('donnée') || cat.includes('base')) return LOCAL_FALLBACKS.bases_de_donnees;
  if (cat.includes('cloud') || cat.includes('système')) return LOCAL_FALLBACKS.systemes_et_cloud;
  if (cat.includes('web')) return LOCAL_FALLBACKS.developpement_web;
  if (cat.includes('logiciel')) return LOCAL_FALLBACKS.genie_logiciel;
  if (cat.includes('math')) return LOCAL_FALLBACKS.mathematiques;
  if (cat.includes('ingénieur') || cat.includes('ingenieur')) return LOCAL_FALLBACKS.sciences_de_l_ingenieur;

  return LOCAL_FALLBACKS.programmation;
}

export function getLocalFallbackUrl(category?: string): string {
  const cat = (category || '').toLowerCase();
  if (cat.includes('cyber')) return LOCAL_FALLBACKS.cybersecurite;
  if (cat.includes('réseau') || cat.includes('reseau')) return LOCAL_FALLBACKS.reseaux;
  if (cat.includes('intelli')) return LOCAL_FALLBACKS.intelligence_artificielle;
  if (cat.includes('donnée') || cat.includes('base')) return LOCAL_FALLBACKS.bases_de_donnees;
  if (cat.includes('cloud') || cat.includes('système')) return LOCAL_FALLBACKS.systemes_et_cloud;
  if (cat.includes('web')) return LOCAL_FALLBACKS.developpement_web;
  if (cat.includes('logiciel')) return LOCAL_FALLBACKS.genie_logiciel;
  if (cat.includes('math')) return LOCAL_FALLBACKS.mathematiques;
  if (cat.includes('ingénieur') || cat.includes('ingenieur')) return LOCAL_FALLBACKS.sciences_de_l_ingenieur;
  return LOCAL_FALLBACKS.programmation;
}
