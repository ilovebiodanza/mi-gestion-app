import { AbstractFieldConfig } from "../AbstractFieldConfig.js";

export class CurrencyFieldConfig extends AbstractFieldConfig {
  /**
   * Inyectamos la configuración específica para moneda.
   */
  renderSpecificSettings() {
    const symbol = this.data.currencySymbol || "$";

    return `
      <div class="currency-config animate-fade-in p-3 bg-indigo-50 border border-indigo-100 rounded-xl mt-2">
          <div class="flex items-center gap-3">
              <div class="flex-grow">
                  <label class="block text-[10px] font-bold text-indigo-700 uppercase mb-1 ml-1">
                      Símbolo de Moneda
                  </label>
                  <input type="text" 
                         class="js-currency-symbol w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm text-slate-700 placeholder-indigo-300 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition font-mono" 
                         value="${symbol}" 
                         placeholder="Ej: $, €, Bs., USD">
              </div>
              <div class="flex-shrink-0 pt-4 text-indigo-400">
                  <i class="fas fa-coins text-xl opacity-50"></i>
              </div>
          </div>
          <p class="text-[10px] text-indigo-500/80 mt-1 ml-1">
              Este símbolo aparecerá en los formularios y documentos PDF.
          </p>
      </div>
    `;
  }

  /**
   * Escuchamos cambios en el input del símbolo.
   */
  attachSpecificListeners() {
    const input = this.domElement.querySelector(".js-currency-symbol");

    if (input) {
      input.addEventListener("input", (e) => {
        this.data.currencySymbol = e.target.value.trim();
        this.notifyChange();
      });
    }
  }

  /**
   * Aseguramos que el símbolo viaje en la definición del campo.
   */
  getDefinition() {
    return {
      ...super.getDefinition(),
      currencySymbol: this.data.currencySymbol || "$",
    };
  }
}
