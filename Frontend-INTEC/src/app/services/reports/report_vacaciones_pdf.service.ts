import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface EmpleadoVacacionesPdf {
  nombre: string;
  fechaIngreso: string;
  antiguedad: number;
  totalVacaciones: number;
  diasTomados: number;
  diasPorTomarPrevious: number;
  diasPorTomarCurrent: number;
  saldoTotal: number;
}

export interface SolicitudVacacionesPdf {
  startDate: string;
  endDate: string;
  daysCount: number;
  requestDate: string;
  vacationYear?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class ReportVacacionesPdfService {

  async generate(empleado: EmpleadoVacacionesPdf, solicitud: SolicitudVacacionesPdf): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logoBase64 = await this.loadLogoBase64();

    this.drawCopia(doc, 5, empleado, solicitud, logoBase64);

    // Línea punteada separadora — azul, igual que en la imagen
    doc.setLineDashPattern([2, 2], 0);
    doc.setDrawColor(42, 122, 228);
    doc.setLineWidth(0.6);
    doc.line(10, 149, 200, 149);
    doc.setLineDashPattern([], 0);

    this.drawCopia(doc, 152, empleado, solicitud, logoBase64);

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`SolicitudVacaciones_${today}.pdf`);
  }

  private async loadLogoBase64(): Promise<string | null> {
    try {
      const response = await fetch('/assets/logo_gris.png');
      const blob = await response.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  private drawCopia(
    doc: jsPDF,
    sy: number,
    empleado: EmpleadoVacacionesPdf,
    solicitud: SolicitudVacacionesPdf,
    logoBase64: string | null
  ): void {
    const lm = 12;
    const pw = 186;

    // ---- Logo ----
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', lm, sy + 1, 30, 20);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(42, 122, 228);
      doc.text('INTEC', lm + 5, sy + 14);
    }

    // ---- Encabezado empresa ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(42, 122, 228);
    doc.text('INTEC DE JALISCO, S.A. DE C.V.', lm + 34, sy + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(60, 60, 60);
    doc.text('MISIONEROS  #2138    C.P. 44210', lm + 34, sy + 10.5);
    doc.text('COL. JARDINES DEL COUNTRY', lm + 34, sy + 14.5);
    doc.text('GUADALAJARA, JALISCO', lm + 34, sy + 18.5);

    // ---- Título ----
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(42, 122, 228);
    doc.text('SOLICITUD DE VACACIONES', 105, sy + 28, { align: 'center' });

    // ---- Tabla DATOS DE EMPLEADO ----
    // Estructura exacta de la imagen:
    //  [ DATOS DE EMPLEADO (encabezado azul, texto blanco) | FECHA (texto azul, sin fondo) ]
    //  [ Empleado: | valor | Fecha de ingreso: | valor     | fecha doc                     ]
    const tY = sy + 31;
    const colFechaW = 28;
    const colDatosW = pw - colFechaW;

    const r = 1.5; // radio esquinas redondeadas
    const headerH = 6;
    const rowH = 8;

    // Encabezado "DATOS DE EMPLEADO" — fondo azul, texto blanco, esquinas redondeadas arriba
    doc.setFillColor(42, 122, 228);
    doc.setDrawColor(42, 122, 228);
    doc.setLineWidth(0.3);
    doc.roundedRect(lm, tY, colDatosW, headerH, r, r, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('DATOS DE EMPLEADO', lm + colDatosW / 2, tY + 4.2, { align: 'center' });

    // Encabezado "FECHA" — sin fondo, texto azul, esquinas redondeadas arriba
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(lm + colDatosW, tY, colFechaW, headerH, r, r, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(42, 122, 228);
    doc.text('FECHA', lm + colDatosW + colFechaW / 2, tY + 4.2, { align: 'center' });

    // Fila de datos: Empleado + Fecha de ingreso + Fecha doc
    doc.setDrawColor(42, 122, 228);
    doc.setLineWidth(0.3);

    // Celda izquierda (empleado + fecha ingreso combinados)
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(lm, tY + headerH, colDatosW, rowH, r, r, 'FD');

    // Celda derecha (fecha documento)
    doc.roundedRect(lm + colDatosW, tY + headerH, colFechaW, rowH, r, r, 'FD');

    // Línea vertical interna separando empleado de fecha ingreso
    const splitX = lm + colDatosW * 0.62;
    doc.setDrawColor(42, 122, 228);
    doc.line(splitX, tY + headerH, splitX, tY + headerH + rowH);

    const midY = tY + headerH + rowH / 2 + 1;

    // "Empleado:" label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(42, 122, 228);
    doc.text('Empleado:', lm + 2, midY);

    // Nombre del empleado
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    doc.text(empleado.nombre, lm + 18, midY);

    // "Fecha de ingreso:" en 2 líneas
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(42, 122, 228);
    doc.text('Fecha de', splitX + 2, midY - 1.5);
    doc.text('ingreso:', splitX + 2, midY + 2.5);

    // Valor fecha ingreso
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    doc.text(empleado.fechaIngreso, splitX + 17, midY);

    // Fecha del documento (celda FECHA)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    doc.text(this.fmtDate(solicitud.requestDate), lm + colDatosW + colFechaW / 2, midY, { align: 'center' });

    let y = tY + headerH + rowH + 5;

    // ---- Período de vacaciones ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    doc.text('Periodo al que corresponden las vacaciones:', lm, y);
    y += 3;

    const vacYear = solicitud.vacationYear ?? new Date().getFullYear();
    const diasPendientes = empleado.saldoTotal - solicitud.daysCount;

    // Tabla período: encabezado gris con texto azul, body sin fondo, borde azul
    autoTable(doc, {
      startY: y,
      margin: { left: lm },
      tableWidth: pw,
      styles: {
        fontSize: 6.5,
        cellPadding: { top: 1.5, bottom: 1.5, left: 1, right: 1 },
        lineColor: [42, 122, 228],
        lineWidth: 0.3,
        textColor: [30, 30, 30],
        halign: 'center',
        fillColor: [255, 255, 255]
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [42, 122, 228],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 6.5,
        lineColor: [42, 122, 228],
        lineWidth: 0.3
      },
      bodyStyles: {
        minCellHeight: 6,
        valign: 'middle'
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 20 },
        2: { cellWidth: 50, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 22 },
        4: { cellWidth: 30 },
        5: { cellWidth: 34 }
      },
      head: [[
        'Vacaciones correspondientes',
        'del año',
        'Periodo',
        'No. Dias\nsolicitados',
        'dias vac\npagadas',
        'vacaciones\npendientes'
      ]],
      body: [[
        `${empleado.antiguedad} Año(s)`,
        `${vacYear}`,
        `${this.fmtDate(solicitud.startDate)}  al  ${this.fmtDate(solicitud.endDate)}`,
        `${solicitud.daysCount}`,
        `${empleado.diasTomados}`,
        `${diasPendientes}`
      ]]
    });

    y = (doc as any).lastAutoTable.finalY + 5;

    // ---- Tabla Fecha inicio / Fecha término / Fecha reanudación ----
    // Encabezado: fondo azul claro (gris), texto azul — body con altura grande vacía
    const retorno = this.nextDay(solicitud.endDate);

    autoTable(doc, {
      startY: y,
      margin: { left: lm },
      tableWidth: pw,
      styles: {
        fontSize: 7,
        cellPadding: { top: 1.5, bottom: 3, left: 2, right: 2 },
        lineColor: [42, 122, 228],
        lineWidth: 0.3,
        textColor: [30, 30, 30],
        halign: 'center',
        valign: 'top',
        fillColor: [255, 255, 255]
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [42, 122, 228],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 7,
        lineColor: [42, 122, 228],
        lineWidth: 0.3,
        cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 }
      },
      columnStyles: {
        0: { cellWidth: pw / 3 },
        1: { cellWidth: pw / 3 },
        2: { cellWidth: pw / 3 }
      },
      head: [['Fecha inicio:', 'Fecha termino:', 'Fecha de reanudación de actividades:']],
      body: [[this.fmtDate(solicitud.startDate), this.fmtDate(solicitud.endDate), retorno]]
    });

    y = (doc as any).lastAutoTable.finalY + 5;

    // ---- Observaciones ----
    // Recuadro exterior con borde azul, etiqueta gris interior, línea de texto
    const obsH = 14;
    doc.setDrawColor(42, 122, 228);
    doc.setLineWidth(0.3);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(lm, y, pw, obsH, 1.5, 1.5, 'FD');

    // Etiqueta "Observaciones:" — fondo gris, texto azul
    doc.setFillColor(180, 180, 180);
    doc.rect(lm + 1, y + 1, 22, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(42, 122, 228);
    doc.text('Observaciones:', lm + 2, y + 4.8);

    // Línea horizontal de escritura
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.2);
    doc.line(lm + 25, y + 6.5, lm + pw - 2, y + 6.5);
    doc.line(lm + 2, y + 11.5, lm + pw - 2, y + 11.5);

    y += obsH + 6;

    // ---- Firmas ----
    this.drawFirmas(doc, y);
  }

  private drawFirmas(doc: jsPDF, y: number): void {
    const lm = 12;
    const pw = 186;
    const gap = 3;
    const fw = (pw - gap * 3) / 4;
    const fh = 26;

    const firmas = [
      { top: 'Trabajador(a)', bottom: 'Nombre y Firma' },
      { top: 'Aprobada:  Jefe directo\nEncargado de obra / Residente', bottom: 'Firma' },
      { top: 'Autoriza\nGerente de operaciones\n/ Administrativo', bottom: 'Firma de autorización' },
      { top: 'Enterado', bottom: 'Firma de R.H.' }
    ];

    doc.setDrawColor(42, 122, 228);
    doc.setLineWidth(0.4);

    firmas.forEach((f, i) => {
      const x = lm + i * (fw + gap);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, y, fw, fh, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(42, 122, 228);
      const lines = f.top.split('\n');
      lines.forEach((line, li) => {
        doc.text(line, x + fw / 2, y + 4.5 + li * 3.8, { align: 'center' });
      });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(42, 122, 228);
      doc.text(f.bottom, x + fw / 2, y + fh - 2.5, { align: 'center' });
    });
  }

  private fmtDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  private nextDay(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    d.setDate(d.getDate() + 1);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
}
