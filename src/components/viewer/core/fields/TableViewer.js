import { AbstractViewer } from "../AbstractViewer.js";
import { ViewerRegistry } from "../ViewerRegistry.js";

export class TableViewer extends AbstractViewer {
  constructor(fieldConfig, value, options = {}) {
    super(fieldConfig, value, options);
    this.cellViewers = [];
    // Estado inicial del ordenamiento
    this.sortState = {
      colId: null, // ID de la columna activa
      dir: null, // 'asc' | 'desc' | null
    };
  }

  render() {
    this.cellViewers = [];
    // Usamos this.getSortedRows() para obtener los datos según el estado actual
    const rows = this.getSortedRows();

    if (rows.length === 0) {
      return `<div class="p-6 border border-dashed border-slate-200 rounded-lg bg-slate-50 text-center text-xs text-slate-400 flex flex-col items-center gap-2"><i class="fas fa-table text-xl opacity-20"></i>${this.field.label} (Tabla vacía)</div>`;
    }

    // Renderizamos encabezados con los botones de ordenamiento
    const headerHtml = this.field.columns
      .map((c) => {
        const icon = this.getSortIcon(c.id);
        const activeClass =
          this.sortState.colId === c.id && this.sortState.dir
            ? "text-slate-700 bg-slate-200"
            : "text-slate-400 hover:text-slate-600 hover:bg-slate-100";

        return `
            <th class="px-4 py-2 align-middle">
                <div class="flex items-center justify-between gap-2">
                    <span>${c.label}</span>
                    <button type="button" 
                            class="sort-btn w-6 h-6 flex items-center justify-center rounded transition-colors ${activeClass}"
                            data-col-id="${c.id}"
                            title="Ordenar por ${c.label}">
                        <span class="text-sm leading-none">${icon}</span>
                    </button>
                </div>
            </th>`;
      })
      .join("");

    // Usamos un helper para generar el cuerpo, ya que lo reusaremos al ordenar
    const bodyHtml = this.generateBodyHtml(rows);

    return `
    <div class="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm table-viewer-component" data-field-id="${this.field.id}">
        <div class="bg-slate-50 px-4 py-2 border-b border-slate-100 flex flex-wrap justify-between items-center gap-2">
            <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-500 uppercase">${this.field.label}</span>
                <span class="bg-white border border-slate-200 px-2 rounded-full text-[10px] text-slate-400 row-count">${rows.length}</span>
            </div>
            
            <div class="relative group">
                <div class="absolute inset-y-0 left-0 flex items-center pl-2 pointer-events-none">
                     <i class="fas fa-search text-slate-300 text-xs"></i>
                </div>
                <input 
                    type="text" 
                    data-action="search"
                    class="pl-7 pr-2 py-1 text-xs border border-slate-200 rounded-md text-slate-600 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 w-48 transition-all"
                    placeholder="Buscar..."
                >
            </div>
        </div>
        <div class="overflow-x-auto max-h-[500px]">
            <table class="min-w-full text-sm text-left text-slate-600">
                <thead class="bg-slate-50 text-xs text-slate-400 uppercase font-medium sticky top-0 z-10 shadow-sm">
                     ${headerHtml}
                </thead>
                <tbody class="divide-y divide-slate-100 table-body-content">
                    ${bodyHtml}
                </tbody>
            </table>
            <div class="hidden no-results-msg p-4 text-center text-xs text-slate-400">
                No se encontraron resultados.
            </div>
        </div>
    </div>`;
  }

  // --- HELPERS DE RENDERIZADO ---

  generateBodyHtml(rows) {
    // Limpiamos referencias previas porque vamos a regenerar
    // Nota: Esto asume que render() o handleSort() resetean this.cellViewers antes de llamar a esto.
    return rows
      .map((row) => {
        const cellsHtml = this.field.columns
          .map((col) => {
            const cellValue = row[col.id];
            const ViewerClass = ViewerRegistry.getViewerClass(col.type);
            const cellViewer = new ViewerClass(col, cellValue, this.options);

            this.cellViewers.push(cellViewer);

            return `<td class="px-4 py-2">${cellViewer.render(true)}</td>`;
          })
          .join("");

        return `<tr class="hover:bg-slate-50/50 transition-colors">${cellsHtml}</tr>`;
      })
      .join("");
  }

