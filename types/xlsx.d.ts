declare module "xlsx" {
  const utils: {
    encode_cell(cell: { r: number; c: number }): string;
    book_new(): WorkBook;
    book_append_sheet(wb: WorkBook, ws: WorkSheet, name?: string): void;
    aoa_to_sheet(data: unknown[][]): WorkSheet;
  };

  interface WorkSheet {
    [key: string]: unknown;
    "!ref"?: string;
    "!cols"?: ColInfo[];
  }

  interface WorkBook {
    SheetNames: string[];
    Sheets: { [sheet: string]: WorkSheet };
  }

  interface CellObject {
    v?: string | number | boolean | Date;
    t?: string;
    f?: string;
    r?: string;
    h?: string;
    w?: string;
    z?: string;
  }

  interface WorkSheetRange {
    s: { r: number; c: number };
    e: { r: number; c: number };
  }

  interface ColInfo {
    wch?: number;
    wpx?: number;
    hidden?: boolean;
  }

  interface ParsingOptions {
    type?: "base64" | "binary" | "buffer" | "file" | "array" | "string";
    cellDates?: boolean;
    cellNF?: boolean;
    cellText?: boolean;
    sheetStubs?: boolean;
  }

  function read(data: unknown, opts?: ParsingOptions): WorkBook;
  function readFile(filename: string, opts?: ParsingOptions): WorkBook;
  function writeFile(wb: WorkBook, filename: string): void;

  export { utils, read, readFile, writeFile };
  export type { WorkBook, WorkSheet, CellObject, ColInfo, ParsingOptions };
}
