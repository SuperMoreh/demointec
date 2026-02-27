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

    // Línea punteada separadora
    doc.setLineDashPattern([2, 2], 0);
    doc.setDrawColor(42, 122, 228);
    doc.setLineWidth(0.5);
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
      doc.addImage(logoBase64, 'PNG', lm, sy + 1, 28, 26);
    } else {
      doc.setDrawColor(42, 122, 228);
      doc.setLineWidth(0.5);
      doc.rect(lm, sy + 1, 28, 26);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(42, 122, 228);
      doc.text('INTEC', lm + 5, sy + 16);
    }

    // ---- Encabezado empresa ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(42, 122, 228);
    doc.text('INTEC DE JALIS CO, S.A. DE C.V.', lm + 34, sy + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(60, 60, 60);
    doc.text('MISIONEROS  #2138    C.P. 44210', lm + 34, sy + 12);
    doc.text('COL. JARDINES DEL COUNTRY', lm + 34, sy + 16.5);
    doc.text('GUADALAJARA, JALISCO', lm + 34, sy + 21);

    // ---- Título ----
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(42, 122, 228);
    doc.text('SOLICITUD DE VACACIONES', 105, sy + 31, { align: 'center' });

    // ---- Sección DATOS DE EMPLEADO ----
    // Estructura: encabezado azul que abarca toda la fila
    // Luego fila única con: Empleado | nombre | Fecha de ingreso | valor | FECHA | valor
    const tY = sy + 34;
    const totalW = pw;

    // Ancho de columna FECHA (derecha)
    const colFechaW = 28;
    // Ancho parte izquierda
    const colDatosW = totalW - colFechaW;

    // Encabezado: "DATOS DE EMPLEADO" abarca colDatosW, "FECHA" abarca colFechaW
    doc.setFillColor(42, 122, 228);
    doc.rect(lm, tY, colDatosW, 5.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('DATOS DE EMPLEADO', lm + colDatosW / 2, tY + 3.8, { align: 'center' });

    doc.setFillColor(42, 122, 228);
    doc.rect(lm + colDatosW, tY, colFechaW, 5.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(42, 122, 228);
    doc.text('FECHA', lm + colDatosW + colFechaW / 2, tY + 3.8, { align: 'center' });

    // Fila de datos: Empleado + Fecha de ingreso en la misma fila, FECHA a la derecha
    const rowH = 12;
    doc.setDrawColor(42, 122, 228);
    doc.setLineWidth(0.3);

    // Celda izquierda grande (empleado + fecha ingreso)
    doc.rect(lm, tY + 5.5, colDatosW, rowH);
    // Celda derecha (fecha del documento)
    doc.rect(lm + colDatosW, tY + 5.5, colFechaW, rowH);

    // Dentro de la celda izquierda: subdividir en Empleado y Fecha de ingreso
    // Línea vertical separadora interna
    const midX = lm + colDatosW * 0.58;
    doc.setDrawColor(42, 122, 228);
    doc.line(midX, tY + 5.5, midX, tY + 5.5 + rowH);

    // Etiqueta "Empleado:"
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(42, 122, 228);
    doc.text('Empleado:', lm + 2, tY + 5.5 + 7.5);
    // Valor empleado
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    const nombreMax = 36;
    const nombreText = empleado.nombre.length > nombreMax
      ? empleado.nombre.substring(0, nombreMax)
      : empleado.nombre;
    doc.text(nombreText, lm + 18, tY + 5.5 + 7.5);

    // Etiqueta "Fecha de ingreso:"
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(42, 122, 228);
    doc.text('Fecha de', midX + 2, tY + 5.5 + 5);
    doc.text('ingreso:', midX + 2, tY + 5.5 + 9);
    // Valor fecha ingreso
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    doc.text(empleado.fechaIngreso, midX + 16, tY + 5.5 + 7.5);

    // Fecha del documento (celda derecha)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);
    doc.text(this.fmtDate(solicitud.requestDate), lm + colDatosW + colFechaW / 2, tY + 5.5 + 7.5, { align: 'center' });

    let y = tY + 5.5 + rowH + 5;

    // ---- Período de vacaciones ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    doc.text('Período al que corresponden las vacaciones:', lm, y);
    y += 3;

    const vacYear = solicitud.vacationYear ?? new Date().getFullYear();
    const diasPendientes = empleado.saldoTotal - solicitud.daysCount;

    autoTable(doc, {
      startY: y,
      margin: { left: lm },
      tableWidth: pw,
      styles: {
        fontSize: 6.5,
        cellPadding: { top: 2, bottom: 2, left: 1.5, right: 1.5 },
        lineColor: [42, 122, 228],
        lineWidth: 0.3,
        textColor: [30, 30, 30],
        halign: 'center'
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
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 20 },
        2: { cellWidth: 50 },
        3: { cellWidth: 24 },
        4: { cellWidth: 30 },
        5: { cellWidth: 32 }
      },
      head: [[
        'Vacaciones\ncorrespondientes',
        'del año',
        'Período',
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

    // ---- Fechas inicio / término / reanudación ----
    const retorno = this.nextDay(solicitud.endDate);

    autoTable(doc, {
      startY: y,
      margin: { left: lm },
      tableWidth: pw,
      styles: {
        fontSize: 7,
        cellPadding: { top: 2.5, bottom: 6, left: 2, right: 2 },
        lineColor: [42, 122, 228],
        lineWidth: 0.3,
        textColor: [30, 30, 30],
        halign: 'center',
        valign: 'top'
      },
      headStyles: {
        fillColor: [200, 200, 200],
        textColor: [42, 122, 228],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 7,
        lineColor: [42, 122, 228],
        lineWidth: 0.3
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

    // ---- Observaciones (recuadro con borde completo) ----
    const obsH = 12;
    doc.setDrawColor(42, 122, 228);
    doc.setLineWidth(0.3);
    doc.rect(lm, y, pw, obsH);

    doc.setFillColor(180, 180, 180);
    doc.rect(lm + 1, y + 1, 22, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(42, 122, 228);
    doc.text('Observaciones:', lm + 2, y + 4.8);

    y += obsH + 5;

    // ---- Firmas ----
    this.drawFirmas(doc, y);
  }

  private drawFirmas(doc: jsPDF, y: number): void {
    const lm = 12;
    const pw = 186;
    const gap = 3;
    const fw = (pw - gap * 3) / 4;
    const fh = 25;

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
      doc.rect(x, y, fw, fh);

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
