// src/components/editor/core/fields/SeparatorField.js
import { AbstractField } from "../AbstractField.js";

export class SeparatorField extends AbstractField {
  constructor(fieldDef, initialValue, onChange) {
    // Pasamos null como valor inicial porque el separador no guarda datos
    super(fieldDef, null, onChange);
  }

  // Sobrescribimos render() completamente para que ocupe todo el ancho
  // y tenga el estilo visual de sección (similar al Visor).
  render() {
    return `
      <div class="col-span-1 md:col-span-2 mt-8 mb-4 border-b border-slate-200 pb-2 flex items-center gap-3 select-none">
          <div class="w-1.5 h-6 bg-slate-400 rounded-full"></div>
          <h3 class="text-lg font-bold text-slate-700 tracking-tight uppercase">
            ${this.def.label}
          </h3>
      </div>
    `;
  }

  // Métodos obligatorios de la interfaz AbstractField, pero sin acción
  getValue() {
    return null; // No se guarda nada en la base de datos para este campo
  }

  validate() {
    return true; // Siempre es válido
  }

  renderInput() {
    return ""; // No usa input estándar
  }
}
