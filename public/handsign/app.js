/**
 * Air Signature — app.js  v5
 * MediaPipe Hands + Canvas API
 *
 * Features: pinch-to-draw, 4 line styles, smoothing, trail/sparkles,
 * auto-recording with timer, Web Share API,
 * PNG/SVG/PDF/WebM export, style previews, custom HSV color picker
 */
'use strict';

/* ════════════════════════════════════════
   CONSTANTS
════════════════════════════════════════ */
const PINCH_THRESHOLD   = 0.068;
const TRAIL_TTL         = 380;
const SPARKLE_PER_FRAME = 3;
const THICKNESS_MAP     = [1.5, 3, 5, 8, 14];

/* ════════════════════════════════════════
   STATE
════════════════════════════════════════ */
const S = {
  mode: 'loading',     // loading | ready | drawing | done

  strokes:    [],
  current:    [],
  isPinching: false,
  indexTip:   null,

  trail:  [],
  sparks: [],

  color:    '#FF6B9D',
  sizeIdx:  2,
  _notPinchFrames: 0,   // debounce: frames since last pinch-detected
  lineType: 'glow',
  smoothOn: true,
  bgMode:   'transparent',
  customBg: '#FFF5E4',

  recorder:    null,
  chunks:      [],
  videoBlob:   null,
  recSecs:     0,
  recInterval: null,

  replaying: false,
};

/* ════════════════════════════════════════
   DOM
════════════════════════════════════════ */
const video    = document.getElementById('webcam');
const canvas   = document.getElementById('canvas');
const ctx      = canvas.getContext('2d');
const statusEl = document.getElementById('status-message');
const instrEl  = document.getElementById('instructions-overlay');
const panelEl  = document.getElementById('export-panel');
const recIndEl = document.getElementById('rec-indicator');
const recTimEl = document.getElementById('rec-timer');
const doneBtnEl= document.getElementById('done-btn');

let CW = 0, CH = 0;

