import { AbstractViewer } from "../AbstractViewer.js";

export class TextViewer extends AbstractViewer {
  render(isTableContext = false) {
    if (this.isEmpty()) return this.renderEmpty();

    if (isTableContext) {
      return `<span class="block truncate" title="${this.value}">${this.value}</span>`;
    }

    return `<div class="prose prose-sm max-w-none text-slate-600 whitespace-pre-line">${this.value}</div>`;
  }
}
