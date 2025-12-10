// src/components/VaultList.js
import { documentService } from "../services/documents/index.js";
import { templateService } from "../services/templates/index.js";

export class VaultList {
  constructor(onDocumentSelect, onNewDocument) {
    this.onDocumentSelect = onDocumentSelect;
    this.onNewDocument = onNewDocument;
    this.documents = [];
    this.templatesMap = {};
    this.isLoading = false;
    this.currentFilter = "all";
  }

  async loadDocuments() {
    this.isLoading = true;
    this.render(); // Renderiza el Skeleton loader

    try {
      const [docs, templates] = await Promise.all([
        documentService.getAllDocuments(),
        templateService.getUserTemplates(),
      ]);

      this.documents = docs;
      this.templatesMap = templates.reduce((acc, t) => {
        acc[t.id] = t;
        return acc;
      }, {});
    } catch (error) {
      console.error("Error cargando vault:", error);
      this.error = "No se pudieron recuperar los datos seguros.";
    } finally {
      this.isLoading = false;
      this.render();
    }
  }

  getActiveFilters() {
    const counts = this.documents.reduce((acc, doc) => {
      const tid = doc.templateId;
      acc[tid] = (acc[tid] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(counts).map((templateId) => {
      const template = this.templatesMap[templateId] || {
        name: "Otros",
        icon: "📦",
        color: "#94a3b8", // slate-400
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

    // 1. Estado de Carga (Skeleton UI)
    if (this.isLoading) {
      container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          ${Array(6)
            .fill(0)
            .map(
              () => `
            <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 animate-pulse">
              <div class="flex items-center space-x-4 mb-4">
                <div class="h-12 w-12 bg-slate-200 rounded-lg"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div class="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
              <div class="h-2 bg-slate-200 rounded w-full mt-4"></div>
            </div>
          `
            )
            .join("")}
        </div>
      `;
      return;
    }

    // 2. Estado de Error
    if (this.error) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-12 text-center px-4">
          <div class="bg-red-50 p-4 rounded-full mb-4">
            <i class="fas fa-exclamation-triangle text-3xl text-red-500"></i>
          </div>
          <h3 class="text-lg font-bold text-slate-800">Hubo un problema</h3>
          <p class="text-slate-500 mb-6">${this.error}</p>
          <button id="retryLoadBtn" class="px-6 py-2 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 font-medium text-slate-700 transition">
            Intentar nuevamente
          </button>
        </div>
      `;
      document
        .getElementById("retryLoadBtn")
        ?.addEventListener("click", () => this.loadDocuments());
      return;
    }

    // 3. Estado Vacío (Sin documentos)
    if (this.documents.length === 0) {
      container.innerHTML = this.renderEmptyState();
      document
        .getElementById("createFirstDocBtn")
        ?.addEventListener("click", () => this.onNewDocument());
      return;
    }

    // 4. Renderizado Normal
    const filteredDocs =
      this.currentFilter === "all"
        ? this.documents
        : this.documents.filter((d) => d.templateId === this.currentFilter);

    container.innerHTML = `
      <div class="p-1">
        <div class="flex space-x-3 mb-8 overflow-x-auto pb-4 no-scrollbar items-center">
            ${this.renderFilters()}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          ${filteredDocs.map((doc) => this.renderDocumentCard(doc)).join("")}
        </div>
        
        ${
          filteredDocs.length === 0
            ? `
          <div class="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
             <i class="fas fa-filter text-4xl text-slate-300 mb-3"></i>
             <p class="text-slate-500 font-medium">No hay documentos en esta categoría.</p>
             <button class="mt-4 text-primary hover:text-primary-hover font-medium text-sm" data-filter="all" onclick="document.querySelector('[data-filter=all]').click()">
               Ver todos los documentos
             </button>
          </div>
        `
            : ""
        }
      </div>
    `;

    this.setupListeners(container);
  }

  renderFilters() {
    const activeFilters = this.getActiveFilters();

    // Helper para generar botones
    const createBtn = (id, label, icon, count, color = null) => {
      const isActive = this.currentFilter === id;
      // Estilo base
      let classes =
        "filter-btn flex-shrink-0 flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border cursor-pointer select-none ";

      if (isActive) {
        classes +=
          "bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-200 scale-105";
        // Si tiene color personalizado y está activo, usamos ese color
        if (color)
          return `<button class="${classes}" style="background-color: ${color}; border-color: ${color};" data-filter="${id}"><span class="mr-2">${icon}</span>${label}<span class="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">${count}</span></button>`;
      } else {
        classes +=
          "bg-white text-slate-600 border-slate-200 hover:border-primary/30 hover:bg-slate-50 hover:shadow-sm";
      }

      return `
        <button class="${classes}" data-filter="${id}">
          <span class="mr-2">${icon}</span>
          ${label}
          <span class="ml-2 ${
            isActive ? "bg-white/20" : "bg-slate-100 text-slate-500"
          } px-2 py-0.5 rounded-full text-xs transition-colors">
            ${count}
          </span>
        </button>
      `;
    };

    let html = createBtn("all", "Todos", "📂", this.documents.length);
    html += activeFilters
      .map((f) => createBtn(f.id, f.name, f.icon, f.count, f.color))
      .join("");
    return html;
  }

  renderEmptyState() {
    return `
      <div class="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-200 mx-4">
        <div class="relative w-24 h-24 mx-auto mb-6">
           <div class="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25"></div>
           <div class="relative bg-blue-50 w-full h-full rounded-full flex items-center justify-center">
             <i class="fas fa-shield-alt text-primary text-4xl"></i>
           </div>
        </div>
        <h3 class="text-xl font-bold text-slate-800 mb-2">Tu Bóveda está lista</h3>
        <p class="text-slate-500 max-w-md mx-auto mb-8">
          Tus datos personales merecen la mejor seguridad. Comienza agregando tu primer registro cifrado de extremo a extremo.
        </p>
        <button id="createFirstDocBtn" class="inline-flex items-center px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-lg shadow-blue-500/30 font-bold transition-all hover:-translate-y-1">
          <i class="fas fa-plus mr-2"></i>
          Crear Primer Documento
        </button>
      </div>
    `;
  }

  renderDocumentCard(doc) {
    const date = new Date(doc.metadata.updatedAt).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const template = this.templatesMap[doc.templateId] || {};
    const icon = template.icon || doc.metadata.icon || "📄";
    const color = template.color || "#64748b"; // slate-500 default

    return `
      <div class="vault-card group relative bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden" data-id="${
        doc.id
      }">
        
        <div class="absolute top-0 left-0 right-0 h-1.5" style="background-color: ${color}"></div>
        
        <div class="flex items-start justify-between mt-2">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner" 
                 style="background-color: ${color}15; color: ${color}">
              ${icon}
            </div>
            <div class="min-w-0">
              <h4 class="text-base font-bold text-slate-800 truncate pr-2 group-hover:text-primary transition-colors">
                ${doc.metadata.title || "Sin Título"}
              </h4>
              <p class="text-xs font-medium text-slate-500 uppercase tracking-wide">
                ${template.name || "Documento"}
              </p>
            </div>
          </div>
          
          <div class="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
            <i class="fas fa-chevron-right text-xs"></i>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
           <div class="flex items-center text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md font-medium">
             <i class="fas fa-lock mr-1.5 text-[10px]"></i> E2EE
           </div>
           <div class="flex items-center text-slate-400">
             <i class="far fa-clock mr-1.5"></i> ${date}
           </div>
        </div>
      </div>
    `;
  }

  setupListeners(container) {
    container.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        // Encontrar el botón clickeado incluso si se clickea en el icono hijo
        const target = e.currentTarget;
        this.currentFilter = target.dataset.filter;
        this.render();
      });
    });

    container.querySelectorAll(".vault-card").forEach((card) => {
      card.addEventListener("click", () => {
        const docId = card.dataset.id;
        this.onDocumentSelect(docId);
      });
    });
  }
}
