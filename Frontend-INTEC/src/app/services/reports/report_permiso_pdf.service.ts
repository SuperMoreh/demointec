import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface EmpleadoPermisoPdf {
  nombre: string;
  fechaIngreso: string;
}

export interface SolicitudPermisoPdf {
  startDate: string;
  endDate: string;
  reason: string;
  withPay: boolean;
  requestDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportPermisoPdfService {

  async generate(empleado: EmpleadoPermisoPdf, solicitud: SolicitudPermisoPdf): Promise<void> {
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
    doc.save(`SolicitudPermiso_${today}.pdf`);
  }

  private async loadLogoBase64(): Promise<string | null> {
    try {
      const response = await fetch('/assets/logo1.png');
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
    empleado: EmpleadoPermisoPdf,
    solicitud: SolicitudPermisoPdf,
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
    doc.text('SOLICITUD DE PERMISO', 105, sy + 27, { align: 'center' });

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

    // Fila 1: Empleado / Fecha documento
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

    let y = tY + 6 + rowH * 2 + 6;

    // ---- PERMISO ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(42, 122, 228);
    doc.text('PERMISO', lm, y);
    y += 5;

    // Sin/Con goce
    const sinGoce = !solicitud.withPay;
    const conGoce = solicitud.withPay;

    doc.setFillColor(200, 200, 200);
    doc.rect(lm, y, 38, 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(60, 60, 60);
    doc.text('SIN GOCE DE SUELDO', lm + 19, y + 4.5, { align: 'center' });

    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.3);
    doc.rect(lm + 40, y + 1, 5, 5);
    if (sinGoce) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 30, 30);
      doc.text('X', lm + 41.5, y + 5.2);
    }

    doc.setFillColor(200, 200, 200);
    doc.rect(lm + 55, y, 38, 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(60, 60, 60);
    doc.text('CON GOCE DE SUELDO', lm + 74, y + 4.5, { align: 'center' });

    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.3);
    doc.rect(lm + 95, y + 1, 5, 5);
    if (conGoce) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 30, 30);
      doc.text('X', lm + 96.5, y + 5.2);
    }

    y += 10;

    // Etiqueta MOTIVO
    doc.setFillColor(180, 180, 180);
    doc.rect(lm, y, 22, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(42, 122, 228);
    doc.text('MOTIVO:', lm + 2, y + 3.6);
    y += 9;

    // Checkboxes de motivo
    const motivos: { label: string; key: string }[] = [
      { label: 'DEFUNCIÓN', key: 'DEFUN' },
      { label: 'MATRIMONIO', key: 'MATRI' },
      { label: 'PATERNIDAD', key: 'PATER' },
      { label: 'ADOPCIÓN', key: 'ADOPT' },
      { label: 'OTRO', key: 'OTRO' }
    ];
    const razonUp = (solicitud.reason || '').toUpperCase();
    let cx = lm;
    for (const m of motivos) {
      const checked = razonUp.includes(m.key);
      doc.setDrawColor(80, 80, 80);
      doc.setLineWidth(0.3);
      doc.rect(cx, y - 4, 4, 4);
      if (checked) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(30, 30, 30);
        doc.text('X', cx + 0.8, y - 0.8);
      }
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 30, 30);
      doc.text(m.label, cx + 5.5, y - 0.8);
      cx += m.label.length * 1.85 + 8;
    }

    y += 8;

    // A partir del día / Al día
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    doc.text('A PARTIR DEL DÍA', lm, y);

    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.line(lm + 35, y, lm + 82, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(this.fmtDate(solicitud.startDate), lm + 37, y - 0.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text('AL DÍA', lm + 87, y);
    doc.line(lm + 99, y, lm + 145, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(this.fmtDate(solicitud.endDate), lm + 101, y - 0.5);

    y += 9;

    // Debiéndome presentar a laborar
    const retorno = this.nextDay(solicitud.endDate);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    doc.text('DEBIÉNDOME PRESENTAR A LABORAR EL DÍA:', lm, y);
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.line(lm + 82, y, lm + 135, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(retorno, lm + 84, y - 0.5);

    y += 9;

    // Observaciones
    doc.setFillColor(180, 180, 180);
    doc.rect(lm, y, 22, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(42, 122, 228);
    doc.text('Observaciones:', lm + 1, y + 3.6);
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.3);
    doc.line(lm + 24, y + 5, lm + pw, y + 5);

    y += 13;

    // ---- Cuadros de firma ----
    this.drawFirmas(doc, y);
  }

  private drawFirmas(doc: jsPDF, y: number): void {
    const lm = 12;
    const pw = 186;
    const fw = (pw - 9) / 4;
    const fh = 20;

    const firmas = [
      { top: 'Trabajador(a)', bottom: 'Nombre y Firma' },
      { top: 'Aprobada:  Jefe directo /\nEncargado de obra / Residente', bottom: 'Firma' },
      { top: 'Autoriza\nGerente de area', bottom: 'Firma de autorización' },
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
