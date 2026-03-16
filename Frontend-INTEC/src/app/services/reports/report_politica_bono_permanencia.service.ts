import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface PoliticaBonoPermanenciaData {
  duenioOperativo: string;
  duenioEjecutivo: string;
  fechaAprobacion: string;
  entradaVigor: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportPoliticaBonoPermanenciaService {

  async generate(data: PoliticaBonoPermanenciaData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logoBase64 = await this.loadLogoBase64();

    this.drawDocument(doc, data, logoBase64);

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`PoliticaBonoPermanencia_${today}.pdf`);
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

  private formatDate(d: string): string {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
  }

  private drawDocument(doc: jsPDF, data: PoliticaBonoPermanenciaData, logoBase64: string | null): void {
    const lm = 15;
    const rm = 15;
    const pw = 210 - lm - rm;
    const orange: [number, number, number] = [245, 133, 37];
    const white: [number, number, number] = [255, 255, 255];
    const dark: [number, number, number] = [20, 20, 20];
    const fs = 9.5;
    const lh = 5.2;

    // ── Header: logo + tabla ──────────────────────────────────────────────────
    const headerH = 30;
    const logoW = 34;

    // Borde naranja exterior del header
    doc.setDrawColor(orange[0], orange[1], orange[2]);
    doc.setLineWidth(0.8);
    doc.rect(lm, 8, pw, headerH, 'S');

    // Separador vertical logo / contenido
    doc.setLineWidth(0.4);
    doc.line(lm + logoW, 8, lm + logoW, 8 + headerH);

    // Logo
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', lm + 1, 9, logoW - 2, headerH - 2);
    }

    // Zona título + tabla
    const titleX = lm + logoW;
    const titleW = pw - logoW;

    // Título "Política de Bono por Permanencia" centrado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text('Política de Bono por Permanencia', titleX + titleW / 2, 15, { align: 'center' });

    // Separador horizontal entre título y tabla
    doc.setDrawColor(orange[0], orange[1], orange[2]);
    doc.setLineWidth(0.4);
    doc.line(titleX, 18, lm + pw, 18);

    // Tabla de 4 columnas
    const colW = titleW / 4;
    const hdrY = 18;
    const hdrH = 6;
    const dataH = 14;
    const cols = ['Dueño Operativo', 'Dueño Ejecutivo', 'Fecha de aprobación', 'Entrada en vigor'];
    const vals = [
      data.duenioOperativo,
      data.duenioEjecutivo,
      this.formatDate(data.fechaAprobacion),
      this.formatDate(data.entradaVigor),
    ];

    // Headers naranjas
    for (let i = 0; i < 4; i++) {
      const cx = titleX + i * colW;
      doc.setFillColor(orange[0], orange[1], orange[2]);
      doc.setDrawColor(orange[0], orange[1], orange[2]);
      doc.setLineWidth(0.3);
      doc.rect(cx, hdrY, colW, hdrH, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(white[0], white[1], white[2]);
      doc.text(cols[i], cx + colW / 2, hdrY + hdrH / 2 + 1.3, { align: 'center' });
    }

    // Fila de datos
    const dataY = hdrY + hdrH;
    for (let i = 0; i < 4; i++) {
      const cx = titleX + i * colW;
      doc.setFillColor(white[0], white[1], white[2]);
      doc.setDrawColor(orange[0], orange[1], orange[2]);
      doc.setLineWidth(0.3);
      doc.rect(cx, dataY, colW, dataH, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(dark[0], dark[1], dark[2]);
      const val = vals[i] ?? '';
      const wrapped = doc.splitTextToSize(val, colW - 3);
      const textY = dataY + dataH / 2 - (wrapped.length - 1) * 2.2 + 1.5;
      doc.text(wrapped, cx + colW / 2, textY, { align: 'center' });
    }

    // Línea naranja inferior del header
    doc.setDrawColor(orange[0], orange[1], orange[2]);
    doc.setLineWidth(2);
    doc.line(lm, 8 + headerH + 1, lm + pw, 8 + headerH + 1);

    let y = 8 + headerH + 8;
    doc.setTextColor(dark[0], dark[1], dark[2]);

    // ── Objetivo ─────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.text('Objetivo', lm, y);
    const objLabelW = doc.getTextWidth('Objetivo ');
    doc.setFont('helvetica', 'normal');
    const objText = 'Establecer los lineamientos para el otorgamiento de bono por permanencia.';
    doc.text(objText, lm + objLabelW, y);
    y += lh + 3;

    // ── Objetivo(s) de la política — bloque naranja ───────────────────────────
    const objPoliticaText = 'Considerar la Permanencia del trabajador en la empresa para poder otorgar el bono como un beneficio adicional a su sueldo que sirva para incentivar y mejorar las condiciones para la retención de personal.';
    const objPoliticaLines = doc.splitTextToSize(objPoliticaText, pw - 4);
    const objPoliticaH = 7 + objPoliticaLines.length * lh + 3;

    // Fondo naranja para el título del bloque
    doc.setFillColor(orange[0], orange[1], orange[2]);
    doc.rect(lm, y, pw, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.setTextColor(white[0], white[1], white[2]);
    doc.text('Objetivo (s) de la política:', lm + pw / 2, y + 4.8, { align: 'center' });

    // Borde del bloque completo
    doc.setDrawColor(orange[0], orange[1], orange[2]);
    doc.setLineWidth(0.4);
    doc.rect(lm, y, pw, objPoliticaH, 'S');

    // Texto dentro del bloque
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    this.drawJustified(doc, objPoliticaLines, lm + 2, y + 10, pw - 4, lh);
    y += objPoliticaH + 6;

    // ── Alcance ───────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text('Alcance:', lm, y);
    const alcanceLabelW = doc.getTextWidth('Alcance: ');
    doc.setFont('helvetica', 'normal');
    doc.text('Personal operativo en obras.', lm + alcanceLabelW, y);
    y += lh + 4;

    // ── Responsabilidades ─────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.text('Responsabilidades', lm, y);
    y += lh + 2;

    const responsabilidades = [
      'Recursos Humanos. Es responsables de la emisión de los lineamientos que afecten a la presente política. Del mismo modo es responsable de llevar el control y registro de la antigüedad y desempeño para iniciar con el pago de dicho bono.',
      'El Gerente de Operaciones será quien autorice el pago de dicho bono ($200.00 semanales).',
      'Los trabajadores son responsables de realizar su trabajo con esmero, no faltar de manera injustificada, no contar con retardos, utilizar su Equipo de protección personal, Uniforme y respetar el Reglamento interior de trabajo.',
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    for (const resp of responsabilidades) {
      const lines = doc.splitTextToSize(resp, pw);
      y = this.drawJustified(doc, lines, lm, y, pw, lh);
      y += 3;
    }
    y += 3;

    // ── NOTA ─────────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.text('NOTA: ', lm, y);
    const notaLabelW = doc.getTextWidth('NOTA: ');
    // "Es importante aclarar..." en negrita subrayado
    const notaUnderline = 'Es importante aclarar que todos los trabajadores están sujetos a evaluación y previa autorización, teniendo en cuenta esta política.';
    const notaUnderlineLines = doc.splitTextToSize(notaUnderline, pw - notaLabelW);

    // primera línea inline
    doc.text(notaUnderlineLines[0], lm + notaLabelW, y);
    // subrayado primera línea
    doc.setLineWidth(0.2);
    doc.setDrawColor(dark[0], dark[1], dark[2]);
    doc.line(lm + notaLabelW, y + 0.5, lm + notaLabelW + doc.getTextWidth(notaUnderlineLines[0]), y + 0.5);
    y += lh;
    for (let i = 1; i < notaUnderlineLines.length; i++) {
      doc.text(notaUnderlineLines[i], lm, y);
      doc.line(lm, y + 0.5, lm + doc.getTextWidth(notaUnderlineLines[i]), y + 0.5);
      y += lh;
    }
    y += 5;

    // ── Tabla de lineamientos ─────────────────────────────────────────────────
    const numW = 12;
    const linW = pw - numW;
    const rowHdr = 7;

    // Header naranja
    doc.setFillColor(orange[0], orange[1], orange[2]);
    doc.setDrawColor(orange[0], orange[1], orange[2]);
    doc.setLineWidth(0.3);
    doc.rect(lm, y, numW, rowHdr, 'FD');
    doc.rect(lm + numW, y, linW, rowHdr, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(white[0], white[1], white[2]);
    doc.text('Núm.', lm + numW / 2, y + rowHdr / 2 + 1.3, { align: 'center' });
    doc.text('Lineamiento', lm + numW + linW / 2, y + rowHdr / 2 + 1.3, { align: 'center' });
    y += rowHdr;

    const lineamientos = [
      { num: '1.', bold: 'Requisitos:', text: ' Ser trabajador de la Empresa Intec de Jalisco S.A. de C.V.' },
      { num: '2.', bold: '', text: 'Contar con una antigüedad de 6 semanas de trabajo continuo en la Empresa.' },
      { num: '3.', bold: '', text: 'El bono corresponde a $200.00 semanales.' },
      { num: '4.', bold: '', text: 'Para recibir dicho bono, el trabajador deberá realizar su trabajo con esmero, no faltar de manera injustificada, no contar con retardos, utilizar su EPP y respetar el RIT.' },
      { num: '5.', bold: '', text: 'Los trabajadores que se encuentren disfrutando de algún permiso o incapacidad sin goce de sueldo NO tendrán derecho a recibir dicho bono hasta que se reincorporen a sus actividades.' },
      { num: '6.', bold: '', text: 'Los trabajadores que se encuentren disfrutando de alguna licencia (maternidad, paternidad, matrimonio, etc.) con goce de sueldo SI tendrán derecho a recibir dicho bono.' },
    ];

    doc.setFontSize(fs);
    for (const row of lineamientos) {
      const fullText = row.bold + row.text;
      const textLines = doc.splitTextToSize(fullText, linW - 4);
      const rowH = Math.max(8, textLines.length * lh + 4);

      doc.setFillColor(white[0], white[1], white[2]);
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.2);
      doc.rect(lm, y, numW, rowH, 'FD');
      doc.rect(lm + numW, y, linW, rowH, 'FD');

      // número centrado
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(dark[0], dark[1], dark[2]);
      doc.text(row.num, lm + numW / 2, y + rowH / 2 + 1.3, { align: 'center' });

      // texto de la fila
      const textStartY = y + rowH / 2 - (textLines.length - 1) * lh / 2 + 0.5;
      if (row.bold) {
        // primera línea con bold inline
        doc.setFont('helvetica', 'bold');
        doc.text(row.bold, lm + numW + 2, textStartY);
        const boldW = doc.getTextWidth(row.bold);
        doc.setFont('helvetica', 'normal');
        // resto de la primera línea
        const firstLineRest = textLines[0].slice(row.bold.length);
        doc.text(firstLineRest, lm + numW + 2 + boldW, textStartY);
        for (let i = 1; i < textLines.length; i++) {
          doc.text(textLines[i], lm + numW + 2, textStartY + i * lh);
        }
      } else {
        for (let i = 0; i < textLines.length; i++) {
          doc.text(textLines[i], lm + numW + 2, textStartY + i * lh);
        }
      }
      y += rowH;
    }

    // ── Pie de página ─────────────────────────────────────────────────────────
    const pageH = 297;
    doc.setDrawColor(orange[0], orange[1], orange[2]);
    doc.setLineWidth(1.5);
    doc.line(lm, pageH - 12, lm + pw, pageH - 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text('INTEC de Jalisco S.A. de C.V.', 105, pageH - 7, { align: 'center' });
    doc.text('Página 1 de 1', lm + pw, pageH - 7, { align: 'right' });
  }

  private drawJustified(doc: jsPDF, lines: string[], x: number, y: number, pw: number, lineH: number): number {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isLast = i === lines.length - 1;
      if (isLast || line.trim().split(' ').length <= 1) {
        doc.text(line, x, y);
      } else {
        const words = line.trim().split(' ');
        const lw = doc.getTextWidth(line.trim());
        const sp = (pw - lw + doc.getTextWidth(' ') * (words.length - 1)) / (words.length - 1);
        let cx = x;
        for (const word of words) {
          doc.text(word, cx, y);
          cx += doc.getTextWidth(word) + sp;
        }
      }
      y += lineH;
    }
    return y;
  }
}
