/**
 * VIDA OPTIMA - Plataforma de Bienestar Integral
 * Autor: Terry Edicson Romero Loreto | C.I: 20.264.887
 * Versi\u00f3n: 3.0.0 - RESTORED
 */

window.onerror = function(msg, url, line) {
  console.error('Error detectado:', msg, 'en', url, 'l\u00ednea', line);
  return false;
};

// ESTADO GLOBAL
let userData = {
  nombre: '', edad: 30, sexo: 'masculino', peso: 70, estatura: 170,
  ubicacion: '', streak: 1, coins: 10,
  lastCheckIn: new Date().toDateString(),
  enfermedades: [], alergias: '', fuma: 'no', alcohol: 'no',
  sueno: 'bueno', estres: 'bajo', digestion: 'normal',
  objetivos: ['mantenimiento'], enfoques: [],
  ingreso: 0, presupuesto: 0, actividad: 'sedentario',
  tiempoEjercicio: '30', fechaRegistro: new Date().toISOString(),
  historial: {}, isSynced: false, isPremium: false
};

window.currentModule = 'perfil';
window.currentMenuType = null;
window.currentExerciseType = 'casa';
window.menuWeekOffset = 0;

// INICIALIZACION
function initApp() {
  const saved = localStorage.getItem('vidaOptima_user');
  if (saved) {
    try { userData = { ...userData, ...JSON.parse(saved) }; }
    catch(e) { console.warn('Cache local no v\u00e1lido'); }
  }
  if (typeof auth !== 'undefined') {
    auth.onAuthStateChanged(user => {
      if (user) {
        db.collection('users').doc(user.uid).get().then(doc => {
          if (doc.exists) {
            userData = { ...userData, ...doc.data(), isSynced: true };
            saveLocal();
          }
        });
      }
    });
  }
  checkDailyStreak();
}

function saveLocal() {
  try { localStorage.setItem('vidaOptima_user', JSON.stringify(userData)); }
  catch(e) {}
}

function checkDailyStreak() {
  const today = new Date().toDateString();
  if (userData.lastCheckIn !== today) {
    const last = new Date(userData.lastCheckIn);
    const diff = Math.round((new Date() - last) / 86400000);
    userData.streak = diff <= 1 ? (userData.streak || 1) + 1 : 1;
    userData.coins = (userData.coins || 0) + 5;
    userData.lastCheckIn = today;
    saveLocal();
  }
}

// ONBOARDING
function startOnboarding() {
  document.getElementById('legalModal').style.display = 'flex';
}

function acceptLegal() {
  document.getElementById('legalModal').style.display = 'none';
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('onboarding').classList.remove('hidden');
  nextStep(1);
}

let currentStep = 1;
function nextStep(step) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('step' + step);
  if (el) {
    el.classList.add('active');
    currentStep = step;
    const total = 6;
    const pct = Math.round(((step - 1) / (total - 1)) * 100);
    const fill = document.getElementById('progressFill');
    const label = document.getElementById('progressLabel');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = 'Paso ' + step + ' de ' + total;
    if (step === 6) renderSummary();
  }
}

function toggleOption(el) { el.classList.toggle('selected'); }
function toggleFocus(el, val) {
  el.classList.toggle('selected');
  // update hidden
  const selected = [...document.querySelectorAll('#focusGrid .focus-item.selected')]
    .map(e => e.getAttribute('data-val') || val);
  const input = document.getElementById('enfoques');
  if (input) input.value = selected.join(',');
}

