/**
 * RETRO-CYBERPUNK ENGINE - SYSTEM 23MID0380
 * Developer: Harishankar.A (23MID0380)
 * School: School of Computer Science and Engineering (SCOPE), VIT Vellore
 * Course: Natural Language Processing
 */

// Application State
const PortfolioState = {
  currentPage: 1,
  totalPages: 8,
  audioEnabled: true,
  crtEnabled: true,
  pageTitles: [
    "CYBER_COVER_SCREEN",
    "SYSTEM_INDEX_TOC",
    "COURSE_OVERVIEW_SCOPE",
    "CORE_NLP_THEORIES",
    "LABS_&_HEALTH_MAP",
    "PROJECT_CAMPUS_CONNECT",
    "REFLECTIONS_&_REVIEW",
    "SYSTEM_LOGOUT_APPENDIX"
  ]
};

// Web Audio API Synthesizer (Zero external dependencies)
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playCyberBeep(freq = 880, type = 'sine', duration = 0.08, gainVal = 0.1) {
  if (!PortfolioState.audioEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn("Audio synthesis ignored:", e);
  }
}

function playPageTurnSound() {
  if (!PortfolioState.audioEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Synth chirp 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(440, now);
    osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // Deep resonance blip
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(180, now);
    osc2.frequency.linearRampToValueAtTime(80, now + 0.18);
    gain2.gain.setValueAtTime(0.09, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.18);
  } catch (e) {}
}

function playGlitchSound() {
  if (!PortfolioState.audioEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.setValueAtTime(240, now + 0.04);
    osc.frequency.setValueAtTime(1400, now + 0.08);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);
  } catch (e) {}
}

function playBootSound() {
  if (!PortfolioState.audioEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const chords = [220, 277.18, 329.63, 440, 554.37, 659.25, 880];
    chords.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.07;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.06, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  } catch (e) {}
}