function resizeCanvas() {
  CW = canvas.width  = window.innerWidth;
  CH = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

/* ════════════════════════════════════════
   STATUS / MODE
════════════════════════════════════════ */
function setStatus(text, cls = '') {
  statusEl.textContent = text;
  statusEl.className   = cls;
}
function setMode(m) {
  S.mode = m;
  document.body.setAttribute('data-mode', m);
}

/* ════════════════════════════════════════
   MEDIAPIPE
════════════════════════════════════════ */
function initMediaPipe() {
  const hands = new Hands({
    locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`,
  });
  hands.setOptions({
    maxNumHands: 1, modelComplexity: 1,
    minDetectionConfidence: 0.72, minTrackingConfidence: 0.55,
  });
  hands.onResults(onHandResults);

  const cam = new Camera(video, {
    onFrame: async () => { await hands.send({ image: video }); },
    width: 1280, height: 720,
  });
  cam.start()
    .then(() => { setMode('ready'); setStatus('Pinch thumb + index to start drawing'); })
    .catch(() => { setStatus('Camera not found. Please allow camera access.'); });
}

const PINCH_GRACE_FRAMES = 4; // frames of "not pinching" tolerated before breaking stroke

function onHandResults(results) {
  if (!results.multiHandLandmarks?.length) {
    // No hand detected — immediately end stroke (not a brief glitch)
    S._notPinchFrames = PINCH_GRACE_FRAMES + 1;
    S.indexTip = null;
    if (S.isPinching) endPinch();
    S.isPinching = false;
    return;
  }
  const lm = results.multiHandLandmarks[0];
  S.indexTip = { x: (1 - lm[8].x) * CW, y: lm[8].y * CH };

  const dist     = hypot2D(lm[4], lm[8]);
  const rawPinch = dist < PINCH_THRESHOLD;

  if (rawPinch) {
    // Actively pinching — reset grace counter
    S._notPinchFrames = 0;
    if (!S.isPinching) startPinch();
    S.isPinching = true;
    S.current.push({
      x: (1 - (lm[4].x + lm[8].x) / 2) * CW,
      y: ((lm[4].y + lm[8].y) / 2) * CH,
      t: performance.now(),
    });
  } else {
    // Not pinching this frame — apply grace period before ending stroke
    if (S.isPinching) {
      S._notPinchFrames++;
      if (S._notPinchFrames > PINCH_GRACE_FRAMES) {
        // Confirmed release — end the stroke
        endPinch();
        S.isPinching = false;
      }
      // During grace period: keep isPinching true, don't add points
    } else {
      S._notPinchFrames = 0;
    }
  }
}

function hypot2D(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

/* ════════════════════════════════════════
   STROKE LIFECYCLE
════════════════════════════════════════ */
function startPinch() {
  S.current = [];
  if (S.mode === 'ready' || S.mode === 'drawing') {
    if (S.mode !== 'drawing') {
      setMode('drawing');
      startRecording();
    }
    setStatus('Drawing now. Release fingers when done!', 'drawing');
  }
}

function endPinch() {
  if (S.current.length < 2) { S.current = []; return; }
  const pts = S.smoothOn ? applySmoothing(S.current) : S.current;
  S.strokes.push({
    points: pts, color: S.color,
    thickness: THICKNESS_MAP[S.sizeIdx], lineType: S.lineType,
  });
  S.current = [];
  if (S.mode === 'drawing')
    setStatus('Pinch again to add more, or press Finish', 'drawing');
}

/* ════════════════════════════════════════
   SMOOTHING
════════════════════════════════════════ */
function applySmoothing(pts) {
  if (pts.length < 4) return pts;
  const w = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    w.push({
      x: pts[i-1].x * 0.15 + pts[i].x * 0.70 + pts[i+1].x * 0.15,
      y: pts[i-1].y * 0.15 + pts[i].y * 0.70 + pts[i+1].y * 0.15,
      t: pts[i].t,
    });
  }
  w.push(pts[pts.length - 1]);
  return catmullRom(w, 4);
}

function catmullRom(pts, steps = 4) {
  if (pts.length < 2) return pts;
  const res = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i-1)], p1 = pts[i];
    const p2 = pts[i+1], p3 = pts[Math.min(pts.length-1, i+2)];
    for (let s = 0; s < steps; s++) {
      const t = s/steps, t2 = t*t, t3 = t2*t;
      res.push({
        x: 0.5*((2*p1.x)+(-p0.x+p2.x)*t+(2*p0.x-5*p1.x+4*p2.x-p3.x)*t2+(-p0.x+3*p1.x-3*p2.x+p3.x)*t3),
        y: 0.5*((2*p1.y)+(-p0.y+p2.y)*t+(2*p0.y-5*p1.y+4*p2.y-p3.y)*t2+(-p0.y+3*p1.y-3*p2.y+p3.y)*t3),
        t: p1.t,
      });
    }
  }
  res.push(pts[pts.length-1]);
  return res;
}

/* ════════════════════════════════════════
   TRAIL + SPARKLE FX
════════════════════════════════════════ */
function updateFX() {
  const now = performance.now();
  if (S.indexTip) {
    S.trail.push({ ...S.indexTip, t: now, drawing: S.isPinching });
    if (S.isPinching) {
      for (let i = 0; i < SPARKLE_PER_FRAME; i++) {
        S.sparks.push({
          x: S.indexTip.x + (Math.random()-0.5)*22,
          y: S.indexTip.y + (Math.random()-0.5)*22,
          vx: (Math.random()-0.5)*2.8, vy: -Math.random()*3.2-0.5,
          r: Math.random()*3+1, a: 1, color: S.color,
        });
      }
    }
  }
  S.trail = S.trail.filter(p => now - p.t < TRAIL_TTL);
  for (const sp of S.sparks) { sp.x+=sp.vx; sp.y+=sp.vy; sp.vy+=0.12; sp.a-=0.038; }
  S.sparks = S.sparks.filter(sp => sp.a > 0);
}

/* ════════════════════════════════════════
   RENDER
════════════════════════════════════════ */
function render() {
  ctx.clearRect(0, 0, CW, CH);

  const showCamera = S.mode !== 'done' || S.bgMode === 'transparent';
  if (showCamera) {
    if (video.readyState >= 2) {
      ctx.save(); ctx.scale(-1,1);
      ctx.drawImage(video, -CW, 0, CW, CH);
      ctx.restore();
    }
  } else {
    ctx.fillStyle = resolvedBg() || '#ffffff';
    ctx.fillRect(0, 0, CW, CH);
  }

  for (const stroke of S.strokes) drawStroke(ctx, stroke);

  if (S.current.length >= 2) {
    drawStroke(ctx, {
      points: S.current, color: S.color,
      thickness: THICKNESS_MAP[S.sizeIdx], lineType: S.lineType,
    });
  }

  if (S.mode !== 'done') { drawTrail(); drawSparks(); }
}

function drawStroke(c, stroke) {
  const { points: pts, color, thickness, lineType } = stroke;
  if (!pts || pts.length < 2) return;
  c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
  switch (lineType) {
    case 'solid':  renderSolid (c, pts, color, thickness); break;
    case 'pencil': renderPencil(c, pts, color, thickness); break;
    case 'glow':   renderGlow  (c, pts, color, thickness); break;
    case 'marker': renderMarker(c, pts, color, thickness); break;
    default:       renderSolid (c, pts, color, thickness);
  }
  c.restore();
}

function renderSolid(c, pts, color, w) {
  c.beginPath(); c.moveTo(pts[0].x, pts[0].y);
  for (let i=1;i<pts.length;i++) c.lineTo(pts[i].x,pts[i].y);
  c.strokeStyle=color; c.lineWidth=w; c.stroke();
}

function renderPencil(c, pts, color, w) {
  c.strokeStyle=color; c.lineWidth=Math.max(1,w*0.65);
  for (let i=1;i<pts.length;i++) {
    const jx=(seededRand(i*7+1)-0.5)*2.2, jy=(seededRand(i*13+3)-0.5)*2.2;
    c.globalAlpha=0.65+seededRand(i*3)*0.35;
    c.beginPath(); c.moveTo(pts[i-1].x,pts[i-1].y);
    c.lineTo(pts[i].x+jx,pts[i].y+jy); c.stroke();
  }
  c.globalAlpha=1;
}

function renderGlow(c, pts, color, w) {
  const path = () => {
    c.beginPath(); c.moveTo(pts[0].x,pts[0].y);
    for (let i=1;i<pts.length;i++) c.lineTo(pts[i].x,pts[i].y);
  };
  c.shadowColor=color; c.shadowBlur=28;
  c.strokeStyle=color; c.lineWidth=w*1.2; c.globalAlpha=0.28; path(); c.stroke();
  c.shadowBlur=14; c.lineWidth=w*0.8; c.globalAlpha=0.65; path(); c.stroke();
  c.shadowBlur=6; c.strokeStyle=blendToWhite(color,0.55);
  c.lineWidth=w*0.4; c.globalAlpha=1; path(); c.stroke();
  c.shadowBlur=0; c.globalAlpha=1;
}

function renderMarker(c, pts, color, w) {
  c.strokeStyle=color; c.lineWidth=w*2.8;
  c.globalAlpha=0.48; c.lineCap='square';
  c.beginPath(); c.moveTo(pts[0].x,pts[0].y);
  for (let i=1;i<pts.length;i++) c.lineTo(pts[i].x,pts[i].y);
  c.stroke(); c.globalAlpha=1;
}

function drawTrail() {
  if (S.trail.length < 2) return;
  const now = performance.now();
  for (let i=1;i<S.trail.length;i++) {
    const pt=S.trail[i], age=now-pt.t;
    const a=Math.max(0,1-age/TRAIL_TTL);
    ctx.save();
    ctx.globalAlpha=a*(pt.drawing?0.55:0.25);
    ctx.strokeStyle=pt.drawing?S.color:'rgba(255,255,255,0.9)';
    ctx.lineWidth=(pt.drawing?5:2.5)*a; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(S.trail[i-1].x,S.trail[i-1].y);
    ctx.lineTo(pt.x,pt.y); ctx.stroke(); ctx.restore();
  }
  if (S.indexTip) {
    const col=S.isPinching?S.color:'rgba(255,255,255,0.9)';
    ctx.save(); ctx.shadowColor=col; ctx.shadowBlur=S.isPinching?20:10;
    ctx.fillStyle=col; ctx.beginPath();
    ctx.arc(S.indexTip.x,S.indexTip.y,S.isPinching?5:3.5,0,Math.PI*2);
    ctx.fill(); ctx.restore();
  }
}

function drawSparks() {
  for (const sp of S.sparks) {
    ctx.save(); ctx.globalAlpha=sp.a;
    ctx.fillStyle=sp.color; ctx.shadowColor=sp.color; ctx.shadowBlur=8;
    ctx.beginPath(); ctx.arc(sp.x,sp.y,sp.r,0,Math.PI*2);
    ctx.fill(); ctx.restore();
  }
}

/* ════════════════════════════════════════
   MAIN LOOP
════════════════════════════════════════ */
function loop() { updateFX(); render(); requestAnimationFrame(loop); }

/* ════════════════════════════════════════
   RECORDING + TIMER
════════════════════════════════════════ */
function startRecording() {
  if (S.recorder?.state !== 'inactive' && S.recorder) return;
  try {
    const stream = canvas.captureStream(30);
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
      ? 'video/webm;codecs=vp9' : 'video/webm';
    S.chunks   = [];
    S.recorder = new MediaRecorder(stream, { mimeType: mime });
    S.recorder.ondataavailable = (e) => { if (e.data.size>0) S.chunks.push(e.data); };
    S.recorder.onstop = () => { S.videoBlob = new Blob(S.chunks,{type:'video/webm'}); };
    S.recorder.start(100);
  } catch(e) { console.warn('MediaRecorder unavailable',e); }

  S.recSecs = 0;
  recTimEl.textContent = '00:00';
  recIndEl.classList.remove('hidden', 'frozen');
  S.recInterval = setInterval(() => {
    S.recSecs++;
    const mm = String(Math.floor(S.recSecs/60)).padStart(2,'0');
    const ss = String(S.recSecs%60).padStart(2,'0');
    recTimEl.textContent = `${mm}:${ss}`;
  }, 1000);
}

/** freezeRecording — Finish button: keeps indicator visible, frozen style */
function freezeRecording() {
  if (S.recorder?.state !== 'inactive') S.recorder?.stop();
  clearInterval(S.recInterval); S.recInterval = null;
  recIndEl.classList.remove('hidden');
  recIndEl.classList.add('frozen');
}

/** stopRecording — Try Again: hides indicator completely */
function stopRecording() {
  if (S.recorder?.state !== 'inactive') S.recorder?.stop();
  clearInterval(S.recInterval); S.recInterval = null;
  recIndEl.classList.remove('frozen');
  recIndEl.classList.add('hidden');
}

/* ════════════════════════════════════════
   REPLAY ANIMATION
════════════════════════════════════════ */
function replayAnimation() {
  if (!S.strokes.length || S.replaying) return;
  S.replaying = true;
  const allPts = S.strokes.flatMap(s => s.points);
  const t0  = allPts[0]?.t ?? performance.now();
  const t1  = allPts[allPts.length-1]?.t ?? t0+2000;
  const dur = Math.max(t1-t0, 800);
  const saved = S.strokes.map(s => ({...s, points:[...s.points]}));
  S.strokes = [];
  const start = performance.now();
  function tick() {
    if (!S.replaying) { S.strokes=saved; return; }
    const prog=(performance.now()-start)/dur;
    S.strokes=[];
    for (const stroke of saved) {
      const vis=stroke.points.filter(p=>((p.t??t0)-t0)/dur<=prog);
      if (vis.length>=2) S.strokes.push({...stroke,points:vis});
    }
    if (prog<1) requestAnimationFrame(tick);
    else { S.strokes=saved; S.replaying=false; }
  }
  tick();
}

/* ════════════════════════════════════════
   EXPORT HELPERS
════════════════════════════════════════ */
function buildSigCanvas() {
  const allPts = S.strokes.flatMap(s=>s.points);
  if (!allPts.length) { alert('No signature yet!'); return null; }
  const margin=50;
  let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
  for (const p of allPts) { x0=Math.min(x0,p.x);y0=Math.min(y0,p.y);x1=Math.max(x1,p.x);y1=Math.max(y1,p.y); }
  const W=Math.max(x1-x0+margin*2,400), H=Math.max(y1-y0+margin*2,200);
  const dx=-x0+margin, dy=-y0+margin;
  const oc=document.createElement('canvas'); oc.width=W; oc.height=H;
  const oc2=oc.getContext('2d');
  const bg=resolvedBg();
  if (bg) { oc2.fillStyle=bg; oc2.fillRect(0,0,W,H); }
  for (const stroke of S.strokes) {
    drawStroke(oc2,{...stroke,points:stroke.points.map(p=>({x:p.x+dx,y:p.y+dy,t:p.t}))});
  }
  return oc;
}

function resolvedBg() {
  switch(S.bgMode) {
    case 'white':  return '#ffffff';
    case 'black':  return '#000000';
    case 'custom': return S.customBg;
    default: return null;
  }
}

function exportPNG()   { const oc=buildSigCanvas();if(!oc)return;dl(oc.toDataURL('image/png'),'air-signature.png'); }

function exportSVG() {
  const allPts=S.strokes.flatMap(s=>s.points);
  if(!allPts.length){alert('No signature yet!');return;}
  const margin=50;
  let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;
  for(const p of allPts){x0=Math.min(x0,p.x);y0=Math.min(y0,p.y);x1=Math.max(x1,p.x);y1=Math.max(y1,p.y);}
  const W=Math.max(x1-x0+margin*2,400),H=Math.max(y1-y0+margin*2,200);
  const dx=-x0+margin,dy=-y0+margin;
  const bg=resolvedBg();
  let bgTag=bg?`<rect width="${W}" height="${H}" fill="${bg}"/>`:'';
  let paths='';
  for(const s of S.strokes){
    if(s.points.length<2)continue;
    let d=`M${(s.points[0].x+dx).toFixed(1)},${(s.points[0].y+dy).toFixed(1)}`;
    for(let i=1;i<s.points.length;i++) d+=` L${(s.points[i].x+dx).toFixed(1)},${(s.points[i].y+dy).toFixed(1)}`;
    const sw=s.lineType==='marker'?s.thickness*2.8:s.thickness;
    const op=s.lineType==='marker'?0.48:1;
    paths+=`<path d="${d}" stroke="${s.color}" stroke-width="${sw.toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="${op}"/>\n`;
  }
  const svg=`<?xml version="1.0"?><svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${bgTag}${paths}</svg>`;
  const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));
  dl(url,'air-signature.svg'); setTimeout(()=>URL.revokeObjectURL(url),3000);
}

