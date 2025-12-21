import { BaseElement } from "../BaseElement.js";

export class NumberElement extends BaseElement {
  static getType() {
    return "number";
  }
  static getLabel() {
    return "Número";
  }
  static getIcon() {
    return "fas fa-hashtag";
  }
  static getDescription() {
    return "Cantidades, unidades o cálculos matemáticos.";
  }
  static getColumns() {
    return 1;
  }

  renderSettings() {
    return `
      <div class="md:col-span-12">
        <label class="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Placeholder</label>
        <input type="text" id="setting-placeholder-${this.def.id}" value="${
      this.def.placeholder || ""
    }" 
               class="w-full px-3 py-2 bg-white/60 border border-slate-200 rounded-lg text-sm outline-none transition focus:ring-2 focus:ring-indigo-100"
               placeholder="Ej: 0">
      </div>`;
  }

  postRenderSettings(container, updateConfig) {
    container
      .querySelector(`#setting-placeholder-${this.def.id}`)
      ?.addEventListener("input", (e) =>
        updateConfig("placeholder", e.target.value)
      );
  }

  renderLeftSymbol() {
    return `<i class="fas fa-hashtag"></i>`;
  }

  renderEditor() {
    const placeholder = this.def.placeholder || "0";
    const label = this.def.label || "Número";
    const value =
      this.value !== undefined && this.value !== null ? this.value : "";

    return `
      <div class="flex flex-col gap-1 relative group" data-field-id="${
        this.def.id
      }">
        <label class="block text-xs font-bold text-slate-500 uppercase ml-1" for="${
          this.def.id
        }">
          ${label}
        </label>
        
        <div class="relative flex items-center">
          <div class="absolute left-3 text-slate-400 z-10 pointer-events-none">
            ${this.renderLeftSymbol()}
          </div>
          
          <input 
            type="text" 
            inputmode="decimal"
            id="${this.def.id}" 
            value="${value}"
            placeholder="${placeholder}"
            autocomplete="off"
            class="js-number-input w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-10 py-2 text-sm focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all font-mono text-right"
          >

          <button type="button" 
                  id="btn-list-${this.def.id}"
                  class="absolute right-2 text-slate-400 hover:text-brand-600 hover:bg-slate-100 p-1.5 rounded-md transition-colors z-20"
                  title="Insertar valor de otro campo">
            <i class="fas fa-list-ul text-xs"></i>
          </button>

          <ul id="list-menu-${this.def.id}" 
              class="hidden fixed bg-white border border-slate-200 shadow-2xl rounded-xl z-[9999] overflow-hidden max-h-[70vh] w-72 overflow-y-auto custom-scrollbar">
          </ul>
        </div>

        <div class="text-[10px] text-slate-400 px-1 hidden md:block text-right">
           <span class="opacity-70">Soporta fórmulas (+ - * /)</span>
        </div>
      </div>
    `;
  }

  postRenderEditor(container, onChange) {
    const input = container.querySelector(`#${this.def.id}`);
    const listBtn = container.querySelector(`#btn-list-${this.def.id}`);
    const listMenu = container.querySelector(`#list-menu-${this.def.id}`);

    if (!input) return;

    const evaluateExpression = (expr) => {
      if (/[^0-9+\-*/().\s,]/.test(expr)) return null;
      try {
        const sanitized = expr.replace(/,/g, ".");
        const result = new Function("return " + sanitized)();
        return isFinite(result) ? result : null;
      } catch (e) {
        return null;
      }
    };

    const processValue = () => {
      const rawValue = input.value.trim();
      if (rawValue === "") {
        this.value = null;
        if (onChange) onChange(this.def.id, null);
        return;
      }
      const result = evaluateExpression(rawValue);
      if (result !== null) {
        input.value = result;
        this.value = result;
        if (onChange) onChange(this.def.id, result);
        input.classList.add("text-emerald-600", "font-bold");
        setTimeout(
          () => input.classList.remove("text-emerald-600", "font-bold"),
          500
        );
      } else {
        const prevValue =
          this.value !== undefined && this.value !== null ? this.value : "";
        input.value = prevValue;
        input.classList.add("border-red-500", "bg-red-50");
        setTimeout(
          () => input.classList.remove("border-red-500", "bg-red-50"),
          500
        );
      }
    };

    input.addEventListener("focus", () => {
      input.classList.remove("text-right");
      input.classList.add("text-left");
    });

    input.addEventListener("blur", () => {
      input.classList.remove("text-left");
      input.classList.add("text-right");
      processValue();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        input.blur();
      }
    });

    const closeMenu = () => {
      listMenu.classList.add("hidden");
      document.removeEventListener("click", outsideClickListener);
      document.removeEventListener("keydown", escapeListener);
    };

    const escapeListener = (e) => {
      if (e.key === "Escape") closeMenu();
    };
    const outsideClickListener = (e) => {
      if (!listMenu.contains(e.target) && !listBtn.contains(e.target))
        closeMenu();
    };

