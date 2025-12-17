import { AbstractViewer } from "../AbstractViewer.js";

export class PercentageViewer extends AbstractViewer {
  render(isTableContext = false) {
    if (this.isEmpty()) return this.renderEmpty();
    const html = `<span class="font-mono font-bold text-slate-700" data-raw-value="${this.value}">${this.value}%</span>`;
    return isTableContext ? `<div class="text-right">${html}</div>` : html;
  }
}
