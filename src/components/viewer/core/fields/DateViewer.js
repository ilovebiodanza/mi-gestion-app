import { AbstractViewer } from "../AbstractViewer.js";

export class DateViewer extends AbstractViewer {
  render(isTableContext = false) {
    if (this.isEmpty()) return this.renderEmpty();

    // ❌ Error: Aquí se usaba 'value', que no estaba definido.
    // ✅ Corrección: Usamos 'this.value'.
    const dateValue = this.value;

    try {
      // Intentamos analizar el formato YYYY-MM-DD
      const [y, m, d] = String(dateValue).split("-");
      // Importante: new Date(y, m - 1, d) es más robusto que new Date(dateValue)
      const dateObj = new Date(y, m - 1, d);

      // Si la fecha es inválida (ej. new Date("abc")), toLocaleDateString puede fallar
      if (isNaN(dateObj)) throw new Error("Fecha inválida");

      // Renderizado del campo
      return `<span class="font-semibold text-slate-700"><i class="far fa-calendar text-slate-400 mr-2"></i>${dateObj.toLocaleDateString()}</span>`;
    } catch {
      // Si el parseo falla, mostramos el valor original como texto
      return String(dateValue);
    }
  }
}
