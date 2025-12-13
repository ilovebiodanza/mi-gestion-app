// src/components/editor/core/FieldRegistry.js

class FieldRegistry {
  constructor() {
    this.types = {};
  }

  register(type, classRef) {
    this.types[type] = classRef;
  }

  /**
   * Crea una instancia del controlador adecuado
   */
  createController(fieldDef, initialValue, onChange) {
    const FieldClass = this.types[fieldDef.type] || this.types["string"]; // Fallback a string
    if (!FieldClass) {
      throw new Error(
        `No hay controlador registrado para el tipo: ${fieldDef.type}`
      );
    }
    return new FieldClass(fieldDef, initialValue, onChange);
  }
}

export const fieldRegistry = new FieldRegistry();
