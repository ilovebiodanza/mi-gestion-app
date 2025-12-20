import { ElementRegistry } from "../../components/elements/ElementRegistry.js";

/**
 * Servicio para generar el formulario HTML.
 * Optimizado para usar la arquitectura de Elements.
 */
class TemplateFormGenerator {
  renderField(field, currentValue = "") {
    if (!field || !field.type)
      return `<p class="text-red-500 text-xs">Error: Campo sin tipo.</p>`;

    try {
      // 1. Obtener la Clase del Elemento desde el Registry
      const ElementClass = ElementRegistry.get(field.type);

      // 2. Instanciar (Strategy Pattern)
      const element = new ElementClass(field, currentValue);

      // 3. Renderizar Editor (HTML encapsulado)
      const editorHtml = element.renderEditor();

      // 4. Determinar Layout (1 o 2 columnas)
      const columns = ElementClass.getColumns ? ElementClass.getColumns() : 1;
      const wrapperClass = columns === 2 ? "md:col-span-2" : "md:col-span-1";

      return `
        <div class="field-wrapper ${wrapperClass} group animate-fade-in-up mb-4" 
             data-field-id="${field.id}" 
             data-field-type="${field.type}">
          ${editorHtml}
        </div>
      `;
    } catch (e) {
      console.error(`Error renderizando campo ${field.type}:`, e);
      return `
        <div class="md:col-span-1 p-3 bg-red-50 border border-red-100 rounded-lg">
           <p class="text-xs text-red-500 font-bold">Error en campo: ${field.label}</p>
        </div>`;
    }
  }

  generateFormHtml(template, data = {}) {
    if (!template || !template.fields)
      return `<div class="p-4 bg-red-50 text-red-600 rounded-lg">Error: Plantilla sin campos.</div>`;

    return template.fields
      .map((field) => this.renderField(field, data[field.id] || ""))
      .join("");
  }
}

export const templateFormGenerator = new TemplateFormGenerator();
