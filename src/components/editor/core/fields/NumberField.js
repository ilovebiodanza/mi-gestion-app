// src/components/editor/core/fields/NumberField.js
import { AbstractField } from "../AbstractField.js";

export class NumberField extends AbstractField {
  renderInput() {
    const isCurrency = this.def.type === "currency";
    const icon = isCurrency
      ? '<i class="fas fa-dollar-sign absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>'
      : "";
    const paddingLeft = isCurrency ? "pl-10" : "pl-4";

    return `
      <div class="relative">
        ${icon}
        <input 
          type="text" 
          name="${this.def.id}" 
          class="w-full bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all ${paddingLeft} pr-4 py-3 font-mono text-right text-slate-700 font-bold placeholder-slate-300"
          value="${
            this.value !== null && this.value !== undefined ? this.value : ""
          }" 
          placeholder="0.00"
        >
      </div>`;
  }

  // Sobrescribimos postRender para añadir la lógica matemática
  postRender(container) {
    super.postRender(container);

    // this.domElement fue asignado en super.postRender
    if (this.domElement) {
      this.domElement.addEventListener("blur", () => this.evaluateMath());
      this.domElement.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === "=") {
          e.preventDefault();
          this.evaluateMath();
        }
      });
    }
  }

  evaluateMath() {
    const input = this.domElement;
    const value = input.value.trim();
    if (!value) return;

    // Regex de seguridad: solo permite números y operadores básicos
    if (/^[\d\s\.\+\-\*\/\(\)]+$/.test(value) && /[\+\-\*\/]/.test(value)) {
      try {
        // eslint-disable-next-line no-new-func
        const result = new Function('"use strict";return (' + value + ")")();
        if (isFinite(result)) {
          // Redondear a 2 decimales
          const finalVal = Math.round(result * 100) / 100;
          input.value = finalVal;

          // Actualizar el valor interno
          this.value = finalVal;
          this.onChange(this.def.id, finalVal);

          // Feedback visual de éxito
          this.showSuccessFeedback(input);
        }
      } catch (e) {
        console.warn("Error en cálculo matemático", e);
      }
    }
  }

  showSuccessFeedback(input) {
    const originalBorder = input.style.borderColor;
    input.classList.add("text-emerald-600", "bg-emerald-50");
    setTimeout(() => {
      input.classList.remove("text-emerald-600", "bg-emerald-50");
    }, 800);
  }

  // Parseamos a número al obtener el valor
  getValue() {
    if (this.value === "" || this.value === null) return null;
    return Number(this.value);
  }
}
