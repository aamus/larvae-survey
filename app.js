// ====================================================
// LARVA SURVEY APP – Core Application Logic
// ====================================================

'use strict';

// ---- State ----
let currentSession = null;
let houseEntries = [];
let currentLarvaStatus = null;
let currentPhoto = null; // base64 data URL
let currentLocation = null;
let cameraStream = null;
let sessions = []; // saved sessions in localStorage

const MIN_HOUSES = 15;

// ---- Init ----
window.addEventListener('DOMContentLoaded', () => {
  loadSessions();
  loadDirectory();          // saved collectors / officers / zones
  refreshHomeSelectors();   // fill the Quick Auto-Fill dropdowns
  applyDefaultsToHome();    // pre-fill the starred (default) entries

  // Splash → Home after animation
  setTimeout(() => {
    document.getElementById('splash-screen').classList.remove('active');
    showScreen('home-screen');
  }, 2000);
});

// ====================================================
// SCREEN MANAGEMENT
// ====================================================

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  if (screen) screen.classList.add('active');
}

// ====================================================
// SESSION MANAGEMENT
// ====================================================

// Fills a text field with a suggested value but leaves it fully editable —
// tapping a quick-fill chip is just a shortcut, never a locked choice.
function quickFillField(fieldId, value) {
  const el = document.getElementById(fieldId);
  if (!el) return;
  el.value = value;
  el.focus();
  const len = el.value.length;
  try { el.setSelectionRange(len, len); } catch (_) {} // cursor at end, ready to keep typing
}

function startSurvey() {
  const workerName        = document.getElementById('worker-name').value.trim();
  const workerDesignation = document.getElementById('worker-designation').value.trim();
  const zoneNumber        = document.getElementById('zone-number').value.trim();
  const areaName          = document.getElementById('area-name').value.trim();
  const supervisorName        = document.getElementById('supervisor-name').value.trim();
  const supervisorDesignation = document.getElementById('supervisor-designation').value.trim();

  if (!workerName) { showToast('⚠️ Please enter Vector Collector Name'); return; }
  if (!zoneNumber)  { showToast('⚠️ Please enter Zone Number'); return; }

  currentSession = {
    id: Date.now(),
    workerName,
    workerDesignation,
    zoneNumber,
    areaName,
    supervisorName,
    supervisorDesignation,
    startTime: new Date().toISOString(),
    date: formatDate(new Date()),
  };
  houseEntries = [];

  // Remember these details so they can be auto-filled next time
  rememberSessionDetails(currentSession);

  // Update survey screen
  document.getElementById('survey-zone-title').textContent = zoneNumber;
  document.getElementById('survey-date-display').textContent = currentSession.date;

  renderHouseList();
  updateProgress();
  showScreen('survey-screen');
}

function goHome() {
  if (houseEntries.length > 0) {
    if (!confirm('Go back? Unsaved entries will be kept in memory.')) return;
  }
  showScreen('home-screen');
}

function finishSurvey() {
  if (houseEntries.length === 0) {
    showToast('⚠️ Please add at least 1 house entry');
    return;
  }
  if (houseEntries.length < MIN_HOUSES) {
    // Warn but allow finishing
    const ok = confirm(`Only ${houseEntries.length} of ${MIN_HOUSES} minimum houses added. Finish anyway?`);
    if (!ok) return;
  }

  currentSession.endTime = new Date().toISOString();
  currentSession.houses  = [...houseEntries];

  // Save session
  sessions.unshift(currentSession);
  saveSessions();

  // Show report
  buildReportScreen(currentSession);
  showScreen('report-screen');

  // Auto-save PDF after short delay so jsPDF can finish loading
  setTimeout(() => {
    downloadPDF(true); // true = auto mode
  }, 1200);
}

function startNewSession() {
  currentSession = null;
  houseEntries = [];
  currentLarvaStatus = null;
  currentPhoto = null;
  currentLocation = null;
  document.getElementById('worker-name').value = '';
  document.getElementById('worker-designation').value = '';
  document.getElementById('zone-number').value = '';
  document.getElementById('area-name').value = '';
  document.getElementById('supervisor-name').value = '';
  document.getElementById('supervisor-designation').value = '';
  // Re-apply the saved defaults so the next round starts pre-filled
  refreshHomeSelectors();
  applyDefaultsToHome();
  renderPrevSessions();
  showScreen('home-screen');
}

