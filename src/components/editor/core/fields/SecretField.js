// src/components/editor/core/fields/SecretField.js
import { AbstractField } from "../AbstractField.js";

export class SecretField extends AbstractField {
  renderInput() {
    return `
      <div class="relative group">
        <input 
          type="password" 
          name="${this.def.id}" 
          class="w-full bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all px-4 py-3 text-slate-700 font-bold tracking-wider placeholder-slate-300 pr-12"
          value="${this.value || ""}" 
          placeholder="••••••••"
        >
        <button type="button" class="toggle-pass absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-secondary p-2 transition-colors focus:outline-none">
          <i class="fas fa-eye"></i>
        </button>
      </div>`;
  }

  postRender(container) {
    super.postRender(container);

    // Buscar el botón de toggle dentro del wrapper de ESTE campo
    // Usamos el ID del campo para limitar el scope si fuera necesario,
    // pero container.querySelector buscará en el wrapper generado por AbstractField.
    const wrapper = container.querySelector(`[data-field-id="${this.def.id}"]`);
    if (!wrapper) return;

    const btn = wrapper.querySelector(".toggle-pass");
    const input = this.domElement;

    if (btn && input) {
      btn.onclick = (e) => {
        e.preventDefault();
        const isPass = input.type === "password";
        input.type = isPass ? "text" : "password";
        btn.innerHTML = `<i class="fas fa-eye${isPass ? "-slash" : ""}"></i>`;
        btn.classList.toggle("text-secondary", isPass);
      };
    }
  }
}
