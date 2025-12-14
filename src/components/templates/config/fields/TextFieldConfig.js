// src/components/templates/config/fields/TextFieldConfig.js
import { AbstractFieldConfig } from "../AbstractFieldConfig.js";

export class TextFieldConfig extends AbstractFieldConfig {
  /**
   * Agregamos el input para definir el Placeholder
   */
  renderSpecificSettings() {
    return `
      <div class="mt-3 animate-fade-in">
        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">
            Texto de Ayuda (Placeholder)
        </label>
        <div class="relative">
            <input type="text" class="field-placeholder-input w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition" 
               value="${this.data.placeholder || ""}" 
               placeholder="Ej: Ingresa el nombre completo...">
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <i class="fas fa-i-cursor text-xs"></i>
            </div>
        </div>
        <p class="text-[10px] text-slate-400 mt-1 ml-1">Se mostrará dentro del campo cuando esté vacío.</p>
      </div>
    `;
  }

  attachSpecificListeners() {
    const input = this.domElement.querySelector(".field-placeholder-input");

    if (input) {
      input.addEventListener("input", (e) => {
        this.data.placeholder = e.target.value;
        this.notifyChange();
      });
    }
  }

  getDefinition() {
    // Aseguramos que el placeholder viaje en el JSON final
    return {
      ...super.getDefinition(),
      placeholder: this.data.placeholder || "",
    };
  }
}
