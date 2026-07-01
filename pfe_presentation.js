const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.title = "CabineIQ — PFE Ahmed Nejbat";

// ── Colors ────────────────────────────────────────────────────────────────────
const RAM_RED    = "C41E3A";
const NAVY       = "07162C";
const NAVY2      = "0A1E38";
const WHITE      = "FFFFFF";
const LIGHT_GRAY = "F4F6FA";
const MID_GRAY   = "8A9AB5";
const DARK_TEXT  = "1A2340";
const ACCENT     = "1E6FA5"; // blue accent

// ── Logo paths ────────────────────────────────────────────────────────────────
const EMSI_LOGO = "C:/Users/AHMED/cursor-projects/PFE26-new/assets/emsi-logo.png";
const RAM_LOGO  = "C:/Users/AHMED/cursor-projects/PFE26-new/assets/ram-logo.png";
const RAM_LOGO_PUBLIC = "C:/Users/AHMED/cursor-projects/PFE26-new/frontend-new/public/ram-logo.png";

// Use RAM logo from public folder (we know it exists)
const ramLogoPath = fs.existsSync(RAM_LOGO) ? RAM_LOGO : RAM_LOGO_PUBLIC;

// ── Helper: add header bar with logos ─────────────────────────────────────────
function addHeader(slide, dark = false) {
  // Background strip
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.65,
    fill: { color: dark ? NAVY : WHITE },
    line: { color: dark ? NAVY2 : "E0E5EF", width: 1 },
  });

  // RAM logo right
  slide.addImage({
    path: ramLogoPath,
    x: 9.0, y: 0.05, w: 0.75, h: 0.55,
    sizing: { type: "contain", w: 0.75, h: 0.55 },
  });

  // EMSI text placeholder left (since we may not have the EMSI logo file)
  slide.addText("EMSI", {
    x: 0.15, y: 0.1, w: 1.2, h: 0.45,
    fontSize: 11, bold: true, color: dark ? WHITE : NAVY,
    fontFace: "Arial", valign: "middle",
  });
}

// ── Helper: section number badge ─────────────────────────────────────────────
function addSectionBadge(slide, num, x = 0.4, y = 0.8) {
  slide.addShape(pres.shapes.OVAL, {
    x, y, w: 0.45, h: 0.45,
    fill: { color: RAM_RED },
  });
  slide.addText(String(num), {
    x, y, w: 0.45, h: 0.45,
    fontSize: 13, bold: true, color: WHITE, align: "center", valign: "middle",
    fontFace: "Arial", margin: 0,
  });
}

// ── Helper: slide title ───────────────────────────────────────────────────────
function addSlideTitle(slide, title, dark = false) {
  slide.addText(title, {
    x: 0.4, y: 0.75, w: 9.2, h: 0.55,
    fontSize: 22, bold: true, color: dark ? WHITE : DARK_TEXT,
    fontFace: "Cambria", valign: "middle",
  });
}

