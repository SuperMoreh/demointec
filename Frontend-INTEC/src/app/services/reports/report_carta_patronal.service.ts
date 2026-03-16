import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface CartaPatronalData {
  ciudad: string;
  dia: string;
  mes: string;
  anio: string;
  nombreEmpleado: string;
  puesto: string;
  diasInicio: string;
  diasFin: string;
  horaEntrada: string;
  horaSalida: string;
  numAfiliacion: string;
  diaAlta: string;
  mesAlta: string;
  diasVacaciones: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportCartaPatronalService {

  async generate(data: CartaPatronalData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logoBase64 = await this.loadLogoBase64();

    this.drawDocument(doc, data, logoBase64);

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`CartaPatronal_${today}.pdf`);
  }

  private async loadLogoBase64(): Promise<string | null> {
    try {
      const response = await fetch('/assets/logo.png');
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

  private drawDocument(doc: jsPDF, data: CartaPatronalData, logoBase64: string | null): void {
    const lm = 25;
    const rm = 25;
    const pw = 210 - lm - rm;

    // ---- Logo ----
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', lm, 10, 28, 20);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(42, 122, 228);
      doc.text('INTEC', lm + 5, 22);
    }

    // ---- Fecha (alineada a la derecha) ----
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    const fecha = `${data.ciudad}, Jal. a ${data.dia} de ${data.mes} de ${data.anio}`;
    doc.text(fecha, lm + pw, 20, { align: 'right' });

    let y = 48;

    // ---- A QUIEN CORRESPONDA ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text('A QUIEN CORRESPONDA:', lm, y);
    y += 14;

    // ---- Párrafo principal ----
    // Se construye el párrafo y se dibuja con segmentos bold/normal
    const lineH = 6.5;
    const fs = 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    doc.setTextColor(20, 20, 20);

    const parrafo =
      `Por este medio, hacemos constar que la C. ${data.nombreEmpleado}, ` +
      `presta sus servicios en esta empresa como ${data.puesto}, con un horario ` +
      `laboral de ${data.diasInicio} a ${data.diasFin} de ${data.horaEntrada} a ${data.horaSalida} hrs, descansando los días Domingos ` +
      `y festivos. Su alta en el seguro social se generó con el número de afiliación ${data.numAfiliacion} ` +
      `desde el día ${data.diaAlta} de ${data.mesAlta} de ${data.anio}, Su proporción a vacaciones de acuerdo a su ` +
      `fecha de ingreso es de ${data.diasVacaciones} días.`;

    const lines: string[] = doc.splitTextToSize(parrafo, pw);
    y = this.drawJustified(doc, lines, lm, y, pw, lineH);
    y += 10;

    // ---- Párrafo 2 ----
    const p2 = 'Se extiende la presente a petición del interesado para los fines legales que a él convengan.';
    const p2Lines: string[] = doc.splitTextToSize(p2, pw);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    y = this.drawJustified(doc, p2Lines, lm, y, pw, lineH);
    y += 4;

    // ---- Párrafo 3 ----
    const p3 = 'Sin más por el momento me despido quedando a sus órdenes para cualquier duda o aclaración.';
    const p3Lines: string[] = doc.splitTextToSize(p3, pw);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    y = this.drawJustified(doc, p3Lines, lm, y, pw, lineH);
    y += 20;

    // ---- AFECTUOSAMENTE ----
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text('AFECTUOSAMENTE,', 105, y, { align: 'center' });
    y += 18;

    // ---- Firmante ----
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Lic. María Asunción Mares Magallanes', 105, y, { align: 'center' });
    y += 5.5;
    doc.text('Encargada de R.H.', 105, y, { align: 'center' });
  }

  private drawJustified(doc: jsPDF, lines: string[], x: number, y: number, pw: number, lineH: number): number {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isLastLine = i === lines.length - 1;

      if (isLastLine) {
        doc.text(line, x, y);
      } else {
        const words = line.trim().split(' ');
        if (words.length <= 1) {
          doc.text(line, x, y);
        } else {
          const lineWidth = doc.getTextWidth(line.trim());
          const totalSpaceWidth = pw - lineWidth + doc.getTextWidth(' ') * (words.length - 1);
          const spaceWidth = totalSpaceWidth / (words.length - 1);
          let cx = x;
          for (let w = 0; w < words.length; w++) {
            doc.text(words[w], cx, y);
            if (w < words.length - 1) {
              cx += doc.getTextWidth(words[w]) + spaceWidth;
            }
          }
        }
      }
      y += lineH;
    }
    return y;
  }
}
