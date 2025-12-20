import { documentService } from "../../services/documents/index.js";
import { templateService } from "../../services/templates/index.js";
import { encryptionService } from "../../services/encryption/index.js";
import { copyToWhatsApp } from "./WhatsAppExporter.js";
import { printDocument } from "./PrintExporter.js";
import { getLocalCurrency } from "../../utils/helpers.js";
import { globalPlayer } from "../common/MediaPlayer.js";
// USAMOS EL NUEVO REGISTRY
import { ElementRegistry } from "../elements/ElementRegistry.js";

export class DocumentViewer {
  constructor(docId, onBack) {
    this.docId = docId;
    this.onBack = onBack;
    this.document = null;
    this.template = null;
    this.decryptedData = null;
    this.currencyConfig = getLocalCurrency();
    this.viewersInstanceCache = [];
  }

  // --- 1. MÉTODO REQUERIDO POR APP.JS (Restaurado) ---
  render() {
    return `<div id="documentViewerPlaceholder" class="animate-fade-in pb-20"></div>`;
  }

  // --- 2. CARGA DE DATOS ---
  async load() {
    this.renderLoading();

    if (!encryptionService.isReady()) {
      if (window.app && window.app.requireEncryption) {
        window.app.requireEncryption(() => this.load());
        return;
      }
      this.renderError("Cifrado no disponible.");
      return;
    }

    try {
      this.document = await documentService.getById(this.docId);
      this.template = await templateService.getTemplateById(
        this.document.templateId
      );

      if (!this.template) throw new Error("Plantilla no encontrada.");

      this.decryptedData = await encryptionService.decryptDocument(
        this.document.encryptedContent
      );

      this.renderContent();
    } catch (error) {
      console.error(error);
      if (
        error.name === "OperationError" ||
        error.message.includes("Decrypt")
      ) {
        if (window.app && window.app.requireEncryption) {
          window.app.requireEncryption(() => this.load(), true);
          return;
        }
      }
      this.renderError(error.message);
    }
  }

  renderLoading() {
    const el = document.getElementById("documentViewerPlaceholder");
    if (el)
      el.innerHTML = `<div class="flex flex-col items-center justify-center py-20"><div class="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-brand-600 mb-4"></div><p class="text-slate-400 text-sm">Cargando...</p></div>`;
  }

  renderError(msg) {
    const el = document.getElementById("documentViewerPlaceholder");
    if (el)
      el.innerHTML = `<div class="bg-red-50 border border-red-100 text-red-600 p-4 rounded-lg text-center text-sm">${msg}</div>`;
  }

