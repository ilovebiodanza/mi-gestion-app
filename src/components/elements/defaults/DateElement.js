import { BaseElement } from "../BaseElement.js";

export class DateElement extends BaseElement {
  static getType() {
    return "date";
  }
  static getLabel() {
    return "Fecha";
  }
  static getIcon() {
    return "far fa-calendar-alt";
  }
  static getDescription() {
    return "Selector de calendario.";
  }

  // Ocupa 1 columna
  static getColumns() {
    return 1;
  }

  // --- 1. CONFIGURACIÓN ---
  renderSettings() {
    return `
      <div class="md:col-span-12">
        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">
          Ayuda / Placeholder
        </label>
        <input type="text" id="setting-placeholder-${this.def.id}" value="${
      this.def.placeholder || ""
    }" 
               class="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition font-medium text-slate-700 text-sm"
               placeholder="Ej: Fecha de nacimiento">
      </div>`;
  }

  postRenderSettings(container, updateConfig) {
    container
      .querySelector(`#setting-placeholder-${this.def.id}`)
      ?.addEventListener("input", (e) =>
        updateConfig("placeholder", e.target.value)
      );
  }

  // --- 2. EDITOR (Corregido para Adapter) ---
  renderEditor() {
    const requiredBadge = this.def.required
      ? '<span class="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded border border-red-100 font-bold">REQ</span>'
      : "";

    // Clases base + padding izquierdo para el icono (pl-11)
    const inputClasses =
      "block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm placeholder-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none";

    // ESTRUCTURA CORREGIDA:
    // 1. Wrapper 'flex flex-col' para forzar verticalidad.
    // 2. Input con 'id' y 'name' correctos para el guardado.
    return `
      <div class="field-wrapper flex flex-col mb-4 md:col-span-1 print:col-span-1" data-field-id="${
        this.def.id
      }">
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 ml-1 flex items-center justify-between">
           <span>${this.def.label}</span>${requiredBadge}
        </label>

        <div class="relative group/std">
           <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/std:text-primary transition-colors">
              <i class="fas fa-calendar-alt"></i>
           </div>

           <input type="date" 
              id="${this.def.id}" 
              name="${this.def.id}" 
              value="${this.value || ""}" 
              class="${inputClasses}" 
              placeholder="${this.def.placeholder || ""}">
        </div>
      </div>`;
  }

  postRenderEditor(container, onChange) {
    const input = container.querySelector(`#${this.def.id}`);

    // Usamos 'change' para input date, aunque 'input' también funciona en navegadores modernos.
    // Mantenemos 'change' como tenías para asegurar compatibilidad.
    input?.addEventListener("change", (e) =>
      onChange(this.def.id, e.target.value)
    );
  }

  // --- 3. VISUALIZACIÓN ---
  renderViewer() {
    if (!this.value)
      return '<span class="text-slate-300 text-xs italic">--</span>';

    try {
      // Parseo manual YYYY-MM-DD para evitar problemas de timezone (¡Muy bien hecho!)
      const [y, m, d] = String(this.value).split("-");
      const dateObj = new Date(y, m - 1, d);

      if (isNaN(dateObj.getTime())) throw new Error("Fecha inválida");

      const formatted = dateObj.toLocaleDateString();

      return `<span class="font-semibold text-slate-700"><i class="far fa-calendar text-slate-400 mr-2"></i>${formatted}</span>`;
    } catch (e) {
      return String(this.value);
    }
  }

  // --- 4. IMPRESIÓN ---
  renderPrint(mode) {
    const val = this.value || "—";

    // Intentamos formatear bonito para impresión también
    let formattedVal = val;
    try {
      if (val !== "—") {
        const [y, m, d] = String(val).split("-");
        const dateObj = new Date(y, m - 1, d);
        if (!isNaN(dateObj.getTime())) {
          formattedVal = dateObj.toLocaleDateString();
        }
      }
    } catch (e) {}

    if (mode === "compact")
      return `<div class="text-[9px]"><b class="uppercase">${this.def.label}:</b> ${formattedVal}</div>`;

    return `
      <div class="mb-2 page-break avoid-break-inside">
         <dt class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">${this.def.label}</dt>
         <dd class="text-sm text-slate-900 border-b border-slate-100 pb-1 font-medium">
           <i class="far fa-calendar-alt text-slate-300 mr-1 text-xs"></i> ${formattedVal}
         </dd>
      </div>`;
  }
}
