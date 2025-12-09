// src/components/DocumentViewer.js

import { documentService } from "../services/documents/index.js";
import { templateService } from "../services/templates/index.js";
import { encryptionService } from "../services/encryption/index.js";
import { getFieldTypeLabel, getLocalCurrency } from "../utils/helpers.js";

export class DocumentViewer {
  constructor(docId, onBack) {
    this.docId = docId;
    this.onBack = onBack;
    this.document = null;
    this.template = null;
    this.decryptedData = null;
    this.currencyConfig = getLocalCurrency();
  }

  // Método principal que faltaba y causaba el error
  render() {
    return `<div id="documentViewerPlaceholder"></div>`;
  }

  async load() {
    this.renderLoading();
    try {
      this.document = await documentService.getDocumentById(this.docId);
      this.template = await templateService.getTemplateById(
        this.document.templateId
      );

      if (!this.template) {
        throw new Error("La plantilla asociada a este documento ya no existe.");
      }

      if (!encryptionService.isReady()) {
        throw new Error(
          "El servicio de cifrado no está listo. Por favor, ingresa tu contraseña."
        );
      }

      this.decryptedData = await encryptionService.decryptDocument({
        content: this.document.encryptedContent,
        metadata: this.document.encryptionMetadata,
      });

      this.renderContent();
    } catch (error) {
      console.error("Error al cargar documento:", error);
      this.renderError(error.message);
    }
  }

  // --- MOTOR DE FORMATEO CENTRALIZADO ---
  renderFieldValue(type, value, isTableContext = false) {
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    ) {
      return '<span class="text-gray-400 italic text-xs">N/A</span>';
    }

