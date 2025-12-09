// src/components/TemplateList.js
import { getCategoryName, getCategoryIcon } from "../utils/helpers.js";

export class TemplateList {
  constructor(handlers) {
    this.handlers = handlers; // { onNew, onImport, onSelect, onEdit, onDelete, onExport }
  }

  render(templates, categories, currentCategory) {
    const customTemplates = templates.filter(
      (t) => !t.settings?.isSystemTemplate
    );

    // Renderizado de Categorías
    const categoriesHtml = categories
      .map(
        (cat) => `
        <div class="bg-gray-50 hover:bg-gray-100 rounded-lg p-3 cursor-pointer transition category-filter ${
          cat.id === currentCategory
            ? "border-2 border-blue-500 bg-blue-100"
            : ""
        }" data-category="${cat.id}">
            <div class="flex items-center">
                <span class="text-lg mr-2">${getCategoryIcon(cat.id)}</span>
                <div>
                    <p class="font-medium text-gray-800">${getCategoryName(
                      cat.id
                    )}</p>
                    <p class="text-xs text-gray-500">${cat.count} plantilla${
          cat.count !== 1 ? "s" : ""
        }</p>
                </div>
            </div>
        </div>`
      )
      .join("");

    // Renderizado de Lista
    return `
      <div class="animate-fade-in">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 border-b border-gray-200 pb-4">
            <div>
              <h2 class="text-xl font-bold text-gray-800"><i class="fas fa-layer-group mr-2"></i>Plantillas de Datos</h2>
              <p class="text-gray-600 text-sm mt-1">Gestiona tus estructuras de información</p>
            </div>
            <div class="flex space-x-2">
              <input type="file" id="importTemplateInput" accept=".json" class="hidden" />
              <button id="btnImportTemplate" class="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-lg transition flex items-center shadow-sm">
                <i class="fas fa-file-import mr-2"></i> Importar
              </button>
              <button id="btnNewTemplate" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition flex items-center shadow-sm">
                <i class="fas fa-plus mr-2"></i> Nueva
              </button>
            </div>
        </div>

        <div class="space-y-6">
            <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                 <div class="bg-gray-50 hover:bg-gray-100 rounded-lg p-3 cursor-pointer transition category-filter ${
                   currentCategory === "all"
                     ? "border-2 border-blue-500 bg-blue-100"
                     : ""
                 }" data-category="all">
                    <div class="flex items-center"><span class="text-lg mr-2">⭐</span>
                    <div><p class="font-medium text-gray-800">Todas</p><p class="text-xs text-gray-500">${
                      templates.length
                    }</p></div></div>
                 </div>
                 ${categoriesHtml}
            </div>

            <div id="customTemplatesList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${customTemplates.map((t) => this.renderCard(t)).join("")}
            </div>
            ${
              customTemplates.length === 0
                ? '<div class="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">No hay plantillas en esta categoría.</div>'
                : ""
            }
        </div>
      </div>`;
  }

  renderCard(template) {
    const fieldCount = template.fields.length;
    return `
    <div class="template-card border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer bg-white p-4 group" 
         data-template-id="${template.id}">
      <div class="flex justify-between items-start mb-3">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style="background-color: ${
              template.color
            }20; color: ${template.color}">${template.icon || "📋"}</div>
            <div class="ml-3">
                <h4 class="font-bold text-gray-800 group-hover:text-blue-600 transition">${
                  template.name
                }</h4>
                <p class="text-xs text-gray-500 truncate max-w-[150px]">${
                  template.description || ""
                }</p>
            </div>
          </div>
          <div class="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button class="export-template text-gray-400 hover:text-green-600 p-1 rounded" title="Exportar"><i class="fas fa-file-export"></i></button>
              <button class="edit-template text-gray-400 hover:text-blue-600 p-1 rounded" title="Editar"><i class="fas fa-edit"></i></button>
              <button class="delete-template text-gray-400 hover:text-red-600 p-1 rounded" title="Eliminar"><i class="fas fa-trash"></i></button>
          </div>
      </div>
      <div class="text-xs text-gray-500 mb-4 flex items-center">
        <i class="fas fa-list-ul mr-2"></i> ${fieldCount} campos definidos
      </div>
      <button class="use-template-btn w-full mt-2 bg-gray-50 text-blue-600 hover:bg-blue-50 py-2 rounded font-medium border border-gray-200 hover:border-blue-200 transition">
        Usar esta plantilla
      </button>
    </div>`;
  }

  setupListeners(container) {
    // Botones Globales
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

    // Filtros
    container.querySelectorAll(".category-filter").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.handlers.onFilter(e.currentTarget.dataset.category)
      );
    });

    // Delegación de eventos para tarjetas
    container.addEventListener("click", (e) => {
      const card = e.target.closest(".template-card");
      if (!card) return;
      const id = card.dataset.templateId;

      if (e.target.closest(".use-template-btn")) {
        e.stopPropagation();
        this.handlers.onSelect(id);
      } else if (e.target.closest(".edit-template")) {
        e.stopPropagation();
        this.handlers.onEdit(id);
      } else if (e.target.closest(".delete-template")) {
        e.stopPropagation();
        this.handlers.onDelete(id);
      } else if (e.target.closest(".export-template")) {
        e.stopPropagation();
        this.handlers.onExport(id);
      }
      // Si se hace click en la tarjeta pero no en un botón, podríamos mostrar preview
    });
  }
}
