// src/services/auth.js
import { encryptionService } from "./encryption/index.js";

class AuthService {
  constructor() {
    this.auth = null;
    this.db = null;
    this.user = null;
    this.observers = [];

    // Iniciamos la espera activa de Firebase
    this.waitForFirebase();
  }

  async waitForFirebase() {
    let attempts = 0;
    while (!window.firebaseModules && attempts < 50) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    if (window.firebaseModules) {
      this.auth = window.firebaseModules.auth;
      this.db = window.firebaseModules.db;

      console.log("🔍 AuthService: Firebase detectado. Iniciando listener...");

      // Listener oficial de Firebase
      const { onAuthStateChanged } = window.firebaseModules;
      onAuthStateChanged(this.auth, (user) => {
        console.log(
          "🔍 AuthService (Listener): Cambio de estado detectado ->",
          user ? user.email : "Sin sesión"
        );
        this.updateState(user);
      });

      console.log("✅ AuthService: Conectado exitosamente a Firebase");
    } else {
      console.error("❌ AuthService: Timeout esperando a Firebase CDN.");
      alert("Error crítico: No se pudieron cargar los servicios de Google.");
    }
  }

  /**
   * Método centralizado para actualizar estado y avisar a la app
   */
  updateState(user) {
    // Evitar notificaciones duplicadas si el usuario es el mismo
    // (Opcional, pero útil para evitar parpadeos)
    this.user = user;
    this.notifyObservers(user);
  }

  subscribe(observer) {
    this.observers.push(observer);
    // Si ya sabemos quién es el usuario, avisar al nuevo suscriptor de inmediato
    if (this.user !== null) {
      console.log(
        "🔍 AuthService: Suscriptor registrado, notificando estado actual inmediato."
      );
      observer(this.user);
    }
  }

  notifyObservers(user) {
    console.log(
      `🔍 AuthService: Notificando a ${this.observers.length} observadores.`
    );
    this.observers.forEach((obs) => obs(user));
  }

  getCurrentUser() {
    return this.user;
  }

  // --- AUTENTICACIÓN ---

  async login(email, password) {
    if (!this.auth)
      return { success: false, error: "Servicio no inicializado" };

    try {
      console.log("🔍 AuthService: Intentando login...");
      const { signInWithEmailAndPassword } = window.firebaseModules;

      // 1. Llamada a Firebase
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      console.log("🔍 AuthService: Login exitoso en nube.");

      // 2. ACTUALIZACIÓN MANUAL (REDUNDANCIA)
      // No esperamos a onAuthStateChanged, actualizamos ya.
      this.updateState(userCredential.user);

      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error("Error Login:", error);
      return { success: false, error: this.mapAuthError(error.code) };
    }
  }

  async register(email, password) {
    if (!this.auth)
      return { success: false, error: "Servicio no inicializado" };
    try {
      const { createUserWithEmailAndPassword } = window.firebaseModules;
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );

      // Inicializar cifrado para usuario nuevo
      await this.initializeEncryption(password);

      // Notificación manual por si acaso
      this.updateState(userCredential.user);

      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: this.mapAuthError(error.code) };
    }
  }

  async logout() {
    try {
      if (
        encryptionService &&
        typeof encryptionService.clearKey === "function"
      ) {
        encryptionService.clearKey();
      }
      const { signOut } = window.firebaseModules;
      await signOut(this.auth);

      // Notificación manual de salida
      this.updateState(null);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async resetPassword(email) {
    if (!this.auth)
      return { success: false, error: "Servicio no inicializado" };
    try {
      const { sendPasswordResetEmail } = window.firebaseModules;
      await sendPasswordResetEmail(this.auth, email);
      return { success: true, message: "Correo enviado" };
    } catch (error) {
      return { success: false, error: this.mapAuthError(error.code) };
    }
  }

  async changeAccessPassword(newPassword, currentPassword) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error("No sesión");
      const {
        updatePassword,
        reauthenticateWithCredential,
        EmailAuthProvider,
      } = window.firebaseModules;
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      return { success: true };
    } catch (error) {
      return { success: false, error: this.mapAuthError(error.code) };
    }
  }

  // --- BÓVEDA ---

  async initializeEncryption(password) {
    // Si la llamada viene antes de que Firebase detecte el usuario, usamos this.auth.currentUser
    const user = this.user || this.auth?.currentUser;
    if (!user) throw new Error("Usuario no autenticado (AuthService)");

    return await encryptionService.initialize(password, user.uid);
  }

  mapAuthError(code) {
    switch (code) {
      case "auth/invalid-email":
        return "Correo inválido";
      case "auth/user-disabled":
        return "Usuario bloqueado";
      case "auth/user-not-found":
        return "Usuario no encontrado";
      case "auth/wrong-password":
        return "Contraseña incorrecta";
      case "auth/email-already-in-use":
        return "Email ya registrado";
      case "auth/weak-password":
        return "Contraseña muy débil";
      case "auth/too-many-requests":
        return "Muchos intentos. Espera un poco.";
      case "auth/network-request-failed":
        return "Error de red. Verifica conexión.";
      default:
        return "Error: " + code;
    }
  }
}

export const authService = new AuthService();
