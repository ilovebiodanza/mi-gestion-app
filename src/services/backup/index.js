// src/services/backup/index.js
import { documentService } from "../documents/index.js";
import { templateService } from "../templates/index.js";
import { encryptionService } from "../encryption/index.js";

class BackupService {
  // --- EXPORTAR (Se mantiene simple, usa la llave actual) ---
  async createBackup() {
    const documents = await documentService.getAllDocuments();
    const templates = await templateService.getUserTemplates();

    const backupData = {
      version: 1,
      createdAt: new Date().toISOString(),
      documents,
      templates, // Las plantillas no suelen estar cifradas en contenido, solo metadatos
      type: "mi_gestion_backup_e2ee",
    };

    const fileName = `backup_migestion_${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { count: documents.length };
  }

  // --- RESTAURAR (Lógica Inteligente) ---

  /**
   * Intenta restaurar. Si falla el descifrado, lanza error para pedir clave.
   * @param {File} file - Archivo JSON
   * @param {string} legacyPassword - (Opcional) Contraseña antigua si la actual falla
   */
  async restoreBackup(file, legacyPassword = null) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.type !== "mi_gestion_backup_e2ee")
            throw new Error("Formato de archivo no válido");

          const docs = data.documents || [];
          const tpls = data.templates || [];
          let keyToUse = null;

          // 1. Determinar qué llave usar
          if (legacyPassword) {
            console.log("🔓 Intentando restaurar con contraseña Legacy...");
            keyToUse = await encryptionService.deriveTemporaryKey(
              legacyPassword
            );
          }

          // 2. "Prueba del Canario": Intentar descifrar el primer documento cifrado
          if (docs.length > 0) {
            try {
              // Si no hay keyToUse (legacy), decryptDocument usa la actual por defecto
              await encryptionService.decryptDocument(
                docs[0].encryptedContent,
                keyToUse
              );
            } catch (cryptoError) {
              // 🔥 AQUÍ ESTÁ LA MAGIA: Si falla, avisamos a la UI
              return reject({
                type: "KEY_MISMATCH",
                message:
                  "La contraseña actual no puede descifrar este respaldo.",
              });
            }
          }

          // 3. Procesar Documentos (Re-cifrar si es necesario)
          let restoredCount = 0;

          for (const doc of docs) {
            // A. Descifrar (con llave actual o legacy)
            const plainData = await encryptionService.decryptDocument(
              doc.encryptedContent,
              keyToUse
            );

            // B. Crear nuevo documento (Esto lo cifra automáticamente con la llave ACTUAL activa)
            // Necesitamos la plantilla para saber qué campos usar, buscamos en el backup o en el sistema
            const template =
              tpls.find((t) => t.id === doc.templateId) ||
              (await templateService.getTemplateById(doc.templateId));

            if (template) {
              // Recreamos el documento para que tenga un ID nuevo y se cifre con la llave de hoy
              // await documentService.create(template, plainData);
              await documentService.create({
                title: doc.metadata.title,
                template,
                data: plainData,
              });
              restoredCount++;
            }
          }

          // 4. Restaurar Plantillas (si no existen)
          let tplCount = 0;
          for (const tpl of tpls) {
            const exists = await templateService.getTemplateById(tpl.id);
            if (!exists) {
              await templateService.importTemplate(tpl);
              tplCount++;
            }
          }

          resolve({ docsRestored: restoredCount, templatesRestored: tplCount });
        } catch (error) {
          console.error("Restore Error:", error);
          reject(error);
        }
      };

      reader.readAsText(file);
    });
  }
}

export const backupService = new BackupService();
