import { db } from './firebase.js';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Inicializa la estructura de datos para un nuevo usuario
 */
export async function initializeUserData(userId, appId = 'mi-gestion-v1') {
  try {
    const userRef = doc(db, 'artifacts', appId, 'users', userId);
    
    // Crear configuración inicial del usuario
    const userConfig = {
      userId,
      appId,
      encryptionSettings: {
        keyDerivationAlgorithm: 'PBKDF2',
        keyIterations: 100000,
        keyLength: 256,
        lastPasswordChange: new Date().toISOString(),
        requiresReencryption: false
      },
      appSettings: {
        theme: 'auto',
        language: 'es',
        autoLock: 30,
        backupEnabled: true,
        backupFrequency: 'weekly',
        twoFactorEnabled: false
      },
      stats: {
        totalDocuments: 0,
        lastSync: new Date().toISOString(),
        storageUsed: 0,
        documentCountByArea: {}
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Crear plantillas del sistema por defecto
    const systemTemplates = [
      {
        id: 'template_basic_info',
        name: 'Información Básica',
        description: 'Datos personales básicos',
        icon: '👤',
        color: '#3B82F6',
        fields: [
          {
            id: 'full_name',
            name: 'fullName',
            type: 'string',
            label: 'Nombre Completo',
            required: true,
            sensitive: false,
            order: 1
          },
          {
            id: 'email',
            name: 'email',
            type: 'string',
            label: 'Correo Electrónico',
            required: false,
            sensitive: false,
            order: 2
          }
        ],
        settings: {
          allowDuplicates: false,
          maxEntries: 0,
          category: 'personal',
          isSystemTemplate: true,
          version: '1.0'
        },
        isPublic: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    // Guardar configuración
    await setDoc(doc(db, 'artifacts', appId, 'users', userId, 'metadata', 'user_config'), userConfig);
    
    // Guardar plantillas del sistema
    for (const template of systemTemplates) {
      template.userId = userId;
      await setDoc(
        doc(db, 'artifacts', appId, 'users', userId, 'metadata', 'templates', template.id),
        template
      );
    }
    
    console.log('✅ Datos de usuario inicializados correctamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error al inicializar datos de usuario:', error);
    throw error;
  }
}
