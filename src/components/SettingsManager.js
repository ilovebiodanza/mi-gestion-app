// src/components/SettingsManager.js
import { backupService } from "../services/backup/index.js";
import { authService } from "../services/auth.js";

export class SettingsManager {
  render() {
    return `
      <div class="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
        
        <div class="flex items-center space-x-4 mb-8">
          <div class="p-3 bg-white rounded-xl shadow-sm border border-slate-100">
             <i class="fas fa-sliders-h text-2xl text-slate-700"></i>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-slate-800">Panel de Control</h2>
            <p class="text-slate-500">Seguridad, respaldos y configuración de cuenta.</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div class="p-6 sm:p-8">
            <div class="flex items-start justify-between mb-4">
                <div>
                    <h3 class="text-lg font-bold text-slate-800 flex items-center">
                        <i class="fas fa-cloud-download-alt mr-2 text-primary"></i>
                        Exportar Datos Seguros
                    </h3>
                    <p class="text-slate-500 text-sm mt-1">Descarga un archivo cifrado con toda tu información.</p>
                </div>
            </div>
            
            <div class="bg-blue-50/50 border border-blue-100 p-4 rounded-xl mb-6 flex gap-3">
              <i class="fas fa-info-circle text-blue-500 mt-1 flex-shrink-0"></i>
              <div class="text-sm text-blue-800">
                <p class="font-bold mb-1">Nota de Seguridad:</p>
                <p>Este archivo <strong>solo funciona con tu contraseña actual</strong>. Si cambias tu contraseña, deberás generar un nuevo respaldo inmediatamente.</p>
              </div>
            </div>

            <button id="btnExport" class="w-full sm:w-auto px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:text-primary hover:border-primary/50 font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2">
              <i class="fas fa-file-export"></i>
              <span>Generar Respaldo (.json)</span>
            </button>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div class="p-6 sm:p-8">
            <h3 class="text-lg font-bold text-slate-800 flex items-center mb-2">
                <i class="fas fa-history mr-2 text-indigo-500"></i>
                Restaurar Copia de Seguridad
            </h3>
            <p class="text-slate-500 text-sm mb-6">Importa datos desde un archivo generado previamente. Se fusionarán con tus datos actuales.</p>

            <div class="bg-slate-50 rounded-xl p-6 border border-dashed border-slate-300">
                <div class="flex flex-col sm:flex-row items-center gap-4">
                  <input type="file" id="fileImport" accept=".json"
                    class="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2.5 file:px-4
                      file:rounded-xl file:border-0
                      file:text-sm file:font-semibold
                      file:bg-indigo-50 file:text-indigo-700
                      hover:file:bg-indigo-100
                      cursor-pointer
                    "
                  />
                  <button id="btnRestore" disabled class="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 whitespace-nowrap">
                    <i class="fas fa-upload"></i>
                    <span>Restaurar</span>
                  </button>
                </div>
                <div id="restoreStatus" class="mt-4 hidden"></div>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div class="p-6 sm:p-8">
            <h3 class="text-lg font-bold text-slate-800 flex items-center mb-2">
                <i class="fas fa-shield-alt mr-2 text-amber-500"></i>
                Cambio de Contraseña Maestra
            </h3>
            <p class="text-slate-500 text-sm mb-6">Actualiza la llave que cifra todos tus documentos.</p>

            <div class="bg-amber-50 border border-amber-100 p-4 rounded-xl mb-6 flex gap-3">
              <i class="fas fa-exclamation-triangle text-amber-500 mt-1 flex-shrink-0"></i>
              <div class="text-sm text-amber-800">
                 <p class="font-bold mb-1">¡Advertencia Crítica!</p>
                 <p>Al cambiar la contraseña, <strong>los respaldos anteriores quedarán inservibles permanentemente</strong>. Asegúrate de recordar la nueva clave, ya que no podemos recuperarla por ti.</p>
              </div>
            </div>

            <form id="changePasswordForm" class="space-y-5 max-w-md">
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Contraseña Actual</label>
                <input type="password" id="currentPassword" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition" required>
              </div>
              <div class="pt-2">
                <label class="block text-sm font-bold text-slate-700 mb-1">Nueva Contraseña</label>
                <input type="password" id="newPassword" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition" placeholder="Mínimo 8 caracteres" required minlength="8">
              </div>
              <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Confirmar Nueva</label>
                <input type="password" id="confirmNewPassword" class="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition" required>
              </div>
              
              <button type="submit" id="btnChangePass" class="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 mt-2">
                Actualizar Contraseña
              </button>
            </form>
          </div>
        </div>

      </div>
    `;
  }

