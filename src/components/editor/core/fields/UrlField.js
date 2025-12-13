// src/components/editor/core/fields/UrlField.js
import { AbstractField } from "../AbstractField.js";

export class UrlField extends AbstractField {
  constructor(fieldDef, initialValue, onChange) {
    // Normalizamos el valor inicial para asegurarnos de que siempre sea un objeto
    let val = initialValue;
    if (typeof val === "string") val = { url: val, text: "" };
    if (!val) val = { url: "", text: "" };

    super(fieldDef, val, onChange);
  }

  renderInput() {
    // Clases comunes para inputs
    const baseClass =
      "w-full bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm px-3 py-2";

    return `
      <div class="url-field-group space-y-2 p-3 border border-slate-100 rounded-xl bg-slate-50/50">
          
          <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <i class="fas fa-link text-xs"></i>
              </div>
              <input 
                  type="text" 
                  class="url-input ${baseClass} pl-8 text-blue-600 font-mono placeholder-slate-400" 
                  placeholder="https://ejemplo.com"
                  value="${this.value.url || ""}"
              >
          </div>

          <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <i class="fas fa-font text-xs"></i>
              </div>
              <input 
                  type="text" 
                  class="text-input ${baseClass} pl-8 text-slate-700 placeholder-slate-400 font-medium" 
                  placeholder="Texto del enlace (Opcional)"
                  value="${this.value.text || ""}"
              >
          </div>
          
      </div>
    `;
  }

  postRender(container) {
    // Buscamos el wrapper de este campo específico
    const wrapper = container.querySelector(
      `div[data-field-id="${this.def.id}"]`
    );
    if (!wrapper) return;

    const urlInput = wrapper.querySelector(".url-input");
    const textInput = wrapper.querySelector(".text-input");

    const updateValue = () => {
      this.value = {
        url: urlInput.value.trim(),
        text: textInput.value.trim(),
      };
      this.onChange(this.def.id, this.value);
    };

    if (urlInput) urlInput.addEventListener("input", updateValue);
    if (textInput) textInput.addEventListener("input", updateValue);
  }

  // Sobrescribimos getValue para asegurar que devolvemos el objeto
  getValue() {
    return this.value;
  }
}
