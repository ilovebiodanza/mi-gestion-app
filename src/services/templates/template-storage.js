// src/services/templates/template-storage.js

import { firebaseService } from "../firebase-cdn.js";

const APP_ID = "mi-gestion-v1";

class TemplateStorage {
  constructor(userId, appId = APP_ID) {
    this.userId = userId;
    this.appId = appId;
  }

  // --- Métodos de LocalStorage (Backup) ---

  async loadFromLocalStorage() {
    const storageKey = `user_templates_${this.userId}`;
    const storedTemplates = localStorage.getItem(storageKey);
    return storedTemplates ? JSON.parse(storedTemplates) : [];
  }

  async saveToLocalStorage(templates) {
    try {
      if (!this.userId) return;
      const storageKey = `user_templates_${this.userId}`;
      localStorage.setItem(storageKey, JSON.stringify(templates));
    } catch (error) {
      console.error("❌ Error al guardar en localStorage:", error);
    }
  }

  // --- Métodos de Firestore (Fuente de Verdad) ---

  getTemplatesRef() {
    if (!this.userId) {
      throw new Error("ID de usuario no definido para Firestore.");
    }
    // 👇👇👇 RUTA CORREGIDA PARA CUMPLIR REGLAS DE SEGURIDAD 👇👇👇
    // Guardamos todas las plantillas en un solo documento de configuración
    return firebaseService.doc(`users/${this.userId}/templates/config`);
  }

  async loadFromFirestore() {
    console.log("🔥 Cargando plantillas desde Firestore...");
    try {
      const templatesRef = this.getTemplatesRef();
      const docSnap = await firebaseService.getDoc(templatesRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const templates = data.templates || [];
        console.log(
          `✅ ${templates.length} plantillas cargadas desde Firestore`
        );
        return templates;
      }

      return [];
    } catch (error) {
      console.error("❌ Error al cargar de Firestore:", error);
      return null;
    }
  }

  async saveToFirestore(templates) {
    try {
      if (!this.userId) return;

      console.log("💾 Guardando plantillas en Firestore...");

      const templatesRef = this.getTemplatesRef();
      const templatesData = {
        updatedAt: new Date().toISOString(),
        count: templates.length,
        templates: templates, // Guardamos el array completo
      };

      // Usamos setDoc con merge para no borrar otros campos si los hubiera
      await firebaseService.setDoc(templatesRef, templatesData, {
        merge: true,
      });

      console.log(`✅ ${templates.length} plantillas guardadas en Firestore`);
      await this.saveToLocalStorage(templates); // Backup local
    } catch (error) {
      console.error("❌ Error al guardar en Firestore:", error);
      // Lanzamos el error para que la UI se entere
      throw error;
    }
  }

  // --- Sincronización ---

  async checkSyncStatus(localTemplates) {
    if (!this.userId) return { synced: false, error: "Usuario no autenticado" };

    try {
      const templatesRef = this.getTemplatesRef();
      const docSnap = await firebaseService.getDoc(templatesRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        const cloudTemplates = data.templates || [];

        return {
          synced: cloudTemplates.length === localTemplates.length,
          localCount: localTemplates.length,
          cloudCount: cloudTemplates.length,
          cloudTemplates: cloudTemplates,
          lastUpdated: data.updatedAt,
          needsSync: cloudTemplates.length !== localTemplates.length,
        };
      }

      return {
        synced: false,
        localCount: localTemplates.length,
        cloudCount: 0,
        needsSync: true,
        cloudTemplates: [],
      };
    } catch (e) {
      return { synced: false, error: e.message };
    }
  }
}

export { TemplateStorage };