  setupEventListeners() {
    // 1. Exportar
    document
      .getElementById("btnExport")
      ?.addEventListener("click", async () => {
        const btn = document.getElementById("btnExport");
        const originalContent = btn.innerHTML;
        try {
          btn.innerHTML =
            '<i class="fas fa-spinner fa-spin mr-2"></i> Procesando...';
          btn.disabled = true;
          const result = await backupService.createBackup();
          alert(
            `✅ Respaldo creado (${result.count} docs).\nRecuerda: Solo válido con tu contraseña actual.`
          );
        } catch (e) {
          alert("Error: " + e.message);
        } finally {
          btn.innerHTML = originalContent;
          btn.disabled = false;
        }
      });

    // 2. Importar
    const fileInput = document.getElementById("fileImport");
    const btnRestore = document.getElementById("btnRestore");

    fileInput?.addEventListener("change", () => {
      btnRestore.disabled = fileInput.files.length === 0;
    });

    btnRestore?.addEventListener("click", async () => {
      if (fileInput.files.length === 0) return;
      const statusDiv = document.getElementById("restoreStatus");
      statusDiv.classList.remove("hidden");
      statusDiv.innerHTML =
        '<p class="text-indigo-600 font-medium animate-pulse"><i class="fas fa-circle-notch fa-spin mr-2"></i> Restaurando datos...</p>';
      btnRestore.disabled = true;

      try {
        const result = await backupService.restoreBackup(fileInput.files[0]);
        statusDiv.innerHTML = `<div class="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-100 flex items-center"><i class="fas fa-check-circle mr-2 text-xl"></i><div><p class="font-bold">¡Éxito!</p><p class="text-sm">Restaurados ${result.docsRestored} documentos.</p></div></div>`;
        fileInput.value = "";
      } catch (e) {
        statusDiv.innerHTML = `<div class="bg-red-50 text-red-700 p-3 rounded-xl border border-red-100"><p class="font-bold"><i class="fas fa-times-circle mr-1"></i> Falló la restauración</p><p class="text-xs mt-1">${e.message}</p></div>`;
      } finally {
        if (fileInput.files.length > 0) btnRestore.disabled = false;
      }
    });

    // 3. Password
    const passForm = document.getElementById("changePasswordForm");
    passForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const current = document.getElementById("currentPassword").value;
      const newP = document.getElementById("newPassword").value;
      const confirmP = document.getElementById("confirmNewPassword").value;

      if (newP !== confirmP) return alert("Las contraseñas no coinciden");
      if (
        !confirm(
          "⚠️ ¿Seguro que quieres cambiar la contraseña?\n\nTus respaldos viejos dejarán de funcionar."
        )
      )
        return;

      const btn = document.getElementById("btnChangePass");
      const orig = btn.innerHTML;
      btn.innerHTML = "Procesando...";
      btn.disabled = true;

      try {
        const res = await authService.changePassword(newP, current);
        if (res.success) {
          alert("✅ Contraseña cambiada. Crea un nuevo respaldo ahora.");
          passForm.reset();
        } else alert("Error: " + res.error);
      } catch (err) {
        alert("Error: " + err.message);
      } finally {
        btn.innerHTML = orig;
        btn.disabled = false;
      }
    });
  }
}
