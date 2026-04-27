/**
 * ============================================================
 * VIDA ÓPTIMA — Plataforma de Bienestar Integral (app.js)
 * ============================================================
 * @author      Terry Edicson Romero Loreto (Founder & CEO)
 * @id          20.264.887
 * @copyright   © 2025 Terry Edicson Romero Loreto. Todos los derechos reservados.
 * @version     2.1.0
 * @license     Propiedad Intelectual Protegida — Prohibida su 
 *              reproducción total o parcial sin autorización.
 * ------------------------------------------------------------
 * Este software y su arquitectura lógica son propiedad 
 * exclusiva del autor bajo leyes internacionales de IP.
 * ============================================================
 */

// ═══════════════════════════════════════════
// VIDA ÓPTIMA — Control de Interfaz
// ═══════════════════════════════════════════
let userData = {
  streak: 0,
  coins: 0,
  lastCheckIn: null,
  isSynced: false,
  videosToday: 0,
  lastVideoDate: null,
  totalVideosWatched: 0,
  discountUnlocked: false,
  isPremium: false,
  subscriptionType: null, // 'monthly' o 'annual'
  trialStartDate: new Date().toISOString()
};

// Configuración del Backend
const BACKEND_URL = "https://vida-optima-backend-production.up.railway.app"; // Reemplazar con la URL real

// ── Navegación Onboarding y Legal ──────────
function startOnboarding() {
  // Primero forzar aceptación legal
  document.getElementById('legalModal').style.display = 'flex';
}

function acceptLegal() {
  document.getElementById('legalModal').style.display = 'none';
  document.getElementById('landing').classList.add('hidden');
  document.getElementById('onboarding').classList.remove('hidden');
  Analytics.trackEvent('onboarding_start', { timestamp: new Date().toISOString() });
}

function nextStep(step) {
  // Ocultar todos
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  // Mostrar actual
  document.getElementById('step' + step).classList.add('active');
  // Barra de progreso
  const progress = (step / 6) * 100;
  document.getElementById('progressFill').style.width = progress + '%';
  document.getElementById('progressLabel').textContent = `Paso ${step} de 6`;

  // Si llegamos al paso 6, recolectamos datos y mostramos resumen
  if(step === 6) {
    collectData();
    renderSummary();
  }
}

function selectOption(el, inputId, value) {
  // Remover clase selected de hermanos
  const parent = el.parentElement;
  parent.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
  // Seleccionar este
  el.classList.add('selected');
  // Actualizar input oculto
  if (document.getElementById(inputId)) {
    document.getElementById(inputId).value = value;
  }
}

function toggleOption(el) {
  el.classList.toggle('selected');
}

function toggleFocus(el, value) {
  el.classList.toggle('selected');
  updateEnfoques();
}

function updateEnfoques() {
  // Extra para futuro
}

// ── Recolección de Datos ──────────────────
function collectData() {
  const enfoques = [];
  document.querySelectorAll('.focus-item.selected').forEach(el => {
    const text = el.textContent.trim().toLowerCase().split(' ')[1] || el.textContent.trim().toLowerCase().substring(2);
    // Limpieza simple
    let val = text;
    if(val.includes('energía')) val = 'energia';
    if(val.includes('sueño')) val = 'sueno';
    if(val.includes('salud')) val = 'salud';
    if(val.includes('rendimiento')) val = 'rendimiento';
    enfoques.push(val);
  });

  const enfermedades = [];
  document.querySelectorAll('input[name="enfermedad"]:checked').forEach(cb => {
    enfermedades.push(cb.value);
  });

  const objetivos = [];
  document.querySelectorAll('.option-card.selected').forEach(el => {
    objetivos.push(el.getAttribute('data-value'));
  });
  if(objetivos.length === 0) objetivos.push('mantenimiento'); // Default

  userData = {
    nombre: document.getElementById('nombre').value || 'Usuario',
    edad: parseInt(document.getElementById('edad').value) || 30,
    sexo: document.getElementById('sexo').value || 'masculino',
    peso: parseFloat(document.getElementById('peso').value) || 70,
    estatura: parseInt(document.getElementById('estatura').value) || 170,
    ubicacion: document.getElementById('ubicacion').value || '',
    streak: 1,
    coins: 10,
    lastCheckIn: new Date().toDateString(),
    enfermedades: enfermedades,
    alergias: document.getElementById('alergias').value,
    fuma: document.getElementById('fuma').value,
    alcohol: document.getElementById('alcohol').value,
    sueno: document.getElementById('sueno').value,
    estres: document.getElementById('estres').value,
    digestion: document.getElementById('digestion').value,
    objetivos: objetivos,
    enfoques: enfoques,
    ingreso: parseInt(document.getElementById('ingreso').value) || 0,
    presupuesto: parseInt(document.getElementById('presupuesto').value) || 0,
    actividad: document.getElementById('actividad').value || 'sedentario',
    tiempoEjercicio: document.getElementById('tiempoEjercicio').value || '30',
    fechaRegistro: new Date().toISOString(),
    historial: {}
  };

  localStorage.setItem('vidaOptima_user', JSON.stringify(userData));
}

