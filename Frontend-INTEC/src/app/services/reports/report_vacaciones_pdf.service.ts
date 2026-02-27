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

    this.drawCopia(doc, 8, empleado, solicitud, logoBase64);

    // Línea punteada separadora
    doc.setLineDashPattern([2, 2], 0);
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.4);
    doc.line(10, 149, 200, 149);
    doc.setLineDashPattern([], 0);

    this.drawCopia(doc, 153, empleado, solicitud, logoBase64);

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
      doc.setDrawColor(42, 122, 228);
      doc.setLineWidth(0.5);
      doc.rect(lm, sy + 1, 30, 20);
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
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(42, 122, 228);
    doc.text('SOLICITUD DE VACACIONES', 105, sy + 27, { align: 'center' });

    // ---- Tabla DATOS DEL EMPLEADO ----
    const tY = sy + 31;
    const colFechaW = 34;
    const colDatosW = pw - colFechaW;

    doc.setFillColor(42, 122, 228);
    doc.rect(lm, tY, colDatosW, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('DATOS DE EMPLEADO', lm + colDatosW / 2, tY + 4.2, { align: 'center' });

    doc.setFillColor(42, 122, 228);
    doc.rect(lm + colDatosW, tY, colFechaW, 6, 'F');
    doc.text('FECHA', lm + colDatosW + colFechaW / 2, tY + 4.2, { align: 'center' });

    const rowH = 7.5;

    // Fila 1: Empleado
    doc.setDrawColor(42, 122, 228);
    doc.setLineWidth(0.3);
    doc.rect(lm, tY + 6, colDatosW, rowH);
    doc.rect(lm + colDatosW, tY + 6, colFechaW, rowH * 2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(42, 122, 228);
    doc.text('Empleado:', lm + 2, tY + 11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(empleado.nombre, lm + 20, tY + 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 30, 30);
    doc.text(this.fmtDate(solicitud.requestDate), lm + colDatosW + colFechaW / 2, tY + 10.5, { align: 'center' });

    // Fila 2: Fecha ingreso
    doc.rect(lm, tY + 6 + rowH, colDatosW, rowH);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(42, 122, 228);
    doc.text('Fecha de ingreso:', lm + 2, tY + 6 + rowH + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 30, 30);
    doc.text(empleado.fechaIngreso, lm + 30, tY + 6 + rowH + 5);

    let y = tY + 6 + rowH * 2 + 5;

    // ---- Período de vacaciones ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    doc.text('Período al que corresponden las vacaciones:', lm, y);
    y += 4;

    const vacYear = solicitud.vacationYear ?? new Date().getFullYear();
    const diasPendientes = empleado.saldoTotal - solicitud.daysCount;

    autoTable(doc, {
      startY: y,
      margin: { left: lm },
      tableWidth: pw,
      styles: {
        fontSize: 6.5,
        cellPadding: 1.5,
        lineColor: [42, 122, 228],
        lineWidth: 0.3,
        textColor: [30, 30, 30]
      },
      headStyles: {
        fillColor: [42, 122, 228],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 6
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 28 },
        1: { halign: 'center', cellWidth: 18 },
        2: { halign: 'center', cellWidth: 42 },
        3: { halign: 'center', cellWidth: 22 },
        4: { halign: 'center', cellWidth: 28 },
        5: { halign: 'center', cellWidth: 28 }
      },
      head: [[
        'Vacaciones correspondientes',
        'Del año',
        'Período',
        'No. Días solicitados',
        'Días vac pagadas',
        'Vacaciones pendientes'
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
        cellPadding: 2,
        lineColor: [42, 122, 228],
        lineWidth: 0.3,
        textColor: [30, 30, 30]
      },
      headStyles: {
        fillColor: [42, 122, 228],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 6.5
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: pw / 3 },
        1: { halign: 'center', cellWidth: pw / 3 },
        2: { halign: 'center', cellWidth: pw / 3 }
      },
      head: [['Fecha inicio:', 'Fecha término:', 'Fecha de reanudación de actividades:']],
      body: [[this.fmtDate(solicitud.startDate), this.fmtDate(solicitud.endDate), retorno]]
    });

    y = (doc as any).lastAutoTable.finalY + 4;

    // ---- Observaciones ----
    doc.setFillColor(180, 180, 180);
    doc.rect(lm, y, 22, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(42, 122, 228);
    doc.text('Observaciones:', lm + 1, y + 3.6);
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.3);
    doc.line(lm + 24, y + 5, lm + pw, y + 5);

    y += 12;

    // ---- Firmas ----
    this.drawFirmas(doc, y);
  }

  private drawFirmas(doc: jsPDF, y: number): void {
    const lm = 12;
    const pw = 186;
    const fw = (pw - 9) / 4;
    const fh = 20;

    const firmas = [
      { top: 'Trabajador(a)', bottom: 'Nombre y Firma' },
      { top: 'Aprobada:  Jefe directo\nEncargado de obra / Residente', bottom: 'Firma' },
      { top: 'Autoriza\nGerente de operaciones\n/ Administrativo', bottom: 'Firma de autorización' },
      { top: 'Enterado', bottom: 'Firma de R.H.' }
    ];

    doc.setDrawColor(42, 122, 228);
    doc.setLineWidth(0.4);

    firmas.forEach((f, i) => {
      const x = lm + i * (fw + 3);
      doc.rect(x, y, fw, fh);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(42, 122, 228);
      const lines = f.top.split('\n');
      lines.forEach((line, li) => {
        doc.text(line, x + fw / 2, y + 4 + li * 3.5, { align: 'center' });
      });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(42, 122, 228);
      doc.text(f.bottom, x + fw / 2, y + fh - 2, { align: 'center' });
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
