// src/services/templates/form-generator.js

import { getFieldTypeMetadata } from "../../utils/field-types-config.js";

/**
 * Servicio para generar la representación HTML/DOM (formulario)
 * a partir de la definición de una plantilla (Fase IV).
 */
class TemplateFormGenerator {
  /**
   * Genera el HTML para un campo de formulario individual
   * @param {Object} field - Definición del campo de la plantilla.
   * @param {*} currentValue - Valor actual del campo (para edición).
   */
  renderField(field, currentValue = "") {
    // Aseguramos que 'field.type' sea válido
    if (!field || !field.type) {
      return `<p class="text-red-500">Error: Tipo de campo no definido para ${
        field.label || "un campo"
      }.</p>`;
    }

    const requiredAttr = field.required ? "required" : "";
    let inputHtml = "";

    // OBTENER METADATOS DEL TIPO DE CAMPO
    const metadata = getFieldTypeMetadata(field.type);
    let inputType = metadata?.inputType || "text";

    // Manejo de casos especiales que no usan un input simple
    switch (inputType) {
      case "checkbox":
        // Checkbox para boolean
        inputHtml = `<input type="checkbox" id="${field.id}" name="${
          field.id
        }" class="form-checkbox" ${currentValue ? "checked" : ""} />`;
        break;
      case "textarea":
        // Textarea para bloques largos
        inputHtml = `<textarea id="${field.id}" name="${
          field.id
        }" class="form-textarea" placeholder="${
          field.placeholder || ""
        }" ${requiredAttr}>${currentValue}</textarea>`;
        break;

      case "select":
        const optionsHtml = (field.options || [])
          .map(
            (option) => `
          <option value="${option}" ${
              currentValue === option ? "selected" : ""
            }>
            ${option}
          </option>
        `
          )
          .join("");

        inputHtml = `
          <select id="${field.id}" name="${
          field.id
        }" class="form-select" ${requiredAttr}>
            <option value="" disabled ${
              !currentValue ? "selected" : ""
            }>Seleccionar...</option>
            ${optionsHtml}
          </select>`;
        break;

      default:
        // Caso general para todos los input type="text", "number", "password", etc.
        inputHtml = `<input type="${inputType}" id="${field.id}" name="${
          field.id
        }" class="form-input" placeholder="${
          field.placeholder || ""
        }" value="${currentValue}" ${requiredAttr} />`;
        break;
    }

    // Estructura envolvente del campo (SIN EL ICONO DE CANDADO)
    return `
      <div class="mb-4 field-wrapper">
        <label for="${field.id}" class="block text-sm font-medium text-gray-700">
            ${field.label} 
        </label>
        ${inputHtml}
      </div>
    `;
  }

  /**
   * Genera el formulario completo para una plantilla
   */
  generateFormHtml(template, data = {}) {
    if (!template || !template.fields) {
      return `<div class="p-4 text-red-600">Error: Plantilla inválida.</div>`;
    }

    const fieldsHtml = template.fields
      .map((field) => {
        const currentValue = data[field.id] || "";
        return this.renderField(field, currentValue);
      })
      .join("");

    return `<form id="templateForm_${template.id}">${fieldsHtml}</form>`;
  }
}

export const templateFormGenerator = new TemplateFormGenerator();
