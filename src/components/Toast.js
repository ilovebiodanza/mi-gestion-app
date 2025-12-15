// src/components/Toast.js

class ToastManager {
  constructor() {
    this.container = null;
    this.queue = [];
    this.isShowing = false;
  }

  createContainer() {
    if (document.getElementById("toast-container")) return;

    // Contenedor fijo en esquina inferior derecha (o superior centro en móvil)
    const div = document.createElement("div");
    div.id = "toast-container";
    div.className =
      "fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3 pointer-events-none sm:bottom-6 sm:right-6 top-4 right-4 sm:top-auto";
    document.body.appendChild(div);
    this.container = div;
  }

  show(message, type = "info", duration = 4000) {
    this.createContainer();

    // Configuración de estilos según tipo
    const styles = {
      success: {
        icon: '<i class="fas fa-check-circle text-emerald-500 text-lg"></i>',
        border: "border-emerald-500/20",
        bg: "bg-white",
      },
      error: {
        icon: '<i class="fas fa-times-circle text-red-500 text-lg"></i>',
        border: "border-red-500/20",
        bg: "bg-white", // Podría ser bg-red-50 pero white es más limpio
      },
      info: {
        icon: '<i class="fas fa-info-circle text-brand-500 text-lg"></i>',
        border: "border-brand-500/20",
        bg: "bg-white",
      },
      warning: {
        icon: '<i class="fas fa-exclamation-triangle text-amber-500 text-lg"></i>',
        border: "border-amber-500/20",
        bg: "bg-white",
      },
    };

    const style = styles[type] || styles.info;

    // Crear elemento Toast
    const toast = document.createElement("div");
    toast.className = `
      pointer-events-auto 
      flex items-center gap-3 
      min-w-[300px] max-w-sm 
      p-4 rounded-xl 
      bg-white 
      border ${style.border} 
      shadow-lg shadow-slate-200/50 
      transform translate-y-10 opacity-0 scale-95
      transition-all duration-300 ease-out
    `;

    toast.innerHTML = `
      <div class="flex-shrink-0">
        ${style.icon}
      </div>
      <div class="flex-1">
        <p class="text-sm font-medium text-slate-700 leading-snug">${message}</p>
      </div>
      <button class="text-slate-400 hover:text-slate-600 transition-colors ml-2">
        <i class="fas fa-times text-xs"></i>
      </button>
    `;

    // Añadir al DOM
    const container = document.getElementById("toast-container");
    container.appendChild(toast);

    // Listener para cerrar manualmente
    toast.querySelector("button").onclick = () => this.dismiss(toast);

    // Animación de entrada (Next tick)
    requestAnimationFrame(() => {
      toast.classList.remove("translate-y-10", "opacity-0", "scale-95");
      toast.classList.add("translate-y-0", "opacity-100", "scale-100");
    });

    // Auto-cierre
    setTimeout(() => {
      this.dismiss(toast);
    }, duration);
  }

  dismiss(toast) {
    // Animación de salida
    toast.classList.add("opacity-0", "translate-y-4", "scale-95");
    toast.style.marginBottom = `-${toast.offsetHeight}px`; // Colapsar espacio

    setTimeout(() => {
      toast.remove();
    }, 300);
  }
}

export const toast = new ToastManager();
