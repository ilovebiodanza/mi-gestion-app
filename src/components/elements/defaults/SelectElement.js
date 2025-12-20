import { BaseElement } from "../BaseElement.js";

export class SelectElement extends BaseElement {
  static getType() {
    return "select";
  }
  static getLabel() {
    return "Lista de Opciones";
  }
  static getIcon() {
    return "fas fa-list-ul";
  }
  static getDescription() {
    return "Menú desplegable con opciones predefinidas.";
  }

  // Ocupa 1 columna
  static getColumns() {
    return 1;
  }

  // --- 1. CONFIGURACIÓN ---
  renderSettings() {
    // Convertimos el array de opciones a string para mostrarlo en el input
    const optionsStr = (this.def.options || []).join(", ");

    return `
      <div class="md:col-span-12">
        <div class="p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <label class="block text-[10px] font-bold text-amber-700 uppercase mb-1 ml-1">
                Opciones (Separadas por coma)
            </label>
            <input type="text" id="setting-options-${this.def.id}" 
                   class="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm text-slate-700 placeholder-amber-800/30 focus:ring-2 focus:ring-amber-200 focus:border-amber-400 outline-none transition" 
                   value="${optionsStr}" 
                   placeholder="Opción A, Opción B, Opción C">
            <p class="text-[10px] text-amber-600 mt-1 ml-1">Los usuarios elegirán una de estas opciones.</p>
        </div>
      </div>`;
  }

  postRenderSettings(container, updateConfig) {
    const input = container.querySelector(`#setting-options-${this.def.id}`);

    input?.addEventListener("input", (e) => {
      // Lógica de parseo: String "A, B" -> Array ["A", "B"]
      const val = e.target.value;
      const optionsArray = val
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);

      // Actualizamos la propiedad 'options' en la definición del campo
      updateConfig("options", optionsArray);
    });
  }

  // --- 2. EDITOR (Corregido para Adapter) ---
  renderEditor() {
    const requiredBadge = this.def.required
      ? '<span class="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded border border-red-100 font-bold">REQ</span>'
      : "";

    // Generamos las opciones HTML
    const optionsHtml = (this.def.options || [])
      .map(
        (opt) =>
          `<option value="${opt}" ${
            this.value === opt ? "selected" : ""
          }>${opt}</option>`
      )
      .join("");

    // Clases base + padding izquierdo para icono lista (pl-11)
    const inputClasses =
      "block w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none cursor-pointer";

    // ESTRUCTURA CORREGIDA:
    // 1. Wrapper 'flex flex-col' para forzar verticalidad.
    // 2. Select con 'id' y 'name' correctos para el guardado.
    return `
      <div class="field-wrapper flex flex-col mb-4 md:col-span-1 print:col-span-1" data-field-id="${
        this.def.id
      }">
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 ml-1 flex items-center justify-between">
           <span>${this.def.label}</span>${requiredBadge}
        </label>

        <div class="relative group/select">
           <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/select:text-primary transition-colors">
              <i class="fas fa-list-ul"></i>
           </div>

           <select id="${this.def.id}" name="${
      this.def.id
    }" class="${inputClasses}">
              <option value="" disabled ${
                !this.value ? "selected" : ""
              }>Seleccionar opción...</option>
              ${optionsHtml}
           </select>
           
           <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
              <i class="fas fa-chevron-down text-xs"></i>
           </div>
        </div>
      </div>`;
  }

  postRenderEditor(container, onChange) {
    const input = container.querySelector(`#${this.def.id}`);
    input?.addEventListener("change", (e) =>
      onChange(this.def.id, e.target.value)
    );
  }

  // --- 3. VISUALIZACIÓN ---
  renderViewer() {
    if (!this.value)
      return '<span class="text-slate-300 text-xs italic">--</span>';

    // Estilo Badge (Etiqueta)
    return `
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-sm font-medium">
         <i class="fas fa-check text-[10px] text-slate-400"></i> ${this.value}
      </span>`;
  }

  // --- 4. IMPRESIÓN ---
  renderPrint(mode) {
    const val = this.value || "—";

    if (mode === "compact")
      return `<div class="text-[9px]"><b class="uppercase">${this.def.label}:</b> ${val}</div>`;

    return `
      <div class="mb-2 page-break avoid-break-inside">
         <dt class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">${this.def.label}</dt>
         <dd class="text-sm text-slate-900 border-b border-slate-100 pb-1 font-medium flex items-center gap-2">
            <i class="fas fa-list-ul text-slate-300 text-xs"></i> ${val}
         </dd>
      </div>`;
  }
}
