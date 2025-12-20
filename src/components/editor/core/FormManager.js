// src/components/editor/core/FormManager.js
import { fieldRegistry } from "./FieldRegistry.js";

export class FormManager {
  constructor(fieldsDef, initialData = {}) {
    this.fieldsDef = fieldsDef;
    this.formData = { ...initialData };
    this.controllers = {};

    // Nueva propiedad para manejar el estado de las pestañas
    this.activeTabId = "group-principal";
  }

  /**
   * Método auxiliar para agrupar campos basado en separadores
   */
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

  renderHtml() {
    if (!this.fieldsDef || !Array.isArray(this.fieldsDef)) {
      return "";
    }

    const groups = this.groupFields();

    // Si solo hay un grupo (Principal), renderizamos plano como antes (sin tabs)
    // Esto es útil para plantillas simples.
    if (groups.length === 1) {
      return this.renderFieldsFlat(groups[0].fields);
    }

    // Renderizado con Tabs/Acordeón
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
                        ${
                          this.hasErrorInGroup(group)
                            ? '<span class="w-2 h-2 rounded-full bg-red-500 ml-1"></span>'
                            : ""
                        }
                    </button>
                  `;
                })
                .join("")}
          </div>

          <div class="space-y-4 md:space-y-0">
              ${groups
                .map((group, index) => {
                  const isActive = index === 0;
                  // En PC: 'hidden' si no es activo. En Móvil: siempre visible (el acordeón maneja la altura)
                  const desktopHiddenClass = isActive ? "" : "md:hidden";

                  return `
                    <div class="group-container ${desktopHiddenClass}" id="${
                    group.id
                  }" data-group-index="${index}">
                        
                        <button type="button" 
                                class="accordion-trigger md:hidden w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm mb-3 transition-all ${
                                  isActive
                                    ? "ring-2 ring-indigo-500/20 border-indigo-200"
                                    : ""
                                }">
                            <div class="flex items-center gap-3 font-bold text-slate-700">
                                <i class="${group.icon} text-indigo-500"></i>
                                ${group.label}
                            </div>
                            <i class="fas fa-chevron-down transition-transform ${
                              isActive ? "rotate-180" : ""
                            }"></i>
                        </button>

                        <div class="group-content transition-all duration-300 ${
                          isActive
                            ? "max-h-[5000px] opacity-100"
                            : "max-h-0 opacity-0 md:max-h-none md:opacity-100 overflow-hidden"
                        }">
                             <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-1 md:p-2">
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
   * Renderiza una lista plana de campos (reutilizado)
   */
  renderFieldsFlat(fields) {
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

  // Helper placeholder (se implementará lógica real en validación)
  hasErrorInGroup(group) {
    return false;
  }

  /**
   * ACTUALIZADO: Listeners para Tabs y Acordeones
   */
  postRender(container) {
    // 1. Inicializar controladores de campos
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

        // UI Pestañas
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

        // Mostrar/Ocultar Contenedores (Solo afecta la clase md:hidden)
        groupContainers.forEach((grp) => {
          if (grp.id === targetId) {
            grp.classList.remove("md:hidden");
          } else {
            grp.classList.add("md:hidden");
          }
        });
      });
    });

    // 3. Lógica Acordeón (Móvil)
    const accordionTriggers = container.querySelectorAll(".accordion-trigger");
    accordionTriggers.forEach((btn) => {
      btn.addEventListener("click", () => {
        const container = btn.closest(".group-container");
        const content = container.querySelector(".group-content");
        const icon = btn.querySelector(".fa-chevron-down");

        // Toggle
        const isClosed = content.classList.contains("max-h-0");

        if (isClosed) {
          content.classList.remove("max-h-0", "opacity-0", "overflow-hidden");
          content.classList.add("max-h-[5000px]", "opacity-100"); // Valor alto para permitir contenido
          icon.classList.add("rotate-180");
          btn.classList.add(
            "ring-2",
            "ring-indigo-500/20",
            "border-indigo-200"
          );
        } else {
          content.classList.add("max-h-0", "opacity-0", "overflow-hidden");
          content.classList.remove("max-h-[5000px]", "opacity-100");
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

  // ... handleFieldChange y getValidData se mantienen igual
  handleFieldChange(fieldId, newValue) {
    this.formData[fieldId] = newValue;
  }

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

    // --- NUEVO: Si hay error, abrir el tab correspondiente ---
    if (!isValid && firstErrorController) {
      this.focusOnField(firstErrorController);
    }

    return isValid ? finalData : null;
  }

  /**
   * Método para cambiar al tab donde está el campo (usado en validación)
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
        if (content.classList.contains("max-h-0")) accordionBtn.click();
      }

      // 3. Scroll al campo
      setTimeout(() => {
        controller.domElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 300);
    }
  }
}
