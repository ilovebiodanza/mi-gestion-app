// src/components/editor/core/fields/DateField.js
import { AbstractField } from "../AbstractField.js";

export class DateField extends AbstractField {
  renderInput() {
    return `
      <div class="relative">
        <input 
          type="date" 
          name="${this.def.id}" 
          class="w-full bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all px-4 py-3 text-slate-700 font-medium"
          value="${this.value || ""}"
        >
      </div>`;
  }
}
