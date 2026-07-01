const pptxgen = require("pptxgenjs");
const fs = require("fs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";

const RAM_RED    = "C41E3A";
const NAVY       = "07162C";
const NAVY2      = "0A1E38";
const WHITE      = "FFFFFF";
const LIGHT_GRAY = "F4F6FA";
const MID_GRAY   = "8A9AB5";
const DARK_TEXT  = "1A2340";

const ramLogoPath = "C:/Users/AHMED/cursor-projects/PFE26-new/frontend-new/public/ram-logo.png";

function addHeader(slide, dark = false) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.65,
    fill: { color: dark ? NAVY : WHITE },
    line: { color: dark ? NAVY2 : "E0E5EF", width: 1 },
  });
  slide.addImage({
    path: ramLogoPath,
    x: 9.0, y: 0.05, w: 0.75, h: 0.55,
    sizing: { type: "contain", w: 0.75, h: 0.55 },
  });
  slide.addText("EMSI", {
    x: 0.15, y: 0.1, w: 1.2, h: 0.45,
    fontSize: 11, bold: true, color: dark ? WHITE : NAVY,
    fontFace: "Arial", valign: "middle",
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 1 — Architecture Technique
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  addHeader(s, true);

  s.addText("Architecture Technique — Microservices", {
    x: 0.4, y: 0.75, w: 9.2, h: 0.48,
    fontSize: 20, bold: true, color: WHITE, fontFace: "Cambria",
  });

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

  function arrowV(x, y1, y2) {
    s.addShape(pres.shapes.LINE, { x, y: y1, w: 0, h: y2 - y1, line: { color: "2A5070", width: 1.2 } });
  }

  // Row 1: Client → Nginx → Eureka
  svcBox(0.18, 1.38, 1.35, 0.75, "🌐 Client", "React + Vite\nTypeScript", "102040");

  s.addShape(pres.shapes.LINE, { x: 1.53, y: 1.75, w: 0.82, h: 0, line: { color: "2A5070", width: 1.2 } });

  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 2.35, y: 1.3, w: 1.6, h: 0.9,
    fill: { color: RAM_RED, transparency: 10 },
    line: { color: RAM_RED, width: 1.5 },
    rectRadius: 0.07,
  });
  s.addText("Nginx", { x: 2.35, y: 1.3, w: 1.6, h: 0.42, fontSize: 9.5, bold: true, color: WHITE, align: "center", valign: "middle", fontFace: "Arial", margin: 0 });
  s.addText("API Gateway\nLoad Balancer", { x: 2.35, y: 1.72, w: 1.6, h: 0.46, fontSize: 7, color: "FFB0B0", align: "center", fontFace: "Arial", margin: 0 });

  s.addShape(pres.shapes.LINE, { x: 3.95, y: 1.75, w: 0.75, h: 0, line: { color: "2A5070", width: 1.2 } });

  svcBox(4.7, 1.3, 1.55, 0.9, "⬡ Eureka", "Service Discovery\nService Registry", "0A2A1A");

  // Docker + Spring Boot info boxes
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

  // Row 2: 7 microservices
  const svcs = [
    { label: "auth-\nservice",      sub: ":8081\nJWT / Users" },
    { label: "aircraft-\nservice",  sub: ":8082\nFlotte" },
    { label: "passenger-\nservice", sub: ":8083\nPassagers" },
    { label: "flight-\nservice",    sub: ":8084\nVols + Scheduler" },
    { label: "seat-\nservice",      sub: ":8085\nSièges + Scoring" },
    { label: "notif-\nservice",     sub: ":8089\nEmail Alerts" },
    { label: "ai-\nservice",        sub: ":8086\nClaude AI" },
  ];

  const sW = 1.2, sH = 0.85, sGap = 0.12;
  const totalW = svcs.length * sW + (svcs.length - 1) * sGap;
  const sStartX = (10 - totalW) / 2;
  const sY = 2.52;

  // Horizontal bus line
  s.addShape(pres.shapes.LINE, {
    x: sStartX + sW / 2, y: 2.2,
    w: (svcs.length - 1) * (sW + sGap), h: 0,
    line: { color: "2A5070", width: 1.2 },
  });
  s.addShape(pres.shapes.LINE, { x: 3.15, y: 2.2, w: 0, h: 0.32, line: { color: "2A5070", width: 1.2 } });

  svcs.forEach((svc, i) => {
    const sx = sStartX + i * (sW + sGap);
    svcBox(sx, sY, sW, sH, svc.label, svc.sub, "0F2A40");
    arrowV(sx + sW / 2, 2.2, sY);
  });

  // Row 3: databases
  const dbY = 3.6;
  [0, 1, 2, 3, 4].forEach((i) => {
    const sx = sStartX + i * (sW + sGap);
    arrowV(sx + sW / 2, sY + sH, dbY);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: sx + 0.1, y: dbY, w: sW - 0.2, h: 0.62,
      fill: { color: "051528" },
      line: { color: "0E6DA0", width: 1 },
      rectRadius: 0.05,
    });
    s.addText("🗄 MySQL", { x: sx + 0.1, y: dbY + 0.04, w: sW - 0.2, h: 0.3, fontSize: 7.5, color: "38AADD", align: "center", fontFace: "Arial", margin: 0 });
    s.addText(["auth", "aircraft", "passenger", "flight", "seat"][i] + "_db", { x: sx + 0.1, y: dbY + 0.32, w: sW - 0.2, h: 0.25, fontSize: 6.5, color: "4A6880", align: "center", fontFace: "Arial", margin: 0 });
  });

  // Notif → SMTP
  const notifX = sStartX + 5 * (sW + sGap);
  arrowV(notifX + sW / 2, sY + sH, dbY);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: notifX + 0.1, y: dbY, w: sW - 0.2, h: 0.62,
    fill: { color: "1A0A0A" }, line: { color: "CC3322", width: 1 }, rectRadius: 0.05,
  });
  s.addText("✉ SMTP\nGmail", { x: notifX + 0.1, y: dbY + 0.04, w: sW - 0.2, h: 0.55, fontSize: 7.5, color: "FF8870", align: "center", fontFace: "Arial", margin: 0 });

  // AI → Claude API
  const aiX = sStartX + 6 * (sW + sGap);
  arrowV(aiX + sW / 2, sY + sH, dbY);
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: aiX + 0.1, y: dbY, w: sW - 0.2, h: 0.62,
    fill: { color: "0D0A1A" }, line: { color: "7755CC", width: 1 }, rectRadius: 0.05,
  });
  s.addText("🤖 Claude\nAnthropic API", { x: aiX + 0.1, y: dbY + 0.04, w: sW - 0.2, h: 0.55, fontSize: 7.5, color: "AA88EE", align: "center", fontFace: "Arial", margin: 0 });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SLIDE 2 — Technologies Utilisées
