// src/components/templates/config/FieldConfigRegistry.js

// 1. Importa los controladores
import { GenericFieldConfig } from "./fields/GenericFieldConfig.js";
import { SelectFieldConfig } from "./fields/SelectFieldConfig.js";
import { SeparatorFieldConfig } from "./fields/SeparatorFieldConfig.js";
import { TableFieldConfig } from "./fields/TableFieldConfig.js";
import { TextFieldConfig } from "./fields/TextFieldConfig.js";

class FieldConfigRegistry {
  constructor() {
    this.configs = {};
    // 2. Llama a un método de inicialización o regístralos en el constructor
    this.registerDefaults();
  }

  register(type, classRef) {
    this.configs[type] = classRef;
  }

  registerDefaults() {
    // 3. Registramos los tipos conocidos
    this.register("select", SelectFieldConfig);
    this.register("separator", SeparatorFieldConfig);
    this.register("table", TableFieldConfig);

    this.register("string", TextFieldConfig);
    this.register("text", TextFieldConfig); // Asumiendo que 'textarea' es la clave para texto largo

    // El 'default' actuará como fallback para text, number, date, url, etc.
    this.register("default", GenericFieldConfig);
  }

  createController(fieldData, index, callbacks) {
    // Buscamos coincidencia exacta O usamos el default (Generic)
    const ConfigClass = this.configs[fieldData.type] || this.configs["default"];

    if (!ConfigClass) {
      throw new Error(
        `No hay configuración registrada para el tipo: ${fieldData.type}`
      );
    }

    return new ConfigClass(fieldData, index, callbacks);
  }
}

export const fieldConfigRegistry = new FieldConfigRegistry();
