# What's New — Auto-Fill Names + Setup Page

## 1. ⚙️ Setup screen (new)
Open it from the **gear icon** in the home header (or the "⚙️ Setup" button on the Quick Auto-Fill card).

Manage three saved lists:
- **👤 Vector Collectors** — name + designation
- **👨‍💼 Officers** — name + designation
- **📍 Zones / Areas** — zone number + area/ward name

For each saved entry you can:
- **⭐ Star it** → that entry loads automatically every time the app opens (tap again to unstar)
- **✏️ Edit** name / designation
- **✕ Delete**

Also included: **Export / Import** your setup as a `.json` file (to move it to another phone) and **Clear All**.

## 2. ⚡ Quick Auto-Fill on the first page
Three dropdowns above "Start New Survey":
- Saved Vector Collector → fills name + designation
- Saved Officer → fills name + designation
- Saved Zone / Area → fills zone + area

Every dropdown has a **"✏️ Type manually…"** option that blanks the fields so you can type freely. All the text boxes stay fully editable — picking a saved entry is only a shortcut. If you edit a field by hand, the dropdown flips back to "Type manually" so it never shows the wrong source.

## 3. Automatic remembering
The checkbox **"Automatically remember new names I type"** (on by default) means: whenever you tap **Start Survey**, any new collector / officer / zone you typed is silently added to your saved lists and set as the default for next time. So after the very first survey the app is already self-filling — no setup required.

After finishing a report and tapping **🔄 New Session**, the form comes back pre-filled with your defaults instead of empty.

## Files changed
| File | Change |
|---|---|
| `directory.js` | **NEW** — saved lists, dropdown logic, setup screen |
| `index.html` | Setup button, Quick Auto-Fill card, Setup screen, loads `directory.js` |
| `app.js` | Loads directory on start, learns details on Start Survey, keeps defaults on New Session |
| `style.css` | Styles for dropdowns, setup rows, star/edit/delete, backup tools |
| `sw.js` | Cache bumped to `larva-survey-v5`, caches `directory.js` |

Storage key: `larva_directory_v1` in localStorage (separate from your survey sessions, so clearing sessions does not erase your saved names).

> Note: `libs/jspdf.umd.min.js`, `libs/jspdf.plugin.autotable.min.js` and `fonts/NotoSansBengali-Regular.ttf` were not part of the upload — keep those folders from your original project alongside these files so PDF export keeps working.

---

# Update 2 — Bangla text in the PDF is fixed

## What was wrong
jsPDF *embeds* a Bengali font but does **no OpenType shaping**. Bengali needs it:

- যুক্তাক্ষর (conjuncts): `ক + ্ + ষ → ক্ষ`
- pre-base vowels: `ক + ি → কি` (the ি must visually move **before** the ক)
- রেফ / র-ফলা / য-ফলা and matra positioning

jsPDF just writes the glyphs in typed order, so Bangla came out broken/scrambled — while English (which needs no shaping) looked perfect. That's why only Bangla was affected.

## The fix — `bangla-text.js` (new file)
Your phone's browser already has a full shaping engine (HarfBuzz) behind `<canvas>`. So now:

- **Bangla runs** are drawn to an off-screen canvas at ~288 DPI (correctly shaped) and placed into the PDF at exactly the position/size the text would have occupied.
- **English text stays real PDF text** — selectable, searchable, vector. Nothing about English output changed.
- **Mixed strings** ("House #12, রোড ৫") are handled as one shaped run, so they look right too.
- The canvas uses the **same TTF bytes** the PDF font loader already downloaded/cached, so there is no extra download and it works fully offline. If that file is missing it falls back to the device's own Bengali font — shaping is still correct.

Applied everywhere Bangla can appear: survey information box, the house table (address / item / notes), the page footer, and the signature block.

## Also fixed / improved
- **Bangla table text now wraps inside its cell.** The Notes column is auto-width, and its real width is now computed instead of guessed, plus a hard clamp so a line can never spill past the cell border.
- **Column widths rebalanced** (Item 24, Time 26, GPS 22 mm) to give the Notes column usable room.
- **File size**: PDFs are now generated with stream compression. A 15-house Bangla report went from **4.5 MB → 270 KB**, and an English one from 203 KB → **38 KB**.

