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
        this.renderError(
          "Sistema de seguridad no disponible. Recarga la página."
        );
      }
    } else {
      this.loadExistingDocument();
    }
  }

  async loadExistingDocument() {
    try {
      document.getElementById("editorContainer").innerHTML = `
        <div class="flex flex-col items-center justify-center py-12">
            <i class="fas fa-circle-notch fa-spin text-4xl text-indigo-500 mb-4"></i>
            <p class="text-slate-500 animate-pulse">Descifrando documento...</p>
        </div>`;

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
      console.error("Error cargando documento:", error);
      this.renderError("No se pudo cargar o descifrar el documento.");
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
    const color = this.template.color || "#6366f1";

    // Icono
    const iconVal = this.template.icon || "📄";
    const isFontAwesome = iconVal.includes("fa-") || iconVal.includes("fa ");

    let iconHtml;
    if (isFontAwesome) {
      iconHtml = `<i class="fas ${iconVal} text-3xl"></i>`;
    } else {
      iconHtml = `<span class="text-3xl leading-none select-none">${iconVal}</span>`;
    }

    const htmlContent = `
      <div class="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden animate-fade-in-up">
        
        <div class="px-6 py-6 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center sticky top-0 z-20 backdrop-blur-md bg-opacity-90 gap-4">
          
          <div class="flex items-center gap-5 w-full sm:w-auto flex-1 overflow-hidden">
            <div class="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0 transition-transform hover:scale-105"
                 style="background-color: ${color}15; color: ${color}">
              ${iconHtml}
            </div>
            
            <div class="flex-1 w-full min-w-0">
              <div class="flex items-center gap-2 mb-1">
                 <span class="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">
                    ${this.template.name}
                 </span>
                 ${
                   this.isEditing
                     ? '<span class="text-[10px] text-amber-500 font-bold"><i class="fas fa-pencil-alt"></i> Editando</span>'
                     : ""
                 }
              </div>
              
              <div class="relative group">
                <input type="text" id="docTitleInput" 
                  class="w-full bg-transparent border-none p-0 text-2xl font-bold text-slate-800 placeholder-slate-300 focus:ring-0 focus:outline-none transition-colors truncate group-hover:bg-white/50 rounded-lg" 
                  value="${initialTitle}" 
                  placeholder="Escribe la identificación..." 
                  autocomplete="off"
                  required autofocus>
                <i class="fas fa-pen text-slate-300 absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-sm"></i>
              </div>
            </div>
          </div>

          <div class="flex gap-3 w-full sm:w-auto justify-end sm:pl-4">
             <button id="cancelEditBtn" class="px-4 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-all text-xs uppercase tracking-wide">
               Cancelar
             </button>
             <button id="saveDocBtn" class="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all flex items-center text-sm transform active:scale-95">
               <i class="fas fa-save mr-2"></i> ${
                 this.isEditing ? "Actualizar" : "Guardar"
               }
             </button>
          </div>
        </div>

        <div class="p-8">
          <input type="hidden" id="docTagsInput" value="${(
            this.documentMetadata.tags || []
          ).join(", ")}">

          <form id="dynamicForm" class="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-6 animate-fade-in">
             ${this.formManager.renderHtml()}
          </form>

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
    const tagsInput = document.getElementById("docTagsInput");

    const title = titleInput.value.trim();
    if (!title) {
      alert(
        "Por favor, escribe una identificación para este registro en el encabezado."
      );
      titleInput.focus();
      return;
    }

    const formData = this.formManager.getValidData();
    if (!formData) {
      alert(
        "Hay errores en el formulario. Por favor revisa los campos marcados."
      );
      return;
    }

    let tags = [];
    if (tagsInput) {
      tags = tagsInput.value
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);
    }

    this.updateEditorState(true, "Cifrando y guardando...");

    try {
      const documentPayload = {
        title: title,
        templateId: this.template.id,
        template: this.template,
        data: formData,
        tags: tags,
        updatedAt: new Date().toISOString(),
      };

      if (this.isEditing) {
        await documentService.update(this.documentId, documentPayload);
      } else {
        await documentService.create(documentPayload);
      }

      this.onSaveSuccess();
    } catch (error) {
      console.error("Error guardando:", error);
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
      btn.innerHTML = `<i class="fas fa-circle-notch fa-spin mr-2"></i> ${message}`;
      btn.classList.add("opacity-75", "cursor-wait");
    } else {
      btn.disabled = false;
      const icon = this.isEditing ? "fa-sync-alt" : "fa-save";
      const text = this.isEditing ? "Actualizar" : "Guardar";
      btn.innerHTML = `<i class="fas ${icon} mr-2"></i> ${text}`;
      btn.classList.remove("opacity-75", "cursor-wait");
    }
  }

  renderError(msg) {
    const container = document.getElementById("editorContainer");
    if (container) {
      container.innerHTML = `
            <div class="p-8 text-center bg-white rounded-3xl border border-red-100 shadow-xl max-w-2xl mx-auto mt-10">
                <h3 class="text-xl font-bold text-slate-800 mb-2">Algo salió mal</h3>
                <p class="text-slate-500 mb-6">${msg}</p>
                <button onclick="window.location.reload()" class="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition">
                    Recargar Página
                </button>
            </div>
        `;
    }
  }
}
