// src/components/editor/core/fields/TableFieldController.js
import { AbstractField } from "../AbstractField.js";
import { FormManager } from "../FormManager.js";
import { renderCellPreview } from "../../InputRenderers.js";

export class TableFieldController extends AbstractField {
  constructor(fieldDef, initialValue, onChange) {
    super(fieldDef, Array.isArray(initialValue) ? initialValue : [], onChange);
    this.columns = this.def.columns || [];
  }

  renderInput() {
    // HEADERS:
    // hidden -> Oculto por defecto (Móvil)
    // md:table-cell -> Visible en PC
    // print:table-cell -> Visible al Imprimir
    const headers = this.columns
      .map(
        (col) =>
          `<th class="px-4 py-2 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell print:table-cell border-b border-slate-200">${col.label}</th>`
      )
      .join("");

    return `
      <div class="table-field-container border border-slate-200 rounded-xl overflow-hidden bg-slate-50 md:bg-white print:bg-white shadow-sm print:shadow-none print:border-none">
        <div class="overflow-x-auto print:overflow-visible">
          
          <table class="w-full text-left border-collapse print:table">
            
            <thead class="bg-slate-50 hidden md:table-header-group print:table-header-group">
              <tr>
                ${headers}
                <th class="w-20 px-4 py-2 text-center text-xs font-bold text-slate-500 uppercase hidden md:table-cell print:hidden">Acciones</th>
              </tr>
            </thead>

            <tbody class="block md:table-row-group print:table-row-group p-4 md:p-0 print:p-0 space-y-4 md:space-y-0 print:space-y-0 divide-y divide-slate-200 md:divide-slate-100 print:divide-slate-200" id="tbody-${
              this.def.id
            }">
              ${this.renderRows()}
            </tbody>
          </table>

        </div>
        
        <button type="button" class="add-row-btn w-full py-3 bg-white md:bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-wider transition-colors border-t border-slate-200 flex items-center justify-center gap-2 group print:hidden">
           <i class="fas fa-plus-circle group-hover:scale-110 transition-transform"></i> Agregar Registro
        </button>
      </div>

      <div id="modal-container-${this.def.id}"></div>
    `;
  }

  renderRows() {
    if (this.value.length === 0) {
      // Mensaje vacío: block en móvil, celda en PC
      return `<tr><td colspan="${
        this.columns.length + 1
      }" class="block md:table-cell print:table-cell p-6 text-center text-xs text-slate-400 italic">No hay registros aún.</td></tr>`;
    }

    return this.value
      .map((row, index) => {
        const cells = this.columns
          .map((col) => {
            return `
            <td class="block md:table-cell print:table-cell px-4 py-2 md:py-3 print:py-2 align-top text-sm border-b md:border-none print:border-b print:border-slate-100 border-slate-100 last:border-0">
                
                <span class="md:hidden print:hidden block text-[10px] font-bold text-slate-400 uppercase mb-1">${
                  col.label
                }</span>
                
                <div class="text-slate-700 font-medium">${renderCellPreview(
                  col,
                  row[col.id]
                )}</div>
            </td>`;
          })
          .join("");

        const actions = `
          <td class="block md:table-cell print:hidden px-4 py-3 md:py-3 text-right md:text-center align-middle whitespace-nowrap bg-slate-50 md:bg-transparent rounded-b-xl md:rounded-none border-t md:border-none border-slate-100">
             <div class="flex items-center justify-end md:justify-center gap-2">
                 <button type="button" class="edit-btn w-8 h-8 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" data-index="${index}" title="Editar">
                    <i class="fas fa-pencil-alt text-xs"></i>
                 </button>
                 <button type="button" class="remove-btn w-8 h-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" data-index="${index}" title="Eliminar">
                    <i class="fas fa-trash-alt text-xs"></i>
                 </button>
             </div>
          </td>`;

        return `
        <tr class="block md:table-row print:table-row bg-white md:hover:bg-slate-50 transition-colors group rounded-xl shadow-sm md:shadow-none print:shadow-none border border-slate-200 md:border-none print:border-none mb-4 md:mb-0 page-break-inside-avoid">
          ${cells}
          ${actions}
        </tr>`;
      })
      .join("");
  }

  postRender(container) {
    super.postRender(container);
    this.tbody = container.querySelector(`#tbody-${this.def.id}`);
    const addBtn = container.querySelector(`.add-row-btn`);
    const fieldContainer = container.querySelector(`.table-field-container`);

    if (addBtn)
      addBtn.addEventListener("click", () => this.openRowEditor(null));

    if (fieldContainer) {
      fieldContainer.addEventListener("click", (e) => {
        const editBtn = e.target.closest(".edit-btn");
        const removeBtn = e.target.closest(".remove-btn");

        if (editBtn) this.openRowEditor(parseInt(editBtn.dataset.index));
        if (removeBtn && confirm("¿Estás seguro de eliminar este registro?"))
          this.removeRow(parseInt(removeBtn.dataset.index));
      });
    }
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

    // HTML del Modal
    const modalHTML = `
      <div id="${modalId}" class="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity modal-backdrop"></div>
        <div class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h3 class="font-bold text-lg text-slate-800">${
              isEdit ? "Editar Registro" : "Nuevo Registro"
            }</h3>
            <button type="button" class="modal-close text-slate-400 hover:text-slate-600 transition"><i class="fas fa-times"></i></button>
          </div>
          <div class="p-6 overflow-y-auto custom-scrollbar">
            <div id="modal-form-body-${modalId}" class="space-y-4">${formManager.renderHtml()}</div>
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