`sample-bangla-report.pdf` in this folder is a real export from the updated code so you can check the Bangla rendering.

## Files changed in this update
| File | Change |
|---|---|
| `bangla-text.js` | **NEW** — canvas shaping, wrapping, autoTable hooks |
| `report.js` | Uses `bnText` / `bnPrepareCell` / `bnDrawCell`, `compress: true`, fixed column widths |
| `index.html` | Loads `bangla-text.js` before `report.js` |
| `sw.js` | Cache bumped to `larva-survey-v6`, caches `bangla-text.js` |

> `libs/jspdf.umd.min.js`, `libs/jspdf.plugin.autotable.min.js` and `fonts/NotoSansBengali-Regular.ttf` are now included in this folder too, so the app runs and exports PDFs offline out of the box.


---

# Update 3 — Home page cleaned up

- The **"Quick fill:" chips** were removed from the home screen (they remain in ⚙️ Setup, attached to each saved person).
- The **⚡ Quick Auto-Fill card moved out of the home screen and into ⚙️ Setup.** The first page is now only the *Start New Survey* form.

## How switching works now
Open **⚙️ Setup** (gear, top right of the home header) → **⚡ Quick Auto-Fill** → pick the Vector Collector, Officer and Zone/Area. Tap **✅ Done** and the home form is already filled in with that choice.

- The dropdowns and the ⭐ stars in the saved lists are two views of the same setting — changing either one updates the other instantly.
- Choosing **"✏️ Type manually…"** clears that selection so the home field opens blank and you type it fresh.
- Typing directly on the home page still works and is still remembered automatically (if that checkbox is on).
- A one-line hint on the home card points to Setup so the option stays discoverable.

`sw.js` cache bumped to `larva-survey-v7`.

---

# Update 4 — New "Where was Larva Found?" list

The breeding-site buttons in the Add House modal were replaced with your 12:

| | |
|---|---|
| 🌊 Flooded Floor | 🚗 Basement / Parking |
| 🛢️ Water Drum | 🚰 Water Meter |
| 🌷 Flower Pot | 🛁 Bucket / Tub |
| ⭕ Old Tire | 💧 Water Container |
| ♻️ Plastic Pot | 🏺 Clay Pot |
| 🚿 Drain / Gutter | 📦 Other |

Removed: Discarded Can / Bottle, Tree Hole / Stump, Bird Bath / Pond, Roof Gutter (merged into Drain / Gutter).

**Emoji note:** in your screenshot 🪴 (Flower Pot) and 🪣 (Bucket) showed as empty boxes — those are Unicode 13 emoji your phone's font doesn't have. Every icon in the new list is an older, universally supported emoji, so no more boxes.

📦 **Other** still opens the free-text box, so anything not on the list can be typed in.

Old saved sessions keep whatever item type they were recorded with — nothing breaks. `sw.js` cache bumped to `larva-survey-v8`.

---

# Update 5 — PDF file name now includes the time

**Before:** `Larva_Survey_Zone-03_16_August_2026.pdf` — the same name every time, so re-exporting the same zone on the same day made the phone ask to overwrite or saved it as "(1)", "(2)".

**Now:** `Larvae_survey_Zone-03_16_August_02-26-32_PM.pdf`

- `Larvae_survey_` + **Zone** + **survey day & month** + the **current time** (12-hour, to the second).
- The time makes every export a brand-new file — no overwrite prompt, no "download again", and two rounds in the same zone on the same day sit side by side instead of clashing.
- The day/month come from the survey's start time; the time is the moment you tapped download.
- Bangla zone names are kept as-is (`Larvae_survey_অঞ্চল-০৯_16_August_...`). Characters phones reject in file names (`/ \ : * ? " < > |`) are stripped automatically, and an empty zone falls back to `Zone`.

`sw.js` cache bumped to `larva-survey-v9`.
