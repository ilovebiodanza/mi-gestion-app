// src/components/editor/core/fields/TableFieldController.js
import { AbstractField } from "../AbstractField.js";
import { FormManager } from "../FormManager.js";
import { renderCellPreview } from "../../InputRenderers.js";

export class TableFieldController extends AbstractField {
  constructor(fieldDef, initialValue, onChange) {
    super(fieldDef, Array.isArray(initialValue) ? initialValue : [], onChange);
    this.columns = this.def.columns || [];
    this.wrapperId = `table-wrapper-${this.def.id}`;
    this.tbodyId = `tbody-${this.def.id}`;
    this.fileInputId = `csv-input-${this.def.id}`;
    this.sortable = null; // Referencia para la instancia de Sortable
  }

  renderInput() {
    // HEADERS (Escritorio)
    const headers = this.columns
      .map(
        (col) =>
          `<th class="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell border-b border-slate-200">${col.label}</th>`
      )
      .join("");

    return `
      <div id="${
        this.wrapperId
      }" class="table-field-container border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm transition-all hover:shadow-md">
        
        <div class="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <i class="fas fa-table mr-1"></i> Datos
            </span>
            <div class="flex items-center gap-2">
                <button type="button" class="btn-export-csv text-slate-500 hover:text-indigo-600 hover:bg-white px-2 py-1 rounded-md transition-colors text-xs font-bold border border-transparent hover:border-slate-200 flex items-center gap-1" title="Descargar CSV">
                    <i class="fas fa-download"></i> <span class="hidden sm:inline">Exportar</span>
                </button>
                <label class="btn-import-csv cursor-pointer text-slate-500 hover:text-emerald-600 hover:bg-white px-2 py-1 rounded-md transition-colors text-xs font-bold border border-transparent hover:border-slate-200 flex items-center gap-1" title="Cargar CSV">
                    <input type="file" id="${
                      this.fileInputId
                    }" class="hidden" accept=".csv">
                    <i class="fas fa-upload"></i> <span class="hidden sm:inline">Importar</span>
                </label>
            </div>
        </div>

        <div class="overflow-x-auto max-h-[400px] custom-scrollbar">
          <table class="w-full text-left border-collapse">
            <thead class="bg-slate-50 hidden md:table-header-group sticky top-0 z-10 shadow-sm">
              <tr>
                ${headers}
                <th class="w-24 px-4 py-2 text-center text-xs font-bold text-slate-500 uppercase hidden md:table-cell bg-slate-50 border-b border-slate-200">Acciones</th>
              </tr>
            </thead>

            <tbody class="block md:table-row-group p-4 md:p-0 space-y-4 md:space-y-0 divide-y divide-slate-200 md:divide-slate-100" id="${
              this.tbodyId
            }">
              ${this.renderRows()}
            </tbody>
          </table>
        </div>
        
        <button type="button" class="add-row-btn w-full py-3 bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-wider transition-colors border-t border-slate-200 flex items-center justify-center gap-2 group">
           <i class="fas fa-plus-circle group-hover:scale-110 transition-transform"></i> Agregar Registro
        </button>
      </div>
    `;
  }

  renderRows() {
    if (this.value.length === 0) {
      return `<tr><td colspan="${
        this.columns.length + 1
      }" class="block md:table-cell p-8 text-center text-xs text-slate-400 italic bg-white">
        <div class="flex flex-col items-center gap-2">
            <i class="fas fa-inbox text-2xl opacity-20"></i>
            <span>Sin registros. Agrega uno manualmente o importa un CSV.</span>
        </div>
      </td></tr>`;
    }

    return this.value
      .map((row, index) => {
        const cells = this.columns
          .map((col) => {
            return `
            <td class="block md:table-cell px-4 py-2 md:py-3 align-top text-sm border-b md:border-none border-slate-100 last:border-0">
                <span class="md:hidden block text-[10px] font-bold text-slate-400 uppercase mb-1">${
                  col.label
                }</span>
                <div class="text-slate-700 font-medium break-words">${renderCellPreview(
                  col,
                  row[col.id]
                )}</div>
            </td>`;
          })
          .join("");

        // CAMBIO: Añadido el botón de drag-handle
        const actions = `
          <td class="block md:table-cell px-4 py-3 md:py-3 text-right md:text-center align-middle whitespace-nowrap bg-slate-50 md:bg-transparent rounded-b-xl md:rounded-none border-t md:border-none border-slate-100">
             <div class="flex items-center justify-end md:justify-center gap-1">
                 
                 <button type="button" class="edit-btn w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" data-index="${index}" title="Editar">
                    <i class="fas fa-pencil-alt text-xs"></i>
                 </button>
                 
                 <button type="button" class="remove-btn w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" data-index="${index}" title="Eliminar">
                    <i class="fas fa-trash-alt text-xs"></i>
                 </button>

                 <button type="button" class="drag-handle w-8 h-8 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-move" title="Mover">
                    <i class="fas fa-grip-vertical text-xs"></i>
                 </button>

             </div>
          </td>`;

        return `
        <tr class="block md:table-row bg-white md:hover:bg-slate-50 transition-colors group rounded-xl shadow-sm md:shadow-none border border-slate-200 md:border-none mb-4 md:mb-0" data-id="${index}">
          ${cells}
          ${actions}
        </tr>`;
      })
      .join("");
  }

