// src/components/templates/TemplateForm.js
import { getCategoryIcon, generateFieldId } from "../../utils/helpers.js";
import { renderMainLayout } from "./TemplateFormRenderers.js";
import { fieldConfigRegistry } from "./config/FieldConfigRegistry.js";

export class TemplateForm {
  constructor(handlers) {
    this.handlers = handlers; // { onSave, onCancel }
    this.fieldControllers = []; // Array de instancias de AbstractFieldConfig
    this.sortable = null;
  }

  /**
   * Renderiza el formulario completo.
   */
  render(template = null) {
    // 1. Limpiamos controladores previos
    this.fieldControllers = [];

    // 2. Generamos controladores para los campos existentes
    const fieldsData = template?.fields || [];

    fieldsData.forEach((fieldData, index) => {
      const controller = this.createController(fieldData, index);
      this.fieldControllers.push(controller);
    });

    // 3. Generamos el HTML inicial de todos los campos
    const fieldsHtml = this.fieldControllers.map((c) => c.render()).join("");

    // 4. Renderizamos el Layout Principal
    return renderMainLayout(!!template, template, fieldsHtml);
  }

  /**
   * Inicializa listeners y componentes después de insertar el HTML en el DOM.
   */
  setupListeners(container) {
    // 1. Listeners del Layout Principal (Nombre, Categoría, Icono)
    this.setupMainListeners(container);

    // 2. Inicializar cada controlador de campo (attachListeners individuales)
    const fieldsContainer = container.querySelector("#fieldsContainer");
    if (fieldsContainer) {
      this.fieldControllers.forEach((ctrl) => ctrl.postRender(fieldsContainer));
    }

    // 3. Inicializar Drag & Drop
    this.initSortable(fieldsContainer);
    this.updateNoFieldsMessage(container);
  }

