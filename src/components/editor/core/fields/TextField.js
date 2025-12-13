// src/components/editor/core/fields/TextField.js
import { AbstractField } from "../AbstractField.js";

export class TextField extends AbstractField {
  renderInput() {
    const isTextArea = this.def.type === "text";
    const type = this.def.type === "email" ? "email" : "text";
    const commonClasses =
      "w-full bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all px-4 py-3 text-slate-700 font-medium placeholder-slate-300";

    if (isTextArea) {
      return `
        <textarea 
          name="${this.def.id}" 
          class="${commonClasses} min-h-[100px] resize-y" 
          rows="4" 
          placeholder="${this.def.placeholder || "Escribir..."}"
        >${this.value || ""}</textarea>`;
    }

    return `
      <input 
        type="${type}" 
        name="${this.def.id}" 
        class="${commonClasses}" 
        value="${this.value || ""}" 
        placeholder="${this.def.placeholder || "Escribir..."}"
      >`;
  }
}
