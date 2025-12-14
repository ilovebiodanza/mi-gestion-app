// src/components/templates/config/ColumnConfigModal.js
import { fieldConfigRegistry } from "./FieldConfigRegistry.js";

export class ColumnConfigModal {
  constructor() {
    this.modalId = "columns-config-modal";
    this.currentColumns = [];
    this.onSave = null;
    this.columnControllers = [];

    this.injectModalHtml();
    this.bindGlobalEvents();
  }

  open(columns, onSaveCallback) {
    this.currentColumns = JSON.parse(JSON.stringify(columns || []));
    this.onSave = onSaveCallback;
    this.columnControllers = [];

    this.renderColumnItems();

    const modal = document.getElementById(this.modalId);
    if (modal) {
      modal.classList.remove("hidden");
      this.initSortable();
    }
  }

  close() {
    const modal = document.getElementById(this.modalId);
    if (modal) modal.classList.add("hidden");
    this.columnControllers = [];
  }

  renderColumnItems() {
    const container = document.getElementById("modal-columns-container");
    if (!container) return;

    container.innerHTML = "";

    this.currentColumns.forEach((colData, index) => {
      this.addColumnController(colData, index);
    });

    this.updateEmptyState();
  }

  addColumnController(colData, index) {
    const container = document.getElementById("modal-columns-container");

    // Prevenir recursividad infinita (tablas dentro de tablas)
    if (colData.type === "table" || colData.type === "separator") {
      colData.type = "text";
    }

    try {
      // 👇 AQUÍ ESTABA EL DETALLE: Faltaba pasar onTypeChange
      const controller = fieldConfigRegistry.createController(colData, index, {
        onRemove: (ctrl) => {
          ctrl.domElement.remove();
          this.columnControllers = this.columnControllers.filter(
            (c) => c !== ctrl
          );
          this.updateEmptyState();
        },
        onTypeChange: (ctrl, newType) => this.handleTypeChange(ctrl, newType),
      });

      this.renderControllerToDOM(controller, container);
      this.columnControllers.push(controller);
    } catch (e) {
      console.error("Error renderizando columna", e);
    }
  }

  // 👇 NUEVO MÉTODO: Maneja el cambio de tipo dinámicamente dentro del modal
  handleTypeChange(oldController, newType) {
    const container = document.getElementById("modal-columns-container");

    // 1. Obtener datos y actualizar tipo
    const currentData = oldController.getDefinition();
    currentData.type = newType;

    // Limpieza de datos si cambiamos de 'select' a otro
    if (newType !== "select") delete currentData.options;

    // 2. Crear nuevo controlador adecuado para el nuevo tipo
    const newController = fieldConfigRegistry.createController(
      currentData,
      oldController.index,
      {
        onRemove: (ctrl) => {
          ctrl.domElement.remove();
          this.columnControllers = this.columnControllers.filter(
            (c) => c !== ctrl
          );
          this.updateEmptyState();
        },
        onTypeChange: (ctrl, t) => this.handleTypeChange(ctrl, t),
      }
    );

    // 3. Renderizar y reemplazar en el DOM
    const wrapper = document.createElement("div");
    wrapper.innerHTML = newController.render();
    const newElement = wrapper.firstElementChild;

    // Aplicar estilos de "item de modal"
    newElement.classList.remove("mb-4");
    newElement.classList.add("mb-2", "scale-95", "origin-left");

    // Reemplazo físico
    oldController.domElement.replaceWith(newElement);

    // 4. Inicializar listeners
    newController.postRender(container);

    // 5. Filtrar opciones prohibidas (Tablas/Separadores)
    this.filterForbiddenOptions(newElement);

    // 6. Actualizar el array de controladores
    const idx = this.columnControllers.indexOf(oldController);
    if (idx !== -1) {
      this.columnControllers[idx] = newController;
    }
  }

  // Helper para no repetir código de renderizado e inyección
  renderControllerToDOM(controller, container) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = controller.render();
    const element = wrapper.firstElementChild;

    element.classList.remove("mb-4");
    element.classList.add("mb-2", "scale-95", "origin-left");

    container.appendChild(element);

