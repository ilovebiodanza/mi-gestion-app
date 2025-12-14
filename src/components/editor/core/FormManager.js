// src/components/editor/core/FormManager.js
import { fieldRegistry } from "./FieldRegistry.js";

export class FormManager {
  /**
   * @param {Array} fieldsDef - Array de definiciones de campos
   * @param {Object} initialData - Datos iniciales
   */
  constructor(fieldsDef, initialData = {}) {
    this.fieldsDef = fieldsDef;
    this.formData = { ...initialData };
    this.controllers = {};
    // Estado interno para el tab activo (por defecto el principal)
    this.activeTabId = "group-principal";
  }

  /**
   * Agrupa los campos basándose en los separadores.
   * Retorna un array de objetos "Grupo".
   * FILTRO: Solo devuelve grupos que tengan al menos un campo.
   */
  groupFields() {
    const groups = [];
    let currentGroup = {
      id: "group-principal",
      label: "Principal",
      icon: "fas fa-info-circle",
      fields: [],
    };

    this.fieldsDef.forEach((field) => {
      if (field.type === "separator") {
        // 1. Cerramos el grupo anterior
        // CONDICIÓN CLAVE: Solo lo agregamos si TIENE campos
        if (currentGroup.fields.length > 0) {
          groups.push(currentGroup);
        }

        // 2. Iniciamos nuevo grupo basado en el separador
        currentGroup = {
          id: `group-${field.id}`,
          label: field.label,
          icon: "fas fa-folder-open",
          fields: [],
          isSeparator: true,
        };
      } else {
        // Es un campo normal, lo agregamos al grupo actual
        currentGroup.fields.push(field);
      }
    });

    // 3. Empujar el último grupo (solo si tiene campos)
    if (currentGroup.fields.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }

  /**
   * Genera el HTML del formulario con Tabs (PC) y Acordeones (Móvil)
   */
  renderHtml() {
    if (!this.fieldsDef || !Array.isArray(this.fieldsDef)) {
      console.warn("FormManager: No hay definiciones de campos válidas.");
      return "";
    }

    const groups = this.groupFields();

    // CASO SIMPLE: Si solo hay un grupo (sin separadores), renderizamos plano.
    if (groups.length === 1) {
      return this.renderFieldsFlat(groups[0].fields);
    }

    // CASO MULTI-GRUPO: Renderizamos layout híbrido
    return `
      <div class="col-span-full form-layout-container">
          
          <div class="hidden md:flex items-center gap-1 border-b border-slate-200 mb-6 overflow-x-auto no-scrollbar">
              ${groups
                .map((group, index) => {
                  const isActive = index === 0; // El primero activo por defecto
                  const activeClass = isActive
                    ? "border-indigo-500 text-indigo-600 bg-indigo-50/50"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50";

                  return `
                    <button type="button" 
                            class="tab-trigger px-5 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap flex items-center gap-2 rounded-t-lg ${activeClass}"
                            data-target="${group.id}">
                        <i class="${group.icon} text-xs opacity-70"></i>
                        ${group.label}
                    </button>
                  `;
                })
                .join("")}
          </div>

          <div class="space-y-4 md:space-y-0">
              ${groups
                .map((group, index) => {
                  const isActive = index === 0;

                  // LÓGICA DE VISIBILIDAD:
                  // Desktop: Si es activo, se ve. Si no, 'md:hidden' lo oculta.
                  // Móvil: Siempre visible el contenedor (el acordeón maneja el interior).
                  const desktopHiddenClass = isActive ? "" : "md:hidden";

                  // LÓGICA DE ACORDEÓN (Móvil):
                  // Si es activo (primero), empieza abierto. Si no, cerrado (max-h-0).
                  const accordionContentClass = isActive
                    ? "max-h-[5000px] opacity-100 pb-4"
                    : "max-h-0 opacity-0 overflow-hidden";

                  const accordionIconRotation = isActive ? "rotate-180" : "";
                  const accordionBorderClass = isActive
                    ? "ring-2 ring-indigo-500/20 border-indigo-200"
                    : "";

                  return `
                    <div class="group-container ${desktopHiddenClass}" id="${
                    group.id
                  }" data-group-index="${index}">
                        
                        <button type="button" 
                                class="accordion-trigger md:hidden w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm mb-3 transition-all ${accordionBorderClass}">
                            <div class="flex items-center gap-3 font-bold text-slate-700">
                                <i class="${group.icon} text-indigo-500"></i>
                                ${group.label}
                            </div>
                            <i class="fas fa-chevron-down text-slate-400 transition-transform duration-300 ${accordionIconRotation}"></i>
                        </button>

                        <div class="group-content transition-all duration-500 ease-in-out md:max-h-none md:opacity-100 md:overflow-visible ${accordionContentClass}">
                             <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-1">
                                ${this.renderFieldsFlat(group.fields)}
                             </div>
                        </div>
                    </div>
                  `;
                })
                .join("")}
          </div>
      </div>
    `;
  }

