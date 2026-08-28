import './styles.css';
import { clearProject, loadProject, saveProject, type ProjectSettings, type StoredProject } from './db';
import { captureReturnedLicense, checkoutUrl, isOptimisticallyUnlocked, removeLicense, storeLicense, storedToken, verifyLicense } from './license';
import { FRAME_OPTIONS, formatDuration, frameLabel, frameTimes, normalizeCrop, pageNumbers, safeFilename, type Crop } from './proof';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <header class="site-header">
    <a class="brand" href="/" aria-label="Flipbook Proof home">
      <span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
      <span>Flipbook Proof</span>
    </a>
    <nav aria-label="Main navigation">
      <a href="#studio">Studio</a>
      <a href="#how">How it works</a>
      <a href="#unlock">Unlock</a>
    </nav>
    <span id="networkStatus" class="network-status" role="status">Works offline</span>
  </header>

  <main id="main" tabindex="-1">
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-copy">
        <p class="eyebrow"><span>Local-first</span> Flipbook planning room</p>
        <h1 id="hero-title">Proof the motion.<br><em>Then draw it.</em></h1>
        <p class="lede">Turn a short video into numbered, onion-skinned trace sheets with a binding-safe margin—before you spend a day drawing the wrong pages.</p>
        <div class="hero-actions">
          <a class="button primary" href="#studio">Choose your video</a>
          <span class="privacy-note"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 10V7a5 5 0 0 1 10 0v3m-12 0h14v11H5z"/></svg> Your clip never leaves this device</span>
        </div>
      </div>
      <figure class="hero-art">
        <picture>
          <source media="(max-width: 620px)" srcset="/assets/hero-workbench-720.webp" />
          <img src="/assets/hero-workbench-1200.webp" width="1200" height="800" fetchpriority="high" alt="Art-deco illustration of motion frames becoming a hand-bound flipbook on an artist's workbench" />
        </picture>
        <figcaption>From moving reference to a page-by-page route.</figcaption>
      </figure>
    </section>

    <section id="studio" class="studio" aria-labelledby="studio-title">
      <div class="section-heading">
        <div><p class="eyebrow">The proof room</p><h2 id="studio-title">Build your trace plan</h2></div>
        <button id="startOver" class="text-button" type="button" hidden>Start over</button>
      </div>

      <ol class="route" aria-label="Proof progress">
        <li class="active" data-route="1"><span>1</span> Load</li>
        <li data-route="2"><span>2</span> Crop</li>
        <li data-route="3"><span>3</span> Pace</li>
        <li data-route="4"><span>4</span> Proof</li>
        <li data-route="5"><span>5</span> Print</li>
      </ol>

      <div id="status" class="status" aria-live="polite"></div>

      <section id="loadPanel" class="load-panel" aria-labelledby="load-title">
        <div class="ticket-number" aria-hidden="true">01</div>
        <div>
          <h3 id="load-title">Bring in one short clip</h3>
          <p>MP4, WebM, or MOV supported by your browser. Up to <span id="durationCap">60</span> seconds. We keep only extracted frames, never the source video.</p>
        </div>
        <label class="file-button" for="videoFile">Choose video</label>
        <input id="videoFile" type="file" accept="video/mp4,video/webm,video/quicktime,video/*" />
        <p class="drop-note">or drop a clip anywhere in this panel</p>
      </section>

      <div id="workspace" class="workspace" hidden>
        <section class="source-column" aria-labelledby="crop-title">
          <div class="panel-heading"><span class="step-tag">02 · Crop</span><h3 id="crop-title">Set the drawing window</h3></div>
          <div class="video-stage">
            <video id="sourceVideo" controls playsinline preload="metadata"></video>
            <div id="cropBox" class="crop-box" aria-hidden="true"><span></span></div>
          </div>
          <p id="videoMeta" class="meta-line"></p>
          <div class="preset-row" role="group" aria-label="Crop presets">
            <button type="button" data-preset="full">Full frame</button>
            <button type="button" data-preset="square">Centre square</button>
            <button type="button" data-preset="portrait">Portrait</button>
          </div>
          <details class="crop-details">
            <summary>Fine-tune crop</summary>
            <div class="range-grid">
              <label>Left <output id="cropXOut">0%</output><input id="cropX" type="range" min="0" max="80" value="0" /></label>
              <label>Top <output id="cropYOut">0%</output><input id="cropY" type="range" min="0" max="80" value="0" /></label>
              <label>Width <output id="cropWOut">100%</output><input id="cropW" type="range" min="20" max="100" value="100" /></label>
              <label>Height <output id="cropHOut">100%</output><input id="cropH" type="range" min="20" max="100" value="100" /></label>
            </div>
          </details>
        </section>

        <section class="pace-column" aria-labelledby="pace-title">
          <div class="panel-heading"><span class="step-tag">03 · Pace</span><h3 id="pace-title">Choose the beats</h3></div>
          <div class="range-grid timeline-fields">
            <label>Start <output id="startOut">0:00</output><input id="clipStart" type="range" min="0" max="1" value="0" step="0.05" /></label>
            <label>End <output id="endOut">0:00</output><input id="clipEnd" type="range" min="0" max="1" value="1" step="0.05" /></label>
          </div>
          <fieldset>
            <legend>How many pages?</legend>
            <div id="frameOptions" class="frame-options">
              ${FRAME_OPTIONS.map((count) => `<label><input type="radio" name="frameCount" value="${count}" ${count === 24 ? 'checked' : ''} /><span>${count}<small>${count > 24 ? 'Plus' : count === 24 ? 'Popular' : 'Quick'}</small></span></label>`).join('')}
            </div>
          </fieldset>
          <div class="pace-note"><strong id="paceSummary">24 pages</strong><span id="intervalSummary">Evenly sampled across the clip</span></div>
          <button id="extractFrames" class="button primary wide" type="button">Extract 24 frames</button>
          <button id="cancelExtract" class="button secondary wide" type="button" hidden>Cancel extraction</button>
          <div id="extractProgress" class="progress-wrap" hidden>
            <label for="progressBar">Reading frames locally… <span id="progressText">0%</span></label>
            <progress id="progressBar" max="100" value="0"></progress>
          </div>
        </section>
      </div>

      <section id="proofPanel" class="proof-panel" aria-labelledby="proof-title" hidden>
        <div class="proof-head">
          <div><span class="step-tag">04 · Proof</span><h3 id="proof-title">Check the movement</h3><p>Use Left and Right Arrow keys in the film strip to inspect every page.</p></div>
          <div class="proof-controls">
            <label>Onion skin
              <select id="onionMode"><option value="previous">Previous frame</option><option value="next">Next frame</option><option value="both">Both neighbours</option><option value="off">Off</option></select>
            </label>
            <label>Opacity <output id="onionOut">24%</output><input id="onionOpacity" type="range" min="8" max="50" value="24" /></label>
          </div>
        </div>
        <div class="light-table">
          <div id="proofCanvas" class="proof-canvas" role="img" aria-label="Selected frame with previous frame onion skin"></div>
          <div class="frame-caption"><button id="prevFrame" type="button" aria-label="Previous frame">←</button><strong id="frameCaption">Frame 1 of 24</strong><button id="nextFrame" type="button" aria-label="Next frame">→</button></div>
        </div>
        <div id="filmstrip" class="filmstrip" role="listbox" tabindex="0" aria-label="Extracted frames"></div>
      </section>

      <section id="printPanel" class="print-panel" aria-labelledby="print-title" hidden>
        <div class="panel-heading"><span class="step-tag">05 · Print</span><h3 id="print-title">Set the physical stack</h3></div>
        <div class="print-settings">
          <fieldset><legend>Paper</legend><label><input type="radio" name="pageSize" value="A4" checked /> A4</label><label><input type="radio" name="pageSize" value="letter" /> US Letter</label></fieldset>
          <fieldset><legend>Binding margin</legend><label><input type="radio" name="bindingSide" value="left" checked /> Left edge</label><label><input type="radio" name="bindingSide" value="right" /> Right edge</label></fieldset>
          <fieldset><legend>Stack order</legend><label><input type="radio" name="pageOrder" value="forward" checked /> 1 → last</label><label><input type="radio" name="pageOrder" value="reverse" /> Last → 1</label></fieldset>
        </div>
        <div class="print-callout"><span aria-hidden="true">✦</span><p><strong>Your proof includes</strong> a contact sheet, <span id="sheetCount">24</span> numbered trace pages, crop marks, and a 22 mm no-draw binding margin.</p></div>
        <div class="action-row">
          <button id="printProof" class="button primary" type="button">Print proof / save PDF</button>
          <button id="exportProject" class="button secondary" type="button">Export project</button>
          <label class="button secondary import-button" for="importProject">Import project</label><input id="importProject" type="file" accept="application/json,.json" />
        </div>
      </section>
    </section>

    <section id="how" class="how" aria-labelledby="how-title">
      <p class="eyebrow">A clean first stack</p><h2 id="how-title">Three decisions before pencil meets paper</h2>
      <ol><li><span>01</span><h3>Crop the action</h3><p>Keep the subject large and every sheet consistent.</p></li><li><span>02</span><h3>Check the in-betweens</h3><p>Onion skin exposes jumps before they become drawings.</p></li><li><span>03</span><h3>Bind with confidence</h3><p>Page order and no-draw margins survive the trip to paper.</p></li></ol>
    </section>

    <section id="unlock" class="unlock" aria-labelledby="unlock-title">
      <div><p class="eyebrow">One project, one useful free tier</p><h2 id="unlock-title">24 pages are free.<br>Longer stories are yours for $12.</h2><p>Flipbook Proof Plus is a one-time purchase. Unlock 36, 48, and 60-page proofs on your devices. Printing, project export, accessibility, and privacy are always free.</p></div>
      <div class="license-card">
        <p id="licenseState" class="license-state">Free plan · up to 24 pages</p>
        <a id="buyLink" class="button primary wide" href="${checkoutUrl()}">Buy Plus once · $12</a>
        <details><summary>Have a license? Restore it</summary><form id="licenseForm"><label for="licenseToken">License token</label><div class="input-action"><input id="licenseToken" type="text" autocomplete="off" spellcheck="false" /><button type="submit">Verify</button></div><p id="licenseMessage" role="status"></p></form></details>
        <button id="removeLicense" class="text-button" type="button" hidden>Remove license from this device</button>
        <small>Sociobot/Dodo is the merchant of record. Refunds are handled there and revoke the license automatically.</small>
      </div>
    </section>
  </main>

  <footer><div class="brand"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span><span>Flipbook Proof</span></div><p>Private source video. Local frame extraction. No account required.</p><nav aria-label="Legal"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="https://sociobot.in">A Param Factory product</a></nav><p class="disclosure">Hero artwork generated for this product; no example footage is included.</p></footer>
  <div id="printRoot" aria-hidden="true"></div>
  <div id="updateToast" class="toast" role="status" hidden><span>An updated proof room is ready.</span><button type="button">Reload</button></div>
