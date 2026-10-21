const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Stamp = require('../models/Stamp');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Perforated stamp template generator
function createStampSVG({
  title,
  country,
  year,
  denomination,
  primaryColor = '#8b4513',
  secondaryColor = '#f5e6d3',
  accentColor = '#d4af37',
  artworkSvg,
  postmarkText = 'NEW DELHI G.P.O. · 1948'
}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 480" width="400" height="480">
  <defs>
    <!-- Perforated outer border pattern -->
    <filter id="shadow" x="-5%" y="-5%" width="115%" height="115%">
      <feDropShadow dx="3" dy="6" stdDeviation="5" flood-color="#000" flood-opacity="0.45"/>
    </filter>
    <radialGradient id="paperGrad" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="${secondaryColor}"/>
      <stop offset="100%" stop-color="#dfcaa9"/>
    </radialGradient>
    <linearGradient id="vignette" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}"/>
      <stop offset="100%" stop-color="#1a120b"/>
    </linearGradient>
    <!-- Perforation cutouts -->
    <mask id="perforations">
      <rect x="0" y="0" width="400" height="480" fill="white"/>
      <!-- Top & Bottom perfs -->
      ${Array.from({ length: 19 }, (_, i) => `<circle cx="${20 + i * 20}" cy="0" r="6" fill="black"/><circle cx="${20 + i * 20}" cy="480" r="6" fill="black"/>`).join('')}
      <!-- Left & Right perfs -->
      ${Array.from({ length: 23 }, (_, i) => `<circle cx="0" cy="${20 + i * 20}" r="6" fill="black"/><circle cx="400" cy="${20 + i * 20}" r="6" fill="black"/>`).join('')}
    </mask>
  </defs>

  <!-- Stamp Paper with Perforations -->
  <g mask="url(#perforations)" filter="url(#shadow)">
    <rect x="0" y="0" width="400" height="480" fill="url(#paperGrad)"/>
    
    <!-- Outer Engraved Border Frame -->
    <rect x="18" y="18" width="364" height="444" fill="none" stroke="${primaryColor}" stroke-width="2"/>
    <rect x="22" y="22" width="356" height="436" fill="none" stroke="${primaryColor}" stroke-width="6"/>
    <rect x="30" y="30" width="340" height="420" fill="none" stroke="${accentColor}" stroke-width="1.5" stroke-dasharray="4,2"/>
    
    <!-- Top Header Ribbon -->
    <path d="M 32 32 L 368 32 L 368 76 L 32 76 Z" fill="url(#vignette)"/>
    <text x="200" y="55" font-family="'Georgia', serif" font-size="19" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="4">
      ${country.toUpperCase()} POSTAGE
    </text>
    <text x="200" y="70" font-family="'Georgia', serif" font-size="9" font-weight="700" fill="${accentColor}" text-anchor="middle" letter-spacing="2">
      ★ COMMEMORATIVE SERIES ★
    </text>

    <!-- Central Vignette Box -->
    <rect x="42" y="86" width="316" height="294" fill="url(#vignette)" stroke="${accentColor}" stroke-width="2" rx="4"/>
    <rect x="46" y="90" width="308" height="286" fill="none" stroke="#ffffff" stroke-opacity="0.3" stroke-width="1"/>
    
    <!-- Central Artwork -->
    <g transform="translate(42, 86)">
      ${artworkSvg}
    </g>

    <!-- Bottom Denomination & Ribbon -->
    <path d="M 32 390 L 368 390 L 368 448 L 32 448 Z" fill="url(#vignette)"/>
    <text x="200" y="420" font-family="'Georgia', serif" font-size="24" font-weight="900" fill="${accentColor}" text-anchor="middle" letter-spacing="2">
      ${denomination.toUpperCase()}
    </text>
    <text x="200" y="438" font-family="'Georgia', serif" font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="3">
      ISSUE OF ${year}
    </text>

    <!-- Authentic Postal Ink Postmark / Cancellation Stamp -->
    <g transform="translate(290, 110) rotate(-22)" opacity="0.75">
      <circle cx="0" cy="0" r="42" fill="none" stroke="#2c1d11" stroke-width="2.5"/>
      <circle cx="0" cy="0" r="38" fill="none" stroke="#2c1d11" stroke-width="1" stroke-dasharray="3,2"/>
      <line x1="-36" y1="-8" x2="36" y2="-8" stroke="#2c1d11" stroke-width="1.5"/>
      <line x1="-38" y1="8" x2="38" y2="8" stroke="#2c1d11" stroke-width="1.5"/>
      <text x="0" y="-14" font-family="'Courier New', monospace" font-size="7.5" font-weight="bold" fill="#2c1d11" text-anchor="middle" letter-spacing="1.5">
        ${postmarkText}
      </text>
      <text x="0" y="3" font-family="'Courier New', monospace" font-size="9" font-weight="bold" fill="#2c1d11" text-anchor="middle">
        15 AUG ${year}
      </text>
      <text x="0" y="24" font-family="'Courier New', monospace" font-size="8" font-weight="bold" fill="#2c1d11" text-anchor="middle">
        DELIVERY
      </text>
      <!-- Wavy cancellation lines -->
      <path d="M 44 -15 Q 60 -25 76 -15 T 108 -15 M 44 0 Q 60 -10 76 0 T 108 0 M 44 15 Q 60 5 76 15 T 108 15" fill="none" stroke="#2c1d11" stroke-width="2"/>
    </g>
  </g>
