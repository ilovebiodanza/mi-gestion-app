// src/components/AuthForms.js
import { authService } from "../services/auth.js";

export class AuthForms {
  constructor(onAuthSuccess) {
    this.onAuthSuccess = onAuthSuccess;
    this.currentForm = "login";
  }

  // --- HTML TEMPLATES ---

  renderLoginForm() {
    return `
      <div class="animate-fade-in space-y-6">
        <form id="loginForm" class="space-y-5">
          <div>
            <label for="loginEmail" class="block text-sm font-semibold text-slate-700 mb-1.5">Correo Electrónico</label>
            <input type="email" id="loginEmail" required 
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-slate-700 placeholder-slate-400"
              placeholder="nombre@ejemplo.com" />
          </div>

          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label for="loginPassword" class="block text-sm font-semibold text-slate-700">Contraseña</label>
              <button type="button" id="forgotPasswordBtn" class="text-xs font-medium text-primary hover:text-primary-hover underline-offset-2 hover:underline">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <input type="password" id="loginPassword" required 
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-slate-700"
              placeholder="••••••••" />
          </div>

          <button type="submit" class="w-full py-3.5 px-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-2">
            <span>Iniciar Sesión</span>
            <svg class="w-5 h-5 text-white hidden animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </button>
        </form>

        <div class="relative">
           <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-slate-200"></div></div>
           <div class="relative flex justify-center text-sm"><span class="px-2 bg-white text-slate-400">O</span></div>
        </div>

        <div class="text-center">
          <p class="text-slate-600 text-sm">
            ¿Aún no tienes cuenta?
            <button id="switchToRegister" class="text-primary font-bold hover:underline ml-1">Crear cuenta gratis</button>
          </p>
        </div>
      </div>
    `;
  }

  renderRegisterForm() {
    return `
      <div class="animate-fade-in space-y-6">
        <form id="registerForm" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">Correo Electrónico</label>
            <input type="email" id="registerEmail" required 
               class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-success focus:border-transparent transition-all outline-none" placeholder="tu@email.com" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-slate-700 mb-1.5">Contraseña</label>
              <input type="password" id="registerPassword" required minlength="8"
                 class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-success focus:border-transparent transition-all outline-none" placeholder="Min 8 chars" />
            </div>
            <div>
               <label class="block text-sm font-semibold text-slate-700 mb-1.5">Confirmar</label>
               <input type="password" id="registerConfirmPassword" required
                  class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-success focus:border-transparent transition-all outline-none" placeholder="Repetir" />
            </div>
          </div>

          <div class="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-3 items-start">
             <i class="fas fa-shield-alt text-primary mt-1"></i>
             <p class="text-xs text-blue-800 leading-relaxed">
               <strong>Importante:</strong> Tu contraseña se usará para generar tu llave de encriptación. <br>Si la olvidas, tus datos no podrán ser recuperados por nadie (ni por nosotros).
             </p>
          </div>

          <button type="submit" class="w-full py-3.5 px-4 bg-success hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-2">
            <span>Registrarse Seguro</span>
            <svg class="w-5 h-5 text-white hidden animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </button>
        </form>

        <div class="text-center pt-2">
          <p class="text-slate-600 text-sm">
            ¿Ya tienes cuenta?
            <button id="switchToLogin" class="text-primary font-bold hover:underline ml-1">Iniciar Sesión</button>
          </p>
        </div>
      </div>
    `;
  }

  renderForgotPasswordForm() {
    return `
      <div class="animate-fade-in space-y-6">
        <div class="text-center mb-6">
           <div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
             <i class="fas fa-key text-yellow-600 text-xl"></i>
           </div>
           <h3 class="font-bold text-slate-800">Recuperación de Cuenta</h3>
        </div>

        <form id="forgotPasswordForm" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-1.5">Correo registrado</label>
            <input type="email" id="resetEmail" required 
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-500 transition-all outline-none" placeholder="tu@email.com" />
          </div>

          <div class="bg-yellow-50 border border-yellow-100 rounded-xl p-3 flex gap-3">
            <i class="fas fa-exclamation-circle text-yellow-600 mt-0.5"></i>
            <p class="text-xs text-yellow-800">
              Al resetear tu contraseña, perderás acceso a los documentos cifrados con la contraseña anterior.
            </p>
          </div>

          <div class="flex gap-3">
            <button type="button" id="cancelReset" class="flex-1 py-3 px-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">
              Cancelar
            </button>
            <button type="submit" class="flex-1 py-3 px-4 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 shadow-lg transition-all flex items-center justify-center gap-2">
              <span>Enviar Link</span>
              <svg class="w-5 h-5 text-white hidden animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            </button>
          </div>
        </form>
      </div>
    `;
  }

  // --- LOGIC & LISTENERS (Igual lógica, selectores actualizados) ---

  render() {
    switch (this.currentForm) {
      case "login":
        return this.renderLoginForm();
      case "register":
        return this.renderRegisterForm();
      case "forgot":
        return this.renderForgotPasswordForm();
      default:
        return this.renderLoginForm();
    }
  }

  setupEventListeners(container) {
    this.setupRealTimeValidation(container);
    switch (this.currentForm) {
      case "login":
        this.setupLoginListeners(container);
        break;
      case "register":
        this.setupRegisterListeners(container);
        break;
      case "forgot":
        this.setupForgotPasswordListeners(container);
        break;
    }
  }

