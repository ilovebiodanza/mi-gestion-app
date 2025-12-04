/**
 * Servicio de gestión de plantillas personalizadas
 */

import { firebaseService } from "../firebase-cdn.js";
import { encryptionService } from "../encryption/index.js";

/**
 * Servicio de plantillas
 */
class TemplateService {
  constructor() {
    this.userId = null;
    this.appId = "mi-gestion-v1";
    this.systemTemplates = this.getSystemTemplates();
  }

  /**
   * Inicializar servicio con usuario
   */
  initialize(userId) {
    this.userId = userId;
    console.log("📋 Servicio de plantillas inicializado para:", userId);
  }

  /**
   * Obtener plantillas del sistema
   */
  getSystemTemplates() {
    return [
      {
        id: "template_basic_info",
        name: "Información Básica",
        description: "Datos personales básicos",
        icon: "👤",
        color: "#3B82F6",
        fields: [
          {
            // ID se generará automáticamente
            type: "string",
            label: "Nombre Completo",
            placeholder: "Juan Pérez",
            required: true,
            sensitive: false,
            validation: {
              minLength: 2,
              maxLength: 100,
            },
            order: 1,
          },
          {
            type: "string",
            label: "Correo Electrónico",
            placeholder: "ejemplo@email.com",
            required: false,
            sensitive: false,
            validation: {
              pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
            },
            order: 2,
          },
          {
            type: "string",
            label: "Teléfono",
            placeholder: "+1234567890",
            required: false,
            sensitive: false,
            order: 3,
          },
        ],
        settings: {
          allowDuplicates: false,
          maxEntries: 0,
          category: "personal",
          isSystemTemplate: true,
          version: "1.0",
        },
      },
      {
        id: "template_access",
        name: "Accesos a Aplicaciones",
        description: "Credenciales de acceso a sistemas",
        icon: "🔐",
        color: "#10B981",
        fields: [
          {
            type: "string",
            label: "Nombre del Sistema",
            placeholder: "Google, Facebook, etc.",
            required: true,
            sensitive: false,
            order: 1,
          },
          {
            type: "url",
            label: "URL de Acceso",
            placeholder: "https://ejemplo.com/login",
            required: false,
            sensitive: false,
            order: 2,
          },
          {
            type: "string",
            label: "Usuario/Email",
            placeholder: "usuario@ejemplo.com",
            required: true,
            sensitive: false,
            order: 3,
          },
          {
            type: "text",
            label: "Contraseña",
            placeholder: "••••••••",
            required: true,
            sensitive: true,
            encryptionLevel: "high",
            order: 4,
          },
          {
            type: "text",
            label: "Método de Recuperación",
            placeholder: "Email alternativo, teléfono, etc.",
            required: false,
            sensitive: false,
            order: 5,
          },
        ],
        settings: {
          allowDuplicates: true,
          maxEntries: 0,
          category: "access",
          isSystemTemplate: true,
          version: "1.0",
        },
      },
    ];
  }

  /**
   * Obtener todas las plantillas del usuario
   */
  async getUserTemplates() {
    if (!this.userId) {
      throw new Error("Usuario no autenticado");
    }

    try {
      // Por ahora, devolver plantillas del sistema
      // Más adelante agregaremos plantillas personalizadas de Firestore
      return this.systemTemplates;
    } catch (error) {
      console.error("Error al obtener plantillas:", error);
      throw error;
    }
  }

  /**
   * Obtener plantilla por ID
   */
  async getTemplateById(templateId) {
    const allTemplates = await this.getUserTemplates();
    return allTemplates.find((t) => t.id === templateId) || null;
  }

  /**
   * Crear nueva plantilla personalizada
   */
  async createTemplate(templateData) {
    if (!this.userId) {
      throw new Error("Usuario no autenticado");
    }

    // Primero, validar los datos básicos (sin id)
    this.validateTemplateData(templateData);

    // Generar ID después de la validación
    const newTemplate = {
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: this.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...templateData,
      settings: {
        allowDuplicates: false,
        maxEntries: 0,
        category: "custom",
        isSystemTemplate: false,
        version: "1.0",
        ...templateData.settings,
      },
    };

    // Validar plantilla completa
    this.validateTemplate(newTemplate);

    // Aquí guardaríamos en Firestore
    // Por ahora, solo devolver la plantilla creada
    console.log("📝 Plantilla creada:", newTemplate.name);
    console.log("🆔 ID generado:", newTemplate.id);

    return newTemplate;
  }

