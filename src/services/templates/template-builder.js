// src/services/templates/template-builder.js

import { getFieldTypesConfig } from "../../utils/field-types-config.js";

/**
 * Servicio para construir, definir y validar la estructura de plantillas y campos.
 */
class TemplateBuilder {
  /**
   * Obtener tipos de campo válidos
   */
  getValidFieldTypes() {
    return getFieldTypesConfig().map((type) => type.value);
  }

  /**
   * Generar ID automático a partir de la etiqueta
   */
  generateFieldId(label, index) {
    if (!label || typeof label !== "string") {
      return `campo_${index + 1}`;
    }

    const id = label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_$]/g, "_")
      .replace(/_{2,}/g, "_")
      .replace(/^_|_$/g, "");

    if (!id || !/^[a-zA-Z_$]/.test(id)) {
      return `campo_${index + 1}`;
    }

    return id;
  }

  /**
   * Validar un campo individual de la plantilla
   */
  validateField(field, index) {
    const validTypes = this.getValidFieldTypes();
    if (!validTypes.includes(field.type)) {
      throw new Error(
        `Tipo de campo inválido: "${
          field.type
        }". Tipos válidos: ${validTypes.join(", ")}`
      );
    }

    if (!field.id) {
      field.id = this.generateFieldId(field.label, index);
    }

    return true;
  }

  /**
   * Validar estructura de datos de plantilla
   */
  validateTemplateData(templateData) {
    if (!templateData.name || !templateData.fields) {
      throw new Error("La plantilla debe tener nombre y campos");
    }

    if (
      !Array.isArray(templateData.fields) ||
      templateData.fields.length === 0
    ) {
      throw new Error("La plantilla debe tener al menos un campo");
    }

    templateData.fields.forEach((field, index) => {
      this.validateField(field, index);
    });

    return true;
  }

  getCategoryName(category) {
    const names = {
      personal: "Personal",
      access: "Accesos",
      financial: "Financiero",
      health: "Salud",
      custom: "Personalizado",
    };
    return names[category] || category;
  }

  getCategoryIcon(category) {
    const icons = {
      personal: "👤",
      access: "🔐",
      financial: "💰",
      health: "🏥",
      custom: "📋",
    };
    return icons[category] || "📄";
  }
}

export const templateBuilder = new TemplateBuilder();
