// src/components/TemplateManager.js

import { templateService } from "../services/templates/index.js";
import { TemplateList } from "./TemplateList.js";
import { TemplateForm } from "./TemplateForm.js";

export class TemplateManager {
  constructor(onTemplateSelect) {
    this.onTemplateSelect = onTemplateSelect;
    this.currentView = "list";
    this.editingTemplateId = null;

    // Instancias (Asumimos que estos componentes se actualizarán en el futuro)
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
    return `<div id="templateContent" class="min-h-[500px] animate-fade-in"></div>`;
  }

  async setView(view, id = null) {
    this.currentView = view;
    this.editingTemplateId = id;
    const container = document.getElementById("templateContent");
    if (!container) return;

    this.renderLoading(container);

    if (view === "list") {
      await this.loadTemplates();
    } else {
      let template = null;
      if (id) {
        template = await templateService.getTemplateById(id);
      }
      // Renderizamos el formulario (TemplateForm debería devolver HTML Tailwind también)
      container.innerHTML = this.formComponent.render(template);
      this.formComponent.setupListeners(container);
    }
  }

  async loadTemplates(categoryFilter = "all") {
    const container = document.getElementById("templateContent");
    if (
      !container ||
      (this.currentView !== "list" && container.querySelector("form"))
    )
      return;

    // Solo mostramos loading si está vacío para evitar parpadeos en filtrado
    if (!container.innerHTML.trim()) this.renderLoading(container);

    try {
      const templates = await templateService.getUserTemplates();
      const categories = await templateService.getCategories();

      let displayTemplates = templates;
      if (categoryFilter !== "all") {
        displayTemplates = templates.filter(
          (t) => t.settings.category === categoryFilter
        );
      }

      container.innerHTML = this.listComponent.render(
        displayTemplates,
        categories,
        categoryFilter
      );
      this.listComponent.setupListeners(container);
    } catch (error) {
      console.error(error);
      container.innerHTML = `
        <div class="max-w-lg mx-auto mt-10 p-6 bg-red-50 border border-red-100 rounded-2xl text-center">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 text-red-500">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h3 class="text-red-800 font-bold">Error de Carga</h3>
            <p class="text-red-600 text-sm mt-1">${error.message}</p>
            <button onclick="document.getElementById('navHome').click()" class="mt-4 text-sm text-red-700 underline">Volver al inicio</button>
        </div>`;
    }
  }

  renderLoading(container) {
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-64">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <p class="text-slate-400 text-sm mt-3 animate-pulse">Cargando gestor...</p>
        </div>`;
  }

  // --- Handlers (Lógica intacta) ---
  async handleSave(data) {
    try {
      if (this.currentView === "edit" && this.editingTemplateId) {
        await templateService.updateTemplate(this.editingTemplateId, data);
      } else {
        await templateService.createTemplate(data);
      }
      this.setView("list");
    } catch (e) {
      alert("Error: " + e.message);
    }
  }

  async handleDelete(id) {
    if (confirm("¿Eliminar plantilla? Esta acción es irreversible.")) {
      try {
        await templateService.deleteTemplate(id);
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
      a.download = `${(data.name || "plantilla")
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}.template.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      alert("Error: " + e.message);
    }
  }

  async handleImport(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target.result);
        await templateService.importTemplate(json);
        this.loadTemplates();
      } catch (err) {
        alert("Error importando: " + err.message);
      }
    };
    reader.readAsText(file);
  }
}
