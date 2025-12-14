import { AbstractFieldConfig } from "../AbstractFieldConfig.js";
import { columnConfigModal } from "../ColumnConfigModal.js";

export class TableFieldConfig extends AbstractFieldConfig {
  constructor(data, index, callbacks) {
    super(data, index, callbacks);
    // Aseguramos que columns sea un array
    this.data.columns = this.data.columns || [];
  }

  renderSpecificSettings() {
    const colCount = this.data.columns.length;

    return `
      <div class="table-config-area mt-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
          <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                    <i class="fas fa-table"></i>
                  </div>
                  <div>
                      <p class="text-sm font-bold text-indigo-900">Estructura de Tabla</p>
                      <p class="text-xs text-indigo-600 font-medium">
                        <span class="col-count-badge font-extrabold bg-white px-1.5 rounded text-indigo-800 shadow-sm">${colCount}</span> columnas definidas
                      </p>
                  </div>
              </div>
              
              <button type="button" class="btn-configure-table px-4 py-1.5 bg-white text-indigo-600 text-xs font-bold border border-indigo-200 rounded-lg hover:bg-indigo-600 hover:text-white shadow-sm transition-all transform active:scale-95">
                  <i class="fas fa-cog mr-1"></i> Configurar
              </button>
          </div>
      </div>
    `;
  }

  attachSpecificListeners() {
    const configBtn = this.domElement.querySelector(".btn-configure-table");

    if (configBtn) {
      configBtn.addEventListener("click", () => {
        // Abrimos el modal pasando nuestras columnas actuales y un callback
        columnConfigModal.open(this.data.columns, (newColumns) => {
          // 1. Actualizamos nuestra data
          this.data.columns = newColumns;

          // 2. Actualizamos la UI local (el contador de columnas)
          const badge = this.domElement.querySelector(".col-count-badge");
          if (badge) badge.textContent = newColumns.length;

          // 3. Notificamos al formulario principal que hubo cambios
          this.notifyChange();
        });
      });
    }
  }

  getDefinition() {
    return {
      ...super.getDefinition(),
      columns: this.data.columns,
    };
  }
}
