// src/components/DocumentEditor.js

import { templateFormGenerator } from "../services/templates/form-generator.js";
import { documentService } from "../services/documents/index.js";

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

    if (this.isEditing && !this.template) {
      this.loadExistingDocument();
    }
  }

  async loadExistingDocument() {
    this.updateEditorState(true, "Cargando datos...");
    try {
      const loadedData = await documentService.loadDocumentForEditing(
        this.documentId
      );
      this.template = loadedData.template;
      this.initialFormData = loadedData.formData;
      this.documentMetadata = loadedData.metadata;

      this.render();
      this.setupEventListeners();
      this.updateEditorState(false);
    } catch (error) {
      console.error("Error al cargar documento:", error);
      this.renderError("Error al cargar datos cifrados: " + error.message);
    }
  }

  render() {
    if (!this.template && this.isEditing) {
      return `<div id="editorContainer" class="max-w-3xl mx-auto py-8"><div class="flex justify-center items-center"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div></div>`;
    }

    if (!this.template) {
      return `<div id="editorContainer">Error: Plantilla no definida.</div>`;
    }

    const title = this.isEditing
      ? `Editando: ${this.documentMetadata?.title || this.template.name}`
      : `Nuevo: ${this.template.name}`;
    const submitText = this.isEditing
      ? "Actualizar y Recifrar"
      : "Guardar y Cifrar";

    return `
      <div id="editorContainer" class="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in">
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <div class="flex items-center">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-xl mr-3" style="background-color: ${
              this.template.color
            }20; color: ${this.template.color}">${this.template.icon}</div>
            <div>
              <h2 class="text-lg font-bold text-gray-800">${title}</h2>
              <p class="text-xs text-gray-500">Los datos serán cifrados antes de guardarse</p>
            </div>
          </div>
          <button id="closeEditorBtn" class="text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
        </div>

        <div class="p-6">
          <div id="dynamicFormContainer">
            ${templateFormGenerator.generateFormHtml(
              this.template,
              this.initialFormData
            )}
          </div>

          <div class="mt-6 mb-6 flex items-start p-3 bg-green-50 border border-green-100 rounded-lg">
            <i class="fas fa-lock text-green-600 mt-1 mr-3"></i>
            <div class="text-sm text-green-800">
              <p class="font-medium">Protección E2EE Activa</p>
              <p class="text-green-700 opacity-90">Tu clave maestra se usará para sellar este documento digitalmente.</p>
            </div>
          </div>

          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <button id="cancelDocBtn" class="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition">Cancelar</button>
            <button id="saveDocBtn" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md hover:shadow-lg transition flex items-center">
              <i class="fas fa-save mr-2"></i> ${submitText}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  setupEventListeners() {
    document
      .getElementById("closeEditorBtn")
      ?.addEventListener("click", () => this.onCancel());
    document
      .getElementById("cancelDocBtn")
      ?.addEventListener("click", () => this.onCancel());
    document
      .getElementById("saveDocBtn")
      ?.addEventListener("click", () => this.handleSave());

    this.setupMathCalculations();
    this.setupTableInteractivity();
  }

  // --- LÓGICA DE TABLAS ---
  setupTableInteractivity() {
    const containers = document.querySelectorAll(".table-input-container");

    containers.forEach((container) => {
      const fieldId = container.dataset.fieldId;
      const hiddenInput = container.querySelector(`#${fieldId}`);
      const tbody = container.querySelector(".table-body");
      const addBtn = container.querySelector(".add-row-btn");
      // Leer definición de columnas
      let columnsDef = [];
      try {
        columnsDef = JSON.parse(container.nextElementSibling.textContent);
      } catch (e) {
        console.error("Error leyendo columnas", e);
      }

      // Función para renderizar el input correcto según el tipo
      const renderCellInput = (col, val) => {
        // Normalizar valor
        const value = val !== undefined && val !== null ? val : "";

        if (col.type === "boolean") {
          return `<input type="checkbox" class="h-4 w-4 text-blue-600 border-gray-300 rounded cell-input focus:ring-blue-500" 
                        data-col-id="${col.id}" ${value ? "checked" : ""}>`;
        }

        if (col.type === "select") {
          const options = (col.options || [])
            .map(
              (o) =>
                `<option value="${o}" ${
                  value === o ? "selected" : ""
                }>${o}</option>`
            )
            .join("");
          return `<select class="w-full text-sm border-gray-300 rounded cell-input focus:ring-blue-500 focus:border-blue-500" data-col-id="${col.id}">
                          <option value="">-</option>${options}
                        </select>`;
        }

        if (col.type === "date") {
          return `<input type="date" class="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 cell-input" 
                        data-col-id="${col.id}" value="${value}">`;
        }

        if (col.type === "secret") {
          return `<input type="password" class="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 cell-input" 
                        data-col-id="${col.id}" value="${value}" placeholder="••••">`;
        }

        // Para numbers, currency, percentage y text usamos 'text' para permitir fórmulas
        // Agregamos una clase 'math-input' si es numérico para activar la calculadora
        const isNumeric = ["number", "currency", "percentage"].includes(
          col.type
        );
        const inputClass = isNumeric ? "math-input" : "";
        const placeholder = isNumeric ? "0.00" : "";

        return `<input type="text" class="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 cell-input ${inputClass}" 
                    data-col-id="${col.id}" value="${value}" placeholder="${placeholder}">`;
      };

      const renderRow = (rowData = {}) => {
        const tr = document.createElement("tr");
        let tds = "";

        columnsDef.forEach((col) => {
          tds += `<td class="px-2 py-2 align-top">${renderCellInput(
            col,
            rowData[col.id]
          )}</td>`;
        });

        tds += `<td class="px-2 py-2 text-center align-top">
                <button type="button" class="text-red-400 hover:text-red-600 remove-row-btn p-1"><i class="fas fa-trash"></i></button>
            </td>`;

        tr.innerHTML = tds;
        tbody.appendChild(tr);

        // Activar listeners para los nuevos inputs matemáticos
        tr.querySelectorAll(".math-input").forEach((input) => {
          input.addEventListener("blur", () => this.evaluateMathInput(input));
          input.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === "=") {
              e.preventDefault();
              this.evaluateMathInput(input);
            }
          });
        });
      };

      // Cargar datos iniciales
      const initialData = JSON.parse(hiddenInput.value || "[]");
      initialData.forEach((row) => renderRow(row));

      // Listeners
      addBtn.addEventListener("click", () => renderRow({}));

      tbody.addEventListener("click", (e) => {
        if (e.target.closest(".remove-row-btn")) {
          e.target.closest("tr").remove();
          updateHiddenInput();
        }
      });

      tbody.addEventListener("input", () => updateHiddenInput());
      tbody.addEventListener("change", () => updateHiddenInput()); // Para selects y checks

      const updateHiddenInput = () => {
        const rows = [];
        tbody.querySelectorAll("tr").forEach((tr) => {
          const rowObj = {};
          tr.querySelectorAll(".cell-input").forEach((input) => {
            const colId = input.dataset.colId;
            let val;
            if (input.type === "checkbox") val = input.checked;
            else val = input.value;

            // Intentar convertir a número si corresponde a una columna numérica
            const colDef = columnsDef.find((c) => c.id === colId);
            if (
              colDef &&
              ["number", "currency", "percentage"].includes(colDef.type)
            ) {
              val = val === "" || isNaN(val) ? null : Number(val);
            }

            rowObj[colId] = val;
          });
          rows.push(rowObj);
        });
        hiddenInput.value = JSON.stringify(rows);
      };
    });
  }

  // --- LÓGICA MATEMÁTICA ---
  setupMathCalculations() {
    const numericFields = this.template.fields.filter((f) =>
      ["number", "currency", "percentage"].includes(f.type)
    );

    numericFields.forEach((field) => {
      const input = document.getElementById(field.id);
      if (!input) return;

      // Placeholder guía
      if (!input.value && !input.placeholder)
        input.placeholder = "Valor o fórmula (ej: 5+5)";

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === "=") {
          e.preventDefault();
          this.evaluateMathInput(input);
        }
      });

      input.addEventListener("blur", () => {
        this.evaluateMathInput(input);
      });
    });
  }

  evaluateMathInput(input) {
    const value = input.value.trim();
    if (!value) return;

    if (/^[\d\s\.\+\-\*\/\(\)]+$/.test(value) && /[\+\-\*\/]/.test(value)) {
      try {
        const result = new Function('"use strict";return (' + value + ")")();
        if (isFinite(result)) {
          input.value = Math.round(result * 100) / 100;
          // Disparar evento input para que la tabla se actualice si es una celda
          input.dispatchEvent(new Event("input", { bubbles: true }));

          input.classList.add("bg-green-50", "text-green-700");
          setTimeout(
            () => input.classList.remove("bg-green-50", "text-green-700"),
            500
          );
        }
      } catch (e) {
        console.warn("Fórmula inválida:", value);
      }
    }
  }

  async handleSave() {
    if (this.isSubmitting) return;

    const form = document.querySelector(`form[id^="templateForm_"]`);
    if (!form || !form.checkValidity()) {
      form?.reportValidity();
      return;
    }

    this.updateEditorState(
      true,
      this.isEditing ? "Actualizando..." : "Cifrando..."
    );

    try {
      // Forzar evaluación matemática final
      document
        .querySelectorAll(".math-input")
        .forEach((inp) => this.evaluateMathInput(inp));

      // Esperar un micro-tick para que se actualicen los hidden inputs de las tablas
      await new Promise((r) => setTimeout(r, 50));

      const formData = this.collectFormData();

      let result;
      if (this.isEditing) {
        result = await documentService.updateDocument(
          this.documentId,
          this.template,
          formData
        );
      } else {
        result = await documentService.createDocument(this.template, formData);
      }

      if (this.onSaveSuccess) this.onSaveSuccess(result);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar: " + error.message);
      this.updateEditorState(false);
    }
  }

  collectFormData() {
    const formData = {};

    this.template.fields.forEach((field) => {
      // Caso especial URL
      if (field.type === "url") {
        const urlInput = document.getElementById(`${field.id}_url`);
        const textInput = document.getElementById(`${field.id}_text`);
        if (urlInput) {
          formData[field.id] = {
            url: urlInput.value,
            text: textInput.value || "",
          };
        }
        return;
      }

      const input = document.getElementById(field.id);

      if (input) {
        if (field.type === "boolean") {
          formData[field.id] = input.checked;
        } else if (
          field.type === "number" ||
          field.type === "currency" ||
          field.type === "percentage"
        ) {
          let val = input.value;
          // Intento final de evaluación si quedó fórmula
          try {
            if (/[\+\-\*\/]/.test(val))
              val = new Function('"use strict";return (' + val + ")")();
          } catch (e) {}
          formData[field.id] = val === "" || isNaN(val) ? null : Number(val);
        } else if (field.type === "table") {
          try {
            formData[field.id] = JSON.parse(input.value || "[]");
          } catch (e) {
            console.error(`Error tabla ${field.label}:`, e);
            formData[field.id] = [];
          }
        } else {
          formData[field.id] = input.value;
        }
      }
    });

    return formData;
  }

  updateEditorState(isLoading, message = null) {
    this.isSubmitting = isLoading;
    const btn = document.getElementById("saveDocBtn");
    if (!btn) return;

    if (isLoading) {
      btn.disabled = true;
      btn.innerHTML = `<i class="fas fa-spinner fa-spin mr-2"></i> ${
        message || "Procesando..."
      }`;
      btn.classList.add("opacity-75", "cursor-not-allowed");
    } else {
      btn.disabled = false;
      const submitText = this.isEditing
        ? "Actualizar y Recifrar"
        : "Guardar y Cifrar";
      btn.innerHTML = `<i class="fas fa-save mr-2"></i> ${submitText}`;
      btn.classList.remove("opacity-75", "cursor-not-allowed");
    }
    const inputs = document.querySelectorAll(
      "#dynamicFormContainer input, #dynamicFormContainer textarea, #dynamicFormContainer select"
    );
    inputs.forEach((input) => (input.disabled = isLoading));
  }

  renderError(msg) {
    const container = document.getElementById("editorContainer");
    if (container) {
      container.innerHTML = `
        <div class="p-6">
            <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg max-w-3xl mx-auto">
                <h4 class="text-red-800 font-bold mb-2">Error Crítico</h4>
                <p class="text-red-700">${msg}</p>
                <button id="backBtnError" class="mt-4 bg-white border border-red-300 text-red-700 px-4 py-2 rounded hover:bg-red-50 transition">Volver al Listado</button>
            </div>
        </div>`;
      document
        .getElementById("backBtnError")
        ?.addEventListener("click", () => this.onCancel());
    }
  }
}