  setupLoginListeners(container) {
    const loginForm = container.querySelector("#loginForm");
    const switchToRegister = container.querySelector("#switchToRegister");
    const forgotPasswordBtn = container.querySelector("#forgotPasswordBtn");

    if (loginForm)
      loginForm.addEventListener("submit", this.handleLogin.bind(this));
    if (switchToRegister) {
      switchToRegister.addEventListener("click", () => {
        this.currentForm = "register";
        this.updateView(container);
      });
    }
    if (forgotPasswordBtn) {
      forgotPasswordBtn.addEventListener("click", () => {
        this.currentForm = "forgot";
        this.updateView(container);
      });
    }
  }

  setupRegisterListeners(container) {
    const registerForm = container.querySelector("#registerForm");
    const switchToLogin = container.querySelector("#switchToLogin");

    if (registerForm)
      registerForm.addEventListener("submit", this.handleRegister.bind(this));
    if (switchToLogin) {
      switchToLogin.addEventListener("click", () => {
        this.currentForm = "login";
        this.updateView(container);
      });
    }
  }

  setupForgotPasswordListeners(container) {
    const forgotPasswordForm = container.querySelector("#forgotPasswordForm");
    const cancelReset = container.querySelector("#cancelReset");

    if (forgotPasswordForm)
      forgotPasswordForm.addEventListener(
        "submit",
        this.handleForgotPassword.bind(this)
      );
    if (cancelReset) {
      cancelReset.addEventListener("click", () => {
        this.currentForm = "login";
        this.updateView(container);
      });
    }
  }

  // --- HANDLERS ---

  async handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) return this.showError("Credenciales incompletas");

    this.showLoading(true);
    try {
      const result = await authService.login(email, password);
      if (result.success) {
        if (window.app && window.app.initializePostLogin) {
          window.app.initializePostLogin(result.user, password);
        }
      } else {
        this.showError(result.error || "Error al iniciar sesión");
        this.showLoading(false);
      }
    } catch (error) {
      console.error(error);
      this.showError("Error de conexión");
      this.showLoading(false);
    }
  }

  async handleRegister(event) {
    event.preventDefault();
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById(
      "registerConfirmPassword"
    ).value;

    if (!email || !password || !confirmPassword)
      return this.showError("Faltan datos");
    if (password !== confirmPassword)
      return this.showError("Las contraseñas no coinciden");
    if (password.length < 8)
      return this.showError("Mínimo 8 caracteres requeridos");

    this.showLoading(true);
    try {
      const result = await authService.register(email, password);
      if (!result.success) {
        this.showError(result.error || "Error en registro");
        this.showLoading(false);
      }
    } catch (error) {
      this.showError("Error inesperado");
      this.showLoading(false);
    }
  }

  async handleForgotPassword(event) {
    event.preventDefault();
    const email = document.getElementById("resetEmail").value;
    if (!email) return this.showError("Ingresa tu email");

    this.showLoading(true);
    try {
      const result = await authService.resetPassword(email);
      if (result.success) {
        this.showMessage(result.message, "success");
        setTimeout(() => {
          this.currentForm = "login";
          this.updateView(document.getElementById("authContainer"));
        }, 3500);
      } else {
        this.showError(result.error);
        this.showLoading(false);
      }
    } catch (error) {
      this.showError("Error al enviar solicitud");
      this.showLoading(false);
    }
  }

  // --- UI HELPERS ---

  updateView(container) {
    if (container) {
      container.innerHTML = this.render();
      this.setupEventListeners(container);
    }
  }

  showLoading(show) {
    const btn = document.querySelector('#authContainer button[type="submit"]');
    if (!btn) return;

    const spinner = btn.querySelector("svg");
    const text = btn.querySelector("span");

    if (show) {
      btn.disabled = true;
      btn.classList.add("opacity-80", "cursor-not-allowed");
      if (spinner) spinner.classList.remove("hidden");
      if (text) text.innerText = "Procesando...";
    } else {
      btn.disabled = false;
      btn.classList.remove("opacity-80", "cursor-not-allowed");
      if (spinner) spinner.classList.add("hidden");
      if (text)
        text.innerText =
          this.currentForm === "login"
            ? "Iniciar Sesión"
            : this.currentForm === "register"
            ? "Registrarse Seguro"
            : "Enviar Link";
    }

    // Disable inputs
    document.querySelectorAll("#authContainer input").forEach((input) => {
      input.disabled = show;
      if (show) input.classList.add("bg-slate-100", "text-slate-400");
      else input.classList.remove("bg-slate-100", "text-slate-400");
    });
  }

  showError(message, duration = 4000) {
    this.clearMessages();
    const div = document.createElement("div");
    div.className =
      "error-message mb-5 p-4 rounded-xl bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium flex items-center animate-pulse";
    div.innerHTML = `<i class="fas fa-exclamation-triangle mr-3 text-red-500 text-lg"></i> ${message}`;
    this.injectMessage(div, duration);
  }

  showMessage(message, type = "success", duration = 4000) {
    this.clearMessages();
    const div = document.createElement("div");
    div.className = `success-message mb-5 p-4 rounded-xl bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-sm font-medium flex items-center animate-bounce-in`;
    div.innerHTML = `<i class="fas fa-check-circle mr-3 text-emerald-500 text-lg"></i> ${message}`;
    this.injectMessage(div, duration);
  }

  injectMessage(element, duration) {
    const form = document.querySelector("#authContainer form");
    if (form) {
      form.parentElement.insertBefore(element, form);
      if (duration > 0) setTimeout(() => element.remove(), duration);
    }
  }

  clearMessages() {
    document
      .querySelectorAll(".error-message, .success-message")
      .forEach((el) => el.remove());
  }

  setupRealTimeValidation(container) {
    container.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => {
        input.classList.remove("ring-2", "ring-red-500", "bg-red-50");
      });
    });
  }
}
