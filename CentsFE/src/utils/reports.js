import ExcelJS from "exceljs/dist/es5/exceljs.browser.js";
import * as FileSaver from "file-saver";

export const generateConnectionLogsReport = async (reportData, reportName) => {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet();
  ws.properties.defaultColWidth = 17;
  ws.getColumn(6).numFmt = "$#,##0.00;[Red]-$#,##0.00";

  reportData.data.forEach((a, i) => {
    const row = ws.addRow(a);
    if (i === 0) {
      row.font = {bold: true};
    }
  });
  const buf = await wb.xlsx.writeBuffer();
  FileSaver.saveAs(new Blob([buf]), `${reportName}.xlsx`);
};
