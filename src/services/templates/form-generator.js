// src/services/templates/templates-form-generator.js
// Importar el nuevo archivo de configuración
import { getFieldTypeMetadata } from "../../utils/field-types-config.js"; // NUEVO IMPORT
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
    const requiredAttr = field.required ? "required" : "";
    let inputHtml = "";

    // Obtener metadatos del tipo de campo para el input HTML (NUEVO)
    const metadata = getFieldTypeMetadata(field.type);
    let inputType = metadata?.inputType || "text";

    // Manejo de casos especiales que no usan un input simple (MODIFICADO)
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
      case "select": // <--- NUEVO CASO: SELECCIÓN SIMPLE
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
        // Caso general para todos los input type="text", "number", "email", etc.
        inputHtml = `<input type="${inputType}" id="${field.id}" name="${
          field.id
        }" class="form-input" placeholder="${
          field.placeholder || ""
        }" value="${currentValue}" ${requiredAttr} />`;
        break;
    }
    // Estructura envolvente del campo
    return `
      <div class="mb-4">
        <label for="${
          field.id
        }" class="block text-sm font-medium text-gray-700">
            ${field.label} 
            ${
              field.sensitive
                ? '<i class="fas fa-lock text-red-500 ml-1" title="Campo Sensible"></i>'
                : ""
            }
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
