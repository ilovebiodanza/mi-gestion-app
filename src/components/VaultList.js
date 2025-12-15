// src/components/VaultList.js
import { documentService } from "../services/documents/index.js";
import { authService } from "../services/auth.js";
import { VaultSetupModal } from "./VaultSetupModal.js";
import { encryptionService } from "../services/encryption/index.js";
import { formatBytes } from "../utils/helpers.js";

export class VaultList {
  constructor(onViewDocument, onNewDocument) {
    this.onViewDocument = onViewDocument;
    this.documents = [];
    this.activeFilter = "all";

    // Interceptor para Setup de Bóveda
    this.onNewDocument = async () => {
      try {
        const isConfigured = await authService.isVaultConfigured();
        if (!isConfigured) {
          const setupModal = new VaultSetupModal(() => onNewDocument());
          setupModal.show();
        } else {
          // Lógica de encriptación global (window.app)
          if (window.app && window.app.requireEncryption) {
            window.app.requireEncryption(() => onNewDocument());
          } else if (!encryptionService.isReady()) {
            // Fallback si window.app no está listo
            alert("Por favor recarga la página para inicializar seguridad.");
          } else {
            onNewDocument();
          }
        }
      } catch (error) {
        console.error("Vault check error:", error);
        onNewDocument();
      }
    };
  }

  async loadDocuments() {
    const container = document.getElementById("vaultListContainer");
    if (!container) return;

    // Skeleton más sutil y profesional
    container.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        ${[1, 2, 3]
          .map(
            () => `
          <div class="bg-white rounded-xl p-6 border border-slate-200 h-40 animate-pulse flex flex-col justify-between">
            <div class="flex items-start justify-between">
               <div class="w-10 h-10 bg-slate-100 rounded-lg"></div>
               <div class="w-20 h-4 bg-slate-100 rounded"></div>
            </div>
            <div class="space-y-3">
               <div class="h-4 bg-slate-100 rounded w-3/4"></div>
               <div class="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>`;

    try {
      const [documents, stats] = await Promise.all([
        documentService.listDocuments(),
        documentService.getStorageStats(),
      ]);
      this.documents = documents;

      container.innerHTML = `
        <div class="flex flex-col-reverse md:flex-row justify-between items-start md:items-center mb-8 gap-6 animate-fade-in">
             <div id="vaultFiltersContainer" class="flex flex-wrap items-center gap-2"></div>
             <div id="vaultStorageWidget" class="w-full md:w-auto"></div>
        </div>
        <div id="vaultGridContainer" class="animate-slide-up"></div>
      `;

      this.renderStorageWidget(stats);
      this.renderFilters();
      this.renderGrid();
    } catch (error) {
      console.error("Error VaultList:", error);
      this.renderErrorState(container);
    }
  }

  renderStorageWidget(stats) {
    const container = document.getElementById("vaultStorageWidget");
    if (!container) return;

    // Límite visual de 50MB
    const STORAGE_LIMIT = 50 * 1024 * 1024;
    const percentage = Math.min(
      (stats.bytes / STORAGE_LIMIT) * 100,
      100
    ).toFixed(1);

    // Colores basados en el estado
    let progressColor = "bg-brand-600";
    let textColor = "text-brand-700";
    if (percentage > 75) {
      progressColor = "bg-amber-500";
      textColor = "text-amber-700";
    }
    if (percentage > 90) {
      progressColor = "bg-red-500";
      textColor = "text-red-700";
    }

    container.innerHTML = `
      <div class="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4 min-w-[260px]">
          <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
              <i class="fas fa-server"></i>
          </div>
          <div class="flex-1">
              <div class="flex justify-between items-end mb-2">
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Uso de Bóveda</span>
                  <span class="text-xs font-bold ${textColor}">${formatBytes(
      stats.bytes
    )}</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div class="${progressColor} h-1.5 rounded-full transition-all duration-1000" style="width: ${percentage}%"></div>
              </div>
          </div>
      </div>
    `;
  }

  renderFilters() {
    const filterContainer = document.getElementById("vaultFiltersContainer");
    if (!filterContainer || this.documents.length === 0) {
      if (filterContainer) filterContainer.innerHTML = "";
      return;
    }

    const stats = this.documents.reduce((acc, doc) => {
      const name = doc.templateName || "General";
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    const templateNames = Object.keys(stats).sort();

    const filters = [
      { id: "all", label: "Todos", count: this.documents.length },
      ...templateNames.map((name) => ({
        id: name,
        label: name,
        count: stats[name],
      })),
    ];

    filterContainer.innerHTML = filters
      .map((f) => {
        const isActive = this.activeFilter === f.id;
        const btnClass = isActive
          ? "bg-slate-800 text-white shadow-md border border-slate-800"
          : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 hover:border-slate-300";

        return `
          <button type="button" 
              class="filter-btn px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${btnClass}"
              data-filter="${f.id}">
              ${f.label}
              <span class="opacity-60 text-[10px]">(${f.count})</span>
          </button>
        `;
      })
      .join("");

    filterContainer.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.activeFilter = btn.dataset.filter;
        this.renderFilters();
        this.renderGrid();
      });
    });
  }

