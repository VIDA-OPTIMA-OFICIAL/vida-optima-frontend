// Configuración de Firebase para Vida Óptima
const firebaseConfig = {
  apiKey: "AIzaSyC6AuM_Uy8iu-Ex-JOhyLU7kw-ERwmDlxY",
  authDomain: "vida-optima.firebaseapp.com",
  projectId: "vida-optima",
  storageBucket: "vida-optima.firebasestorage.app",
  messagingSenderId: "968452042731",
  appId: "1:968452042731:web:094319c5559e471f9473ae",
  measurementId: "G-34HZ4VC4L3"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

console.log("🔥 Firebase conectado correctamente");
