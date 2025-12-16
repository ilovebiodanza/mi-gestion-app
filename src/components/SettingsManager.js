// src/components/SettingsManager.js
import { backupService } from "../services/backup/index.js";
import { authService } from "../services/auth.js";
import { encryptionService } from "../services/encryption/index.js";

export class SettingsManager {
  render() {
    return `
      <div class="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
        
        <div class="mb-8">
            <h2 class="text-2xl font-bold text-slate-900 tracking-tight">Configuración de Seguridad</h2>
            <p class="text-slate-500 text-sm">Gestiona tus claves de acceso y cifrado.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm border border-blue-100">
                        <i class="fas fa-user-lock"></i>
                    </div>
                    <h3 class="font-bold text-slate-800 text-sm">Acceso (Login)</h3>
                </div>
                <div class="p-6">
                    <form id="changeAccessPassForm" class="space-y-4">
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Contraseña Actual</label>
                            <input type="password" id="currentAccessPass" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" required>
                        </div>
                        <div>
                            <label class="block text-xs font-bold text-slate-500 uppercase mb-1">Nueva Contraseña</label>
                            <input type="password" id="newAccessPass" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm" required minlength="6">
                        </div>
                        <button type="submit" id="btnChangeAccess" class="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition text-sm shadow-sm">
                            Actualizar Login
                        </button>
                    </form>
                </div>
            </div>

            <div class="bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden relative">
                <div class="px-6 py-4 border-b border-amber-100 bg-amber-50/30 flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-sm border border-amber-200">
                        <i class="fas fa-key"></i>
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-800 text-sm">Llave Maestra (E2EE)</h3>
                    </div>
                </div>
                <div class="p-6">
                    <p class="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100 mb-4 leading-relaxed font-medium">
                        <i class="fas fa-exclamation-triangle mr-1"></i> Cambiar esto re-cifrará todos tus documentos.
                    </p>
                    
                    <form id="changeVaultPassForm" class="space-y-4">
                        <div>
                            <input type="password" id="currentVaultPass" placeholder="Llave Actual" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm font-mono" required>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <input type="password" id="newVaultPass" placeholder="Nueva Llave" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm font-mono" required minlength="8">
                            <input type="password" id="confirmVaultPass" placeholder="Confirmar" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none text-sm font-mono" required>
                        </div>
                        <button type="submit" id="btnChangeVault" class="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition text-sm shadow-sm">
                            Re-Cifrar Bóveda
                        </button>
                    </form>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <i class="fas fa-database text-slate-400"></i> Respaldo y Restauración
                </h3>
            </div>
            
            <div class="p-6 flex flex-col sm:flex-row gap-6 items-center">
                <div class="flex-1 w-full">
                    <button id="btnExport" class="w-full py-3 bg-white border border-slate-200 text-slate-700 hover:border-brand-500 hover:text-brand-600 font-bold rounded-lg transition-all text-sm flex items-center justify-center gap-2 group">
                        <span class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-brand-50 transition-colors"><i class="fas fa-download text-xs"></i></span>
                        Descargar Copia Cifrada
                    </button>
                    <p class="text-[10px] text-slate-400 text-center mt-2">Formato JSON seguro</p>
                </div>

                <div class="h-px w-full sm:w-px sm:h-12 bg-slate-200"></div>

                <div class="flex-1 w-full">
                    <div class="flex gap-2">
                        <input type="file" id="fileImport" accept=".json" class="hidden" />
                        <button onclick="document.getElementById('fileImport').click()" class="flex-1 py-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold rounded-lg transition text-sm">
                            Elegir Archivo
                        </button>
                        <button id="btnRestore" disabled class="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition text-sm">
                            Restaurar
                        </button>
                    </div>
                    <div id="restoreStatus" class="mt-2 text-[10px] text-center min-h-[1.2em]"></div>
                </div>
            </div>
        </div>
      </div>
    `;
  }
  // (Mantén los setupEventListeners exactamente igual que tu código original, la lógica no cambia)
  // 🚨 ESTA ES LA FUNCIÓN CRÍTICA QUE ESTABA INCOMPLETA 🚨
  setupEventListeners() {
    const fileInput = document.getElementById("fileImport");
    const btnRestore = document.getElementById("btnRestore");
    const btnExport = document.getElementById("btnExport");
    const btnChooseFile = document.getElementById("btnChooseFile");
    const statusDiv = document.getElementById("restoreStatus");

    // --- 1. Exportar / Descargar ---
    btnExport?.addEventListener("click", async () => {
      if (!encryptionService.isReady()) {
        if (window.app && window.app.requireEncryption) {
          window.app.requireEncryption(async () => {
            await this._handleExport(btnExport);
          });
          return;
        }
      }
      await this._handleExport(btnExport);
    });

    // --- 2. Elegir Archivo ---
    btnChooseFile?.addEventListener("click", () => fileInput.click());

    fileInput?.addEventListener("change", () => {
      if (fileInput.files.length) {
        btnRestore.disabled = false;
        statusDiv.textContent = `Archivo cargado: ${fileInput.files[0].name}`;
      } else {
        btnRestore.disabled = true;
        statusDiv.textContent = "";
      }
    });

    // --- 3. Restaurar / Importar ---
    btnRestore?.addEventListener("click", async () => {
      const file = fileInput.files[0];
      if (!file) return;

      if (!encryptionService.isReady()) {
        toast.show(
          "Bóveda bloqueada. Ingresa tu clave maestra primero.",
          "error"
        );
        return;
      }

      // Desactivar botones durante la restauración
      btnRestore.disabled = true;
      btnExport.disabled = true;
      statusDiv.textContent = "Procesando restauración...";

      try {
        const result = await backupService.restoreBackup(file);

        toast.show(
          `✅ Restauración exitosa: ${result.docsRestored} docs y ${result.templatesRestored} plantillas.`,
          "success"
        );

        // Redirigir al dashboard para ver los cambios
        window.location.reload();
      } catch (error) {
        console.error("Error de restauración:", error);

        if (error.type === "KEY_MISMATCH") {
          // El archivo está cifrado con una clave diferente
          // Lógica avanzada: Aquí deberías solicitar la clave antigua (Legacy Password)
          // Pero por simplicidad, ahora solo mostramos el error
          toast.show(
            "❌ Fallo de cifrado. Este respaldo usa una Llave Maestra diferente. Intenta cambiar tu llave maestra primero.",
            "error"
          );
        } else {
          toast.show(
            error.message || "❌ Error desconocido al restaurar el archivo.",
            "error"
          );
        }
      } finally {
        btnRestore.disabled = false;
        btnExport.disabled = false;
        statusDiv.textContent = "";
      }
    });

    // --- 4. Formulario de Cambio de Contraseña de Acceso (Login) ---
    document
      .getElementById("changeAccessPassForm")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const currentPass = document.getElementById("currentAccessPass").value;
        const newPass = document.getElementById("newAccessPass").value;

        try {
          // Asume que authService tiene un método changeAccessPassword
          await authService.changeAccessPassword(newPass, currentPass);
          toast.show(
            "✅ Contraseña de acceso actualizada. Vuelve a iniciar sesión.",
            "success"
          );
          authService.logout(); // Fuerza el re-login
        } catch (err) {
          toast.show(
            err.message || "❌ Error al actualizar contraseña de acceso",
            "error"
          );
        }
      });

    // --- 5. Formulario de Re-Cifrado (Llave Maestra) ---
    document
      .getElementById("changeVaultPassForm")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const currentVaultPass =
          document.getElementById("currentVaultPass").value;
        const newVaultPass = document.getElementById("newVaultPass").value;
        const confirmVaultPass =
          document.getElementById("confirmVaultPass").value;

        if (newVaultPass !== confirmVaultPass) {
          toast.show("Las nuevas llaves maestras no coinciden.", "error");
          return;
        }

        const btn = document.getElementById("btnChangeVault");
        btn.disabled = true;
        btn.textContent = "Re-cifrando...";

        try {
          // Asume que un servicio gestiona el re-cifrado
          // Esto requiere: 1. Validar la llave actual. 2. Re-derivar Salt/Verifier. 3. Re-cifrar TODOS los documentos.
          await authService.reEncryptVault(currentVaultPass, newVaultPass);

          toast.show(
            "✅ ¡Bóveda re-cifrada con éxito! La nueva llave maestra está activa.",
            "success"
          );

          // Forzar el re-lock de la bóveda para usar la nueva clave
          encryptionService.lock();
          window.location.reload();
        } catch (err) {
          toast.show(
            err.message || "❌ Error en el re-cifrado de la bóveda.",
            "error"
          );
        } finally {
          btn.disabled = false;
          btn.textContent = "Re-Cifrar Bóveda";
        }
      });
  }

  // Helper para manejar la exportación (con o sin re-prompt de encriptación)
  async _handleExport(btn) {
    if (!encryptionService.isReady()) {
      toast.show(
        "Bóveda bloqueada. Ingresa tu clave maestra para exportar.",
        "error"
      );
      return;
    }

    btn.disabled = true;
    btn.innerHTML =
      '<span class="w-4 h-4 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-brand-50 transition-colors"><i class="fas fa-spinner fa-spin text-xs"></i></span> Descargando...';

    try {
      const result = await backupService.createBackup();
      toast.show(`✅ Respaldo creado: ${result.count} documentos.`, "success");
    } catch (e) {
      console.error("Export Error:", e);
      toast.show("❌ Error al generar el respaldo.", "error");
    } finally {
      btn.disabled = false;
      btn.innerHTML =
        '<span class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-brand-50 transition-colors"><i class="fas fa-download text-xs"></i></span> Descargar Copia Cifrada';
    }
  }
}