function collectData() {
  const getVal = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const getNum = id => parseFloat(getVal(id)) || 0;
  const enfs = [...document.querySelectorAll('input[name="enfermedad"]:checked')].map(e => e.value);
  const objs = [...document.querySelectorAll('#objetivoCards .option-card.selected')].map(e => e.dataset.value);
  const focs = [...document.querySelectorAll('#focusGrid .focus-item.selected')].map(e => {
    const txt = e.textContent.trim().toLowerCase();
    if (txt.includes('energ')) return 'energia';
    if (txt.includes('intelecto')) return 'intelecto';
    if (txt.includes('fuerza')) return 'fuerza';
    if (txt.includes('rendimiento')) return 'rendimiento';
    if (txt.includes('salud')) return 'salud';
    if (txt.includes('sue')) return 'sueno';
    if (txt.includes('libido')) return 'libido';
    if (txt.includes('longevidad')) return 'longevidad';
    return txt;
  });

  userData = {
    ...userData,
    nombre: getVal('nombre') || 'Usuario',
    edad: getNum('edad') || 30,
    sexo: getVal('sexo') || 'masculino',
    peso: getNum('peso') || 70,
    estatura: getNum('estatura') || 170,
    ubicacion: getVal('ubicacion') || 'Venezuela',
    enfermedades: enfs,
    alergias: getVal('alergias') || 'ninguna',
    sueno: getVal('sueno') || 'bueno',
    estres: getVal('estres') || 'bajo',
    digestion: getVal('digestion') || 'normal',
    fuma: getVal('fuma') || 'no',
    alcohol: getVal('alcohol') || 'no',
    objetivos: objs.length ? objs : ['mantenimiento'],
    enfoques: focs,
    ingreso: getNum('ingreso') || 300,
    presupuesto: getNum('presupuesto') || 50,
    actividad: getVal('actividad') || 'sedentario',
    tiempoEjercicio: getVal('tiempoEjercicio') || '30',
    fechaRegistro: userData.fechaRegistro || new Date().toISOString()
  };
  saveLocal();
}

function renderSummary() {
  collectData();
  const imc = (userData.peso / Math.pow(userData.estatura / 100, 2)).toFixed(1);
  const card = document.getElementById('summaryCard');
  if (!card) return;
  card.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;text-align:left;">
      <div><span style="color:var(--text3);font-size:11px;">NOMBRE</span><br><strong>${userData.nombre}</strong></div>
      <div><span style="color:var(--text3);font-size:11px;">EDAD</span><br><strong>${userData.edad} a\u00f1os</strong></div>
      <div><span style="color:var(--text3);font-size:11px;">IMC</span><br><strong>${imc}</strong></div>
      <div><span style="color:var(--text3);font-size:11px;">OBJETIVO</span><br><strong>${userData.objetivos.join(', ')}</strong></div>
      <div><span style="color:var(--text3);font-size:11px;">PRESUPUESTO</span><br><strong>$${userData.presupuesto} quincenal</strong></div>
      <div><span style="color:var(--text3);font-size:11px;">ACTIVIDAD</span><br><strong>${userData.actividad}</strong></div>
    </div>`;
}

function generatePlan(isNew) {
  collectData();
  document.getElementById('onboarding').classList.add('hidden');
  const dash = document.getElementById('dashboard');
  dash.classList.remove('hidden');
  const dashUser = document.getElementById('dashUser');
  if (dashUser) {
    dashUser.innerHTML = `
      <div style="font-size:13px;font-weight:600;">${userData.nombre}</div>
      <div style="font-size:11px;color:var(--text3);">${userData.sexo} &bull; ${userData.edad} a\u00f1os</div>
      <div style="font-size:11px;color:var(--primary);margin-top:4px;">&#x1f525; Racha: ${userData.streak} d\u00edas</div>`;
  }
  showModule('perfil');
  if (isNew) {
    const wm = document.getElementById('welcomeModal');
    if (wm) { wm.classList.remove('hidden'); wm.style.display = 'flex'; }
  }
  if (userData.isSynced && typeof db !== 'undefined') {
    auth.currentUser && db.collection('users').doc(auth.currentUser.uid).set(userData, { merge: true });
  }
}