`;

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const video = $('#sourceVideo') as HTMLVideoElement;
const fileInput = $('#videoFile') as HTMLInputElement;
const status = $('#status');
const workspace = $('#workspace');
const proofPanel = $('#proofPanel');
const printPanel = $('#printPanel');
const loadPanel = $('#loadPanel');
const progressWrap = $('#extractProgress');
const progressBar = $('#progressBar') as HTMLProgressElement;
const maxDuration = ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4 || innerWidth <= 480 ? 30 : 60;
$('#durationCap').textContent = String(maxDuration);

let crop: Crop = { x: 0, y: 0, width: 100, height: 100 };
let duration = 0;
let sourceName = 'flipbook-project';
let frames: Blob[] = [];
let frameUrls: string[] = [];
let activeFrame = 0;
let extracting = false;
let cancelRequested = false;
let unlocked = false;

captureReturnedLicense();
void refreshLicense(false);
void restoreSavedProject();
setupEvents();
registerServiceWorker();
updateNetworkState();

function setupEvents(): void {
  fileInput.addEventListener('change', () => fileInput.files?.[0] && void loadVideo(fileInput.files[0]));
  for (const event of ['dragenter', 'dragover']) loadPanel.addEventListener(event, (e) => { e.preventDefault(); loadPanel.classList.add('dragging'); });
  for (const event of ['dragleave', 'drop']) loadPanel.addEventListener(event, (e) => { e.preventDefault(); loadPanel.classList.remove('dragging'); });
  loadPanel.addEventListener('drop', (event) => {
    const file = (event as DragEvent).dataTransfer?.files[0];
    if (file) void loadVideo(file);
  });
  const fileLabel = document.querySelector<HTMLLabelElement>('label[for="videoFile"]')!;
  fileLabel.tabIndex = 0;
  fileLabel.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); fileInput.click(); } });
  const importLabel = document.querySelector<HTMLLabelElement>('label[for="importProject"]')!;
  importLabel.tabIndex = 0;
  importLabel.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); ($('#importProject') as HTMLInputElement).click(); } });
  video.addEventListener('loadedmetadata', handleMetadata);
  video.addEventListener('error', () => showStatus('error', 'This browser could not read that clip. Try an MP4 (H.264) or WebM file.'));

  for (const input of ['cropX', 'cropY', 'cropW', 'cropH']) $(`#${input}`).addEventListener('input', readCropInputs);
  document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((button) => button.addEventListener('click', () => applyCropPreset(button.dataset.preset!)));
  $('#clipStart').addEventListener('input', updateTimeline);
  $('#clipEnd').addEventListener('input', updateTimeline);
  document.querySelectorAll<HTMLInputElement>('input[name="frameCount"]').forEach((input) => input.addEventListener('change', updatePace));
  $('#extractFrames').addEventListener('click', () => void extractFrames());
  $('#cancelExtract').addEventListener('click', () => { cancelRequested = true; });

  $('#onionMode').addEventListener('change', () => { renderProof(); void persistSettings(); });
  $('#onionOpacity').addEventListener('input', () => { renderProof(); void persistSettings(); });
  $('#prevFrame').addEventListener('click', () => selectFrame(activeFrame - 1));
  $('#nextFrame').addEventListener('click', () => selectFrame(activeFrame + 1));
  $('#filmstrip').addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); selectFrame(activeFrame + 1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); selectFrame(activeFrame - 1); }
    if (event.key === 'Home') { event.preventDefault(); selectFrame(0); }
    if (event.key === 'End') { event.preventDefault(); selectFrame(frames.length - 1); }
  });

  document.querySelectorAll<HTMLInputElement>('input[name="pageSize"], input[name="bindingSide"], input[name="pageOrder"]').forEach((input) => input.addEventListener('change', () => void persistSettings()));
  $('#printProof').addEventListener('click', printProof);
  $('#exportProject').addEventListener('click', () => void exportProject());
  ($('#importProject') as HTMLInputElement).addEventListener('change', (event) => void importProject((event.target as HTMLInputElement).files?.[0]));
  $('#startOver').addEventListener('click', () => void startOver());
  $('#licenseForm').addEventListener('submit', (event) => void submitLicense(event));
  $('#removeLicense').addEventListener('click', () => { removeLicense(); void refreshLicense(false); });
  addEventListener('online', updateNetworkState);
  addEventListener('offline', updateNetworkState);
}