function exportPDF() {
  if(!window.jspdf){alert('jsPDF still loading, try again.');return;}
  const oc=buildSigCanvas();if(!oc)return;
  const {jsPDF}=window.jspdf;
  const pdf=new jsPDF({orientation:oc.width>oc.height?'landscape':'portrait',unit:'px',format:[oc.width,oc.height]});
  pdf.addImage(oc.toDataURL('image/png'),'PNG',0,0,oc.width,oc.height);
  pdf.save('air-signature.pdf');
}

function exportVideo() {
  if(!S.videoBlob){alert('No recording yet. Sign first, then export!');return;}
  const url=URL.createObjectURL(S.videoBlob);
  dl(url,'air-signature.webm'); setTimeout(()=>URL.revokeObjectURL(url),5000);
}

function dl(href,name) { Object.assign(document.createElement('a'),{href,download:name}).click(); }

/* ════════════════════════════════════════
   SHARE  (Web Share API)
════════════════════════════════════════ */
async function shareToSocial(format) {
  try {
    const shareFormat = (format === 'auto') ? 'image' : format;
    if (shareFormat === 'image') {
      const oc = buildSigCanvas(); if (!oc) return;
      oc.toBlob(async (blob) => {
        const file = new File([blob], 'air-signature.png', { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files:[file], title:'Air Signature', text:'My air signature!' });
        } else { exportPNG(); showShareFallback('image'); }
      }, 'image/png');
    } else if (shareFormat === 'video') {
      if (!S.videoBlob) { alert('Record a signature first, then share!'); return; }
      const file = new File([S.videoBlob], 'air-signature.webm', { type: 'video/webm' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files:[file], title:'Air Signature', text:'My air signature animation!' });
      } else { exportVideo(); showShareFallback('video'); }
    }
  } catch(e) {
    if (e.name !== 'AbortError') console.warn('Share error:', e);
  }
}

