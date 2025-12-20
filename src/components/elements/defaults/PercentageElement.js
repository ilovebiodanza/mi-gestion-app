import { NumberElement } from "./NumberElement.js";

export class PercentageElement extends NumberElement {
  static getType() {
    return "percentage";
  }
  static getLabel() {
    return "Porcentaje";
  }
  static getIcon() {
    return "fas fa-percent";
  }
  static getDescription() {
    return "Valores porcentuales (0-100).";
  }

  // Sobrescribimos el símbolo izquierdo
  renderLeftSymbol() {
    return `<i class="fas fa-percent text-[10px]"></i>`;
  }

  // --- VISUALIZACIÓN ---
  renderViewer() {
    if (!this.value)
      return '<span class="text-slate-300 text-xs italic">--</span>';
    return `<span class="font-mono font-bold text-slate-700">${this.value}%</span>`;
  }

  // --- IMPRESIÓN ---
  renderPrint(mode) {
    const val = this.value || "—";
    if (mode === "compact")
      return `<div class="text-[9px]"><b class="uppercase">${this.def.label}:</b> ${val}%</div>`;

    return `
      <div class="mb-2 page-break avoid-break-inside">
         <dt class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">${this.def.label}</dt>
         <dd class="text-sm text-slate-900 border-b border-slate-100 pb-1 font-mono text-right">${val} %</dd>
      </div>`;
  }
}