    const openMenu = () => {
      const menuGroups = [];

      // --- 1. SECCIÓN: CAMPOS INDIVIDUALES ---
      const individualInputs = Array.from(
        document.querySelectorAll("input.js-number-input")
      )
        .filter((el) => {
          const isSelf = el.id === input.id;
          const inTable = el.closest(".table-element-container"); // No deben estar en tabla
          const hasValue = el.value && !isNaN(parseFloat(el.value));
          return !isSelf && !inTable && hasValue;
        })
        .map((el) => {
          const parent = el.closest("[data-field-id]");
          const labelEl = parent ? parent.querySelector("label") : null;
          return {
            label: labelEl ? labelEl.innerText.trim() : "Campo sin nombre",
            value: el.value,
          };
        });

      if (individualInputs.length > 0) {
        menuGroups.push({
          title: "Campos Individuales",
          items: individualInputs,
          type: "individual",
        });
      }

      // --- 2. SECCIÓN: TABLAS ---
      const tableContainers = document.querySelectorAll(
        ".table-element-container"
      );
      tableContainers.forEach((container) => {
        // Extraer nombre de la tabla
        const tableLabel =
          container.querySelector("span.text-\\[10px\\]")?.innerText.trim() ||
          "Tabla";

        // Buscar encabezados numéricos/moneda
        const headers = Array.from(
          container.querySelectorAll(
            'th[data-type="number"], th[data-type="currency"]'
          )
        );
        const tableSums = [];

        headers.forEach((th) => {
          const colIndex = th.cellIndex;
          const colLabel = th.innerText.trim();
          const cells = container.querySelectorAll(
            `tbody tr td:nth-child(${colIndex + 1})`
          );

          let total = 0;
          cells.forEach((td) => {
            const val = parseFloat(td.getAttribute("data-col-value") || 0);
            if (!isNaN(val)) total += val;
          });

          tableSums.push({
            label: `Suma: ${colLabel}`,
            value: total.toString(),
          });
        });

        if (tableSums.length > 0) {
          menuGroups.push({
            title: tableLabel,
            items: tableSums,
            type: "table",
          });
        }
      });

      // --- 3. RENDERIZADO DEL MENÚ ---
      if (menuGroups.length === 0) {
        listMenu.innerHTML = `<li class="px-4 py-3 text-xs text-slate-400 text-center italic">No hay valores disponibles.</li>`;
      } else {
        listMenu.innerHTML = menuGroups
          .map(
            (group) => `
          <div class="group-section">
            <div class="bg-slate-50 px-3 py-1.5 border-y border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <i class="${
                  group.type === "table" ? "fas fa-table" : "fas fa-id-card"
                } opacity-50"></i>
                ${group.title}
            </div>
            ${group.items
              .map(
                (item) => `
              <li class="border-b border-slate-50 last:border-0">
                <button type="button" data-val="${item.value}" 
                        class="w-full text-left px-4 py-2 hover:bg-indigo-50/50 flex justify-between items-center group/item transition-colors">
                  <span class="text-xs font-medium text-slate-600 group-hover/item:text-indigo-600 truncate mr-2 max-w-[160px]">
                    ${item.label}
                  </span>
                  <span class="text-[11px] font-mono font-bold text-slate-400 group-hover/item:text-indigo-600 bg-slate-100 group-hover/item:bg-indigo-100 px-1.5 py-0.5 rounded">
                    ${item.value}
                  </span>
                </button>
              </li>`
              )
              .join("")}
          </div>
        `
          )
          .join("");
      }

      listMenu.classList.remove("hidden");
      listMenu.style.bottom = "10px";
      listMenu.style.left = "10px";

      listMenu.querySelectorAll("button").forEach((btn) => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const valToAdd = btn.dataset.val;
          input.value = input.value ? `${input.value} + ${valToAdd}` : valToAdd;
          input.focus();
          closeMenu();
        };
      });

      document.addEventListener("click", outsideClickListener);
      document.addEventListener("keydown", escapeListener);
    };

    if (listBtn)
      listBtn.onclick = (e) => {
        e.stopPropagation();
        openMenu();
      };
  }

  renderViewer() {
    if (!this.value)
      return '<span class="text-slate-300 text-xs italic">--</span>';
    return `<span class="font-mono text-slate-700 font-medium">${this.value}</span>`;
  }

  renderPrint(mode) {
    const val = this.value || "—";
    if (mode === "compact")
      return `<div class="text-[9px]"><b class="uppercase">${this.def.label}:</b> ${val}</div>`;
    return `<div class="mb-2 page-break avoid-break-inside">
              <dt class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">${this.def.label}</dt>
              <dd class="text-sm text-slate-900 border-b border-slate-100 pb-1 font-mono text-right">${val}</dd>
            </div>`;
  }
}
