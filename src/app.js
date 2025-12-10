// src/app.js
import { authService } from "./services/auth.js";
import { AuthForms } from "./components/AuthForms.js";
import { PasswordPrompt } from "./components/PasswordPrompt.js";
import { encryptionService } from "./services/encryption/index.js";
import { TemplateManager } from "./components/TemplateManager.js";
import { templateService } from "./services/templates/index.js";
import { DocumentEditor } from "./components/DocumentEditor.js";
import { VaultList } from "./components/VaultList.js";
import { DocumentViewer } from "./components/DocumentViewer.js";
import { SettingsManager } from "./components/SettingsManager.js";

console.log("🚀 Mi Gestión - Inicializando sistema...");

document.addEventListener("DOMContentLoaded", () => {
  initializeApplication();
});

async function initializeApplication() {
  const appElement = document.getElementById("app");
  if (!appElement) return;

  // Listener de Auth
  authService.subscribe(async (user) => {
    await handleAuthStateChange(user, appElement);
  });

  // Estado inicial
  const user = authService.getCurrentUser();
  await handleAuthStateChange(user, appElement);
}

async function handleAuthStateChange(user, appElement) {
  if (user) {
    try {
      // Cargar dependencias de usuario
      await templateService.initialize(user.uid);
    } catch (error) {
      console.error("Error inicializando servicios:", error);
    }
    showDashboard(user, appElement);
    await checkAndInitializeEncryption(user);
  } else {
    showAuthForms(appElement);
  }
}

async function checkAndInitializeEncryption(user) {
  // Pequeño delay para asegurar que la UI renderizó
  setTimeout(async () => {
    if (!encryptionService.isReady()) {
      const passwordPrompt = new PasswordPrompt(async (password) => {
        try {
          await authService.initializeEncryption(password);
          return true;
        } catch (error) {
          return false;
        }
      }, user.email);
      passwordPrompt.show();
    }
  }, 500);
}

function showAuthForms(appElement) {
  const authForms = new AuthForms((userData) => {
    console.log("Autenticación exitosa");
  });

  // DISEÑO AUTH ACTUALIZADO
  appElement.innerHTML = `
    <div class="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-slate-200">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all">
        <div class="bg-gradient-to-r from-primary to-secondary p-8 text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-4 shadow-inner border border-white/30">
            <i class="fas fa-shield-alt text-3xl text-white"></i>
          </div>
          <h1 class="text-3xl font-bold text-white tracking-tight">Mi Gestión</h1>
          <p class="text-blue-100 text-sm mt-2 font-medium">Bóveda Digital Segura</p>
        </div>
        
        <div id="authContainer" class="p-8"></div>
        
        <div class="px-8 pb-6 text-center">
          <p class="text-xs text-slate-400 flex items-center justify-center gap-2">
            <i class="fas fa-lock text-green-500"></i>
            Encriptado de Extremo a Extremo (E2EE)
          </p>
        </div>
      </div>
    </div>
  `;

  const authContainer = document.getElementById("authContainer");
  if (authContainer) authForms.updateView(authContainer);
}

