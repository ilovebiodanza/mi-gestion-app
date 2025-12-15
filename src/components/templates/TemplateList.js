// src/components/templates/TemplateList.js
import { getCategoryName, getCategoryIcon } from "../../utils/helpers.js";

export class TemplateList {
  constructor(handlers) {
    this.handlers = handlers;
  }

  render(templates, categories, currentCategory) {
    const customTemplates = templates.filter(
      (t) => !t.settings?.isSystemTemplate
    );

    // Filtros estilo "Tag"
    const filtersHtml = categories
      .map((cat) => {
        const isActive = cat.id === currentCategory;
        const activeClass = isActive
          ? "bg-slate-800 text-white shadow-md border-slate-800"
          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50";

        return `
        <button class="flex items-center px-3 py-1.5 rounded-full text-xs font-bold transition-all border category-filter whitespace-nowrap gap-2 ${activeClass}" 
                data-category="${cat.id}">
            <span>${getCategoryIcon(cat.id)}</span>
            ${getCategoryName(cat.id)}
            <span class="${
              isActive ? "text-white/60" : "text-slate-400"
            } text-[10px]">
                ${cat.count}
            </span>
        </button>`;
      })
      .join("");

    const allActive = currentCategory === "all";
    const allBtnClass = allActive
      ? "bg-slate-800 text-white shadow-md border-slate-800"
      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50";

    return `
      <div class="animate-fade-in space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 class="text-xl font-bold text-slate-800">Catálogo de Plantillas</h2>
                <p class="text-slate-500 text-sm">Define la estructura de tus datos.</p>
            </div>
            
            <div class="flex gap-3 w-full sm:w-auto">
              <input type="file" id="importTemplateInput" accept=".json" class="hidden" />
              <button id="btnImportTemplate" class="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-brand-600 hover:border-brand-200 rounded-lg transition shadow-sm text-sm font-medium flex items-center gap-2">
                <i class="fas fa-file-import"></i> <span>Importar</span>
              </button>
              <button id="btnNewTemplate" class="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-lg transition shadow-md flex items-center gap-2 text-sm">
                <i class="fas fa-plus"></i> <span>Crear Nueva</span>
              </button>
            </div>
        </div>

        <div class="flex flex-wrap gap-2 pb-2">
            <button class="flex items-center px-3 py-1.5 rounded-full text-xs font-bold transition-all border category-filter whitespace-nowrap gap-2 ${allBtnClass}" data-category="all">
                <span>💠</span> Todas
                <span class="${
                  allActive ? "text-white/60" : "text-slate-400"
                } text-[10px]">${templates.length}</span>
            </button>
            ${filtersHtml}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            ${customTemplates.map((t) => this.renderCard(t)).join("")}
        </div>
        
        ${
          customTemplates.length === 0
            ? `
            <div class="text-center py-12 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <p class="text-slate-400 text-sm">No se encontraron plantillas en esta categoría.</p>
            </div>`
            : ""
        }
      </div>`;
  }

  renderCard(template) {
    const fieldCount = template.fields.length;
    // Fondo muy suave del color de la plantilla
    const color = template.color || "#64748b";

    return `
    <div class="template-card group bg-white border border-slate-200 rounded-xl p-5 hover:shadow-card hover:border-brand-200 transition-all cursor-pointer relative overflow-hidden" 
         data-template-id="${template.id}">
      
      <div class="flex justify-between items-start mb-3">
          <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl border border-slate-100" style="background-color: ${color}10; color: ${color}">
                ${template.icon || "📋"}
          </div>
          <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button class="edit-template p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded transition"><i class="fas fa-pen text-xs"></i></button>
              <button class="export-template p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition"><i class="fas fa-download text-xs"></i></button>
              <button class="delete-template p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"><i class="fas fa-trash text-xs"></i></button>
          </div>
      </div>
      
      <h4 class="font-bold text-slate-800 text-base mb-1 group-hover:text-brand-600 transition-colors">${
        template.name
      }</h4>
      <p class="text-xs text-slate-500 mb-4 line-clamp-2 h-8 leading-relaxed">
        ${template.description || "Sin descripción."}
      </p>

      <div class="flex items-center justify-between pt-3 border-t border-slate-50">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
            ${fieldCount} Campos
        </span>
        <span class="text-[10px] font-bold text-slate-300 group-hover:text-brand-500 transition-colors">
            Usar <i class="fas fa-arrow-right ml-1"></i>
        </span>
      </div>
    </div>`;
  }

  setupListeners(container) {
    // (Misma lógica de listeners que tu archivo original, no cambia, solo nos aseguramos de que existan los selectores)
    container
      .querySelector("#btnNewTemplate")
      ?.addEventListener("click", this.handlers.onNew);
    const importInput = container.querySelector("#importTemplateInput");
    container
      .querySelector("#btnImportTemplate")
      ?.addEventListener("click", () => importInput.click());
    importInput?.addEventListener("change", (e) => {
      if (e.target.files.length) this.handlers.onImport(e.target.files[0]);
    });

    container.querySelectorAll(".category-filter").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.handlers.onFilter(e.currentTarget.dataset.category)
      );
    });

    container.addEventListener("click", (e) => {
      const btnEdit = e.target.closest(".edit-template");
      if (btnEdit) {
        e.stopPropagation();
        this.handlers.onEdit(
          btnEdit.closest(".template-card").dataset.templateId
        );
        return;
      }

      const btnDel = e.target.closest(".delete-template");
      if (btnDel) {
        e.stopPropagation();
        this.handlers.onDelete(
          btnDel.closest(".template-card").dataset.templateId
        );
        return;
      }

      const btnExp = e.target.closest(".export-template");
      if (btnExp) {
        e.stopPropagation();
        this.handlers.onExport(
          btnExp.closest(".template-card").dataset.templateId
        );
        return;
      }

      const card = e.target.closest(".template-card");
      if (card) {
        this.handlers.onSelect(card.dataset.templateId);
      }
    });
  }
}
