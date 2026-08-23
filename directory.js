// ====================================================
// LARVA SURVEY APP – Saved Directory & Setup Screen
// ----------------------------------------------------
// Stores reusable Vector Collectors, Officers and
// Zone/Area presets so the home screen can auto-fill
// them instead of forcing the user to retype every day.
// ====================================================

'use strict';

const DIR_KEY = 'larva_directory_v1';

let directory = {
  collectors: [],   // { id, name, designation }
  officers:   [],   // { id, name, designation }
  places:     [],   // { id, zone, area }
  defaults:   { collectorId: null, officerId: null, placeId: null },
  autoSaveNew: true // silently remember newly typed people
};

// ====================================================
// STORAGE
// ====================================================

function loadDirectory() {
  try {
    const raw = localStorage.getItem(DIR_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      directory = {
        collectors: Array.isArray(parsed.collectors) ? parsed.collectors : [],
        officers:   Array.isArray(parsed.officers)   ? parsed.officers   : [],
        places:     Array.isArray(parsed.places)     ? parsed.places     : [],
        defaults:   Object.assign({ collectorId: null, officerId: null, placeId: null }, parsed.defaults || {}),
        autoSaveNew: parsed.autoSaveNew !== false
      };
    }
  } catch (e) {
    console.warn('Directory load failed:', e);
  }
}

function saveDirectory() {
  try {
    localStorage.setItem(DIR_KEY, JSON.stringify(directory));
  } catch (e) {
    console.warn('Directory save failed:', e);
  }
}

