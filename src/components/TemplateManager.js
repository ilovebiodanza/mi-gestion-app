// src/components/TemplateManager.js

import { templateService } from "../services/templates/index.js";
import { TemplateList } from "./TemplateList.js";
import { TemplateForm } from "./TemplateForm.js";

export class TemplateManager {
  constructor(onTemplateSelect) {
    this.onTemplateSelect = onTemplateSelect;
    this.currentView = "list";
    this.editingTemplateId = null;

    // Instancias de sub-componentes con sus manejadores
    this.listComponent = new TemplateList({
      onNew: () => this.setView("create"),
      onImport: (file) => this.handleImport(file),
      onSelect: (id) => this.onTemplateSelect(id),
      onEdit: (id) => this.setView("edit", id),
      onDelete: (id) => this.handleDelete(id),
      onExport: (id) => this.handleExport(id),
      onFilter: (cat) => this.loadTemplates(cat),
    });

    this.formComponent = new TemplateForm({
      onSave: (data) => this.handleSave(data),
      onCancel: () => this.setView("list"),
    });
  }

  render() {
    // Contenedor principal limpio donde se montarán las vistas
    return `<div id="templateContent" class="bg-gray-50 min-h-[500px] p-4 rounded-xl"></div>`;
  }

  /**
   * Cambia la vista actual (Router simple)
   */
  async setView(view, id = null) {
    this.currentView = view;
    this.editingTemplateId = id;

    const container = document.getElementById("templateContent");
    if (!container) return;

    // Mostrar spinner mientras cambia la vista
    container.innerHTML = `<div class="flex justify-center py-20"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>`;

    if (view === "list") {
      // Si vamos a la lista, cargamos los datos
      await this.loadTemplates();
    } else {
      // Si es formulario (crear/editar)
      let template = null;
      if (id) {
        template = await templateService.getTemplateById(id);
      }
      container.innerHTML = this.formComponent.render(template);
      this.formComponent.setupListeners(container);
    }
  }

  /**
   * Carga y renderiza la lista de plantillas (Lógica de Negocio)
   */
  async loadTemplates(categoryFilter = "all") {
    const container = document.getElementById("templateContent");
    // Si el contenedor no existe o hemos cambiado de vista mientras cargaba, no hacemos nada
    if (
      !container ||
      (this.currentView !== "list" && container.querySelector("#templateForm"))
    )
      return;

    try {
      // Renderizar loading si no lo tiene
      if (!container.querySelector(".animate-spin")) {
        container.innerHTML = `<div class="flex justify-center py-20"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>`;
      }

      const templates = await templateService.getUserTemplates();
      const categories = await templateService.getCategories();

      // Filtrado
      let displayTemplates = templates;
      if (categoryFilter !== "all") {
        displayTemplates = templates.filter(
          (t) => t.settings.category === categoryFilter
        );
      }

      // Renderizar lista
      container.innerHTML = this.listComponent.render(
        displayTemplates,
        categories,
        categoryFilter
      );
      this.listComponent.setupListeners(container);
    } catch (error) {
      console.error(error);
      container.innerHTML = `<div class="text-red-500 text-center py-10 bg-red-50 rounded-lg border border-red-200">
            <p class="font-bold">Error al cargar plantillas</p>
            <p class="text-sm">${error.message}</p>
          </div>`;
    }
  }

  // --- Manejadores de Acción ---

  async handleSave(data) {
    try {
      if (this.currentView === "edit" && this.editingTemplateId) {
        await templateService.updateTemplate(this.editingTemplateId, data);
        alert("✅ Plantilla actualizada");
      } else {
        await templateService.createTemplate(data);
        alert("✅ Plantilla creada");
      }
      this.setView("list"); // Volver a la lista
    } catch (e) {
      alert("Error al guardar: " + e.message);
    }
  }

  async handleDelete(id) {
    if (
      confirm(
        "¿Estás seguro de eliminar esta plantilla? Esta acción no se puede deshacer."
      )
    ) {
      try {
        await templateService.deleteTemplate(id);
        // Recargar la lista (sin cambiar de vista, ya estamos en 'list')
        this.loadTemplates();
      } catch (e) {
        alert("Error: " + e.message);
      }
    }
  }

  async handleExport(id) {
    try {
      const data = await templateService.exportTemplate(id);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Nombre de archivo seguro
      const safeName = (data.name || "plantilla")
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();
      a.download = `${safeName}.template.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      alert("Error exportando: " + e.message);
    }
  }

  async handleImport(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target.result);
        await templateService.importTemplate(json);
        alert("✅ Plantilla importada correctamente");
        this.loadTemplates();
      } catch (err) {
        alert("Error importando: " + err.message);
      }
    };
    reader.readAsText(file);
  }
}
