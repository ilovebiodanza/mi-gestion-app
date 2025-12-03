import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../../config/firebase-config.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Obtener servicios
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, app };