    switch (type) {
      case "boolean":
        return value
          ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Sí</span>'
          : '<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">No</span>';

      case "date":
        try {
          const [year, month, day] = String(value).split("-").map(Number);
          const dateObj = new Date(year, month - 1, day);
          return new Intl.DateTimeFormat(this.currencyConfig.locale, {
            year: "numeric",
            month: "short",
            day: "numeric",
          }).format(dateObj);
        } catch (e) {
          return value;
        }

      case "currency":
        const numVal = Number(value);
        if (isNaN(numVal)) return value;
        return new Intl.NumberFormat(this.currencyConfig.locale, {
          style: "currency",
          currency: this.currencyConfig.codigo,
        }).format(numVal);

      case "percentage":
        return `${value}%`;

      case "secret":
        if (isTableContext)
          return '<span class="font-mono text-xs">••••••</span>';
        return `
              <div class="flex items-center gap-2">
                <span class="font-mono bg-gray-100 px-2 py-1 rounded secret-mask text-sm" data-value="${value}">••••••••</span>
                <button type="button" class="toggle-secret-btn text-gray-400 hover:text-blue-600 transition" title="Ver/Ocultar"><i class="fas fa-eye"></i></button>
                <button type="button" class="copy-btn text-gray-400 hover:text-green-600 transition" data-value="${value}" title="Copiar"><i class="fas fa-copy"></i></button>
              </div>`;

      case "url":
        let url = value;
        let text = value;
        if (typeof value === "object" && value !== null) {
          url = value.url;
          text = value.text || value.url;
        }
        if (!url) return '<span class="text-gray-400 italic">Sin enlace</span>';
        if (isTableContext && text.length > 20)
          text = text.substring(0, 17) + "...";
        return `<a href="${url}" target="_blank" class="text-blue-600 hover:underline flex items-center group" title="${url}">
                <i class="fas fa-external-link-alt mr-1.5 text-xs text-blue-400"></i> ${text}
            </a>`;

      case "text":
        if (isTableContext)
          return value.length > 30
            ? `<span title="${value}">${value.substring(0, 30)}...</span>`
            : value;
        return `<div class="whitespace-pre-wrap text-gray-800 bg-gray-50 p-3 rounded-md border border-gray-100 text-sm">${value}</div>`;

      default:
        return String(value);
    }
  }

  renderContent() {
    const container = document.getElementById("documentViewerPlaceholder");
    if (!container) return;

    const date = new Date(this.document.metadata.updatedAt).toLocaleString();

    const fieldsHtml = this.template.fields
      .map((field, index) => {
        if (index === 0) return ""; // Saltar título

        const value = this.decryptedData[field.id];

        if (field.type === "table") {
          return this.renderTableField(field, value);
        }

        const displayValue = this.renderFieldValue(field.type, value);

        return `
        <div class="border-b border-gray-100 last:border-0 py-4">
          <dt class="text-sm font-medium text-gray-500 mb-1 flex items-center">${field.label}</dt>
          <dd class="text-gray-900 font-medium break-words">${displayValue}</dd>
        </div>
      `;
      })
      .join("");

    container.innerHTML = `
      <div id="documentCard" class="bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in max-w-3xl mx-auto mb-10">
        <div class="px-6 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-start">
          <div class="flex items-center">
            <div class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl mr-4 shadow-sm" style="background-color: ${this.template.color}20; color: ${this.template.color}">${this.template.icon}</div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">${this.document.metadata.title}</h2>
              <p class="text-sm text-gray-500">${this.template.name} • Actualizado: ${date}</p>
            </div>
          </div>
          <button id="closeViewerBtn" class="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition no-print"><i class="fas fa-times text-xl"></i></button>
        </div>
        <div class="p-6"><dl class="divide-y divide-gray-100">${fieldsHtml}</dl></div>
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between no-print-section">
          <button id="backBtn" class="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded hover:bg-gray-200 transition"><i class="fas fa-arrow-left mr-2"></i> Volver</button>
          <div class="space-x-2 flex">
            <button id="whatsappDocBtn" class="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded transition shadow-sm" title="WhatsApp"><i class="fab fa-whatsapp"></i></button>
            <button id="pdfDocBtn" class="bg-gray-800 hover:bg-gray-900 text-white px-3 py-2 rounded transition shadow-sm" title="PDF"><i class="fas fa-file-pdf"></i></button>
            <button id="deleteDocBtn" class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition shadow-sm" title="Eliminar"><i class="fas fa-trash"></i></button>
            <button id="editDocBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition shadow-sm" title="Editar"><i class="fas fa-edit"></i></button>
          </div>
        </div>
      </div>
      <div id="rowDetailModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-md animate-fade-in transform scale-100">
            <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                <h3 class="font-bold text-gray-800">Detalle del Ítem</h3>
                <button class="close-modal text-gray-400 hover:text-gray-600"><i class="fas fa-times"></i></button>
            </div>
            <div class="p-6 space-y-4 max-h-[70vh] overflow-y-auto" id="rowDetailContent"></div>
            <div class="px-6 py-3 bg-gray-50 rounded-b-xl text-right">
                <button class="close-modal px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">Cerrar</button>
            </div>
        </div>
      </div>
    `;

    this.setupContentListeners();
  }

  renderTableField(field, value) {
    const rows = Array.isArray(value) ? value : [];
    const columns = field.columns || [];

    if (rows.length === 0) {
      return `<div class="py-4"><dt class="text-sm font-medium text-gray-500 mb-1">${field.label}</dt><dd class="text-gray-400 italic text-sm border border-dashed border-gray-300 rounded p-3 text-center">Sin registros</dd></div>`;
    }

    const isComplex = columns.length > 2;
    const displayColumns = isComplex ? columns.slice(0, 2) : columns;

    let headersHtml = displayColumns
      .map(
        (c) =>
          `<th class="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase bg-gray-50">${
            c.label || c.name || "Columna"
          }</th>`
      )
      .join("");

    if (isComplex)
      headersHtml += `<th class="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase bg-gray-50 w-16">Ver</th>`;

    const bodyHtml = rows
      .map((row, rowIndex) => {
        let cellsHtml = displayColumns
          .map((c) => {
            return `<td class="px-4 py-3 text-sm text-gray-700 border-t border-gray-100">${this.renderFieldValue(
              c.type,
              row[c.id],
              true
            )}</td>`;
          })
          .join("");

        if (isComplex) {
          cellsHtml += `<td class="px-4 py-3 text-right border-t border-gray-100"><button class="view-row-btn text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition" data-field-id="${field.id}" data-row-index="${rowIndex}"><i class="fas fa-eye"></i></button></td>`;
        }
        return `<tr class="hover:bg-gray-50 transition">${cellsHtml}</tr>`;
      })
      .join("");

    return `
      <div class="py-4 border-b border-gray-100 last:border-0">
        <dt class="text-sm font-medium text-gray-500 mb-3 flex justify-between items-center">
            <span>${field.label}</span>
            <span class="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">${
              rows.length
            } ítems</span>
        </dt>
        <div class="overflow-hidden border border-gray-200 rounded-lg">
            <div class="overflow-x-auto"><table class="min-w-full divide-y divide-gray-200"><thead><tr>${headersHtml}</tr></thead><tbody class="bg-white">${bodyHtml}</tbody></table></div>
            ${
              isComplex
                ? '<div class="bg-gray-50 px-4 py-2 text-xs text-gray-500 text-center border-t border-gray-200 italic">Mostrando resumen. Haz clic en el ojo para ver detalles.</div>'
                : ""
            }
        </div>
      </div>
    `;
  }

  openRowModal(fieldId, rowIndex) {
    const field = this.template.fields.find((f) => f.id === fieldId);
    if (!field || !this.decryptedData[fieldId]) return;
    const rowData = this.decryptedData[fieldId][rowIndex];

    document.getElementById("rowDetailContent").innerHTML = field.columns
      .map(
        (col) => `
        <div class="border-b border-gray-100 last:border-0 pb-3 last:pb-0">
            <p class="text-xs font-bold text-gray-500 uppercase mb-1">${
              col.label || col.name
            }</p>
            <div class="text-gray-800 text-sm">${this.renderFieldValue(
              col.type,
              rowData[col.id]
            )}</div>
        </div>
      `
      )
      .join("");
    document.getElementById("rowDetailModal").classList.remove("hidden");
  }

  async handleCopyToWhatsApp() {
    try {
      let waText = `*${this.document.metadata.title}*\n_${this.template.name}_\n\n`;

      this.template.fields.forEach((field, index) => {
        if (index === 0) return;

        const label = `*${field.label}:*`;
        let value = this.decryptedData[field.id];

        if (field.type === "table") {
          const rows = Array.isArray(value) ? value : [];
          if (rows.length === 0) {
            waText += `${label} _Sin registros_\n`;
          } else {
            waText += `${label}\n`;
            const columns = field.columns || [];

            rows.forEach((row, i) => {
              waText += `  *${i + 1}.* `;
              if (columns.length === 1) {
                const col = columns[0];
                waText += `${this.getFormattedValueForText(
                  col.type,
                  row[col.id]
                )}\n`;
              } else {
                waText += `\n`;
                columns.forEach((col) => {
                  const colName = col.label || col.name || "Dato";
                  const val = this.getFormattedValueForText(
                    col.type,
                    row[col.id]
                  );
                  waText += `    ${colName}: ${val}\n`;
                });
              }
            });
            waText += `\n`;
          }
        } else {
          const val = this.getFormattedValueForText(field.type, value);
          if (field.type === "text") waText += `${label}\n${val}\n\n`;
          else waText += `${label} ${val}\n`;
        }
      });

      waText += `\n_Generado por Mi Gestión_`;
      await navigator.clipboard.writeText(waText);

      const btn = document.getElementById("whatsappDocBtn");
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i>';
      setTimeout(() => (btn.innerHTML = originalHTML), 2000);
    } catch (err) {
      console.error(err);
    }
  }

  // Helper para texto plano
  getFormattedValueForText(type, value) {
    if (value === undefined || value === null || value === "") return "_N/A_";

    switch (type) {
      case "boolean":
        return value ? "Sí" : "No";
      case "secret":
        return `\`\`\`${value}\`\`\``;
      case "currency":
        return new Intl.NumberFormat(this.currencyConfig.locale, {
          style: "currency",
          currency: this.currencyConfig.codigo,
        }).format(Number(value));
      case "date":
        try {
          const [y, m, d] = String(value).split("-").map(Number);
          return new Intl.DateTimeFormat(this.currencyConfig.locale, {
            dateStyle: "medium",
          }).format(new Date(y, m - 1, d));
        } catch (e) {
          return value;
        }
      case "percentage":
        return `${value}%`;
      case "url":
        if (typeof value === "object")
          return value.text && value.text !== value.url
            ? `${value.text}: ${value.url}`
            : value.url;
        return value;
      default:
        return String(value);
    }
  }

  setupContentListeners() {
    document
      .getElementById("closeViewerBtn")
      ?.addEventListener("click", () => this.onBack());
    document
      .getElementById("backBtn")
      ?.addEventListener("click", () => this.onBack());
    document
      .getElementById("deleteDocBtn")
      ?.addEventListener("click", () => this.handleDelete());
    document
      .getElementById("editDocBtn")
      ?.addEventListener("click", () => this.handleEdit());
    document
      .getElementById("pdfDocBtn")
      ?.addEventListener("click", () => this.handleExportPDF());
    document
      .getElementById("whatsappDocBtn")
      ?.addEventListener("click", () => this.handleCopyToWhatsApp());

    const viewerContainer = document.getElementById(
      "documentViewerPlaceholder"
    );
    viewerContainer.addEventListener("click", (e) => {
      if (e.target.closest(".toggle-secret-btn")) {
        const btn = e.target.closest(".toggle-secret-btn");
        const span = btn.parentElement.querySelector(".secret-mask");
        const icon = btn.querySelector("i");
        if (span.textContent === "••••••••") {
          span.textContent = span.dataset.value;
          icon.className = "fas fa-eye-slash";
          span.classList.add("text-blue-700");
        } else {
          span.textContent = "••••••••";
          icon.className = "fas fa-eye";
          span.classList.remove("text-blue-700");
        }
      }
      if (e.target.closest(".copy-btn")) {
        navigator.clipboard.writeText(
          e.target.closest(".copy-btn").dataset.value
        );
      }
      if (e.target.closest(".view-row-btn")) {
        const btn = e.target.closest(".view-row-btn");
        this.openRowModal(btn.dataset.fieldId, parseInt(btn.dataset.rowIndex));
      }
    });

    const modal = document.getElementById("rowDetailModal");
    if (modal) {
      modal
        .querySelectorAll(".close-modal")
        .forEach((btn) =>
          btn.addEventListener("click", () => modal.classList.add("hidden"))
        );
      modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.add("hidden");
      });
    }
  }

  renderLoading() {
    const container = document.getElementById("documentViewerPlaceholder");
    if (container)
      container.innerHTML = `<div class="flex justify-center py-20"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>`;
  }
  renderError(msg) {
    const container = document.getElementById("documentViewerPlaceholder");
    if (container)
      container.innerHTML = `<div class="bg-red-50 p-6 rounded-lg text-red-700"><h3 class="font-bold">Error</h3><p>${msg}</p><button id="backBtnError" class="mt-4 bg-white border border-red-300 px-4 py-2 rounded">Volver</button></div>`;
    document
      .getElementById("backBtnError")
      ?.addEventListener("click", () => this.onBack());
  }
  handleExportPDF() {
    window.print();
  }
  handleEdit() {
    this.onBack({
      documentId: this.docId,
      template: this.template,
      formData: this.decryptedData,
      metadata: this.document.metadata,
    });
  }
  async handleDelete() {
    if (!confirm("¿Eliminar documento?")) return;
    try {
      await documentService.deleteDocument(this.docId);
      this.onBack();
    } catch (error) {
      alert("Error: " + error.message);
    }
  }
}