function showShareFallback(type) {
  const msg = type === 'image'
    ? 'File downloaded! Open Instagram or TikTok and upload the image from your gallery.'
    : 'Video downloaded! Open TikTok or Instagram Reels and upload from your gallery.';
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed;bottom:110px;left:50%;transform:translateX(-50%);
    background:#222;color:#fff;padding:12px 20px;border-radius:16px;
    font-family:Nunito,sans-serif;font-size:13px;font-weight:700;
    z-index:9999;max-width:320px;text-align:center;
    box-shadow:0 8px 24px rgba(0,0,0,0.25);`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4500);
}

/* ════════════════════════════════════════
   CUSTOM HSV COLOR PICKER
   Shared popup for both stroke color
   and background color selection.
════════════════════════════════════════ */
const colorPicker = (() => {
  const popup    = document.getElementById('cpop');
  const svCanvas = document.getElementById('cpop-sv');
  const hueBar   = document.getElementById('cpop-hue');
  const swatchEl = document.getElementById('cpop-swatch');
  const hexInput = document.getElementById('cpop-hex');
  const okBtn    = document.getElementById('cpop-ok');

  let H = 0, Sat = 1, Val = 1;   // hue 0-360, sat 0-1, val 0-1
  let dragSV = false, dragHue = false;
  let _callback = null;

  /* ── Color math ── */
  function hexToHSV(hex) {
    if (!hex || hex[0] !== '#' || hex.length < 7) return [0,1,1];
    let r=parseInt(hex.slice(1,3),16)/255, g=parseInt(hex.slice(3,5),16)/255, b=parseInt(hex.slice(5,7),16)/255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b), d=max-min;
    let h=0, s=max===0?0:d/max, v=max;
    if (d !== 0) {
      if (max===r) h=((g-b)/d+6)%6;
      else if (max===g) h=(b-r)/d+2;
      else h=(r-g)/d+4;
      h *= 60;
    }
    return [h, s, v];
  }

  function hsvToHex(h, s, v) {
    const f = n => {
      const k=(n+h/60)%6;
      const val=v - v*s*Math.max(0, Math.min(k, 4-k, 1));
      return Math.round(val*255).toString(16).padStart(2,'0');
    };
    return `#${f(5)}${f(3)}${f(1)}`;
  }

  /* ── Drawing ── */
  function drawSV() {
    const c = svCanvas.getContext('2d');
    const W = svCanvas.width, Ht = svCanvas.height;
    c.fillStyle = `hsl(${H},100%,50%)`;
    c.fillRect(0,0,W,Ht);
    const wg = c.createLinearGradient(0,0,W,0);
    wg.addColorStop(0,'rgba(255,255,255,1)'); wg.addColorStop(1,'rgba(255,255,255,0)');
    c.fillStyle=wg; c.fillRect(0,0,W,Ht);
    const bg = c.createLinearGradient(0,0,0,Ht);
    bg.addColorStop(0,'rgba(0,0,0,0)'); bg.addColorStop(1,'rgba(0,0,0,1)');
    c.fillStyle=bg; c.fillRect(0,0,W,Ht);
    // Crosshair
    const cx = Sat*W, cy = (1-Val)*Ht;
    c.beginPath(); c.arc(cx,cy,8,0,Math.PI*2);
    c.strokeStyle='rgba(0,0,0,0.35)'; c.lineWidth=1.5; c.stroke();
    c.beginPath(); c.arc(cx,cy,7,0,Math.PI*2);
    c.strokeStyle='white'; c.lineWidth=2.5; c.stroke();
  }

  function drawHue() {
    const c = hueBar.getContext('2d');
    const W = hueBar.width, Ht = hueBar.height;
    const g = c.createLinearGradient(0,0,W,0);
    for (let i=0; i<=360; i+=30) g.addColorStop(i/360, `hsl(${i},100%,50%)`);
    c.fillStyle=g; c.fillRect(0,0,W,Ht);
    // Round ends
    c.beginPath(); c.arc(Ht/2, Ht/2, Ht/2, Math.PI/2, 3*Math.PI/2);
    c.fillStyle=`hsl(0,100%,50%)`; c.fill();
    c.beginPath(); c.arc(W-Ht/2, Ht/2, Ht/2, -Math.PI/2, Math.PI/2);
    c.fillStyle=`hsl(360,100%,50%)`; c.fill();
    // Selector knob
    const x = (H/360)*(W-Ht) + Ht/2;
    c.beginPath(); c.arc(x, Ht/2, Ht/2-1, 0, Math.PI*2);
    c.strokeStyle='white'; c.lineWidth=2.5; c.stroke();
    c.beginPath(); c.arc(x, Ht/2, Ht/2-2.5, 0, Math.PI*2);
    c.strokeStyle='rgba(0,0,0,0.3)'; c.lineWidth=1; c.stroke();
  }

  function updateUI() {
    const hex = hsvToHex(H, Sat, Val);
    swatchEl.style.background = hex;
    hexInput.value = hex;
  }

  /* ── Event helpers ── */
  function onSVMove(e) {
    const r = svCanvas.getBoundingClientRect();
    Sat = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
    Val = 1 - Math.max(0, Math.min(1, (e.clientY - r.top)  / r.height));
    drawSV(); updateUI();
  }
  function onHueMove(e) {
    const r = hueBar.getBoundingClientRect();
    H = Math.max(0, Math.min(360, ((e.clientX - r.left) / r.width) * 360));
    drawHue(); drawSV(); updateUI();
  }

  /* ── Mouse events ── */
  svCanvas.addEventListener('mousedown',  e => { dragSV=true;  onSVMove(e);  });
  hueBar.addEventListener('mousedown',    e => { dragHue=true; onHueMove(e); });
  window.addEventListener('mousemove', e => {
    if (dragSV)  onSVMove(e);
    if (dragHue) onHueMove(e);
  });
  window.addEventListener('mouseup', () => { dragSV=false; dragHue=false; });

  /* ── Touch events ── */
  svCanvas.addEventListener('touchstart', e => { e.preventDefault(); dragSV=true;  onSVMove(e.touches[0]);  }, {passive:false});
  svCanvas.addEventListener('touchmove',  e => { e.preventDefault(); if(dragSV)  onSVMove(e.touches[0]);  }, {passive:false});
  hueBar.addEventListener('touchstart',   e => { e.preventDefault(); dragHue=true; onHueMove(e.touches[0]); }, {passive:false});
  hueBar.addEventListener('touchmove',    e => { e.preventDefault(); if(dragHue) onHueMove(e.touches[0]); }, {passive:false});
  window.addEventListener('touchend', () => { dragSV=false; dragHue=false; });

  /* ── Hex input ── */
  hexInput.addEventListener('keydown', e => { if (e.key === 'Enter') hexInput.blur(); });
  hexInput.addEventListener('blur', () => {
    const raw = hexInput.value.trim().replace(/^#?/, '#');
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
      [H, Sat, Val] = hexToHSV(raw);
      drawSV(); drawHue(); updateUI();
    }
  });

  /* ── OK / outside-click ── */
  okBtn.addEventListener('click', () => {
    if (_callback) _callback(hsvToHex(H, Sat, Val));
    popup.classList.add('hidden');
  });

  document.addEventListener('mousedown', e => {
    if (popup.classList.contains('hidden')) return;
    // Don't close if clicking the wheel canvases (they opened the popup)
    if (e.target.id === 'color-wheel' || e.target.id === 'bg-palette-btn') return;
    if (!popup.contains(e.target)) popup.classList.add('hidden');
  });

  /* ── Public API ── */
  return {
    /**
     * open(anchorEl, currentHex, callback, placement)
     *   placement: 'above' → popup appears above the anchor
     *              'left'  → popup appears to the left of the anchor
     */
    open(anchorEl, currentHex, cb, placement = 'above') {
      _callback = cb;
      [H, Sat, Val] = hexToHSV(currentHex || '#FF6B9D');
      drawSV(); drawHue(); updateUI();
      popup.classList.remove('hidden');

      // Wait one frame so the popup has dimensions
      requestAnimationFrame(() => {
        const aRect = anchorEl.getBoundingClientRect();
        const pW = popup.offsetWidth  || 214;
        const pH = popup.offsetHeight || 250;

        let left, top;
        if (placement === 'above') {
          // Center horizontally over anchor, sit above it
          left = aRect.left + aRect.width / 2 - pW / 2;
          top  = aRect.top - pH - 31;  // extra 19px higher (~0.5cm)
        } else {
          // 'left': sit to the left of the anchor (export panel scenario)
          left = aRect.left - pW - 14;
          top  = aRect.top + aRect.height / 2 - pH / 2;
        }
        // Clamp to viewport
        left = Math.max(8, Math.min(left, window.innerWidth  - pW - 8));
        top  = Math.max(8, Math.min(top,  window.innerHeight - pH - 8));
        popup.style.left = left + 'px';
        popup.style.top  = top  + 'px';
      });
    },
    close() { popup.classList.add('hidden'); }
  };
})();

