export class AbstractViewer {
  /**
   * @param {Object} fieldConfig - Configuración del campo (del template)
   * @param {any} value - Valor desencriptado del campo
   * @param {Object} options - Dependencias extra (ej. configuración de moneda, callbacks)
   */
  constructor(fieldConfig, value, options = {}) {
    this.field = fieldConfig;
    this.value = value;
    this.options = options;
  }

  /**
   * Retorna el HTML string del campo.
   * @param {boolean} isTableContext - Si se está renderizando dentro de una celda de tabla
   */
  render(isTableContext = false) {
    throw new Error("El método render() debe ser implementado");
  }

  /**
   * Se llama después de que el HTML ha sido inyectado en el DOM.
   * Ideal para añadir EventListeners específicos del campo.
   * @param {HTMLElement} container - El contenedor padre donde se inyectó el HTML
   */
  postRender(container) {
    // Opcional: Implementar en las subclases que requieran interactividad
  }

  /**
   * Helper para renderizar valores vacíos de forma consistente
   */
  renderEmpty() {
    return '<span class="text-slate-300 text-xs italic">Vacío</span>';
  }

  /**
   * Verifica si el valor está vacío/nulo
   */
  isEmpty() {
    return (
      this.value === undefined ||
      this.value === null ||
      (typeof this.value === "string" && this.value.trim() === "")
    );
  }
}
