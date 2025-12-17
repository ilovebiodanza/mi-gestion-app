import { TextViewer } from "./fields/TextViewer.js";
import { DateViewer } from "./fields/DateViewer.js";
import { BooleanViewer } from "./fields/BooleanViewer.js";
import { UrlViewer } from "./fields/UrlViewer.js";
import { SecretViewer } from "./fields/SecretViewer.js";
import { TableViewer } from "./fields/TableViewer.js";
import { NumberViewer } from "./fields/NumberViewer.js";
import { CurrencyViewer } from "./fields/CurrencyViewer.js";
import { PercentageViewer } from "./fields/PercentageViewer.js";

const registry = {
  text: TextViewer,
  date: DateViewer,
  boolean: BooleanViewer,
  url: UrlViewer,
  secret: SecretViewer,
  table: TableViewer,
  number: NumberViewer,
  currency: CurrencyViewer,
  percentage: PercentageViewer,
};

export class ViewerRegistry {
  static getViewerClass(type) {
    return registry[type] || TextViewer;
  }
}
