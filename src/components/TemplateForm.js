// src/components/TemplateForm.js
import { generateFieldId, getCategoryIcon } from "../utils/helpers.js";
import { getFieldTypesConfig } from "../utils/field-types-config.js";

export class TemplateForm {
  constructor(handlers) {
    this.handlers = handlers; // { onSave, onCancel }
    this.activeFieldItem = null; // Para saber qué campo abrió el modal
  }

  render(template = null) {
    const isEditing = !!template;
    const categoryOptions = [
      { value: "custom", label: "Personalizado" },
      { value: "personal", label: "Personal" },
      { value: "access", label: "Accesos" },
      { value: "financial", label: "Financiero" },
      { value: "health", label: "Salud" },
      { value: "home", label: "Hogar" },
      { value: "car", label: "Vehículo" },
      { value: "job", label: "Trabajo" },
      { value: "education", label: "Formación" },
    ];
    const currentCategory = template?.settings?.category || "custom";
    const initialIcon = template?.icon || "📋";
    const initialColor = template?.color || "#3B82F6";

    // HTML Principal del Formulario
    return `
      <div class="max-w-4xl mx-auto animate-fade-in pb-10">
          <div class="mb-6 flex justify-between items-center">
            <h3 class="text-xl font-bold text-gray-800">
                <i class="fas fa-${
                  isEditing ? "edit" : "plus-circle"
                } mr-2 text-blue-600"></i>
                ${isEditing ? "Editar" : "Nueva"} Plantilla
            </h3>
          </div>
          
          <form id="templateForm" class="space-y-6">
              <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="md:col-span-2 border-b border-gray-100 pb-2 mb-2">
                    <h4 class="text-sm font-bold text-gray-500 uppercase tracking-wider">Información General</h4>
                  </div>

                  <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                      <input type="text" id="templateName" value="${
                        template?.name || ""
                      }" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required placeholder="Ej: Gastos Mensuales">
                  </div>
                  <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                      <select id="templateCategory" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                           ${categoryOptions
                             .map(
                               (o) =>
                                 `<option value="${o.value}" ${
                                   o.value === currentCategory ? "selected" : ""
                                 }>${getCategoryIcon(o.value)} ${
                                   o.label
                                 }</option>`
                             )
                             .join("")}
                      </select>
                  </div>
                  <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Icono</label>
                      <div class="flex">
                        <span class="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-lg">Emoji</span>
                        <input type="text" id="templateIcon" value="${initialIcon}" class="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg text-center text-xl focus:ring-2 focus:ring-blue-500" placeholder="📋">
                      </div>
                  </div>
                  <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <div class="flex items-center h-10">
                        <input type="color" id="templateColor" value="${initialColor}" class="h-full w-full border border-gray-300 rounded-lg cursor-pointer p-1">
                      </div>
                  </div>
                  <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                      <input type="text" id="templateDescription" value="${
                        template?.description || ""
                      }" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Breve descripción de para qué sirve esta plantilla">
                  </div>
              </div>
              
              <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div class="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h4 class="font-bold text-gray-800 flex items-center"><i class="fas fa-stream mr-2 text-green-600"></i> Estructura de Datos</h4>
                    <button type="button" id="addFieldBtn" class="text-sm bg-green-50 text-green-700 hover:bg-green-100 px-3 py-1.5 rounded-lg transition font-medium border border-green-200">
                        <i class="fas fa-plus mr-1"></i> Agregar Campo
                    </button>
                  </div>

                  <div id="fieldsContainer" class="space-y-4 min-h-[100px]">
                      ${(template?.fields || [])
                        .map((f, i) => this.renderFieldItem(f, i))
                        .join("")}
                  </div>
                  
                  <div id="noFieldsMessage" class="${
                    template?.fields?.length ? "hidden" : ""
                  } flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-300 rounded-lg mt-4 bg-gray-50">
                      <i class="fas fa-layer-group text-gray-300 text-4xl mb-2"></i>
                      <p class="text-gray-500 font-medium">No hay campos definidos</p>
                      <p class="text-sm text-gray-400">Agrega campos para comenzar a diseñar</p>
                  </div>
              </div>
              
              <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button type="button" id="cancelTemplate" class="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium shadow-sm">Cancelar</button>
                  <button type="submit" class="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition font-medium flex items-center">
                      <i class="fas fa-save mr-2"></i> Guardar Plantilla
                  </button>
              </div>
          </form>
      </div>

      ${this.renderColumnsModal()} 
    `;
  }