async function loadVideo(file: File): Promise<void> {
  if (!file.type.startsWith('video/') && !/\.(mp4|mov|webm|m4v)$/i.test(file.name)) {
    showStatus('error', 'That does not look like a video. Choose an MP4, MOV, or WebM clip.');
    return;
  }
  sourceName = safeFilename(file.name);
  video.src = URL.createObjectURL(file);
  video.load();
  showStatus('loading', 'Reading clip details locally…');
}

function handleMetadata(): void {
  duration = video.duration;
  if (!Number.isFinite(duration) || duration <= 0) {
    showStatus('error', 'The clip has no readable duration. Try exporting it again as MP4 or WebM.');
    return;
  }
  if (duration > maxDuration + 0.1) {
    video.removeAttribute('src');
    video.load();
    showStatus('error', `This device’s safe limit is ${maxDuration} seconds. Trim the clip and try again.`);
    return;
  }
  const start = $('#clipStart') as HTMLInputElement;
  const end = $('#clipEnd') as HTMLInputElement;
  start.max = String(duration); start.value = '0';
  end.max = String(duration); end.value = String(duration);
  $('#videoMeta').textContent = `${sourceName} · ${formatDuration(duration)} · ${video.videoWidth} × ${video.videoHeight}`;
  loadPanel.hidden = true;
  workspace.hidden = false;
  ($('#startOver') as HTMLButtonElement).hidden = false;
  updateTimeline(); updatePace(); updateRoute(2);
  showStatus('success', 'Clip ready. Set the drawing window and choose the number of pages.');
}