// NAVEGACION DE MODULOS
function showModule(modName) {
  window.currentModule = modName;
  document.querySelectorAll('.dash-link').forEach(l => l.classList.remove('active'));
  const activeLink = document.querySelector(`.dash-link[onclick*="'${modName}'"]`);
  if (activeLink) activeLink.classList.add('active');

  const content = document.getElementById('dashContent');
  if (!content) return;

  // Cerrar menu mobile si abierto
  const sidebar = document.getElementById('dashSidebar');
  if (sidebar && sidebar.classList.contains('open')) toggleMobileMenu();

  try {
    switch(modName) {
      case 'auth':          content.innerHTML = Modules.renderAuth(); break;
      case 'perfil':        content.innerHTML = Modules.renderPerfil(userData); break;
      case 'progreso':      content.innerHTML = Modules.renderProgreso(userData); break;
      case 'menu':          content.innerHTML = Modules.renderMenu(userData); break;
      case 'jugos':         content.innerHTML = Modules.renderJugos(userData); break;
      case 'ejercicio':     content.innerHTML = Modules.renderEjercicio(userData); break;
      case 'compras':       content.innerHTML = Modules.renderCompras(userData); break;
      case 'recomendaciones': content.innerHTML = Modules.renderRecomendaciones(userData); break;
      case 'sexual':        content.innerHTML = Modules.renderSexual(userData); break;
      case 'mental':        content.innerHTML = Modules.renderMental(userData); break;
      case 'seguridad':     content.innerHTML = Modules.renderSeguridad(userData); break;
      case 'suplementos':   content.innerHTML = Modules.renderSuplementos(userData); break;
      case 'biohacks':      content.innerHTML = Modules.renderBioHacks(userData); break;
      case 'rewards':       content.innerHTML = Modules.renderRewards(userData); break;
      default:              content.innerHTML = `<div class="module"><p>M\u00f3dulo en construcci\u00f3n.</p></div>`;
    }
  } catch(e) {
    console.error('Error en m\u00f3dulo', modName, e);
    content.innerHTML = `<div class="module"><div class="alert-box" style="border-color:#f55;">
      <h3>&#9888; Error temporal</h3><p>${e.message}</p>
      <button class="btn-primary" onclick="showModule('perfil')">Volver al perfil</button>
    </div></div>`;
  }
  window.scrollTo(0, 0);
}

// MODALES
function closeModal() {
  document.querySelectorAll('.modal').forEach(m => {
    m.classList.add('hidden'); m.style.display = '';
  });
}
function closeInfoModal() { closeModal(); }
function closeWelcomeModal() {
  const wm = document.getElementById('welcomeModal');
  if (wm) { wm.classList.add('hidden'); wm.style.display = ''; }
  showModule('menu');
}

// MENU
function toggleMenuType(type) {
  window.currentMenuType = type;
  showModule('menu');
}

// EJERCICIO
function toggleExerciseType(type) {
  window.currentExerciseType = type;
  showModule('ejercicio');
}

// COMPRAS - SEMANA
function toggleMenuWeek(offset) {
  window.menuWeekOffset = offset;
  showModule('menu');
}

// COMIDA MODAL
function openMealModal(mealName) {
  const modal = document.getElementById('mealModal');
  if (!modal) return;
  const titleEl = document.getElementById('modalMealName');
  if (titleEl) titleEl.textContent = mealName;
  const details = getMealDetails(mealName);
  const set = (id, val) => { const el = document.getElementById(id); if(el) el.innerHTML = val; };
  set('modalPortion', details.portion);
  set('modalPrep', details.prep);
  set('modalVits', details.vits);
  set('modalWater', details.water);
  set('modalAlt', details.alt);
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
}