  postRender(container) {
    super.postRender(container);

    const myWrapper = container.querySelector(`#${this.wrapperId}`);
    if (!myWrapper) return;

    this.tbody = myWrapper.querySelector(`#${this.tbodyId}`);

    // --- INTEGRACIÓN SORTABLEJS ---
    // Verificamos si existe la librería global (cargada en index.html)
    if (this.tbody && window.Sortable) {
      this.sortable = new Sortable(this.tbody, {
        handle: ".drag-handle", // Solo se puede arrastrar desde el icono
        animation: 150,
        ghostClass: "bg-indigo-50", // Color de fondo mientras se arrastra
        onEnd: (evt) => {
          // Lógica de reordenamiento del array
          const oldIndex = evt.oldIndex;
          const newIndex = evt.newIndex;

          if (oldIndex !== newIndex) {
            // Mover el elemento en el array de datos
            const movedItem = this.value.splice(oldIndex, 1)[0];
            this.value.splice(newIndex, 0, movedItem);

            // IMPORTANTE: Volver a renderizar.
            // Aunque Sortable mueve el DOM visualmente, necesitamos regenerar
            // la tabla para que los botones 'data-index' (editar/borrar)
            // apunten a los nuevos índices correctos del array.
            this.updateAndRender();
          }
        },
      });
    }
    // ------------------------------

    // Listeners principales
    myWrapper.querySelector(`.add-row-btn`)?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.openRowEditor(null);
    });

    // Listeners CSV
    myWrapper
      .querySelector(`.btn-export-csv`)
      ?.addEventListener("click", () => this.exportCSV());
    const fileInput = myWrapper.querySelector(`#${this.fileInputId}`);
    fileInput?.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        this.importCSV(e.target.files[0]);
        e.target.value = "";
      }
    });

    // Delegación para editar/borrar
    myWrapper.addEventListener("click", (e) => {
      const editBtn = e.target.closest(".edit-btn");
      const removeBtn = e.target.closest(".remove-btn");

      if (!myWrapper.contains(editBtn) && !myWrapper.contains(removeBtn))
        return;

      if (editBtn) {
        e.stopPropagation();
        this.openRowEditor(parseInt(editBtn.dataset.index));
      }
      if (removeBtn) {
        e.stopPropagation();
        if (confirm("¿Estás seguro de eliminar este registro?"))
          this.removeRow(parseInt(removeBtn.dataset.index));
      }
    });
  }

  // --- LÓGICA CSV (Se mantiene igual) ---

  exportCSV() {
    if (this.value.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const csvHeaders = [];
    const colMappings = [];

    this.columns.forEach((col) => {
      if (col.type === "url") {
        csvHeaders.push(`"${col.label} (URL)"`);
        csvHeaders.push(`"${col.label} (Texto)"`);
        colMappings.push({ id: col.id, type: "url", prop: "url" });
        colMappings.push({ id: col.id, type: "url", prop: "text" });
      } else {
        csvHeaders.push(`"${col.label.replace(/"/g, '""')}"`);
        colMappings.push({ id: col.id, type: "simple" });
      }
    });

    const rows = this.value
      .map((row) => {
        return colMappings
          .map((map) => {
            const rawVal = row[map.id];

            if (map.type === "url") {
              if (!rawVal) return '""';
              const valObj =
                typeof rawVal === "object"
                  ? rawVal
                  : { url: rawVal, text: rawVal };
              const valStr = valObj[map.prop] || "";
              return `"${String(valStr).replace(/"/g, '""')}"`;
            } else {
              let val = rawVal;
              if (val === null || val === undefined) val = "";
              if (typeof val === "object") val = JSON.stringify(val);
              return `"${String(val).replace(/"/g, '""')}"`;
            }
          })
          .join(",");
      })
      .join("\n");

    const csvContent = `${csvHeaders.join(",")}\n${rows}`;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `tabla_${this.def.label.replace(/\s+/g, "_").toLowerCase()}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  importCSV(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const rows = text.split(/\r?\n/).filter((r) => r.trim() !== "");

        if (rows.length < 2)
          throw new Error("El archivo CSV parece estar vacío.");

        const headers = this.parseCSVLine(rows[0]);
        const colMap = {};

        this.columns.forEach((col) => {
          if (col.type === "url") {
            const urlHeader = `${col.label} (URL)`.toLowerCase();
            const textHeader = `${col.label} (Texto)`.toLowerCase();
            const simpleHeader = col.label.toLowerCase();

            const uIdx = headers.findIndex(
              (h) => h.toLowerCase().trim() === urlHeader
            );
            const tIdx = headers.findIndex(
              (h) => h.toLowerCase().trim() === textHeader
            );
            const sIdx = headers.findIndex(
              (h) => h.toLowerCase().trim() === simpleHeader
            );

            if (uIdx !== -1 || sIdx !== -1) {
              colMap[col.id] = {
                type: "url",
                urlIdx: uIdx !== -1 ? uIdx : sIdx,
                textIdx: tIdx,
              };
            }
          } else {
            const idx = headers.findIndex(
              (h) => h.toLowerCase().trim() === col.label.toLowerCase()
            );
            if (idx !== -1) {
              colMap[col.id] = { type: "simple", idx: idx };
            }
          }
        });

        if (Object.keys(colMap).length === 0) {
          console.warn(
            "Importando por orden posicional (headers no coinciden)."
          );
          let currentCsvIdx = 0;
          this.columns.forEach((col) => {
            if (col.type === "url") {
              colMap[col.id] = {
                type: "url",
                urlIdx: currentCsvIdx,
                textIdx: currentCsvIdx + 1,
              };
              currentCsvIdx += 2;
            } else {
              colMap[col.id] = { type: "simple", idx: currentCsvIdx };
              currentCsvIdx += 1;
            }
          });
        }

        const newRecords = [];

        for (let i = 1; i < rows.length; i++) {
          const values = this.parseCSVLine(rows[i]);
          const record = {};
          let hasData = false;

          Object.keys(colMap).forEach((colId) => {
            const map = colMap[colId];

            if (map.type === "url") {
              const uVal = values[map.urlIdx] || "";
              const tVal = map.textIdx !== -1 ? values[map.textIdx] : "";

              if (uVal) {
                record[colId] = { url: uVal, text: tVal || uVal };
                hasData = true;
              }
            } else {
              const val = values[map.idx];
              if (val !== undefined) {
                record[colId] = val;
                hasData = true;
              }
            }
          });

          if (hasData) newRecords.push(record);
        }

        if (newRecords.length > 0) {
          this.value = [...this.value, ...newRecords];
          this.updateAndRender();
          alert(`✅ Se importaron ${newRecords.length} registros.`);
        } else {
          alert("No se pudieron extraer datos válidos.");
        }
      } catch (err) {
        console.error(err);
        alert("Error al importar: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  parseCSVLine(text) {
    const re_value =
      /(?!\s*$)\s*(?:'([^']*)'|"([^"]*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    const values = [];
    let match;
    while ((match = re_value.exec(text)) !== null) {
      let val = match[2] || match[1] || match[3] || "";
      val = val.replace(/""/g, '"');
      values.push(val);
    }
    return values;
  }

  removeRow(index) {
    this.value.splice(index, 1);
    this.updateAndRender();
  }

  updateAndRender() {
    this.onChange(this.def.id, this.value);
    if (this.tbody) this.tbody.innerHTML = this.renderRows();
  }

  openRowEditor(rowIndex) {
    const isEdit = rowIndex !== null;
    const initialData = isEdit ? this.value[rowIndex] : {};
    const formManager = new FormManager(this.columns, initialData);

    const modalId = `modal-${this.def.id}-${Date.now()}`;

    const modalHTML = `
      <div id="${modalId}" class="fixed inset-0 z-[100] flex items-center justify-center p-4" style="z-index: 1000;">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity modal-backdrop"></div>
        <div class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 class="font-bold text-lg text-slate-800">${
              isEdit ? "Editar Registro" : "Nuevo Registro"
            }</h3>
            <button type="button" class="modal-close text-slate-400 hover:text-slate-600 transition"><i class="fas fa-times"></i></button>
          </div>
          <div class="p-6 overflow-y-auto custom-scrollbar">
            <div id="modal-form-body-${modalId}" class="space-y-4">
                ${formManager.renderHtml()}
            </div>
          </div>
          <div class="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
             <button type="button" class="modal-cancel px-4 py-2 text-slate-600 font-bold hover:bg-white rounded-lg transition text-sm">Cancelar</button>
             <button type="button" class="modal-save px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow hover:bg-indigo-700 transition text-sm">Guardar</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);
    const modalEl = document.getElementById(modalId);
    const formBody = document.getElementById(`modal-form-body-${modalId}`);

    formManager.postRender(formBody);

    const closeModal = () => modalEl.remove();

    modalEl.querySelector(".modal-backdrop").onclick = closeModal;
    modalEl.querySelector(".modal-close").onclick = closeModal;
    modalEl.querySelector(".modal-cancel").onclick = closeModal;
    modalEl.querySelector(".modal-save").onclick = () => {
      const validData = formManager.getValidData();
      if (validData) {
        if (isEdit) this.value[rowIndex] = validData;
        else this.value.push(validData);
        this.updateAndRender();
        closeModal();
      }
    };
  }
}
