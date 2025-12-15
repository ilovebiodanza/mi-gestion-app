// src/components/editor/DocumentEditor.js

import { documentService } from "../../services/documents/index.js";
import { encryptionService } from "../../services/encryption/index.js";
import { FormManager } from "./core/FormManager.js";
import { registerCoreFields } from "./core/index.js";

export class DocumentEditor {
  constructor(initialData, onSaveSuccess, onCancel) {
    this.initialData = initialData;
    this.onSaveSuccess = onSaveSuccess;
    this.onCancel = onCancel;

    this.isEditing = !!initialData.documentId;
    this.documentId = initialData.documentId || null;

    this.template = initialData.template || null;
    this.initialFormData = initialData.formData || {};
    this.documentMetadata = initialData.metadata || {};

    this.isSubmitting = false;
    this.formManager = null;

    registerCoreFields();

    if (this.isEditing && !this.template) {
      this.checkSecurityAndLoad();
    }
  }

  checkSecurityAndLoad() {
    if (!encryptionService.isReady()) {
      if (window.app && window.app.requireEncryption) {
        window.app.requireEncryption(() => this.loadExistingDocument());
      } else {
        this.renderError("Seguridad no inicializada. Recarga la página.");
      }
    } else {
      this.loadExistingDocument();
    }
  }

  async loadExistingDocument() {
    const container = document.getElementById("editorContainer");
    if (container) {
      container.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20">
            <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-brand-600 mb-4"></div>
            <p class="text-slate-500 font-medium">Descifrando información segura...</p>
        </div>`;
    }

    try {
      const docData = await documentService.getById(this.documentId);
      this.template = docData.template;
      this.initialFormData = docData.data;
      this.documentMetadata = {
        title: docData.title,
        tags: docData.tags || [],
      };
      this.render();
      this.setupEventListeners();
    } catch (error) {
      console.error("Error cargando:", error);
      this.renderError("No se pudo acceder al documento cifrado.");
    }
  }

  render() {
    const container = document.getElementById("editorContainer");
    if (!container || !this.template) return;

    this.formManager = new FormManager(
      this.template.fields,
      this.initialFormData
    );

    const initialTitle = this.documentMetadata.title || "";
    // Usamos el color de la plantilla o el brand por defecto
    const accentColor = this.template.color || "#3b82f6";
    const iconVal = this.template.icon || "📄";

    // Renderizado del icono
    const isFontAwesome = iconVal.includes("fa-") || iconVal.includes("fa ");
    const iconHtml = isFontAwesome
      ? `<i class="${iconVal} text-2xl"></i>`
      : `<span class="text-2xl">${iconVal}</span>`;

    // --- DISEÑO TIPO "PAPEL" ---
    const htmlContent = `
      <div class="max-w-4xl mx-auto bg-white rounded-xl shadow-card border border-slate-200 overflow-hidden animate-slide-up relative flex flex-col min-h-[600px]">
        
        <div class="px-6 py-4 bg-white border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center sticky top-0 z-30 gap-4 shadow-sm">
          
          <div class="flex items-center gap-4 w-full sm:w-auto flex-1">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm border border-slate-100 flex-shrink-0"
                 style="background-color: ${accentColor}10; color: ${accentColor}">
              ${iconHtml}
            </div>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                 <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                    ${this.template.name}
                 </span>
                 ${
                   this.isEditing
                     ? '<span class="flex items-center gap-1 text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-100"><i class="fas fa-pen"></i> Editando</span>'
                     : '<span class="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100"><i class="fas fa-star"></i> Nuevo</span>'
                 }
              </div>
              
              <input type="text" id="docTitleInput" 
                  class="w-full bg-transparent border-0 border-b border-transparent hover:border-slate-200 focus:border-brand-500 p-0 text-xl font-bold text-slate-900 placeholder-slate-300 focus:ring-0 transition-all truncate" 
                  value="${initialTitle}" 
                  placeholder="Título del documento..." 
                  autocomplete="off"
                  required autofocus>
            </div>
          </div>

          <div class="flex gap-3 w-full sm:w-auto justify-end">
             <button id="cancelEditBtn" class="px-4 py-2 rounded-lg text-slate-600 font-medium hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-sm">
               Cancelar
             </button>
             <button id="saveDocBtn" class="px-5 py-2 rounded-lg bg-brand-600 text-white font-semibold shadow-md hover:bg-brand-700 hover:shadow-lg transition-all flex items-center gap-2 text-sm disabled:opacity-70 disabled:cursor-wait">
               <i class="fas fa-save"></i> 
               <span>${this.isEditing ? "Guardar Cambios" : "Guardar"}</span>
             </button>
          </div>
        </div>

        <div class="p-6 sm:p-10 bg-white">
          <input type="hidden" id="docTagsInput" value="${(
            this.documentMetadata.tags || []
          ).join(", ")}">
          