function newId() {
  return 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ====================================================
// QUICK AUTO-FILL DROPDOWNS  (live on the Setup screen)
// ====================================================

// Rebuild the three "pick a saved entry" dropdowns.
function refreshHomeSelectors() {
  const cSel = document.getElementById('collector-select');
  const oSel = document.getElementById('officer-select');
  const pSel = document.getElementById('place-select');
  if (!cSel || !oSel || !pSel) return;

  const manual = '<option value="__manual">✏️ Type manually…</option>';

  cSel.innerHTML = manual + directory.collectors.map(c =>
    `<option value="${c.id}">${escapeHtml(c.name)}${c.designation ? ' — ' + escapeHtml(c.designation) : ''}</option>`
  ).join('');

  oSel.innerHTML = manual + directory.officers.map(o =>
    `<option value="${o.id}">${escapeHtml(o.name)}${o.designation ? ' — ' + escapeHtml(o.designation) : ''}</option>`
  ).join('');

  pSel.innerHTML = manual + directory.places.map(p =>
    `<option value="${p.id}">${escapeHtml(p.zone)}${p.area ? ' — ' + escapeHtml(p.area) : ''}</option>`
  ).join('');

  // Show a hint row when nothing has been saved yet
  const emptyHint = document.getElementById('selector-empty-hint');
  if (emptyHint) {
    const nothing = !directory.collectors.length && !directory.officers.length && !directory.places.length;
    emptyHint.style.display = nothing ? 'block' : 'none';
  }

  const autoBox = document.getElementById('auto-save-new');
  if (autoBox) autoBox.checked = directory.autoSaveNew;
}

// Apply the saved defaults (star ⭐ entries) into the form fields.
function applyDefaultsToHome() {
  const { collectorId, officerId, placeId } = directory.defaults;

  const c = directory.collectors.find(x => x.id === collectorId);
  if (c) {
    document.getElementById('collector-select').value = c.id;
    setVal('worker-name', c.name);
    setVal('worker-designation', c.designation || '');
  }

  const o = directory.officers.find(x => x.id === officerId);
  if (o) {
    document.getElementById('officer-select').value = o.id;
    setVal('supervisor-name', o.name);
    setVal('supervisor-designation', o.designation || '');
  }

  const p = directory.places.find(x => x.id === placeId);
  if (p) {
    document.getElementById('place-select').value = p.id;
    setVal('zone-number', p.zone);
    setVal('area-name', p.area || '');
  }
}

function setVal(id, v) {
  const el = document.getElementById(id);
  if (el) el.value = v;
}

// ---- Dropdown change handlers ----

function onCollectorSelect(value) {
  if (value === '__manual') {
    directory.defaults.collectorId = null;
    setVal('worker-name', '');
    setVal('worker-designation', '');
    saveDirectory(); renderSetupIfOpen();
    showToast('✏️ Collector will be typed manually');
    return;
  }
  const c = directory.collectors.find(x => x.id === value);
  if (!c) return;
  setVal('worker-name', c.name);
  setVal('worker-designation', c.designation || '');
  directory.defaults.collectorId = c.id;
  saveDirectory(); renderSetupIfOpen();
}

function onOfficerSelect(value) {
  if (value === '__manual') {
    directory.defaults.officerId = null;
    setVal('supervisor-name', '');
    setVal('supervisor-designation', '');
    saveDirectory(); renderSetupIfOpen();
    showToast('✏️ Officer will be typed manually');
    return;
  }
  const o = directory.officers.find(x => x.id === value);
  if (!o) return;
  setVal('supervisor-name', o.name);
  setVal('supervisor-designation', o.designation || '');
  directory.defaults.officerId = o.id;
  saveDirectory(); renderSetupIfOpen();
}

function onPlaceSelect(value) {
  if (value === '__manual') {
    directory.defaults.placeId = null;
    setVal('zone-number', '');
    setVal('area-name', '');
    saveDirectory(); renderSetupIfOpen();
    showToast('✏️ Zone will be typed manually');
    return;
  }
  const p = directory.places.find(x => x.id === value);
  if (!p) return;
  setVal('zone-number', p.zone);
  setVal('area-name', p.area || '');
  directory.defaults.placeId = p.id;
  saveDirectory(); renderSetupIfOpen();
}

// When the user edits a home field by hand, flip the matching Setup
// dropdown back to "Type manually" so it never claims a saved entry is
// being used. (The dropdown itself lives on the Setup screen.)
function markManual(which) {
  const map = { collector: 'collector-select', officer: 'officer-select', place: 'place-select' };
  const sel = document.getElementById(map[which]);
  if (sel) sel.value = '__manual';
}

function toggleAutoSaveNew(checked) {
  directory.autoSaveNew = !!checked;
  saveDirectory();
}

// ====================================================
// AUTO-LEARN: remember details typed on the home screen
// ====================================================

function rememberSessionDetails(s) {
  if (!directory.autoSaveNew) return;
  let learned = 0;

  if (s.workerName) {
    let c = directory.collectors.find(x =>
      x.name.toLowerCase() === s.workerName.toLowerCase());
    if (!c) {
      c = { id: newId(), name: s.workerName, designation: s.workerDesignation || '' };
      directory.collectors.push(c);
      learned++;
    } else if (s.workerDesignation && !c.designation) {
      c.designation = s.workerDesignation;
    }
    directory.defaults.collectorId = c.id;
  }

  if (s.supervisorName) {
    let o = directory.officers.find(x =>
      x.name.toLowerCase() === s.supervisorName.toLowerCase());
    if (!o) {
      o = { id: newId(), name: s.supervisorName, designation: s.supervisorDesignation || '' };
      directory.officers.push(o);
      learned++;
    } else if (s.supervisorDesignation && !o.designation) {
      o.designation = s.supervisorDesignation;
    }
    directory.defaults.officerId = o.id;
  }

  if (s.zoneNumber) {
    let p = directory.places.find(x =>
      x.zone.toLowerCase() === s.zoneNumber.toLowerCase() &&
      (x.area || '').toLowerCase() === (s.areaName || '').toLowerCase());
    if (!p) {
      p = { id: newId(), zone: s.zoneNumber, area: s.areaName || '' };
      directory.places.push(p);
      learned++;
    }
    directory.defaults.placeId = p.id;
  }

  saveDirectory();
  refreshHomeSelectors();
  if (learned > 0 && typeof showToast === 'function') {
    setTimeout(() => showToast('💾 Saved to your list for next time'), 900);
  }
}

// ====================================================
// SETUP SCREEN
// ====================================================

function openSetup() {
  renderSetup();
  refreshHomeSelectors();   // rebuild the Quick Auto-Fill dropdowns
  applyDefaultsToHome();    // and show the currently selected entries
  showScreen('setup-screen');
}

// Re-render the saved lists only when the Setup screen is actually on
// screen — avoids pointless DOM work while surveying.
function renderSetupIfOpen() {
  const el = document.getElementById('setup-screen');
  if (el && el.classList.contains('active')) renderSetup();
}

function closeSetup() {
  refreshHomeSelectors();
  applyDefaultsToHome();
  showScreen('home-screen');
}

function renderSetup() {
  // --- Collectors ---
  document.getElementById('setup-collector-list').innerHTML =
    directory.collectors.length
      ? directory.collectors.map(c => setupRow('collector', c.id,
          c.name, c.designation || 'No designation',
          directory.defaults.collectorId === c.id)).join('')
      : emptyRow('No vector collectors saved yet.');

  // --- Officers ---
  document.getElementById('setup-officer-list').innerHTML =
    directory.officers.length
      ? directory.officers.map(o => setupRow('officer', o.id,
          o.name, o.designation || 'No designation',
          directory.defaults.officerId === o.id)).join('')
      : emptyRow('No officers saved yet.');

  // --- Places ---
  document.getElementById('setup-place-list').innerHTML =
    directory.places.length
      ? directory.places.map(p => setupRow('place', p.id,
          p.zone, p.area || 'No area', directory.defaults.placeId === p.id)).join('')
      : emptyRow('No zones saved yet.');

  // Counts in the section headers
  setText('count-collectors', directory.collectors.length);
  setText('count-officers', directory.officers.length);
  setText('count-places', directory.places.length);
}

function setText(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

function setupRow(kind, id, title, subtitle, isDefault) {
  return `
    <div class="setup-item ${isDefault ? 'is-default' : ''}">
      <button class="star-btn ${isDefault ? 'active' : ''}"
              onclick="setDefaultEntry('${kind}','${id}')"
              title="Use as default">${isDefault ? '⭐' : '☆'}</button>
      <div class="setup-item-text">
        <div class="setup-item-title">${escapeHtml(title)}</div>
        <div class="setup-item-sub">${escapeHtml(subtitle)}</div>
      </div>
      <button class="setup-edit-btn" onclick="editEntry('${kind}','${id}')" title="Edit">✏️</button>
      <button class="setup-del-btn" onclick="deleteEntry('${kind}','${id}')" title="Delete">✕</button>
    </div>`;
}

function emptyRow(msg) {
  return `<div class="setup-empty">${escapeHtml(msg)}</div>`;
}

// ---- Add ----

function addCollector() {
  const name = document.getElementById('new-collector-name').value.trim();
  const desig = document.getElementById('new-collector-desig').value.trim();
  if (!name) { showToast('⚠️ Enter a name first'); return; }
  directory.collectors.push({ id: newId(), name, designation: desig });
  if (!directory.defaults.collectorId) {
    directory.defaults.collectorId = directory.collectors[directory.collectors.length - 1].id;
  }
  document.getElementById('new-collector-name').value = '';
  document.getElementById('new-collector-desig').value = '';
  saveDirectory(); renderSetup(); refreshHomeSelectors(); applyDefaultsToHome();
  showToast('✅ Vector collector added');
}

function addOfficer() {
  const name = document.getElementById('new-officer-name').value.trim();
  const desig = document.getElementById('new-officer-desig').value.trim();
  if (!name) { showToast('⚠️ Enter a name first'); return; }
  directory.officers.push({ id: newId(), name, designation: desig });
  if (!directory.defaults.officerId) {
    directory.defaults.officerId = directory.officers[directory.officers.length - 1].id;
  }
  document.getElementById('new-officer-name').value = '';
  document.getElementById('new-officer-desig').value = '';
  saveDirectory(); renderSetup(); refreshHomeSelectors(); applyDefaultsToHome();
  showToast('✅ Officer added');
}

function addPlace() {
  const zone = document.getElementById('new-place-zone').value.trim();
  const area = document.getElementById('new-place-area').value.trim();
  if (!zone) { showToast('⚠️ Enter a zone number first'); return; }
  directory.places.push({ id: newId(), zone, area });
  if (!directory.defaults.placeId) {
    directory.defaults.placeId = directory.places[directory.places.length - 1].id;
  }
  document.getElementById('new-place-zone').value = '';
  document.getElementById('new-place-area').value = '';
  saveDirectory(); renderSetup(); refreshHomeSelectors(); applyDefaultsToHome();
  showToast('✅ Zone / area added');
}

// ---- Edit / delete / default ----

function listOf(kind) {
  return kind === 'collector' ? directory.collectors
       : kind === 'officer'   ? directory.officers
       : directory.places;
}

function editEntry(kind, id) {
  const item = listOf(kind).find(x => x.id === id);
  if (!item) return;

  if (kind === 'place') {
    const zone = prompt('Zone number:', item.zone);
    if (zone === null) return;
    if (!zone.trim()) { showToast('⚠️ Zone cannot be empty'); return; }
    const area = prompt('Area / Ward name:', item.area || '');
    if (area === null) return;
    item.zone = zone.trim();
    item.area = area.trim();
  } else {
    const name = prompt('Name:', item.name);
    if (name === null) return;
    if (!name.trim()) { showToast('⚠️ Name cannot be empty'); return; }
    const desig = prompt('Designation:', item.designation || '');
    if (desig === null) return;
    item.name = name.trim();
    item.designation = desig.trim();
  }
  saveDirectory(); renderSetup(); refreshHomeSelectors(); applyDefaultsToHome();
  showToast('✏️ Updated');
}

function deleteEntry(kind, id) {
  const item = listOf(kind).find(x => x.id === id);
  if (!item) return;
  const label = kind === 'place' ? item.zone : item.name;
  if (!confirm(`Delete "${label}" from your saved list?`)) return;

  if (kind === 'collector') {
    directory.collectors = directory.collectors.filter(x => x.id !== id);
    if (directory.defaults.collectorId === id) directory.defaults.collectorId = null;
  } else if (kind === 'officer') {
    directory.officers = directory.officers.filter(x => x.id !== id);
    if (directory.defaults.officerId === id) directory.defaults.officerId = null;
  } else {
    directory.places = directory.places.filter(x => x.id !== id);
    if (directory.defaults.placeId === id) directory.defaults.placeId = null;
  }
  saveDirectory(); renderSetup(); refreshHomeSelectors();
  showToast('🗑️ Removed');
}

function setDefaultEntry(kind, id) {
  const key = kind === 'collector' ? 'collectorId' : kind === 'officer' ? 'officerId' : 'placeId';
  // Tapping the active star clears the default
  directory.defaults[key] = directory.defaults[key] === id ? null : id;
  saveDirectory();
  renderSetup();
  // Keep the Quick Auto-Fill dropdowns + the home form in step with the star
  refreshHomeSelectors();
  applyDefaultsToHome();
  showToast(directory.defaults[key] ? '⭐ Selected for auto-fill' : '☆ Selection cleared');
}

// ---- Bulk tools ----

function exportDirectory() {
  const blob = new Blob([JSON.stringify(directory, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'larvae-survey-setup.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast('⬇️ Setup exported');
}

function importDirectory(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!parsed || typeof parsed !== 'object') throw new Error('bad file');
      directory.collectors = (parsed.collectors || []).concat(directory.collectors);
      directory.officers   = (parsed.officers   || []).concat(directory.officers);
      directory.places     = (parsed.places     || []).concat(directory.places);
      dedupeDirectory();
      saveDirectory(); renderSetup(); refreshHomeSelectors(); applyDefaultsToHome();
      showToast('✅ Setup imported');
    } catch (err) {
      showToast('⚠️ Invalid setup file');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

function dedupeDirectory() {
  const seen = new Set();
  directory.collectors = directory.collectors.filter(c => {
    const k = 'c' + (c.name || '').toLowerCase();
    if (!c.id) c.id = newId();
    if (seen.has(k)) return false; seen.add(k); return true;
  });
  directory.officers = directory.officers.filter(o => {
    const k = 'o' + (o.name || '').toLowerCase();
    if (!o.id) o.id = newId();
    if (seen.has(k)) return false; seen.add(k); return true;
  });
  directory.places = directory.places.filter(p => {
    const k = 'p' + (p.zone || '').toLowerCase() + '|' + (p.area || '').toLowerCase();
    if (!p.id) p.id = newId();
    if (seen.has(k)) return false; seen.add(k); return true;
  });
}

function clearDirectory() {
  if (!confirm('Erase ALL saved collectors, officers and zones? This cannot be undone.')) return;
  directory.collectors = [];
  directory.officers = [];
  directory.places = [];
  directory.defaults = { collectorId: null, officerId: null, placeId: null };
  saveDirectory(); renderSetup(); refreshHomeSelectors();
  showToast('🗑️ Setup cleared');
}
