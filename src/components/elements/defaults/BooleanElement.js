import { BaseElement } from "../BaseElement.js";

export class BooleanElement extends BaseElement {
  static getType() {
    return "boolean";
  }
  static getLabel() {
    return "Sí / No (Interruptor)";
  }
  static getIcon() {
    return "fas fa-check-square";
  }
  static getDescription() {
    return "Opción binaria verdadero/falso.";
  }

  // Ocupa 1 columna por defecto
  static getColumns() {
    return 1;
  }

  // --- 1. CONFIGURACIÓN ---
  renderSettings() {
    return "";
  }

  // --- 2. EDITOR ---
  renderEditor() {
    const isChecked = this.value === true || this.value === "true";
    const requiredBadge = this.def.required
      ? '<span class="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded border border-red-100 font-bold">REQ</span>'
      : "";

    // Texto inicial del estado
    const statusText = isChecked ? "Sí" : "No";

    // ESTRUCTURA:
    // 1. Wrapper vertical (flex-col)
    // 2. ID y Name correctos en el input
    return `
      <div class="field-wrapper flex flex-col mb-4 md:col-span-1 print:col-span-1" data-field-id="${
        this.def.id
      }">
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 ml-1 flex items-center justify-between">
           <span>${this.def.label}</span>${requiredBadge}
        </label>

        <div class="flex items-center h-full min-h-[42px] pl-1">
            <label class="relative inline-flex items-center cursor-pointer group">
              <input type="checkbox" 
                     id="${this.def.id}" 
                     name="${this.def.id}" 
                     class="peer sr-only form-checkbox" 
                     ${isChecked ? "checked" : ""} />
              
              <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 transition-colors duration-300"></div>
              
              <span id="status-text-${
                this.def.id
              }" class="ml-3 text-sm font-medium ${
      isChecked ? "text-emerald-600 font-bold" : "text-slate-500"
    } transition-colors">
                ${statusText}
              </span>
            </label>
        </div>
      </div>`;
  }

  postRenderEditor(container, onChange) {
    const input = container.querySelector(`#${this.def.id}`);
    const statusLabel = container.querySelector(`#status-text-${this.def.id}`);

    input?.addEventListener("change", (e) => {
      const isChecked = e.target.checked;

      // 1. Enviamos el valor real al gestor
      onChange(this.def.id, isChecked);

      // 2. Actualizamos el texto visualmente para mejor UX
      if (statusLabel) {
        statusLabel.textContent = isChecked ? "Sí" : "No";
        if (isChecked) {
          statusLabel.classList.remove("text-slate-500");
          statusLabel.classList.add("text-emerald-600", "font-bold");
        } else {
          statusLabel.classList.remove("text-emerald-600", "font-bold");
          statusLabel.classList.add("text-slate-500");
        }
      }
    });
  }

  // --- 3. VISUALIZACIÓN ---
  renderViewer() {
    const isTrue = this.value === true || this.value === "true";

    return isTrue
      ? '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200"><i class="fas fa-check mr-1"></i> Sí</span>'
      : '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">No</span>';
  }

  // --- 4. IMPRESIÓN ---
  renderPrint(mode) {
    const isTrue = this.value === true || this.value === "true";
    const valText = isTrue ? "SÍ" : "NO";

    if (mode === "compact")
      return `<div class="text-[9px]"><b class="uppercase">${this.def.label}:</b> ${valText}</div>`;

    return `
      <div class="mb-2 page-break avoid-break-inside">
         <dt class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">${
           this.def.label
         }</dt>
         <dd class="text-sm text-slate-900 border-b border-slate-100 pb-1 font-medium flex items-center gap-2">
            ${
              isTrue
                ? '<i class="fas fa-check-square text-emerald-600"></i>'
                : '<i class="far fa-square text-slate-300"></i>'
            }
            ${valText}
         </dd>
      </div>`;
  }

  // --- 5. WHATSAPP ---
  getWhatsAppText() {
    return `*${this.def.label}*: ${this.value ? "✅ SÍ" : "❌ NO"}`;
  }
}