          <form id="dynamicForm" class="grid grid-cols-1 gap-8 animate-fade-in">
             ${this.formManager.renderHtml()}
          </form>
        </div>
        
        <div class="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center">
             <p class="text-[10px] text-slate-400 font-mono">
                <i class="fas fa-lock text-emerald-500 mr-1"></i> Contenido cifrado de extremo a extremo antes de guardar.
             </p>
        </div>
      </div>
    `;

    if (container) container.innerHTML = htmlContent;
    return htmlContent;
  }

  setupEventListeners() {
    const saveBtn = document.getElementById("saveDocBtn");
    const cancelBtn = document.getElementById("cancelEditBtn");

    if (saveBtn) saveBtn.onclick = () => this.handleSave();
    if (cancelBtn) cancelBtn.onclick = () => this.onCancel();

    const formContainer = document.getElementById("dynamicForm");
    if (formContainer && this.formManager) {
      this.formManager.postRender(formContainer);
    }
  }

  async handleSave() {
    if (this.isSubmitting) return;

    const titleInput = document.getElementById("docTitleInput");
    const title = titleInput.value.trim();
    if (!title) {
      // Feedback visual en el input
      titleInput.classList.add("border-red-500", "animate-pulse");
      titleInput.focus();
      setTimeout(
        () => titleInput.classList.remove("border-red-500", "animate-pulse"),
        2000
      );
      return;
    }

    const formData = this.formManager.getValidData();
    if (!formData) {
      alert("Por favor corrige los errores marcados en el formulario.");
      return;
    }

    const tagsInput = document.getElementById("docTagsInput");
    let tags = tagsInput
      ? tagsInput.value
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t)
      : [];

    this.updateEditorState(true, "Cifrando...");

    try {
      const documentPayload = {
        title: title,
        templateId: this.template.id,
        template: this.template,
        data: formData,
        tags: tags,
        updatedAt: new Date().toISOString(),
      };

      let savedDoc = null;
      if (this.isEditing) {
        savedDoc = await documentService.update(
          this.documentId,
          documentPayload
        );
      } else {
        savedDoc = await documentService.create(documentPayload);
      }

      // Éxito -> Navegamos
      if (savedDoc && savedDoc.id) this.onSaveSuccess(savedDoc.id);
      else this.onSaveSuccess();
    } catch (error) {
      console.error("Error save:", error);
      alert("Error al guardar: " + error.message);
      this.updateEditorState(false);
    }
  }

  updateEditorState(isLoading, message = null) {
    this.isSubmitting = isLoading;
    const btn = document.getElementById("saveDocBtn");
    if (!btn) return;

    if (isLoading) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> ${message}`;
    } else {
      btn.disabled = false;
      btn.innerHTML = this.isEditing
        ? `<i class="fas fa-save"></i> Guardar Cambios`
        : `<i class="fas fa-save"></i> Guardar`;
    }
  }

  renderError(msg) {
    const container = document.getElementById("editorContainer");
    if (container) {
      container.innerHTML = `
            <div class="p-8 text-center max-w-lg mx-auto mt-10">
                <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                    <i class="fas fa-times"></i>
                </div>
                <h3 class="text-lg font-bold text-slate-900 mb-2">Error</h3>
                <p class="text-slate-500 mb-6">${msg}</p>
                <button onclick="window.location.reload()" class="px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition text-sm font-medium">
                    Recargar
                </button>
            </div>`;
    }
  }
}
