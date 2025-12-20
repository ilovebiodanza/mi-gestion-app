import { BaseElement } from "../BaseElement.js";

export class SeparatorElement extends BaseElement {
  static getType() {
    return "separator";
  }
  static getLabel() {
    return "Sección (Divisor)";
  }
  static getIcon() {
    return "fas fa-heading";
  }
  static getDescription() {
    return "Título y línea divisoria para organizar secciones.";
  }

  // 🟢 SIEMPRE ocupa el ancho completo (2 columnas)
  static getColumns() {
    return 2;
  }

  // --- 1. CONFIGURACIÓN ---
  renderSettings() {
    return `<p class="text-xs text-slate-500 italic mt-2 p-2 bg-slate-50 rounded border border-slate-100">
      Este elemento es visual. No guarda datos, solo sirve para separar bloques de información.
    </p>`;
  }

  // --- 2. EDITOR (Adaptado a la Grid) ---
  renderEditor() {
    // ESTRUCTURA CORREGIDA:
    // 1. Wrapper 'md:col-span-2' para que ocupe todo el ancho y respete el grid.
    // 2. Sin inputs, solo visuales.
    return `
      <div class="field-wrapper md:col-span-2 print:col-span-2 w-full mt-6 mb-4" data-field-id="${this.def.id}">
        <div class="flex items-center gap-4">
            <h3 class="text-lg font-bold text-slate-700 whitespace-nowrap uppercase tracking-wide">
              ${this.def.label}
            </h3>
            <div class="h-px bg-slate-200 w-full rounded-full"></div>
        </div>
      </div>`;
  }

  // Agregamos un método vacío para evitar errores si el Adapter intenta llamar a esto
  postRenderEditor(container, onChange) {
    // No hace nada porque no hay datos que guardar
  }

  // --- 3. VISUALIZACIÓN ---
  renderViewer() {
    return `
        <div class="col-span-2 flex items-center gap-4 mt-8 mb-4">
            <h2 class="text-xl font-bold text-slate-800 whitespace-nowrap border-b-2 border-primary/20 pb-1">
              ${this.def.label}
            </h2>
            <div class="h-px bg-slate-200 w-full rounded-full"></div>
        </div>`;
  }

  // --- 4. IMPRESIÓN ---
  renderPrint(mode) {
    if (mode === "compact")
      return `<div class="col-span-2 mt-2"><hr class="border-slate-400 mb-1"><strong class="block text-xs uppercase text-slate-600">${this.def.label}</strong></div>`;

    return `
      <div class="col-span-2 page-break mt-6 mb-4 border-b-2 border-slate-800 pb-1">
         <h3 class="text-lg font-bold uppercase tracking-wider text-slate-900">${this.def.label}</h3>
      </div>`;
  }

  // --- 5. WHATSAPP ---
  getWhatsAppText() {
    return `\n=== ${this.def.label.toUpperCase()} ===\n`;
  }
}
