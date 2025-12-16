import { AbstractViewer } from "../AbstractViewer.js";
import { ViewerRegistry } from "../ViewerRegistry.js";

export class TableViewer extends AbstractViewer {
  constructor(fieldConfig, value, options = {}) {
    super(fieldConfig, value, options);
    // 1. Array para recordar los viewers de cada celda
    this.cellViewers = [];
  }

  render() {
    // Importante: Reiniciamos la lista en cada render para no duplicar referencias
    this.cellViewers = [];

    const rows = Array.isArray(this.value) ? this.value : [];

    if (rows.length === 0) {
      return `<div class="p-6 border border-dashed border-slate-200 rounded-lg bg-slate-50 text-center text-xs text-slate-400 flex flex-col items-center gap-2"><i class="fas fa-table text-xl opacity-20"></i>${this.field.label} (Tabla vacía)</div>`;
    }

    const headerHtml = this.field.columns
      .map((c) => `<th class="px-4 py-2">${c.label}</th>`)
      .join("");

    const bodyHtml = rows
      .map((row) => {
        const cellsHtml = this.field.columns
          .map((col) => {
            const cellValue = row[col.id];

            // 2. Instanciamos el viewer de la celda
            const ViewerClass = ViewerRegistry.getViewerClass(col.type);
            const cellViewer = new ViewerClass(col, cellValue, this.options);

            // 3. ¡Lo guardamos! Para poder activarlo después
            this.cellViewers.push(cellViewer);

            return `<td class="px-4 py-2">${cellViewer.render(true)}</td>`;
          })
          .join("");

        return `<tr class="hover:bg-slate-50/50">${cellsHtml}</tr>`;
      })
      .join("");

    return `
    <div class="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm table-viewer-component" data-field-id="${this.field.id}">
        <div class="bg-slate-50 px-4 py-2 border-b border-slate-100 flex justify-between items-center">
            <span class="text-xs font-bold text-slate-500 uppercase">${this.field.label}</span>
            <span class="bg-white border border-slate-200 px-2 rounded-full text-[10px] text-slate-400">${rows.length}</span>
        </div>
        <div class="overflow-x-auto">
            <table class="min-w-full text-sm text-left text-slate-600">
                <thead class="bg-slate-50 text-xs text-slate-400 uppercase font-medium">
                     ${headerHtml}
                </thead>
                <tbody class="divide-y divide-slate-100">
                    ${bodyHtml}
                </tbody>
            </table>
        </div>
    </div>`;
  }

  // 4. Implementamos postRender para delegar a los hijos
  postRender(container) {
    // Cuando el DocumentViewer llama a esto, nosotros llamamos a todos nuestros hijos
    if (this.cellViewers.length > 0) {
      this.cellViewers.forEach((viewer) => {
        // Cada celda (SecretViewer, UrlViewer, etc.) buscará su propio ID único dentro del container
        if (viewer.postRender) {
          viewer.postRender(container);
        }
      });
    }
  }
}