  getSortIcon(colId) {
    if (this.sortState.colId !== colId) return "🔀";
    if (this.sortState.dir === "asc") return "⬆️";
    if (this.sortState.dir === "desc") return "⬇️";
    return "🔀";
  }

  getSortedRows() {
    const originalRows = Array.isArray(this.value) ? this.value : [];
    if (!this.sortState.colId || !this.sortState.dir) {
      return [...originalRows]; // Retorna copia del orden original
    }

    const colId = this.sortState.colId;
    const dir = this.sortState.dir;
    const colConfig = this.field.columns.find((c) => c.id === colId);
    const type = colConfig ? colConfig.type : "text";

    return [...originalRows].sort((a, b) => {
      let valA = a[colId];
      let valB = b[colId];

      // Manejo de nulos
      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      // Extracción de valor si es objeto (ej. URL o Imagen)
      if (typeof valA === "object" && valA.text) valA = valA.text;
      if (typeof valB === "object" && valB.text) valB = valB.text;

      let comparison = 0;

      switch (type) {
        case "number":
        case "currency":
        case "percentage":
          comparison = Number(valA) - Number(valB);
          break;
        case "date":
          comparison = new Date(valA) - new Date(valB);
          break;
        default:
          comparison = String(valA)
            .toLowerCase()
            .localeCompare(String(valB).toLowerCase());
      }

      return dir === "asc" ? comparison : -comparison;
    });
  }

  // --- LOGICA POST RENDER ---

  postRender(container) {
    this.runCellPostRenders(container);
    this.setupSearch(container);
    this.setupSort(container);
  }

  runCellPostRenders(container) {
    if (this.cellViewers.length > 0) {
      this.cellViewers.forEach((viewer) => {
        if (viewer.postRender) {
          viewer.postRender(container);
        }
      });
    }
  }

