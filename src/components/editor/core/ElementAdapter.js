/**
 * src/editor/core/ElementAdapter.js
 * * Patrón Adaptador: Permite que el FormManager (Legacy) interactúe
 * con los nuevos Elementos del ElementRegistry sin reescribir todo el núcleo.
 */
export class ElementAdapter {
  constructor(ElementClass, fieldDef, initialValue) {
    // 1. Instancia tu elemento (esto ya lo tienes)
    this.element = new ElementClass(fieldDef, initialValue);

    // 2. Guarda la definición (probablemente ya tienes this.field = fieldDef)
    this.field = fieldDef;

    // --- 🟢 LA CORRECCIÓN CRÍTICA ---
    // Creamos un "puente" o alias. El sistema viejo busca 'def', así que se lo damos.
    this.def = fieldDef;

    // Opcional: Asigna el ID directamente por si el sistema lo busca en la raíz
    this.id = fieldDef.id;
  }

  // Si el FormManager intenta escribir el valor desde fuera (ej: al cargar datos)
  set value(val) {
    this.element.value = val;
  }

  // 1. Renderizado HTML
  // El FormManager espera render(), nosotros llamamos a renderEditor()
  render() {
    return this.element.renderEditor();
  }

  // 2. Activación de Eventos (Post-Render)
  // El FormManager llama a esto después de inyectar el HTML al DOM
  postRender(container) {
    // Callback que sincroniza el valor cuando el usuario escribe
    const onChangeCallback = (id, newValue) => {
      this.element.value = newValue;
      // Aquí podríamos disparar eventos globales si fuera necesario
    };

    // Delegamos al método del Elemento
    this.element.postRenderEditor(container, onChangeCallback);
  }

  // 3. Obtener Valor
  // Usado por FormManager.getData()
  getValue() {
    return this.element.value;
  }

  // 4. Validación
  // Traducimos {isValid, errors} del Elemento a la UI del FormManager
  validate() {
    const result = this.element.validate();

    if (!result.isValid) {
      this.showError(result.errors[0]);
      return false;
    }

    this.clearError();
    return true;
  }

  // --- Métodos de UI (Compatibilidad Visual con Legacy) ---

  showError(msg) {
    const container = document.querySelector(
      `[data-field-id="${this.field.id}"]`
    );
    if (!container) return;

    // Borde rojo en inputs
    const inputs = container.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      input.classList.add(
        "border-red-500",
        "focus:border-red-500",
        "ring-red-200"
      );
    });

    // Mensaje de error
    let errorEl = container.querySelector(".validation-error-msg");
    if (!errorEl) {
      errorEl = document.createElement("p");
      errorEl.className =
        "validation-error-msg text-[10px] text-red-500 mt-1 font-bold animate-pulse";
      container.appendChild(errorEl);
    }
    errorEl.innerText = msg;
  }

  clearError() {
    const container = document.querySelector(
      `[data-field-id="${this.field.id}"]`
    );
    if (!container) return;

    const inputs = container.querySelectorAll("input, textarea, select");
    inputs.forEach((input) => {
      input.classList.remove(
        "border-red-500",
        "focus:border-red-500",
        "ring-red-200"
      );
    });

    const errorEl = container.querySelector(".validation-error-msg");
    if (errorEl) errorEl.remove();
  }
}
