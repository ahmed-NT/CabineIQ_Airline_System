const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
        LevelFormat, PageBreak } = require("docx");

const border = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function headerCell(text, width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: { fill: "D9E2F3", type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, font: "Times New Roman", size: 22 })] })]
  });
}

function cell(text, width, bold) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, font: "Times New Roman", size: 22, bold: !!bold })] })]
  });
}

function p(text, opts) {
  opts = opts || {};
  const runs = [];
  if (typeof text === "string") {
    runs.push(new TextRun({ text, font: "Times New Roman", size: 24, ...opts }));
  } else {
    text.forEach(function(t) { runs.push(new TextRun({ font: "Times New Roman", size: 24, ...t })); });
  }
  return new Paragraph({ spacing: { after: 120, line: 276 }, alignment: AlignmentType.JUSTIFIED, children: runs });
}

function heading(text, level) {
  return new Paragraph({
    heading: level,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, font: "Times New Roman", bold: true,
      size: level === HeadingLevel.HEADING_1 ? 32 : level === HeadingLevel.HEADING_2 ? 28 : 24 })]
  });
}

function boldParagraph(boldText, normalText) {
  return p([{ text: boldText, bold: true }, { text: normalText }]);
}

function dashItem(boldText, normalText) {
  return new Paragraph({
    numbering: { reference: "dash", level: 0 },
    spacing: { after: 80, line: 276 },
    alignment: AlignmentType.JUSTIFIED,
    children: [
      new TextRun({ text: boldText, bold: true, font: "Times New Roman", size: 24 }),
      new TextRun({ text: normalText, font: "Times New Roman", size: 24 })
    ]
  });
}

var comparisonRows = [
  ["Visualisation interactive des cabines", "Non", "Non", "Non", "Oui"],
  ["Gestion unifiee cabine/vol/passager", "Partiel", "Non", "Non", "Oui"],
  ["Scoring qualite sieges par equipage", "Non", "Non", "Non", "Oui"],
  ["Signalement objets perdus", "Non", "Non", "Non", "Oui"],
  ["Feedback lie au contexte du vol", "Non", "Non", "Partiel", "Oui"],
  ["Prediction ML (score d'achat)", "Non", "Non", "Non", "Oui (XGBoost)"],
  ["Assistant conversationnel IA", "Non", "Non", "Non", "Oui (Claude API)"],
  ["Architecture microservices", "Non", "Partiel", "Oui", "Oui"],
  ["Mises a jour temps reel (WebSocket)", "Non", "Non", "Non", "Oui"],
  ["Personnalisable / code interne", "Non", "Non", "Non", "Oui"],
];

var serviceRows = [
  ["Discovery Service", "8761", "Registre de services (Netflix Eureka)"],
  ["API Gateway", "8080", "Point d'entree unique, routage, validation JWT"],
  ["Auth Service", "8085", "Authentification, gestion des utilisateurs, emission des tokens JWT"],
  ["Aircraft Service", "8081", "CRUD des appareils (code IATA, modele, nombre de sieges)"],
  ["Seat Service", "8082", "Configuration des cabines, plans de sieges, scoring qualite, WebSocket"],
  ["Passenger Service", "8083", "Gestion des passagers et de leurs affectations"],
  ["Flight Service", "8084", "Gestion des vols, statuts, liaisons avec passagers"],
  ["Feedback Service", "8086", "Collecte et stockage des enquetes de satisfaction"],
  ["Notification Service", "8089", "Envoi d'e-mails et de notifications"],
  ["AI Service", "8088", "Integration de l'API Claude pour le chatbot"],
  ["ML Service (Python)", "8087", "Modele XGBoost pour la prediction de prix"],
];

