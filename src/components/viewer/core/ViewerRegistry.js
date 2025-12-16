import { TextViewer } from "./fields/TextViewer.js";
import { DateViewer } from "./fields/DateViewer.js";
import { BooleanViewer } from "./fields/BooleanViewer.js";
import { UrlViewer } from "./fields/UrlViewer.js";
import { SecretViewer } from "./fields/SecretViewer.js";
import { TableViewer } from "./fields/TableViewer.js";
// Importa aquí otros tipos según los crees (Number, Currency, etc)

const registry = {
  text: TextViewer,
  date: DateViewer,
  boolean: BooleanViewer,
  url: UrlViewer,
  secret: SecretViewer,
  table: TableViewer,
  currency: TextViewer, // Placeholder hasta crear CurrencyViewer
  percentage: TextViewer, // Placeholder hasta crear PercentageViewer
};

export class ViewerRegistry {
  static getViewerClass(type) {
    return registry[type] || TextViewer;
  }
}
