// src/components/TemplateForm.js
import { generateFieldId, getCategoryIcon } from "../utils/helpers.js";
import { getFieldTypesConfig } from "../utils/field-types-config.js";

export class TemplateForm {
  constructor(handlers) {
    this.handlers = handlers; // { onSave, onCancel }
    this.activeFieldItem = null;
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
    const initialColor = template?.color || "#4F46E5"; // Indigo 600 default

    return `
      <div class="max-w-4xl mx-auto animate-fade-in pb-16">
          <div class="flex justify-between items-center mb-8 sticky top-0 z-10 bg-gray-50/90 backdrop-blur py-4 border-b border-gray-200">
            <div>
                <h3 class="text-2xl font-bold text-slate-800 flex items-center">
                    <span class="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 text-lg">
                        <i class="fas fa-${isEditing ? "edit" : "magic"}"></i>
                    </span>
                    ${
                      isEditing ? "Editar Plantilla" : "Diseñador de Plantillas"
                    }
                </h3>
            </div>
            <div class="flex gap-3">
                 <button type="button" id="cancelTemplate" class="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition font-medium shadow-sm">Cancelar</button>
                 <button type="submit" form="templateForm" class="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition font-bold flex items-center">
                      <i class="fas fa-save mr-2"></i> Guardar
                 </button>
            </div>
          </div>
          
          <form id="templateForm" class="space-y-8">
              <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                  <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center">
                     <i class="fas fa-info-circle mr-2"></i> Información General
                  </h4>

                  <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
                      <div class="md:col-span-8">
                          <label class="block text-sm font-bold text-slate-700 mb-2">Nombre de la Plantilla</label>
                          <input type="text" id="templateName" value="${
                            template?.name || ""
                          }" 
                                 class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition text-slate-800 font-medium" 
                                 required placeholder="Ej: Registro de Mantenimiento">
                      </div>

                      <div class="md:col-span-4">
                          <label class="block text-sm font-bold text-slate-700 mb-2">Categoría</label>
                          <div class="relative">
                              <select id="templateCategory" class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition appearance-none bg-white cursor-pointer">
                                  ${categoryOptions
                                    .map(
                                      (o) =>
                                        `<option value="${o.value}" ${
                                          o.value === currentCategory
                                            ? "selected"
                                            : ""
                                        }>${o.label}</option>`
                                    )
                                    .join("")}
                              </select>
                              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500"><i class="fas fa-chevron-down text-xs"></i></div>
                          </div>
                      </div>

                      <div class="md:col-span-4">
                          <label class="block text-sm font-bold text-slate-700 mb-2">Icono (Emoji)</label>
                          <input type="text" id="templateIcon" value="${initialIcon}" 
                                 class="w-full px-4 py-3 border border-slate-200 rounded-xl text-center text-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" 
                                 placeholder="📋">
                      </div>
                      
                      <div class="md:col-span-8">
                          <label class="block text-sm font-bold text-slate-700 mb-2">Color Identificativo</label>
                          <div class="flex items-center h-[50px] border border-slate-200 rounded-xl p-2 bg-white">
                              <input type="color" id="templateColor" value="${initialColor}" class="h-full w-full rounded cursor-pointer border-none bg-transparent">
                          </div>
                      </div>

                      <div class="md:col-span-12">
                          <label class="block text-sm font-bold text-slate-700 mb-2">Descripción</label>
                          <input type="text" id="templateDescription" value="${
                            template?.description || ""
                          }" 
                                 class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition" 
                                 placeholder="¿Para qué sirve esta plantilla?">
                      </div>
                  </div>
              </div>
              
              <div class="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 relative">
                  <div class="flex justify-between items-center mb-6">
                    <div>
                        <h4 class="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center">
                            <i class="fas fa-cubes mr-2"></i> Estructura de Datos
                        </h4>
                        <p class="text-xs text-slate-500 mt-1">Arrastra para reordenar (Próximamente)</p>
                    </div>
                    <button type="button" id="addFieldBtn" class="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition font-bold border border-indigo-200 shadow-sm flex items-center">
                        <i class="fas fa-plus-circle mr-2"></i> Agregar Campo
                    </button>
                  </div>

                  <div id="fieldsContainer" class="space-y-4 min-h-[100px]">
                      ${(template?.fields || [])
                        .map((f, i) => this.renderFieldItem(f, i))
                        .join("")}
                  </div>
                  
                  <div id="noFieldsMessage" class="${
                    template?.fields?.length ? "hidden" : ""
                  } flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 mt-4">
                      <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-3xl text-slate-300"><i class="fas fa-layer-group"></i></div>
                      <p class="text-slate-600 font-bold">Lienzo Vacío</p>
                      <p class="text-sm text-slate-400">Comienza agregando tu primer campo arriba.</p>
                  </div>
              </div>
          </form>
      </div>

      ${this.renderColumnsModal()} 
    `;
  }

