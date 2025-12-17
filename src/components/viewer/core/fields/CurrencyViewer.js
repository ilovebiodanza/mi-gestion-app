import { AbstractViewer } from "../AbstractViewer.js";

export class CurrencyViewer extends AbstractViewer {
  render(isTableContext = false) {
    if (this.isEmpty()) return this.renderEmpty();

    // CORRECCIÓN: Leemos el símbolo desde 'this.field', que es donde
    // se guardó la configuración de la plantilla (Fase 1).
    const symbol = this.field.currencySymbol || "$";

    // Formateamos el número SOLO como decimal (sin estilo 'currency')
    // para evitar que el navegador ponga su propio símbolo.
    let formattedNumber;
    try {
      formattedNumber = new Intl.NumberFormat("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(this.value));
    } catch (e) {
      formattedNumber = this.value;
    }

    // Concatenamos manualmente TU símbolo con el número formateado
    const finalDisplay = `${symbol} ${formattedNumber}`;

    if (isTableContext) {
      return `<span class="font-mono font-bold text-slate-700 text-xs" data-raw-value="${this.value}">${finalDisplay}</span>`;
    }

    return `<span class="font-mono font-bold text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">${finalDisplay}</span>`;
  }
}
