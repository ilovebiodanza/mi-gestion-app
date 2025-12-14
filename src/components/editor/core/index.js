// src/components/editor/core/index.js (Ejemplo)

import { fieldRegistry } from "./FieldRegistry.js";
import { TextField } from "./fields/TextField.js";
import { NumberField } from "./fields/NumberField.js";
import { BooleanField } from "./fields/BooleanField.js";
import { SelectField } from "./fields/SelectField.js";
import { DateField } from "./fields/DateField.js";
import { SecretField } from "./fields/SecretField.js";
import { TableFieldController } from "./fields/TableFieldController.js";
import { UrlField } from "./fields/UrlField.js";
import { SeparatorField } from "./fields/SeparatorField.js";

// Registro de tipos básicos
export function registerCoreFields() {
  fieldRegistry.register("string", TextField);
  fieldRegistry.register("text", TextField);
  fieldRegistry.register("email", TextField);

  fieldRegistry.register("number", NumberField);
  fieldRegistry.register("currency", NumberField);
  fieldRegistry.register("percentage", NumberField);

  fieldRegistry.register("boolean", BooleanField);
  fieldRegistry.register("select", SelectField);
  fieldRegistry.register("date", DateField);

  fieldRegistry.register("secret", SecretField);

  fieldRegistry.register("table", TableFieldController);
  fieldRegistry.register("url", UrlField);
  fieldRegistry.register("separator", SeparatorField);
}
