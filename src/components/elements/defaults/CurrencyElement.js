import { NumberElement } from "./NumberElement.js"; // Importamos la clase madre

export class CurrencyElement extends NumberElement {
  static getType() {
    return "currency";
  }
  static getLabel() {
    return "Moneda / Dinero";
  }
  static getIcon() {
    return "fas fa-dollar-sign";
  }
  static getDescription() {
    return "Importes financieros con formato de moneda.";
  }

  // Sobrescribimos el símbolo izquierdo del editor
  renderLeftSymbol() {
    const symbol = this.def.currencySymbol || "$";
    return `<span>${symbol}</span>`; // Usamos texto en lugar de ícono FontAwesome
  }

  // --- CONFIGURACIÓN EXTRA (Opcional) ---
  // Podemos añadir un input para configurar el símbolo si quisieras
  renderSettings() {
    // Reutilizamos el de NumberElement y podríamos concatenar más
    return super.renderSettings();
  }

  // --- VISUALIZACIÓN (Formato Moneda) ---
  renderViewer() {
    if (!this.value)
      return '<span class="text-slate-300 text-xs italic">--</span>';

    const symbol = this.def.currencySymbol || "$";
    let formattedNumber = this.value;

    try {
      formattedNumber = new Intl.NumberFormat("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(this.value));
    } catch (e) {}

    return `<span class="font-mono font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 text-sm whitespace-nowrap">${symbol} ${formattedNumber}</span>`;
  }

  // --- IMPRESIÓN ---
  renderPrint(mode) {
    const val = this.value || "—";
    const symbol = this.def.currencySymbol || "$";

    if (mode === "compact")
      return `<div class="text-[9px]"><b class="uppercase">${this.def.label}:</b> ${symbol} ${val}</div>`;

    return `
      <div class="mb-2 page-break avoid-break-inside">
         <dt class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">${this.def.label}</dt>
         <dd class="text-sm text-slate-900 border-b border-slate-100 pb-1 font-mono text-right font-bold">
            ${symbol} ${val}
         </dd>
      </div>`;
  }
}
