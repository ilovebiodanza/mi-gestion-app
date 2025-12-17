import { AbstractViewer } from "../AbstractViewer.js";

export class NumberViewer extends AbstractViewer {
  render(isTableContext = false) {
    if (this.isEmpty()) return this.renderEmpty();
    return `<span class="font-mono text-slate-700" data-raw-value="${this.value}">${this.value}</span>`;
  }
}
