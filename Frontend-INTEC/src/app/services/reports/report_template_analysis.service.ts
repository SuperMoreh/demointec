import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx-js-style';
import { TemplateAnalysis } from '../../models/template-analysis';

@Injectable({
  providedIn: 'root'
})
export class ReportTemplateAnalysisService {

  exportToExcel(data: TemplateAnalysis): void {
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    this.buildSheet1(wb, data);
    this.buildSheet2(wb, data);

    const today = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `Analisis_Plantillas_${today}.xlsx`);
  }

  // ─── HOJA 1: Análisis de Plantillas ─────────────────────────────────────────

  private buildSheet1(wb: XLSX.WorkBook, data: TemplateAnalysis): void {
    const colCount = 6;
    const rows: any[][] = [];

    // Título
    rows.push(['FORMATO ANÁLISIS DE PLANTILLAS']);

    // Fecha de emisión
    const emissionDate = new Date().toLocaleString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    rows.push([`Fecha de emisión: ${emissionDate}`]);

    // Fila vacía
    rows.push([]);

    // Sub-header "R.H." centrado sobre las 3 primeras columnas
    rows.push(['R.H.', '', '', '', '', '']);
    const rhRowIndex = rows.length - 1;

    // Headers principales
    rows.push(['OFICIALES', 'MO', 'AYUDANTES', 'PROYECTOS', 'AVANCE %', 'REQUERIMIENTO']);
    const headerRowIndex = rows.length - 1;

    // Datos de proyectos
    const projects = data.projects ?? [];
    const dataStartIndex = rows.length;

    for (let i = 0; i < projects.length; i++) {
      const row = projects[i];
      rows.push([
        row.oficiales > 0 ? row.oficiales : '',
        row.mo > 0 ? row.mo : '',
        row.ayudantes > 0 ? row.ayudantes : '',
        row.project,
        row.avance_percent ?? '',
        i === 0 ? (data.totals?.requirement ?? '') : ''
      ]);
    }

    if (projects.length === 0) {
      rows.push(['', '', '', 'Sin registros', '', '']);
    }

    // Fila de totales
    const totals = data.totals;
    rows.push([
      totals?.oficiales ?? 0,
      totals?.mo ?? 0,
      totals?.ayudantes ?? 0,
      'OBRAS ACTIVAS',
      '',
      (totals?.oficiales ?? 0) + (totals?.mo ?? 0) + (totals?.ayudantes ?? 0)
    ]);
    const totalsRowIndex = rows.length - 1;

    // Fila footer con etiquetas (igual al diseño)
    rows.push(['OFICIALES', 'MO', 'AYUDANTES', 'PROYECTOS', 'AVANCE %', 'REQUERIMIENTO']);
    const footerRowIndex = rows.length - 1;

    // Crear worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(rows);

    // Merges
    ws['!merges'] = [
      // Título
      { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } },
      // Fecha emisión
      { s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } },
      // R.H. sobre las 3 primeras columnas
      { s: { r: rhRowIndex, c: 0 }, e: { r: rhRowIndex, c: 2 } },
      // Columna REQUERIMIENTO merge para toda la zona de datos (rowspan)
      ...(projects.length > 1
        ? [{ s: { r: dataStartIndex, c: 5 }, e: { r: dataStartIndex + projects.length - 1, c: 5 } }]
        : []),
    ];

    // ── Estilos ──────────────────────────────────────────────────────────────

    const titleStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 15, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '2C3E6B' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const emissionStyle: XLSX.CellStyle = {
      font: { sz: 9, color: { rgb: '666666' } },
      fill: { fgColor: { rgb: 'F5F5F5' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const rhStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 10, color: { rgb: '555555' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: { bottom: { style: 'medium', color: { rgb: 'AAAAAA' } } }
    };

    const rhEmptyStyle: XLSX.CellStyle = {
      alignment: { horizontal: 'center' }
    };

    const headerStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '2C3E6B' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '1A2B4A' } },
        bottom: { style: 'thin', color: { rgb: '1A2B4A' } },
        left: { style: 'thin', color: { rgb: '1A2B4A' } },
        right: { style: 'thin', color: { rgb: '1A2B4A' } }
      }
    };

    const dataNumStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 9, color: { rgb: '333333' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
        right: { style: 'thin', color: { rgb: 'E0E0E0' } }
      }
    };

    const dataProjectStyle: XLSX.CellStyle = {
      font: { sz: 9, color: { rgb: '222222' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: {
        bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
        right: { style: 'thin', color: { rgb: 'E0E0E0' } }
      }
    };

    const dataOddStyle: XLSX.CellStyle = {
      font: { sz: 9, color: { rgb: '222222' } },
      fill: { fgColor: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
        right: { style: 'thin', color: { rgb: 'E0E0E0' } }
      }
    };

    const dataEvenStyle: XLSX.CellStyle = {
      font: { sz: 9, color: { rgb: '222222' } },
      fill: { fgColor: { rgb: 'F5F7FA' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
        right: { style: 'thin', color: { rgb: 'E0E0E0' } }
      }
    };

    const reqStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 13, color: { rgb: '1A1A2E' } },
      fill: { fgColor: { rgb: 'F0F4FF' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '2C3E6B' } },
        bottom: { style: 'thin', color: { rgb: '2C3E6B' } },
        left: { style: 'thin', color: { rgb: '2C3E6B' } },
        right: { style: 'thin', color: { rgb: '2C3E6B' } }
      }
    };

    const totalsNumStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 10, color: { rgb: '1A1A2E' } },
      fill: { fgColor: { rgb: 'DDE3EC' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'medium', color: { rgb: '2C3E6B' } },
        bottom: { style: 'thin', color: { rgb: 'AAAAAA' } },
        right: { style: 'thin', color: { rgb: 'AAAAAA' } }
      }
    };

    const totalsLabelStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 9, italic: true, color: { rgb: '1A1A2E' } },
      fill: { fgColor: { rgb: 'DDE3EC' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'medium', color: { rgb: '2C3E6B' } },
        bottom: { style: 'thin', color: { rgb: 'AAAAAA' } },
        right: { style: 'thin', color: { rgb: 'AAAAAA' } }
      }
    };

    const footerStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 9, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '2C3E6B' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '1A2B4A' } },
        bottom: { style: 'thin', color: { rgb: '1A2B4A' } },
        left: { style: 'thin', color: { rgb: '1A2B4A' } },
        right: { style: 'thin', color: { rgb: '1A2B4A' } }
      }
    };

    // Aplicar estilos celda por celda
    for (let R = 0; R < rows.length; R++) {
      for (let C = 0; C < colCount; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[addr]) ws[addr] = { v: '', t: 's' };

        if (R === 0) {
          ws[addr].s = titleStyle;
        } else if (R === 1) {
          ws[addr].s = emissionStyle;
        } else if (R === rhRowIndex) {
          ws[addr].s = C <= 2 ? rhStyle : rhEmptyStyle;
        } else if (R === headerRowIndex) {
          ws[addr].s = headerStyle;
        } else if (R >= dataStartIndex && R < totalsRowIndex) {
          const dataRowIndex = R - dataStartIndex;
          if (C === 3) {
            ws[addr].s = dataProjectStyle;
          } else if (C === 5) {
            ws[addr].s = reqStyle;
          } else {
            ws[addr].s = dataRowIndex % 2 === 0 ? dataOddStyle : dataEvenStyle;
            if (C === 0 || C === 1 || C === 2) ws[addr].s = { ...ws[addr].s, font: { ...((ws[addr].s as any).font ?? {}), bold: true, sz: 9 } };
          }
        } else if (R === totalsRowIndex) {
          ws[addr].s = C === 3 ? totalsLabelStyle : totalsNumStyle;
        } else if (R === footerRowIndex) {
          ws[addr].s = footerStyle;
        }
      }
    }

    // Anchos de columna
    ws['!cols'] = [
      { wch: 12 },  // Oficiales
      { wch: 10 },  // MO
      { wch: 12 },  // Ayudantes
      { wch: 30 },  // Proyectos
      { wch: 12 },  // Avance %
      { wch: 16 },  // Requerimiento
    ];

    // Altos de fila
    ws['!rows'] = [];
    ws['!rows'][0] = { hpx: 32 };
    ws['!rows'][1] = { hpx: 18 };
    ws['!rows'][rhRowIndex] = { hpx: 20 };
    ws['!rows'][headerRowIndex] = { hpx: 26 };
    ws['!rows'][totalsRowIndex] = { hpx: 24 };
    ws['!rows'][footerRowIndex] = { hpx: 22 };

    ws['!views'] = [{ showGridLines: false }];

    XLSX.utils.book_append_sheet(wb, ws, 'Análisis de Plantillas');
  }

  // ─── HOJA 2: Requerimiento de Personal ──────────────────────────────────────

  private buildSheet2(wb: XLSX.WorkBook, data: TemplateAnalysis): void {
    const totals = data.totals;
    const colCount = 3;
    const rows: any[][] = [];

    // Título
    rows.push(['REQUERIMIENTO DE PERSONAL']);
    // Subtítulo
    rows.push(['Ingrese en la columna "Necesario" la cantidad requerida por puesto']);
    rows.push([]);

    // Headers
    rows.push(['NECESARIO', 'PUESTO', 'FALTANTE']);
    const headerRowIndex = rows.length - 1;

    // Datos — columna NECESARIO vacía para que el usuario ingrese
    rows.push(['', 'Oficiales', '']);
    rows.push(['', 'MO', '']);
    rows.push(['', 'Ayudantes', '']);

    const dataStartIndex = headerRowIndex + 1;

    // Fila de totales actuales como referencia
    rows.push([]);
    rows.push(['TOTALES ACTUALES', '', '']);
    const refHeaderIdx = rows.length - 1;
    rows.push([totals?.oficiales ?? 0, 'Oficiales', '']);
    rows.push([totals?.mo ?? 0, 'MO', '']);
    rows.push([totals?.ayudantes ?? 0, 'Ayudantes', '']);

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(rows);

    // Merges
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: colCount - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: colCount - 1 } },
      { s: { r: refHeaderIdx, c: 0 }, e: { r: refHeaderIdx, c: colCount - 1 } },
    ];

    // Fórmulas en columna FALTANTE (C): = A - total actual
    // Fila oficiales → dataStartIndex (0-indexed en xlsx = dataStartIndex)
    const officialsTotal = totals?.oficiales ?? 0;
    const moTotal = totals?.mo ?? 0;
    const ayudantesTotal = totals?.ayudantes ?? 0;

    // Oficiales row
    const ofRow = dataStartIndex;
    const moRow = dataStartIndex + 1;
    const ayRow = dataStartIndex + 2;

    // Col A = 0, Col C = 2
    const setFormula = (r: number, total: number) => {
      const addrA = XLSX.utils.encode_cell({ r, c: 0 });
      const addrC = XLSX.utils.encode_cell({ r, c: 2 });
      const colARef = XLSX.utils.encode_cell({ r, c: 0 });
      // Si la celda A tiene valor, la fórmula es A - total; si está vacía muestra vacío
      ws[addrC] = {
        t: 'n',
        f: `IF(${colARef}="","",(${colARef})-${total})`,
        v: ''
      };
    };

    setFormula(ofRow, officialsTotal);
    setFormula(moRow, moTotal);
    setFormula(ayRow, ayudantesTotal);

    // Estilos
    const titleStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 14, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '2C3E6B' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const subtitleStyle: XLSX.CellStyle = {
      font: { sz: 9, italic: true, color: { rgb: '666666' } },
      fill: { fgColor: { rgb: 'F5F5F5' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const headerStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 10, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: '2A7AE4' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: '1A5CC4' } },
        bottom: { style: 'thin', color: { rgb: '1A5CC4' } },
        left: { style: 'thin', color: { rgb: '1A5CC4' } },
        right: { style: 'thin', color: { rgb: '1A5CC4' } }
      }
    };

    const inputStyle: XLSX.CellStyle = {
      font: { sz: 10, color: { rgb: '333333' } },
      fill: { fgColor: { rgb: 'FFF9E6' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        top: { style: 'thin', color: { rgb: 'CCCCCC' } },
        bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
        left: { style: 'medium', color: { rgb: 'F5A623' } },
        right: { style: 'thin', color: { rgb: 'CCCCCC' } }
      }
    };

    const puestoStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 10, color: { rgb: '222222' } },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: {
        bottom: { style: 'thin', color: { rgb: 'DDDDDD' } },
        right: { style: 'thin', color: { rgb: 'DDDDDD' } }
      }
    };

    const formulaStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 10, color: { rgb: '1A5CC4' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: {
        bottom: { style: 'thin', color: { rgb: 'DDDDDD' } },
        right: { style: 'thin', color: { rgb: 'DDDDDD' } }
      }
    };

    const refTitleStyle: XLSX.CellStyle = {
      font: { bold: true, sz: 10, color: { rgb: '555555' } },
      fill: { fgColor: { rgb: 'E8F0FE' } },
      alignment: { horizontal: 'center', vertical: 'center' }
    };

    const refDataStyle: XLSX.CellStyle = {
      font: { sz: 9, color: { rgb: '555555' } },
      fill: { fgColor: { rgb: 'F5F7FA' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: { bottom: { style: 'thin', color: { rgb: 'EEEEEE' } } }
    };

    for (let R = 0; R < rows.length; R++) {
      for (let C = 0; C < colCount; C++) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[addr]) ws[addr] = { v: '', t: 's' };

        if (R === 0) {
          ws[addr].s = titleStyle;
        } else if (R === 1) {
          ws[addr].s = subtitleStyle;
        } else if (R === headerRowIndex) {
          ws[addr].s = headerStyle;
        } else if (R >= dataStartIndex && R < dataStartIndex + 3) {
          if (C === 0) ws[addr].s = inputStyle;
          else if (C === 1) ws[addr].s = puestoStyle;
          else ws[addr].s = formulaStyle;
        } else if (R === refHeaderIdx) {
          ws[addr].s = refTitleStyle;
        } else if (R > refHeaderIdx) {
          ws[addr].s = refDataStyle;
        }
      }
    }

    ws['!cols'] = [
      { wch: 14 },  // Necesario
      { wch: 16 },  // Puesto
      { wch: 14 },  // Faltante
    ];

    ws['!rows'] = [];
    ws['!rows'][0] = { hpx: 30 };
    ws['!rows'][1] = { hpx: 18 };
    ws['!rows'][headerRowIndex] = { hpx: 24 };
    for (let i = dataStartIndex; i < dataStartIndex + 3; i++) {
      ws['!rows'][i] = { hpx: 22 };
    }

    ws['!views'] = [{ showGridLines: false }];

    XLSX.utils.book_append_sheet(wb, ws, 'Requerimiento');
  }
}