async function showDashboard(user, appElement) {
  const userRole = await authService.getUserRole();

  // Badge de Admin mejorado
  const adminBadge =
    userRole === "admin"
      ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
         <i class="fas fa-shield-virus"></i> Admin
       </span>`
      : `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-blue-200">
         <i class="fas fa-user"></i> Usuario
       </span>`;

  // Botón Admin
  const adminNav =
    userRole === "admin"
      ? `<a href="#" id="navAdmin" class="text-slate-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
         Admin Panel
       </a>`
      : "";

  appElement.innerHTML = `
    <div class="min-h-screen bg-slate-50 flex flex-col">
      <nav class="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            
            <div class="flex items-center gap-8">
              <div class="flex items-center gap-2">
                <div class="bg-gradient-to-br from-primary to-secondary text-white w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <i class="fas fa-shield-alt text-sm"></i>
                </div>
                <span class="font-bold text-slate-800 text-lg tracking-tight">Mi Gestión</span>
              </div>
              
              <div class="hidden md:flex items-center space-x-1">
                <a href="#" id="navHome" class="text-slate-600 hover:text-primary hover:bg-primary-light px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  <i class="fas fa-home mr-1.5 opacity-70"></i>Inicio
                </a>
                <a href="#mis-datos" id="navMyData" class="text-slate-600 hover:text-primary hover:bg-primary-light px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  <i class="fas fa-database mr-1.5 opacity-70"></i>Bóveda
                </a>
                <a href="#" id="navSettings" class="text-slate-600 hover:text-primary hover:bg-primary-light px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  <i class="fas fa-cogs mr-1.5 opacity-70"></i>Ajustes
                </a>
                ${adminNav}
              </div>
            </div>
            
            <div class="flex items-center gap-4">
              <div class="hidden md:flex flex-col items-end">
                <span class="text-sm font-semibold text-slate-700 leading-none">${
                  user.email.split("@")[0]
                }</span>
                <span class="mt-1">${adminBadge}</span>
              </div>
              
              <div class="relative group">
                <button id="userMenuButton" class="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 text-slate-600 hover:ring-2 hover:ring-offset-2 hover:ring-primary transition-all">
                   <span class="font-bold text-lg">${user.email
                     .charAt(0)
                     .toUpperCase()}</span>
                </button>
                
                <div id="userMenu" class="hidden absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 transform transition-all">
                  <div class="p-4 border-b border-slate-100 md:hidden">
                    <p class="text-sm font-medium text-slate-900 truncate">${
                      user.email
                    }</p>
                    <div class="mt-2">${adminBadge}</div>
                  </div>
                  <div class="py-1">
                    <button id="logoutButton" class="group flex w-full items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-red-50 hover:text-red-700 transition-colors">
                      <i class="fas fa-sign-out-alt mr-3 text-slate-400 group-hover:text-red-500"></i>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main class="flex-grow max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div id="dynamicContent" class="animate-fade-in"></div>
      </main>
    </div>
  `;

  setupDashboardListeners();

  if (userRole === "admin") {
    document.getElementById("navAdmin")?.addEventListener("click", (e) => {
      e.preventDefault();
      alert("🚧 Panel Admin: Próximamente gestión de usuarios global.");
    });
  }

  showVaultListView(user);
}

// Vista de Bóveda (Lista de Documentos)
function showVaultListView(user) {
  const mainContainer = document.querySelector("main");
  if (!mainContainer) return;

  mainContainer.innerHTML = `
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-800 tracking-tight">Mi Bóveda</h2>
        <p class="text-slate-500 mt-1">Gestiona tus documentos cifrados de forma segura.</p>
      </div>
      <button id="btnNewDocVault" class="group inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-medium py-2.5 px-5 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5">
        <i class="fas fa-plus text-sm transition-transform group-hover:rotate-90"></i>
        <span>Nuevo Documento</span>
      </button>
    </div>

    <div id="vaultListContainer" class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden min-h-[300px]">
      </div>
  `;

  const vaultList = new VaultList(
    (docId) => {
      console.log("🔓 Abriendo documento:", docId);
      showDocumentDetails(docId, user);
    },
    () => showTemplateManager(user)
  );

  document.getElementById("btnNewDocVault")?.addEventListener("click", () => {
    showTemplateManager(user);
  });

  vaultList.loadDocuments();
}

// Vista de Gestión de Plantillas
function showTemplateManager(user) {
  const appElement = document.getElementById("app");

  const templateManager = new TemplateManager((templateId) => {
    showDocumentEditor(templateId, user);
  });

  appElement.innerHTML = `
    <div class="min-h-screen bg-slate-50">
      <nav class="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16 items-center">
            <div class="flex items-center gap-4">
              <button id="backToDashboard" class="p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                <i class="fas fa-arrow-left text-lg"></i>
              </button>
              <div>
                <h1 class="text-xl font-bold text-slate-800">Nueva Entrada</h1>
                <p class="text-xs text-slate-500">Selecciona una plantilla para comenzar</p>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div id="templateManagerContainer"></div>
      </main>
    </div>
  `;

  const container = document.getElementById("templateManagerContainer");
  if (container) {
    container.innerHTML = templateManager.render();
    templateService.initialize(user.uid);
    templateManager.loadTemplates();
  }

  document.getElementById("backToDashboard")?.addEventListener("click", () => {
    showDashboard(user, appElement);
  });
}

// Helpers para navegación y configuración
async function showDocumentDetails(docId, user) {
  const appElement = document.getElementById("app");

  // Skeleton loader mientras carga
  appElement.innerHTML = `
    <div class="min-h-screen bg-slate-50 py-8 px-4 flex justify-center items-start">
      <div class="animate-pulse bg-white w-full max-w-4xl h-96 rounded-2xl shadow-sm"></div>
    </div>
  `;

  const viewer = new DocumentViewer(docId, (actionData) => {
    if (actionData) openEditorForUpdate(actionData, user);
    else showDashboard(user, appElement);
  });

  // Render container
  appElement.innerHTML = `
    <div class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div id="documentViewerPlaceholder" class="max-w-5xl mx-auto"></div>
    </div>
  `;

  document.getElementById("documentViewerPlaceholder").innerHTML =
    viewer.render();
  await viewer.load();
}

function openEditorForUpdate(initialData, user) {
  const appElement = document.getElementById("app");
  const editor = new DocumentEditor(
    initialData,
    () => showDocumentDetails(initialData.documentId, user),
    () => showDocumentDetails(initialData.documentId, user)
  );

  appElement.innerHTML = `
    <div class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div id="editorContainer" class="max-w-5xl mx-auto"></div>
    </div>
  `;

  document.getElementById("editorContainer").innerHTML = editor.render();
  editor.setupEventListeners();
}

async function showDocumentEditor(templateId, user) {
  const appElement = document.getElementById("app");

  // Loader
  appElement.innerHTML = `
    <div class="h-screen flex items-center justify-center bg-slate-50">
      <div class="flex flex-col items-center">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
        <p class="text-slate-500">Cargando plantilla...</p>
      </div>
    </div>`;

  try {
    const template = await templateService.getTemplateById(templateId);
    const editor = new DocumentEditor(
      { template: template },
      () => showDashboard(user, appElement),
      () => showTemplateManager(user)
    );

    appElement.innerHTML = `
      <div class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div id="editorContainer" class="max-w-5xl mx-auto"></div>
      </div>
    `;

    document.getElementById("editorContainer").innerHTML = editor.render();
    editor.setupEventListeners();
  } catch (error) {
    console.error(error);
    alert("Error cargando plantilla.");
    showTemplateManager(user);
  }
}

function showSettings(user) {
  const mainContainer = document.querySelector("main");
  const settingsManager = new SettingsManager();
  mainContainer.innerHTML = settingsManager.render();
  settingsManager.setupEventListeners();
}

function setupDashboardListeners() {
  const userMenuButton = document.getElementById("userMenuButton");
  const userMenu = document.getElementById("userMenu");
  const logoutButton = document.getElementById("logoutButton");

  if (userMenuButton && userMenu) {
    // Lógica mejorada para el dropdown
    userMenuButton.addEventListener("click", (e) => {
      e.stopPropagation();
      userMenu.classList.toggle("hidden");
      // Animación simple de entrada
      if (!userMenu.classList.contains("hidden")) {
        userMenu.classList.add("animate-fade-in-down");
      }
    });

    document.addEventListener("click", () => userMenu.classList.add("hidden"));
    userMenu.addEventListener("click", (e) => e.stopPropagation());
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", () => authService.logout());
  }

  // Navegación
  ["navMyData", "navHome"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", (e) => {
      e.preventDefault();
      const user = authService.getCurrentUser();
      showVaultListView(user);
    });
  });

  document.getElementById("navSettings")?.addEventListener("click", (e) => {
    e.preventDefault();
    const user = authService.getCurrentUser();
    showSettings(user);
  });
}

// Helpers de inicio
async function initializePostLogin(user, password) {
  await encryptionService.initialize(password, user.uid);
}

export function initApp() {
  initializeApplication();
}

window.app = { initializePostLogin };
