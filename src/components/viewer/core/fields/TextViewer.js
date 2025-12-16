import { AbstractViewer } from "../AbstractViewer.js";

export class TextViewer extends AbstractViewer {
  render(isTableContext = false) {
    if (this.isEmpty()) return this.renderEmpty();

    if (this.field.type === "currency" && this.options.currencyConfig) {
      // Lógica simple de moneda integrada aquí o en su propia clase CurrencyViewer
      const formatted = new Intl.NumberFormat(
        this.options.currencyConfig.locale,
        {
          style: "currency",
          currency: this.options.currencyConfig.codigo,
        }
      ).format(Number(this.value));
      return `<span class="font-mono font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">${formatted}</span>`;
    }

    if (this.field.type === "percentage") {
      return `<span class="font-mono font-bold text-slate-700">${this.value}%</span>`;
    }

    if (isTableContext) {
      return `<span class="block truncate" title="${this.value}">${this.value}</span>`;
    }

    return `<div class="prose prose-sm max-w-none text-slate-600 whitespace-pre-line">${this.value}</div>`;
  }
}
