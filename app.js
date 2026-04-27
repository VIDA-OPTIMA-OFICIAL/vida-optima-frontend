console.log('VIDA OPTIMA V2.1.2 ACTIVE'); window.addEventListener('load', () => { setTimeout(() => { if(document.getElementById('step6').classList.contains('active')) { collectData(); renderSummary(); } }, 500); });
window.onerror = function(msg, url, line) {
  alert("ERROR DETECTADO: " + msg + "\nEn: " + url + "\nLÃ­nea: " + line);
  return false;
};

/**
 * ============================================================
 * VIDA Ã“PTIMA â€” Plataforma de Bienestar Integral (app.js)
 * ============================================================
 * @author      Terry Edicson Romero Loreto (Founder & CEO)
 * @id          20.264.887
 * @copyright   Â© 2025 Terry Edicson Romero Loreto. Todos los derechos reservados.
 */

// 1. ESTADO GLOBAL E INICIALIZACIÃ“N
let userData = {
  nombre: '',
  edad: 30,
  sexo: 'masculino',
  peso: 70,
  estatura: 170,
  ubicacion: '',
  streak: 1,
  coins: 10,
  lastCheckIn: new Date().toDateString(),
  enfermedades: [],
  alergias: '',
  fuma: 'no',
  alcohol: 'no',
  sueno: 'bueno',
  estres: 'bajo',
  digestion: 'normal',
  objetivos: ['mantenimiento'],
  enfoques: [],
  ingreso: 0,
  presupuesto: 0,
  actividad: 'sedentario',
  tiempoEjercicio: '30',
  fechaRegistro: new Date().toISOString(),
  historial: {},
  isSynced: false,
  isPremium: false
};

// Cargar datos locales de inmediato si existen
const savedData = localStorage.getItem('vidaOptima_user');
if (savedData) {
  try {
    userData = { ...userData, ...JSON.parse(savedData) };
  } catch (e) { console.error("Error cargando cachÃ©:", e); }
}

const BACKEND_URL = "https://vida-optima-backend-production.up.railway.app"; 

// 2. FIREBASE AUTH OBSERVER
auth.onAuthStateChanged(user => {
  if (user) {
    console.log("ðŸ‘¤ Usuario logueado:", user.email);
    db.collection("users").doc(user.uid).get().then(doc => {
      if (doc.exists) {
        userData = { ...userData, ...doc.data() };
        console.log("ðŸ“¦ Datos sincronizados desde la nube");
        if (window.currentModule === 'auth') showModule('perfil');
      } else {
        console.log("ðŸ†• Usuario nuevo, creando registro...");
        db.collection("users").doc(user.uid).set(userData);
      }
    });
  } else {
    console.log("ðŸš« Usuario no logueado");
  }
});

// 3. FUNCIONES DE AUTENTICACIÃ“N
function handleAuth(type) {
  const email = document.getElementById('auth-email')?.value;
  const pass = document.getElementById('auth-pass')?.value;
  const errorEl = document.getElementById('auth-error');

  if (type !== 'google' && (!email || !pass)) {
    if(errorEl) { errorEl.textContent = "Completa todos los campos."; errorEl.style.display = 'block'; }
    return;
  }

  if (type === 'google') {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(err => {
      if(errorEl) { errorEl.textContent = "Error con Google: " + err.message; errorEl.style.display = 'block'; }
    });
    return;
  }

  if (type === 'signup') {
    auth.createUserWithEmailAndPassword(email, pass).catch(err => {
      if(errorEl) { errorEl.textContent = "Error: " + err.message; errorEl.style.display = 'block'; }
    });
  } else {
    auth.signInWithEmailAndPassword(email, pass).catch(err => {
      if(errorEl) { errorEl.textContent = "Correo o contraseÃ±a incorrectos."; errorEl.style.display = 'block'; }
    });
  }
}

function logout() {
  auth.signOut().then(() => { location.reload(); });
}

function deleteAccount() {
  if (confirm("Â¿ESTÃS SEGURO? Esta acciÃ³n es irreversible. Se eliminarÃ¡ todo permanentemente.")) {
    const user = auth.currentUser;
    if (user) {
      db.collection("users").doc(user.uid).delete().then(() => {
        user.delete().then(() => {
          alert("Cuenta eliminada.");
          localStorage.clear();
          location.reload();
        });
      }).catch(() => {
        alert("Debes re-autenticarte antes de eliminar la cuenta por seguridad.");
      });
    }
  }
}

// 4. NAVEGACIÃ“N Y ONBOARDING
function startOnboarding() {
  document.getElementById('legalModal').style.display = 'flex';
}

function acceptLegal() {
  document.getElementById('legalModal').style.display = 'none';
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('onboarding').classList.remove('hidden');
}

function nextStep(step) {
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  const target = document.getElementById('step' + step);
  if (target) target.classList.add('active');

  const progress = (step / 6) * 100;
  const fill = document.getElementById('progressFill');
  const label = document.getElementById('progressLabel');
  if(fill) fill.style.width = progress + '%';
  if(label) label.textContent = `Paso ${step} de 6`;

  if(step === 6) {
    collectData();
    renderSummary();
  }
}

function selectOption(el, inputId, value) {
  const parent = el.parentElement;
  parent.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  const input = document.getElementById(inputId);
  if (input) input.value = value;
}

function toggleOption(el) {
  el.classList.toggle('selected');
}

function toggleFocus(el, value) {
  el.classList.toggle('selected');
}

// 5. NÃšCLEO DE DATOS Y RENDERIZADO
function syncUserData() {
  try {
    localStorage.setItem('vidaOptima_user', JSON.stringify(userData));
    const user = auth.currentUser;
    if (user && typeof db !== 'undefined') {
      db.collection('users').doc(user.uid).set(userData, { merge: true });
    }
  } catch (e) { console.error("Sync Error:", e); }
}

function collectData() {
  try {
    const enfoques = [];
    document.querySelectorAll('.focus-item.selected').forEach(el => enfoques.push(el.textContent.trim()));
    
    const enfermedades = [];
    document.querySelectorAll('input[name="enfermedad"]:checked').forEach(cb => enfermedades.push(cb.value));

    const objetivos = [];
    document.querySelectorAll('.option-card.selected').forEach(el => {
      const val = el.getAttribute('data-value');
      if(val) objetivos.push(val);
    });
    if(objetivos.length === 0) objetivos.push('mantenimiento');

    userData = {
      ...userData,
      nombre: document.getElementById('nombre')?.value || 'Usuario',
      edad: parseInt(document.getElementById('edad')?.value) || 30,
      sexo: document.getElementById('sexo')?.value || 'masculino',
      peso: parseFloat(document.getElementById('peso')?.value) || 70,
      estatura: parseInt(document.getElementById('estatura')?.value) || 170,
      ubicacion: document.getElementById('ubicacion')?.value || '',
      enfermedades, objetivos, enfoques,
      ingreso: parseInt(document.getElementById('ingreso')?.value) || 0,
      presupuesto: parseInt(document.getElementById('presupuesto')?.value) || 0,
      actividad: document.getElementById('actividad')?.value || 'sedentario',
      tiempoEjercicio: document.getElementById('tiempoEjercicio')?.value || '30',
      alergias: document.getElementById('alergias')?.value || 'Ninguna',
      fuma: document.getElementById('fuma')?.value || 'no',
      alcohol: document.getElementById('alcohol')?.value || 'no',
      sueno: document.getElementById('sueno')?.value || 'bueno',
      estres: document.getElementById('estres')?.value || 'bajo',
      digestion: document.getElementById('digestion')?.value || 'normal'
    };
    syncUserData();
  } catch (e) { console.error("Collect Error:", e); }
}

