import { AbstractViewer } from "../AbstractViewer.js";
// Nota: Ajustamos la ruta porque ahora estamos dos carpetas más adentro
import { detectMediaType } from "../../../../utils/helpers.js";

export class UrlViewer extends AbstractViewer {
  render(isTableContext = false) {
    // 1. Extraemos el valor usando this.value
    const val = this.value;

    // Lógica original adaptada
    let url = typeof val === "object" ? val?.url : val;
    let text = typeof val === "object" ? val?.text || url : val;

    if (!url) return '<span class="text-slate-300 italic text-xs">--</span>';

    const mediaType = detectMediaType(url);
    const display =
      text === url
        ? mediaType === "audio"
          ? "Archivo de Audio"
          : "Imagen Adjunta"
        : text;

    const displayText = display;

    // --- LÓGICA DE MEDIOS (Audio / Imagen) ---
    if (mediaType === "audio" || mediaType === "image") {
      const icon = mediaType === "audio" ? "fa-music" : "fa-image";
      const colorClass =
        mediaType === "audio"
          ? "text-pink-500 group-hover:text-pink-600"
          : "text-indigo-500 group-hover:text-indigo-600";
      const bgClass =
        mediaType === "audio"
          ? "bg-pink-50 group-hover:bg-pink-100"
          : "bg-indigo-50 group-hover:bg-indigo-100";

      return `
            <div class="flex items-center gap-3 group">
                <button type="button" 
                        class="trigger-media-btn w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 ${bgClass} transition-all shadow-sm hover:scale-105"
                        data-type="${mediaType}" 
                        data-src="${url}" 
                        data-title="${display}"
                        title="Ver ${
                          mediaType === "audio" ? "Audio" : "Imagen"
                        }">
                    <i class="fas ${icon} ${colorClass} text-sm"></i>
                </button>
                <a href="${url}" target="_blank" class="text-sm font-medium text-slate-700 hover:text-primary hover:underline truncate">
                    ${displayText}
                    <i class="fas fa-external-link-alt text-[10px] ml-1 text-slate-300"></i>
                </a>
            </div>
        `;
    }

    // --- ENLACE NORMAL ---
    return `
        <a href="${url}" target="_blank" class="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors break-all text-sm">
            <i class="fas fa-link text-xs opacity-50 flex-shrink-0"></i> ${displayText}
        </a>`;
  }

  postRender(container) {
    // Si necesitas reactivar los reproductores de audio o modales de imagen
    // la lógica iría aquí.
    // Por ahora, tu DocumentViewer original delegaba esto globalmente,
    // pero idealmente deberías mover esa lógica de "clicks" aquí en el futuro.
  }
}
