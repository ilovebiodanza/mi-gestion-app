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

  // Símbolo por defecto (sobrescribible por Currency/Percentage)
  renderLeftSymbol() {
    return `<i class="fas fa-hashtag"></i>`;
  }

  renderEditor() {
    const requiredBadge = this.def.required
      ? '<span class="text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded border border-red-100 font-bold">REQ</span>'
      : "";
    const inputClasses =
      "js-number-input block w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm placeholder-slate-400 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-mono text-right font-bold";

    return `
      <div class="field-wrapper flex flex-col mb-4 md:col-span-1 print:col-span-1" data-field-id="${
        this.def.id
      }">
        <label class="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 ml-1 flex items-center justify-between">
           <span>${this.def.label}</span>${requiredBadge}
        </label>
        <div class="relative group/num">
           <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within/num:text-primary transition-colors font-bold text-xs select-none">
              ${this.renderLeftSymbol()}
           </div>
           <input type="text" id="${this.def.id}" name="${this.def.id}" 
                  value="${
                    this.value !== null && this.value !== undefined
                      ? this.value
                      : ""
                  }" 
                  class="${inputClasses}" placeholder="${
      this.def.placeholder || "0"
    }" autocomplete="off">
           <button type="button" class="suggestion-trigger absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-colors z-10 cursor-pointer" title="Sugerencias y Cálculos" tabindex="-1">
              <i class="fas fa-list-ul text-xs"></i>
           </button>
        </div>
      </div>`;
  }

  postRenderEditor(container, onChange) {
    const input = container.querySelector(`#${this.def.id}`);
    const triggerBtn = container.querySelector(".suggestion-trigger");
    this.activeMenu = null;
    this.handleGlobalMove = () => this.removeMenu();

    if (!input) return;

    // 1. Evaluación Matemática (Lógica de NumberField.js)
    const evaluateMath = () => {
      const val = input.value.trim();
      if (/^[\d\s\.\+\-\*\/\(\)]+$/.test(val) && /[\+\-\*\/]/.test(val)) {
        try {
          const result = new Function('"use strict";return (' + val + ")")();
          if (!isNaN(result) && isFinite(result)) {
            const finalVal = Math.round(result * 100) / 100;
            input.value = finalVal;
            onChange(this.def.id, finalVal);
            input.classList.add("text-emerald-600", "bg-emerald-50");
            setTimeout(
              () => input.classList.remove("text-emerald-600", "bg-emerald-50"),
              800
            );
          }
        } catch (e) {
          console.warn("Error matemático:", e);
        }
      }
    };

    input.addEventListener("input", (e) =>
      onChange(this.def.id, e.target.value)
    );
    input.addEventListener("blur", () => {
      evaluateMath();
      setTimeout(() => this.removeMenu(), 200);
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        evaluateMath();
        this.removeMenu();
      }
      if (e.key === "Escape") this.removeMenu();
    });

    // 2. Control del Menú de Sugerencias
    triggerBtn?.addEventListener("mousedown", (e) => {
      e.preventDefault();
      if (document.activeElement !== input) input.focus();
      this.activeMenu ? this.removeMenu() : this.showSuggestions(input);
    });

    // Blindaje: cerrar menú si el usuario mueve la pantalla (evita que quede "distante")
    window.addEventListener("scroll", this.handleGlobalMove, true);
    window.addEventListener("resize", this.handleGlobalMove);
  }

  showSuggestions(input) {
    const suggestions = [];
    // Recolectar de otros campos
    document.querySelectorAll(".js-number-input").forEach((field) => {
      if (field === input || !field.value.trim() || field.closest("table"))
        return;
      let label = "Dato";
      const wrapper = field.closest(".field-wrapper");
      if (wrapper)
        label = wrapper.querySelector("label span")?.innerText || "Dato";
      suggestions.push({
        label: label.replace(/[:*]/g, "").trim(),
        value: field.value.trim(),
        type: "field",
      });
    });

    // Recolectar sumatorias de tablas (Portado de NumberField.js)
    document.querySelectorAll("table").forEach((table) => {
      const headers = Array.from(table.querySelectorAll("thead th"));
      const rows = Array.from(table.querySelectorAll("tbody tr"));
      headers.forEach((th, idx) => {
        let sum = 0,
          count = 0;
        rows.forEach((row) => {
          const raw = row
            .querySelectorAll("td")
            [idx]?.querySelector("[data-raw-value]")
            ?.getAttribute("data-raw-value");
          const val = parseFloat(raw);
          if (!isNaN(val)) {
            sum += val;
            count++;
          }
        });
        if (count > 0 && th.innerText.trim() && th.innerText.trim() !== "#") {
          suggestions.push({
            label: `Suma ${th.innerText.trim()}`,
            value: Math.round(sum * 100) / 100,
            type: "sum",
          });
        }
      });
    });

    if (suggestions.length === 0) return;

    const menu = document.createElement("div");
    menu.className =
      "fixed z-[10000] bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[300px] animate-fade-in";
    menu.innerHTML = `
      <div class="bg-slate-50 px-3 py-2 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase flex justify-between">
        <span><i class="fas fa-magic text-indigo-400 mr-1"></i> Sugerencias</span>
        <span class="text-[9px] text-slate-300">ESC</span>
      </div>
      <div class="overflow-y-auto custom-scrollbar">
        <ul class="py-1">
          ${suggestions
            .map(
              (s) => `
            <li class="js-sugg-item px-3 py-2 hover:bg-indigo-50 cursor-pointer border-b border-slate-50 last:border-0 flex justify-between items-center group transition-colors" data-value="${
              s.value
            }">
              <span class="text-[11px] text-slate-600 truncate pr-4">${
                s.type === "sum" ? "<b>∑</b> " : ""
              }${s.label}</span>
              <span class="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded group-hover:bg-white border border-transparent group-hover:border-indigo-100">${
                s.value
              }</span>
            </li>
          `
            )
            .join("")}
        </ul>
      </div>`;

    document.body.appendChild(menu);
    this.activeMenu = menu;

    // Aplicar posicionamiento exacto del original
    const rect = input.getBoundingClientRect();
    menu.style.width = `${Math.max(rect.width, 240)}px`;
    menu.style.left = `${rect.left}px`;
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < 300) {
      menu.style.bottom = `${window.innerHeight - rect.top + 4}px`;
      menu.style.top = "auto";
    } else {
      menu.style.top = `${rect.bottom + 4}px`;
      menu.style.bottom = "auto";
    }

    menu.querySelectorAll(".js-sugg-item").forEach((item) => {
      item.addEventListener("mousedown", (e) => {
        e.preventDefault();
        input.value = item.dataset.value;
        input.dispatchEvent(new Event("input"));
        this.removeMenu();
      });
    });
  }

  removeMenu() {
    if (this.activeMenu) {
      this.activeMenu.remove();
      this.activeMenu = null;
    }
    window.removeEventListener("scroll", this.handleGlobalMove, true);
    window.removeEventListener("resize", this.handleGlobalMove);
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
