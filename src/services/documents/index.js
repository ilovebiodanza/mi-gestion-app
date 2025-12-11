// src/services/documents/index.js
import { authService } from "../auth.js";
import { encryptionService } from "../encryption/index.js";

class DocumentService {
  constructor() {
    this.db = null;
    this.collectionName = "documents";

    // Esperar carga de Firebase
    setTimeout(() => {
      if (window.firebaseModules) {
        this.db = window.firebaseModules.db;
      }
    }, 500);
  }

  getCollection() {
    if (!this.db || !window.firebaseModules)
      throw new Error("Firebase no inicializado");
    const user = authService.getCurrentUser();
    if (!user) throw new Error("Usuario no autenticado");

    const { collection } = window.firebaseModules;
    // Estructura: users/{uid}/documents
    return collection(this.db, `users/${user.uid}/${this.collectionName}`);
  }

  // --- CREAR ---
  async createDocument(template, formData) {
    console.log("🔒 Iniciando proceso de guardado seguro...");

    // 1. Extraer metadatos (visibles en lista)
    const titleField =
      template.fields.find((f) => f.type === "string") || template.fields[0];
    let title = formData[titleField.id];
    // Si el título es un objeto (ej: url), sacar texto
    if (typeof title === "object" && title !== null)
      title = title.text || title.url || "Sin Título";

    const metadata = {
      title: title || "Nuevo Documento",
      templateName: template.name,
      icon: template.icon,
      color: template.color,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 2. Cifrar SOLO los datos del formulario
    // encryptedObject será: { iv: "hex...", content: "hex..." }
    const encryptedObject = await encryptionService.encryptDocument(formData);

    // 3. Preparar objeto final para Firestore
    const { doc, setDoc, collection } = window.firebaseModules;
    const docRef = doc(this.getCollection()); // ID automático

    const documentPayload = {
      id: docRef.id,
      templateId: template.id,
      encryptedContent: encryptedObject, // Guardamos el objeto tal cual
      encryptionMetadata: { version: 1, algo: "AES-GCM" }, // Info útil para el futuro
      metadata: metadata,
    };

    // 4. Guardar
    await setDoc(docRef, documentPayload);
    console.log("✅ Documento guardado y cifrado exitosamente");
    return documentPayload;
  }

  // --- LEER (LISTA) ---
  async getAllDocuments() {
    try {
      const { getDocs, query, orderBy } = window.firebaseModules;
      const q = query(
        this.getCollection(),
        orderBy("metadata.updatedAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error al listar documentos:", error);
      return [];
    }
  }

  // --- LEER (DETALLE) ---
  async getDocumentById(id) {
    const { doc, getDoc } = window.firebaseModules;
    const docRef = doc(this.getCollection(), id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) throw new Error("Documento no encontrado");
    return { id: snapshot.id, ...snapshot.data() };
  }

  // --- ACTUALIZAR ---
  async updateDocument(docId, template, formData) {
    console.log("🔄 Actualizando documento cifrado...");

    // 1. Recifrar datos
    const encryptedObject = await encryptionService.encryptDocument(formData);

    // 2. Actualizar metadatos
    const titleField =
      template.fields.find((f) => f.type === "string") || template.fields[0];
    let title = formData[titleField.id];
    if (typeof title === "object") title = title.text || title.url;

    const { doc, setDoc } = window.firebaseModules;
    const docRef = doc(this.getCollection(), docId);

    // 3. Merge update
    const updatePayload = {
      encryptedContent: encryptedObject,
      "metadata.title": title || "Sin Título",
      "metadata.updatedAt": new Date().toISOString(),
      "metadata.icon": template.icon, // Por si cambió la plantilla
    };

    // Usamos setDoc con merge: true para no borrar campos que no tocamos
    await setDoc(docRef, updatePayload, { merge: true });
    console.log("✅ Documento actualizado");

    // Retornamos estructura completa para que la UI se actualice
    return { id: docId, ...updatePayload };
  }

  // --- ELIMINAR ---
  async deleteDocument(id) {
    const { doc, deleteDoc } = window.firebaseModules;
    await deleteDoc(doc(this.getCollection(), id));
    console.log(`🗑️ Documento ${id} eliminado exitosamente`);
  }

  // --- CARGAR PARA EDICIÓN ---
  async loadDocumentForEditing(docId) {
    // Esta función orquesta la carga: Documento + Plantilla + Desencriptado
    const doc = await this.getDocumentById(docId);

    // Importamos templateService dinámicamente para evitar ciclos de dependencia si los hubiera
    const { templateService } = await import("../templates/index.js");
    const template = await templateService.getTemplateById(doc.templateId);

    if (!template) throw new Error("La plantilla de este documento no existe");

    // Desencriptar
    const formData = await encryptionService.decryptDocument(
      doc.encryptedContent
    );

    return { document: doc, template, formData, metadata: doc.metadata };
  }

  /**
   * RE-CIFRADO MASIVO (Cambio de Llave Maestra)
   * 1. Descarga todos los docs.
   * 2. Descifra con la llave actual.
   * 3. Cifra con la llave nueva.
   * 4. Guarda todo en un Batch atómico.
   */
  async reEncryptAllDocuments(newPassword) {
    console.log("🔄 Iniciando proceso de Re-Cifrado Masivo...");

    // 1. Obtener nueva llave derivada (temporal)
    const newMasterKey = await encryptionService.deriveTemporaryKey(
      newPassword
    );

    // 2. Obtener todos los documentos cifrados actuales
    const allDocs = await this.getAllDocuments();
    console.log(`📄 Procesando ${allDocs.length} documentos...`);

    // 3. Preparar Batch de Firestore (Límite 500 ops, para V1 asumimos <500)
    const { writeBatch, doc } = window.firebaseModules;
    const batch = writeBatch(this.db);

    // 4. Bucle de conversión
    for (const docData of allDocs) {
      try {
        // A. Descifrar con llave ACTUAL (La que está en memoria)
        const plainData = await encryptionService.decryptDocument(
          docData.encryptedContent
        );

        // B. Cifrar con llave NUEVA
        const newEncryptedContent = await encryptionService.encryptDocument(
          plainData,
          newMasterKey
        );

        // C. Agregar al batch
        const docRef = doc(this.getCollection(), docData.id);
        batch.update(docRef, {
          encryptedContent: newEncryptedContent,
          "encryptionMetadata.updatedAt": new Date().toISOString(),
        });
      } catch (err) {
        console.error(`❌ Falló re-cifrado del doc ${docData.id}`, err);
        throw new Error(
          `Error de integridad en documento ${docData.metadata.title}. Proceso abortado.`
        );
      }
    }

    // 5. Commit atómico (Todo o nada)
    await batch.commit();

    // 6. Actualizar la llave en memoria para seguir trabajando sin salir
    encryptionService.setNewMasterKey(newMasterKey);

    console.log("✅ Re-cifrado completado con éxito.");
    return true;
  }
}

export const documentService = new DocumentService();
