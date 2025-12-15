// src/components/SettingsManager.js
import { backupService } from "../services/backup/index.js";
import { authService } from "../services/auth.js";
import { encryptionService } from "../services/encryption/index.js";
import { templateService } from "../services/templates/index.js"; // <--- NUEVO

export class SettingsManager {
  render() {
    return `
      <div class="max-w-5xl mx-auto space-y-8 animate-fade-in-up pb-20">
        
        <div class="flex items-center space-x-5 mb-8 px-4 sm:px-0">
          <div class="p-4 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center justify-center">
             <i class="fas fa-shield-halved text-3xl text-indigo-600 bg-clip-text"></i>
          </div>
          <div>
            <h2 class="text-3xl font-extrabold text-slate-800 tracking-tight">Centro de Seguridad</h2>
            <p class="text-slate-500 font-medium">Gestiona tus credenciales y conecta tu Inteligencia Artificial.</p>
          </div>
        </div>

        <div class="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-xl shadow-indigo-500/30 overflow-hidden text-white relative">
            <div class="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div class="px-8 py-8 relative z-10">
                <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <i class="fas fa-robot text-2xl text-indigo-200"></i>
                            <h3 class="font-bold text-2xl">Entrenar a Gemini</h3>
                        </div>
                        <p class="text-indigo-100 text-sm max-w-xl leading-relaxed">
                            Genera un "Mapa de Instrucciones" para que Gemini aprenda la estructura de tus plantillas de <b>Seguridad Media</b>. Copia el texto y pégalo en tu chat con Gemini.
                        </p>
                    </div>
                    <button id="btnGeneratePrompt" class="px-6 py-3 bg-white text-indigo-700 font-bold rounded-xl shadow-lg hover:bg-indigo-50 transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap">
                        <i class="fas fa-magic"></i> Generar Prompt
                    </button>
                </div>

                <div id="promptResultArea" class="hidden mt-6 pt-6 border-t border-white/20 animate-fade-in">
                    <label class="text-xs font-bold text-indigo-200 uppercase mb-2 block">Copia este texto y envíaselo a Gemini:</label>
                    <div class="relative">
                        <textarea id="promptOutput" readonly class="w-full h-40 bg-black/20 border border-white/10 rounded-xl p-4 text-xs font-mono text-indigo-50 focus:outline-none resize-none custom-scrollbar"></textarea>
                        <button id="btnCopyPrompt" class="absolute top-2 right-2 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors" title="Copiar al portapapeles">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            
            <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden flex flex-col h-full">
                <div class="bg-gradient-to-r from-blue-50 to-white px-8 py-6 border-b border-blue-100/50 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-sm">
                            <i class="fas fa-user-lock"></i>
                        </div>
                        <h3 class="font-bold text-slate-800 text-lg">Acceso a la Cuenta</h3>
                    </div>
                    <span class="text-[10px] uppercase font-bold tracking-wider bg-white border border-blue-100 text-blue-600 px-3 py-1 rounded-full shadow-sm">Nube Firebase</span>
                </div>
                
                <div class="p-8 flex-grow">
                    <p class="text-sm text-slate-500 mb-6 leading-relaxed">
                        Contraseña de inicio de sesión. Cambiarla no afecta el cifrado de tus documentos.
                    </p>
                    <form id="changeAccessPassForm" class="space-y-5">
                        <div class="group">
                            <label class="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Contraseña Actual</label>
                            <input type="password" id="currentAccessPass" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" required>
                        </div>
                        <div class="group">
                            <label class="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Nueva Contraseña</label>
                            <input type="password" id="newAccessPass" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" required minlength="6">
                        </div>
                        <button type="submit" id="btnChangeAccess" class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all mt-2">
                            Actualizar Credenciales
                        </button>
                    </form>
                </div>
            </div>

            <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-amber-100 overflow-hidden flex flex-col h-full relative">
                <div class="absolute top-0 right-0 w-20 h-20 overflow-hidden pointer-events-none">
                     <div class="bg-amber-400 text-amber-900 text-[10px] font-bold py-1 text-center w-32 -rotate-45 absolute top-4 -right-10 shadow-sm">CRÍTICO</div>
                </div>

                <div class="bg-gradient-to-r from-amber-50 to-white px-8 py-6 border-b border-amber-100/50 flex items-center justify-between">
                     <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm">
                            <i class="fas fa-key"></i>
                        </div>
                        <h3 class="font-bold text-slate-800 text-lg">Llave Maestra Bóveda</h3>
                    </div>
                </div>
                
                <div class="p-8 flex-grow">
                    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <i class="fas fa-exclamation-triangle text-amber-500 mt-0.5"></i>
                        <p class="text-xs text-amber-800 leading-relaxed font-medium">
                            Esta llave <strong>cifra tus datos</strong>. Si la cambias, el sistema deberá re-cifrar todo tu contenido.
                        </p>
                    </div>
                    
                    <form id="changeVaultPassForm" class="space-y-4">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="sm:col-span-2">
                                <label class="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Llave Actual</label>
                                <input type="password" id="currentVaultPass" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition" required>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Nueva Llave</label>
                                <input type="password" id="newVaultPass" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition" required minlength="8">
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Confirmar</label>
                                <input type="password" id="confirmVaultPass" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition" required>
                            </div>
                        </div>
                        <button type="submit" id="btnChangeVault" class="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all mt-2 flex items-center justify-center gap-2">
                            <i class="fas fa-sync-alt"></i> Re-Cifrar Bóveda
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden mt-8">
            <div class="px-8 py-6 border-b border-slate-100 bg-slate-50/30">
                <h3 class="font-bold text-lg text-slate-800 flex items-center">
                    <span class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 text-sm"><i class="fas fa-database"></i></span>
                    Respaldo y Restauración
                </h3>
            </div>
            
            <div class="p-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div class="group">
                    <h4 class="font-bold text-slate-700 mb-2 flex items-center"><i class="fas fa-file-export text-slate-400 mr-2"></i> Exportar Datos</h4>
                    <p class="text-xs text-slate-500 mb-5 leading-relaxed">
                        Descarga un archivo JSON cifrado con tu <strong>Llave de Bóveda</strong> actual.
                    </p>
                    <button id="btnExport" class="w-full sm:w-auto px-6 py-2.5 bg-white border-2 border-slate-100 hover:border-primary/50 text-slate-600 hover:text-primary font-bold rounded-xl transition-all shadow-sm flex items-center justify-center">
                        <i class="fas fa-download mr-2"></i> Descargar Respaldo
                    </button>
                </div>

                <div class="border-t md:border-t-0 md:border-l border-slate-100 pt-8 md:pt-0 md:pl-10 group relative">
                    <h4 class="font-bold text-slate-700 mb-2 flex items-center"><i class="fas fa-file-import text-slate-400 mr-2"></i> Restaurar Datos</h4>
                    <p class="text-xs text-slate-500 mb-5 leading-relaxed">
                        Importa un respaldo. El sistema detectará si la llave es antigua.
                    </p>
                    <div class="flex flex-col sm:flex-row gap-3">
                        <input type="file" id="fileImport" accept=".json" class="hidden" />
                        <button onclick="document.getElementById('fileImport').click()" class="flex-1 px-5 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition text-sm">
                            <i class="fas fa-folder-open mr-2"></i> Elegir Archivo
                        </button>
                        <button id="btnRestore" disabled class="flex-1 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-lg shadow-indigo-500/20 text-sm">
                            Restaurar
                        </button>
                    </div>
                    <div id="restoreStatus" class="mt-4 text-xs font-medium min-h-[20px]"></div>
                </div>
            </div>
        </div>

      </div>
    `;
  }