  setupSort(container) {
    const tableComponent = container.querySelector(
      `[data-field-id="${this.field.id}"]`
    );
    if (!tableComponent) return;

    const sortButtons = tableComponent.querySelectorAll(".sort-btn");

    sortButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const colId = btn.dataset.colId;
        this.handleSort(colId, container);
      });
    });
  }

  handleSort(colId, container) {
    // 1. Lógica de rotación: 🔀 -> ⬆️ -> ⬇️ -> 🔀
    if (this.sortState.colId !== colId) {
      // Nueva columna: Ascendente
      this.sortState = { colId, dir: "asc" };
    } else if (this.sortState.dir === "asc") {
      // Misma columna: Asc -> Desc
      this.sortState = { colId, dir: "desc" };
    } else {
      // Misma columna: Desc -> Reset (Original)
      this.sortState = { colId: null, dir: null };
    }

    // 2. Obtener filas ordenadas
    const sortedRows = this.getSortedRows();

    // 3. Regenerar TBODY
    this.cellViewers = []; // Reset viewers
    const newBodyHtml = this.generateBodyHtml(sortedRows);
    const tbody = container.querySelector(
      `[data-field-id="${this.field.id}"] tbody`
    );
    tbody.innerHTML = newBodyHtml;

    // 4. Actualizar Iconos en el Header
    const headers = container.querySelectorAll(
      `[data-field-id="${this.field.id}"] thead .sort-btn`
    );
    headers.forEach((btn) => {
      const btnColId = btn.dataset.colId;
      const iconSpan = btn.querySelector("span");

      // Actualizar Emoji
      iconSpan.textContent = this.getSortIcon(btnColId);

      // Actualizar Estilos (Activo vs Inactivo)
      if (this.sortState.colId === btnColId && this.sortState.dir !== null) {
        btn.classList.remove("text-slate-400", "hover:bg-slate-100");
        btn.classList.add("text-slate-700", "bg-slate-200");
      } else {
        btn.classList.remove("text-slate-700", "bg-slate-200");
        btn.classList.add("text-slate-400", "hover:bg-slate-100");
      }
    });

    // 5. Reactivar listeners de celdas (Copy buttons, etc)
    this.runCellPostRenders(container);

    // 6. Re-aplicar búsqueda si hay texto escrito
    const searchInput = container.querySelector(
      `[data-field-id="${this.field.id}"] input[data-action="search"]`
    );
    if (searchInput && searchInput.value.trim() !== "") {
      searchInput.dispatchEvent(new Event("input"));
    }
  }

  setupSearch(container) {
    const searchInput = container.querySelector(
      `[data-field-id="${this.field.id}"] input[data-action="search"]`
    );
    const tableContainer = container.querySelector(
      `[data-field-id="${this.field.id}"]`
    );

    if (!searchInput || !tableContainer) return;

    // Nota: tbody se consulta dentro del listener para asegurar que siempre use el actual (tras ordenar)
    const noResultsMsg = tableContainer.querySelector(".no-results-msg");
    const countBadge = tableContainer.querySelector(".row-count");

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value;
      const tbody = tableContainer.querySelector("tbody");
      const rows = Array.from(tbody.querySelectorAll("tr"));
      const originalCount = this.value.length; // Usamos el total real de datos

      // 1. Limpiamos resaltados
      this.clearHighlights(tbody);

      const normalizedQuery = this.normalizeText(query);
      const searchTerms = normalizedQuery.split(" ").filter(Boolean);
      let visibleCount = 0;

      rows.forEach((row) => {
        const rowText = this.normalizeText(row.textContent);
        const isMatch = searchTerms.every((term) => rowText.includes(term));

        if (isMatch) {
          row.style.display = "";
          visibleCount++;
        } else {
          row.style.display = "none";
        }
      });

      // 2. Resaltado
      if (query && visibleCount > 0) {
        this.highlightTerms(tbody, searchTerms);
      }

      // 3. UI Feedback
      if (visibleCount === 0 && rows.length > 0) {
        noResultsMsg.classList.remove("hidden");
      } else {
        noResultsMsg.classList.add("hidden");
      }

      if (countBadge) {
        countBadge.textContent = query
          ? `${visibleCount}/${originalCount}`
          : originalCount;
      }
    });
  }

  // === LÓGICA DE RESALTADO Y UTILIDADES (Se mantienen igual) ===

  highlightTerms(rootElement, terms) {
    if (!terms || terms.length === 0) return;
    const patterns = terms.map((term) => this.getAccentInsensitiveRegex(term));
    const combinedRegex = new RegExp(`(${patterns.join("|")})`, "gi");

    const walker = document.createTreeWalker(
      rootElement,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    const textNodes = [];

    while (walker.nextNode()) {
      if (
        walker.currentNode.parentElement.tagName !== "SCRIPT" &&
        walker.currentNode.parentElement.tagName !== "STYLE"
      ) {
        textNodes.push(walker.currentNode);
      }
    }

    textNodes.forEach((node) => {
      if (node.nodeValue && combinedRegex.test(node.nodeValue)) {
        const fragment = document.createDocumentFragment();
        let lastIdx = 0;
        combinedRegex.lastIndex = 0;

        node.nodeValue.replace(combinedRegex, (match, p1, offset) => {
          fragment.appendChild(
            document.createTextNode(node.nodeValue.substring(lastIdx, offset))
          );
          const span = document.createElement("span");
          span.className =
            "bg-amber-100 text-slate-800 font-medium rounded-[1px]";
          span.textContent = match;
          span.dataset.highlight = "true";
          fragment.appendChild(span);
          lastIdx = offset + match.length;
          return match;
        });

        fragment.appendChild(
          document.createTextNode(node.nodeValue.substring(lastIdx))
        );
        node.parentNode.replaceChild(fragment, node);
      }
    });
  }

  clearHighlights(rootElement) {
    const highlights = rootElement.querySelectorAll(
      'span[data-highlight="true"]'
    );
    highlights.forEach((span) => {
      const parent = span.parentNode;
      parent.replaceChild(document.createTextNode(span.textContent), span);
      parent.normalize();
    });
  }

  getAccentInsensitiveRegex(text) {
    return text
      .replace(/[aáàäâ]/g, "[aáàäâ]")
      .replace(/[eéèëê]/g, "[eéèëê]")
      .replace(/[iíìïî]/g, "[iíìïî]")
      .replace(/[oóòöô]/g, "[oóòöô]")
      .replace(/[uúùüû]/g, "[uúùüû]")
      .replace(/[cç]/g, "[cç]")
      .replace(/[nñ]/g, "[nñ]");
  }

  normalizeText(text) {
    if (!text) return "";
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }
}
