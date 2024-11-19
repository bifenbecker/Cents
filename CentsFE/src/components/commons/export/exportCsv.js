import React from 'react'; 
import * as FileSaver from 'file-saver';
import * as xlsx from 'xlsx';

const ExportCsv = (props) => {
  const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  const fileExtension = '.xlsx';

  const exportToCsv = () => {
    const ws = xlsx.utils.json_to_sheet(props.csvData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, 'Cents_Orders');
    const excelBuffer = xlsx.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    FileSaver.saveAs(data, props.fileName + fileExtension);
  }

  return <button onClick={exportToCsv} className="btn-theme btn-corner-rounded">Export to Excel</button>
}

export default ExportCsv;