// ====================================================
// HOUSE ENTRIES
// ====================================================

function openAddHouseModal() {
  currentLarvaStatus = null;
  currentPhoto = null;

  document.getElementById('house-address').value = '';
  document.getElementById('house-notes').value = '';
  document.getElementById('preview-img').style.display = 'none';
  document.getElementById('preview-img').src = '';
  document.getElementById('photo-preview').classList.remove('has-photo');
  // Reset item type selection
  document.getElementById('item-type-value').value = '';
  document.querySelectorAll('.item-type-btn').forEach(b => b.classList.remove('selected'));
  const otherBox = document.getElementById('item-type-other-text');
  if (otherBox) { otherBox.style.display = 'none'; otherBox.value = ''; }

  // Reset photo placeholder
  const placeholder = document.getElementById('photo-modal-placeholder');
  if (placeholder) placeholder.style.display = 'flex';

  document.getElementById('btn-larva-found').classList.remove('active-found', 'active-not-found');
  document.getElementById('btn-larva-not-found').classList.remove('active-found', 'active-not-found');

  document.getElementById('entry-time-display').textContent = formatDateTime(new Date());

  // Set modal title with house number
  const nextNum = houseEntries.length + 1;
  document.getElementById('modal-title').textContent = `House #${nextNum} Entry`;

  // Start location fetch
  document.getElementById('location-text').textContent = 'Fetching location...';
  document.getElementById('location-accuracy').textContent = '';
  currentLocation = null;
  getLocation();

  const modal = document.getElementById('house-modal');
  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('open'), 10);
}

function closeHouseModal() {
  const modal = document.getElementById('house-modal');
  modal.classList.remove('open');
  setTimeout(() => { modal.style.display = 'none'; }, 300);
  stopCamera();
}

function closeModalOutside(event) {
  if (event.target === document.getElementById('house-modal')) {
    closeHouseModal();
  }
}

function setLarvaStatus(status) {
  currentLarvaStatus = status;
  const foundBtn    = document.getElementById('btn-larva-found');
  const notFoundBtn = document.getElementById('btn-larva-not-found');

  foundBtn.classList.remove('active-found', 'active-not-found');
  notFoundBtn.classList.remove('active-found', 'active-not-found');

  if (status === 'found') {
    foundBtn.classList.add('active-found');
  } else {
    notFoundBtn.classList.add('active-not-found');
  }
}

function saveHouseEntry() {
  const address  = document.getElementById('house-address').value.trim();
  const notes    = document.getElementById('house-notes').value.trim();
  const itemType = document.getElementById('item-type-value').value.trim();

  if (!address) { showToast('⚠️ Please enter house address'); return; }
  if (!currentLarvaStatus) { showToast('⚠️ Please select Larva status'); return; }

  const entry = {
    id: Date.now(),
    number: houseEntries.length + 1,
    address,
    notes,
    itemType,
    larvaStatus: currentLarvaStatus,
    photo: currentPhoto,
    location: currentLocation,
    timestamp: new Date().toISOString(),
    timeDisplay: formatDateTime(new Date()),
  };

  houseEntries.push(entry);
  renderHouseList();
  updateProgress();
  closeHouseModal();
  showToast(`✅ House #${entry.number} saved!`);
}

function deleteHouseEntry(id) {
  houseEntries = houseEntries.filter(e => e.id !== id);
  // Renumber
  houseEntries.forEach((e, i) => { e.number = i + 1; });
  renderHouseList();
  updateProgress();
  showToast('🗑️ Entry deleted');
}

// ====================================================
// RENDER
// ====================================================