  // --- 3. RENDERIZADO DEL CONTENIDO (Optimizado con Elements) ---
  renderContent() {
    const container = document.getElementById("documentViewerPlaceholder");
    if (!container) return;

    globalPlayer.renderBase();
    this.viewersInstanceCache = []; // Reset cache

    // Helper para renderizar campos usando ElementRegistry
    const renderFieldsHTML = (fields) => {
      return fields
        .map((field) => {
          const value = this.decryptedData[field.id];

          try {
            // A. Instanciar Elemento Nuevo
            const ElementClass = ElementRegistry.get(field.type);
            const element = new ElementClass(field, value);

            // B. Obtener HTML
            const viewerHtml = element.renderViewer();

            // C. Cachear Interactividad (Post-Render)
            if (typeof element.postRenderViewer === "function") {
              this.viewersInstanceCache.push(element);
            }

            // D. Layout (Columnas)
            const columns = ElementClass.getColumns
              ? ElementClass.getColumns()
              : 1;

            // Caso especial: Separadores (Ancho completo, sin caja)
            if (field.type === "separator") {
              return `<div class="col-span-1 md:col-span-2">${viewerHtml}</div>`;
            }

            // Caso especial: Tablas (Ancho completo)
            if (field.type === "table") {
              return `<div class="col-span-1 md:col-span-2 mt-4 mb-4">${viewerHtml}</div>`;
            }

            const spanClass =
              columns === 2 ? "col-span-1 md:col-span-2" : "col-span-1";

            return `
              <div class="${spanClass} group border-b border-slate-100 pb-3 last:border-0 hover:bg-slate-50/50 transition-colors rounded-lg px-2 -mx-2">
                <dt class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                   ${field.label}
                </dt>
                <dd class="text-sm text-slate-800 font-medium break-words leading-relaxed">
                   ${viewerHtml} 
                </dd>
              </div>`;
          } catch (e) {
            console.error(`Error renderizando ${field.label}:`, e);
            return `<div class="col-span-1 text-red-400 text-xs">Error visualizando campo</div>`;
          }
        })
        .join("");
    };

    // Agrupación de Campos (Igual que antes)
    const groups = this.groupFields();
    let fieldsHtml = "";

    if (groups.length === 1) {
      fieldsHtml = `<dl class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">${renderFieldsHTML(
        groups[0].fields
      )}</dl>`;
    } else {
      fieldsHtml = `
        <div class="viewer-layout-container mt-6">
            <div class="flex border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar gap-6 print:hidden">
                ${groups
                  .map(
                    (g, i) => `
                    <button type="button" class="viewer-tab-trigger pb-3 text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                      i === 0
                        ? "text-brand-600 border-b-2 border-brand-600"
                        : "text-slate-500 hover:text-slate-700 border-b-2 border-transparent"
                    }" data-target="${g.id}">
                        ${g.label}
                    </button>`
                  )
                  .join("")}
            </div>
            <div class="space-y-4">
                ${groups
                  .map(
                    (g, i) => `
                    <div class="viewer-group-container ${
                      i === 0 ? "" : "hidden"
                    } animate-fade-in" id="${g.id}">
                        <dl class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">${renderFieldsHTML(
                          g.fields
                        )}</dl>
                    </div>`
                  )
                  .join("")}
            </div>
        </div>`;
    }

    // HTML Principal del Viewer
    const accentColor = this.template.color || "#3b82f6";
    const updatedAt = new Date(
      this.document.metadata.updatedAt
    ).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    container.innerHTML = `
      <div class="flex items-center justify-between mb-4 no-print">
         <button id="backBtn" class="flex items-center text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm gap-2 px-3 py-2 rounded-lg hover:bg-slate-100">
            <i class="fas fa-arrow-left"></i> Volver
         </button>
         <div class="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
            <button id="whatsappDocBtn" class="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><i class="fab fa-whatsapp text-lg"></i></button>
            <button id="pdfDocBtn" class="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"><i class="fas fa-print text-lg"></i></button>
            <div class="w-px h-5 bg-slate-200 mx-1"></div>
            <button id="deleteDocBtn" class="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><i class="far fa-trash-alt text-lg"></i></button>
            <button id="editDocBtn" class="ml-1 px-4 h-9 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-colors flex items-center gap-2"><i class="fas fa-pen"></i> Editar</button>
         </div>
      </div>

      <div id="documentCard" class="bg-white rounded-none sm:rounded-xl shadow-card border-y sm:border border-slate-200 min-h-[600px] print:shadow-none print:border-none">
        <div class="px-5 py-4 border-b border-slate-100 bg-slate-50/30 print:bg-white print:border-b-2 print:border-black">
             <div class="flex items-start gap-4"> 
                <div class="w-12 h-12 rounded-lg flex items-center justify-center text-xl shadow-sm border border-slate-100 bg-white print:hidden" style="color: ${accentColor}">${
      this.template.icon || "📄"
    }</div>
                <div>
                   <div class="flex items-center gap-2 mb-1"><span class="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">${
                     this.template.name
                   }</span></div>
                   <h1 class="text-2xl font-bold text-slate-900 leading-tight mb-1">${
                     this.document.metadata.title
                   }</h1>
                   <p class="text-[11px] text-slate-400 flex items-center gap-3 font-mono"><span><i class="far fa-clock mr-1"></i> ${updatedAt}</span><span class="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded"><i class="fas fa-shield-alt mr-1"></i> E2EE</span></p>
                </div>
             </div>
        </div>
        <div class="p-4 sm:p-5">${fieldsHtml}</div>
      </div>
      
      <div id="rowDetailModal" class="fixed inset-0 z-50 hidden no-print"><div class="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" id="modalBackdrop"></div><div class="flex items-center justify-center min-h-screen p-4 pointer-events-none"><div class="bg-white rounded-xl shadow-2xl w-full max-w-lg pointer-events-auto flex flex-col max-h-[80vh] animate-slide-up"><div class="px-5 py-4 border-b border-slate-100 flex justify-between items-center"><h3 class="font-bold text-slate-800">Detalle</h3><button class="close-modal text-slate-400 hover:text-slate-600"><i class="fas fa-times"></i></button></div><div class="p-5 overflow-y-auto" id="rowDetailContent"></div></div></div></div>`;

    this.setupListeners();
  }

  // --- 4. LISTENERS (Simplificado) ---
  setupListeners() {
    const container = document.getElementById("documentViewerPlaceholder");

    // Hidratar Viewers (Tablas, Secretos, etc.)
    this.viewersInstanceCache.forEach((viewer) => {
      if (viewer.postRenderViewer) viewer.postRenderViewer(container);
    });

    // Listeners UI
    document
      .getElementById("backBtn")
      ?.addEventListener("click", () => this.onBack());
    document
      .getElementById("editDocBtn")
      ?.addEventListener("click", () => this.handleEdit());
    document
      .getElementById("deleteDocBtn")
      ?.addEventListener("click", () => this.handleDelete());
    document
      .getElementById("whatsappDocBtn")
      ?.addEventListener("click", () => this.handleCopyToWhatsApp());
    document
      .getElementById("pdfDocBtn")
      ?.addEventListener("click", () => this.showPrintOptions());

    // Tabs
    const tabs = container.querySelectorAll(".viewer-tab-trigger");
    const groups = container.querySelectorAll(".viewer-group-container");
    tabs.forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.target;
        tabs.forEach((t) =>
          t.classList.remove("text-brand-600", "border-brand-600", "border-b-2")
        );
        tabs.forEach((t) =>
          t.classList.add("text-slate-500", "border-transparent")
        );

        btn.classList.remove("text-slate-500", "border-transparent");
        btn.classList.add("text-brand-600", "border-brand-600", "border-b-2");

        groups.forEach((g) =>
          g.id === target
            ? g.classList.remove("hidden")
            : g.classList.add("hidden")
        );
      });
    });
  }

  // --- HELPERS (Sin cambios lógicos) ---
  groupFields() {
    const groups = [];
    let current = {
      id: "group-main",
      label: "Información General",
      fields: [],
    };
    this.template.fields.forEach((f) => {
      if (f.type === "separator") {
        if (current.fields.length) groups.push(current);
        current = {
          id: `group-${f.id}`,
          label: f.label,
          fields: [],
          isSeparator: true,
        };
      } else {
        current.fields.push(f);
      }
    });
    if (current.fields.length) groups.push(current);
    return groups;
  }

  async handleDelete() {
    if (confirm("¿Eliminar documento?")) {
      await documentService.delete(this.docId);
      this.onBack();
    }
  }
  handleEdit() {
    this.onBack({
      documentId: this.docId,
      template: this.template,
      formData: this.decryptedData,
      metadata: this.document.metadata,
    });
  }
  async handleCopyToWhatsApp() {
    try {
      await copyToWhatsApp(
        this.document.metadata,
        this.template,
        this.decryptedData,
        this.currencyConfig
      );
      alert("Copiado al portapapeles");
    } catch (e) {
      alert("Error al copiar");
    }
  }

  showPrintOptions() {
    // Reutiliza tu lógica existente de modal de impresión aquí
    // O llámala si la tienes en otro helper.
    // Para brevedad, asumo que llamas a this.triggerPrint('standard');
    const data = { ...this.document.metadata, id: this.document.id };
    printDocument(data, this.template, this.decryptedData, "standard");
  }
}