  setupEventListeners() {
    // --- 1. ENTRENAMIENTO GEMINI (NUEVO) ---
    const btnGenPrompt = document.getElementById("btnGeneratePrompt");
    const resultArea = document.getElementById("promptResultArea");
    const output = document.getElementById("promptOutput");
    const btnCopy = document.getElementById("btnCopyPrompt");

    btnGenPrompt?.addEventListener("click", async () => {
      try {
        const templates = await templateService.getUserTemplates();
        // Filtramos solo las de seguridad media
        const validTemplates = templates.filter(
          (t) => t.securityLevel === "medium"
        );

        if (validTemplates.length === 0) {
          alert(
            "⚠️ No tienes plantillas de 'Seguridad Media' configuradas.\n\nEdita una plantilla y cambia su seguridad a Media para usarla con Gemini."
          );
          return;
        }

        // Construcción del Prompt Maestro
        let prompt = `Actúa como mi asistente personal para la App "Mi Gestión".\n`;
        prompt += `Tu objetivo es generar enlaces de acción rápida (Deep Links) cuando te pida guardar información.\n\n`;
        prompt += `FORMATO DEL ENLACE QUE DEBES GENERAR:\n`;
        // Asegúrate de poner tu URL real aquí si la tienes, o usa window.location.origin
        const appUrl = window.location.origin;
        prompt += `${appUrl}/?action=save&tid=[TEMPLATE_ID]&data=[JSON_URL_ENCODED]\n\n`;

        prompt += `MIS PLANTILLAS DISPONIBLES (Usa estos IDs exactos):\n`;

        validTemplates.forEach((t) => {
          prompt += `\n📌 Plantilla: "${t.name}" (ID: ${t.id})\n`;
          prompt += `   Campos:\n`;
          t.fields.forEach((f) => {
            prompt += `   - Etiqueta: "${f.label}" | ID: "${f.id}" | Tipo: ${f.type}\n`;
            // Si es tabla, detallamos columnas
            if (f.type === "table" && f.columns) {
              prompt += `     Columnas de la tabla (Array de objetos):\n`;
              f.columns.forEach((c) => {
                prompt += `       * "${c.label}" -> ID: "${c.id}"\n`;
              });
            }
          });
        });

        prompt += `\nEJEMPLO DE USO:\n`;
        prompt += `Si te digo "Guarda en Compras: Leche y Pan", y la plantilla tiene una tabla, genera:\n`;
        prompt += `https://.../?action=save&tid=...&data=%7B%22id_tabla%22%3A%5B%7B%22id_col_prod%22%3A%22Leche%22%7D%2C%7B%22id_col_prod%22%3A%22Pan%22%7D%5D%7D\n\n`;
        prompt += `INSTRUCCIÓN FINAL:\n`;
        prompt += `Solo responde con el enlace URL generado. No des explicaciones.`;

        output.value = prompt;
        resultArea.classList.remove("hidden");
      } catch (error) {
        console.error(error);
        alert("Error generando prompt: " + error.message);
      }
    });

    btnCopy?.addEventListener("click", () => {
      output.select();
      document.execCommand("copy");
      // Feedback visual simple
      const original = btnCopy.innerHTML;
      btnCopy.innerHTML = '<i class="fas fa-check"></i>';
      setTimeout(() => (btnCopy.innerHTML = original), 2000);
    });

    // --- 2. CAMBIO DE CLAVE DE ACCESO ---
    document
      .getElementById("changeAccessPassForm")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const current = document.getElementById("currentAccessPass").value;
        const newPass = document.getElementById("newAccessPass").value;
        try {
          const res = await authService.changeAccessPassword(newPass, current);
          if (res.success) {
            alert("✅ Clave de acceso actualizada correctamente.");
            e.target.reset();
          } else alert("❌ Error: " + res.error);
        } catch (err) {
          alert("Error de conexión");
        }
      });

    // --- 3. CAMBIO DE LLAVE MAESTRA ---
    document
      .getElementById("changeVaultPassForm")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!encryptionService.isReady()) {
          if (window.app && window.app.requireEncryption)
            window.app.requireEncryption(() =>
              document.getElementById("btnChangeVault").click()
            );
          return;
        }
        const newKey = document.getElementById("newVaultPass").value;
        const confirmKey = document.getElementById("confirmVaultPass").value;

        if (newKey !== confirmKey) return alert("Las llaves no coinciden.");
        if (newKey.length < 8) return alert("Mínimo 8 caracteres.");
        if (!confirm("⚠️ Se re-cifrarán todos tus documentos. ¿Continuar?"))
          return;

        const btn = document.getElementById("btnChangeVault");
        const originalContent = btn.innerHTML;
        btn.innerHTML =
          '<i class="fas fa-circle-notch fa-spin"></i> Re-cifrando...';
        btn.disabled = true;

        try {
          const { documentService } = await import(
            "../services/documents/index.js"
          );
          await documentService.reEncryptAllDocuments(newKey);
          alert("✅ Bóveda re-cifrada con éxito.");
          e.target.reset();
        } catch (err) {
          alert("❌ Error: " + err.message);
        } finally {
          btn.innerHTML = originalContent;
          btn.disabled = false;
        }
      });

    // --- 4. EXPORTAR/IMPORTAR ---
    document
      .getElementById("btnExport")
      ?.addEventListener("click", async () => {
        if (!encryptionService.isReady()) {
          if (window.app?.requireEncryption)
            window.app.requireEncryption(() =>
              document.getElementById("btnExport").click()
            );
          return;
        }
        try {
          await backupService.createBackup();
          alert("✅ Respaldo descargado.");
        } catch (e) {
          alert("Error: " + e.message);
        }
      });

    const fileInput = document.getElementById("fileImport");
    const btnRestore = document.getElementById("btnRestore");
    const statusDiv = document.getElementById("restoreStatus");

    fileInput?.addEventListener("change", () => {
      if (fileInput.files.length) {
        btnRestore.disabled = false;
        statusDiv.innerHTML = "Archivo seleccionado.";
      }
    });

    btnRestore?.addEventListener("click", async () => {
      if (!encryptionService.isReady()) {
        if (window.app?.requireEncryption)
          window.app.requireEncryption(() => btnRestore.click());
        return;
      }
      statusDiv.innerHTML = "Procesando...";
      btnRestore.disabled = true;
      try {
        const res = await backupService.restoreBackup(fileInput.files[0]);
        statusDiv.innerHTML = `✅ Restaurados ${res.docsRestored} docs.`;
        alert("Restauración completada.");
      } catch (e) {
        statusDiv.innerHTML = "❌ Error al restaurar.";
        alert(e.message);
      } finally {
        fileInput.value = "";
      }
    });
  }
}