  // --- Renderizado de Items ---

  renderFieldItem(field = null, index = 0) {
    const fieldId =
      field?.id || generateFieldId(field?.label || `campo_${index + 1}`, index);
    const fieldTypes = getFieldTypesConfig();

    // Datos específicos de tabla
    const columnsCount =
      field?.type === "table" && field.columns ? field.columns.length : 0;
    const columnsData =
      field?.type === "table" ? JSON.stringify(field.columns) : "[]";

    return `
    <div class="field-item border border-gray-200 rounded-lg p-4 bg-white relative group hover:border-blue-300 transition-all hover:shadow-sm" data-field-id="${fieldId}">
      <button type="button" class="remove-field absolute right-3 top-3 text-gray-300 hover:text-red-500 transition p-1" title="Eliminar campo">
        <i class="fas fa-times"></i>
      </button>
      
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
        <div class="hidden md:flex col-span-1 items-center justify-center cursor-move text-gray-300 hover:text-gray-500 drag-handle">
            <i class="fas fa-grip-vertical"></i>
        </div>
        
        <div class="col-span-1 md:col-span-6">
          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre del Campo</label>
          <input type="text" class="field-label w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" 
                 value="${
                   field?.label || ""
                 }" placeholder="Ej: Monto Pagado" required />
        </div>
        
        <div class="col-span-1 md:col-span-5">
          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Tipo de Dato</label>
          <select class="field-type w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 bg-white">
            ${fieldTypes
              .map(
                (t) =>
                  `<option value="${t.value}" ${
                    field?.type === t.value ? "selected" : ""
                  }>${t.label}</option>`
              )
              .join("")}
          </select>
        </div>
      </div>
      
      <div class="pl-0 md:pl-12 space-y-3">
          
          <div class="options-input-group ${
            field?.type === "select" ? "" : "hidden"
          }">
              <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Opciones (separadas por coma)</label>
              <input type="text" class="field-options w-full px-3 py-2 border border-gray-300 rounded bg-gray-50" 
                     value="${(field?.options || []).join(
                       ", "
                     )}" placeholder="Ej: Efectivo, Tarjeta, Transferencia">
          </div>

          <div class="table-config-group ${
            field?.type === "table" ? "" : "hidden"
          }">
            <input type="hidden" class="field-columns-data" value='${columnsData}'>
            <div class="flex items-center justify-between p-3 bg-blue-50 rounded border border-blue-100">
                <div class="flex items-center">
                    <div class="bg-blue-100 p-2 rounded mr-3 text-blue-600"><i class="fas fa-table"></i></div>
                    <div>
                        <p class="text-sm font-bold text-blue-800">Estructura de la Tabla</p>
                        <p class="text-xs text-blue-600 mt-0.5">
                            <span class="columns-count-badge font-bold">${columnsCount}</span> columnas configuradas
                        </p>
                    </div>
                </div>
                <button type="button" class="configure-table-btn px-3 py-1.5 bg-white text-blue-600 text-sm font-medium border border-blue-200 rounded hover:bg-blue-50 shadow-sm transition">
                    <i class="fas fa-cog mr-1"></i> Configurar
                </button>
            </div>
          </div>

          <div class="flex items-center space-x-6 pt-2 border-t border-gray-50 mt-2">
            <label class="flex items-center cursor-pointer">
                <input type="checkbox" class="field-required form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" ${
                  field?.required ? "checked" : ""
                }>
                <span class="ml-2 text-sm text-gray-600">Obligatorio</span>
            </label>
            </div>
      </div>
    </div>`;
  }

