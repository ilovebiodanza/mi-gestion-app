import { BaseElement } from "../BaseElement.js";

export class NumberElement extends BaseElement {
  static getType() {
    return "number";
  }
  static getLabel() {
    return "Número";
  }
  static getIcon() {
    return "fas fa-hashtag";
  }
  static getDescription() {
    return "Cantidades, unidades o cálculos matemáticos.";
  }
  static getColumns() {
    return 1;
  }

  renderSettings() {
    return `
      <div class="md:col-span-12">
        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Placeholder</label>
        <input type="text" id="setting-placeholder-${this.def.id}" value="${
      this.def.placeholder || ""
    }" 
               class="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg text-sm outline-none transition focus:ring-2 focus:ring-indigo-100"
               placeholder="Ej: 0">
      </div>`;
  }

  postRenderSettings(container, updateConfig) {
    container
      .querySelector(`#setting-placeholder-${this.def.id}`)
      ?.addEventListener("input", (e) =>
        updateConfig("placeholder", e.target.value)
      );
  }

  // Símbolo por defecto (sobrescribible por Currency/Percentage)
  renderLeftSymbol() {
    return `<i class="fas fa-hashtag"></i>`;
  }

  renderEditor() {
    return `
      <label class="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">${
        this.def.label
      }</label>
      <input type="number" id="${this.def.id}" value="${this.value || ""}" 
        class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:bg-white focus:border-brand-500 outline-none transition-all"
        placeholder="0">
    `;
  }

  postRenderEditor(container, onChange) {
    const input = container.querySelector(`#${this.def.id}`);
    input?.addEventListener("input", (e) =>
      onChange(this.def.id, Number(e.target.value))
    );
  }

  renderViewer() {
    if (!this.value)
      return '<span class="text-slate-300 text-xs italic">--</span>';
    return `<span class="font-mono text-slate-700 font-medium">${this.value}</span>`;
  }

  renderPrint(mode) {
    const val = this.value || "—";
    if (mode === "compact")
      return `<div class="text-[9px]"><b class="uppercase">${this.def.label}:</b> ${val}</div>`;
    return `<div class="mb-2 page-break avoid-break-inside">
              <dt class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">${this.def.label}</dt>
              <dd class="text-sm text-slate-900 border-b border-slate-100 pb-1 font-mono text-right">${val}</dd>
            </div>`;
  }
}
