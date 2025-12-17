import { AbstractViewer } from "../AbstractViewer.js";

export class CurrencyViewer extends AbstractViewer {
  render(isTableContext = false) {
    if (this.isEmpty()) return this.renderEmpty();

    const currencyConfig = this.options.currencyConfig || {
      locale: "es-ES",
      codigo: "USD",
    };

    let formatted;
    try {
      formatted = new Intl.NumberFormat(currencyConfig.locale, {
        style: "currency",
        currency: currencyConfig.codigo,
      }).format(Number(this.value));
    } catch (e) {
      formatted = `${this.value}`;
    }

    if (isTableContext) {
      // Diseño para celda de tabla (coherente con tu diseño actual)
      return `<span class="font-mono font-bold text-slate-700 text-xs" data-raw-value="${this.value}">${formatted}</span>`;
    }

    // Diseño para vista de ficha
    return `<span class="font-mono font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">${formatted}</span>`;
  }
}