</svg>`;
}

// 1. Mahatma Gandhi 1948
const gandhiSvg = createStampSVG({
  title: 'Mahatma Gandhi 10 Rupees',
  country: 'India',
  year: 1948,
  denomination: '10 Rs. / १० रुपये',
  primaryColor: '#5c3317',
  secondaryColor: '#f7ede2',
  accentColor: '#e0a96d',
  artworkSvg: `
    <!-- Sunburst behind portrait -->
    <circle cx="158" cy="147" r="110" fill="#84481d" opacity="0.6"/>
    <circle cx="158" cy="147" r="85" fill="#fdf6ee"/>
    <!-- Gandhi Portrait Drawing -->
    <g transform="translate(158, 142) scale(0.95)">
      <!-- Head / Bald silhouette with spectacles -->
      <path d="M -45 -10 C -48 -60 48 -60 45 -10 C 45 40 20 60 0 65 C -20 60 -45 40 -45 -10 Z" fill="#edd6bf" stroke="#4a250d" stroke-width="2"/>
      <!-- Ears -->
      <path d="M -45 -15 C -55 -15 -55 10 -45 15 Z" fill="#e0c2a6" stroke="#4a250d" stroke-width="1.5"/>
      <path d="M 45 -15 C 55 -15 55 10 45 15 Z" fill="#e0c2a6" stroke="#4a250d" stroke-width="1.5"/>
      <!-- Spectacles round wire -->
      <circle cx="-16" cy="-8" r="14" fill="none" stroke="#2d1506" stroke-width="2.5"/>
      <circle cx="16" cy="-8" r="14" fill="none" stroke="#2d1506" stroke-width="2.5"/>
      <line x1="-2" y1="-8" x2="2" y2="-8" stroke="#2d1506" stroke-width="2.5"/>
      <!-- Eyes behind glasses -->
      <circle cx="-16" cy="-8" r="3" fill="#2d1506"/>
      <circle cx="16" cy="-8" r="3" fill="#2d1506"/>
      <!-- Nose -->
      <path d="M 0 -8 L -3 14 L 4 14" fill="none" stroke="#5c3317" stroke-width="2"/>
      <!-- Mustache & Smile -->
      <path d="M -18 24 Q 0 32 18 24" fill="none" stroke="#4a250d" stroke-width="2.5"/>
      <path d="M -12 36 Q 0 42 12 36" fill="none" stroke="#5c3317" stroke-width="2"/>
      <!-- Khadi shawl draped -->
      <path d="M -75 75 Q -30 40 0 70 Q 30 40 75 75 L 75 110 L -75 110 Z" fill="#fdfaf6" stroke="#4a250d" stroke-width="2"/>
    </g>
    <!-- Label -->
    <rect x="30" y="250" width="256" height="30" fill="#2a1405" rx="3"/>
    <text x="158" y="271" font-family="'Georgia', serif" font-size="14" font-weight="bold" fill="#f7ede2" text-anchor="middle" letter-spacing="2">
      MAHATMA GANDHI 1869-1948
    </text>
  `
});

// 2. Penny Black 1840
const pennyBlackSvg = createStampSVG({
  title: 'Penny Black',
  country: 'Great Britain',
  year: 1840,
  denomination: 'One Penny (1d)',
  primaryColor: '#1a1a1a',
  secondaryColor: '#f4ede4',
  accentColor: '#c5a059',
  postmarkText: 'LONDON CHIEF OFFICE · 1840',
  artworkSvg: `
    <!-- Queen Victoria Classic Silhouette -->
    <rect x="0" y="0" width="316" height="294" fill="#0f0f10"/>
    <g transform="translate(158, 140)">
      <!-- Oval frame -->
      <ellipse cx="0" cy="0" rx="90" ry="115" fill="#1b1b1c" stroke="#c5a059" stroke-width="3"/>
      <ellipse cx="0" cy="0" rx="84" ry="109" fill="none" stroke="#ffffff" stroke-width="0.8" stroke-dasharray="3,2"/>
      <!-- Victoria Head silhouette facing left -->
      <path d="M 5 -65 C 25 -65 42 -40 42 -10 C 42 20 28 35 30 65 C 10 70 -20 70 -35 55 C -35 45 -25 35 -15 28 C -30 25 -42 10 -40 -10 C -38 -35 -20 -60 5 -65 Z" fill="#ffffff"/>
      <!-- Chignon Bun & Tiara -->
      <circle cx="35" cy="-25" r="16" fill="#ffffff"/>
      <path d="M 0 -62 L 10 -50 L 5 -45 L -2 -55 Z" fill="#c5a059"/>
      <!-- Eye & nose carve -->
      <path d="M -30 -10 L -42 -5 L -35 5 Z" fill="#ffffff"/>
    </g>
    <!-- Corner check letters "V" & "R" -->
    <rect x="8" y="8" width="24" height="24" fill="#2d2d2d" stroke="#c5a059"/>
    <text x="20" y="26" font-family="'Georgia', serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">V</text>
    <rect x="284" y="8" width="24" height="24" fill="#2d2d2d" stroke="#c5a059"/>
    <text x="296" y="26" font-family="'Georgia', serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">R</text>
    <rect x="8" y="262" width="24" height="24" fill="#2d2d2d" stroke="#c5a059"/>
    <text x="20" y="280" font-family="'Georgia', serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">A</text>
    <rect x="284" y="262" width="24" height="24" fill="#2d2d2d" stroke="#c5a059"/>
    <text x="296" y="280" font-family="'Georgia', serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">J</text>
  `
});

// 3. Konark Sun Temple Wheel 1949
const konarkSvg = createStampSVG({
  title: 'Konark Sun Temple',
  country: 'India',
  year: 1949,
  denomination: '3 Annas / ३ आने',
  primaryColor: '#78350f',
  secondaryColor: '#fef3c7',
  accentColor: '#d97706',
  postmarkText: 'PURI HEAD POST OFFICE · 1949',
  artworkSvg: `
    <!-- Konark Chariot Wheel stone engraving -->
    <circle cx="158" cy="135" r="105" fill="#451a03"/>
    <circle cx="158" cy="135" r="100" fill="#78350f" stroke="#fef3c7" stroke-width="4"/>
    <circle cx="158" cy="135" r="88" fill="none" stroke="#fde68a" stroke-width="2" stroke-dasharray="6,4"/>
    
    <!-- 8 Main Spokes -->
    ${[0, 45, 90, 135, 180, 225, 270, 315].map(deg => `
      <g transform="translate(158, 135) rotate(${deg})">
        <line x1="0" y1="20" x2="0" y2="86" stroke="#fef3c7" stroke-width="7"/>
        <line x1="0" y1="20" x2="0" y2="86" stroke="#451a03" stroke-width="2"/>
        <circle cx="0" cy="54" r="7" fill="#fde68a" stroke="#451a03" stroke-width="2"/>
      </g>
    `).join('')}

    <!-- 8 Minor Spokes -->
    ${[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map(deg => `
      <g transform="translate(158, 135) rotate(${deg})">
        <line x1="0" y1="22" x2="0" y2="84" stroke="#d97706" stroke-width="3"/>
      </g>
    `).join('')}

    <!-- Wheel Central Hub -->
    <circle cx="158" cy="135" r="24" fill="#fef3c7" stroke="#451a03" stroke-width="3"/>
    <circle cx="158" cy="135" r="12" fill="#78350f"/>
    <circle cx="158" cy="135" r="5" fill="#fef3c7"/>

    <!-- Banner -->
    <rect x="20" y="252" width="276" height="28" fill="#451a03" rx="3"/>
    <text x="158" y="271" font-family="'Georgia', serif" font-size="12" font-weight="bold" fill="#fde68a" text-anchor="middle" letter-spacing="2">
      KONARK SUN TEMPLE CHAIR
    </text>
  `
});

// 4. Asiatic Lion 1963
const lionSvg = createStampSVG({
  title: 'Asiatic Lion 1963',
  country: 'India',
  year: 1963,
  denomination: '15 nP / १५ न.पै.',
  primaryColor: '#166534',
  secondaryColor: '#f0fdf4',
  accentColor: '#86efac',
  postmarkText: 'JUNAGADH GIR FOREST · 1963',
  artworkSvg: `
    <!-- Forest background -->
    <rect x="0" y="0" width="316" height="294" fill="#052e16"/>
    <!-- Sun behind lion -->
    <circle cx="158" cy="115" r="80" fill="#15803d" opacity="0.6"/>
    <!-- Asiatic Lion Silhouette -->
    <g transform="translate(158, 135)">
      <!-- Mane & Head -->
      <circle cx="-15" cy="-25" r="50" fill="#bbf7d0"/>
      <!-- Body -->
      <path d="M -30 -10 C -10 -30 60 -30 90 20 L 70 65 L 45 65 L 40 25 L -5 25 L -10 65 L -35 65 Z" fill="#86efac"/>
      <!-- Tail with tuft -->
      <path d="M 85 20 Q 115 15 110 55" fill="none" stroke="#86efac" stroke-width="5"/>
      <circle cx="110" cy="55" r="8" fill="#bbf7d0"/>
      <!-- Face profile -->
      <path d="M -45 -35 C -65 -30 -60 5 -45 5 Z" fill="#bbf7d0"/>
      <circle cx="-42" cy="-18" r="4" fill="#052e16"/>
      <path d="M -60 -5 L -45 -5" stroke="#052e16" stroke-width="2"/>
    </g>
    <!-- Banner -->
    <rect x="25" y="250" width="266" height="30" fill="#14532d" rx="3"/>
    <text x="158" y="270" font-family="'Georgia', serif" font-size="13" font-weight="bold" fill="#86efac" text-anchor="middle" letter-spacing="2">
      GIR FOREST ASIATIC LION
    </text>
  `
});

// 5. Aryabhata Space Satellite 1975
const aryabhataSvg = createStampSVG({
  title: 'Aryabhata Satellite',
  country: 'India',
  year: 1975,
  denomination: '25 P / २५ पैसे',
  primaryColor: '#1e3a8a',
  secondaryColor: '#eff6ff',
  accentColor: '#60a5fa',
  postmarkText: 'SRIHARIKOTA ISRO · 1975',
  artworkSvg: `
    <!-- Deep Space Background with Stars -->
    <rect x="0" y="0" width="316" height="294" fill="#030712"/>
    ${Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 37) % 310 + 5}" cy="${(i * 43) % 270 + 10}" r="${(i % 3) + 0.8}" fill="#ffffff" opacity="${0.4 + (i % 6) * 0.1}"/>`).join('')}
    
    <!-- Earth Curve -->
    <path d="M -20 280 Q 158 170 336 280 Z" fill="#1e40af"/>
    <path d="M -20 280 Q 158 185 336 280 Z" fill="#3b82f6" opacity="0.4"/>

    <!-- Aryabhata 26-sided polyhedron satellite -->
    <g transform="translate(158, 115)">
      <!-- Solar array facets -->
      <polygon points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30" fill="#1d4ed8" stroke="#93c5fd" stroke-width="3"/>
      <!-- Inner faceted solar cells -->
      <polygon points="0,-45 38,-22 38,22 0,45 -38,22 -38,-22" fill="#2563eb" stroke="#bfdbfe" stroke-width="1.5"/>
      <line x1="-52" y1="-30" x2="52" y2="30" stroke="#bfdbfe" stroke-width="1"/>
      <line x1="-52" y1="30" x2="52" y2="-30" stroke="#bfdbfe" stroke-width="1"/>
      <line x1="0" y1="-60" x2="0" y2="60" stroke="#bfdbfe" stroke-width="1"/>
      <!-- Central antenna -->
      <line x1="0" y1="-60" x2="0" y2="-85" stroke="#facc15" stroke-width="2.5"/>
      <circle cx="0" cy="-87" r="4" fill="#facc15"/>
    </g>

    <!-- Banner -->
    <rect x="20" y="250" width="276" height="30" fill="#1e3a8a" rx="3"/>
    <text x="158" y="271" font-family="'Georgia', serif" font-size="13" font-weight="bold" fill="#93c5fd" text-anchor="middle" letter-spacing="2">
      ARYABHATA 1ST SATELLITE · 1975
    </text>
  `
});

// 6. First Indian Airmail 1911
const airmailSvg = createStampSVG({
  title: 'First Indian Airmail 1911',
  country: 'India',
  year: 1911,
  denomination: 'Special Flight Cachet',
  primaryColor: '#7c2d12',
  secondaryColor: '#fff7ed',
  accentColor: '#fdba74',
  postmarkText: 'ALLAHABAD FIRST AIRMAIL · 1911',
  artworkSvg: `
    <!-- Sky & Biplane in flight -->
    <rect x="0" y="0" width="316" height="294" fill="#431407"/>
    <!-- Clouds -->
    <ellipse cx="60" cy="70" rx="45" ry="16" fill="#fed7aa" opacity="0.4"/>
    <ellipse cx="240" cy="160" rx="55" ry="18" fill="#fed7aa" opacity="0.3"/>

    <!-- Biplane (Sommer 1910 biplane) -->
    <g transform="translate(158, 120) rotate(-12)">
      <!-- Top Wing -->
      <rect x="-80" y="-35" width="160" height="12" rx="4" fill="#fed7aa" stroke="#7c2d12" stroke-width="1.5"/>
      <!-- Bottom Wing -->
      <rect x="-80" y="-5" width="160" height="12" rx="4" fill="#fed7aa" stroke="#7c2d12" stroke-width="1.5"/>
      <!-- Struts between wings -->
      ${[-60, -25, 25, 60].map(x => `<line x1="${x}" y1="-23" x2="${x}" y2="-5" stroke="#ffedd5" stroke-width="2"/>`).join('')}
      <!-- Fuselage -->
      <rect x="-30" y="-18" width="80" height="16" rx="4" fill="#ea580c"/>
      <!-- Propeller -->
      <line x1="-32" y1="-30" x2="-32" y2="-5" stroke="#fef08a" stroke-width="3"/>
      <!-- Wheels / Under-carriage -->
      <circle cx="-15" cy="18" r="8" fill="#1c1917" stroke="#fdba74" stroke-width="2"/>
      <circle cx="25" cy="18" r="8" fill="#1c1917" stroke="#fdba74" stroke-width="2"/>
    </g>

    <!-- Banner -->
    <rect x="15" y="250" width="286" height="30" fill="#7c2d12" rx="3"/>
    <text x="158" y="271" font-family="'Georgia', serif" font-size="11.5" font-weight="bold" fill="#ffedd5" text-anchor="middle" letter-spacing="2">
      WORLD 1ST AIRMAIL · ALLAHABAD-NAINI
    </text>
  `
});

// 7. Inverted Head 4 Annas 1854
const invertedSvg = createStampSVG({
  title: 'Inverted Head 4 Annas',
  country: 'India',
  year: 1854,
  denomination: 'Four Annas / ४ आने',
  primaryColor: '#1e3a8a',
  secondaryColor: '#fef2f2',
  accentColor: '#ef4444',
  postmarkText: 'CALCUTTA GENERAL P.O. · 1854',
  artworkSvg: `
    <!-- Blue outer octagonal frame -->
    <polygon points="40,20 276,20 300,50 300,240 276,270 40,270 16,240 16,50" fill="#1e40af" stroke="#93c5fd" stroke-width="2"/>
    <text x="158" y="44" font-family="'Georgia', serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="4">
      INDIA 1854
    </text>
    
    <!-- Red Center with INVERTED Victoria Head (The famous printing error) -->
    <ellipse cx="158" cy="148" rx="80" ry="92" fill="#b91c1c" stroke="#fca5a5" stroke-width="2"/>
    <!-- INVERTED HEAD: rotated 180 deg -->
    <g transform="translate(158, 148) rotate(180)">
      <path d="M 0 -50 C 20 -50 35 -30 35 -5 C 35 20 20 35 25 55 C 5 60 -15 60 -30 45 C -30 35 -20 25 -10 20 C -25 15 -35 5 -32 -10 C -30 -30 -15 -48 0 -50 Z" fill="#ffffff"/>
      <circle cx="28" cy="-18" r="14" fill="#ffffff"/>
    </g>

    <text x="158" y="260" font-family="'Georgia', serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="2">
      ★ INVERTED ERROR ★
    </text>
  `
});

// Save all SVG files
const files = [
  { name: 'stamp-gandhi.svg', content: gandhiSvg },
  { name: 'stamp-penny-black.svg', content: pennyBlackSvg },
  { name: 'stamp-konark.svg', content: konarkSvg },
  { name: 'stamp-lion.svg', content: lionSvg },
  { name: 'stamp-aryabhata.svg', content: aryabhataSvg },
  { name: 'stamp-airmail.svg', content: airmailSvg },
  { name: 'stamp-inverted-head.svg', content: invertedSvg }
];

files.forEach(f => {
  fs.writeFileSync(path.join(uploadsDir, f.name), f.content);
  console.log(`Generated SVG stamp: ${f.name}`);
});

async function updateDB() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Updating stamp records in MongoDB...');

  await Stamp.updateOne({ title: /Gandhi/i }, { image: '/uploads/stamp-gandhi.svg' });
  await Stamp.updateOne({ title: /Penny Black/i }, { image: '/uploads/stamp-penny-black.svg' });
  await Stamp.updateOne({ title: /Konark/i }, { image: '/uploads/stamp-konark.svg' });
  await Stamp.updateOne({ title: /Lion/i }, { image: '/uploads/stamp-lion.svg' });
  await Stamp.updateOne({ title: /Aryabhata/i }, { image: '/uploads/stamp-aryabhata.svg' });
  await Stamp.updateOne({ title: /Airmail/i }, { image: '/uploads/stamp-airmail.svg' });
  await Stamp.updateOne({ title: /Inverted/i }, { image: '/uploads/stamp-inverted-head.svg' });
  // Also update 'gandi' stamp if exists
  await Stamp.updateOne({ title: /^gandi$/i }, { image: '/uploads/stamp-gandhi.svg', title: 'Mahatma Gandhi 1948 Memorial' });

  // Update forum posts with image
  const ForumPost = require('../models/ForumPost');
  await ForumPost.updateOne({ title: /identification/i }, { image: '/uploads/stamp-konark.svg' });
  await ForumPost.updateOne({ title: /backstory/i }, { image: '/uploads/stamp-gandhi.svg' });

  console.log('✅ Successfully updated all stamp image links to local uploaded SVG assets!');
  await mongoose.disconnect();
}

updateDB();