    controller.postRender(container);
    this.filterForbiddenOptions(element);
  }

  filterForbiddenOptions(element) {
    const typeSelect = element.querySelector(".field-type-select");
    if (typeSelect) {
      [...typeSelect.options].forEach((opt) => {
        if (opt.value === "table" || opt.value === "separator") opt.remove();
      });
    }
  }

  addNewColumn() {
    const index = this.columnControllers.length;
    const newCol = {
      id: `col_${Date.now()}`,
      label: "",
      type: "text",
      required: false,
    };
    this.addColumnController(newCol, index);
    this.updateEmptyState();

    const container = document.getElementById("modal-columns-container");
    // Pequeño timeout para asegurar que el DOM se actualizó antes de hacer scroll
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 50);
  }

  handleSave() {
    const newColumnsData = this.columnControllers.map((ctrl) =>
      ctrl.getDefinition()
    );
    if (this.onSave) {
      this.onSave(newColumnsData);
    }
    this.close();
  }

  updateEmptyState() {
    const container = document.getElementById("modal-columns-container");
    const emptyMsg = document.getElementById("modal-empty-msg");
    const hasCols = container.children.length > 0;
    if (emptyMsg) {
      emptyMsg.classList.toggle("hidden", hasCols);
    }
  }

  initSortable() {
    const container = document.getElementById("modal-columns-container");
    if (window.Sortable && container) {
      if (container._sortable) container._sortable.destroy();
      container._sortable = new window.Sortable(container, {
        animation: 150,
        handle: ".drag-handle",
        ghostClass: "bg-indigo-50",
      });
    }
  }

  injectModalHtml() {
    if (document.getElementById(this.modalId)) return;

    const html = `
      <div id="${this.modalId}" class="fixed inset-0 z-[60] hidden">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" id="modal-backdrop"></div>
        <div class="relative w-full h-full flex items-center justify-center p-4">
            <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] animate-fade-in-up overflow-hidden">
                <div class="px-8 py-6 bg-white border-b border-slate-100 flex justify-between items-center z-10">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
                            <i class="fas fa-table"></i>
                        </div>
                        <div>
                            <h3 class="text-lg font-bold text-slate-800">Configurar Columnas</h3>
                            <p class="text-xs text-slate-500 font-medium">Define la estructura de tu tabla.</p>
                        </div>
                    </div>
                    <button type="button" id="modal-close-top" class="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition"><i class="fas fa-times"></i></button>
                </div>
                <div class="p-6 overflow-y-auto flex-grow bg-slate-50/50 custom-scrollbar relative">
                    <div id="modal-columns-container" class="space-y-3 min-h-[50px]"></div>
                    <div id="modal-empty-msg" class="flex flex-col items-center justify-center py-10 opacity-60">
                        <i class="fas fa-columns text-4xl text-slate-300 mb-2"></i>
                        <p class="text-sm text-slate-400">Sin columnas definidas</p>
                    </div>
                    <button type="button" id="modal-add-btn" class="mt-6 w-full py-3 border-2 border-dashed border-indigo-200 bg-indigo-50/30 text-indigo-600 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition flex items-center justify-center font-bold text-sm gap-2">
                        <i class="fas fa-plus-circle"></i> Agregar Columna
                    </button>
                </div>
                <div class="px-8 py-5 border-t border-slate-100 flex justify-end space-x-3 bg-white z-10">
                    <button type="button" id="modal-cancel-btn" class="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition text-sm">Cancelar</button>
                    <button type="button" id="modal-save-btn" class="px-6 py-2.5 text-white bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition text-sm flex items-center gap-2">
                        <i class="fas fa-check"></i> Aplicar Cambios
                    </button>
                </div>
            </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", html);
  }

  bindGlobalEvents() {
    document
      .getElementById("modal-close-top")
      ?.addEventListener("click", () => this.close());
    document
      .getElementById("modal-cancel-btn")
      ?.addEventListener("click", () => this.close());
    document
      .getElementById("modal-backdrop")
      ?.addEventListener("click", () => this.close());
    document
      .getElementById("modal-add-btn")
      ?.addEventListener("click", () => this.addNewColumn());
    document
      .getElementById("modal-save-btn")
      ?.addEventListener("click", () => this.handleSave());
  }
}

export const columnConfigModal = new ColumnConfigModal();