function renderSummary() {
  const sum = document.getElementById('summaryCard');
  sum.innerHTML = `
    <p><strong>Hola ${userData.nombre}</strong></p>
    <p>Hemos analizado tu perfil (${userData.edad} años, ${userData.peso}kg) y hemos adaptado tu ruta considerando tus requerimientos para <strong>${userData.objetivos.map(o => o.replace('_', ' ')).join(', ')}</strong>.</p>
    <p style="margin-top:10px;">Tu menú se ha optimizado para un presupuesto de $${userData.presupuesto} y tus rutinas para ${userData.tiempoEjercicio} minutos diarios.</p>
    <div style="margin-top: 20px; padding: 15px; background: rgba(var(--green-rgb), 0.1); border-radius: 8px; border-left: 4px solid var(--green); text-align: left;">
      <p style="margin: 0; font-size: 14px; line-height: 1.4; color: var(--text);">
        📌 <strong>Dato clave:</strong> Al entrar, ve directamente al <strong>panel lateral</strong> (botón ☰ arriba a la derecha) para ver tus <strong>instrucciones para vivir 100 años</strong>.
      </p>
    </div>
  `;
}

// ── Ir al Dashboard ───────────────────────
function generatePlan(isNew = false) {
  document.getElementById('onboarding').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');
  
  document.getElementById('dashUser').innerHTML = `
    <strong>${userData.nombre}</strong><br>
    Objetivo: ${userData.objetivos.map(o => o.replace('_', ' ')).join(', ')}
  `;

  // Inicializar estados de navegación
  window.currentMenuType = (userData.ingreso >= 600) ? 'default_premium' : 'default_q1';
  window.currentExerciseType = 'casa';

  showModule('perfil');

  if (isNew) {
    openWelcomeModal();
  }

  // Sincronizar con Backend para obtener cálculos certificados
  syncWithBackend();
}

async function syncWithBackend() {
  if (!userData || !userData.peso) return;
  
  console.info("🔒 Intentando certificar datos con el servidor...");
  
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
      console.info("✅ Sincronización Exitosa. Datos certificados por Vida Óptima.");
      userData.kcal = result.kcal;
      userData.macros = result.macros;
      userData.perfil = result.perfil;
      userData.ubicacion_detectada = result.region;
      userData.isSynced = true;
      window.currentMenuType = result.menuType;
      
      localStorage.setItem('vidaOptima_user', JSON.stringify(userData));
      
      const activeLink = document.querySelector('.dash-link.active');
      if(activeLink && activeLink.getAttribute('onclick')) {
        const match = activeLink.getAttribute('onclick').match(/'([^']+)'/);
        if (match) showModule(match[1]);
      }
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn("⚠️ Servidor no disponible. Modo Local Activo.");
    // La app seguirá funcionando con los datos de engine.js (local)
  }
}

