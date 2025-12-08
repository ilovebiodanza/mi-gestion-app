// src/components/VaultList.js
import { documentService } from "../services/documents/index.js";
import { templateService } from "../services/templates/index.js"; // Importamos para obtener nombres/iconos

export class VaultList {
  constructor(onDocumentSelect, onNewDocument) {
    this.onDocumentSelect = onDocumentSelect;
    this.onNewDocument = onNewDocument;
    this.documents = [];
    this.templatesMap = {}; // Mapa para acceso rápido a info de plantillas (nombre, icono)
    this.isLoading = false;
    this.currentFilter = "all"; // 'all' o templateId
  }

  /**
   * Cargar documentos y plantillas
   */
  async loadDocuments() {
    this.isLoading = true;
    this.render();

    try {
      // Cargamos documentos y plantillas en paralelo
      const [docs, templates] = await Promise.all([
        documentService.getAllDocuments(),
        templateService.getUserTemplates(),
      ]);

      this.documents = docs;

      // Crear un mapa de plantillas para búsqueda rápida por ID { id: {name, icon, color} }
      this.templatesMap = templates.reduce((acc, t) => {
        acc[t.id] = t;
        return acc;
      }, {});
    } catch (error) {
      console.error("Error cargando vault:", error);
      this.error = "No se pudieron cargar tus documentos seguros.";
    } finally {
      this.isLoading = false;
      this.render();
    }
  }

  /**
   * Obtener lista de filtros (Plantillas que tienen al menos un documento)
   */
  getActiveFilters() {
    // Contar documentos por plantilla
    const counts = this.documents.reduce((acc, doc) => {
      const tid = doc.templateId;
      acc[tid] = (acc[tid] || 0) + 1;
      return acc;
    }, {});

    // Convertir a array para renderizar
    return Object.keys(counts).map((templateId) => {
      const template = this.templatesMap[templateId] || {
        name: "Desconocido",
        icon: "❓",
        color: "#gray",
      };
      return {
        id: templateId,
        name: template.name,
        icon: template.icon,
        color: template.color,
        count: counts[templateId],
      };
    });
  }

  render() {
    const container = document.getElementById("vaultListContainer");
    if (!container) return;

    if (this.isLoading) {
      container.innerHTML = `
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <span class="ml-3 text-gray-500">Accediendo a la bóveda segura...</span>
        </div>
      `;
      return;
    }

    if (this.error) {
      container.innerHTML = `
        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
          <p class="text-red-700">${this.error}</p>
          <button id="retryLoadBtn" class="mt-2 text-sm text-red-600 underline hover:text-red-800">Reintentar</button>
        </div>
      `;
      document
        .getElementById("retryLoadBtn")
        ?.addEventListener("click", () => this.loadDocuments());
      return;
    }

    if (this.documents.length === 0) {
      container.innerHTML = this.renderEmptyState();
      document
        .getElementById("createFirstDocBtn")
        ?.addEventListener("click", () => this.onNewDocument());
      return;
    }

    // Filtrar documentos según selección
    const filteredDocs =
      this.currentFilter === "all"
        ? this.documents
        : this.documents.filter((d) => d.templateId === this.currentFilter);

    // Renderizar Filtros y Lista
    container.innerHTML = `
      <div class="mb-6 overflow-x-auto pb-2 scrollbar-hide">
        <div class="flex space-x-2">
            ${this.renderFilters()}
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
        ${filteredDocs.map((doc) => this.renderDocumentCard(doc)).join("")}
      </div>
      
      ${
        filteredDocs.length === 0
          ? `
        <div class="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            No hay documentos en esta categoría.
        </div>
      `
          : ""
      }
    `;

    this.setupListeners(container);
  }

  renderFilters() {
    const activeFilters = this.getActiveFilters();

    // Botón "Todos"
    let html = `
      <button class="filter-btn flex items-center px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap border ${
        this.currentFilter === "all"
          ? "bg-gray-800 text-white border-gray-800 shadow-md"
          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
      }" data-filter="all">
        <span class="mr-2">📂</span> Todos (${this.documents.length})
      </button>
    `;

    // Botones por Plantilla
    html += activeFilters
      .map(
        (f) => `
      <button class="filter-btn flex items-center px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap border ${
        this.currentFilter === f.id
          ? "text-white shadow-md transform scale-105"
          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
      }" 
      style="${
        this.currentFilter === f.id
          ? `background-color: ${f.color}; border-color: ${f.color};`
          : ""
      }"
      data-filter="${f.id}">
        <span class="mr-2">${f.icon}</span> ${
          f.name
        } <span class="ml-2 opacity-75 text-xs bg-black bg-opacity-10 px-1.5 rounded-full">${
          f.count
        }</span>
      </button>
    `
      )
      .join("");

    return html;
  }

  renderEmptyState() {
    return `
      <div class="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-box-open text-gray-400 text-3xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900">Tu bóveda está vacía</h3>
        <p class="mt-1 text-gray-500 max-w-sm mx-auto">Comienza a proteger tu información personal creando tu primer documento cifrado.</p>
        <div class="mt-6">
          <button id="createFirstDocBtn" class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
            <i class="fas fa-plus mr-2"></i>
            Crear Nuevo Documento
          </button>
        </div>
      </div>
    `;
  }

  renderDocumentCard(doc) {
    const date = new Date(doc.metadata.updatedAt).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    // Obtener color e icono frescos de la plantilla (por si cambiaron)
    const template = this.templatesMap[doc.templateId] || {};
    const icon = template.icon || doc.metadata.icon || "📄";
    const color = template.color || "#3B82F6";

    return `
      <div class="vault-card bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer p-4 group" data-id="${
        doc.id
      }">
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <span class="inline-flex items-center justify-center h-10 w-10 rounded-lg text-xl" 
                    style="background-color: ${color}20; color: ${color}">
                ${icon}
              </span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-bold text-gray-900 truncate">
                ${doc.metadata.title || "Sin Título"}
              </p>
              <p class="text-xs text-gray-500 truncate">
                ${template.name || "Documento"} • ${date}
              </p>
            </div>
          </div>
          <div class="opacity-0 group-hover:opacity-100 transition-opacity">
            <i class="fas fa-chevron-right text-gray-400"></i>
          </div>
        </div>
        <div class="mt-3 flex items-center justify-between text-xs">
          <div class="flex items-center text-green-600 bg-green-50 px-2 py-1 rounded">
            <i class="fas fa-lock mr-1"></i> E2EE
          </div>
          <span class="text-gray-400 font-mono">v${doc.version || 1}</span>
        </div>
      </div>
    `;
  }

  setupListeners(container) {
    // Listeners de Filtros
    container.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const filter = e.currentTarget.dataset.filter;
        this.currentFilter = filter;
        this.render(); // Re-renderizar solo la vista (no recarga datos de red)
      });
    });

    // Listeners de Tarjetas
    container.querySelectorAll(".vault-card").forEach((card) => {
      card.addEventListener("click", () => {
        const docId = card.dataset.id;
        this.onDocumentSelect(docId);
      });
    });
  }
}