  setupMainListeners(container) {
    // Cambio automático de icono según categoría
    const catSelect = container.querySelector("#templateCategory");
    const iconInput = container.querySelector("#templateIcon");
    if (catSelect && iconInput) {
      catSelect.addEventListener("change", (e) => {
        iconInput.value = getCategoryIcon(e.target.value);
      });
    }

    // Botón Agregar Campo
    container.querySelector("#addFieldBtn")?.addEventListener("click", () => {
      this.addField(container);
    });

    // Botones Guardar y Cancelar
    const form = container.querySelector("#templateForm");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.saveData();
      });
    }

    container
      .querySelector("#saveTemplateBtnHeader")
      ?.addEventListener("click", () => {
        if (form) form.dispatchEvent(new Event("submit"));
      });

    container
      .querySelector("#cancelTemplate")
      ?.addEventListener("click", () => {
        this.handlers.onCancel();
      });
  }

  /**
   * Crea una nueva instancia de controlador y configura sus callbacks.
   */
  createController(fieldData, index) {
    // Definimos los callbacks que le pasamos al hijo para que se comunique con nosotros
    const callbacks = {
      onRemove: (ctrl) => this.removeField(ctrl),
      onTypeChange: (ctrl, newType) => this.handleTypeChange(ctrl, newType),
      onChange: () => {
        /* Podríamos implementar auto-guardado aquí */
      },
    };

    return fieldConfigRegistry.createController(fieldData, index, callbacks);
  }

  /**
   * Agrega un nuevo campo al final de la lista.
   */
  addField(container) {
    const fieldsContainer = container.querySelector("#fieldsContainer");
    if (!fieldsContainer) return;

    const index = this.fieldControllers.length;
    const newFieldData = {
      id: generateFieldId(`campo_${index + 1}`, index),
      label: "",
      type: "string", // Por defecto
      required: false,
    };

    // 1. Crear Controlador
    const controller = this.createController(newFieldData, index);
    this.fieldControllers.push(controller);

    // 2. Insertar HTML en el DOM
    const wrapper = document.createElement("div");
    wrapper.innerHTML = controller.render();
    const newElement = wrapper.firstElementChild;
    fieldsContainer.appendChild(newElement);

    // 3. Activar Listeners del nuevo campo
    controller.postRender(fieldsContainer);

    // 4. Scroll al nuevo campo
    newElement.scrollIntoView({ behavior: "smooth", block: "center" });
    this.updateNoFieldsMessage(container);
  }

  /**
   * Elimina un campo de la lista y del DOM.
   */
  removeField(controller) {
    // 1. Remover del DOM
    if (controller.domElement) {
      controller.domElement.remove();
    }

    // 2. Remover del array
    this.fieldControllers = this.fieldControllers.filter(
      (c) => c !== controller
    );

    // 3. Actualizar UI vacía si es necesario
    this.updateNoFieldsMessage(document);
  }

  /**
   * Maneja el cambio de tipo de un campo (ej: de Texto a Tabla).
   * Requiere recrear el controlador porque la clase cambia.
   */
  handleTypeChange(oldController, newType) {
    const fieldsContainer = document.getElementById("fieldsContainer");
    if (!fieldsContainer) return;

    // 1. Obtener datos actuales y actualizar tipo
    const currentData = oldController.getDefinition();
    currentData.type = newType;

    // Limpiar propiedades específicas si cambiamos de tipo drásticamente (opcional)
    if (newType !== "select") delete currentData.options;
    if (newType !== "table") delete currentData.columns;

    // 2. Crear nuevo controlador
    const newController = this.createController(
      currentData,
      oldController.index
    );

    // 3. Reemplazar en el DOM
    const tempWrapper = document.createElement("div");
    tempWrapper.innerHTML = newController.render();
    const newElement = tempWrapper.firstElementChild;

    oldController.domElement.replaceWith(newElement);

    // 4. Activar listeners del nuevo controlador
    newController.postRender(fieldsContainer);

    // 5. Reemplazar en el array (manteniendo la posición)
    const index = this.fieldControllers.indexOf(oldController);
    if (index !== -1) {
      this.fieldControllers[index] = newController;
    }
  }

  initSortable(element) {
    if (!element || !window.Sortable) return;

    if (this.sortable) this.sortable.destroy();

    this.sortable = new window.Sortable(element, {
      animation: 200,
      handle: ".drag-handle",
      ghostClass: "opacity-50",
      onEnd: (evt) => {
        // Reordenar el array de controladores según el DOM
        // Nota: Esto asume que el orden del array coincide con el DOM.
        // Una forma robusta es leer los IDs del DOM y reordenar el array.
        this.reorderControllers();
      },
    });
  }

  reorderControllers() {
    const container = document.getElementById("fieldsContainer");
    if (!container) return;

    const newOrderIds = Array.from(container.children).map(
      (el) => el.dataset.id
    );

    // Ordenamos this.fieldControllers basado en newOrderIds
    this.fieldControllers.sort((a, b) => {
      return newOrderIds.indexOf(a.data.id) - newOrderIds.indexOf(b.data.id);
    });
  }

  updateNoFieldsMessage(container) {
    const fc = container.querySelector("#fieldsContainer");
    const msg = container.querySelector("#noFieldsMessage");
    if (fc && msg) msg.classList.toggle("hidden", fc.children.length > 0);
  }

  saveData() {
    try {
      const nameInput = document.getElementById("templateName");
      const name = nameInput ? nameInput.value.trim() : "";
      if (!name) throw new Error("Por favor, asigna un nombre a la plantilla.");

      // RECOLECCIÓN DE DATOS:
      // Ya no scrapeamos el DOM. Pedimos los datos limpios a cada controlador.
      // Además, filtramos campos que puedan estar vacíos o inválidos si queremos.
      const fields = this.fieldControllers.map((ctrl, idx) => {
        const def = ctrl.getDefinition();
        def.order = idx + 1; // Actualizamos el orden final
        return def;
      });

      if (fields.length === 0)
        throw new Error("Agrega al menos un campo para guardar la plantilla.");

      // Validar etiquetas vacías
      const emptyLabels = fields.filter(
        (f) => !f.label.trim() && f.type !== "separator"
      );
      console.log("*** ", { emptyLabels });
      if (emptyLabels.length > 0) {
        throw new Error("Hay campos sin etiqueta. Por favor, nómbralos.");
      }

      const data = {
        name,
        category: document.getElementById("templateCategory").value,
        icon: document.getElementById("templateIcon").value,
        color: document.getElementById("templateColor").value,
        description: document.getElementById("templateDescription").value,
        fields,
      };

      this.handlers.onSave(data);
    } catch (e) {
      alert(e.message);
    }
  }
}