/* ════════════════════════════════════════
   COLOR WHEEL CANVAS  (rainbow ring → opens custom picker)
════════════════════════════════════════ */
function initColorWheel() {
  const wc   = document.getElementById('color-wheel');
  const wctx = wc.getContext('2d');
  const R    = wc.width / 2;

  for (let h=0; h<360; h++) {
    wctx.beginPath(); wctx.moveTo(R,R);
    wctx.arc(R,R,R-0.5,(h-0.5)*Math.PI/180,(h+1.5)*Math.PI/180);
    wctx.closePath();
    wctx.fillStyle = `hsl(${h},90%,58%)`;
    wctx.fill();
  }
  wctx.beginPath(); wctx.arc(R,R,R*0.38,0,Math.PI*2);
  wctx.fillStyle='white'; wctx.fill();

  wc.addEventListener('click', () => {
    // Anchor = the Color tsec so picker appears above the Color label
    const colorSection = wc.closest('.tsec') || document.querySelector('#toolbar .tsec');
    colorPicker.open(
      colorSection,
      S.color,
      (hex) => {
        S.color = hex;
        wc.style.borderColor = hex;
        wc.classList.add('active-custom');
        document.querySelectorAll('.cdot').forEach(b => b.classList.remove('active'));
      },
      'above'
    );
  });
}

