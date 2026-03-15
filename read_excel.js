const xlsx = require('xlsx');
const workbook = xlsx.readFile('locales-listo.xlsx');
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet, {header: 1});
console.log('COLUMNAS:', data[0]);
console.log('FILA EJEMPLO 1:', data[1]);
console.log('FILA EJEMPLO 2:', data[2]);
console.log('TOTAL ROWS:', data.length);
