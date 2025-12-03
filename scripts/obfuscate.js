import JavaScriptObfuscator from "javascript-obfuscator";
import fs from "fs";
import path from "path";

const obfuscateFile = (filePath) => {
  const code = fs.readFileSync(filePath, "utf8");

  const obfuscated = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    numbersToExpressions: true,
    simplify: true,
    stringArrayShuffle: true,
    splitStrings: true,
    stringArrayThreshold: 0.75,
    disableConsoleOutput: true,
  });

  fs.writeFileSync(filePath, obfuscated.getObfuscatedCode());
  console.log(`✓ Ofuscado: ${filePath}`);
};

// Ofuscar archivos JavaScript en dist/
const distDir = path.join(process.cwd(), "dist");
const jsFiles = fs.readdirSync(distDir).filter((file) => file.endsWith(".js"));

jsFiles.forEach((file) => {
  obfuscateFile(path.join(distDir, file));
});

console.log("✅ Ofuscación completada");