function readCropInputs(): void {
  crop = normalizeCrop({
    x: Number(($('#cropX') as HTMLInputElement).value), y: Number(($('#cropY') as HTMLInputElement).value),
    width: Number(($('#cropW') as HTMLInputElement).value), height: Number(($('#cropH') as HTMLInputElement).value),
  });
  syncCropInputs();
}

function applyCropPreset(preset: string): void {
  if (preset === 'full') crop = { x: 0, y: 0, width: 100, height: 100 };
  if (preset === 'square') {
    const ratio = video.videoHeight / video.videoWidth;
    crop = ratio <= 1 ? { x: (100 - ratio * 100) / 2, y: 0, width: ratio * 100, height: 100 } : { x: 0, y: (100 - 100 / ratio) / 2, width: 100, height: 100 / ratio };
  }
  if (preset === 'portrait') {
    const targetWidth = Math.min(100, (video.videoHeight * 0.75 / video.videoWidth) * 100);
    crop = { x: (100 - targetWidth) / 2, y: 0, width: targetWidth, height: 100 };
  }
  syncCropInputs();
}

function syncCropInputs(): void {
  crop = normalizeCrop(crop);
  const map: Array<[string, keyof Crop, string]> = [['cropX', 'x', 'cropXOut'], ['cropY', 'y', 'cropYOut'], ['cropW', 'width', 'cropWOut'], ['cropH', 'height', 'cropHOut']];
  for (const [inputId, key, outputId] of map) {
    const input = $(`#${inputId}`) as HTMLInputElement;
    input.value = String(Math.round(crop[key]));
    if (key === 'width') input.max = String(100 - crop.x);
    if (key === 'height') input.max = String(100 - crop.y);
    $(`#${outputId}`).textContent = `${Math.round(crop[key])}%`;
  }
  Object.assign($('#cropBox').style, { left: `${crop.x}%`, top: `${crop.y}%`, width: `${crop.width}%`, height: `${crop.height}%` });
}