// ═══════════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: LIGHT_GRAY };
  addHeader(s, false);

  s.addText("Technologies Utilisées", {
    x: 0.4, y: 0.75, w: 9.2, h: 0.48,
    fontSize: 20, bold: true, color: DARK_TEXT, fontFace: "Cambria",
  });

  const techs = [
    // Row 1 — Frontend
    { label: "React",        sub: "UI Library",             bg: "E8F6FE", acc: "0FA3D4", emoji: "⚛" },
    { label: "TypeScript",   sub: "Static typing",          bg: "E8EEFE", acc: "3178C6", emoji: "TS" },
    { label: "Tailwind CSS", sub: "Utility-first CSS",      bg: "E8FEFA", acc: "06B6D4", emoji: "🌬" },
    { label: "Vite",         sub: "Build tool",             bg: "F5E8FE", acc: "9333EA", emoji: "⚡" },
    { label: "React Query",  sub: "Server state mgmt",      bg: "FFF0E8", acc: "FF4154", emoji: "🔄" },
    // Row 2 — Backend
    { label: "Spring Boot",  sub: "Java framework",         bg: "F0FBE8", acc: "6DB33F", emoji: "🍃" },
    { label: "Spring AI",    sub: "AI integration",         bg: "F0F4FE", acc: "4C6EF5", emoji: "🤖" },
    { label: "JWT Auth",     sub: "Security / Roles",       bg: "FEF8E8", acc: "F59E0B", emoji: "🔐" },
    { label: "MySQL",        sub: "Relational database",    bg: "E8F0FE", acc: "1565C0", emoji: "🗄" },
    { label: "Eureka",       sub: "Service discovery",      bg: "FEE8E8", acc: "C41E3A", emoji: "⬡" },
    // Row 3 — Infra & AI
    { label: "Docker",       sub: "Containerization",       bg: "E8F4FE", acc: "2496ED", emoji: "🐳" },
    { label: "Nginx",        sub: "API Gateway / Proxy",    bg: "E8FEF0", acc: "009639", emoji: "🔀" },
    { label: "Claude AI",    sub: "Anthropic LLM",          bg: "F0E8FE", acc: "7C3AED", emoji: "✦" },
    { label: "Maven",        sub: "Build & Dependency",     bg: "FEF0E8", acc: "D14836", emoji: "📦" },
    { label: "Java 17",      sub: "Backend runtime",        bg: "FFF8E8", acc: "E76F00", emoji: "☕" },
  ];

  const cols = 5, cardW = 1.72, cardH = 0.9, gapX = 0.1, gapY = 0.12;
  const startX = 0.35, startY = 1.38;

  techs.forEach((t, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);

    s.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x, y, w: cardW, h: cardH,
      fill: { color: t.bg },
      line: { color: "D0D8E8", width: 1 },
      rectRadius: 0.08,
      shadow: { type: "outer", color: "000000", blur: 5, offset: 1, angle: 45, opacity: 0.08 },
    });

    // Left accent strip
    s.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 0.2, h: cardH,
      fill: { color: t.acc },
      line: { color: t.acc },
    });

    // Icon circle
    s.addShape(pres.shapes.OVAL, {
      x: x + 0.28, y: y + 0.18, w: 0.46, h: 0.46,
      fill: { color: "FFFFFF" },
      line: { color: "D0D8E8", width: 1 },
    });
    s.addText(t.emoji, {
      x: x + 0.28, y: y + 0.18, w: 0.46, h: 0.46,
      fontSize: 14, align: "center", valign: "middle", margin: 0,
    });

    s.addText(t.label, {
      x: x + 0.82, y: y + 0.12, w: cardW - 0.9, h: 0.38,
      fontSize: 10, bold: true, color: DARK_TEXT, fontFace: "Arial", valign: "middle",
    });
    s.addText(t.sub, {
      x: x + 0.82, y: y + 0.5, w: cardW - 0.9, h: 0.3,
      fontSize: 8.5, color: MID_GRAY, fontFace: "Arial",
    });
  });

  // Row labels on right
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

// ── Write file ────────────────────────────────────────────────────────────────
const outPath = "C:/Users/AHMED/Downloads/PFE_Architecture_Technologies.pptx";
pres.writeFile({ fileName: outPath }).then(() => {
  console.log("✅ Done:", outPath);
}).catch((e) => console.error("❌", e));