// Core Navigation Controller
function goToPage(targetPage, playSound = true) {
  if (targetPage < 1 || targetPage > PortfolioState.totalPages) return;
  if (targetPage === PortfolioState.currentPage && document.querySelector(`.page-wrapper[data-page="${targetPage}"]`).classList.contains('active-page')) {
    return;
  }

  // Deactivate all pages
  document.querySelectorAll('.page-wrapper').forEach(page => {
    page.classList.remove('active-page');
  });

  // Activate target page
  const targetElement = document.querySelector(`.page-wrapper[data-page="${targetPage}"]`);
  if (targetElement) {
    targetElement.classList.add('active-page');
  }

  PortfolioState.currentPage = targetPage;

  // Sound feedback
  if (playSound) {
    playPageTurnSound();
  }

  // Update header and footer UI
  updateTelemetryUI();

  // Scroll to container top smoothly
  const container = document.getElementById('mainContentContainer');
  if (container) {
    container.scrollTo({ top: 0, behavior: 'smooth' });
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Close Quick Index Modal if open
  closeIndexModal();
}

function nextPage() {
  if (PortfolioState.currentPage < PortfolioState.totalPages) {
    goToPage(PortfolioState.currentPage + 1);
  } else {
    playGlitchSound();
  }
}

function prevPage() {
  if (PortfolioState.currentPage > 1) {
    goToPage(PortfolioState.currentPage - 1);
  } else {
    playGlitchSound();
  }
}

function updateTelemetryUI() {
  const currentNumStr = String(PortfolioState.currentPage).padStart(2, '0');
  const totalNumStr = String(PortfolioState.totalPages).padStart(2, '0');
  const currentTitle = PortfolioState.pageTitles[PortfolioState.currentPage - 1] || "UNSPECIFIED";

  // Header display
  const headerPageIndicator = document.getElementById('headerPageIndicator');
  if (headerPageIndicator) {
    headerPageIndicator.textContent = `PAGE [ ${currentNumStr} / ${totalNumStr} ] :: ${currentTitle}`;
  }

  // Footer display
  const footerPageIndicator = document.getElementById('footerPageIndicator');
  if (footerPageIndicator) {
    footerPageIndicator.textContent = `[ ${currentNumStr} / ${totalNumStr} ]`;
  }

  // Progress Bar
  const progressBar = document.getElementById('pageProgressBar');
  if (progressBar) {
    const pct = ((PortfolioState.currentPage) / PortfolioState.totalPages) * 100;
    progressBar.style.width = `${pct}%`;
  }

  // Navigation button states
  const prevBtn = document.getElementById('btnPrevPage');
  const nextBtn = document.getElementById('btnNextPage');
  if (prevBtn) {
    prevBtn.disabled = PortfolioState.currentPage === 1;
    prevBtn.style.opacity = PortfolioState.currentPage === 1 ? '0.4' : '1';
    prevBtn.style.cursor = PortfolioState.currentPage === 1 ? 'not-allowed' : 'pointer';
  }
  if (nextBtn) {
    nextBtn.disabled = PortfolioState.currentPage === PortfolioState.totalPages;
    nextBtn.style.opacity = PortfolioState.currentPage === PortfolioState.totalPages ? '0.4' : '1';
    nextBtn.style.cursor = PortfolioState.currentPage === PortfolioState.totalPages ? 'not-allowed' : 'pointer';
  }

  // Update navigation dots in footer
  document.querySelectorAll('.nav-dot-pill').forEach(dot => {
    const dotPage = parseInt(dot.getAttribute('data-goto'), 10);
    if (dotPage === PortfolioState.currentPage) {
      dot.classList.add('bg-cyan-400', 'box-glow-cyan');
      dot.classList.remove('bg-gray-700');
    } else {
      dot.classList.remove('bg-cyan-400', 'box-glow-cyan');
      dot.classList.add('bg-gray-700');
    }
  });

  // Highlight active card on Table of Contents (Page 2)
  document.querySelectorAll('.toc-index-card').forEach(card => {
    const cardPage = parseInt(card.getAttribute('data-goto'), 10);
    if (cardPage === PortfolioState.currentPage) {
      card.classList.add('border-cyan-400', 'bg-cyan-950/20');
    } else {
      card.classList.remove('border-cyan-400', 'bg-cyan-950/20');
    }
  });
}

// Boot Diagnostic Intro Sequence on Page 1
function runInitializeBootSequence() {
  const bootOverlay = document.getElementById('bootTerminalOverlay');
  const bootLog = document.getElementById('bootTerminalLog');
  if (!bootOverlay || !bootLog) {
    goToPage(2);
    return;
  }

  bootOverlay.classList.remove('hidden');
  bootLog.innerHTML = '';
  playBootSound();

  const bootMessages = [
    { text: ">> INITIATING RETRO-LOG SYSTEM BOOT KERNEL...", delay: 100 },
    { text: ">> MOUNTING OPERATOR: HARISHANKAR.A [REG: 23MID0380]...", delay: 350 },
    { text: ">> AFFILIATION: SCHOOL OF COMPUTER SCIENCE & ENG (SCOPE) - VIT VELLORE...", delay: 650 },
    { text: ">> SYLLABUS INDEX: CSE/SWE ELECTIVE - NATURAL LANGUAGE PROCESSING...", delay: 950 },
    { text: ">> LOADING HANDS-ON LEDGER: [HEALTH MAP RECOMMENDATION SYSTEM]...", delay: 1300 },
    { text: ">> ACCREDITATION STATUS: 4 STARS (HEALTH MAP) + 1 STAR (CLASS Q&A) = 5 STARS EARNED [★★★★★]...", delay: 1650 },
    { text: ">> LOADING COURSE PROJECT: CAMPUS CONNECT FAQ & NAVIGATION CHATBOT...", delay: 2000 },
    { text: ">> COMPILING INTERACTIVE TERMINAL HUD MODULES (8 PAGES)...", delay: 2350 },
    { text: ">> ALL SUBSYSTEMS NOMINAL. ACCESS GRANTED. ENTERING SYSTEM INDEX...", delay: 2700 }
  ];

  bootMessages.forEach(msg => {
    setTimeout(() => {
      const p = document.createElement('div');
      p.className = 'font-terminal text-cyan-400 text-sm tracking-wide';
      p.innerHTML = `<span class="text-pink-500 font-bold">[SYS_INIT]</span> ${msg.text}`;
      bootLog.appendChild(p);
      bootLog.scrollTop = bootLog.scrollHeight;
      playCyberBeep(700 + Math.random() * 400, 'square', 0.03, 0.04);
    }, msg.delay);
  });

  setTimeout(() => {
    bootOverlay.classList.add('hidden');
    goToPage(2);
  }, 3200);
}

// Quick Index Modal Drawer
function openIndexModal() {
  playCyberBeep(620, 'triangle', 0.07, 0.1);
  const modal = document.getElementById('quickNavModal');
  if (modal) modal.classList.remove('hidden');
}

function closeIndexModal() {
  const modal = document.getElementById('quickNavModal');
  if (modal) modal.classList.add('hidden');
}

// Toggle CRT Scanlines
function toggleCRT() {
  PortfolioState.crtEnabled = !PortfolioState.crtEnabled;
  const overlay = document.querySelector('.crt-overlay');
  const beam = document.querySelector('.crt-beam');
  const btn = document.getElementById('btnToggleCRT');

  if (overlay) overlay.classList.toggle('disabled', !PortfolioState.crtEnabled);
  if (beam) beam.classList.toggle('disabled', !PortfolioState.crtEnabled);

  if (btn) {
    btn.innerHTML = PortfolioState.crtEnabled 
      ? '<span class="text-green-400">CRT: ON</span>' 
      : '<span class="text-gray-500">CRT: OFF</span>';
  }
  playCyberBeep(850, 'sawtooth', 0.06, 0.08);
}

// Toggle Audio FX
function toggleAudio() {
  PortfolioState.audioEnabled = !PortfolioState.audioEnabled;
  const btn = document.getElementById('btnToggleAudio');
  if (btn) {
    btn.innerHTML = PortfolioState.audioEnabled 
      ? '<span class="text-yellow-400">AUDIO: ON</span>' 
      : '<span class="text-gray-500">AUDIO: MUTE</span>';
  }
  if (PortfolioState.audioEnabled) {
    getAudioContext();
    playCyberBeep(1046.5, 'sine', 0.1, 0.15);
  }
}

// Interactive Course Project Chatbot Terminal Simulator (Campus Connect)
const CampusConnectEngine = {
  knowledgeBase: [
    {
      keywords: ["tt", "technology tower", "where is tt", "tt location"],
      intent: "NAV_CAMPUS_LOC",
      confidence: "99.4%",
      locationName: "Technology Tower (TT)",
      waypoint: "12.9692° N, 79.1559° E",
      mapUrl: "https://maps.google.com/?q=Technology+Tower+VIT+Vellore",
      reply: `Technology Tower (TT) is one of the premier academic blocks situated near the main entrance gate (Gate 1). It houses the School of Computer Science & Engineering (SCOPE) labs, multiple department deaneries, and specialized high-performance AI computing centers.`
    },
    {
      keywords: ["curfew", "hostel curfew", "in time", "fresher timing", "hostel time"],
      intent: "HOSTEL_REGULATION_INQUIRY",
      confidence: "98.8%",
      locationName: "VIT Hostels (Men's & Ladies' Blocks)",
      waypoint: "12.9715° N, 79.1601° E",
      mapUrl: "https://maps.google.com/?q=VIT+Vellore+Hostels",
      reply: `Official Hostel Curfew for Freshers:\n- Regular Weekday In-Time: 8:30 PM (Biometric Punch at Hostel Turnstiles).\n- Weekend In-Time: 9:00 PM.\n- Late entry requires digital warden biometric override and triggers an automated notification SMS to registered parents via VTOP.`
    },
    {
      keywords: ["leave", "weekend leave", "home leave", "apply leave", "vtop leave"],
      intent: "ACADEMIC_LEAVE_PROTOCOL",
      confidence: "97.6%",
      locationName: "VTOP Portal / Chief Warden Office",
      waypoint: "VTOP Digital Gateway",
      mapUrl: "https://vtop.vit.ac.in",
      reply: `Step-by-step Home / Outing Leave Procedure:\n1. Log into your VTOP student portal.\n2. Navigate to 'Hostel' -> 'Apply Leave'.\n3. Select Leave Type ('Home Town' or 'Local Outing').\n4. Input Out-Time, In-Time, and Mode of Transit.\n5. Ensure your registered parent approves via the automated SMS/VTOP Parent login before 6:00 PM on Thursday.`
    },
    {
      keywords: ["food mall", "sjt to food mall", "route food mall", "where to eat"],
      intent: "CAMPUS_ROUTING_NAVIGATION",
      confidence: "99.1%",
      locationName: "VIT Food Mall & Gazebo Annex",
      waypoint: "12.9702° N, 79.1585° E",
      mapUrl: "https://maps.google.com/?q=VIT+Vellore+Food+Mall",
      reply: `Route from Silver Jubilee Tower (SJT) to Food Mall:\n- Exit SJT main foyer facing East.\n- Walk past the Anna Auditorium promenade.\n- Cross the central shaded walkway heading toward the Swimming Pool complex.\n- Distance: ~420 meters (~5 mins brisk walk).\n- Contains: Dominos, Subway, Gym Khanna canteen, Fresh fruit juice parlors.`
    },
    {
      keywords: ["library", "periyar", "central library", "books", "library hours"],
      intent: "LIBRARY_SERVICES_QUERY",
      confidence: "98.2%",
      locationName: "Periyar E.V.R Central Library",
      waypoint: "12.9698° N, 79.1568° E",
      mapUrl: "https://maps.google.com/?q=Periyar+Central+Library+VIT+Vellore",
      reply: `Periyar Central Library Operational Telemetry:\n- Weekdays: 8:00 AM to 12:00 Midnight.\n- Exam FAT Periods: Open 24/7 with active reading halls.\n- Book Issue Quota: 4 books for Undergraduate/Integrated M.Tech students for a 14-day circulation cycle.\n- Facilities: Digital ACM/IEEE lab access, air-conditioned silent study cubicles.`
    }
  ],

  processQuery(rawText) {
    const clean = rawText.toLowerCase().trim();
    let bestMatch = null;

    for (const item of this.knowledgeBase) {
      if (item.keywords.some(k => clean.includes(k))) {
        bestMatch = item;
        break;
      }
    }

    if (!bestMatch) {
      return {
        intent: "GENERAL_CAMPUS_ASSISTANT_FALLBACK",
        confidence: "82.5%",
        locationName: "Campus Information Foyer",
        waypoint: "12.9690° N, 79.1550° E",
        mapUrl: "https://maps.google.com/?q=VIT+Vellore",
        reply: `Query routed via General Campus Knowledge Classifier:\n"We have recorded your query: '${rawText}'. For real-time hostel or academic assistance, consult your Faculty Advisor (Proctor) or visit the Single Window Clarification Desk at Main Building (MB) Ground Floor."`
      };
    }
    return bestMatch;
  }
};

function sendCampusConnectMessage(customText = null) {
  const inputEl = document.getElementById('chatInputQuery');
  const chatLogs = document.getElementById('chatMessagesContainer');
  const text = customText || (inputEl ? inputEl.value : "");
  if (!text.trim()) return;

  if (inputEl) inputEl.value = "";
  playCyberBeep(750, 'triangle', 0.05, 0.08);

  // Render User Message
  const userMsgEl = document.createElement('div');
  userMsgEl.className = 'flex items-start justify-end space-x-2 my-3';
  userMsgEl.innerHTML = `
    <div class="bg-cyan-950/40 border border-cyan-500/50 text-cyan-200 px-4 py-2.5 rounded-lg max-w-lg text-xs md:text-sm font-mono shadow-md">
      <div class="text-[10px] text-cyan-400 font-bold mb-1">[USER_QUERY // FRESHER]</div>
      ${text}
    </div>
    <div class="w-8 h-8 rounded bg-cyan-900 border border-cyan-400 flex items-center justify-center text-xs font-bold text-cyan-300">
      U
    </div>
  `;
  chatLogs.appendChild(userMsgEl);
  chatLogs.scrollTop = chatLogs.scrollHeight;

  // Render Typing Indicator
  const typingEl = document.createElement('div');
  typingEl.id = 'botTypingBubble';
  typingEl.className = 'flex items-start space-x-2 my-2';
  typingEl.innerHTML = `
    <div class="w-8 h-8 rounded bg-pink-900 border border-pink-400 flex items-center justify-center text-xs font-bold text-pink-300">
      BOT
    </div>
    <div class="bg-gray-900/90 border border-pink-500/40 text-pink-300 px-3 py-2 rounded-lg text-xs font-mono">
      <span class="inline-block animate-pulse">>> INFERENCE ENGINE COMPUTING STATE...</span>
    </div>
  `;
  chatLogs.appendChild(typingEl);
  chatLogs.scrollTop = chatLogs.scrollHeight;

  // Process response with simulated delay
  setTimeout(() => {
    const bubble = document.getElementById('botTypingBubble');
    if (bubble) bubble.remove();

    const result = CampusConnectEngine.processQuery(text);
    playCyberBeep(920, 'sine', 0.08, 0.1);

    const botMsgEl = document.createElement('div');
    botMsgEl.className = 'flex items-start space-x-2 my-3';
    botMsgEl.innerHTML = `
      <div class="w-8 h-8 rounded bg-pink-950 border border-pink-400 flex items-center justify-center text-xs font-bold text-pink-300 shrink-0">
        AI
      </div>
      <div class="bg-gray-900/95 border border-pink-500/50 text-gray-200 p-3.5 rounded-lg max-w-xl text-xs md:text-sm font-mono shadow-lg">
        <div class="flex flex-wrap items-center gap-2 mb-2 pb-2 border-b border-gray-800 text-[10px]">
          <span class="text-pink-400 font-bold">STATE: ${result.intent}</span>
          <span class="text-green-400">CONF: ${result.confidence}</span>
          <span class="text-yellow-400">WAYPOINT: ${result.waypoint}</span>
        </div>
        <p class="whitespace-pre-line leading-relaxed text-gray-200">${result.reply}</p>
        <div class="mt-3 pt-2 border-t border-gray-800 flex items-center justify-between">
          <span class="text-[11px] text-cyan-400 font-bold">DESTINATION: ${result.locationName}</span>
          <a href="${result.mapUrl}" target="_blank" rel="noopener noreferrer" 
             class="text-[10px] text-pink-400 hover:text-pink-300 hover:underline flex items-center gap-1 font-bold">
            [ OPEN GOOGLE MAPS VECTOR -> ]
          </a>
        </div>
      </div>
    `;
    chatLogs.appendChild(botMsgEl);
    chatLogs.scrollTop = chatLogs.scrollHeight;
  }, 500);
}

// Interactive Health Map Simulator on Page 5
const HealthMapDemo = {
  samples: [
    {
      query: "Severe toothache, jaw swelling, and root canal treatment needed near Katpadi junction",
      diseaseMatch: "Acute Dental Abscess / Pulpitis",
      specialty: "Dental Surgery & Endodontics",
      location: "Katpadi Junction Corridor",
      facilities: [
        { name: "CMC Vellore Dental Specialty Clinic", distance: "2.4 km", time: "7 mins", score: "98.5%", verified: true },
        { name: "VIT Health Center - Dental Wing", distance: "0.4 km", time: "2 mins", score: "94.0%", verified: true },
        { name: "Apollo Dental Clinic Katpadi", distance: "3.1 km", time: "9 mins", score: "89.2%", verified: true }
      ]
    },
    {
      query: "Chest heaviness, left arm radiation pain, and shortness of breath while walking",
      diseaseMatch: "Suspected Acute Angina / Coronary Syndrome",
      specialty: "Cardiology & Emergency Intensive Care",
      location: "Vellore Central Zone",
      facilities: [
        { name: "CMC Hospital Emergency Triage Block (IDA Scudder Road)", distance: "4.8 km", time: "12 mins", score: "99.8%", verified: true },
        { name: "Nalam Hospital Cardiac Care Unit", distance: "3.9 km", time: "10 mins", score: "91.3%", verified: true },
        { name: "Sri Narayani Hospital & Research Centre", distance: "11.2 km", time: "22 mins", score: "88.0%", verified: true }
      ]
    },
    {
      query: "High spiking fever with skin petechial rashes and joint weakness for 3 days",
      diseaseMatch: "Arboviral Syndrome (Suspected Dengue / Chikungunya)",
      specialty: "Internal Medicine & Infectious Diseases",
      location: "VIT Campus Vicinity",
      facilities: [
        { name: "VIT On-Campus Health Centre (In-Patient Ward)", distance: "0.2 km", time: "1 min", score: "96.4%", verified: true },
        { name: "Government Vellore Medical College Hospital (Adukkamparai)", distance: "14.5 km", time: "26 mins", score: "93.0%", verified: true },
        { name: "CMC Vellore Town Campus", distance: "5.1 km", time: "14 mins", score: "95.5%", verified: true }
      ]
    }
  ],

  runExtraction(index) {
    const sample = this.samples[index];
    if (!sample) return;

    playCyberBeep(780, 'sine', 0.08, 0.1);

    const inputDisplay = document.getElementById('hmQueryDisplay');
    const diseaseDisplay = document.getElementById('hmDiseaseExtracted');
    const specialtyDisplay = document.getElementById('hmSpecialtyExtracted');
    const locationDisplay = document.getElementById('hmLocationExtracted');
    const facilityList = document.getElementById('hmFacilityList');

    if (inputDisplay) inputDisplay.textContent = `"${sample.query}"`;
    if (diseaseDisplay) diseaseDisplay.textContent = sample.diseaseMatch;
    if (specialtyDisplay) specialtyDisplay.textContent = sample.specialty;
    if (locationDisplay) locationDisplay.textContent = sample.location;

    if (facilityList) {
      facilityList.innerHTML = '';
      sample.facilities.forEach((f, idx) => {
        const item = document.createElement('div');
        item.className = 'p-3 bg-gray-900/80 border border-green-500/30 rounded flex flex-wrap items-center justify-between text-xs font-mono my-1.5 hover:border-green-400 transition-all';
        item.innerHTML = `
          <div>
            <div class="text-green-300 font-bold text-sm">#${idx + 1} ${f.name}</div>
            <div class="text-gray-400 text-[11px] mt-0.5">Road Distance: <span class="text-cyan-300">${f.distance}</span> | Est. Transit: <span class="text-yellow-300">${f.time}</span></div>
          </div>
          <div class="text-right">
            <span class="px-2 py-0.5 bg-green-950 border border-green-400 text-green-300 text-[10px] font-bold rounded">
              MATCH: ${f.score}
            </span>
            <div class="text-[10px] text-cyan-400 mt-1">CAPABILITY VERIFIED ✓</div>
          </div>
        `;
        facilityList.appendChild(item);
      });
    }
  }
};

// Theory Accordion/Tab Selector on Page 4
function selectTheoryTab(tabIndex) {
  playCyberBeep(650 + tabIndex * 50, 'triangle', 0.05, 0.08);
  document.querySelectorAll('.theory-tab-btn').forEach((btn, idx) => {
    if (idx === tabIndex) {
      btn.classList.add('border-cyan-400', 'text-cyan-300', 'bg-cyan-950/40', 'box-glow-cyan');
      btn.classList.remove('border-gray-700', 'text-gray-400');
    } else {
      btn.classList.remove('border-cyan-400', 'text-cyan-300', 'bg-cyan-950/40', 'box-glow-cyan');
      btn.classList.add('border-gray-700', 'text-gray-400');
    }
  });

  document.querySelectorAll('.theory-content-panel').forEach((panel, idx) => {
    if (idx === tabIndex) {
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  });
}

// Print / Export PDF trigger
function triggerPortfolioPrint() {
  playCyberBeep(1000, 'sine', 0.1, 0.15);
  window.print();
}

// Keyboard Listeners
document.addEventListener('keydown', (e) => {
  // If user is currently typing in an input field, do not trigger page changes
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    if (e.key === 'Enter' && document.activeElement.id === 'chatInputQuery') {
      sendCampusConnectMessage();
    }
    return;
  }

  if (e.key === 'ArrowRight' || e.key === 'PageDown') {
    nextPage();
  } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
    prevPage();
  } else if (e.key >= '1' && e.key <= '8') {
    const pageNum = parseInt(e.key, 10);
    goToPage(pageNum);
  } else if (e.key.toLowerCase() === 'm' || e.key.toLowerCase() === 'i') {
    openIndexModal();
  } else if (e.key === 'Escape') {
    closeIndexModal();
  }
});

// Window OnLoad Initialization
window.addEventListener('DOMContentLoaded', () => {
  // Initial page setup
  goToPage(1, false);

  // Setup click listeners for sound unlock
  document.body.addEventListener('click', () => {
    getAudioContext();
  }, { once: true });

  console.log("%c[RETRO-LOG]// HARISHANKAR.A (23MID0380) INITIALIZED", "color: #00f0ff; font-family: monospace; font-size: 14px; font-weight: bold;");
  console.log("%cVIT VELLORE - SCOPE - NATURAL LANGUAGE PROCESSING", "color: #ff007f; font-family: monospace; font-size: 12px;");
});