  renderFieldItem(field = null, index = 0) {
    const fieldId =
      field?.id || generateFieldId(field?.label || `campo_${index + 1}`, index);
    const fieldTypes = getFieldTypesConfig();
    const columnsCount =
      field?.type === "table" && field.columns ? field.columns.length : 0;
    const columnsData =
      field?.type === "table" ? JSON.stringify(field.columns) : "[]";

    return `
    <div class="field-item group relative bg-white border border-slate-200 rounded-xl p-2 transition-all hover:shadow-md hover:border-indigo-300" data-field-id="${fieldId}">
      <div class="flex items-start">
        <div class="hidden md:flex flex-col items-center justify-center w-10 py-4 text-slate-300 cursor-grab hover:text-slate-500 drag-handle self-stretch border-r border-slate-100 mr-4">
            <i class="fas fa-grip-vertical"></i>
        </div>

        <div class="flex-grow p-2">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
                <div class="md:col-span-7">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Etiqueta del Campo</label>
                    <input type="text" class="field-label w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition font-medium text-slate-800" 
                           value="${
                             field?.label || ""
                           }" placeholder="Nombre del campo" required />
                </div>
                
                <div class="md:col-span-5 relative">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tipo de Dato</label>
                    <select class="field-type w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition appearance-none cursor-pointer">
                        ${fieldTypes
                          .map(
                            (t) =>
                              `<option value="${t.value}" ${
                                field?.type === t.value ? "selected" : ""
                              }>${t.label}</option>`
                          )
                          .join("")}
                    </select>
                    <div class="pointer-events-none absolute bottom-3 right-3 flex items-center text-slate-500"><i class="fas fa-chevron-down text-xs"></i></div>
                </div>
            </div>

            <div class="space-y-3">
                <div class="options-input-group ${
                  field?.type === "select" ? "" : "hidden"
                }">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">Opciones de Lista</label>
                    <input type="text" class="field-options w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" 
                           value="${(field?.options || []).join(
                             ", "
                           )}" placeholder="Opción 1, Opción 2, Opción 3...">
                    <p class="text-[10px] text-slate-400 mt-1">Separa las opciones con comas.</p>
                </div>

                <div class="table-config-group ${
                  field?.type === "table" ? "" : "hidden"
                }">
                    <input type="hidden" class="field-columns-data" value='${columnsData}'>
                    <div class="flex items-center justify-between p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                        <div class="flex items-center">
                            <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-3 shadow-sm"><i class="fas fa-table text-sm"></i></div>
                            <div>
                                <p class="text-sm font-bold text-indigo-900">Configuración de Tabla</p>
                                <p class="text-xs text-indigo-600"><span class="columns-count-badge font-bold">${columnsCount}</span> columnas definidas</p>
                            </div>
                        </div>
                        <button type="button" class="configure-table-btn px-3 py-1.5 bg-white text-indigo-600 text-xs font-bold border border-indigo-200 rounded-lg hover:bg-indigo-50 shadow-sm transition">
                            Configurar Columnas
                        </button>
                    </div>
                </div>

                <div class="flex items-center justify-between pt-3 border-t border-slate-50">
                    <label class="flex items-center cursor-pointer select-none">
                        <input type="checkbox" class="field-required form-checkbox h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" ${
                          field?.required ? "checked" : ""
                        }>
                        <span class="ml-2 text-xs font-bold text-slate-500">Campo Obligatorio</span>
                    </label>
                </div>
            </div>
        </div>

        <button type="button" class="remove-field absolute -top-2 -right-2 w-7 h-7 bg-white text-slate-300 hover:text-red-500 border border-slate-200 hover:border-red-200 rounded-full shadow-sm flex items-center justify-center transition-all z-10" title="Eliminar campo">
            <i class="fas fa-times text-xs"></i>
        </button>
      </div>
    </div>`;
  }