function renderSummary() {
  try {
    const sum = document.getElementById('summaryCard');
    if (!sum) return;
    const obsStr = (userData.objetivos || []).map(o => o.replace('_', ' ')).join(', ');
    sum.innerHTML = `
      <div style="text-align: left; animation: fadeIn 0.5s ease-out; color: white;">
        <p><strong>Hola ${userData.nombre}</strong></p>
        <p>Hemos analizado tu perfil (${userData.edad} aÃ±os, ${userData.peso}kg) y hemos adaptado tu ruta considerando tus requerimientos para <strong>${obsStr}</strong>.</p>
        <p style="margin-top:10px;">Tu menÃº se ha optimizado para un presupuesto de $${userData.presupuesto} y tus rutinas para ${userData.tiempoEjercicio} minutos diarios.</p>
        <div style="margin-top: 15px; padding: 15px; background: rgba(0, 243, 255, 0.1); border-radius: 8px; border-left: 4px solid var(--primary);">
          <p style="margin: 0; font-size: 14px; line-height: 1.4;">
            ðŸ“Œ <strong>Dato clave:</strong> Al entrar, ve directamente al <strong>panel lateral</strong> para ver tus <strong>instrucciones para vivir 100 aÃ±os</strong>.
          </p>
        </div>
      </div>
    `;
  } catch (e) { console.error("Render Error:", e); }
}

function generatePlan(isNew = false) {
  document.getElementById('onboarding').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  
  const dashUser = document.getElementById('dashUser');
  if(dashUser) {
    dashUser.innerHTML = `<strong>${userData.nombre}</strong><br>Objetivo: ${userData.objetivos[0]}`;
  }

  window.currentMenuType = (userData.ingreso >= 600) ? 'default_premium' : 'default_q1';
  window.currentExerciseType = 'casa';

  showModule('perfil');
  if (isNew) openWelcomeModal();
  syncWithBackend();
}

async function syncWithBackend() {
  if (!userData || !userData.peso) return;
  
  console.info("ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ¢â‚¬â„¢ Intentando certificar datos con el servidor...");
  
  // Timeout de 3 segundos para no bloquear la experiencia del usuario
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${BACKEND_URL}/api/calculate-plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userData }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const result = await response.json();

    if (result && result.success) {
      console.info("ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ SincronizaciÃƒÆ’Ã‚Â³n Exitosa. Datos certificados por Vida ÃƒÆ’Ã¢â‚¬Å“ptima.");
      userData.kcal = result.kcal;
      userData.macros = result.macros;
      userData.perfil = result.perfil;
      userData.ubicacion_detectada = result.region;
      userData.isSynced = true;
      window.currentMenuType = result.menuType;
      
      syncUserData();
      
      const activeLink = document.querySelector('.dash-link.active');
      if(activeLink && activeLink.getAttribute('onclick')) {
        const match = activeLink.getAttribute('onclick').match(/'([^']+)'/);
        if (match) showModule(match[1]);
      }
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn("ÃƒÂ¢Ã…Â¡Ã‚Â ÃƒÂ¯Ã‚Â¸Ã‚Â Servidor no disponible. Modo Local Activo.");
    // La app seguirÃƒÆ’Ã‚Â¡ funcionando con los datos de engine.js (local)
  }
}

function showModule(modName) {
  window.currentModule = modName;
  
  // PROTECCIÃƒÆ’Ã¢â‚¬Å“N FIREBASE: Si no hay usuario y no es onboarding/auth, forzar login
  const user = auth.currentUser;
  if (!user && modName !== 'auth' && modName !== 'onboarding') {
    modName = 'auth';
    window.currentModule = 'auth';
  }

  // Rastreo de AnalÃƒÆ’Ã‚Â­tica
  Analytics.trackEvent('module_view', { module: modName });

  // Update nav UI
  document.querySelectorAll('.dash-link').forEach(l => l.classList.remove('active'));
  const link = Array.from(document.querySelectorAll('.dash-link')).find(l => l.getAttribute('onclick').includes(modName));
  if(link) link.classList.add('active');

  // Si es mÃƒÆ’Ã‚Â³vil, cerrar el menÃƒÆ’Ã‚Âº al hacer clic
  if (window.innerWidth <= 900) {
    const sidebar = document.getElementById('dashSidebar');
    const overlay = document.getElementById('mobileOverlay');
    if (sidebar && sidebar.classList.contains('mobile-open')) {
      sidebar.classList.remove('mobile-open');
      overlay.classList.remove('active');
    }
  }

  const content = document.getElementById('dashContent');
  if (!content) return;

  // Asegurar que userData estÃƒÆ’Ã‚Â© cargado
  if (!userData || !userData.nombre) {
    const saved = localStorage.getItem('vidaOptima_user');
    if (saved) userData = JSON.parse(saved);
  }

  // Render based on module
  switch(modName) {
    case 'auth': content.innerHTML = Modules.renderAuth(); break;
    case 'perfil': content.innerHTML = Modules.renderPerfil(userData); break;
    case 'progreso': content.innerHTML = Modules.renderProgreso(userData); break;
    case 'menu': content.innerHTML = Modules.renderMenu(userData); break;
    case 'jugos': content.innerHTML = Modules.renderJugos(userData); break;
    case 'ejercicio': content.innerHTML = Modules.renderEjercicio(userData); break;
    case 'compras':
      content.innerHTML = Modules.renderCompras(userData);
      initTipsRotator();
      break;
    case 'recomendaciones': content.innerHTML = Modules.renderRecomendaciones(userData); break;
    case 'sexual': content.innerHTML = Modules.renderSexual(userData); break;
    case 'mental': content.innerHTML = Modules.renderMental(userData); break;
    case 'seguridad': content.innerHTML = Modules.renderSeguridad(userData); break;
    case 'suplementos': content.innerHTML = Modules.renderSuplementos(); break;
    case 'biohacks': content.innerHTML = Modules.renderBioHacks(userData); break;
    case 'rewards': content.innerHTML = Modules.renderRewards(userData); break;
  }

  // After compras renders: wire print button and tip rotator
  if (modName === 'compras') {
    var printBtn = content.querySelector('button[title="Descargar en PDF"]');
    if (printBtn) {
      printBtn.setAttribute('title', 'Descargar Lista de Compras en PDF');
      printBtn.onclick = function() { printShoppingList(); };
    }
  }
}

