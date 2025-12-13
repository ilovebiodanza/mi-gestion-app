// src/components/editor/core/fields/BooleanField.js
import { AbstractField } from "../AbstractField.js";

export class BooleanField extends AbstractField {
  renderInput() {
    const isChecked = !!this.value;

    return `
      <div class="flex items-center h-full py-2">
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" name="${this.def.id}" class="sr-only peer" ${
      isChecked ? "checked" : ""
    }>
          <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          <span class="ml-3 text-sm font-medium text-slate-600 select-none">
            ${isChecked ? "Sí, activado" : "No"}
          </span>
        </label>
      </div>`;
  }

  attachListeners(input) {
    input.addEventListener("change", (e) => {
      this.value = e.target.checked;
      this.onChange(this.def.id, this.value);

      // Actualizar texto visualmente
      const label = input.parentElement.querySelector("span");
      if (label) label.textContent = this.value ? "Sí, activado" : "No";
    });
  }
}