// ── Helper: card ──────────────────────────────────────────────────────────────
function addCard(slide, x, y, w, h, fillColor = LIGHT_GRAY) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h,
    fill: { color: fillColor },
    rectRadius: 0.08,
    shadow: { type: "outer", color: "000000", blur: 8, offset: 2, angle: 45, opacity: 0.10 },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Page de garde
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: NAVY };

  // Red diagonal accent shape (top right)
  s.addShape(pres.shapes.RECTANGLE, {
    x: 7.5, y: 0, w: 2.5, h: 5.625,
    fill: { color: RAM_RED, transparency: 88 },
    line: { color: RAM_RED, transparency: 88 },
  });

  // RAM logo top right
  s.addImage({
    path: ramLogoPath,
    x: 8.8, y: 0.2, w: 0.9, h: 0.65,
    sizing: { type: "contain", w: 0.9, h: 0.65 },
  });

  // EMSI label top left
  s.addText("EMSI", {
    x: 0.3, y: 0.2, w: 1.5, h: 0.6,
    fontSize: 13, bold: true, color: WHITE, fontFace: "Arial",
  });
  s.addText("Ecole Marocaine des Sciences de l'Ingénieur", {
    x: 0.3, y: 0.75, w: 4, h: 0.35,
    fontSize: 8, color: MID_GRAY, fontFace: "Arial",
  });

  // Red accent line
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.4, y: 1.55, w: 1.2, h: 0.06,
    fill: { color: RAM_RED }, line: { color: RAM_RED },
  });

  // Project title
  s.addText("Conception et développement d'une\nplateforme intelligente de gestion\ndes opérations aériennes", {
    x: 0.4, y: 1.7, w: 8.5, h: 1.7,
    fontSize: 24, bold: true, color: WHITE, fontFace: "Cambria",
    valign: "top",
  });
  s.addText("Application aux services de Royal Air Maroc", {
    x: 0.4, y: 3.35, w: 8, h: 0.45,
    fontSize: 14, color: "A0B4CC", fontFace: "Arial", italic: true,
  });

  // Divider
  s.addShape(pres.shapes.LINE, {
    x: 0.4, y: 3.88, w: 8.5, h: 0,
    line: { color: RAM_RED, width: 1.5 },
  });

  // Info row
  s.addText([
    { text: "Réalisé par : ", options: { color: MID_GRAY, fontSize: 11 } },
    { text: "Ahmed Nejbat", options: { color: WHITE, bold: true, fontSize: 11 } },
  ], { x: 0.4, y: 4.05, w: 4.5, h: 0.35, fontFace: "Arial" });

  s.addText([
    { text: "Encadrants : ", options: { color: MID_GRAY, fontSize: 11 } },
    { text: "Mr M.Elhakiki  |  Mr I.Karim", options: { color: WHITE, bold: true, fontSize: 11 } },
  ], { x: 0.4, y: 4.42, w: 6, h: 0.35, fontFace: "Arial" });

  s.addText("Année universitaire 2025 – 2026", {
    x: 0.4, y: 4.8, w: 5, h: 0.35,
    fontSize: 10, color: MID_GRAY, fontFace: "Arial",
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — Sommaire
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: LIGHT_GRAY };
  addHeader(s, false);
  addSlideTitle(s, "Sommaire");

  const items = [
    { num: "1", title: "Introduction", subs: ["Présentation de Royal Air Maroc", "Organisme d'accueil", "Introduction du projet"] },
    { num: "2", title: "Cadre du projet", subs: ["Problématique", "Solution & Besoins"] },
    { num: "3", title: "Modélisation conceptuelle", subs: ["Diagramme de cas d'utilisation", "Diagramme de séquence", "Diagramme de classes"] },
    { num: "4", title: "Réalisation de l'application", subs: ["Démonstration vidéo"] },
    { num: "5", title: "Conclusion et perspectives", subs: [] },
  ];

  const colW = 4.5;
  const startX = [0.35, 5.2];
  const startY = 1.45;
  const rowH = 0.9;

  items.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = startX[col];
    const y = startY + row * (rowH + 0.18);
    const w = col === 0 && i === items.length - 1 ? 9.3 : colW;

    addCard(s, x, y, w, rowH, WHITE);

    // Number badge
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 0.38, h: rowH,
      fill: { color: RAM_RED },
      rectRadius: 0,
    });
    s.addText(item.num, {
      x, y, w: 0.38, h: rowH,
      fontSize: 16, bold: true, color: WHITE, align: "center", valign: "middle",
      fontFace: "Arial", margin: 0,
    });

    s.addText(item.title, {
      x: x + 0.48, y: y + 0.08, w: w - 0.55, h: 0.32,
      fontSize: 12, bold: true, color: DARK_TEXT, fontFace: "Cambria",
    });

    if (item.subs.length > 0) {
      s.addText(item.subs.join("  ·  "), {
        x: x + 0.48, y: y + 0.4, w: w - 0.55, h: 0.42,
        fontSize: 8.5, color: MID_GRAY, fontFace: "Arial",
      });
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 3 — 1.1 Présentation Royal Air Maroc
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addHeader(s, false);

  s.addText("1.1  Présentation de Royal Air Maroc", {
    x: 0.4, y: 0.75, w: 9.2, h: 0.5,
    fontSize: 20, bold: true, color: DARK_TEXT, fontFace: "Cambria",
  });

  // Left column — key facts
  const facts = [
    { icon: "✈", label: "Fondée en 1957", sub: "Compagnie nationale du Maroc" },
    { icon: "🌍", label: "100+ destinations", sub: "Europe, Afrique, Amériques, Moyen-Orient" },
    { icon: "✈", label: "50+ appareils", sub: "Boeing 737, 787, ATR 72-600" },
    { icon: "👥", label: "+5 000 employés", sub: "Pilotes, PNC, personnel au sol" },
  ];

  facts.forEach((f, i) => {
    const y = 1.45 + i * 0.88;
    addCard(s, 0.35, y, 4.3, 0.75, i % 2 === 0 ? "F8F9FC" : LIGHT_GRAY);
    s.addShape(pres.shapes.OVAL, {
      x: 0.5, y: y + 0.15, w: 0.42, h: 0.42,
      fill: { color: RAM_RED },
    });
    s.addText(f.icon, {
      x: 0.5, y: y + 0.15, w: 0.42, h: 0.42,
      fontSize: 14, align: "center", valign: "middle", margin: 0,
    });
    s.addText(f.label, {
      x: 1.05, y: y + 0.08, w: 3.5, h: 0.28,
      fontSize: 12, bold: true, color: DARK_TEXT, fontFace: "Cambria",
    });
    s.addText(f.sub, {
      x: 1.05, y: y + 0.36, w: 3.5, h: 0.28,
      fontSize: 9.5, color: MID_GRAY, fontFace: "Arial",
    });
  });

  // Right column — mission statement + activity areas
  addCard(s, 4.9, 1.45, 4.7, 2.0, NAVY);
  s.addText("Mission", {
    x: 5.1, y: 1.58, w: 4.3, h: 0.35,
    fontSize: 13, bold: true, color: "A0B4CC", fontFace: "Cambria",
  });
  s.addText(
    "Connecter le Maroc au monde en offrant des services\naériens sûrs, ponctuels et de qualité, tout en portant\nl'image du Royaume à l'international.",
    { x: 5.1, y: 1.95, w: 4.3, h: 1.3, fontSize: 10.5, color: WHITE, fontFace: "Arial" }
  );

  const domains = ["Transport passagers", "Fret aérien", "Maintenance MRO", "Formation aviation"];
  domains.forEach((d, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const bx = 4.9 + col * 2.3;
    const by = 3.65 + row * 0.72;
    addCard(s, bx, by, 2.15, 0.58, LIGHT_GRAY);
    s.addShape(pres.shapes.RECTANGLE, {
      x: bx, y: by, w: 0.18, h: 0.58,
      fill: { color: RAM_RED }, line: { color: RAM_RED },
    });
    s.addText(d, {
      x: bx + 0.28, y: by + 0.12, w: 1.8, h: 0.34,
      fontSize: 9.5, bold: true, color: DARK_TEXT, fontFace: "Arial",
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 4 — 1.2 Organisme d'accueil
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: LIGHT_GRAY };
  addHeader(s, false);

  s.addText("1.2  Organisme d'accueil", {
    x: 0.4, y: 0.75, w: 9.2, h: 0.5,
    fontSize: 20, bold: true, color: DARK_TEXT, fontFace: "Cambria",
  });

  // Placeholder for organigramme
  addCard(s, 0.5, 1.4, 9.0, 3.5, WHITE);
  s.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 1.4, w: 9.0, h: 3.5,
    fill: { color: WHITE },
    line: { color: "D0D8E8", width: 1.5, dashType: "dash" },
    rectRadius: 0.08,
  });
  s.addShape(pres.shapes.OVAL, {
    x: 4.3, y: 2.3, w: 1.4, h: 1.4,
    fill: { color: LIGHT_GRAY },
    line: { color: "D0D8E8", width: 1.5, dashType: "dash" },
  });
  s.addText("🖼", {
    x: 4.3, y: 2.3, w: 1.4, h: 1.4,
    fontSize: 32, align: "center", valign: "middle", margin: 0,
  });
  s.addText("Insérer image organigramme", {
    x: 0.5, y: 3.85, w: 9.0, h: 0.55,
    fontSize: 12, color: MID_GRAY, align: "center", fontFace: "Arial", italic: true,
  });

  s.addText("Direction Générale  ·  Divisions Opérationnelles  ·  Services Techniques  ·  Ressources Humaines", {
    x: 0.5, y: 5.1, w: 9.0, h: 0.35,
    fontSize: 9, color: MID_GRAY, align: "center", fontFace: "Arial",
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 5 — 1.3 Introduction du projet
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addHeader(s, false);

  s.addText("1.3  Introduction du projet", {
    x: 0.4, y: 0.75, w: 9.2, h: 0.5,
    fontSize: 20, bold: true, color: DARK_TEXT, fontFace: "Cambria",
  });

  // Context paragraph
  addCard(s, 0.35, 1.4, 9.3, 1.0, "EFF3FB");
  s.addText(
    "Dans un secteur aérien en constante évolution, Royal Air Maroc fait face à des défis croissants dans la gestion " +
    "de ses opérations cabine. Ce projet propose CabineIQ, une plateforme intelligente centralisée permettant de " +
    "digitaliser et optimiser l'ensemble du cycle de vie d'un vol — de la configuration de l'appareil à l'expérience passager.",
    {
      x: 0.55, y: 1.5, w: 9.0, h: 0.85,
      fontSize: 11, color: DARK_TEXT, fontFace: "Arial", align: "justify",
    }
  );

  // 3 pillars
  const pillars = [
    { title: "Gestion Opérationnelle", desc: "Flotte, vols, passagers et sièges gérés depuis une interface unique et intuitive.", color: "EAF4FB" },
    { title: "Intelligence Embarquée", desc: "Scoring des sièges, alertes objets perdus par email et assistant IA pour le personnel.", color: "FEF0F2" },
    { title: "Architecture Moderne", desc: "Microservices Spring Boot, React TypeScript, machine learning et notifications temps réel.", color: "F0FBF4" },
  ];

  pillars.forEach((p, i) => {
    const x = 0.35 + i * 3.13;
    addCard(s, x, 2.65, 2.95, 2.55, p.color);
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 2.65, w: 2.95, h: 0.35,
      fill: { color: RAM_RED },
      rectRadius: 0,
    });
    s.addText(p.title, {
      x: x + 0.12, y: 2.65, w: 2.7, h: 0.35,
      fontSize: 10.5, bold: true, color: WHITE, fontFace: "Arial", valign: "middle",
    });
    s.addText(p.desc, {
      x: x + 0.15, y: 3.1, w: 2.65, h: 2.0,
      fontSize: 10, color: DARK_TEXT, fontFace: "Arial",
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 6 — 2.1 Problématique
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  addHeader(s, true);

  s.addText("2.1  Problématique", {
    x: 0.4, y: 0.75, w: 9.2, h: 0.5,
    fontSize: 20, bold: true, color: WHITE, fontFace: "Cambria",
  });

  const problems = [
    { num: "01", title: "Gestion manuelle des cabines", desc: "Attribution et suivi des sièges effectués manuellement, source d'erreurs et de lenteur opérationnelle." },
    { num: "02", title: "Absence de scoring intelligent", desc: "Aucun système de notation de l'état des sièges post-vol — impossible de prioriser le nettoyage ou la maintenance." },
    { num: "03", title: "Suivi des vols non temps réel", desc: "Les statuts de vols (BOARDING, DEPARTED, ARRIVED) mis à jour manuellement par les agents, avec risque de désynchronisation." },
    { num: "04", title: "Objets perdus traités en papier", desc: "Aucune notification automatique aux passagers — tout le processus de réclamation est géré hors-système." },
  ];

  problems.forEach((p, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.35 + col * 4.85;
    const y = 1.45 + row * 1.85;
    addCard(s, x, y, 4.6, 1.65, NAVY2);
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.2, y: y + 0.55, w: 0.55, h: 0.55,
      fill: { color: RAM_RED },
    });
    s.addText(p.num, {
      x: x + 0.2, y: y + 0.55, w: 0.55, h: 0.55,
      fontSize: 12, bold: true, color: WHITE, align: "center", valign: "middle", margin: 0,
    });
    s.addText(p.title, {
      x: x + 0.88, y: y + 0.18, w: 3.55, h: 0.38,
      fontSize: 11, bold: true, color: WHITE, fontFace: "Cambria",
    });
    s.addText(p.desc, {
      x: x + 0.88, y: y + 0.58, w: 3.55, h: 0.9,
      fontSize: 9.5, color: "A0B4CC", fontFace: "Arial",
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 7 — 2.2 Solution — Besoins
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: LIGHT_GRAY };
  addHeader(s, false);

  s.addText("2.2  Solution — Besoins du système", {
    x: 0.4, y: 0.75, w: 9.2, h: 0.5,
    fontSize: 20, bold: true, color: DARK_TEXT, fontFace: "Cambria",
  });

  // Fonctionnels — left
  addCard(s, 0.35, 1.42, 4.55, 3.85, WHITE);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.35, y: 1.42, w: 4.55, h: 0.45,
    fill: { color: RAM_RED }, rectRadius: 0.08,
  });
  s.addText("Besoins Fonctionnels", {
    x: 0.45, y: 1.44, w: 4.35, h: 0.41,
    fontSize: 12, bold: true, color: WHITE, fontFace: "Cambria", valign: "middle",
  });

  const bfItems = [
    "Gestion de la flotte d'appareils (CRUD + modèles)",
    "Gestion des vols avec statut automatique",
    "Gestion des passagers et affectation des sièges",
    "Carte des sièges interactive 3D par avion",
    "Scoring des sièges par le personnel navigant",
    "Alertes email automatiques — objets perdus",
    "Assistant IA pour interrogation opérationnelle",
    "Portail passager — consultation booking",
  ];

  bfItems.forEach((item, i) => {
    s.addText([
      { text: "▸  ", options: { color: RAM_RED, bold: true } },
      { text: item, options: { color: DARK_TEXT } },
    ], {
      x: 0.5, y: 1.97 + i * 0.4, w: 4.2, h: 0.35,
      fontSize: 9.5, fontFace: "Arial",
    });
  });

  // Non-fonctionnels — right
  addCard(s, 5.1, 1.42, 4.55, 3.85, WHITE);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 5.1, y: 1.42, w: 4.55, h: 0.45,
    fill: { color: NAVY }, rectRadius: 0.08,
  });
  s.addText("Besoins Non Fonctionnels", {
    x: 5.2, y: 1.44, w: 4.35, h: 0.41,
    fontSize: 12, bold: true, color: WHITE, fontFace: "Cambria", valign: "middle",
  });

  const bnfItems = [
    { t: "Performance", d: "Temps de réponse API < 500ms" },
    { t: "Sécurité", d: "Authentification JWT, rôles ADMIN / USER / CREW" },
    { t: "Scalabilité", d: "Architecture microservices indépendants" },
    { t: "Disponibilité", d: "Services découplés, tolérance aux pannes" },
    { t: "Maintenabilité", d: "Code modulaire, API REST documentée" },
    { t: "Compatibilité", d: "Navigateurs modernes, responsive design" },
  ];

  bnfItems.forEach((item, i) => {
    addCard(s, 5.2, 1.97 + i * 0.52, 4.3, 0.44, "F4F7FD");
    s.addText(item.t + " — ", {
      x: 5.35, y: 2.01 + i * 0.52, w: 4.1, h: 0.34,
      fontSize: 9.5, fontFace: "Arial", color: DARK_TEXT,
    });
    s.addText(item.d, {
      x: 5.35 + 1.35, y: 2.01 + i * 0.52, w: 2.9, h: 0.34,
      fontSize: 9.5, color: MID_GRAY, fontFace: "Arial",
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 8 — 3.1 Diagramme de Cas d'Utilisation
// ═══════════════════════════════════════════════════════════════════════════════
function diagramSlide(title, num) {
  const s = pres.addSlide();
  s.background = { color: WHITE };
  addHeader(s, false);

  s.addText(title, {
    x: 0.4, y: 0.75, w: 9.2, h: 0.5,
    fontSize: 20, bold: true, color: DARK_TEXT, fontFace: "Cambria",
  });

  // Placeholder box
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 1.4, w: 9.0, h: 3.85,
    fill: { color: LIGHT_GRAY },
    line: { color: "C8D4E8", width: 1.5, dashType: "dash" },
    rectRadius: 0.1,
  });
  s.addText("🖼", {
    x: 4.3, y: 2.2, w: 1.4, h: 1.4,
    fontSize: 36, align: "center", valign: "middle", margin: 0,
  });
  s.addText("Insérer diagramme", {
    x: 0.5, y: 3.75, w: 9.0, h: 0.45,
    fontSize: 12, color: MID_GRAY, align: "center", fontFace: "Arial", italic: true,
  });

  return s;
}

diagramSlide("3.1  Diagramme de Cas d'Utilisation", "3.1");
diagramSlide("3.2  Diagramme de Séquence", "3.2");
diagramSlide("3.3  Diagramme de Classes", "3.3");

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 11 — 4. Réalisation de l'Application
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  addHeader(s, true);

  s.addText("4.  Réalisation de l'Application", {
    x: 0.4, y: 0.75, w: 9.2, h: 0.5,
    fontSize: 20, bold: true, color: WHITE, fontFace: "Cambria",
  });

  // Big placeholder
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 1.4, w: 9.0, h: 3.85,
    fill: { color: NAVY2 },
    line: { color: RAM_RED, width: 2, dashType: "dash" },
    rectRadius: 0.12,
  });

  // Play button circle
  s.addShape(pres.shapes.OVAL, {
    x: 4.25, y: 2.4, w: 1.5, h: 1.5,
    fill: { color: RAM_RED, transparency: 15 },
  });
  s.addText("▶", {
    x: 4.25, y: 2.4, w: 1.5, h: 1.5,
    fontSize: 32, color: WHITE, align: "center", valign: "middle", margin: 0,
  });

  s.addText("Démonstration vidéo", {
    x: 0.5, y: 4.05, w: 9.0, h: 0.45,
    fontSize: 13, color: MID_GRAY, align: "center", fontFace: "Arial", italic: true,
  });

  s.addText("CabineIQ — Plateforme intelligente de gestion des opérations aériennes", {
    x: 0.5, y: 4.6, w: 9.0, h: 0.5,
    fontSize: 10, color: "5070A0", align: "center", fontFace: "Arial",
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 12 — Architecture Technique (drawn with shapes)
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  addHeader(s, true);

  s.addText("Architecture Technique — Microservices", {
    x: 0.4, y: 0.75, w: 9.2, h: 0.48,
    fontSize: 20, bold: true, color: WHITE, fontFace: "Cambria",
  });

  // ── helper: draw a service box ──────────────────────────────────────────────
  function svcBox(x, y, w, h, label, sublabel, color) {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w, h,
      fill: { color: color || "0D2A48" },
      line: { color: "1E4060", width: 1 },
      rectRadius: 0.06,
      shadow: { type: "outer", color: "000000", blur: 6, offset: 2, angle: 45, opacity: 0.25 },
    });
    s.addText(label, {
      x: x + 0.05, y: y + (sublabel ? 0.04 : 0.1), w: w - 0.1, h: sublabel ? 0.3 : h - 0.2,
      fontSize: sublabel ? 8.5 : 9, bold: true, color: WHITE, align: "center", valign: "middle",
      fontFace: "Arial", margin: 0,
    });
    if (sublabel) {
      s.addText(sublabel, {
        x: x + 0.05, y: y + 0.34, w: w - 0.1, h: h - 0.38,
        fontSize: 7, color: "6090B8", align: "center", valign: "top",
        fontFace: "Arial", margin: 0,
      });
    }
  }

  // ── helper: horizontal arrow ────────────────────────────────────────────────
  function arrowH(x1, y, x2) {
    s.addShape(pres.shapes.LINE, { x: x1, y, w: x2 - x1, h: 0, line: { color: "2A5070", width: 1.2 } });
  }
  function arrowV(x, y1, y2) {
    s.addShape(pres.shapes.LINE, { x, y: y1, w: 0, h: y2 - y1, line: { color: "2A5070", width: 1.2 } });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Row 1: Client  →  Nginx / API Gateway  →  Eureka
  // ─────────────────────────────────────────────────────────────────────────────
  // Client browser
  svcBox(0.18, 1.38, 1.35, 0.75, "🌐 Client", "React + Vite\nTypeScript", "102040");

  arrowH(1.53, 1.75, 2.35);

  // Nginx / API GW
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 2.35, y: 1.3, w: 1.6, h: 0.9,
    fill: { color: RAM_RED, transparency: 10 },
    line: { color: RAM_RED, width: 1.5 },
    rectRadius: 0.07,
  });
  s.addText("Nginx", { x: 2.35, y: 1.3, w: 1.6, h: 0.42, fontSize: 9.5, bold: true, color: WHITE, align: "center", valign: "middle", fontFace: "Arial", margin: 0 });
  s.addText("API Gateway\nLoad Balancer", { x: 2.35, y: 1.72, w: 1.6, h: 0.46, fontSize: 7, color: "FFB0B0", align: "center", fontFace: "Arial", margin: 0 });

  arrowH(3.95, 1.75, 4.7);

  // Eureka
  svcBox(4.7, 1.3, 1.55, 0.9, "⬡ Eureka", "Service Discovery\nService Registry", "0A2A1A");

  // ─────────────────────────────────────────────────────────────────────────────
  // Row 2: 7 microservices spread across
  // ─────────────────────────────────────────────────────────────────────────────
  const svcs = [
    { label: "auth-\nservice",     sub: ":8081\nJWT / Users",        color: "0F2A40" },
    { label: "aircraft-\nservice", sub: ":8082\nFlotte",             color: "0F2A40" },
    { label: "passenger-\nservice",sub: ":8083\nPassagers",          color: "0F2A40" },
    { label: "flight-\nservice",   sub: ":8084\nVols + Scheduler",   color: "0F2A40" },
    { label: "seat-\nservice",     sub: ":8085\nSièges + Scoring",   color: "0F2A40" },
    { label: "notif-\nservice",    sub: ":8089\nEmail Alerts",       color: "0F2A40" },
    { label: "ai-\nservice",       sub: ":8086\nClaude AI",          color: "1A0A30" },
  ];

  const sW = 1.2, sH = 0.85, sGap = 0.12;
  const totalW = svcs.length * sW + (svcs.length - 1) * sGap;
  const sStartX = (10 - totalW) / 2;
  const sY = 2.52;

  svcs.forEach((svc, i) => {
    const sx = sStartX + i * (sW + sGap);
    svcBox(sx, sY, sW, sH, svc.label, svc.sub, svc.color);
    // Arrow down from gateway row
    arrowV(sx + sW / 2, 2.2, sY);
  });

  // Vertical line from Nginx down to the services row
  s.addShape(pres.shapes.LINE, {
    x: 3.15, y: 2.2, w: 0, h: 0.32,
    line: { color: "2A5070", width: 1.2 },
  });
  // Horizontal connector at y=2.2
  s.addShape(pres.shapes.LINE, {
    x: sStartX + sW / 2, y: 2.2, w: sStartX + (svcs.length - 1) * (sW + sGap) + sW / 2 - (sStartX + sW / 2), h: 0,
    line: { color: "2A5070", width: 1.2 },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Row 3: MySQL databases (one per service, 5 main ones shown)
  // ─────────────────────────────────────────────────────────────────────────────
  const dbY = 3.6;
  const dbSvcs = [0, 1, 2, 3, 4]; // indices matching svcs
  dbSvcs.forEach((i) => {
    const sx = sStartX + i * (sW + sGap);
    arrowV(sx + sW / 2, sY + sH, dbY);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: sx + 0.1, y: dbY, w: sW - 0.2, h: 0.62,
      fill: { color: "051528" },
      line: { color: "0E6DA0", width: 1 },
      rectRadius: 0.05,
    });
    s.addText("🗄 MySQL", {
      x: sx + 0.1, y: dbY + 0.04, w: sW - 0.2, h: 0.3,
      fontSize: 7.5, color: "38AADD", align: "center", fontFace: "Arial", margin: 0,
    });
    s.addText(["auth", "aircraft", "passenger", "flight", "seat"][i] + "_db", {
      x: sx + 0.1, y: dbY + 0.32, w: sW - 0.2, h: 0.25,
      fontSize: 6.5, color: "4A6880", align: "center", fontFace: "Arial", margin: 0,
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Right column: external services
  // ─────────────────────────────────────────────────────────────────────────────
  // Notification → SMTP Gmail
  const notifX = sStartX + 5 * (sW + sGap);
  arrowV(notifX + sW / 2, sY + sH, dbY);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: notifX + 0.1, y: dbY, w: sW - 0.2, h: 0.62,
    fill: { color: "1A0A0A" },
    line: { color: "CC3322", width: 1 },
    rectRadius: 0.05,
  });
  s.addText("✉ SMTP\nGmail", { x: notifX + 0.1, y: dbY + 0.04, w: sW - 0.2, h: 0.55, fontSize: 7.5, color: "FF8870", align: "center", fontFace: "Arial", margin: 0 });

  // AI service → Claude API
  const aiX = sStartX + 6 * (sW + sGap);
  arrowV(aiX + sW / 2, sY + sH, dbY);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: aiX + 0.1, y: dbY, w: sW - 0.2, h: 0.62,
    fill: { color: "0D0A1A" },
    line: { color: "7755CC", width: 1 },
    rectRadius: 0.05,
  });
  s.addText("🤖 Claude\nAnthropic API", { x: aiX + 0.1, y: dbY + 0.04, w: sW - 0.2, h: 0.55, fontSize: 7.5, color: "AA88EE", align: "center", fontFace: "Arial", margin: 0 });

  // ─────────────────────────────────────────────────────────────────────────────
  // Docker badge bottom-left
  // ─────────────────────────────────────────────────────────────────────────────
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 6.5, y: 1.32, w: 1.5, h: 0.88,
    fill: { color: "051E3A" },
    line: { color: "0E6DA0", width: 1 },
    rectRadius: 0.07,
  });
  s.addText("🐳 Docker", { x: 6.5, y: 1.35, w: 1.5, h: 0.38, fontSize: 9, bold: true, color: "38AADD", align: "center", fontFace: "Arial", margin: 0 });
  s.addText("Containerized\ndeploy", { x: 6.5, y: 1.73, w: 1.5, h: 0.44, fontSize: 7, color: "4A7A90", align: "center", fontFace: "Arial", margin: 0 });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 8.2, y: 1.32, w: 1.6, h: 0.88,
    fill: { color: "1A1508" },
    line: { color: "8A7020", width: 1 },
    rectRadius: 0.07,
  });
  s.addText("⚡ Spring Boot", { x: 8.2, y: 1.35, w: 1.6, h: 0.38, fontSize: 9, bold: true, color: "F0B820", align: "center", fontFace: "Arial", margin: 0 });
  s.addText("Java 17\nMaven", { x: 8.2, y: 1.73, w: 1.6, h: 0.44, fontSize: 7, color: "8A7030", align: "center", fontFace: "Arial", margin: 0 });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 13 — Technologies utilisées
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: LIGHT_GRAY };
  addHeader(s, false);

  s.addText("Technologies Utilisées", {
    x: 0.4, y: 0.75, w: 9.2, h: 0.48,
    fontSize: 20, bold: true, color: DARK_TEXT, fontFace: "Cambria",
  });

  // Tech data: [label, sublabel, bg, accent, emoji]
  const techs = [
    // Row 1 — Frontend
    { label: "React",       sub: "UI Library",              bg: "E8F6FE", acc: "0FA3D4", emoji: "⚛" },
    { label: "TypeScript",  sub: "Static typing",           bg: "E8EEFE", acc: "3178C6", emoji: "TS" },
    { label: "Tailwind CSS",sub: "Utility-first CSS",       bg: "E8FEFA", acc: "06B6D4", emoji: "🌬" },
    { label: "Vite",        sub: "Build tool",              bg: "F5E8FE", acc: "9333EA", emoji: "⚡" },
    { label: "React Query", sub: "Server state mgmt",       bg: "FFF0E8", acc: "FF4154", emoji: "🔄" },
    // Row 2 — Backend
    { label: "Spring Boot", sub: "Java framework",          bg: "F0FBE8", acc: "6DB33F", emoji: "🍃" },
    { label: "Spring AI",   sub: "AI integration",          bg: "F0F4FE", acc: "4C6EF5", emoji: "🤖" },
    { label: "JWT Auth",    sub: "Security / Roles",        bg: "FEF8E8", acc: "F59E0B", emoji: "🔐" },
    { label: "MySQL",       sub: "Relational database",     bg: "E8F0FE", acc: "1565C0", emoji: "🗄" },
    { label: "Eureka",      sub: "Service discovery",       bg: "FEE8E8", acc: "C41E3A", emoji: "⬡" },
    // Row 3 — Infrastructure / AI
    { label: "Docker",      sub: "Containerization",        bg: "E8F4FE", acc: "2496ED", emoji: "🐳" },
    { label: "Nginx",       sub: "API Gateway / Proxy",     bg: "E8FEF0", acc: "009639", emoji: "🔀" },
    { label: "Claude AI",   sub: "Anthropic LLM",           bg: "F0E8FE", acc: "7C3AED", emoji: "✦" },
    { label: "Maven",       sub: "Build & Dependency",      bg: "FEF0E8", acc: "D14836", emoji: "📦" },
    { label: "Java 17",     sub: "Backend runtime",         bg: "FFF8E8", acc: "E76F00", emoji: "☕" },
  ];

  const cols = 5, cardW = 1.72, cardH = 0.9, gapX = 0.1, gapY = 0.12;
  const startX = 0.35, startY = 1.38;

  techs.forEach((t, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);

    // Card
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: cardW, h: cardH,
      fill: { color: t.bg },
      line: { color: "D0D8E8", width: 1 },
      rectRadius: 0.08,
      shadow: { type: "outer", color: "000000", blur: 5, offset: 1, angle: 45, opacity: 0.08 },
    });

    // Colored accent strip left
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 0.2, h: cardH,
      fill: { color: t.acc },
      line: { color: t.acc },
      rectRadius: 0,
    });

    // Emoji badge
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.28, y: y + 0.18, w: 0.46, h: 0.46,
      fill: { color: "FFFFFF" },
      line: { color: "D0D8E8", width: 1 },
    });
    s.addText(t.emoji, {
      x: x + 0.28, y: y + 0.18, w: 0.46, h: 0.46,
      fontSize: 14, align: "center", valign: "middle", margin: 0,
    });

    // Label
    s.addText(t.label, {
      x: x + 0.82, y: y + 0.12, w: cardW - 0.9, h: 0.38,
      fontSize: 10, bold: true, color: DARK_TEXT, fontFace: "Arial", valign: "middle",
    });
    s.addText(t.sub, {
      x: x + 0.82, y: y + 0.5, w: cardW - 0.9, h: 0.3,
      fontSize: 8.5, color: MID_GRAY, fontFace: "Arial",
    });
  });

  // Section labels
  const sectionLabels = [
    { label: "Frontend", x: 0.35, color: "0FA3D4" },
    { label: "Backend & BDD", x: 0.35 + 5 * (cardW + gapX) / 2, color: "6DB33F" },
    { label: "Infrastructure & IA", x: 0.35 + 10 * (cardW + gapX) / 2, color: "2496ED" },
  ];
  // Just one row label per row at far right
  const rowLabels = ["Frontend", "Backend & BDD", "Infrastructure & IA"];
  const rowColors = ["0FA3D4", "6DB33F", "2496ED"];
  rowLabels.forEach((lbl, row) => {
    const y = startY + row * (cardH + gapY) + cardH / 2;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: 9.0, y: y - 0.16, w: 0.85, h: 0.32,
      fill: { color: rowColors[row] },
      line: { color: rowColors[row] },
      rectRadius: 0.06,
    });
    s.addText(lbl, {
      x: 9.0, y: y - 0.16, w: 0.85, h: 0.32,
      fontSize: 6.5, bold: true, color: WHITE, align: "center", valign: "middle",
      fontFace: "Arial", margin: 0,
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 14 — 5. Conclusion et Perspectives
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  addHeader(s, true);

  s.addText("5.  Conclusion et Perspectives", {
    x: 0.4, y: 0.75, w: 9.2, h: 0.5,
    fontSize: 20, bold: true, color: WHITE, fontFace: "Cambria",
  });

  // Conclusion card
  addCard(s, 0.35, 1.38, 9.3, 1.55, NAVY2);
  s.addText("Conclusion", {
    x: 0.55, y: 1.45, w: 2.0, h: 0.35,
    fontSize: 12, bold: true, color: RAM_RED, fontFace: "Cambria",
  });
  s.addText(
    "La plateforme CabineIQ digitalise et intelligentise avec succès les opérations cabine de Royal Air Maroc, " +
    "offrant une gestion centralisée de la flotte, des vols, des passagers et des sièges. " +
    "L'architecture microservices garantit la scalabilité et la maintenabilité du système pour une croissance future.",
    {
      x: 0.55, y: 1.82, w: 8.95, h: 0.95,
      fontSize: 10.5, color: "C8D8F0", fontFace: "Arial",
    }
  );

  // Perspectives
  s.addText("Perspectives", {
    x: 0.4, y: 3.12, w: 3.0, h: 0.38,
    fontSize: 13, bold: true, color: WHITE, fontFace: "Cambria",
  });

  const perspectives = [
    { icon: "📱", title: "Application mobile PNC", desc: "Interface dédiée au personnel navigant pour le scoring en vol depuis smartphone." },
    { icon: "🤖", title: "Détection prédictive des retards", desc: "Modèle ML intégré pour anticiper les retards selon l'historique et la météo." },
    { icon: "🔗", title: "Intégration systèmes RAM", desc: "Connexion avec le système de réservation existant de Royal Air Maroc (Amadeus)." },
  ];

  perspectives.forEach((p, i) => {
    const x = 0.35 + i * 3.17;
    addCard(s, x, 3.6, 3.0, 1.68, NAVY2);
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.18, y: 3.72, w: 0.5, h: 0.5,
      fill: { color: RAM_RED },
    });
    s.addText(p.icon, {
      x: x + 0.18, y: 3.72, w: 0.5, h: 0.5,
      fontSize: 16, align: "center", valign: "middle", margin: 0,
    });
    s.addText(p.title, {
      x: x + 0.78, y: 3.72, w: 2.12, h: 0.5,
      fontSize: 10.5, bold: true, color: WHITE, fontFace: "Cambria",
    });
    s.addText(p.desc, {
      x: x + 0.18, y: 4.28, w: 2.72, h: 0.9,
      fontSize: 9, color: "A0B4CC", fontFace: "Arial",
    });
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 13 — Merci
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: NAVY };

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 5.625,
    fill: { color: RAM_RED, transparency: 92 },
    line: { color: RAM_RED, transparency: 92 },
  });

  s.addImage({
    path: ramLogoPath,
    x: 4.3, y: 0.5, w: 1.4, h: 1.0,
    sizing: { type: "contain", w: 1.4, h: 1.0 },
  });

  s.addText("Merci pour votre attention", {
    x: 0.5, y: 1.7, w: 9.0, h: 0.85,
    fontSize: 32, bold: true, color: WHITE, fontFace: "Cambria", align: "center",
  });

  s.addShape(pres.shapes.LINE, {
    x: 3.5, y: 2.65, w: 3.0, h: 0,
    line: { color: RAM_RED, width: 2 },
  });

  s.addText("Questions ?", {
    x: 0.5, y: 2.8, w: 9.0, h: 0.55,
    fontSize: 16, color: "A0B4CC", fontFace: "Arial", align: "center", italic: true,
  });

  s.addText("Ahmed Nejbat  ·  ahmed.nejbat@emsi-edu.ma", {
    x: 0.5, y: 3.55, w: 9.0, h: 0.38,
    fontSize: 11, color: MID_GRAY, fontFace: "Arial", align: "center",
  });
  s.addText("Encadrants : Mr M.Elhakiki  ·  Mr I.Karim", {
    x: 0.5, y: 3.95, w: 9.0, h: 0.35,
    fontSize: 11, color: MID_GRAY, fontFace: "Arial", align: "center",
  });
  s.addText("EMSI  ·  Année 2025–2026", {
    x: 0.5, y: 4.35, w: 9.0, h: 0.35,
    fontSize: 10, color: "4a5a70", fontFace: "Arial", align: "center",
  });
}

// ── Write file ────────────────────────────────────────────────────────────────
const outPath = "C:/Users/AHMED/Downloads/PFE_CabineIQ_Ahmed_Nejbat.pptx";
pres.writeFile({ fileName: outPath }).then(() => {
  console.log("✅ Done:", outPath);
}).catch((e) => {
  console.error("❌ Error:", e);
});
