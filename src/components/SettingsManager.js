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
  setupEventListeners() {
    // ... Copia y pega tu lógica de listeners aquí ...
    // Si quieres te la escribo, pero es idéntica a la que me pasaste.
    // Solo asegúrate de que los IDs coincidan (btnChangeAccess, etc.), que SÍ coinciden en mi HTML nuevo.
    document
      .getElementById("changeAccessPassForm")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        // ... (Tu logica original)
        // Ejemplo breve:
        const current = document.getElementById("currentAccessPass").value;
        const newPass = document.getElementById("newAccessPass").value;
        try {
          await authService.changeAccessPassword(newPass, current);
          alert("Clave actualizada");
          e.target.reset();
        } catch (err) {
          alert(err.message);
        }
      });

    // ... Lo mismo para changeVaultPassForm, btnExport y btnRestore ...
    // La lógica JS es 100% compatible.
    document
      .getElementById("changeVaultPassForm")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        // ... tu lógica de re-encryption ...
      });
    document
      .getElementById("btnExport")
      ?.addEventListener("click", async () => {
        // ... tu lógica de export ...
      });

    const fileInput = document.getElementById("fileImport");
    const btnRestore = document.getElementById("btnRestore");
    const statusDiv = document.getElementById("restoreStatus");

    fileInput?.addEventListener("change", () => {
      if (fileInput.files.length) btnRestore.disabled = false;
    });

    btnRestore?.addEventListener("click", async () => {
      // ... tu lógica de restore ...
    });
  }
}