function renderHouseList() {
  const list = document.getElementById('house-list');

  if (houseEntries.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🏠</div>
        <p>No houses added yet.</p>
        <p class="empty-sub">Tap the + button below to add your first house entry.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = '';

  houseEntries.forEach(entry => {
    const card = document.createElement('div');
    card.className = `house-card ${entry.larvaStatus === 'found' ? 'larva-found' : 'larva-not-found'}`;
    card.innerHTML = `
      <div class="house-card-photo">
        ${entry.photo
          ? `<img src="${entry.photo}" alt="House photo" />`
          : `<span>🏠</span>`}
      </div>
      <div class="house-card-body">
        <span class="house-num">House #${entry.number}</span>
        <span class="house-addr">${escapeHtml(entry.address)}</span>
        <span class="house-meta">${entry.timeDisplay}
          ${entry.location ? ` · 📍 ${entry.location.lat.toFixed(4)}, ${entry.location.lng.toFixed(4)}` : ''}
        </span>
        ${entry.itemType ? `<span class="house-item-type">📦 ${escapeHtml(entry.itemType)}</span>` : ''}
        ${entry.notes ? `<span class="house-notes-text">${escapeHtml(entry.notes)}</span>` : ''}
        <span class="house-status-badge">
          <img class="status-icon" src="${entry.larvaStatus === 'found' ? 'larva-found.png' : 'larva-not-found.png'}" alt="${entry.larvaStatus === 'found' ? 'Larva found' : 'Larva not found'}" />
        </span>
      </div>
      <div class="house-card-actions">
        <button class="delete-btn" onclick="deleteHouseEntry(${entry.id})" title="Delete">🗑️</button>
      </div>
    `;
    list.appendChild(card);
  });

  // Scroll to bottom
  list.scrollTop = list.scrollHeight;
}

function updateProgress() {
  const count = houseEntries.length;
  const found = houseEntries.filter(e => e.larvaStatus === 'found').length;
  const notFound = count - found;

  document.getElementById('house-count').textContent = count;
  document.getElementById('progress-text').textContent = `${count} / ${MIN_HOUSES} minimum houses`;

  if (count > 0) {
    document.getElementById('larva-stats').textContent =
      `✅ ${found} Yes  ❌ ${notFound} No`;
  } else {
    document.getElementById('larva-stats').textContent = '';
  }

  const pct = Math.min((count / MIN_HOUSES) * 100, 100);
  document.getElementById('progress-bar').style.width = pct + '%';

  // Finish button is always enabled if at least 1 house added
  const finishBtn = document.getElementById('finish-btn');
  finishBtn.disabled = count === 0;
  if (count > 0 && count < MIN_HOUSES) {
    finishBtn.textContent = `⚠️ Finish Early (${count}/${MIN_HOUSES})`;
    finishBtn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
  } else if (count >= MIN_HOUSES) {
    finishBtn.textContent = '✅ Finish & Save PDF';
    finishBtn.style.background = '';
  } else {
    finishBtn.textContent = '✅ Finish & Save PDF';
    finishBtn.style.background = '';
  }
}

// ====================================================
// CAMERA / PHOTO
// ====================================================

function capturePhoto() {
  // On file:// protocol or insecure context, camera may be blocked — go straight to file input
  const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  if (!isSecure || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    document.getElementById('file-input').click();
    return;
  }

  const videoModal = document.getElementById('camera-modal');
  videoModal.style.display = 'flex';

  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
    .then(stream => {
      cameraStream = stream;
      const video = document.getElementById('live-video');
      video.srcObject = stream;
    })
    .catch(() => {
      videoModal.style.display = 'none';
      // Fallback to file input with camera capture
      document.getElementById('file-input').click();
    });
}

function takeSnapshot() {
  const video = document.getElementById('live-video');
  const canvas = document.getElementById('live-canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0);

  currentPhoto = canvas.toDataURL('image/jpeg', 0.75);
  applyPhotoPreview(currentPhoto);
  closeCamera();
}

function closeCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(t => t.stop());
    cameraStream = null;
  }
  document.getElementById('camera-modal').style.display = 'none';
}

function stopCamera() { closeCamera(); }