function timelineValues(): { start: number; end: number } {
  const startInput = $('#clipStart') as HTMLInputElement;
  const endInput = $('#clipEnd') as HTMLInputElement;
  let start = Number(startInput.value); let end = Number(endInput.value);
  if (end - start < 0.25) {
    if (document.activeElement === startInput) start = Math.max(0, end - 0.25);
    else end = Math.min(duration, start + 0.25);
    startInput.value = String(start); endInput.value = String(end);
  }
  return { start, end };
}

function updateTimeline(): void {
  const { start, end } = timelineValues();
  $('#startOut').textContent = formatDuration(start);
  $('#endOut').textContent = formatDuration(end);
  updatePace();
}

function selectedCount(): number { return Number(document.querySelector<HTMLInputElement>('input[name="frameCount"]:checked')?.value ?? 24); }

function updatePace(): void {
  const count = selectedCount(); const { start, end } = timelineValues();
  const interval = count > 1 ? (end - start) / (count - 1) : 0;
  $('#paceSummary').textContent = `${count} pages · ${formatDuration(end - start)} motion`;
  $('#intervalSummary').textContent = `One drawing every ${interval.toFixed(2)} seconds`;
  $('#extractFrames').textContent = count > 24 && !unlocked ? `Unlock ${count} pages` : `Extract ${count} frames`;
}

async function extractFrames(): Promise<void> {
  const count = selectedCount();
  if (count > 24 && !unlocked) { location.hash = 'unlock'; $('#licenseToken').focus(); return; }
  if (extracting || !video.src) return;
  const { start, end } = timelineValues();
  const times = frameTimes(start, end, count);
  if (!times.length) { showStatus('error', 'Choose a longer section of the clip, then try again.'); return; }
  extracting = true; cancelRequested = false;
  ($('#extractFrames') as HTMLButtonElement).disabled = true;
  ($('#cancelExtract') as HTMLButtonElement).hidden = false;
  progressWrap.hidden = false; updateRoute(3);
  const output: Blob[] = [];
  const canvas = document.createElement('canvas'); const context = canvas.getContext('2d', { alpha: false })!;
  const sourceWidth = video.videoWidth * crop.width / 100; const sourceHeight = video.videoHeight * crop.height / 100;
  const scale = Math.min(1, 960 / Math.max(sourceWidth, sourceHeight));
  canvas.width = Math.max(1, Math.round(sourceWidth * scale)); canvas.height = Math.max(1, Math.round(sourceHeight * scale));
  try {
    video.pause();
    for (let index = 0; index < times.length; index++) {
      if (cancelRequested) throw new Error('cancelled');
      await seekVideo(times[index]);
      context.drawImage(video, video.videoWidth * crop.x / 100, video.videoHeight * crop.y / 100, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height);
      output.push(await canvasBlob(canvas));
      const percent = Math.round(((index + 1) / times.length) * 100);
      progressBar.value = percent; $('#progressText').textContent = `${percent}%`;
    }
    setFrames(output);
    const project = currentProject(); await saveProject(project);
    showStatus('success', `${count} frames are ready and saved on this device.`);
    renderAllFrames(); updateRoute(4);
    proofPanel.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  } catch (error) {
    if ((error as Error).message === 'cancelled') showStatus('warning', 'Extraction cancelled. Your previous proof is unchanged.');
    else showStatus('error', 'A frame could not be read. Try a shorter clip or export it as MP4 (H.264).');
  } finally {
    extracting = false; ($('#extractFrames') as HTMLButtonElement).disabled = false;
    ($('#cancelExtract') as HTMLButtonElement).hidden = true; progressWrap.hidden = true;
  }
}

function seekVideo(time: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const target = Math.min(time, Math.max(0, duration - 0.001));
    if (Math.abs(video.currentTime - target) < 0.001 && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) { resolve(); return; }
    const done = () => { cleanup(); resolve(); }; const failed = () => { cleanup(); reject(new Error('seek')); };
    const cleanup = () => { video.removeEventListener('seeked', done); video.removeEventListener('error', failed); };
    video.addEventListener('seeked', done, { once: true }); video.addEventListener('error', failed, { once: true });
    video.currentTime = target;
  });
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('canvas')), 'image/jpeg', 0.86));
}

