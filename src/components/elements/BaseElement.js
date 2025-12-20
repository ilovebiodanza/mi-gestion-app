export class BaseElement {
  /**
   * @param {Object} definition - La configuración del template (id, label, settings, etc.)
   * @param {any} value - El valor actual del dato
   */
  constructor(definition, value = null) {
    this.def = definition;
    this.value = value;
  }

  // --- 0. METADATOS ---
  static getType() {
    throw new Error("Debe implementar getType");
  }
  static getLabel() {
    throw new Error("Debe implementar getLabel");
  }
  static getIcon() {
    return "fas fa-cube";
  }
  static getDescription() {
    return "";
  }

  // --- 1. PROCESO TEMPLATE (Configuración) ---
  renderTemplate() {
    return ""; // Por defecto no hay configuración extra
  }

  // --- 2. PROCESO EDITOR (Entrada) ---
  renderEditor() {
    return `<div class="text-red-500">Editor no implementado para ${this.def.type}</div>`;
  }

  postRenderEditor(container, onChangeCallback) {
    // Opcional: Listeners del input
  }

  validate() {
    return null; // Null = Sin errores
  }

  // --- 3. PROCESO VIEWER (Visualización) ---
  renderViewer() {
    return `<span>${this.value || "—"}</span>`;
  }

  postRenderViewer(container) {
    // Opcional: Scripts visuales
  }

  // --- 4. PROCESO PRINT (Impresión) ---
  // mode: 'standard' | 'compact' | 'accessible'
  renderPrint(mode) {
    return this.renderViewer(); // Fallback
  }

  // --- 5. PROCESO WHATSAPP ---
  getWhatsAppText(currencyConfig) {
    return `${this.def.label}: ${this.value || "Vacío"}`;
  }
  // ============================================================
  // 🟢 NUEVA LÓGICA DE VALIDACIÓN (Para el Adaptador)
  // ============================================================

  validate() {
    const errors = [];

    // 1. Validación Universal: "Required" (Obligatorio)
    if (this.def.required) {
      const isEmpty =
        this.value === null ||
        this.value === undefined ||
        (typeof this.value === "string" && this.value.trim() === "") ||
        (Array.isArray(this.value) && this.value.length === 0);

      if (isEmpty) {
        errors.push("Este campo es obligatorio.");
      }
    }

    // 2. Validación Específica (Hook para hijos)
    const customErrors = this.validateCustom();
    if (customErrors && customErrors.length > 0) {
      errors.push(...customErrors);
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }
  /**
   * Hook para que las subclases añadan validaciones propias.
   * Ej: EmailElement verificará formato de correo aquí.
   * @returns {Array} Array de strings con mensajes de error.
   */
  validateCustom() {
    return [];
  }
}