  renderColumnsModal() {
    return `
      <div id="columnsModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] animate-scale-in">
            <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
                <div>
                    <h3 class="text-lg font-bold text-gray-800"><i class="fas fa-table mr-2 text-blue-600"></i>Configurar Tabla</h3>
                    <p class="text-xs text-gray-500">Define las columnas de información para esta lista.</p>
                </div>
                <button type="button" id="closeModalTop" class="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-200 transition"><i class="fas fa-times text-xl"></i></button>
            </div>
            
            <div class="p-6 overflow-y-auto flex-grow bg-gray-50">
                <div id="modalColumnsContainer" class="space-y-4"></div>
                
                <div id="noColumnsMessage" class="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-white mt-4">
                    <p class="text-gray-500 text-sm">No hay columnas definidas.</p>
                    <button type="button" id="addColBtnEmpty" class="mt-2 text-blue-600 text-sm font-medium hover:underline">Agregar la primera</button>
                </div>

                <button type="button" id="addColBtn" class="mt-4 w-full py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition flex items-center justify-center font-medium">
                    <i class="fas fa-plus-circle mr-2"></i> Agregar Columna
                </button>
            </div>

            <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 bg-white rounded-b-xl">
                <button type="button" id="cancelModalBtn" class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition">Cancelar</button>
                <button type="button" id="saveModalBtn" class="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition">Guardar Cambios</button>
            </div>
        </div>
      </div>`;
  }

  // --- LOGICA Y LISTENERS ---