/* ════════════════════════════════════════
   BACKGROUND PALETTE WHEEL  (opens custom picker next to panel)
════════════════════════════════════════ */
function initBgPalette() {
  const bc   = document.getElementById('bg-palette-btn');
  const bctx = bc.getContext('2d');
  const R    = bc.width / 2;

  for (let h=0; h<360; h++) {
    bctx.beginPath(); bctx.moveTo(R,R);
    bctx.arc(R,R,R-0.5,(h-0.5)*Math.PI/180,(h+1.5)*Math.PI/180);
    bctx.closePath();
    bctx.fillStyle = `hsl(${h},80%,62%)`;
    bctx.fill();
  }
  bctx.beginPath(); bctx.arc(R,R,R*0.38,0,Math.PI*2);
  bctx.fillStyle='white'; bctx.fill();

  bc.addEventListener('click', () => {
    // Anchor = the export panel; picker appears to its left
    colorPicker.open(
      document.getElementById('export-panel'),
      S.customBg || '#FFF5E4',
      (hex) => {
        S.customBg = hex;
        S.bgMode   = 'custom';
        bc.style.borderColor = hex;
        bc.classList.add('active-custom');
        document.querySelectorAll('.bgchip').forEach(b => b.classList.remove('active'));
      },
      'left'
    );
  });
}

