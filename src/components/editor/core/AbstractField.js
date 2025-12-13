// src/components/editor/core/AbstractField.js

export class AbstractField {
  /**
   * @param {Object} fieldDef - Definición del campo (del template)
   * @param {any} initialValue - Valor inicial
   * @param {Function} onChange - Callback para notificar cambios al padre
   */
  constructor(fieldDef, initialValue, onChange) {
    this.def = fieldDef;
    this.value = initialValue;
    this.onChange = onChange || (() => {});
    this.domElement = null; // Referencia al input en el DOM
  }

  /**
   * Genera el HTML string para renderizar.
   */
  render() {
    const isRequired = this.def.required
      ? '<span class="text-red-500 ml-1">*</span>'
      : "";
    const helpText = this.def.description
      ? `<p class="mt-1 text-xs text-slate-400">${this.def.description}</p>`
      : "";

    // --- LÓGICA DE COLUMNAS ---
    // --- LÓGICA DE COLUMNAS ACTUALIZADA ---
    const fullWidthTypes = ["text", "table", "url"];

    // Agregamos print:col-span-2 para que al imprimir también se expandan
    const colSpanClass = fullWidthTypes.includes(this.def.type)
      ? "md:col-span-2 print:col-span-2"
      : "md:col-span-1 print:col-span-1";

    return `
      <div class="field-wrapper mb-4 ${colSpanClass}" data-field-id="${
      this.def.id
    }">
        <label class="block text-xs font-bold text-slate-500 uppercase mb-1.5">
          ${this.def.label} ${isRequired}
        </label>
        ${this.renderInput()} 
        ${helpText}
        <div class="error-msg text-red-500 text-xs mt-1 hidden"></div>
      </div>
    `;
  }

  /**
   * Método abstracto: debe ser sobreescrito por los hijos
   */
  renderInput() {
    return ``;
  }

  postRender(container) {
    const input = container.querySelector(`[name="${this.def.id}"]`);
    if (input) {
      this.domElement = input;
      this.attachListeners(input);
    }
  }

  attachListeners(input) {
    input.addEventListener("input", (e) => {
      this.value = e.target.value;
      this.onChange(this.def.id, this.value);
    });
  }

  getValue() {
    return this.value;
  }

  validate() {
    if (
      this.def.required &&
      (this.value === null || this.value === "" || this.value === undefined)
    ) {
      return "Este campo es requerido.";
    }
    return true;
  }

  showError(msg) {
    // Nota: Buscamos dentro de todo el documento o el contenedor pasado.
    // Como data-field-id es único por form, suele bastar.
    const wrapper = document.querySelector(
      `div[data-field-id="${this.def.id}"]`
    );
    const errorEl = wrapper?.querySelector(".error-msg");
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.classList.remove("hidden");
    }
  }
}
