import { AbstractViewer } from "../AbstractViewer.js";

export class SecretViewer extends AbstractViewer {
  render(isTableContext = false) {
    if (this.isEmpty())
      return '<span class="text-slate-300 text-xs italic">--</span>';

    // Generamos un ID único para vincular listeners específicos a esta instancia
    this.uniqueId = `secret-${Math.random().toString(36).substr(2, 9)}`;

    if (isTableContext) {
      return `
        <div class="group/secret flex items-center gap-2 select-none h-full" id="${this.uniqueId}">
            <div class="relative font-mono text-xs text-slate-500">
                <span class="secret-mask tracking-widest align-middle">••••••</span>
                <span class="secret-revealed hidden font-bold text-slate-800 align-middle">${this.value}</span>
            </div>
            <div class="flex items-center gap-0.5 opacity-0 group-hover/secret:opacity-100 transition-opacity duration-200">
                <button type="button" class="toggle-secret-btn w-6 h-6 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors" title="Mostrar/Ocultar">
                    <i class="fas fa-eye text-[10px]"></i>
                </button>
                <button type="button" class="copy-btn w-6 h-6 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded transition-colors" data-value="${this.value}" title="Copiar">
                    <i class="far fa-copy text-[10px]"></i>
                </button>
            </div>
        </div>`;
    }

    return `
        <div class="flex items-center gap-2" id="${this.uniqueId}">
            <div class="relative group overflow-hidden rounded-lg border border-slate-200 bg-white px-3 py-2 transition-all hover:border-indigo-200 hover:shadow-sm w-full">
                <span class="secret-mask filter blur-[5px] select-none transition-all duration-300 group-hover:blur-none font-mono text-sm text-slate-800 tracking-wider">••••••••••••••</span>
                <span class="secret-revealed hidden font-mono text-sm text-slate-800 select-all font-bold tracking-wide">${this.value}</span>
            </div>
            <button class="toggle-secret-btn w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors bg-white border border-slate-200" title="Revelar"><i class="fas fa-eye"></i></button>
            <button class="copy-btn w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors bg-white border border-slate-200" data-value="${this.value}" title="Copiar"><i class="far fa-copy"></i></button>
        </div>`;
  }

  postRender(container) {
    const wrapper = container.querySelector(`#${this.uniqueId}`);
    if (!wrapper) return;

    const toggleBtn = wrapper.querySelector(".toggle-secret-btn");
    const copyBtn = wrapper.querySelector(".copy-btn");
    const mask = wrapper.querySelector(".secret-mask");
    const revealed = wrapper.querySelector(".secret-revealed");
    const icon = toggleBtn?.querySelector("i");

    if (toggleBtn) {
      toggleBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Evitar burbujeo si está en tabla
        const isHidden = revealed.classList.contains("hidden");
        if (isHidden) {
          revealed.classList.remove("hidden");
          mask.classList.add("hidden");
          if (icon) {
            icon.classList.remove("fa-eye");
            icon.classList.add("fa-eye-slash");
          }
        } else {
          revealed.classList.add("hidden");
          mask.classList.remove("hidden");
          if (icon) {
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
          }
        }
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(this.value);
        // Feedback visual simple
        const originalIcon = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check text-emerald-600"></i>';
        setTimeout(() => (copyBtn.innerHTML = originalIcon), 1500);
      });
    }
  }
}
