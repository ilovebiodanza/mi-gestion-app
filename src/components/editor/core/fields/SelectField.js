// src/components/editor/core/fields/SelectField.js
import { AbstractField } from "../AbstractField.js";

export class SelectField extends AbstractField {
  renderInput() {
    const options = (this.def.options || [])
      .map(
        (opt) =>
          `<option value="${opt}" ${
            this.value === opt ? "selected" : ""
          }>${opt}</option>`
      )
      .join("");

    return `
      <div class="relative">
        <select 
          name="${this.def.id}" 
          class="w-full bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all px-4 py-3 appearance-none text-slate-700 font-medium cursor-pointer"
        >
          <option value="">-- Seleccionar --</option>
          ${options}
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
          <i class="fas fa-chevron-down text-xs"></i>
        </div>
      </div>`;
  }
}