/* ════════════════════════════════════════
   TUTORIAL MOUSE TRAIL
   Pencil-style pink trail that fades ~1s
   on the first-screen tutorial overlay.
════════════════════════════════════════ */
function initTutorialTrail() {
  const overlay  = document.getElementById('instructions-overlay');
  const tc       = document.getElementById('tut-trail');
  const tctx     = tc.getContext('2d');
  const DURATION = 1000; // ms before fully transparent
  let pts = [];           // [{x,y,t}]

  function resize() {
    tc.width  = window.innerWidth;
    tc.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Collect mouse positions
  overlay.addEventListener('mousemove', e => {
    pts.push({ x: e.clientX, y: e.clientY, t: performance.now() });
  });

  // Render loop — only runs while tutorial is visible
  function tick() {
    // Stop rendering once tutorial is dismissed
    if (overlay.style.display === 'none') return;
    requestAnimationFrame(tick);

    const now = performance.now();
    pts = pts.filter(p => now - p.t < DURATION);
    tctx.clearRect(0, 0, tc.width, tc.height);

    if (pts.length < 2) return;

    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1], p1 = pts[i];
      const age   = now - p1.t;
      const alpha = Math.max(0, 1 - age / DURATION);

      // Pencil-like: thin line with slight random jitter per segment
      const jx = (Math.random() - 0.5) * 2.2;
      const jy = (Math.random() - 0.5) * 2.2;

      tctx.save();
      tctx.globalAlpha = alpha * 0.72;
      tctx.strokeStyle = '#FF6B9D';
      tctx.lineWidth   = 2.2;
      tctx.lineCap     = 'round';
      tctx.shadowColor = '#FF6B9D';
      tctx.shadowBlur  = 4;
      tctx.beginPath();
      tctx.moveTo(p0.x, p0.y);
      tctx.lineTo(p1.x + jx, p1.y + jy);
      tctx.stroke();
      tctx.restore();
    }
  }
  requestAnimationFrame(tick);
}