  renderColumnsModal() {
    return `
      <div id="columnsModal" class="fixed inset-0 z-50 hidden">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" id="closeModalBackdrop"></div>
        <div class="flex items-center justify-center min-h-screen p-4 w-full">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] relative animate-scale-in">
                
                <div class="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-2xl">
                    <div>
                        <h3 class="text-lg font-bold text-slate-800">Configurar Columnas</h3>
                        <p class="text-xs text-slate-500">Define qué datos tendrá esta tabla.</p>
                    </div>
                    <button type="button" id="closeModalTop" class="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 w-8 h-8 rounded-full transition flex items-center justify-center"><i class="fas fa-times"></i></button>
                </div>
                
                <div class="p-6 overflow-y-auto flex-grow bg-slate-50/50">
                    <div id="modalColumnsContainer" class="space-y-4"></div>
                    
                    <div id="noColumnsMessage" class="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-300 rounded-xl bg-white mt-2">
                        <p class="text-slate-500 font-medium mb-2">Sin columnas</p>
                        <button type="button" id="addColBtnEmpty" class="text-indigo-600 text-sm font-bold hover:underline">Agregar primera columna</button>
                    </div>

                    <button type="button" id="addColBtn" class="mt-6 w-full py-3 border-2 border-dashed border-indigo-200 bg-indigo-50/30 text-indigo-600 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition flex items-center justify-center font-bold text-sm">
                        <i class="fas fa-plus-circle mr-2"></i> Agregar Nueva Columna
                    </button>
                </div>

                <div class="px-6 py-4 border-t border-slate-100 flex justify-end space-x-3 bg-white rounded-b-2xl">
                    <button type="button" id="cancelModalBtn" class="px-5 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-lg transition">Cancelar</button>
                    <button type="button" id="saveModalBtn" class="px-6 py-2 text-white bg-indigo-600 hover:bg-indigo-700 font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition">Guardar Cambios</button>
                </div>
            </div>
        </div>
      </div>`;
  }

  // --- LÓGICA ---

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

    // 3. Event Delegation
    const fieldsContainer = container.querySelector("#fieldsContainer");
    if (fieldsContainer) {
      fieldsContainer.addEventListener("click", (e) => {
        // Eliminar
        const btnRemove = e.target.closest(".remove-field");
        if (btnRemove) {
          btnRemove.closest(".field-item").remove();
          this.updateNoFieldsMessage(container);
        }
        // Configurar tabla
        if (e.target.closest(".configure-table-btn")) {
          this.openColumnsModal(e.target.closest(".field-item"));
        }
      });
      // Toggle inputs
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

    // 4. Form Submit
    container
      .querySelector("#templateForm")
      ?.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveData();
      });
    container
      .querySelector("#cancelTemplate")
      ?.addEventListener("click", () => this.handlers.onCancel());

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

    // Cerrar
    modal.querySelector("#closeModalTop").onclick = close;
    modal.querySelector("#cancelModalBtn").onclick = close;
    modal.querySelector("#closeModalBackdrop").onclick = close;

    // Agregar Columna
    const addFn = () => {
      const c = modal.querySelector("#modalColumnsContainer");
      const count = c.querySelectorAll(".field-item").length;
      c.insertAdjacentHTML("beforeend", this.renderFieldItem(null, count));
      // Limpiar opciones no válidas para columnas
      const select = c.lastElementChild.querySelector(".field-type");
      [...select.options].forEach((opt) => {
        if (opt.value === "table") opt.remove();
      });
      modal.querySelector("#noColumnsMessage").classList.add("hidden");
    };
    modal.querySelector("#addColBtn").onclick = addFn;
    const emptyBtn = modal.querySelector("#addColBtnEmpty");
    if (emptyBtn) emptyBtn.onclick = addFn;

    // Delegación Modal
    const mc = modal.querySelector("#modalColumnsContainer");
    mc.onclick = (e) => {
      const rm = e.target.closest(".remove-field");
      if (rm) {
        rm.closest(".field-item").remove();
        if (mc.children.length === 0)
          modal.querySelector("#noColumnsMessage").classList.remove("hidden");
      }
    };
    mc.onchange = (e) => {
      if (e.target.classList.contains("field-type")) {
        const item = e.target.closest(".field-item");
        item
          .querySelector(".options-input-group")
          .classList.toggle("hidden", e.target.value !== "select");
      }
    };

    // Guardar
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
      const el = container.lastElementChild;
      const select = el.querySelector(".field-type");
      [...select.options].forEach((opt) => {
        if (opt.value === "table") opt.remove();
      });
      if (col.type === "select")
        el.querySelector(".options-input-group").classList.remove("hidden");
    });

    modal
      .querySelector("#noColumnsMessage")
      .classList.toggle("hidden", cols.length > 0);
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }

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
      if (!name) throw new Error("Debes ponerle un nombre a la plantilla");
      const fields = this.collectFields(
        document.getElementById("fieldsContainer")
      );
      if (fields.length === 0)
        throw new Error("La plantilla debe tener al menos un campo");

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
