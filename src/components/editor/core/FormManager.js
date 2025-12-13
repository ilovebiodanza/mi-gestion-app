// src/components/editor/core/FormManager.js
import { fieldRegistry } from "./FieldRegistry.js";

export class FormManager {
  /**
   * @param {Array} fieldsDef - Array de definiciones de campos (template.fields)
   * @param {Object} initialData - Objeto con los datos { fieldId: value }
   */
  constructor(fieldsDef, initialData = {}) {
    this.fieldsDef = fieldsDef;
    this.formData = { ...initialData }; // Copia local del estado
    this.controllers = {}; // Mapa de id -> instancia de FieldController
  }

  /**
   * Genera todo el HTML del formulario
   */
  renderHtml() {
    // Opción segura: Si no hay campos, devolver string vacío para evitar errores
    if (!this.fieldsDef || !Array.isArray(this.fieldsDef)) {
      console.warn("FormManager: No hay definiciones de campos válidas.");
      return "";
    }

    // El return es vital aquí
    return this.fieldsDef
      .map((fieldDef) => {
        // Creamos el controlador
        const controller = fieldRegistry.createController(
          fieldDef,
          this.formData[fieldDef.id],
          (id, newValue) => this.handleFieldChange(id, newValue)
        );

        // Lo guardamos para validación posterior
        this.controllers[fieldDef.id] = controller;

        // Renderizamos su HTML
        return controller.render();
      })
      .join("");
  }

  /**
   * Activa los listeners una vez el HTML está en el DOM
   * @param {HTMLElement} container - El contenedor padre
   */
  postRender(container) {
    Object.values(this.controllers).forEach((controller) => {
      if (controller.postRender) {
        controller.postRender(container);
      }
    });
  }

  handleFieldChange(fieldId, newValue) {
    this.formData[fieldId] = newValue;
    // console.log(`Campo ${fieldId} actualizado:`, newValue);
  }

  /**
   * Recolecta y Valida todos los datos
   */
  getValidData() {
    let isValid = true;
    const finalData = {};

    Object.values(this.controllers).forEach((controller) => {
      const validationResult = controller.validate();
      if (validationResult !== true) {
        isValid = false;
        controller.showError(validationResult);
      }
      finalData[controller.def.id] = controller.getValue();
    });

    return isValid ? finalData : null;
  }
}