/* ════════════════════════════════════════
   STYLE PREVIEW LINES
════════════════════════════════════════ */
function drawStylePreviews() {
  document.querySelectorAll('.sbtn').forEach(btn => {
    const pc = btn.querySelector('.style-prev');
    if (!pc) return;
    const pctx = pc.getContext('2d');
    const W = pc.width, H = pc.height;
    pctx.clearRect(0, 0, W, H);
    const type     = btn.dataset.type;
    const isActive = btn.classList.contains('active');
    const col      = isActive ? '#FF6B9D' : '#aaaaaa';
    const pts = Array.from({ length: 14 }, (_, i) => ({
      x: 4 + (i / 13) * (W - 8),
      y: H/2 + Math.sin(i * 0.52) * (H/2 - 3.5),
      t: i * 40,
    }));
    drawStroke(pctx, { points: pts, color: col, thickness: 1.8, lineType: type });
  });
}

/* ════════════════════════════════════════
   RESET
════════════════════════════════════════ */
function resetAll() {
  stopRecording();
  S.strokes=[]; S.current=[]; S.chunks=[]; S.videoBlob=null;
  S.replaying=false; S.isPinching=false; S._notPinchFrames=0;
  setMode('ready');
  setStatus('Pinch thumb + index to start drawing');
  panelEl.classList.add('hidden');
  // Restore Finish button
  doneBtnEl.style.display = '';
  doneBtnEl.classList.remove('act-ghost');
  doneBtnEl.classList.add('act-primary');
}

/* ════════════════════════════════════════
   UTILITIES
════════════════════════════════════════ */
function seededRand(seed) { const x=Math.sin(seed+1)*73856; return x-Math.floor(x); }
function blendToWhite(hex,r) {
  if(!hex||hex[0]!=='#') return '#ffffff';
  const rv=parseInt(hex.slice(1,3),16),gv=parseInt(hex.slice(3,5),16),bv=parseInt(hex.slice(5,7),16);
  return `rgb(${Math.round(rv+(255-rv)*r)},${Math.round(gv+(255-gv)*r)},${Math.round(bv+(255-bv)*r)})`;
}

/* ════════════════════════════════════════
   UI EVENT WIRING
════════════════════════════════════════ */
function initUI() {

  // Tutorial dismiss
  document.getElementById('start-btn').addEventListener('click', () => {
    instrEl.style.display = 'none';
  });

  // ── Color preset dots ────────────────────
  document.querySelectorAll('.cdot').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cdot').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      S.color = btn.dataset.color;
      const wc = document.getElementById('color-wheel');
      wc.classList.remove('active-custom');
      wc.style.borderColor = '';
    });
  });

  // ── Size ──────────────────────────────────
  document.querySelectorAll('.szdot').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.szdot').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      S.sizeIdx = parseInt(btn.dataset.idx);
    });
  });

  // ── Line style + redraw previews ──────────
  document.querySelectorAll('.sbtn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sbtn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      S.lineType = btn.dataset.type;
      drawStylePreviews();
    });
  });

  // ── Smooth toggle ─────────────────────────
  document.getElementById('smooth-toggle').addEventListener('change', (e) => {
    S.smoothOn = e.target.checked;
  });

  // ── Finish button — freeze REC, hide button, show panel ──
  doneBtnEl.addEventListener('click', () => {
    if (!S.strokes.length) { alert('No signature yet. Draw something first!'); return; }
    freezeRecording();
    setMode('done');
    setStatus('Signature complete! Choose how to save it.', 'done');
    panelEl.classList.remove('hidden');
    // Hide Finish; only Try Again remains visible
    doneBtnEl.style.display = 'none';
  });

  // ── Try Again button ──────────────────────
  document.getElementById('clear-btn').addEventListener('click', resetAll);

  // ── Panel close ───────────────────────────
  document.getElementById('close-panel-btn').addEventListener('click', () => {
    panelEl.classList.add('hidden');
  });

  // ── Replay ────────────────────────────────
  document.getElementById('replay-btn').addEventListener('click', replayAnimation);

  // ── Share sub-links (Video / Image) ───────
  document.querySelectorAll('.ep-sublink[data-target]').forEach(btn => {
    btn.addEventListener('click', () => shareToSocial(btn.dataset.target));
  });

  // ── Background chips ──────────────────────
  document.querySelectorAll('.bgchip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.bgchip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      S.bgMode = btn.dataset.bg;
      const bc = document.getElementById('bg-palette-btn');
      bc.classList.remove('active-custom');
      bc.style.borderColor = '';
    });
  });

  // ── Save chips ────────────────────────────
  document.querySelectorAll('.savechip').forEach(btn => {
    btn.addEventListener('click', () => {
      switch (btn.dataset.format) {
        case 'png':   exportPNG();   break;
        case 'svg':   exportSVG();   break;
        case 'pdf':   exportPDF();   break;
        case 'video': exportVideo(); break;
      }
    });
  });
}

/* ════════════════════════════════════════
   BOOT
════════════════════════════════════════ */
function init() {
  initUI();
  initColorWheel();
  initBgPalette();
  drawStylePreviews();
  initTutorialTrail();
  loop();
  initMediaPipe();
}

init();