function showModule(modName) {
  // Rastreo de Analítica
  Analytics.trackEvent('module_view', { module: modName });

  // Update nav UI
  document.querySelectorAll('.dash-link').forEach(l => l.classList.remove('active'));
  const link = Array.from(document.querySelectorAll('.dash-link')).find(l => l.getAttribute('onclick').includes(modName));
  if(link) link.classList.add('active');

  // Si es móvil, cerrar el menú al hacer clic
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

  // Asegurar que userData esté cargado
  if (!userData || !userData.nombre) {
    const saved = localStorage.getItem('vidaOptima_user');
    if (saved) userData = JSON.parse(saved);
  }

  // Render based on module
  switch(modName) {
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

// ── Imprimir Solo Lista de Compras ────────────────────────────────────────────
function printShoppingList() {
  // Grab only the shopping list section by ID
  const listSection = document.getElementById('shopping-list-printable');
  if (!listSection) { alert('No se encontró la lista de compras.'); return; }

  const u = userData;
  const nombre = u.nombre || 'Usuario';
  const fecha = new Date().toLocaleDateString('es', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  const win = window.open('', '_blank', 'width=700,height=900');
  win.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Lista de Compras — Vida Óptima</title>
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
    <span class="badge">VIDA ÓPTIMA</span>
    <h1>📋 Lista de Compras Semanal</h1>
    <p>Preparada para: <strong>${nombre}</strong></p>
    <p class="meta">Generada el ${fecha} · Válida hasta el próximo domingo</p>
  </div>
  ${listSection.innerHTML}
  <div class="footer">
    Vida Óptima — Tu Manual de Instrucción de Vida · Esta lista se actualiza automáticamente cada domingo
  </div>
  <div class="no-print" style="text-align:center;margin-top:24px;">
    <button onclick="window.print()" style="background:#1db954;color:#fff;border:none;padding:12px 28px;border-radius:8px;font-size:15px;cursor:pointer;font-weight:700;">🖨️ Imprimir / Guardar PDF</button>
  </div>
</body>
</html>`);
  win.document.close();
  // Small delay so styles load before auto-print
  setTimeout(function() { win.focus(); }, 300);
}

// ── Rastreo de Hábitos ────────────────────
function toggleTaskStatus(dateStr, taskId, btnElement) {
  if(!userData.historial) userData.historial = {};
  
  const key = `${dateStr}_${taskId}`;
  const currentState = userData.historial[key];
  
  // States: undefined -> true -> false -> undefined
  if (currentState === undefined) {
    userData.historial[key] = true;
    btnElement.classList.add('checked');
    btnElement.classList.remove('failed');
    btnElement.innerHTML = '✓';
  } else if (currentState === true) {
    userData.historial[key] = false;
    btnElement.classList.remove('checked');
    btnElement.classList.add('failed');
    btnElement.innerHTML = '✗';
  } else {
    delete userData.historial[key];
    btnElement.classList.remove('checked');
    btnElement.classList.remove('failed');
    btnElement.innerHTML = '○';
  }
  
  localStorage.setItem('vidaOptima_user', JSON.stringify(userData));
  
  // Si estamos en la vista de progreso, re-renderizar para actualizar gráficas
  const activeLink = document.querySelector('.dash-link.active');
  if(activeLink && activeLink.getAttribute('onclick').includes('progreso')) {
    showModule('progreso');
  }
}

// ── Lógica Móvil ──────────────────────────
function toggleMobileMenu() {
  const sidebar = document.getElementById('dashSidebar');
  const overlay = document.getElementById('mobileOverlay');
  if (sidebar) {
    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('active');
  }
}

// ── Lógica del Modal de Comidas ───────────
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

// ── Lógica de Modales de Info y Welcome ────
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

  let explanation = "Dato biológico.";

  if (type === 'edad') explanation = "Tu edad biológica. El metabolismo se ralentiza un 2-5% por cada década después de los 30. Este plan contrarresta esa caída.";
  else if (type === 'peso') explanation = "Tu peso total. Recuerda que el músculo pesa más que la grasa. No te obsesiones con el número, fíjate en cómo te queda la ropa.";
  else if (type === 'imc') explanation = "Índice de Masa Corporal. Es una métrica general para ver tu relación peso/altura, pero no distingue si el peso es de grasa o de puro músculo.";
  else if (type === 'kcal') explanation = "Calorías diarias estimadas. Es la energía exacta que tu cuerpo necesita hoy para funcionar y alcanzar tu objetivo (sin pasar hambre).";
  else if (type === 'perfil') explanation = "Tu perfil metabólico base. El sistema adapta la velocidad y densidad de tus comidas considerando tu etapa de vida hormonal.";
  else if (type === 'proteinas') explanation = "Los ladrillos de tu cuerpo. Reparan el tejido, crean enzimas y fortalecen el sistema inmunológico. Sin ellas, pierdes músculo.";
  else if (type === 'carbos') explanation = "El combustible de tu cerebro y músculos. Te dan la energía explosiva para rendir en el día a día.";
  else if (type === 'grasas') explanation = "Fundamentales para crear hormonas (como la testosterona o estrógeno) y absorber vitaminas clave (A, D, E, K).";

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

// ── Lógica de Recomendaciones (Ciclo) ──────
function nextRecomendacion(tipo) {
  if (!userData.recsIdx) {
    userData.recsIdx = { libros: 0, documentales: 0, podcasts: 0 };
  }
  if (userData.recsIdx[tipo] !== undefined) {
    userData.recsIdx[tipo]++;
  } else {
    userData.recsIdx[tipo] = 1;
  }
  localStorage.setItem('vidaOptima_user', JSON.stringify(userData));
  showModule('recomendaciones');
}

function getMealDetails(mealName) {
  const name = mealName.toLowerCase();
  
  let portions = [];
  let preps = [];
  let vitsList = [];
  let alts = [];

  let water = "Bebe 1 vaso de agua 30 minutos antes de comer, y evita tomar más de medio vaso durante la comida para no diluir los jugos gástricos y mejorar la digestión.";

  // 1. PROTEÍNAS
  if (name.includes('pollo') || name.includes('pavo')) {
    portions.push("<strong>Pollo/Pavo:</strong> 1.5 palmas de mano (aprox 150g-200g).");
    preps.push("<strong>Pollo/Pavo:</strong> Sazona con sal, pimienta, ajo natural y orégano. Cocina a la plancha a fuego medio-alto. Deja reposar 3 min en el plato antes de cortarlo para que retenga sus jugos.");
    vitsList.push("Vitamina B3 (Niacina) y Proteínas de alto valor.");
    alts.push("🍗 Puedes sustituir el ave por atún, sardinas, huevos o cerdo magro.");
  }
  if (name.includes('carne') || name.includes('res') || name.includes('lomito') || name.includes('molida') || name.includes('bistec')) {
    portions.push("<strong>Carne de Res:</strong> 1 palma de mano (aprox 150g).");
    preps.push("<strong>Res:</strong> Cocina a la plancha o guisada. Añade la sal al final de la cocción para retener más yodo y evitar que la carne se endurezca.");
    vitsList.push("Hierro hemo (alta absorción) y Vitamina B12.");
  }
  if (name.includes('cerdo') || name.includes('chuleta')) {
    portions.push("<strong>Cerdo magro:</strong> 1 palma de mano (aprox 150g).");
    preps.push("<strong>Cerdo:</strong> Asegúrate de cocinarlo muy bien (sin partes rosadas en el centro). Úsalo asado o a la plancha, evitando freírlo sumergido.");
    vitsList.push("Vitamina B1 (Tiamina) excelente para el sistema nervioso.");
  }
  if (name.includes('pescado') || name.includes('atún') || name.includes('sardinas') || name.includes('salmón') || name.includes('merluza') || name.includes('tilapia')) {
    portions.push("<strong>Pescado:</strong> 150g fresco o 1 lata escurrida.");
    preps.push("<strong>Pescado/Atún:</strong> Si es fresco, cocínalo al vapor/plancha con limón. Si es enlatado, escúrrelo bien para quitar el sodio/aceite industrial y mézclalo con vegetales frescos.");
    vitsList.push("Omega-3 (EPA y DHA) crítico para cerebro y corazón.");
    alts.push("🐟 Las sardinas enlatadas son el superalimento más barato del mundo. También puedes usar pollo o huevos.");
  }
  if (name.includes('huevo') || name.includes('omelette') || name.includes('tortilla')) {
    portions.push("<strong>Huevos:</strong> 2 a 3 unidades completas (con yema).");
    preps.push("<strong>Huevos:</strong> Cocínalos a tu gusto (revueltos a fuego bajo, sancochados o escalfados). Evita freírlos nadando en aceite. <strong>Nota:</strong> Comer la yema es vital, ahí están las vitaminas.");
    vitsList.push("Colina (esencial para el cerebro) y Luteína.");
  }

  // 2. CARBOHIDRATOS Y GRANOS
  if (name.includes('lentejas') || name.includes('caraotas') || name.includes('frijoles') || name.includes('porotos') || name.includes('feijão') || name.includes('garbanzos')) {
    portions.push("<strong>Granos:</strong> 1.5 tazas (cocidos).");
    preps.push("<strong>Granos:</strong> <strong>CRUCIAL:</strong> Remoja la noche anterior con limón o vinagre para eliminar antinutrientes (gases). Hierve hasta ablandar y echa la sal al final. Haz un sofrito natural con ajo y cebolla.");
    vitsList.push("Magnesio, Folato y altísima dosis de fibra.");
    alts.push("🍲 Si no toleras los granos, cámbialos por papa/yuca o come más proteínas.");
  }
  if (name.includes('arroz') || name.includes('pasta') || name.includes('quinoa')) {
    portions.push("<strong>Arroz/Pasta:</strong> 1 taza ya cocida.");
    preps.push("<strong>Arroz/Pasta:</strong> <strong>Tip de Longevidad:</strong> Si lo cocinas hoy, lo enfrías en nevera y lo comes mañana, se convierte en 'almidón resistente', alimentando tu flora intestinal sin crear picos de insulina.");
    vitsList.push("Hidratos de carbono limpios para energía.");
    alts.push("🍚 Intercambiable por papa, yuca, batata o plátano.");
  }
  if (name.includes('yuca') || name.includes('batata') || name.includes('papa') || name.includes('mandioca') || name.includes('plátano') || name.includes('tajadas') || name.includes('bolón')) {
    portions.push("<strong>Tubérculo/Plátano:</strong> 1 taza o 1 unidad mediana.");
    preps.push("<strong>Tubérculo/Plátano:</strong> Sancóchalo (hiérvelo) o ásalo al horno. Si haces tajadas de plátano, ásalas en el sartén con un toque de aceite de coco en lugar de freírlas en litros de aceite.");
    vitsList.push("Potasio y almidones complejos naturales.");
  }
  if (name.includes('arepa') || name.includes('pan') || name.includes('tostada') || name.includes('sandwich') || name.includes('sándwich') || name.includes('casabe')) {
    portions.push("<strong>Arepa/Pan:</strong> 1 arepa mediana o 2 rebanadas de pan (preferiblemente integral).");
    preps.push("<strong>Pan/Arepa:</strong> Ásalos o tuéstalos. Si haces sándwich o rellenas la arepa, no uses salsas industriales (mayonesa); usa aguacate triturado, tomate o un toque de aceite de oliva.");
    vitsList.push("Energía rápida (aporta fibra si es integral).");
  }

  // 3. DESAYUNOS Y ESPECIALES
  if (name.includes('avena') && !name.includes('pancakes') && !name.includes('muchíncakes') && !name.includes('galleta')) {
    portions.push("<strong>Avena:</strong> 1/2 taza en crudo.");
    preps.push("<strong>Avena:</strong> Cocina con agua/leche a fuego lento. Agrega canela generosamente para evitar picos de insulina. Nunca eches azúcar refinada, endulza con stevia o frutas picadas.");
    vitsList.push("Betaglucanos (fibra que baja el colesterol).");
  }
  if (name.includes('pancakes') || name.includes('muchíncakes') || name.includes('panquecas')) {
    portions.push("<strong>Pancakes:</strong> 2-3 unidades medianas.");
    preps.push("<strong>Pancakes:</strong> Licúa la avena, plátano o yuca con huevo. Cocina en sartén antiadherente a fuego muy bajo y tapado para que esponjen bien por dentro.");
    vitsList.push("Carbohidrato de absorción lenta y proteína.");
  }
  if (name.includes('yogur') || name.includes('bowl')) {
    portions.push("<strong>Yogur:</strong> 1 taza (idealmente griego o natural sin azúcar).");
    preps.push("<strong>Yogur:</strong> Evita yogures saborizados (tienen hasta 5 cucharadas de azúcar). Usa yogur natural y ponle tú el sabor en casa con frutas reales y semillas.");
    vitsList.push("Probióticos esenciales para la flora intestinal.");
  }
  if (name.includes('sopa') || name.includes('crema') || name.includes('caldo')) {
    portions.push("<strong>Sopa/Crema:</strong> 1 plato hondo.");
    preps.push("<strong>Sopa:</strong> Aprovecha de hervir vegetales y licuarlos para hacer cremas espesas (como zapallo o espinaca) sin necesidad de usar lácteos o harinas espesantes.");
    vitsList.push("Electrolitos y vitaminas hidrosolubles.");
  }
  if (name.includes('smoothie') || name.includes('batido')) {
    portions.push("<strong>Batido:</strong> 1 vaso grande.");
    if (name.includes('verde')) {
      preps.push("<strong>Smoothie Verde:</strong> Licúa 1 puñado de espinacas, 1/2 manzana verde, 1 rama de apio y jugo de medio limón con 1 vaso de agua. <strong>Advertencia:</strong> A diferencia de un jugo, el batido conserva toda la fibra. Bébelo despacio para que tu cuerpo lo digiera correctamente.");
      vitsList.push("Hierro (espinaca), Vitamina C (limón) y mucha fibra triturada.");
    } else {
      preps.push("<strong>Batido:</strong> Licúa los ingredientes muy bien. <strong>Advertencia:</strong> Un batido no es lo mismo que un jugo colado, este conserva toda la fibra de la fruta/vegetal, así que bébelo despacio para digerirlo bien.");
      vitsList.push("Fibra triturada de fácil digestión.");
    }
  }
  if (name.includes('ensalada') || name.includes('vegetales') || name.includes('brócoli') || name.includes('espinaca')) {
    portions.push("<strong>Vegetales:</strong> Al menos la mitad de tu plato.");
    preps.push("<strong>Vegetales:</strong> Puedes comerlos crudos, salteados o al vapor. Alíñalos con aceite de oliva, limón y sal, NUNCA con aderezos industriales de supermercado.");
    vitsList.push("Fibra prebiótica, Vitamina C y antioxidantes.");
  }

  // 4. BEBIDAS Y SNACKS
  if (name.includes('elixir') || name.includes('jugo') || name.includes('funcional')) {
    portions.push("<strong>Jugo:</strong> 1 vaso grande (300-400ml).");
    preps.push("<strong>Jugo del Día:</strong> La receta específica de este jugo está detallada paso a paso en la sección <strong>🥤 Mis Jugos</strong> de tu menú lateral. ¡Ve allí para prepararlo!<br><em>Consejo clínico:</em> Bébelo apenas lo licúes para no oxidar las vitaminas.");
    vitsList.push("Antioxidantes y enzimas vivas.");
    water = "El jugo hidrata, pero complementa con 1 vaso de agua extra 30 min después.";
  }
  
  if (name.includes('té') || name.includes('infusión') || name.includes('cacao') || name.includes('matcha') || name.includes('leche')) {
    portions.push("<strong>Bebida:</strong> 1 Taza caliente o fría (250ml).");
    preps.push("<strong>Bebida:</strong> Hierve el agua o calienta la leche/bebida vegetal. Agrega el té o cacao y reposa 5 min. <strong>Regla Innegociable:</strong> NUNCA endulzar con azúcar refinada. Usa stevia natural.");
    vitsList.push("Polifenoles y/o antioxidantes relajantes.");
    water = "Si tomas infusiones diuréticas (té verde, negro), acompáñalo con otro vaso de agua normal más tarde.";
  }

  if (name.includes('merienda') || name.includes('galleta') || name.includes('nueces') || name.includes('fruta') || name.includes('cambur') || name.includes('maní')) {
    // Evitamos duplicar si ya se detectó
    if (!portions.join('').includes('Snack') && !name.includes('jugo')) {
      portions.push("<strong>Snack:</strong> Porción pequeña (tamaño de tu puño cerrado).");
      preps.push("<strong>Snack Sólido:</strong> Mastica muy bien cada bocado. Recuerda: las meriendas son opcionales. Si no tienes hambre real, sáltala para dejar descansar tu digestión.");
      alts.push("🍵 Si no tienes el snack recetado, 1 fruta entera o 1 té sin azúcar siempre serán comodines perfectos.");
    }
  }

  // 5. FALLBACK GENÉRICO
  if (preps.length === 0) {
    portions.push("<strong>Porción:</strong> Sírvete hasta sentirte 80% lleno, no hasta reventar.");
    preps.push("1. Lava los ingredientes frescos.<br>2. Cocina a la plancha, horno o hervido.<br>3. Añade sal marina al final.<br>4. Mastica lentamente para favorecer la digestión.");
    vitsList.push("Vitaminas y minerales según los ingredientes de tu plato.");
  }

  // Compile final strings
  let finalPortion = portions.join('<br><br>');
  let finalPrep = preps.join('<br><br>');
  let finalVits = [...new Set(vitsList)].join(' | '); // Unique values
  let finalAlt = alts.length > 0 ? alts.join('<br><br>') : "Cambia cualquier ingrediente por algo similar que tengas en casa (proteína por proteína, carb por carb).";

  return { portion: finalPortion, prep: finalPrep, vits: finalVits, water, alt: finalAlt };
}

function toggleMenuType(type) {
  window.currentMenuType = type;
  showModule('menu'); // Re-render menu module
}

// ── Lógica de Pago Cripto ────────────────────
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
  if (status) status.innerHTML = "✅ ¡Pago Confirmado! Activando " + (isAnnual ? "Plan Anual..." : "Plan Mensual...");
  
  setTimeout(() => {
    userData.isPremium = true;
    userData.subscriptionType = planType;
    
    // Si es anual y usó descuento, resetear coins
    if (isAnnual && userData.discountUnlocked) {
      userData.coins = 0;
      userData.totalVideosWatched = 0; // Se reinicia el ciclo de la beca
    }

    localStorage.setItem('vidaOptima_user', JSON.stringify(userData));
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
    localStorage.setItem('vidaOptima_user', JSON.stringify(userData));
    alert("🎉 ¡Beca activada! Ya eres usuario Premium.");
    location.reload();
  } else {
    alert(`❌ Saldo insuficiente. Necesitas ${cost} monedas. ¡Sigue completando tareas en la Beca de Salud!`);
  }
}
// ── Lógica de la Beca de Salud (Videos y Recompensas) ──
function watchVideo() {
  const today = new Date().toDateString();
  
  // Inicializar si no existen
  if (!userData.videosToday) userData.videosToday = 0;
  if (!userData.totalVideosWatched) userData.totalVideosWatched = 0;

  // Validar cambio de día para reiniciar contador diario
  if (userData.lastVideoDate !== today) {
    userData.videosToday = 0;
    userData.lastVideoDate = today;
  }

  // Límite de 3 videos por día
  if (userData.videosToday >= 3) {
    alert("🛑 Límite diario alcanzado. Tu cerebro necesita procesar la información. Vuelve mañana para seguir acumulando.");
    return;
  }

  // Simular visualización de video (3 segundos)
  const btn = event.target;
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = "📺 Procesando cápsula de salud...";

  setTimeout(() => {
    userData.videosToday++;
    userData.totalVideosWatched++;
    userData.coins += 10;
    
    // Validar desbloqueo de descuento (15 videos)
    if (userData.totalVideosWatched >= 15) {
      userData.discountUnlocked = true;
    }

    localStorage.setItem('vidaOptima_user', JSON.stringify(userData));
    
    alert(`✅ ¡Video completado! +10 Optimal Coins. (${userData.videosToday}/3 hoy)`);
    
    btn.disabled = false;
    btn.innerHTML = originalText;
    
    showModule('rewards'); // Re-renderizar para mostrar progreso
  }, 3000);
}

// ── CONFIGURACIÓN DE MONETIZACIÓN ──
const OFFERWALL_URL = ""; // PEGA AQUÍ TU URL DE ADGATE O BITLABS

// ── Lógica Modal Ejercicios ─────────────────
// Eliminada: Ahora las rutinas se renderizan nativamente con detalle clínico en el módulo.

function toggleExerciseType(type) {
  window.currentExerciseType = type;
  showModule('ejercicio');
}

// ── Actualizar Perfil ───────────────────────
window.updateProfile = function() {
  const btn = event.target;
  const originalText = btn.innerHTML;
  
  // "Thinking" state for a premium feel
  btn.innerHTML = '🤔 Procesando cambios...';
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

    localStorage.setItem('vidaOptima_user', JSON.stringify(userData));
    
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

// ── Iniciar ───────────────────────────────
window.onload = () => {
  const saved = localStorage.getItem('vidaOptima_user');
  if(saved) {
    try {
      userData = JSON.parse(saved);
      // Migración para usuarios antiguos
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

// ── SISTEMA DE PROTECCIÓN DE PROPIEDAD INTELECTUAL (Oculto) ────────────────
/**
 * Función de verificación de autoría para auditorías legales o due diligence.
 * Permite demostrar que el código es una creación original de Terry Romero.
 */
window._verifyOwnership = function(key) {
  const secret = "TR-2025-VO-PLATFORM";
  if (key === secret) {
    console.info("🛡️ PROPIEDAD INTELECTUAL VERIFICADA");
    console.info("Propietario: Terry Edicson Romero Loreto");
    console.info("Documento ID: 20.264.887");
    console.info("Firma Digital: " + Engine._signature);
    console.info("Estatus: Founder & CEO / Lead Architect");
    return true;
  }
  return false;
};

// ⌨️ ESCUCHADOR DE TECLAS PARA EL FUNDADOR (Ctrl + Alt + F)
window.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'f') {
    const pass = prompt("🔐 SISTEMA DE SEGURIDAD VIDA ÓPTIMA\nIngrese la Llave Maestra del Fundador:");
    const secret = "VidaOptima_Master_20264887";
    
    if (pass === secret) {
      alert("✅ ACCESO CONCEDIDO\nBienvenido, Terry Edicson Romero Loreto.\nEstatus: Founder & CEO / Lead Architect.");
      window._verifyOwnership("TR-2025-VO-PLATFORM");
      // Aquí se pueden habilitar paneles ocultos en el futuro
    } else if (pass !== null) {
      alert("❌ ACCESO DENEGADO\nIntento de intrusión registrado.");
    }
  }
});

// ── SISTEMA DE ANALÍTICA (Inteligencia de Negocio) ──
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

    console.log("📊 [ANALYTICS]:", payload);
    // Aquí se conectaría con Firebase/Mixpanel en el futuro:
    // firebase.analytics().logEvent(eventName, payload);
  },

  getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "tablet";
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpwOS)/i.test(ua)) return "mobile";
    return "desktop";
  }
};

// ── SISTEMA DE MOTIVACIÓN ESTOICA ──
window.StoicMotivator = {
  quotes: [
    { text: "No es que tengamos poco tiempo, es que perdemos mucho. El cuerpo es tu única herramienta; úsala o piérdela.", author: "Séneca" },
    { text: "La felicidad de tu vida depende de la calidad de tus pensamientos y la salud de tu templo físico.", author: "Marco Aurelio" },
    { text: "Ningún hombre tiene el derecho de ser un aficionado en el entrenamiento físico. Es una lástima envejecer sin ver la fuerza de la que es capaz tu cuerpo.", author: "Sócrates" },
    { text: "Dificultades reales son las que el destino nos pone; las demás son excusas de una mente débil. Haz tu rutina.", author: "Epicteto" }
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
    // Simulación de notificación en UI
    setTimeout(() => {
      const msg = `🏛️ MENSAJE ESTOICO: "${quote.text}" — ${quote.author}`;
      console.log(msg);
      // Podríamos mostrarlo en un toast o modal
    }, 3000);
  }
};

// Iniciar chequeo de motivación
StoicMotivator.checkEngagement();

// ── SISTEMA DE GAMIFICACIÓN ──
function checkDailyStreak() {
  if (!userData.lastCheckIn) return;
  
  const today = new Date().toDateString();
  const last = userData.lastCheckIn;
  
  if (today === last) return; // Ya entró hoy
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (last === yesterday.toDateString()) {
    userData.streak++;
    userData.coins += 5; // Premio por racha
    console.log("🔥 RACHA AUMENTADA:", userData.streak);
  } else {
    userData.streak = 1;
    console.log("❄️ RACHA REINICIADA");
  }
  
  userData.lastCheckIn = today;
  localStorage.setItem('vidaOptima_user', JSON.stringify(userData));
}

// Ejecutar al cargar
setTimeout(checkDailyStreak, 2000);