function getMealDetails(name) {
  const n = (name || '').toLowerCase();
  let portion = '1 porci\u00f3n moderada seg\u00fan tu IMC.';
  let prep = 'Preparaci\u00f3n simple: cocina con m\u00ednimo aceite.';
  let vits = 'Consulta el perfil de tu alimento para vitaminas espec\u00edficas.';
  let water = 'Acompa\u00f1a con 1-2 vasos de agua (300-500ml).';
  let alt = 'Si no consigues este alimento, busca un equivalente proteico o calórico similar.';

  if (n.includes('huevo') || n.includes('tortilla')) {
    portion = '2-3 huevos medianos (aprox. 150-200g)';
    prep = '1. Rompe los huevos en un bowl.<br>2. Bate con sal y pimienta al gusto.<br>3. Cocina en sart\u00e9n con 1 cucharadita de aceite de oliva a fuego medio.<br>4. Revuelve suavemente hasta cuajar.';
    vits = 'Vitamina B12, D, A. Prote\u00edna completa (6g por huevo). Colina para el cerebro.';
    water = '1 vaso de agua (250ml) antes de comer.';
    alt = 'Sin huevos: 100g de at\u00fan en agua + aguacate. Mismo perfil proteico.';
  } else if (n.includes('arroz')) {
    portion = '1 taza de arroz cocido (180-200g)';
    prep = '1. Lava el arroz 2-3 veces hasta agua clara.<br>2. Proporci\u00f3n: 1 taza arroz + 2 tazas agua.<br>3. Hierve, baja el fuego y tapa por 18 minutos.<br>4. Reposa 5 minutos antes de servir.';
    vits = 'Carbohidratos complejos, vitaminas del grupo B, algo de magnesio.';
    water = '2 vasos de agua (500ml) con la comida.';
    alt = 'Sin arroz: yuca, pl\u00e1tano verde hervido o papa. Mismo aporte calórico.';
  } else if (n.includes('pollo') || n.includes('pechuga')) {
    portion = '150-200g de pollo (tama\u00f1o de la palma de tu mano)';
    prep = '1. Marina con ajo, lim\u00f3n y especias 30min.<br>2. Cocina a la plancha a fuego medio-alto 6-7 min por lado.<br>3. El interior debe llegar a 74\u00b0C. Si no tienes term\u00f3metro, corta al centro: sin rosado.';
    vits = 'Prote\u00edna de alta calidad (31g/100g), B3, B6, zinc, f\u00f3sforo.';
    water = '2 vasos de agua. El pollo es bajo en grasa si es a la plancha.';
    alt = 'Sin pollo: at\u00fan, sardinas, huevos (3 huevos = 100g pollo en prote\u00edna).';
  } else if (n.includes('avena')) {
    portion = '\u00bd taza de avena seca (45g) = 1 taza cocida';
    prep = '1. Hierve 1 taza de agua o leche.<br>2. Agrega \u00bd taza de avena.<br>3. Cocina 3-5 min revolviendo.<br>4. Agrega canela, pl\u00e1tano maduro o una cucharadita de miel.';
    vits = 'Beta-glucanos (reduce colesterol), fibra soluble, hierro, magnesio, B1.';
    water = '1 vaso de agua (250ml).';
    alt = 'Sin avena: ar\u00e9pa de ma\u00edz, pan integral, yuca. Mismo nivel de saciedad.';
  } else if (n.includes('lentejas') || n.includes('caraotas') || n.includes('frijoles')) {
    portion = '\u00bd taza seca (100g) = 1 taza cocida (200g)';
    prep = '1. Remoja las legumbres 6-8h o toda la noche en agua con \u00bd cucharadita de bicarbonato.<br>2. Desecha el agua del remojo. Enjuaga.<br>3. Hierve en agua nueva con ajo y cebolla por 30-45 min.<br>4. Sofr\u00ede con tomate, ajo y cilantro al gusto.';
    vits = 'Hierro no-hemo (absorci\u00f3n con vitamina C), fibra, folato, prote\u00edna vegetal.';
    water = '2-3 vasos de agua. Las legumbres necesitan buena hidrataci\u00f3n.';
    alt = 'Sin lentejas: caraotas, garbanzos, granos verdes. Mismo perfil nutricional.';
  } else if (n.includes('salm\u00f3n') || n.includes('salmon') || n.includes('pescado')) {
    portion = '150-180g (filete mediano)';
    prep = '1. Seca el filete con papel absorbente.<br>2. Sazona con sal, limón y eneldo.<br>3. Cocina en sart\u00e9n con un poco de aceite de oliva, 4-5 min por lado a fuego medio.<br>4. Listo cuando la carne se desintegre f\u00e1cilmente con un tenedor.';
    vits = 'Omega-3 EPA/DHA (antiinflamatorio), vitamina D, B12, prote\u00edna de alta calidad.';
    water = '2 vasos de agua.';
    alt = 'Sin salm\u00f3n: sardinas en agua (m\u00e1s económicas, mismo Omega-3), at\u00fan, merluza.';
  }

  return { portion, prep, vits, water, alt };
}