function setFrames(next: Blob[]): void {
  frameUrls.forEach(URL.revokeObjectURL); frames = next; frameUrls = frames.map(URL.createObjectURL); activeFrame = 0;
}

function renderAllFrames(): void {
  if (!frames.length) return;
  proofPanel.hidden = false; printPanel.hidden = false; $('#sheetCount').textContent = String(frames.length);
  const strip = $('#filmstrip'); strip.replaceChildren();
  frameUrls.forEach((url, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.role = 'option';
    button.className = 'frame-thumb'; button.dataset.index = String(index); button.setAttribute('aria-label', frameLabel(index, frames.length));
    const img = document.createElement('img'); img.src = url; img.alt = ''; const number = document.createElement('span'); number.textContent = String(index + 1).padStart(2, '0');
    button.append(img, number); button.addEventListener('click', () => selectFrame(index)); strip.append(button);
  });
  renderProof(); updateRoute(5);
}

function selectFrame(index: number): void {
  if (!frames.length) return; activeFrame = Math.max(0, Math.min(frames.length - 1, index)); renderProof();
  document.querySelector<HTMLElement>(`.frame-thumb[data-index="${activeFrame}"]`)?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
}

function renderProof(): void {
  if (!frames.length) return;
  const mode = ($('#onionMode') as HTMLSelectElement).value;
  const opacity = Number(($('#onionOpacity') as HTMLInputElement).value) / 100;
  $('#onionOut').textContent = `${Math.round(opacity * 100)}%`;
  const canvas = $('#proofCanvas'); canvas.replaceChildren();
  const base = document.createElement('img'); base.src = frameUrls[activeFrame]; base.alt = ''; base.className = 'base-frame'; canvas.append(base);
  const addOnion = (index: number, kind: 'previous' | 'next') => {
    if (index < 0 || index >= frames.length) return;
    const image = document.createElement('img'); image.src = frameUrls[index]; image.alt = ''; image.className = `onion-frame ${kind}`; image.style.opacity = String(opacity); canvas.append(image);
  };
  if (mode === 'previous' || mode === 'both') addOnion(activeFrame - 1, 'previous');
  if (mode === 'next' || mode === 'both') addOnion(activeFrame + 1, 'next');
  canvas.setAttribute('aria-label', `${frameLabel(activeFrame, frames.length)}${mode === 'off' ? '' : ` with ${mode} onion skin`}`);
  $('#frameCaption').textContent = frameLabel(activeFrame, frames.length);
  ($('#prevFrame') as HTMLButtonElement).disabled = activeFrame === 0; ($('#nextFrame') as HTMLButtonElement).disabled = activeFrame === frames.length - 1;
  document.querySelectorAll<HTMLElement>('.frame-thumb').forEach((item, index) => { item.setAttribute('aria-selected', String(index === activeFrame)); item.tabIndex = index === activeFrame ? 0 : -1; });
}

function currentSettings(): ProjectSettings {
  const { start, end } = timelineValues();
  return {
    name: sourceName, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), sourceDuration: duration,
    start, end, count: frames.length || selectedCount(), crop,
    onionMode: ($('#onionMode') as HTMLSelectElement).value as ProjectSettings['onionMode'], onionOpacity: Number(($('#onionOpacity') as HTMLInputElement).value),
    pageSize: radioValue('pageSize') as ProjectSettings['pageSize'], bindingSide: radioValue('bindingSide') as ProjectSettings['bindingSide'], pageOrder: radioValue('pageOrder') as ProjectSettings['pageOrder'],
  };
}

