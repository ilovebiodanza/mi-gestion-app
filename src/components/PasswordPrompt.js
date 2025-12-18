// src/components/PasswordPrompt.js

export class PasswordPrompt {
  constructor(onSubmit, email) {
    this.onSubmit = onSubmit;
    this.email = email || "Usuario";
  }

  show() {
    if (document.getElementById("passwordPromptModal")) return;

    // ESTRATEGIA ANTI-GESTOR DE CONTRASEÑAS:
    // 1. autocomplete="off" en el form.
    // 2. name="vault_unlock_code" en el input (evita nombres como 'password' o 'login').
    // 3. autocomplete="new-password" (a veces engaña al navegador pensando que es un registro, no un login).

    const modalHtml = `
      <div id="passwordPromptModal" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity opacity-0" id="ppmBackdrop"></div>
        
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform scale-95 opacity-0 transition-all duration-200" id="ppmCard">
          
          <div class="p-6 text-center">
            <div class="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600 border border-slate-200">
              <i class="fas fa-lock text-xl"></i>
            </div>
            
            <h3 class="text-lg font-bold text-slate-900">Seguridad Requerida</h3>
            <p class="text-sm text-slate-500 mt-1 mb-6">
              Ingresa tu <strong>Llave Maestra</strong> para descifrar los datos de <span class="font-medium text-slate-700">${this.email}</span>.
            </p>

            <form id="passwordPromptForm" autocomplete="off">
              <div class="relative mb-4 group text-left">
                
                <input type="password" id="ppmPassword" name="vault_unlock_code"
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10 outline-none transition-all font-mono text-sm text-center tracking-widest text-slate-800 placeholder-slate-400 pr-10"
                  placeholder="••••••••" required autofocus autocomplete="off" spellcheck="false">
                
                <button type="button" id="ppmTogglePass" class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-slate-400 hover:text-brand-600 transition-colors focus:outline-none" tabindex="-1">
                    <i class="fas fa-eye"></i>
                </button>

              </div>

              <div id="ppmError" class="hidden text-xs text-red-500 font-bold mb-3 bg-red-50 py-2 rounded-lg border border-red-100 text-center">
                <i class="fas fa-times-circle mr-1"></i> Contraseña incorrecta
              </div>

              <button type="submit" id="ppmSubmitBtn"
                class="w-full py-3 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
                <span>Desbloquear</span>
                <i class="fas fa-arrow-right text-xs"></i>
              </button>
            </form>
          </div>
          
          <div class="bg-slate-50 py-3 text-center border-t border-slate-100">
             <button id="ppmCancelBtn" class="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wide transition-colors">
               Cancelar
             </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Animación de entrada
    requestAnimationFrame(() => {
      document.getElementById("ppmBackdrop").classList.remove("opacity-0");
      const card = document.getElementById("ppmCard");
      card.classList.remove("scale-95", "opacity-0");
      card.classList.add("scale-100", "opacity-100");
      document.getElementById("ppmPassword").focus();
    });

    this.setupListeners();
  }

  setupListeners() {
    const form = document.getElementById("passwordPromptForm");
    const passwordInput = document.getElementById("ppmPassword"); // Elemento Input
    const toggleBtn = document.getElementById("ppmTogglePass"); // Elemento Botón Ojo
    const errorMsg = document.getElementById("ppmError");
    const btn = document.getElementById("ppmSubmitBtn");
    const cancelBtn = document.getElementById("ppmCancelBtn");

    const close = () => {
      document.getElementById("passwordPromptModal")?.remove();
    };

    // 1. Lógica del Ojito (Ver/Ocultar)
    if (toggleBtn && passwordInput) {
      toggleBtn.onclick = (e) => {
        e.preventDefault(); // Evita submit accidental
        e.stopPropagation(); // Evita propagación

        const type =
          passwordInput.getAttribute("type") === "password"
            ? "text"
            : "password";
        passwordInput.setAttribute("type", type);

        const icon = toggleBtn.querySelector("i");
        // Usamos las clases de FontAwesome para ojo abierto/tachado
        icon.classList.toggle("fa-eye");
        icon.classList.toggle("fa-eye-slash");

        // Mantener el foco en el input para seguir escribiendo
        passwordInput.focus();
      };
    }

    cancelBtn?.addEventListener("click", close);

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const password = passwordInput.value;

      // UI Loading
      const originalText = btn.innerHTML;
      btn.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> Verificando...`;
      btn.disabled = true;
      errorMsg.classList.add("hidden");

      try {
        const success = await this.onSubmit(password);
        if (success) {
          close();
        } else {
          // Error visual shake
          const card = document.getElementById("ppmCard");
          card.classList.add("animate-pulse");
          errorMsg.classList.remove("hidden");
          passwordInput.value = "";
          passwordInput.focus();

          // Reset UI
          btn.innerHTML = originalText;
          btn.disabled = false;
          setTimeout(() => card.classList.remove("animate-pulse"), 500);
        }
      } catch (err) {
        console.error(err);
        errorMsg.textContent = "Error del sistema";
        errorMsg.classList.remove("hidden");
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    });
  }
}