  /**
   * Validar campo individual
   */
  validateField(field, index) {
    const requiredFieldProps = ["label", "type"];
    const missingProps = requiredFieldProps.filter((prop) => !field[prop]);

    if (missingProps.length > 0) {
      throw new Error(
        `Campo ${index + 1} inválido. Faltan: ${missingProps.join(", ")}`
      );
    }

    // Generar ID automático si no existe
    if (!field.id) {
      field.id = this.generateFieldId(field.label, index);
    }

    // Validar tipo
    const validTypes = [
      "string",
      "number",
      "boolean",
      "text",
      "date",
      "url",
      "email",
    ];
    if (!validTypes.includes(field.type)) {
      throw new Error(
        `Tipo de campo inválido: "${
          field.type
        }". Tipos válidos: ${validTypes.join(", ")}`
      );
    }

    return true;
  }

  /**
   * Generar ID automático a partir de la etiqueta
   */
  generateFieldId(label, index) {
    if (!label || typeof label !== "string") {
      return `campo_${index + 1}`;
    }

    // Convertir etiqueta a ID válido
    const id = label
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
      .replace(/[^a-z0-9_$]/g, "_") // Reemplazar caracteres no válidos
      .replace(/_{2,}/g, "_") // Eliminar múltiples guiones bajos
      .replace(/^_|_$/g, ""); // Eliminar guiones al inicio/final

    // Asegurar que comience con letra o _
    if (!id || !/^[a-zA-Z_$]/.test(id)) {
      return `campo_${index + 1}`;
    }

    return id;
  }

  /**
   * Validar estructura de datos de plantilla (sin id)
   */
  validateTemplateData(templateData) {
    const requiredProps = ["name", "fields"];
    const missingProps = requiredProps.filter((prop) => !templateData[prop]);

    if (missingProps.length > 0) {
      throw new Error(
        `Datos de plantilla inválidos. Faltan: ${missingProps.join(", ")}`
      );
    }

    if (
      !Array.isArray(templateData.fields) ||
      templateData.fields.length === 0
    ) {
      throw new Error("La plantilla debe tener al menos un campo");
    }

    // Validar cada campo
    templateData.fields.forEach((field, index) => {
      this.validateField(field, index);
    });

    return true;
  }

  /**
   * Validar plantilla completa (con id)
   */
  validateTemplate(template) {
    const requiredProps = ["id", "name", "fields"];
    const missingProps = requiredProps.filter((prop) => !template[prop]);

    if (missingProps.length > 0) {
      throw new Error(`Plantilla inválida. Faltan: ${missingProps.join(", ")}`);
    }

    if (!Array.isArray(template.fields) || template.fields.length === 0) {
      throw new Error("La plantilla debe tener al menos un campo");
    }

    // Validar cada campo
    template.fields.forEach((field, index) => {
      this.validateField(field, index);
    });

    return true;
  }

  /**
   * Actualizar plantilla existente
   */
  async updateTemplate(templateId, updates) {
    if (!this.userId) {
      throw new Error("Usuario no autenticado");
    }

    console.log("✏️  Actualizando plantilla:", templateId);

    // Por ahora, simular actualización
    const updatedTemplate = {
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return updatedTemplate;
  }

  /**
   * Eliminar plantilla
   */
  async deleteTemplate(templateId) {
    if (!this.userId) {
      throw new Error("Usuario no autenticado");
    }

    console.log("🗑️  Eliminando plantilla:", templateId);

    // Verificar que no sea plantilla del sistema
    const template = await this.getTemplateById(templateId);
    if (template?.settings?.isSystemTemplate) {
      throw new Error("No se pueden eliminar plantillas del sistema");
    }

    return { success: true, message: "Plantilla eliminada" };
  }

  /**
   * Obtener plantillas por categoría
   */
  async getTemplatesByCategory(category) {
    const allTemplates = await this.getUserTemplates();
    return allTemplates.filter((t) => t.settings.category === category);
  }

  /**
   * Obtener categorías disponibles
   */
  async getCategories() {
    const templates = await this.getUserTemplates();
    const categories = [...new Set(templates.map((t) => t.settings.category))];

    return categories.map((category) => ({
      id: category,
      name: this.getCategoryName(category),
      icon: this.getCategoryIcon(category),
      count: templates.filter((t) => t.settings.category === category).length,
    }));
  }

  /**
   * Obtener nombre amigable de categoría
   */
  getCategoryName(category) {
    const names = {
      personal: "Personal",
      access: "Accesos",
      financial: "Financiero",
      health: "Salud",
      custom: "Personalizado",
    };

    return names[category] || category;
  }

  /**
   * Obtener icono de categoría
   */
  getCategoryIcon(category) {
    const icons = {
      personal: "👤",
      access: "🔐",
      financial: "💰",
      health: "🏥",
      custom: "📋",
    };

    return icons[category] || "📄";
  }
}

// Exportar instancia única
export const templateService = new TemplateService();