function handleFileInput(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    currentPhoto = e.target.result;
    applyPhotoPreview(currentPhoto);
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function applyPhotoPreview(src) {
  const img = document.getElementById('preview-img');
  const preview = document.getElementById('photo-preview');
  img.src = src;
  img.style.display = 'block';
  document.querySelector('.photo-placeholder').style.display = 'none';
  preview.classList.add('has-photo');
}

// ====================================================
// GPS LOCATION
// ====================================================

function getLocation() {
  if (!navigator.geolocation) {
    document.getElementById('location-text').textContent = 'GPS not supported';
    return;
  }
  document.getElementById('location-text').textContent = 'Fetching location...';

  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude: lat, longitude: lng, accuracy } = pos.coords;
      currentLocation = { lat, lng, accuracy };
      document.getElementById('location-text').textContent =
        `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      document.getElementById('location-accuracy').textContent =
        `Accuracy: ±${Math.round(accuracy)}m`;
    },
    err => {
      currentLocation = null;
      document.getElementById('location-text').textContent = 'Location unavailable';
      document.getElementById('location-accuracy').textContent = err.message;
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// ====================================================
// LOCAL STORAGE
// ====================================================

function saveSessions() {
  try {
    // Don't store full photo blobs to avoid quota — store without photos for list
    const lightweight = sessions.map(s => ({
      ...s,
      houses: s.houses.map(h => ({ ...h, photo: null }))
    }));
    localStorage.setItem('larva_sessions', JSON.stringify(lightweight));
    localStorage.setItem('larva_sessions_full', JSON.stringify(sessions));
  } catch (e) {
    // If storage quota exceeded (photos), store lightweight only
    try {
      const lightweight = sessions.map(s => ({
        ...s,
        houses: s.houses.map(h => ({ ...h, photo: null }))
      }));
      localStorage.setItem('larva_sessions', JSON.stringify(lightweight));
    } catch(e2) { /* ignore */ }
  }
}

function loadSessions() {
  try {
    const full = localStorage.getItem('larva_sessions_full');
    const lite = localStorage.getItem('larva_sessions');
    sessions = JSON.parse(full || lite || '[]');
  } catch (e) {
    sessions = [];
  }
  renderPrevSessions();
}

function renderPrevSessions() {
  const card = document.getElementById('prev-sessions-card');
  const list = document.getElementById('prev-sessions-list');

  if (sessions.length === 0) {
    card.style.display = 'none';
    return;
  }

  card.style.display = 'block';

  // Build header with Clear All button
  list.innerHTML = `
    <div class="sessions-actions">
      <button class="btn-clear-all" onclick="clearAllSessions()">🗑️ Clear All</button>
    </div>
  ` + sessions.slice(0, 10).map(s => `
    <div class="session-item">
      <div onclick="viewSession(${s.id})" style="flex:1;cursor:pointer;">
        <div class="session-name">${escapeHtml(s.zoneNumber)} — ${escapeHtml(s.workerName)}</div>
        <div class="session-date">${s.date} · ${s.houses ? s.houses.length : 0} houses</div>
      </div>
      <div class="session-right">
        <span class="session-badge">${s.houses ? s.houses.length : 0} 🏠</span>
        <button class="session-delete-btn" onclick="deleteSession(${s.id})" title="Delete">✕</button>
      </div>
    </div>
  `).join('');
}

function deleteSession(id) {
  sessions = sessions.filter(s => s.id !== id);
  saveSessions();
  renderPrevSessions();
  showToast('🗑️ Session deleted');
}

function clearAllSessions() {
  if (!confirm('Delete ALL saved sessions? This cannot be undone.')) return;
  sessions = [];
  localStorage.removeItem('larva_sessions');
  localStorage.removeItem('larva_sessions_full');
  renderPrevSessions();
  showToast('🗑️ All sessions cleared');
}

function viewSession(id) {
  const s = sessions.find(x => x.id === id);
  if (!s) return;
  currentSession = s;
  buildReportScreen(s);
  showScreen('report-screen');
}

// ====================================================
// HELPERS
// ====================================================

function formatDate(d) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatDateTime(d) {
  return d.toLocaleString('en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true,
  });
}

// Select item type chip
function selectItemType(btn, value) {
  const current = document.getElementById('item-type-value').value;
  const otherBox = document.getElementById('item-type-other-text');

  // Toggle off if same clicked again
  if (current === value && value !== 'Other') {
    document.getElementById('item-type-value').value = '';
    btn.classList.remove('selected');
    if (otherBox) otherBox.style.display = 'none';
    return;
  }

  document.querySelectorAll('.item-type-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');

  if (value === 'Other') {
    document.getElementById('item-type-value').value = otherBox?.value.trim() || 'Other';
    if (otherBox) {
      otherBox.style.display = 'block';
      setTimeout(() => otherBox.focus(), 50);
    }
  } else {
    document.getElementById('item-type-value').value = value;
    if (otherBox) otherBox.style.display = 'none';
  }
}

function updateOtherType(text) {
  const currentType = document.getElementById('item-type-value').value;
  // Only update if 'Other' is selected
  if (document.getElementById('btn-other-type')?.classList.contains('selected')) {
    document.getElementById('item-type-value').value = text.trim() || 'Other';
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function showToast(msg, duration = 2500) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}