function currentProject(): StoredProject { return { settings: currentSettings(), frames }; }
function radioValue(name: string): string { return document.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`)?.value ?? ''; }
async function persistSettings(): Promise<void> { if (frames.length) await saveProject(currentProject()); }

async function restoreSavedProject(): Promise<void> {
  try {
    const project = await loadProject(); if (!project?.frames.length) return;
    sourceName = project.settings.name; duration = project.settings.sourceDuration; crop = normalizeCrop(project.settings.crop); setFrames(project.frames);
    ($('#onionMode') as HTMLSelectElement).value = project.settings.onionMode; ($('#onionOpacity') as HTMLInputElement).value = String(project.settings.onionOpacity);
    setRadio('pageSize', project.settings.pageSize); setRadio('bindingSide', project.settings.bindingSide); setRadio('pageOrder', project.settings.pageOrder);
    loadPanel.hidden = false; loadPanel.classList.add('saved-state');
    $('#load-title').textContent = 'Your saved proof is ready';
    loadPanel.querySelector('p')!.textContent = `${project.frames.length} extracted frames from “${project.settings.name}” are stored on this device. Choose another video to replace it.`;
    ($('#startOver') as HTMLButtonElement).hidden = false; renderAllFrames();
    showStatus('success', `Restored ${project.frames.length} locally saved frames. The source clip was not retained.`);
  } catch { showStatus('warning', 'The saved project could not be restored. Choose the source clip to begin again.'); }
}

function setRadio(name: string, value: string): void { const input = document.querySelector<HTMLInputElement>(`input[name="${name}"][value="${value}"]`); if (input) input.checked = true; }

async function startOver(): Promise<void> {
  if (!confirm('Start over? This removes the saved frames from this device. Export the project first if you need a copy.')) return;
  await clearProject(); setFrames([]); video.removeAttribute('src'); video.load(); duration = 0;
  workspace.hidden = true; proofPanel.hidden = true; printPanel.hidden = true; loadPanel.hidden = false; loadPanel.classList.remove('saved-state');
  $('#load-title').textContent = 'Bring in one short clip'; loadPanel.querySelector('p')!.innerHTML = `MP4, WebM, or MOV supported by your browser. Up to <span id="durationCap">${maxDuration}</span> seconds. We keep only extracted frames, never the source video.`;
  ($('#startOver') as HTMLButtonElement).hidden = true; fileInput.value = ''; updateRoute(1); status.replaceChildren();
}

function buildPrintRoot(): void {
  const root = $('#printRoot'); root.replaceChildren(); root.dataset.size = radioValue('pageSize'); root.dataset.binding = radioValue('bindingSide');
  const cover = document.createElement('section'); cover.className = 'print-page contact-page';
  const heading = document.createElement('div'); heading.className = 'contact-heading'; heading.innerHTML = `<p>Flipbook Proof · contact sheet</p><h2>${sourceName.replace(/[-_]+/g, ' ')}</h2><p>${frames.length} pages · ${radioValue('bindingSide')} binding · ${radioValue('pageOrder')} print order</p>`;
  const grid = document.createElement('div'); grid.className = 'contact-grid';
  frameUrls.forEach((url, index) => { const figure = document.createElement('figure'); const img = document.createElement('img'); img.src = url; img.alt = ''; const cap = document.createElement('figcaption'); cap.textContent = String(index + 1).padStart(2, '0'); figure.append(img, cap); grid.append(figure); });
  cover.append(heading, grid); root.append(cover);
  const order = pageNumbers(frames.length, radioValue('pageOrder') as 'forward' | 'reverse');
  order.forEach((pageNumber) => {
    const index = pageNumber - 1; const page = document.createElement('section'); page.className = 'print-page trace-page';
    const margin = document.createElement('div'); margin.className = 'binding-margin'; margin.innerHTML = '<span>NO-DRAW · BINDING</span>';
    const cropMarks = document.createElement('div'); cropMarks.className = 'print-crop-marks';
    const stack = document.createElement('div'); stack.className = 'print-frame-stack';
    const base = document.createElement('img'); base.src = frameUrls[index]; base.alt = ''; stack.append(base);
    if (index > 0 && ($('#onionMode') as HTMLSelectElement).value !== 'off') { const onion = document.createElement('img'); onion.src = frameUrls[index - 1]; onion.alt = ''; onion.className = 'print-onion'; onion.style.opacity = String(Number(($('#onionOpacity') as HTMLInputElement).value) / 100); stack.append(onion); }
    const label = document.createElement('div'); label.className = 'print-page-number'; label.innerHTML = `<span>FLIPBOOK PROOF</span><strong>${String(pageNumber).padStart(2, '0')}</strong><small>of ${frames.length}</small>`;
    page.append(margin, cropMarks, stack, label); root.append(page);
  });
}

function printProof(): void { buildPrintRoot(); updateRoute(5); requestAnimationFrame(() => window.print()); void persistSettings(); }

async function exportProject(): Promise<void> {
  if (!frames.length) return;
  showStatus('loading', 'Packaging your local project…');
  const encoded = await Promise.all(frames.map(blobToDataUrl));
  const payload = JSON.stringify({ version: 1, product: 'flipbook-proof', settings: currentSettings(), frames: encoded });
  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = `${sourceName}.flipbook-proof.json`; link.click(); URL.revokeObjectURL(url);
  showStatus('success', 'Project exported. Keep that file wherever you keep your artwork.');
}

function blobToDataUrl(blob: Blob): Promise<string> { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob); }); }

async function importProject(file?: File): Promise<void> {
  if (!file) return;
  try {
    if (file.size > 80_000_000) throw new Error('large');
    const data = JSON.parse(await file.text()) as { version: number; product: string; settings: ProjectSettings; frames: string[] };
    if (data.version !== 1 || data.product !== 'flipbook-proof' || !Array.isArray(data.frames) || data.frames.length < 2 || data.frames.length > 60) throw new Error('format');
    const importedFrames = await Promise.all(data.frames.map(async (value) => { if (!value.startsWith('data:image/')) throw new Error('image'); return (await fetch(value)).blob(); }));
    sourceName = safeFilename(data.settings.name); duration = data.settings.sourceDuration; crop = normalizeCrop(data.settings.crop); setFrames(importedFrames);
    ($('#onionMode') as HTMLSelectElement).value = data.settings.onionMode; ($('#onionOpacity') as HTMLInputElement).value = String(data.settings.onionOpacity);
    setRadio('pageSize', data.settings.pageSize); setRadio('bindingSide', data.settings.bindingSide); setRadio('pageOrder', data.settings.pageOrder);
    await saveProject(currentProject()); renderAllFrames(); ($('#startOver') as HTMLButtonElement).hidden = false;
    showStatus('success', `Imported ${frames.length} frames. They are now saved on this device.`); proofPanel.scrollIntoView({ block: 'start' });
  } catch { showStatus('error', 'That project file could not be imported. Choose a Flipbook Proof JSON export under 80 MB.'); }
  finally { ($('#importProject') as HTMLInputElement).value = ''; }
}

async function refreshLicense(force: boolean): Promise<void> {
  unlocked = isOptimisticallyUnlocked(); updateLicenseUi(unlocked, unlocked ? 'Plus unlocked on this device' : 'Free plan · up to 24 pages');
  if (storedToken()) { unlocked = await verifyLicense(force); updateLicenseUi(unlocked, unlocked ? 'Plus unlocked · up to 60 pages' : 'License no longer active'); }
  updatePace();
}

function updateLicenseUi(valid: boolean, message: string): void {
  $('#licenseState').textContent = message; $('#licenseState').classList.toggle('unlocked', valid);
  ($('#buyLink') as HTMLAnchorElement).hidden = valid; ($('#removeLicense') as HTMLButtonElement).hidden = !storedToken();
  document.querySelectorAll<HTMLInputElement>('input[name="frameCount"]').forEach((input) => { const isPaid = Number(input.value) > 24; input.closest('label')?.classList.toggle('locked', isPaid && !valid); input.setAttribute('aria-description', isPaid && !valid ? 'Requires Plus' : ''); });
}

async function submitLicense(event: Event): Promise<void> {
  event.preventDefault(); const input = $('#licenseToken') as HTMLInputElement; const token = input.value.trim();
  if (token.length < 8) { $('#licenseMessage').textContent = 'Paste the complete token from your receipt.'; return; }
  storeLicense(token); $('#licenseMessage').textContent = 'Checking license…'; await refreshLicense(true);
  $('#licenseMessage').textContent = unlocked ? 'Plus restored on this device.' : 'That token is not active for Flipbook Proof.'; if (unlocked) input.value = '';
}

function updateRoute(step: number): void { document.querySelectorAll<HTMLElement>('.route li').forEach((item) => { const itemStep = Number(item.dataset.route); item.classList.toggle('active', itemStep === step); item.classList.toggle('complete', itemStep < step); }); }

function showStatus(kind: 'loading' | 'success' | 'warning' | 'error', message: string): void { status.className = `status ${kind}`; status.textContent = message; }
function prefersReducedMotion(): boolean { return matchMedia('(prefers-reduced-motion: reduce)').matches; }
function updateNetworkState(): void { $('#networkStatus').textContent = navigator.onLine ? 'Works offline' : 'Offline · local tools ready'; document.body.classList.toggle('offline', !navigator.onLine); }

function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return;
  void navigator.serviceWorker.register('/sw.js').then((registration) => {
    if (registration.waiting) showUpdate(registration);
    registration.addEventListener('updatefound', () => registration.installing?.addEventListener('statechange', () => { if (registration.waiting && navigator.serviceWorker.controller) showUpdate(registration); }));
  }).catch(() => { /* the app remains fully usable without installability */ });
}

function showUpdate(registration: ServiceWorkerRegistration): void {
  const toast = $('#updateToast'); toast.hidden = false;
  toast.querySelector('button')!.onclick = () => { registration.waiting?.postMessage({ type: 'SKIP_WAITING' }); location.reload(); };
}
