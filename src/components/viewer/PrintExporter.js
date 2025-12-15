// src/components/viewer/PrintExporter.js
import { getLocalCurrency } from "../../utils/helpers.js";

export const printDocument = (
  documentMetadata,
  template,
  decryptedData,
  isCompact = false
) => {
  // 1. LIMPIEZA TOTAL: Eliminar cualquier iframe previo (por ID o Nombre)
  const iframeId = "print-target-iframe";
  const oldFrames = document.querySelectorAll(
    `#${iframeId}, iframe[name='print_frame']`
  );
  oldFrames.forEach((frame) => frame.remove());

  // 2. CREACIÓN BLINDADA
  const iframe = document.createElement("iframe");
  iframe.id = iframeId;
  iframe.name = "print_frame";

  // Ocultar visualmente pero mantener en el árbol de renderizado para que Chrome lo procese
  Object.assign(iframe.style, {
    position: "fixed",
    right: "0",
    bottom: "0",
    width: "0",
    height: "0",
    border: "0",
    visibility: "hidden",
    zIndex: "-1",
  });

  document.body.appendChild(iframe);

  const currencyConfig = getLocalCurrency();
  const contentHtml = generatePrintHtml(
    documentMetadata,
    template,
    decryptedData,
    currencyConfig,
    isCompact
  );

  // 3. HTML ESTRUCTURAL (Con Fuentes y Reset de Estilos)
  const fullHtml = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>${documentMetadata.title || "Impresión"}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            
            <style>
                @media print {
                    @page { 
                        margin: ${isCompact ? "1cm" : "1.5cm"}; 
                        size: auto; 
                    }
                    body { 
                        -webkit-print-color-adjust: exact !important; 
                        print-color-adjust: exact !important; 
                    }
                    .page-break { break-inside: avoid; }
                }
                
                body { 
                    font-family: 'Inter', sans-serif;
                    background-color: white;
                    color: #0f172a; /* slate-900 */
                    font-size: 12px; /* Base size para impresión */
                    line-height: 1.5;
                }

                /* Forzar blanco puro en fondos para ahorrar tinta y limpiar look */
                .print-card {
                    background-color: white !important;
                    border: 1px solid #e2e8f0; /* slate-200 */
                    box-shadow: none !important;
                }
            </style>
        </head>
        <body class="antialiased">
            ${contentHtml}
            <script>
                window.onload = () => {
                    // Pequeño delay para asegurar carga de fuentes e iconos
                    setTimeout(() => {
                        window.focus();
                        window.print();
                    }, 800);
                };
            </script>
        </body>
        </html>
    `;

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(fullHtml);
  doc.close();
};

function generatePrintHtml(
  metadata,
  template,
  data,
  currencyConfig,
  isCompact
) {
  let date = "Fecha desconocida";
  try {
    date = new Date(metadata.updatedAt).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (e) {}

  const docId = metadata.id || "SIN-ID";
  const accentColor = template.color || "#0f172a"; // Default oscuro si no hay color

  // --- 1. ENCABEZADO (Estilo Membrete) ---
  let headerHtml = "";

  if (isCompact) {
    headerHtml = `
        <div class="flex justify-between items-end border-b-2 border-slate-900 pb-3 mb-6">
            <div class="flex items-center gap-3">
                <div class="text-lg">
                    ${template.icon || '<i class="fas fa-file"></i>'}
                </div>
                <div>
                    <h1 class="text-xl font-bold text-slate-900 leading-none">${
                      metadata.title
                    }</h1>
                    <p class="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">${
                      template.name
                    }</p>
                </div>
            </div>
            <div class="text-right text-[10px]">
                <p class="font-bold text-slate-700">${date}</p>
                <p class="text-slate-400 font-mono">ID: ${docId.substring(
                  0,
                  8
                )}</p>
            </div>
        </div>`;
  } else {
    // ESTILO FORMAL (Sin cajas de colores, limpio)
    headerHtml = `
        <div class="mb-10">
             <div class="flex justify-between items-start">
                <div class="flex gap-5 items-center">
                    <div class="w-16 h-16 flex items-center justify-center text-3xl border border-slate-200 rounded-lg text-slate-800 bg-white">
                        ${template.icon || '<i class="fas fa-file"></i>'}
                    </div>
                    <div>
                       <h1 class="text-3xl font-bold text-slate-900 leading-tight mb-1">${
                         metadata.title
                       }</h1>
                       <div class="flex items-center gap-3 text-sm text-slate-500">
                          <span class="font-semibold text-brand-700 uppercase tracking-wide text-xs">${
                            template.name
                          }</span>
                          <span class="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span>${date}</span>
                       </div>
                    </div>
                </div>
                <div class="text-right">
                    <div class="inline-block bg-slate-50 border border-slate-200 px-3 py-1 rounded text-[10px] font-mono text-slate-500">
                        ID: ${docId}
                    </div>
                </div>
             </div>
             <div class="w-full h-1 mt-6 bg-slate-100 relative">
                <div class="absolute top-0 left-0 h-full w-24" style="background-color: ${accentColor}"></div>
             </div>
        </div>`;
  }

  // --- 2. CUERPO (Grid Limpio) ---
  const gridCols = isCompact
    ? "grid-cols-4 gap-4"
    : "grid-cols-2 gap-x-8 gap-y-6";

  let html = `
        ${headerHtml}
        <div class="grid ${gridCols}">
    `;

  template.fields.forEach((field) => {
    const value = data[field.id];

    // Lógica de Grid
    let spanClass = "col-span-1";
    const isWideType =
      ["separator", "table", "textarea"].includes(field.type) ||
      (field.type === "text" && String(value).length > 60);

    if (isCompact) {
      spanClass = isWideType ? "col-span-4" : "col-span-1";
    } else {
      spanClass = isWideType ? "col-span-2" : "col-span-1";
    }

    // A) SEPARADORES (Solo texto, sin cajas)
    if (field.type === "separator") {
      html += `
            <div class="${spanClass} mt-4 mb-2 page-break">
                <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center gap-2">
                    ${
                      !isCompact
                        ? `<i class="fas fa-chevron-right text-[10px] text-slate-400"></i>`
                        : ""
                    } 
                    ${field.label}
                </h3>
            </div>`;
      return;
    }

    // B) TABLAS
    if (field.type === "table") {
      html += `<div class="${spanClass}">${renderPrintTable(
        field,
        value,
        currencyConfig,
        isCompact
      )}</div>`;
      return;
    }

    // C) CAMPOS (Diseño "Formulario Impreso" - Label arriba, Valor abajo con línea sutil)
    const displayValue = formatPrintValue(
      field.type,
      value,
      currencyConfig,
      isCompact
    );

    // Si estamos en modo ESTÁNDAR, usamos un diseño de "campo de formulario" limpio
    if (!isCompact) {
      html += `
            <div class="${spanClass} page-break mb-2">
              <dt class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                 ${field.label}
              </dt>
              <dd class="text-sm text-slate-900 border-b border-slate-100 pb-1 font-medium leading-relaxed">
                 ${displayValue}
              </dd>
            </div>`;
    } else {
      // Modo Compacto: Más denso
      html += `
            <div class="${spanClass} border-b border-slate-100 py-1 page-break">
              <span class="text-[10px] font-bold text-slate-500 uppercase mr-1">${field.label}:</span>
              <span class="text-xs font-semibold text-slate-900">${displayValue}</span>
            </div>`;
    }
  });

  html += `</div>`;

  // --- 3. PIE DE PÁGINA (Footer) ---
  if (!isCompact) {
    html += `
        <div class="mt-16 pt-6 border-t border-slate-200 flex items-center justify-between text-slate-400">
           <div class="flex items-center text-[10px] font-bold uppercase tracking-widest gap-2">
                <i class="fas fa-lock text-slate-300"></i>
                <span>Documento Protegido (E2EE)</span>
           </div>
           <div class="text-[9px]">
                Generado el ${new Date().toLocaleString()}
           </div>
        </div>`;
  }

  return html;
}

// --- HELPERS (Tablas y Formatos) ---

function renderPrintTable(field, rows, currencyConfig, isCompact) {
  if (!Array.isArray(rows) || rows.length === 0) {
    if (isCompact) return "";
    return `<div class="py-2 text-xs text-slate-400 italic text-center border-b border-slate-100">${field.label} (Sin datos)</div>`;
  }

  const padding = isCompact ? "px-1 py-1" : "px-2 py-2";
  const fontSize = isCompact ? "text-[9px]" : "text-[11px]";

  const headers = field.columns
    .map(
      (c) =>
        `<th class="${padding} text-left ${fontSize} font-bold text-slate-500 uppercase tracking-wider border-b-2 border-slate-200">${c.label}</th>`
    )
    .join("");

  const body = rows
    .map((row) => {
      const cells = field.columns
        .map(
          (col) =>
            `<td class="${padding} ${fontSize} text-slate-700 border-b border-slate-100 align-top">${formatPrintValue(
              col.type,
              row[col.id],
              currencyConfig,
              isCompact
            )}</td>`
        )
        .join("");
      return `<tr class="page-break">${cells}</tr>`;
    })
    .join("");

  return `
        <div class="mt-2 mb-4 page-break w-full">
            ${
              !isCompact
                ? `<label class="block text-[10px] font-bold text-slate-400 uppercase mb-1">${field.label}</label>`
                : ""
            }
            <table class="w-full border-collapse">
                <thead><tr>${headers}</tr></thead>
                <tbody>${body}</tbody>
            </table>
        </div>`;
}

function formatPrintValue(type, value, currencyConfig, isCompact) {
  if (value === undefined || value === null || value === "") {
    return isCompact ? "—" : '<span class="text-slate-300 italic">Vacío</span>';
  }

  if (typeof value === "object" && value.url) {
    if (type === "url" && value.url.match(/\.(jpeg|jpg|gif|png|webp)$/i)) {
      const size = isCompact ? "w-6 h-6" : "w-12 h-12";
      return `<div class="flex items-center gap-2">
                <img src="${
                  value.url
                }" class="${size} object-cover rounded border border-slate-200 bg-slate-50">
                <span class="text-xs text-slate-700 font-medium">${
                  value.text || "Imagen"
                }</span>
             </div>`;
    }
    return `<span class="text-xs font-medium text-slate-800">${
      value.text || value.url
    }</span>`;
  }

  switch (type) {
    case "boolean":
      return value ? "Sí" : "No";
    case "currency":
      const formatted = new Intl.NumberFormat(currencyConfig.locale, {
        style: "currency",
        currency: currencyConfig.codigo,
      }).format(Number(value));
      return `<span class="font-mono font-bold text-slate-800">${formatted}</span>`;
    case "date":
      try {
        const [y, m, d] = String(value).split("-");
        return `${d}/${m}/${y}`;
      } catch (e) {
        return value;
      }
    default:
      return `<span class="whitespace-pre-wrap">${String(value)}</span>`;
  }
}
