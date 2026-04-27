const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/**
 * ============================================================
 * VIDA ÓPTIMA — API de Inteligencia Biológica (Backend)
 * ============================================================
 * @author      Terry Edicson Romero Loreto (Founder & CEO)
 * @copyright   © 2025 Terry Edicson Romero Loreto. 
 * ============================================================
 */

const Engine = {
  // ── Calorías base (Mifflin-St Jeor) ───────
  calcCalorias(peso, estatura, edad, sexo, actividad) {
    let bmr = sexo === 'masculino'
      ? 10*peso + 6.25*estatura - 5*edad + 5
      : 10*peso + 6.25*estatura - 5*edad - 161;
    const factores = { sedentario:1.2, ligero:1.375, moderado:1.55, activo:1.725, muy_activo:1.9 };
    return Math.round(bmr * (factores[actividad] || 1.375));
  },

  detectarPerfil(edad, sexo) {
    if (edad <= 11) return 'nino';
    if (edad <= 17) return sexo === 'masculino' ? 'adolescente_m' : 'adolescente_f';
    if (edad <= 30) return sexo === 'masculino' ? 'joven_m' : 'joven_f';
    if (edad <= 45) return sexo === 'masculino' ? 'adulto_m' : 'adulto_f';
    if (edad <= 60) return sexo === 'masculino' ? 'mayor_m' : 'mayor_f';
    return 'senior';
  },

  ajustarCalorias(calorias, objetivos) {
    const adj = { aumentar_masa:+400, bajar_grasa:-400, mantenimiento:0, recuperacion:-100, rendimiento:+300, longevidad:-200 };
    if (!objetivos || objetivos.length === 0) return calorias;
    let totalAdj = 0;
    objetivos.forEach(obj => { totalAdj += (adj[obj] || 0); });
    return Math.round(calorias + (totalAdj / objetivos.length));
  },

  calcMacros(kcal, objetivos) {
    const ratios = {
      aumentar_masa:  { p:0.30, c:0.45, g:0.25 },
      bajar_grasa:    { p:0.40, c:0.30, g:0.30 },
      mantenimiento:  { p:0.25, c:0.45, g:0.30 },
      longevidad:     { p:0.25, c:0.45, g:0.30 },
    };
    const obj = (objetivos && objetivos.length > 0) ? objetivos[0] : 'mantenimiento';
    const r = ratios[obj] || ratios.mantenimiento;
    return {
      proteinas: Math.round(kcal * r.p / 4),
      carbos:    Math.round(kcal * r.c / 4),
      grasas:    Math.round(kcal * r.g / 9),
    };
  },

  detectarRegion(uStr) {
    const u = (uStr || '').toLowerCase();
    if (/venezuel|caracas|colombia|bogot|mexico|méx|peru|lima|argentin|chile|ecuador|brasil|cuba/.test(u)) {
        // Lógica de detección simplificada para el ejemplo
        return u.match(/venezuela|colombia|mexico|peru|argentina|chile|ecuador|brasil|cuba/)[0];
    }
    return 'latam';
  },

  getMenuType(ingreso, presupuesto) {
    // Lógica propietaria de segmentación económica
    if (presupuesto < 30 || ingreso < 300) return 'default_econ';
    if (presupuesto < 60 || ingreso < 600) return 'default_q1';
    return 'default_premium';
  }
};

app.post('/api/calculate-plan', (req, res) => {
  const { userData } = req.body;
  
  if (!userData) return res.status(400).json({ error: 'Faltan datos de usuario' });

  try {
    const baseKcal = Engine.calcCalorias(userData.peso, userData.estatura, userData.edad, userData.sexo, userData.actividad);
    const kcal = Engine.ajustarCalorias(baseKcal, userData.objetivos);
    const macros = Engine.calcMacros(kcal, userData.objetivos);
    const region = Engine.detectarRegion(userData.ubicacion);
    const menuType = Engine.getMenuType(userData.ingreso, userData.presupuesto);
    const perfil = Engine.detectarPerfil(userData.edad, userData.sexo);

    res.json({
      success: true,
      perfil,
      kcal,
      macros,
      region,
      menuType,
      signature: "VALID_IP_TERRY_ROMERO_2026"
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Vida Óptima Backend PROTEGIDO en puerto ${PORT}`);
});
