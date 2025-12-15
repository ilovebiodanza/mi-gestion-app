// src/components/VaultSetupModal.js

export class VaultSetupModal {
  constructor(onSuccess) {
    this.onSuccess = onSuccess;
  }

  show() {
    // Verificar si ya existe para no duplicar
    if (document.getElementById("vaultSetupModal")) return;

    const modalHtml = `
      <div id="vaultSetupModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity opacity-0" id="vsmBackdrop"></div>
        
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform scale-95 opacity-0 transition-all duration-300" id="vsmCard">
          
          <div class="bg-slate-50 px-8 py-6 border-b border-slate-100 flex flex-col items-center text-center">
            <div class="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm mb-4 text-amber-500 text-2xl">
              <i class="fas fa-key"></i>
            </div>
            <h2 class="text-xl font-bold text-slate-900">Configura tu Bóveda</h2>
            <p class="text-sm text-slate-500 mt-2 leading-relaxed">
              Crea una <strong>Llave Maestra</strong> única. Esta contraseña cifrará tus documentos y <span class="text-red-500 font-semibold">nosotros no podemos recuperarla</span> si la olvidas.
            </p>
          </div>

          <div class="p-8">
            <form id="vaultSetupForm" class="space-y-5">
              
              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-500 uppercase ml-1">Nueva Llave Maestra</label>
                <div class="relative">
                    <input type="password" id="vsPassword" 
                      class="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-mono text-sm text-slate-800"
                      placeholder="Mínimo 8 caracteres" required minlength="8">
                    <i class="fas fa-lock absolute right-4 top-3.5 text-slate-400 text-sm"></i>
                </div>
              </div>

              <div class="space-y-1">
                <label class="text-xs font-bold text-slate-500 uppercase ml-1">Confirmar Llave</label>
                <div class="relative">
                    <input type="password" id="vsConfirm" 
                      class="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all font-mono text-sm text-slate-800"
                      placeholder="Repite la contraseña" required>
                    <i class="fas fa-check absolute right-4 top-3.5 text-slate-400 text-sm"></i>
                </div>
              </div>

              <div class="pt-2">
                <button type="submit" id="btnSetupVault" 
                  class="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 transition-all transform active:scale-[0.98] flex justify-center items-center gap-2">
                  <span>Activar Cifrado E2EE</span>
                  <i class="fas fa-shield-alt"></i>
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Animación de entrada
    requestAnimationFrame(() => {
      const backdrop = document.getElementById("vsmBackdrop");
      const card = document.getElementById("vsmCard");
      if (backdrop && card) {
        backdrop.classList.remove("opacity-0");
        card.classList.remove("scale-95", "opacity-0");
        card.classList.add("scale-100", "opacity-100");
      }
    });

    this.setupListeners();
  }

  setupListeners() {
    const form = document.getElementById("vaultSetupForm");

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const p1 = document.getElementById("vsPassword").value;
      const p2 = document.getElementById("vsConfirm").value;

      if (p1 !== p2) {
        alert("Las contraseñas no coinciden.");
        return;
      }

      if (p1.length < 8) {
        alert("La contraseña es muy corta (mínimo 8 caracteres).");
        return;
      }

      // Estado de carga
      const btn = document.getElementById("btnSetupVault");
      const original = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> Configurando...`;

      try {
        const { authService } = await import("../services/auth.js");

        // Inicializar cifrado
        await authService.initializeEncryption(p1);

        // Marcar como configurado en Firebase
        await authService.markVaultAsConfigured();

        this.close();
        this.onSuccess();
      } catch (error) {
        console.error(error);
        alert("Error configurando bóveda: " + error.message);
        btn.disabled = false;
        btn.innerHTML = original;
      }
    });
  }

  close() {
    const modal = document.getElementById("vaultSetupModal");
    if (modal) modal.remove();
  }
}