  /**
   * Renderiza una lista simple de campos
   */
  renderFieldsFlat(fields) {
    if (!fields || fields.length === 0) return "";

    return fields
      .map((fieldDef) => {
        const controller = fieldRegistry.createController(
          fieldDef,
          this.formData[fieldDef.id],
          (id, newValue) => this.handleFieldChange(id, newValue)
        );

        this.controllers[fieldDef.id] = controller;
        return controller.render();
      })
      .join("");
  }

  /**
   * Inicializa listeners para interacción (Tabs, Acordeones, Campos)
   */
  postRender(container) {
    // 1. Inicializar controladores de campos (Input listeners)
    Object.values(this.controllers).forEach((controller) => {
      if (controller.postRender) {
        controller.postRender(container);
      }
    });

    // 2. Lógica de Pestañas (Desktop)
    const tabTriggers = container.querySelectorAll(".tab-trigger");
    const groupContainers = container.querySelectorAll(".group-container");

    tabTriggers.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.target;

        // UI Tabs: Actualizar clases activas/inactivas
        tabTriggers.forEach((t) => {
          t.classList.remove(
            "border-indigo-500",
            "text-indigo-600",
            "bg-indigo-50/50"
          );
          t.classList.add("border-transparent", "text-slate-500");
        });
        btn.classList.remove("border-transparent", "text-slate-500");
        btn.classList.add(
          "border-indigo-500",
          "text-indigo-600",
          "bg-indigo-50/50"
        );

        // UI Contenido: Mostrar solo el grupo seleccionado
        groupContainers.forEach((grp) => {
          if (grp.id === targetId) {
            grp.classList.remove("md:hidden");
          } else {
            grp.classList.add("md:hidden");
          }
        });

        this.activeTabId = targetId;
      });
    });

    // 3. Lógica Acordeón (Móvil)
    const accordionTriggers = container.querySelectorAll(".accordion-trigger");
    accordionTriggers.forEach((btn) => {
      btn.addEventListener("click", () => {
        const container = btn.closest(".group-container");
        const content = container.querySelector(".group-content");
        const icon = btn.querySelector(".fa-chevron-down");

        const isClosed = content.classList.contains("max-h-0");

        if (isClosed) {
          // ABRIR
          content.classList.remove("max-h-0", "opacity-0", "overflow-hidden");
          content.classList.add("max-h-[5000px]", "opacity-100", "pb-4");
          icon.classList.add("rotate-180");
          btn.classList.add(
            "ring-2",
            "ring-indigo-500/20",
            "border-indigo-200"
          );
        } else {
          // CERRAR
          content.classList.add("max-h-0", "opacity-0", "overflow-hidden");
          content.classList.remove("max-h-[5000px]", "opacity-100", "pb-4");
          icon.classList.remove("rotate-180");
          btn.classList.remove(
            "ring-2",
            "ring-indigo-500/20",
            "border-indigo-200"
          );
        }
      });
    });
  }

  handleFieldChange(fieldId, newValue) {
    this.formData[fieldId] = newValue;
  }

  /**
   * Valida todos los campos. Si hay error, navega automáticamente al tab/acordeón.
   */
  getValidData() {
    let isValid = true;
    const finalData = {};
    let firstErrorController = null;

    Object.values(this.controllers).forEach((controller) => {
      const validationResult = controller.validate();
      if (validationResult !== true) {
        isValid = false;
        controller.showError(validationResult);
        if (!firstErrorController) firstErrorController = controller;
      }
      finalData[controller.def.id] = controller.getValue();
    });

    // AUTO-ENFOQUE: Si hay error, ir al campo
    if (!isValid && firstErrorController) {
      this.focusOnField(firstErrorController);
    }

    return isValid ? finalData : null;
  }

  /**
   * Navega visualmente hacia el campo (cambia de tab o abre acordeón)
   */
  focusOnField(controller) {
    if (!controller.domElement) return;

    // Buscar el contenedor de grupo padre
    const groupContainer = controller.domElement.closest(".group-container");
    if (groupContainer) {
      const groupId = groupContainer.id;

      // 1. Activar Tab (Desktop)
      const tabBtn = document.querySelector(
        `.tab-trigger[data-target="${groupId}"]`
      );
      if (tabBtn) tabBtn.click();

      // 2. Abrir Acordeón (Móvil)
      const accordionBtn = groupContainer.querySelector(".accordion-trigger");
      if (accordionBtn) {
        const content = groupContainer.querySelector(".group-content");
        // Si está cerrado (max-h-0), simular click para abrir
        if (content.classList.contains("max-h-0")) accordionBtn.click();
      }

      // 3. Scroll suave hacia el campo (con pequeño delay para que la UI se expanda)
      setTimeout(() => {
        controller.domElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        // Opcional: Dar foco al input
        const input = controller.domElement.querySelector(
          "input, select, textarea"
        );
        if (input) input.focus();
      }, 300);
    }
  }
}
