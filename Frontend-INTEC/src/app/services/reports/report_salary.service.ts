import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx-js-style';
import { SalaryReport } from '../../models/salary-report';

@Injectable({
  providedIn: 'root'
})
export class ReportSalaryService {

  exportToExcel(data: SalaryReport[], incrementPercent: number | null): void {
    const colCount = 6;
    const rows: any[][] = [];

    // Título
    rows.push(['FORMATO TABULADOR DE SUELDOS']);

    // Fecha de emisión
    const emissionDate = new Date().toLocaleString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    rows.push([`Fecha de emisión: ${emissionDate}`]);

    // Fila vacía
    rows.push([]);

    // Headers
    rows.push(['ID', 'NOMBRE', 'FECHA DE INGRESO', 'PUESTO', 'SUELDO SEMANAL ACTUAL', 'INCREMENTO SUGERIDO A MERCADO PROMEDIO']);

    const headerRowIndex = rows.length - 1;

    // Datos
    for (const record of data) {
      const salary = +record.base_salary;
      const increment = (incrementPercent && incrementPercent > 0 && !isNaN(salary) && salary > 0)
        ? salary * (incrementPercent / 100)
        : null;

      rows.push([
        record.id_employee,
        record.name_employee,
        record.admission_date || '-',
        record.position || '-',
        (!isNaN(salary) && salary > 0) ? salary : '-',
        increment !== null ? increment : '-'
      ]);
    }

    // Fila vacía antes de totales
    rows.push([]);

    // Totales
    const validSalaries = data.filter(r => !isNaN(+r.base_salary) && +r.base_salary > 0);
    const totalSalary = validSalaries.reduce((sum, r) => sum + +r.base_salary, 0);
    const totalIncrement = (incrementPercent && incrementPercent > 0)
      ? validSalaries.reduce((sum, r) => sum + (+r.base_salary * (incrementPercent! / 100)), 0)
      : null;

    rows.push(['', '', '', `Total colaboradores: ${data.length}`, totalSalary, totalIncrement !== null ? totalIncrement : '-']);

    const totalRowIndex = rows.length - 1;

    // Crear worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(rows);

    // Merges
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: colCount - 1 } },
    ];

    // Estilos
    const titleStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 16, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '2C3E6B' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const emissionStyle: XLSX.CellStyle = {
      font: { sz: 9, color: { rgb: '666666' } },
      fill: { fgColor: { rgb: 'F5F5F5' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const headerStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '2A7AE4' } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      border: {
        top: { style: 'thin', color: { rgb: '1A5CC4' } },
        bottom: { style: 'thin', color: { rgb: '1A5CC4' } },
        left: { style: 'thin', color: { rgb: '1A5CC4' } },
        right: { style: 'thin', color: { rgb: '1A5CC4' } }
      }
    };

    const dataIdStyle: XLSX.CellStyle = {
      font: { sz: 9, color: { rgb: '333333' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: { bottom: { style: 'thin', color: { rgb: 'EEEEEE' } } }
    };

    const dataNameStyle: XLSX.CellStyle = {
      font: { sz: 9, color: { rgb: '333333' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: { bottom: { style: 'thin', color: { rgb: 'EEEEEE' } } }
    };

    const dataCenterStyle: XLSX.CellStyle = {
      font: { sz: 9, color: { rgb: '333333' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: { bottom: { style: 'thin', color: { rgb: 'EEEEEE' } } }
    };

    const dataCurrencyStyle: XLSX.CellStyle = {
      font: { sz: 9, color: { rgb: '333333' } },
      alignment: { horizontal: 'right', vertical: 'center' },
      numFmt: '"$"#,##0.00',
      border: { bottom: { style: 'thin', color: { rgb: 'EEEEEE' } } }
    };

    const dataIncrementStyle: XLSX.CellStyle = {
      font: { sz: 9, color: { rgb: '1A5CC4' } },
      alignment: { horizontal: 'right', vertical: 'center' },
      numFmt: '"$"#,##0.00',
      border: { bottom: { style: 'thin', color: { rgb: 'EEEEEE' } } }
    };

    const totalLabelStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 10, color: { rgb: '2C3E6B' } },
      fill: { fgColor: { rgb: 'E8F0FE' } },
      alignment: { horizontal: 'right', vertical: 'center' },
      border: { top: { style: 'thin', color: { rgb: 'CCCCCC' } } }
    };

    const totalCurrencyStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 10, color: { rgb: '2C3E6B' } },
      fill: { fgColor: { rgb: 'E8F0FE' } },
      alignment: { horizontal: 'right', vertical: 'center' },
      numFmt: '"$"#,##0.00',
      border: { top: { style: 'thin', color: { rgb: 'CCCCCC' } } }
    };

    // Aplicar estilos fila por fila
    for (let R = 0; R < rows.length; R++) {
      for (let C = 0; C < colCount; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[addr]) ws[addr] = { v: '', t: 's' };

        if (R === 0) {
          ws[addr].s = titleStyle;
        } else if (R === 1) {
          ws[addr].s = emissionStyle;
        } else if (R === headerRowIndex) {
          ws[addr].s = headerStyle;
        } else if (R === totalRowIndex) {
          if (C === 3) {
            ws[addr].s = totalLabelStyle;
          } else if (C === 4 || C === 5) {
            const val = ws[addr].v;
            if (typeof val === 'number') {
              ws[addr].s = totalCurrencyStyle;
            } else {
              ws[addr].s = totalLabelStyle;
            }
          } else {
            ws[addr].s = { fill: { fgColor: { rgb: 'E8F0FE' } } };
          }
        } else if (R > headerRowIndex && R < totalRowIndex - 1) {
          if (C === 0) {
            ws[addr].s = dataIdStyle;
          } else if (C === 1) {
            ws[addr].s = dataNameStyle;
          } else if (C === 2 || C === 3) {
            ws[addr].s = dataCenterStyle;
          } else if (C === 4) {
            const val = ws[addr].v;
            if (typeof val === 'number') ws[addr].s = dataCurrencyStyle;
            else ws[addr].s = dataCenterStyle;
          } else if (C === 5) {
            const val = ws[addr].v;
            if (typeof val === 'number') ws[addr].s = dataIncrementStyle;
            else ws[addr].s = dataCenterStyle;
          }
        }
      }
    }

    // Anchos de columna
    ws['!cols'] = [
      { wch: 8 },   // ID
      { wch: 40 },  // Nombre
      { wch: 18 },  // Fecha de Ingreso
      { wch: 28 },  // Puesto
      { wch: 22 },  // Sueldo Semanal Actual
      { wch: 28 },  // Incremento Sugerido
    ];

    // Alto de filas
    ws['!rows'] = [];
    ws['!rows'][0] = { hpx: 34 };
    ws['!rows'][1] = { hpx: 18 };
    ws['!rows'][headerRowIndex] = { hpx: 36 };

    // Ocultar gridlines
    ws['!views'] = [{ showGridLines: false }];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tabulador de Sueldos');

    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Tabulador_Sueldos_${today}.xlsx`);
  }
}