var doc = new Document({
  styles: {
    default: { document: { run: { font: "Times New Roman", size: 24 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Times New Roman" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Times New Roman" },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Times New Roman" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  numbering: {
    config: [
      { reference: "dash", levels: [{ level: 0, format: LevelFormat.BULLET, text: "—", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      // ===== SECTION 1: PROBLEMATIQUE =====
      heading("1.3 Problematique", HeadingLevel.HEADING_1),

      p("La gestion operationnelle des cabines d'avion au sein de Royal Air Maroc repose actuellement sur un ensemble d'outils heterogenes, developpes a des periodes differentes et pour des besoins specifiques. Cette fragmentation se manifeste a plusieurs niveaux :"),

      boldParagraph("Fragmentation des systemes d'information : ", "Les agents operationnels doivent jongler entre plusieurs applications distinctes pour accomplir des taches pourtant interconnectees. La consultation de l'occupation des sieges, la localisation d'un passager, le suivi du statut d'un vol et l'acces aux indicateurs analytiques necessitent chacun un outil different, souvent avec des interfaces et des authentifications separees. Cette multiplicite des points d'entree genere des pertes de temps considerables et augmente le risque d'erreurs humaines."),

      boldParagraph("Absence de visualisation en temps reel : ", "Les plans de cabine ne sont pas accessibles de maniere dynamique et interactive. Les agents ne disposent pas d'une vue synthetique permettant de visualiser instantanement l'etat d'occupation d'un avion, la repartition des classes (Business, Premium Economy, Economy) ou le positionnement precis d'un passager. Cette lacune est particulierement critique lors des phases d'embarquement, de gestion des correspondances ou de reaffectation de sieges en cas d'irregularites."),

      boldParagraph("Manque d'intelligence decisionnelle : ", "Les systemes existants de RAM sont essentiellement transactionnels. Ils permettent d'enregistrer et de consulter des donnees, mais n'offrent aucune capacite d'analyse predictive. Les agents ne peuvent pas anticiper les comportements des passagers (propension au rachat, sensibilite au prix) ni beneficier d'une assistance conversationnelle intelligente pour repondre rapidement aux questions operationnelles courantes."),

      boldParagraph("Absence de suivi de la qualite cabine : ", "Il n'existe pas de processus numerise permettant au personnel navigant (equipage) d'evaluer l'etat de proprete des sieges apres un vol, ni de signaler les objets perdus de maniere structuree. Ce manque de tracabilite empeche toute analyse systematique de la qualite de service en cabine et retarde la restitution des objets trouves aux passagers."),

      boldParagraph("Collecte limitee du feedback passager : ", "Les enquetes de satisfaction existantes sont generiques et deconnectees du contexte du vol. Elles ne permettent pas de lier directement le feedback d'un passager a son vol, son siege ou son experience specifique, ce qui limite considerablement la valeur analytique des retours collectes."),

      p("Face a ces constats, la problematique centrale de notre projet est la suivante :"),

      new Paragraph({
        spacing: { before: 120, after: 120, line: 276 },
        indent: { left: 720, right: 720 },
        alignment: AlignmentType.JUSTIFIED,
        children: [new TextRun({ text: "Comment concevoir et developper une plateforme interne unifiee, securisee et intelligente, permettant aux agents operationnels de Royal Air Maroc de centraliser la gestion des cabines, des vols et des passagers, tout en integrant des capacites analytiques, de scoring cabine et d'assistance par intelligence artificielle ?", font: "Times New Roman", size: 24, italics: true })]
      }),

      // ===== PAGE BREAK =====
      new Paragraph({ children: [new PageBreak()] }),

      // ===== SECTION 2: ETUDE DE L'EXISTANT =====
      heading("1.4 Etude de l'Existant", HeadingLevel.HEADING_1),

      p("Avant de concevoir notre solution, il convient d'analyser les outils et approches existants, tant au sein de RAM qu'au niveau du marche, afin d'identifier les lacunes a combler et de justifier les choix techniques retenus."),

      heading("1.4.1 Outils internes existants chez RAM", HeadingLevel.HEADING_2),

      p("Royal Air Maroc utilise actuellement plusieurs systemes pour la gestion operationnelle :"),

      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2500, 3263, 3263],
        rows: [
          new TableRow({ children: [
            headerCell("Systeme", 2500),
            headerCell("Fonction", 3263),
            headerCell("Limites", 3263),
          ]}),
          new TableRow({ children: [
            cell("DCS (Departure Control System)", 2500, true),
            cell("Gestion de l'embarquement et attribution des sieges", 3263),
            cell("Interface vieillissante, pas de visualisation graphique de la cabine, acces limite aux agents au sol", 3263),
          ]}),
          new TableRow({ children: [
            cell("PSS (Passenger Service System)", 2500, true),
            cell("Reservation et gestion des passagers", 3263),
            cell("Systeme proprietaire (Amadeus Altea), peu flexible pour les besoins internes specifiques", 3263),
          ]}),
          new TableRow({ children: [
            cell("Outils internes de suivi des vols", 2500, true),
            cell("Monitoring du statut des vols", 3263),
            cell("Pas d'integration avec la vue cabine, donnees non exploitees pour l'analytique", 3263),
          ]}),
          new TableRow({ children: [
            cell("Rapports manuels equipage", 2500, true),
            cell("Signalement de problemes cabine", 3263),
            cell("Processus papier ou e-mail, aucune tracabilite structuree", 3263),
          ]}),
        ]
      }),

      new Paragraph({ spacing: { after: 80 }, children: [] }),
      p("Ces systemes fonctionnent en silos : il n'existe pas de plateforme unifiee permettant de croiser les donnees cabine, passager et vol dans une interface unique."),

      heading("1.4.2 Solutions du marche", HeadingLevel.HEADING_2),

      p([{ text: "a) Amadeus Altea Suite", bold: true }]),
      p("Altea est le systeme PSS le plus repandu dans l'industrie aerienne. Il couvre la reservation, l'inventaire et le controle des departs. Cependant, Altea est un systeme generique concu pour l'ensemble des compagnies aeriennes et ne propose pas de module de visualisation interactive des cabines ni d'integration d'intelligence artificielle pour l'aide a la decision operationnelle. Son cout de personnalisation est tres eleve."),

      p([{ text: "b) SITA AirportConnect / BoardConnect", bold: true }]),
      p("SITA propose des solutions de connectivite aeroportuaire et de gestion des passagers. Bien que performantes pour le suivi des flux passagers, ces solutions ne couvrent pas la configuration dynamique des cabines ni le scoring de qualite par l'equipage. Elles restent orientees vers la gestion aeroportuaire plutot que la gestion operationnelle interne."),

      p([{ text: "c) Flightdeck / IBS iCargo", bold: true }]),
      p("Ces solutions se concentrent sur des aspects specifiques (operations de vol, fret) et n'offrent pas de vision integree cabine-passager-vol. Elles ne disposent pas non plus de fonctionnalites predictives basees sur le Machine Learning."),

      p([{ text: "d) Solutions SaaS de feedback passager (Medallia, Qualtrics)", bold: true }]),
      p("Ces plateformes permettent de collecter le feedback client, mais de maniere generique sans lien direct avec le contexte du vol (numero de vol, siege, classe). Elles ne sont pas integrees aux systemes operationnels de la compagnie et ne permettent pas de calculer un score d'intention d'achat en temps reel."),

      heading("1.4.3 Tableau comparatif synthetique", HeadingLevel.HEADING_2),

      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2800, 1400, 1200, 1826, 1800],
        rows: [
          new TableRow({ children: [
            headerCell("Critere", 2800),
            headerCell("Altea", 1400),
            headerCell("SITA", 1200),
            headerCell("Medallia", 1826),
            headerCell("CabineIQ", 1800),
          ]}),
          ...comparisonRows.map(function(row) {
            return new TableRow({ children: [
              cell(row[0], 2800), cell(row[1], 1400), cell(row[2], 1200), cell(row[3], 1826),
              new TableCell({
                borders, width: { size: 1800, type: WidthType.DXA }, margins: cellMargins,
                shading: { fill: "E2EFDA", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: row[4], font: "Times New Roman", size: 22, bold: true })] })]
              })
            ]});
          })
        ]
      }),

      new Paragraph({ spacing: { after: 80 }, children: [] }),

      heading("1.4.4 Synthese et positionnement de CabineIQ", HeadingLevel.HEADING_2),

      p("L'analyse de l'existant revele qu'aucune solution du marche ne repond de maniere integree a l'ensemble des besoins identifies. Les systemes commerciaux sont soit trop generiques, soit trop specialises, et aucun ne combine la visualisation interactive des cabines, le scoring de qualite en temps reel, l'analytique predictive et l'assistance conversationnelle dans une plateforme unifiee."),

      p("CabineIQ se positionne comme une solution sur mesure, developpee specifiquement pour les besoins operationnels de RAM, avec les avantages suivants :"),

      dashItem("Maitrise totale", " : code source interne, evolutif selon les besoins de la DSI"),
      dashItem("Integration verticale", " : une seule plateforme couvrant tous les aspects operationnels"),
      dashItem("Intelligence artificielle", " : ML pour la prediction, LLM pour l'assistance conversationnelle"),
      dashItem("Modernite architecturale", " : microservices, API Gateway, decouverte de services, temps reel"),

      // ===== PAGE BREAK =====
      new Paragraph({ children: [new PageBreak()] }),

      // ===== SECTION 3: SOLUTION PROPOSEE =====
      heading("1.5 Solution Proposee : CabineIQ", HeadingLevel.HEADING_1),

      p("Pour repondre a la problematique identifiee, nous avons concu et developpe CabineIQ, un systeme centralise de configuration et de visualisation des sieges d'avion, enrichi de capacites d'intelligence artificielle."),

      heading("1.5.1 Vue d'ensemble de la solution", HeadingLevel.HEADING_2),

      p("CabineIQ est une application web interne destinee aux agents operationnels et au personnel navigant de Royal Air Maroc. Elle centralise dans une interface unique l'ensemble des fonctionnalites aujourd'hui dispersees entre plusieurs outils :"),

      dashItem("Visualisation dynamique des cabines", " : representation graphique interactive des plans de cabine avec affichage en temps reel de l'occupation des sieges, distinction par classe (Business, Premium Economy, Economy) et par statut (libre, occupe, indisponible)."),
      dashItem("Gestion des vols et des passagers", " : consultation du statut des vols, localisation rapide des passagers par nom avec mise en surbrillance de leur siege sur le plan de cabine."),
      dashItem("Scoring de qualite par l'equipage (Seat Scoring)", " : fonctionnalite permettant au personnel navigant (role CREW) d'evaluer la proprete de chaque siege sur une echelle de 1 a 5 etoiles apres un vol, avec possibilite de signaler un objet perdu et d'en fournir une description. Les scores s'affichent sous forme d'etoiles directement sur le plan de cabine, et les mises a jour sont diffusees en temps reel via WebSocket."),
      dashItem("Enquete de satisfaction contextualisee", " : questionnaire multi-etapes accessible par QR code, lie au vol et au siege du passager, permettant de calculer un score d'intention d'achat (Purchase Intent Score) en temps reel."),
      dashItem("Prediction par Machine Learning", " : un modele XGBoost entraine sur les donnees de feedback predit un multiplicateur de prix dynamique, permettant d'adapter les offres commerciales en fonction du profil du passager."),
      dashItem("Assistant conversationnel intelligent", " : chatbot propulse par l'API Claude d'Anthropic, capable de repondre aux questions operationnelles des agents en langage naturel en interrogeant directement les donnees du systeme via l'API Gateway."),
      dashItem("Gestion des utilisateurs et des roles", " : systeme d'authentification JWT avec trois roles distincts (ADMIN, USER, CREW), chacun ayant des permissions specifiques dans l'interface."),

      heading("1.5.2 Architecture technique", HeadingLevel.HEADING_2),

      p([{ text: "La solution repose sur une " }, { text: "architecture microservices", bold: true }, { text: " composee de neuf services Spring Boot independants :" }]),

      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [2600, 900, 5526],
        rows: [
          new TableRow({ children: [
            headerCell("Service", 2600),
            headerCell("Port", 900),
            headerCell("Responsabilite", 5526),
          ]}),
          ...serviceRows.map(function(row) {
            return new TableRow({ children: [
              cell(row[0], 2600, true), cell(row[1], 900), cell(row[2], 5526)
            ]});
          })
        ]
      }),

      new Paragraph({ spacing: { after: 80 }, children: [] }),

      p([{ text: "Le frontend est developpe en " }, { text: "React 19 + TypeScript + Tailwind CSS", bold: true }, { text: ", deploye via nginx dans un conteneur Docker. L'ensemble de l'infrastructure est contenerise avec " }, { text: "Docker Compose", bold: true }, { text: ", permettant un deploiement reproductible en une seule commande." }]),

      heading("1.5.3 Points forts differenciants", HeadingLevel.HEADING_2),

      dashItem("Temps reel", " : les scores de qualite des sieges sont diffuses instantanement via WebSocket (STOMP/SockJS), sans rechargement de page."),
      dashItem("IA hybride", " : combinaison de Machine Learning classique (XGBoost) pour la prediction quantitative et de LLM (Claude) pour l'assistance conversationnelle."),
      dashItem("Role CREW dedie", " : interface adaptee au personnel navigant, avec acces restreint aux seules fonctionnalites de scoring."),
      dashItem("Deploiement contenerise", " : Docker Compose orchestre les 12 services, avec health checks et dependances ordonnees."),
      dashItem("Securite", " : authentification centralisee par JWT, validation au niveau de l'API Gateway, roles et permissions granulaires."),
    ]
  }]
});

Packer.toBuffer(doc).then(function(buffer) {
  fs.writeFileSync("C:\\Users\\AHMED\\cursor-projects\\PFE26-new\\rapport_sections.docx", buffer);
  console.log("Document created successfully at rapport_sections.docx");
});