  setupListeners(container) {
    // 1. Icono dinámico
    const catSelect = container.querySelector("#templateCategory");
    const iconInput = container.querySelector("#templateIcon");
    if (catSelect && iconInput) {
      catSelect.addEventListener(
        "change",
        (e) => (iconInput.value = getCategoryIcon(e.target.value))
      );
    }

    // 2. Agregar Campo
    container
      .querySelector("#addFieldBtn")
      ?.addEventListener("click", () => this.addField(container));

    // 3. Delegación de eventos en Campos
    const fieldsContainer = container.querySelector("#fieldsContainer");
    if (fieldsContainer) {
      fieldsContainer.addEventListener("click", (e) => {
        if (e.target.closest(".remove-field")) {
          e.target.closest(".field-item").remove();
          this.updateNoFieldsMessage(container);
        }
        if (e.target.closest(".configure-table-btn")) {
          this.openColumnsModal(e.target.closest(".field-item"));
        }
      });

      // Cambio de tipo (Mostrar/Ocultar opciones)
      fieldsContainer.addEventListener("change", (e) => {
        if (e.target.classList.contains("field-type")) {
          const item = e.target.closest(".field-item");
          const type = e.target.value;
          item
            .querySelector(".table-config-group")
            .classList.toggle("hidden", type !== "table");
          item
            .querySelector(".options-input-group")
            .classList.toggle("hidden", type !== "select");
        }
      });
    }

    // 4. Submit y Cancelar
    container
      .querySelector("#templateForm")
      ?.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveData();
      });
    container
      .querySelector("#cancelTemplate")
      ?.addEventListener("click", () => this.handlers.onCancel());

    // 5. Inicializar Modal
    this.setupModalListeners();
  }

  addField(container) {
    const fc = container.querySelector("#fieldsContainer");
    const count = fc.querySelectorAll(".field-item").length;
    fc.insertAdjacentHTML("beforeend", this.renderFieldItem(null, count));
    this.updateNoFieldsMessage(container);
  }

  updateNoFieldsMessage(container) {
    const fc = container.querySelector("#fieldsContainer");
    const msg = container.querySelector("#noFieldsMessage");
    if (fc && msg) msg.classList.toggle("hidden", fc.children.length > 0);
  }

  // --- MODAL LOGIC ---

  setupModalListeners() {
    const modal = document.getElementById("columnsModal");
    if (!modal) return;

    const close = () => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    };

    modal.querySelector("#closeModalTop").onclick = close;
    modal.querySelector("#cancelModalBtn").onclick = close;

    const addFn = () => {
      const c = modal.querySelector("#modalColumnsContainer");
      const count = c.querySelectorAll(".field-item").length;
      c.insertAdjacentHTML("beforeend", this.renderFieldItem(null, count));
      // Eliminar opción tabla anidada
      const select = c.lastElementChild.querySelector(".field-type");
      [...select.options].forEach((opt) => {
        if (opt.value === "table") opt.remove();
      });

      modal.querySelector("#noColumnsMessage").classList.add("hidden");
    };

    modal.querySelector("#addColBtn").onclick = addFn;
    const emptyBtn = modal.querySelector("#addColBtnEmpty");
    if (emptyBtn) emptyBtn.onclick = addFn;

    // Delegación dentro del modal
    const mc = modal.querySelector("#modalColumnsContainer");
    mc.onclick = (e) => {
      if (e.target.closest(".remove-field")) {
        e.target.closest(".field-item").remove();
        if (mc.children.length === 0)
          modal.querySelector("#noColumnsMessage").classList.remove("hidden");
      }
    };

    // Listener Select en Modal
    mc.onchange = (e) => {
      if (e.target.classList.contains("field-type")) {
        const item = e.target.closest(".field-item");
        item
          .querySelector(".options-input-group")
          .classList.toggle("hidden", e.target.value !== "select");
      }
    };

    // Guardar Modal
    modal.querySelector("#saveModalBtn").onclick = () => {
      const columns = this.collectFields(mc);
      const parent = this.activeFieldItem;
      parent.querySelector(".field-columns-data").value =
        JSON.stringify(columns);
      parent.querySelector(".columns-count-badge").textContent = columns.length;
      close();
    };
  }

  openColumnsModal(fieldItem) {
    this.activeFieldItem = fieldItem;
    const modal = document.getElementById("columnsModal");
    const container = document.getElementById("modalColumnsContainer");
    const hiddenInput = fieldItem.querySelector(".field-columns-data");

    let cols = [];
    try {
      cols = JSON.parse(hiddenInput.value || "[]");
    } catch (e) {}

    container.innerHTML = "";
    cols.forEach((col, i) => {
      container.insertAdjacentHTML("beforeend", this.renderFieldItem(col, i));
      // Quitar opción tabla
      const select = container.lastElementChild.querySelector(".field-type");
      [...select.options].forEach((opt) => {
        if (opt.value === "table") opt.remove();
      });

      // Restaurar visibilidad de opciones si es select
      if (col.type === "select") {
        container.lastElementChild
          .querySelector(".options-input-group")
          .classList.remove("hidden");
      }
    });

    modal
      .querySelector("#noColumnsMessage")
      .classList.toggle("hidden", cols.length > 0);
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

  // --- RECOLECCIÓN DE DATOS ---

  collectFields(container) {
    const fields = [];
    container.querySelectorAll(".field-item").forEach((item, index) => {
      const label = item.querySelector(".field-label").value.trim();
      if (!label) return;

      const type = item.querySelector(".field-type").value;
      const fieldId = generateFieldId(label, index);

      let options = [];
      if (type === "select") {
        const txt = item.querySelector(".field-options").value;
        if (txt)
          options = txt
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s);
      }

      let columns = [];
      if (type === "table") {
        try {
          columns = JSON.parse(item.querySelector(".field-columns-data").value);
        } catch (e) {}
      }

      fields.push({
        id: fieldId,
        label,
        type,
        order: index + 1,
        required: item.querySelector(".field-required").checked,
        ...(options.length && { options }),
        ...(columns.length && { columns }),
      });
    });
    return fields;
  }

  saveData() {
    try {
      const name = document.getElementById("templateName").value.trim();
      if (!name) throw new Error("Nombre requerido");

      const fields = this.collectFields(
        document.getElementById("fieldsContainer")
      );
      if (fields.length === 0) throw new Error("Agrega al menos un campo");

      const data = {
        name,
        category: document.getElementById("templateCategory").value,
        icon: document.getElementById("templateIcon").value,
        color: document.getElementById("templateColor").value,
        description: document.getElementById("templateDescription").value,
        fields,
      };

      this.handlers.onSave(data);
    } catch (e) {
      alert(e.message);
    }
  }
}
