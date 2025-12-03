# Mi Gestión - Aplicación Web

Aplicación web para gestión segura de información personal con cifrado de extremo a extremo (E2EE).

## 🚀 Características

- Cifrado E2EE (cliente-side)
- Plantillas de datos personalizables
- Gestión de accesos y permisos
- Interfaz responsiva y moderna
- Despliegue en GitHub Pages

## 🛠️ Instalación y Desarrollo

### Prerrequisitos

- Node.js 18+
- Cuenta Firebase
- Cuenta GitHub

### Configuración

1. Clonar repositorio
2. Instalar dependencias: `npm install`
3. Configurar Firebase: Copiar `config/firebase-config.example.js` a `config/firebase-config.js`
4. Completar con tus credenciales de Firebase

### Comandos

- `npm run dev` - Servidor desarrollo
- `npm run build` - Build para producción
- `npm run obfuscate` - Ofuscar código JavaScript
- `npm run deploy` - Desplegar en GitHub Pages

## 🔐 Seguridad

- Cifrado PBKDF2 + AES-GCM
- Claves nunca salen del cliente
- Ofuscación de código en producción
- Reglas de Firestore estrictas

## 📄 Licencia

MIT - Ver [LICENSE](LICENSE)
