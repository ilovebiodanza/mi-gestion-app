import JavaScriptObfuscator from "javascript-obfuscator";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// Compatibilidad para __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función recursiva para encontrar archivos JS en cualquier subcarpeta
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith(".js")) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const obfuscateFile = (filePath) => {
  console.log(`🔒 Procesando: ${path.basename(filePath)}...`);
  
  try {
    const code = fs.readFileSync(filePath, "utf8");

    const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1, // Máxima agresividad
      numbersToExpressions: true,
      simplify: true,
      stringArrayShuffle: true,
      splitStrings: true,
      stringArrayThreshold: 1,
      deadCodeInjection: true,        // Añade código basura para confundir
      deadCodeInjectionThreshold: 0.4,
      disableConsoleOutput: true,     // Bloquea console.log en runtime
      selfDefending: true,            // Protege contra formateo automático
      ignoreImports: true,            // No romper imports de ES Modules
    });

    fs.writeFileSync(filePath, obfuscationResult.getObfuscatedCode());
    console.log(`✅ Ofuscado exitoso: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error ofuscando ${filePath}:`, error.message);
    process.exit(1); // Detener deploy si falla
  }
};

// Ejecución
const distDir = path.resolve(process.cwd(), "dist");

if (!fs.existsSync(distDir)) {
    console.error("❌ Error: La carpeta 'dist' no existe. Ejecuta 'npm run build' primero.");
    process.exit(1);
}

console.log("🔍 Buscando archivos JavaScript en:", distDir);
const jsFiles = getAllFiles(distDir);

if (jsFiles.length === 0) {
    console.warn("⚠️ No se encontraron archivos .js para ofuscar.");
} else {
    jsFiles.forEach((file) => obfuscateFile(file));
    console.log("🎉 Proceso de ofuscación terminado.");
}