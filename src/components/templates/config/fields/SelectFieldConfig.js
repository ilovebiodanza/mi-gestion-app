import { AbstractFieldConfig } from "../AbstractFieldConfig.js";

export class SelectFieldConfig extends AbstractFieldConfig {
  /**
   * Inyectamos el input específico para las opciones.
   */
  renderSpecificSettings() {
    // Convertimos el array de opciones a string separado por comas para el input
    const optionsStr = (this.data.options || []).join(", ");

    return `
      <div class="options-config animate-fade-in p-3 bg-amber-50 border border-amber-100 rounded-xl">
          <label class="block text-[10px] font-bold text-amber-700 uppercase mb-1 ml-1">
              Opciones (Separadas por coma)
          </label>
          <input type="text" class="field-options-input w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm text-slate-700 placeholder-amber-800/30 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition" 
                 value="${optionsStr}" 
                 placeholder="Opción A, Opción B, Opción C">
          <p class="text-[10px] text-amber-600 mt-1 ml-1">Los usuarios elegirán una de estas opciones.</p>
      </div>
    `;
  }

  /**
   * Agregamos el listener para capturar los cambios en las opciones.
   */
  attachSpecificListeners() {
    const input = this.domElement.querySelector(".field-options-input");

    if (input) {
      input.addEventListener("input", (e) => {
        // Convertimos el string "A, B, C" -> Array ["A", "B", "C"]
        const val = e.target.value;
        this.data.options = val
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s);
        this.notifyChange();
      });
    }
  }

  /**
   * Sobrescribimos para asegurarnos de incluir 'options' en la data final.
   */
  getDefinition() {
    return {
      ...super.getDefinition(),
      options: this.data.options || [],
    };
  }
}