  renderGrid() {
    const gridContainer = document.getElementById("vaultGridContainer");
    if (!gridContainer) return;

    let displayDocs = this.documents;
    if (this.activeFilter !== "all") {
      displayDocs = this.documents.filter(
        (d) => (d.templateName || "General") === this.activeFilter
      );
    }

    if (displayDocs.length === 0) {
      if (this.documents.length === 0)
        this.renderEmptyStateTotal(gridContainer);
      else
        gridContainer.innerHTML = `<div class="text-center py-12 text-slate-400">No hay documentos en este filtro.</div>`;
      return;
    }

    gridContainer.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 pb-12">
        ${displayDocs.map((doc) => this.renderCardHtml(doc)).join("")}
      </div>
    `;

    gridContainer.querySelectorAll(".doc-card").forEach((card) => {
      card.addEventListener("click", () =>
        this.onViewDocument(card.dataset.id)
      );
    });
  }

  renderCardHtml(doc) {
    // Usamos el color guardado o un fallback neutro
    const color = doc.color || "#64748b";
    const icon = doc.icon || "📄";
    const title = doc.title || "Documento sin título";
    const templateName = doc.templateName || "Archivo";
    const date = new Date(doc.updatedAt).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    // Diseño de tarjeta limpio "Apple Style"
    return `
      <div class="doc-card group bg-white hover:bg-slate-50 rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-card hover:border-slate-300 transition-all duration-200 cursor-pointer relative overflow-hidden" data-id="${doc.id}">
          <div class="flex items-start justify-between mb-4">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-slate-50 border border-slate-100 group-hover:scale-110 transition-transform">
                  ${icon}
              </div>
              <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-1 rounded border border-slate-100">
                  ${templateName}
              </div>
          </div>
          
          <div class="mb-4">
              <h3 class="text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
                  ${title}
              </h3>
          </div>

          <div class="flex items-center justify-between pt-3 border-t border-slate-100">
              <span class="text-[10px] text-slate-400 font-medium">${date}</span>
              <i class="fas fa-lock text-[10px] text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" title="E2EE Protegido"></i>
          </div>
      </div>
    `;
  }

  renderEmptyStateTotal(container) {
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <i class="fas fa-safe text-2xl text-slate-300"></i>
          </div>
          <h3 class="text-slate-900 font-semibold mb-1">Tu bóveda está vacía</h3>
          <p class="text-slate-500 text-sm max-w-xs mb-6">Crea tu primer documento encriptado para comenzar a asegurar tu información.</p>
          <button id="btnEmptyStateNew" class="px-5 py-2 bg-white text-slate-700 border border-slate-300 hover:border-brand-500 hover:text-brand-600 rounded-lg shadow-sm transition-all text-sm font-medium">
            Comenzar ahora
          </button>
        </div>`;

    container
      .querySelector("#btnEmptyStateNew")
      ?.addEventListener("click", this.onNewDocument);
  }

  renderErrorState(container) {
    container.innerHTML = `
        <div class="p-4 bg-red-50 text-red-600 rounded-lg text-center text-sm border border-red-100">
          Error cargando documentos. <button id="retryBtn" class="underline font-bold">Reintentar</button>
        </div>`;
    document
      .getElementById("retryBtn")
      ?.addEventListener("click", () => this.loadDocuments());
  }
}
