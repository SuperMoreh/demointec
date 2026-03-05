import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx-js-style';
import { Inventory } from '../models/inventory';

@Injectable({ providedIn: 'root' })
export class ReportInventoryService {

  exportToExcel(data: Inventory[]): void {
    const colCount = 10;
    const rows: any[][] = [];

    rows.push(['REPORTE DE INVENTARIO']);
    rows.push([`Fecha de emisión: ${new Date().toLocaleString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`]);
    rows.push([]);
    rows.push(['Artículo', 'Categoría', 'Cantidad', 'Unidad', 'Stock Mín.', 'Stock Máx.', 'Ubicación', 'Condición', 'Proveedor', 'Estado']);

    const headerRowIndex = rows.length - 1;

    for (const item of data) {
      rows.push([
        item.name_inventory,
        item.category,
        item.quantity,
        item.unit,
        item.minimum_stock,
        item.maximum_stock,
        item.location || '—',
        item.state || '—',
        item.supplier || '—',
        item.status ? 'Activo' : 'Inactivo'
      ]);
    }

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(rows);

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } }
    ];

    const titleStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 16, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '2A7AE4' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
    const subtitleStyle: XLSX.CellStyle = {
      font: { sz: 10, color: { rgb: '555555' } },
      fill: { fgColor: { rgb: 'E8F0FE' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };
    const headerStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: 'F58525' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: 'C06010' } },
        bottom: { style: 'thin', color: { rgb: 'C06010' } },
        left: { style: 'thin', color: { rgb: 'C06010' } },
        right: { style: 'thin', color: { rgb: 'C06010' } }
      }
    };
    const dataStyle: XLSX.CellStyle = {
      font: { sz: 9 },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: 'DDDDDD' } },
        bottom: { style: 'thin', color: { rgb: 'DDDDDD' } },
        left: { style: 'thin', color: { rgb: 'DDDDDD' } },
        right: { style: 'thin', color: { rgb: 'DDDDDD' } }
      }
    };
    const dataAltStyle: XLSX.CellStyle = {
      ...dataStyle,
      fill: { fgColor: { rgb: 'F5F8FF' } }
    };

    for (let R = 0; R < rows.length; R++) {
      for (let C = 0; C < colCount; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[addr]) ws[addr] = { v: '', t: 's' };
        if (R === 0) ws[addr].s = titleStyle;
        else if (R === 1) ws[addr].s = subtitleStyle;
        else if (R === headerRowIndex) ws[addr].s = headerStyle;
        else if (R > headerRowIndex) ws[addr].s = (R - headerRowIndex) % 2 === 0 ? dataAltStyle : dataStyle;
      }
    }

    ws['!cols'] = [
      { wch: 30 }, { wch: 15 }, { wch: 10 }, { wch: 10 },
      { wch: 10 }, { wch: 10 }, { wch: 20 }, { wch: 12 },
      { wch: 20 }, { wch: 10 }
    ];

    ws['!rows'] = [];
    ws['!rows'][0] = { hpx: 34 };
    ws['!rows'][1] = { hpx: 20 };
    ws['!rows'][headerRowIndex] = { hpx: 24 };
    ws['!views'] = [{ showGridLines: false }];

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
    XLSX.writeFile(wb, `Inventario_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }
}