function initTipsRotator() {
  var tips = window._comprasTips;
  if (!tips || tips.length === 0) return;
  var idx = 0;
  function showTips() {
    var t0 = tips[idx % tips.length];
    var t1 = tips[(idx + 1) % tips.length];
    var c0 = document.getElementById('tipCard0');
    var c1 = document.getElementById('tipCard1');
    if (!c0 || !c1) { clearInterval(window._tipsInterval); return; }
    c0.style.opacity = '0'; c1.style.opacity = '0';
    setTimeout(function() {
      c0.querySelector('.card-icon').textContent = t0.icon;
      c0.querySelector('h3').textContent = t0.titulo;
      c0.querySelector('p').textContent = t0.texto;
      c1.querySelector('.card-icon').textContent = t1.icon;
      c1.querySelector('h3').textContent = t1.titulo;
      c1.querySelector('p').textContent = t1.texto;
      c0.style.opacity = '1'; c1.style.opacity = '1';
    }, 300);
    idx += 2;
  }
  showTips();
  if (window._tipsInterval) clearInterval(window._tipsInterval);
  window._tipsInterval = setInterval(showTips, 30000);
}


function restartApp() {
  localStorage.removeItem('vidaOptima_user');
  location.reload();
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Imprimir Solo Lista de Compras ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function printShoppingList() {
  // Grab only the shopping list section by ID
  const listSection = document.getElementById('shopping-list-printable');
  if (!listSection) { alert('No se encontrÃƒÆ’Ã‚Â³ la lista de compras.'); return; }

  const u = userData;
  const nombre = u.nombre || 'Usuario';
  const fecha = new Date().toLocaleDateString('es', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  const win = window.open('', '_blank', 'width=700,height=900');
  win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Lista de Compras ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Vida ÃƒÆ’Ã¢â‚¬Å“ptima</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; background: #fff; padding: 32px; }
    .header { border-bottom: 3px solid #1db954; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 22px; color: #1db954; }
    .header p { font-size: 13px; color: #555; margin-top: 4px; }
    .header .meta { font-size: 12px; color: #888; margin-top: 8px; }
    .category { font-size: 11px; font-weight: 800; color: #1db954; text-transform: uppercase;
                letter-spacing: 1.5px; margin: 20px 0 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
    ul { list-style: none; padding: 0; }
    li { padding: 7px 10px; border-left: 3px solid #ddd; margin-bottom: 5px; font-size: 14px;
         background: #f9f9f9; border-radius: 4px; }
    li span.qty { color: #1db954; font-weight: 700; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #eee;
              font-size: 11px; color: #aaa; text-align: center; }
    .badge { display: inline-block; background: #1db954; color: #fff; font-size: 10px;
             padding: 2px 8px; border-radius: 20px; margin-bottom: 8px; }
    @media print {
      body { padding: 16px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <span class="badge">VIDA ÃƒÆ’Ã¢â‚¬Å“PTIMA</span>
    <h1>ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã¢â‚¬Â¹ Lista de Compras Semanal</h1>
    <p>Preparada para: <strong>${nombre}</strong></p>
    <p class="meta">Generada el ${fecha} Ãƒâ€šÃ‚Â· VÃƒÆ’Ã‚Â¡lida hasta el prÃƒÆ’Ã‚Â³ximo domingo</p>
  </div>
  ${listSection.innerHTML}
  <div class="footer">
    Vida ÃƒÆ’Ã¢â‚¬Å“ptima ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Tu Manual de InstrucciÃƒÆ’Ã‚Â³n de Vida Ãƒâ€šÃ‚Â· Esta lista se actualiza automÃƒÆ’Ã‚Â¡ticamente cada domingo
  </div>
  <div class="no-print" style="text-align:center;margin-top:24px;">
    <button onclick="window.print()" style="background:#1db954;color:#fff;border:none;padding:12px 28px;border-radius:8px;font-size:15px;cursor:pointer;font-weight:700;">ÃƒÂ°Ã…Â¸Ã¢â‚¬â€œÃ‚Â¨ÃƒÂ¯Ã‚Â¸Ã‚Â Imprimir / Guardar PDF</button>
  </div>
</body>
</html>`);
  win.document.close();
  // Small delay so styles load before auto-print
  setTimeout(function() { win.focus(); }, 300);
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Rastreo de HÃƒÆ’Ã‚Â¡bitos ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function toggleTaskStatus(dateStr, taskId, btnElement) {
  if(!userData.historial) userData.historial = {};
  
  const key = `${dateStr}_${taskId}`;
  const currentState = userData.historial[key];
  
  // States: undefined -> true -> false -> undefined
  if (currentState === undefined) {
    userData.historial[key] = true;
    btnElement.classList.add('checked');
    btnElement.classList.remove('failed');
    btnElement.innerHTML = 'ÃƒÂ¢Ã…â€œÃ¢â‚¬Å“';
  } else if (currentState === true) {
    userData.historial[key] = false;
    btnElement.classList.remove('checked');
    btnElement.classList.add('failed');
    btnElement.innerHTML = 'ÃƒÂ¢Ã…â€œÃ¢â‚¬â€';
  } else {
    delete userData.historial[key];
    btnElement.classList.remove('checked');
    btnElement.classList.remove('failed');
    btnElement.innerHTML = 'ÃƒÂ¢Ã¢â‚¬â€Ã¢â‚¬Â¹';
  }
  
  syncUserData();
  
  // Si estamos en la vista de progreso, re-renderizar para actualizar grÃƒÆ’Ã‚Â¡ficas
  const activeLink = document.querySelector('.dash-link.active');
  if(activeLink && activeLink.getAttribute('onclick').includes('progreso')) {
    showModule('progreso');
  }
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ LÃƒÆ’Ã‚Â³gica MÃƒÆ’Ã‚Â³vil ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function toggleMobileMenu() {
  const sidebar = document.getElementById('dashSidebar');
  const overlay = document.getElementById('mobileOverlay');
  if (sidebar) {
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('active');
  }
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ LÃƒÆ’Ã‚Â³gica del Modal de Comidas ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function openMealModal(mealName) {
  document.getElementById('modalMealName').textContent = mealName;
  
  const details = getMealDetails(mealName);
  document.getElementById('modalPrep').innerHTML = details.prep;
  document.getElementById('modalAlt').innerHTML = details.alt;
  document.getElementById('modalPortion').innerHTML = details.portion;
  document.getElementById('modalVits').innerHTML = details.vits;
  document.getElementById('modalWater').innerHTML = details.water;
  
  document.getElementById('mealModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('mealModal').classList.add('hidden');
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ LÃƒÆ’Ã‚Â³gica de Modales de Info y Welcome ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function openWelcomeModal() {
  document.getElementById('welcomeModal').classList.remove('hidden');
}

function closeWelcomeModal() {
  document.getElementById('welcomeModal').classList.add('hidden');
}

function openInfoModal(title, type) {
  document.getElementById('infoModal').classList.remove('hidden');
  document.getElementById('infoThinking').classList.remove('hidden');
  document.getElementById('infoResult').classList.add('hidden');

  let explanation = "Dato biolÃƒÆ’Ã‚Â³gico.";

  if (type === 'edad') explanation = "Tu edad biolÃƒÆ’Ã‚Â³gica. El metabolismo se ralentiza un 2-5% por cada dÃƒÆ’Ã‚Â©cada despuÃƒÆ’Ã‚Â©s de los 30. Este plan contrarresta esa caÃƒÆ’Ã‚Â­da.";
  else if (type === 'peso') explanation = "Tu peso total. Recuerda que el mÃƒÆ’Ã‚Âºsculo pesa mÃƒÆ’Ã‚Â¡s que la grasa. No te obsesiones con el nÃƒÆ’Ã‚Âºmero, fÃƒÆ’Ã‚Â­jate en cÃƒÆ’Ã‚Â³mo te queda la ropa.";
  else if (type === 'imc') explanation = "ÃƒÆ’Ã‚Ândice de Masa Corporal. Es una mÃƒÆ’Ã‚Â©trica general para ver tu relaciÃƒÆ’Ã‚Â³n peso/altura, pero no distingue si el peso es de grasa o de puro mÃƒÆ’Ã‚Âºsculo.";
  else if (type === 'kcal') explanation = "CalorÃƒÆ’Ã‚Â­as diarias estimadas. Es la energÃƒÆ’Ã‚Â­a exacta que tu cuerpo necesita hoy para funcionar y alcanzar tu objetivo (sin pasar hambre).";
  else if (type === 'perfil') explanation = "Tu perfil metabÃƒÆ’Ã‚Â³lico base. El sistema adapta la velocidad y densidad de tus comidas considerando tu etapa de vida hormonal.";
  else if (type === 'proteinas') explanation = "Los ladrillos de tu cuerpo. Reparan el tejido, crean enzimas y fortalecen el sistema inmunolÃƒÆ’Ã‚Â³gico. Sin ellas, pierdes mÃƒÆ’Ã‚Âºsculo.";
  else if (type === 'carbos') explanation = "El combustible de tu cerebro y mÃƒÆ’Ã‚Âºsculos. Te dan la energÃƒÆ’Ã‚Â­a explosiva para rendir en el dÃƒÆ’Ã‚Â­a a dÃƒÆ’Ã‚Â­a.";
  else if (type === 'grasas') explanation = "Fundamentales para crear hormonas (como la testosterona o estrÃƒÆ’Ã‚Â³geno) y absorber vitaminas clave (A, D, E, K).";

  // Simular pensamiento de IA (1 segundo)
  setTimeout(() => {
    document.getElementById('infoThinking').classList.add('hidden');
    document.getElementById('infoResult').classList.remove('hidden');
    document.getElementById('infoTitle').textContent = title;
    document.getElementById('infoText').innerHTML = explanation;
  }, 1000);
}

function closeInfoModal() {
  document.getElementById('infoModal').classList.add('hidden');
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ LÃƒÆ’Ã‚Â³gica de Recomendaciones (Ciclo) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function nextRecomendacion(tipo) {
  if (!userData.recsIdx) {
    userData.recsIdx = { libros: 0, documentales: 0, podcasts: 0 };
  }
  if (userData.recsIdx[tipo] !== undefined) {
    userData.recsIdx[tipo]++;
  } else {
    userData.recsIdx[tipo] = 1;
  }
  
  // Guardar en Nube
  const user = auth.currentUser;
  if (user) {
    db.collection("users").doc(user.uid).set(userData, { merge: true })
      .then(() => console.log("ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Sincronizado en la nube"))
      .catch(e => console.error("ÃƒÂ¢Ã‚ÂÃ…â€™ Error sinc:", e));
  }

  syncUserData();
  showModule('recomendaciones');
}

function getMealDetails(mealName) {
  const name = mealName.toLowerCase();
  
  let portions = [];
  let preps = [];
  let vitsList = [];
  let alts = [];

  let water = "Bebe 1 vaso de agua 30 minutos antes de comer, y evita tomar mÃƒÆ’Ã‚Â¡s de medio vaso durante la comida para no diluir los jugos gÃƒÆ’Ã‚Â¡stricos y mejorar la digestiÃƒÆ’Ã‚Â³n.";

  // 1. PROTEÃƒÆ’Ã‚ÂNAS
  if (name.includes('pollo') || name.includes('pavo')) {
    portions.push("<strong>Pollo/Pavo:</strong> 1.5 palmas de mano (aprox 150g-200g).");
    preps.push("<strong>Pollo/Pavo:</strong> Sazona con sal, pimienta, ajo natural y orÃƒÆ’Ã‚Â©gano. Cocina a la plancha a fuego medio-alto. Deja reposar 3 min en el plato antes de cortarlo para que retenga sus jugos.");
    vitsList.push("Vitamina B3 (Niacina) y ProteÃƒÆ’Ã‚Â­nas de alto valor.");
    alts.push("ÃƒÂ°Ã…Â¸Ã‚ÂÃ¢â‚¬â€ Puedes sustituir el ave por atÃƒÆ’Ã‚Âºn, sardinas, huevos o cerdo magro.");
  }
  if (name.includes('carne') || name.includes('res') || name.includes('lomito') || name.includes('molida') || name.includes('bistec')) {
    portions.push("<strong>Carne de Res:</strong> 1 palma de mano (aprox 150g).");
    preps.push("<strong>Res:</strong> Cocina a la plancha o guisada. AÃƒÆ’Ã‚Â±ade la sal al final de la cocciÃƒÆ’Ã‚Â³n para retener mÃƒÆ’Ã‚Â¡s yodo y evitar que la carne se endurezca.");
    vitsList.push("Hierro hemo (alta absorciÃƒÆ’Ã‚Â³n) y Vitamina B12.");
  }
  if (name.includes('cerdo') || name.includes('chuleta')) {
    portions.push("<strong>Cerdo magro:</strong> 1 palma de mano (aprox 150g).");
    preps.push("<strong>Cerdo:</strong> AsegÃƒÆ’Ã‚Âºrate de cocinarlo muy bien (sin partes rosadas en el centro). ÃƒÆ’Ã…Â¡salo asado o a la plancha, evitando freÃƒÆ’Ã‚Â­rlo sumergido.");
    vitsList.push("Vitamina B1 (Tiamina) excelente para el sistema nervioso.");
  }
  if (name.includes('pescado') || name.includes('atÃƒÆ’Ã‚Âºn') || name.includes('sardinas') || name.includes('salmÃƒÆ’Ã‚Â³n') || name.includes('merluza') || name.includes('tilapia')) {
    portions.push("<strong>Pescado:</strong> 150g fresco o 1 lata escurrida.");
    preps.push("<strong>Pescado/AtÃƒÆ’Ã‚Âºn:</strong> Si es fresco, cocÃƒÆ’Ã‚Â­nalo al vapor/plancha con limÃƒÆ’Ã‚Â³n. Si es enlatado, escÃƒÆ’Ã‚Âºrrelo bien para quitar el sodio/aceite industrial y mÃƒÆ’Ã‚Â©zclalo con vegetales frescos.");
    vitsList.push("Omega-3 (EPA y DHA) crÃƒÆ’Ã‚Â­tico para cerebro y corazÃƒÆ’Ã‚Â³n.");
    alts.push("ÃƒÂ°Ã…Â¸Ã‚ÂÃ…Â¸ Las sardinas enlatadas son el superalimento mÃƒÆ’Ã‚Â¡s barato del mundo. TambiÃƒÆ’Ã‚Â©n puedes usar pollo o huevos.");
  }
  if (name.includes('huevo') || name.includes('omelette') || name.includes('tortilla')) {
    portions.push("<strong>Huevos:</strong> 2 a 3 unidades completas (con yema).");
    preps.push("<strong>Huevos:</strong> CocÃƒÆ’Ã‚Â­nalos a tu gusto (revueltos a fuego bajo, sancochados o escalfados). Evita freÃƒÆ’Ã‚Â­rlos nadando en aceite. <strong>Nota:</strong> Comer la yema es vital, ahÃƒÆ’Ã‚Â­ estÃƒÆ’Ã‚Â¡n las vitaminas.");
    vitsList.push("Colina (esencial para el cerebro) y LuteÃƒÆ’Ã‚Â­na.");
  }

  // 2. CARBOHIDRATOS Y GRANOS
  if (name.includes('lentejas') || name.includes('caraotas') || name.includes('frijoles') || name.includes('porotos') || name.includes('feijÃƒÆ’Ã‚Â£o') || name.includes('garbanzos')) {
    portions.push("<strong>Granos:</strong> 1.5 tazas (cocidos).");
    preps.push("<strong>Granos:</strong> <strong>CRUCIAL:</strong> Remoja la noche anterior con limÃƒÆ’Ã‚Â³n o vinagre para eliminar antinutrientes (gases). Hierve hasta ablandar y echa la sal al final. Haz un sofrito natural con ajo y cebolla.");
    vitsList.push("Magnesio, Folato y altÃƒÆ’Ã‚Â­sima dosis de fibra.");
    alts.push("ÃƒÂ°Ã…Â¸Ã‚ÂÃ‚Â² Si no toleras los granos, cÃƒÆ’Ã‚Â¡mbialos por papa/yuca o come mÃƒÆ’Ã‚Â¡s proteÃƒÆ’Ã‚Â­nas.");
  }
  if (name.includes('arroz') || name.includes('pasta') || name.includes('quinoa')) {
    portions.push("<strong>Arroz/Pasta:</strong> 1 taza ya cocida.");
    preps.push("<strong>Arroz/Pasta:</strong> <strong>Tip de Longevidad:</strong> Si lo cocinas hoy, lo enfrÃƒÆ’Ã‚Â­as en nevera y lo comes maÃƒÆ’Ã‚Â±ana, se convierte en 'almidÃƒÆ’Ã‚Â³n resistente', alimentando tu flora intestinal sin crear picos de insulina.");
    vitsList.push("Hidratos de carbono limpios para energÃƒÆ’Ã‚Â­a.");
    alts.push("ÃƒÂ°Ã…Â¸Ã‚ÂÃ…Â¡ Intercambiable por papa, yuca, batata o plÃƒÆ’Ã‚Â¡tano.");
  }
  if (name.includes('yuca') || name.includes('batata') || name.includes('papa') || name.includes('mandioca') || name.includes('plÃƒÆ’Ã‚Â¡tano') || name.includes('tajadas') || name.includes('bolÃƒÆ’Ã‚Â³n')) {
    portions.push("<strong>TubÃƒÆ’Ã‚Â©rculo/PlÃƒÆ’Ã‚Â¡tano:</strong> 1 taza o 1 unidad mediana.");
    preps.push("<strong>TubÃƒÆ’Ã‚Â©rculo/PlÃƒÆ’Ã‚Â¡tano:</strong> SancÃƒÆ’Ã‚Â³chalo (hiÃƒÆ’Ã‚Â©rvelo) o ÃƒÆ’Ã‚Â¡salo al horno. Si haces tajadas de plÃƒÆ’Ã‚Â¡tano, ÃƒÆ’Ã‚Â¡salas en el sartÃƒÆ’Ã‚Â©n con un toque de aceite de coco en lugar de freÃƒÆ’Ã‚Â­rlas en litros de aceite.");
    vitsList.push("Potasio y almidones complejos naturales.");
  }
  if (name.includes('arepa') || name.includes('pan') || name.includes('tostada') || name.includes('sandwich') || name.includes('sÃƒÆ’Ã‚Â¡ndwich') || name.includes('casabe')) {
    portions.push("<strong>Arepa/Pan:</strong> 1 arepa mediana o 2 rebanadas de pan (preferiblemente integral).");
    preps.push("<strong>Pan/Arepa:</strong> ÃƒÆ’Ã‚Âsalos o tuÃƒÆ’Ã‚Â©stalos. Si haces sÃƒÆ’Ã‚Â¡ndwich o rellenas la arepa, no uses salsas industriales (mayonesa); usa aguacate triturado, tomate o un toque de aceite de oliva.");
    vitsList.push("EnergÃƒÆ’Ã‚Â­a rÃƒÆ’Ã‚Â¡pida (aporta fibra si es integral).");
  }

  // 3. DESAYUNOS Y ESPECIALES
  if (name.includes('avena') && !name.includes('pancakes') && !name.includes('muchÃƒÆ’Ã‚Â­ncakes') && !name.includes('galleta')) {
    portions.push("<strong>Avena:</strong> 1/2 taza en crudo.");
    preps.push("<strong>Avena:</strong> Cocina con agua/leche a fuego lento. Agrega canela generosamente para evitar picos de insulina. Nunca eches azÃƒÆ’Ã‚Âºcar refinada, endulza con stevia o frutas picadas.");
    vitsList.push("Betaglucanos (fibra que baja el colesterol).");
  }
  if (name.includes('pancakes') || name.includes('muchÃƒÆ’Ã‚Â­ncakes') || name.includes('panquecas')) {
    portions.push("<strong>Pancakes:</strong> 2-3 unidades medianas.");
    preps.push("<strong>Pancakes:</strong> LicÃƒÆ’Ã‚Âºa la avena, plÃƒÆ’Ã‚Â¡tano o yuca con huevo. Cocina en sartÃƒÆ’Ã‚Â©n antiadherente a fuego muy bajo y tapado para que esponjen bien por dentro.");
    vitsList.push("Carbohidrato de absorciÃƒÆ’Ã‚Â³n lenta y proteÃƒÆ’Ã‚Â­na.");
  }
  if (name.includes('yogur') || name.includes('bowl')) {
    portions.push("<strong>Yogur:</strong> 1 taza (idealmente griego o natural sin azÃƒÆ’Ã‚Âºcar).");
    preps.push("<strong>Yogur:</strong> Evita yogures saborizados (tienen hasta 5 cucharadas de azÃƒÆ’Ã‚Âºcar). Usa yogur natural y ponle tÃƒÆ’Ã‚Âº el sabor en casa con frutas reales y semillas.");
    vitsList.push("ProbiÃƒÆ’Ã‚Â³ticos esenciales para la flora intestinal.");
  }
  if (name.includes('sopa') || name.includes('crema') || name.includes('caldo')) {
    portions.push("<strong>Sopa/Crema:</strong> 1 plato hondo.");
    preps.push("<strong>Sopa:</strong> Aprovecha de hervir vegetales y licuarlos para hacer cremas espesas (como zapallo o espinaca) sin necesidad de usar lÃƒÆ’Ã‚Â¡cteos o harinas espesantes.");
    vitsList.push("Electrolitos y vitaminas hidrosolubles.");
  }
  if (name.includes('smoothie') || name.includes('batido')) {
    portions.push("<strong>Batido:</strong> 1 vaso grande.");
    if (name.includes('verde')) {
      preps.push("<strong>Smoothie Verde:</strong> LicÃƒÆ’Ã‚Âºa 1 puÃƒÆ’Ã‚Â±ado de espinacas, 1/2 manzana verde, 1 rama de apio y jugo de medio limÃƒÆ’Ã‚Â³n con 1 vaso de agua. <strong>Advertencia:</strong> A diferencia de un jugo, el batido conserva toda la fibra. BÃƒÆ’Ã‚Â©belo despacio para que tu cuerpo lo digiera correctamente.");
      vitsList.push("Hierro (espinaca), Vitamina C (limÃƒÆ’Ã‚Â³n) y mucha fibra triturada.");
    } else {
      preps.push("<strong>Batido:</strong> LicÃƒÆ’Ã‚Âºa los ingredientes muy bien. <strong>Advertencia:</strong> Un batido no es lo mismo que un jugo colado, este conserva toda la fibra de la fruta/vegetal, asÃƒÆ’Ã‚Â­ que bÃƒÆ’Ã‚Â©belo despacio para digerirlo bien.");
      vitsList.push("Fibra triturada de fÃƒÆ’Ã‚Â¡cil digestiÃƒÆ’Ã‚Â³n.");
    }
  }
  if (name.includes('ensalada') || name.includes('vegetales') || name.includes('brÃƒÆ’Ã‚Â³coli') || name.includes('espinaca')) {
    portions.push("<strong>Vegetales:</strong> Al menos la mitad de tu plato.");
    preps.push("<strong>Vegetales:</strong> Puedes comerlos crudos, salteados o al vapor. AlÃƒÆ’Ã‚Â­ÃƒÆ’Ã‚Â±alos con aceite de oliva, limÃƒÆ’Ã‚Â³n y sal, NUNCA con aderezos industriales de supermercado.");
    vitsList.push("Fibra prebiÃƒÆ’Ã‚Â³tica, Vitamina C y antioxidantes.");
  }

  // 4. BEBIDAS Y SNACKS
  if (name.includes('elixir') || name.includes('jugo') || name.includes('funcional')) {
    portions.push("<strong>Jugo:</strong> 1 vaso grande (300-400ml).");
    preps.push("<strong>Jugo del DÃƒÆ’Ã‚Â­a:</strong> La receta especÃƒÆ’Ã‚Â­fica de este jugo estÃƒÆ’Ã‚Â¡ detallada paso a paso en la secciÃƒÆ’Ã‚Â³n <strong>ÃƒÂ°Ã…Â¸Ã‚Â¥Ã‚Â¤ Mis Jugos</strong> de tu menÃƒÆ’Ã‚Âº lateral. Ãƒâ€šÃ‚Â¡Ve allÃƒÆ’Ã‚Â­ para prepararlo!<br><em>Consejo clÃƒÆ’Ã‚Â­nico:</em> BÃƒÆ’Ã‚Â©belo apenas lo licÃƒÆ’Ã‚Âºes para no oxidar las vitaminas.");
    vitsList.push("Antioxidantes y enzimas vivas.");
    water = "El jugo hidrata, pero complementa con 1 vaso de agua extra 30 min despuÃƒÆ’Ã‚Â©s.";
  }
  
  if (name.includes('tÃƒÆ’Ã‚Â©') || name.includes('infusiÃƒÆ’Ã‚Â³n') || name.includes('cacao') || name.includes('matcha') || name.includes('leche')) {
    portions.push("<strong>Bebida:</strong> 1 Taza caliente o frÃƒÆ’Ã‚Â­a (250ml).");
    preps.push("<strong>Bebida:</strong> Hierve el agua o calienta la leche/bebida vegetal. Agrega el tÃƒÆ’Ã‚Â© o cacao y reposa 5 min. <strong>Regla Innegociable:</strong> NUNCA endulzar con azÃƒÆ’Ã‚Âºcar refinada. Usa stevia natural.");
    vitsList.push("Polifenoles y/o antioxidantes relajantes.");
    water = "Si tomas infusiones diurÃƒÆ’Ã‚Â©ticas (tÃƒÆ’Ã‚Â© verde, negro), acompÃƒÆ’Ã‚Â¡ÃƒÆ’Ã‚Â±alo con otro vaso de agua normal mÃƒÆ’Ã‚Â¡s tarde.";
  }

  if (name.includes('merienda') || name.includes('galleta') || name.includes('nueces') || name.includes('fruta') || name.includes('cambur') || name.includes('manÃƒÆ’Ã‚Â­')) {
    // Evitamos duplicar si ya se detectÃƒÆ’Ã‚Â³
    if (!portions.join('').includes('Snack') && !name.includes('jugo')) {
      portions.push("<strong>Snack:</strong> PorciÃƒÆ’Ã‚Â³n pequeÃƒÆ’Ã‚Â±a (tamaÃƒÆ’Ã‚Â±o de tu puÃƒÆ’Ã‚Â±o cerrado).");
      preps.push("<strong>Snack SÃƒÆ’Ã‚Â³lido:</strong> Mastica muy bien cada bocado. Recuerda: las meriendas son opcionales. Si no tienes hambre real, sÃƒÆ’Ã‚Â¡ltala para dejar descansar tu digestiÃƒÆ’Ã‚Â³n.");
      alts.push("ÃƒÂ°Ã…Â¸Ã‚ÂÃ‚Âµ Si no tienes el snack recetado, 1 fruta entera o 1 tÃƒÆ’Ã‚Â© sin azÃƒÆ’Ã‚Âºcar siempre serÃƒÆ’Ã‚Â¡n comodines perfectos.");
    }
  }

  // 5. FALLBACK GENÃƒÆ’Ã¢â‚¬Â°RICO
  if (preps.length === 0) {
    portions.push("<strong>PorciÃƒÆ’Ã‚Â³n:</strong> SÃƒÆ’Ã‚Â­rvete hasta sentirte 80% lleno, no hasta reventar.");
    preps.push("1. Lava los ingredientes frescos.<br>2. Cocina a la plancha, horno o hervido.<br>3. AÃƒÆ’Ã‚Â±ade sal marina al final.<br>4. Mastica lentamente para favorecer la digestiÃƒÆ’Ã‚Â³n.");
    vitsList.push("Vitaminas y minerales segÃƒÆ’Ã‚Âºn los ingredientes de tu plato.");
  }

  // Compile final strings
  let finalPortion = portions.join('<br><br>');
  let finalPrep = preps.join('<br><br>');
  let finalVits = [...new Set(vitsList)].join(' | '); // Unique values
  let finalAlt = alts.length > 0 ? alts.join('<br><br>') : "Cambia cualquier ingrediente por algo similar que tengas en casa (proteÃƒÆ’Ã‚Â­na por proteÃƒÆ’Ã‚Â­na, carb por carb).";

  return { portion: finalPortion, prep: finalPrep, vits: finalVits, water, alt: finalAlt };
}

function toggleMenuType(type) {
  window.currentMenuType = type;
  showModule('menu'); // Re-render menu module
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ LÃƒÆ’Ã‚Â³gica de Pago Cripto ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function openCryptoPayment() {
  Analytics.trackEvent('payment_modal_open', { method: 'binance_pay' });
  const modalHtml = Modules.renderPaymentModal(userData);
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function simulatePaymentSuccess(planType) {
  const regional = Engine.getPrecioRegional(userData.ubicacion || 'Estados Unidos');
  const isAnnual = planType === 'annual';
  
  Analytics.trackEvent('payment_success', { method: 'binance_pay', plan: planType });
  
  const status = document.getElementById('paymentStatus');
  if (status) status.innerHTML = "ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Ãƒâ€šÃ‚Â¡Pago Confirmado! Activando " + (isAnnual ? "Plan Anual..." : "Plan Mensual...");
  
  setTimeout(() => {
    userData.isPremium = true;
    userData.subscriptionType = planType;
    
    // Si es anual y usÃƒÆ’Ã‚Â³ descuento, resetear coins
    if (isAnnual && userData.discountUnlocked) {
      userData.coins = 0;
      userData.totalVideosWatched = 0; // Se reinicia el ciclo de la beca
    }

    syncUserData();
    location.reload();
  }, 2000);
}

function payWithCoins() {
  const regional = Engine.getPrecioRegional(Engine.detectarRegion(userData.ubicacion));
  const cost = regional.monto * 100; // 1 USD = 100 Coins
  
  if (userData.coins >= cost) {
    userData.coins -= cost;
    userData.isPremium = true;
    Analytics.trackEvent('payment_success', { method: 'optimal_coins', amount: cost });
    syncUserData();
    alert("ÃƒÂ°Ã…Â¸Ã…Â½Ã¢â‚¬Â° Ãƒâ€šÃ‚Â¡Beca activada! Ya eres usuario Premium.");
    location.reload();
  } else {
    alert(`ÃƒÂ¢Ã‚ÂÃ…â€™ Saldo insuficiente. Necesitas ${cost} monedas. Ãƒâ€šÃ‚Â¡Sigue completando tareas en la Beca de Salud!`);
  }
}
// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ LÃƒÆ’Ã‚Â³gica de la Beca de Salud (Videos y Recompensas) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function watchVideo() {
  const today = new Date().toDateString();
  
  // Inicializar si no existen
  if (!userData.videosToday) userData.videosToday = 0;
  if (!userData.totalVideosWatched) userData.totalVideosWatched = 0;

  // Validar cambio de dÃƒÆ’Ã‚Â­a para reiniciar contador diario
  if (userData.lastVideoDate !== today) {
    userData.videosToday = 0;
    userData.lastVideoDate = today;
  }

  // LÃƒÆ’Ã‚Â­mite de 3 videos por dÃƒÆ’Ã‚Â­a
  if (userData.videosToday >= 3) {
    alert("ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂºÃ¢â‚¬Ëœ LÃƒÆ’Ã‚Â­mite diario alcanzado. Tu cerebro necesita procesar la informaciÃƒÆ’Ã‚Â³n. Vuelve maÃƒÆ’Ã‚Â±ana para seguir acumulando.");
    return;
  }

  // Simular visualizaciÃƒÆ’Ã‚Â³n de video (3 segundos)
  const btn = event.target;
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = "ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Âº Procesando cÃƒÆ’Ã‚Â¡psula de salud...";

  setTimeout(() => {
    userData.videosToday++;
    userData.totalVideosWatched++;
    userData.coins += 10;
    
    // Validar desbloqueo de descuento (15 videos)
    if (userData.totalVideosWatched >= 15) {
      userData.discountUnlocked = true;
    }

    syncUserData();
    
    alert(`ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ Ãƒâ€šÃ‚Â¡Video completado! +10 Optimal Coins. (${userData.videosToday}/3 hoy)`);
    
    btn.disabled = false;
    btn.innerHTML = originalText;
    
    showModule('rewards'); // Re-renderizar para mostrar progreso
  }, 3000);
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ CONFIGURACIÃƒÆ’Ã¢â‚¬Å“N DE MONETIZACIÃƒÆ’Ã¢â‚¬Å“N ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
const OFFERWALL_URL = ""; // PEGA AQUÃƒÆ’Ã‚Â TU URL DE ADGATE O BITLABS

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ LÃƒÆ’Ã‚Â³gica Modal Ejercicios ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
// Eliminada: Ahora las rutinas se renderizan nativamente con detalle clÃƒÆ’Ã‚Â­nico en el mÃƒÆ’Ã‚Â³dulo.

function toggleExerciseType(type) {
  window.currentExerciseType = type;
  showModule('ejercicio');
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Actualizar Perfil ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
window.updateProfile = function() {
  const btn = event.target;
  const originalText = btn.innerHTML;
  
  // "Thinking" state for a premium feel
  btn.innerHTML = 'ÃƒÂ°Ã…Â¸Ã‚Â¤Ã¢â‚¬Â Procesando cambios...';
  btn.disabled = true;
  btn.style.opacity = '0.7';

  setTimeout(() => {
    const newIngreso = parseInt(document.getElementById('editIngreso').value) || userData.ingreso;
    const newPresupuesto = parseInt(document.getElementById('editPresupuesto').value) || userData.presupuesto;
    const newActividad = document.getElementById('editActividad').value;
    const newTiempo = document.getElementById('editTiempo').value;

    userData.ingreso = newIngreso;
    userData.presupuesto = newPresupuesto;
    userData.actividad = newActividad;
    userData.tiempoEjercicio = newTiempo;

    syncUserData();
    
    // Reset button
    btn.innerHTML = originalText;
    btn.disabled = false;
    btn.style.opacity = '1';

    const status = document.getElementById('saveStatus');
    status.style.display = 'inline-block';
    
    // Highlight the instructions
    const instructions = document.getElementById('saveInstructions');
    if (instructions) {
      instructions.style.background = 'rgba(var(--primary-rgb), 0.2)';
      instructions.style.transform = 'scale(1.02)';
      instructions.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        instructions.style.transform = 'scale(1)';
      }, 500);
    }

    // Pulse the menu button to guide the user
    const menuBtn = document.querySelector('.mobile-menu-toggle');
    if (menuBtn) {
      menuBtn.classList.add('pulse');
      setTimeout(() => menuBtn.classList.remove('pulse'), 6000); // Pulse for 6 seconds
    }

    setTimeout(() => {
      status.style.display = 'none';
    }, 3000);
    
    // Re-render to update kcal/macros based on new activity/budget
    // But we stay in the profile module to show the instructions
    showModule('perfil');
  }, 1200); // 1.2s of "thinking"
}

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ Iniciar ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
window.onload = () => {
  const saved = localStorage.getItem('vidaOptima_user');
  if(saved) {
    try {
      userData = JSON.parse(saved);
      // MigraciÃƒÆ’Ã‚Â³n para usuarios antiguos
      if (!userData.fechaRegistro) userData.fechaRegistro = new Date().toISOString();
      if (!userData.historial) userData.historial = {};
      
      document.getElementById('landing').classList.add('hidden');
      generatePlan();
    } catch(e) {
      console.error(e);
      localStorage.removeItem('vidaOptima_user');
    }
  }
};

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ SISTEMA DE PROTECCIÃƒÆ’Ã¢â‚¬Å“N DE PROPIEDAD INTELECTUAL (Oculto) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
/**
 * FunciÃƒÆ’Ã‚Â³n de verificaciÃƒÆ’Ã‚Â³n de autorÃƒÆ’Ã‚Â­a para auditorÃƒÆ’Ã‚Â­as legales o due diligence.
 * Permite demostrar que el cÃƒÆ’Ã‚Â³digo es una creaciÃƒÆ’Ã‚Â³n original de Terry Romero.
 */
window._verifyOwnership = function(key) {
  const secret = "TR-2025-VO-PLATFORM";
  if (key === secret) {
    console.info("ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂºÃ‚Â¡ÃƒÂ¯Ã‚Â¸Ã‚Â PROPIEDAD INTELECTUAL VERIFICADA");
    console.info("Propietario: Terry Edicson Romero Loreto");
    console.info("Documento ID: 20.264.887");
    console.info("Firma Digital: " + Engine._signature);
    console.info("Estatus: Founder & CEO / Lead Architect");
    return true;
  }
  return false;
};

// ÃƒÂ¢Ã…â€™Ã‚Â¨ÃƒÂ¯Ã‚Â¸Ã‚Â ESCUCHADOR DE TECLAS PARA EL FUNDADOR (Ctrl + Alt + F)
window.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'f') {
    const pass = prompt("ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â SISTEMA DE SEGURIDAD VIDA ÃƒÆ’Ã¢â‚¬Å“PTIMA\nIngrese la Llave Maestra del Fundador:");
    const secret = "VidaOptima_Master_20264887";
    
    if (pass === secret) {
      alert("ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¦ ACCESO CONCEDIDO\nBienvenido, Terry Edicson Romero Loreto.\nEstatus: Founder & CEO / Lead Architect.");
      window._verifyOwnership("TR-2025-VO-PLATFORM");
      // AquÃƒÆ’Ã‚Â­ se pueden habilitar paneles ocultos en el futuro
    } else if (pass !== null) {
      alert("ÃƒÂ¢Ã‚ÂÃ…â€™ ACCESO DENEGADO\nIntento de intrusiÃƒÆ’Ã‚Â³n registrado.");
    }
  }
});

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ SISTEMA DE ANALÃƒÆ’Ã‚ÂTICA (Inteligencia de Negocio) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
window.Analytics = {
  trackEvent(eventName, data = {}) {
    const deviceType = this.getDeviceType();
    const payload = {
      event: eventName,
      user: {
        id: userData.id || 'anonymous',
        country: userData.ubicacion || 'unknown',
        age: userData.edad || 0,
        gender: userData.sexo || 'unknown',
        device: deviceType
      },
      details: data,
      timestamp: new Date().toISOString()
    };

    console.log("ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â  [ANALYTICS]:", payload);
    // AquÃƒÆ’Ã‚Â­ se conectarÃƒÆ’Ã‚Â­a con Firebase/Mixpanel en el futuro:
    // firebase.analytics().logEvent(eventName, payload);
  },

  getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "tablet";
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpwOS)/i.test(ua)) return "mobile";
    return "desktop";
  }
};

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ SISTEMA DE MOTIVACIÃƒÆ’Ã¢â‚¬Å“N ESTOICA ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
window.StoicMotivator = {
  quotes: [
    { text: "No es que tengamos poco tiempo, es que perdemos mucho. El cuerpo es tu ÃƒÆ’Ã‚Âºnica herramienta; ÃƒÆ’Ã‚Âºsala o piÃƒÆ’Ã‚Â©rdela.", author: "SÃƒÆ’Ã‚Â©neca" },
    { text: "La felicidad de tu vida depende de la calidad de tus pensamientos y la salud de tu templo fÃƒÆ’Ã‚Â­sico.", author: "Marco Aurelio" },
    { text: "NingÃƒÆ’Ã‚Âºn hombre tiene el derecho de ser un aficionado en el entrenamiento fÃƒÆ’Ã‚Â­sico. Es una lÃƒÆ’Ã‚Â¡stima envejecer sin ver la fuerza de la que es capaz tu cuerpo.", author: "SÃƒÆ’Ã‚Â³crates" },
    { text: "Dificultades reales son las que el destino nos pone; las demÃƒÆ’Ã‚Â¡s son excusas de una mente dÃƒÆ’Ã‚Â©bil. Haz tu rutina.", author: "Epicteto" }
  ],

  checkEngagement() {
    const lastVisit = localStorage.getItem('vidaOptima_lastVisit');
    const now = new Date().getTime();
    
    if (lastVisit && (now - lastVisit) > (48 * 60 * 60 * 1000)) {
      this.showNotification();
    }
    localStorage.setItem('vidaOptima_lastVisit', now);
  },

  showNotification() {
    const quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
    // SimulaciÃƒÆ’Ã‚Â³n de notificaciÃƒÆ’Ã‚Â³n en UI
    setTimeout(() => {
      const msg = `ÃƒÂ°Ã…Â¸Ã‚ÂÃ¢â‚¬ÂºÃƒÂ¯Ã‚Â¸Ã‚Â MENSAJE ESTOICO: "${quote.text}" ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â ${quote.author}`;
      console.log(msg);
      // PodrÃƒÆ’Ã‚Â­amos mostrarlo en un toast o modal
    }, 3000);
  }
};

// Iniciar chequeo de motivaciÃƒÆ’Ã‚Â³n
StoicMotivator.checkEngagement();

// ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ SISTEMA DE GAMIFICACIÃƒÆ’Ã¢â‚¬Å“N ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬
function checkDailyStreak() {
  if (!userData.lastCheckIn) return;
  
  const today = new Date().toDateString();
  const last = userData.lastCheckIn;
  
  if (today === last) return; // Ya entrÃƒÆ’Ã‚Â³ hoy
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (last === yesterday.toDateString()) {
    userData.streak++;
    userData.coins += 5; // Premio por racha
    console.log("ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂÃ‚Â¥ RACHA AUMENTADA:", userData.streak);
  } else {
    userData.streak = 1;
    console.log("ÃƒÂ¢Ã‚ÂÃ¢â‚¬Å¾ÃƒÂ¯Ã‚Â¸Ã‚Â RACHA REINICIADA");
  }
  
  userData.lastCheckIn = today;
  syncUserData();
}


// Ejecutar al cargar
setTimeout(checkDailyStreak, 2000);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(reg => {
      console.log('SW Registered');
    }).catch(err => {
      console.log('SW Failed', err);
    });
  });
}