// RECOMENDACIONES ROTACION
let recIndexes = {};
function nextRecomendacion(tipo) {
  recIndexes[tipo] = (recIndexes[tipo] || 0) + 1;
  showModule('recomendaciones');
}

// MOBILE MENU
function toggleMobileMenu() {
  const sidebar = document.getElementById('dashSidebar');
  const overlay = document.getElementById('mobileOverlay');
  if (!sidebar) return;
  sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('active');
}

// IMPRESION
function printShoppingList() { window.print(); }

// REINICIO
function restartApp() {
  if (!confirm('¿Crear un nuevo perfil? Se borrarán los datos actuales.')) return;
  localStorage.removeItem('vidaOptima_user');
  userData = { nombre:'',edad:30,sexo:'masculino',peso:70,estatura:170,ubicacion:'',
    streak:1,coins:10,lastCheckIn:new Date().toDateString(),enfermedades:[],alergias:'',
    fuma:'no',alcohol:'no',sueno:'bueno',estres:'bajo',digestion:'normal',
    objetivos:['mantenimiento'],enfoques:[],ingreso:0,presupuesto:0,
    actividad:'sedentario',tiempoEjercicio:'30',fechaRegistro:new Date().toISOString(),
    historial:{},isSynced:false,isPremium:false };
  location.reload();
}

// PROGRESO / HISTORIAL
function toggleTaskStatus(dateStr, taskId, btnEl) {
  if (!userData.historial) userData.historial = {};
  if (!userData.historial[dateStr]) userData.historial[dateStr] = {};
  const done = userData.historial[dateStr][taskId];
  userData.historial[dateStr][taskId] = !done;
  if (btnEl) {
    btnEl.textContent = !done ? '✅ Completado' : '⬜ Marcar';
    btnEl.style.opacity = !done ? '0.6' : '1';
  }
  userData.coins = (userData.coins || 0) + (!done ? 2 : -2);
  saveLocal();
}

// PAGOS / REWARDS
function openCryptoPayment() {
  alert('Funcionalidad de pago en integraci\u00f3n. Contáctanos en: vidaoptima.oficial@gmail.com');
}
function simulatePaymentSuccess(planType) {
  userData.isPremium = true;
  userData.premiumPlan = planType;
  saveLocal();
  alert('¡Bienvenido a Premium! Tu plan ' + planType + ' está activo.');
  showModule('perfil');
}
function payWithCoins() {
  if ((userData.coins || 0) < 50) { alert('Necesitas m\u00e1s de 50 Optimal Coins.'); return; }
  userData.coins -= 50;
  userData.isPremium = true;
  saveLocal();
  alert('¡Premium activado con tus Optimal Coins!');
  showModule('perfil');
}
function watchVideo() {
  userData.coins = (userData.coins || 0) + 10;
  saveLocal();
  alert('+10 Optimal Coins ganados. \u00a1Sigue as\u00ed!');
}

// AUTH FIREBASE
function handleAuth(type) {
  const email = document.getElementById('auth-email');
  const pass = document.getElementById('auth-pass');
  if (!email || !pass) return;
  if (!email.value || !pass.value) { alert('Completa email y contrase\u00f1a.'); return; }
  if (typeof auth === 'undefined') { alert('Firebase no disponible.'); return; }
  if (type === 'login') {
    auth.signInWithEmailAndPassword(email.value, pass.value)
      .then(() => showModule('perfil'))
      .catch(e => alert('Error: ' + e.message));
  } else {
    auth.createUserWithEmailAndPassword(email.value, pass.value)
      .then(cred => {
        userData.isSynced = true;
        db.collection('users').doc(cred.user.uid).set(userData);
        showModule('perfil');
      })
      .catch(e => alert('Error: ' + e.message));
  }
}

function logout() {
  if (typeof auth !== 'undefined') auth.signOut();
  userData.isSynced = false;
  saveLocal();
  showModule('auth');
}

// SERVICE WORKER
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('SW registrado'))
      .catch(e => console.warn('SW no disponible:', e));
  });
}

// ARRANQUE
document.addEventListener('DOMContentLoaded', initApp);
