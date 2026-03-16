import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface PoliticaPrestamosData {
  duenioOperativo: string;
  duenioEjecutivo: string;
  fechaAprobacion: string;
  entradaVigor: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportPoliticaPrestamosService {

  async generate(data: PoliticaPrestamosData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logoBase64 = await this.loadLogoBase64();

    this.drawPage1(doc, data, logoBase64);
    doc.addPage();
    this.drawPage2(doc, data, logoBase64);

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`PoliticaPrestamos_${today}.pdf`);
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

  // ── Constants ───────────────────────────────────────────────────────────────
  private readonly LM = 14;
  private readonly RM = 14;
  private readonly PW = 210 - 14 - 14;
  private readonly orange: [number, number, number] = [245, 133, 37];
  private readonly white: [number, number, number] = [255, 255, 255];
  private readonly dark: [number, number, number] = [20, 20, 20];
  private readonly LOGO_W = 30;
  private readonly HEADER_H = 26;
  private readonly FOOTER_Y = 285;

  // ── Header (same on both pages) ─────────────────────────────────────────────
  private drawHeader(doc: jsPDF, data: PoliticaPrestamosData, logoBase64: string | null): void {
    const { LM, PW, orange, white, dark, LOGO_W, HEADER_H } = this;
    const headerY = 8;

    // Outer border
    doc.setDrawColor(orange[0], orange[1], orange[2]);
    doc.setLineWidth(0.5);
    doc.setFillColor(white[0], white[1], white[2]);
    doc.rect(LM, headerY, PW, HEADER_H, 'FD');

    // Logo cell (white)
    doc.setFillColor(white[0], white[1], white[2]);
    doc.setDrawColor(orange[0], orange[1], orange[2]);
    doc.setLineWidth(0.3);
    doc.rect(LM, headerY, LOGO_W, HEADER_H, 'FD');
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', LM + 1, headerY + 2, LOGO_W - 2, HEADER_H - 4);
    }

    // Right zone: title row (orange bg) + table row (white bg)
    const rightX = LM + LOGO_W;
    const rightW = PW - LOGO_W;
    const titleRowH = 8;
    const tableY = headerY + titleRowH;
    const tableH = HEADER_H - titleRowH;

    // Title row background (orange)
    doc.setFillColor(orange[0], orange[1], orange[2]);
    doc.rect(rightX, headerY, rightW, titleRowH, 'F');

    // Title text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(white[0], white[1], white[2]);
    doc.text('Política de Préstamos Personales', rightX + rightW / 2, headerY + 5.5, { align: 'center' });

    // 4-column table (header row + data row)
    const colW = rightW / 4;
    const hdrRowH = tableH / 2;
    const dataRowH = tableH - hdrRowH;
    const cols = ['Dueño Operativo', 'Dueño Ejecutivo', 'Fecha de\naprobación', 'Entrada en vigor'];
    const vals = [
      data.duenioOperativo,
      data.duenioEjecutivo,
      this.formatDate(data.fechaAprobacion),
      this.formatDate(data.entradaVigor),
    ];

    for (let i = 0; i < 4; i++) {
      const cx = rightX + i * colW;

      // Header cell (orange bg, white text)
      doc.setFillColor(orange[0], orange[1], orange[2]);
      doc.setDrawColor(white[0], white[1], white[2]);
      doc.setLineWidth(0.2);
      doc.rect(cx, tableY, colW, hdrRowH, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(white[0], white[1], white[2]);
      const hdrLines = cols[i].split('\n');
      if (hdrLines.length === 2) {
        doc.text(hdrLines[0], cx + colW / 2, tableY + 2.2, { align: 'center' });
        doc.text(hdrLines[1], cx + colW / 2, tableY + 4.8, { align: 'center' });
      } else {
        doc.text(cols[i], cx + colW / 2, tableY + hdrRowH / 2 + 1, { align: 'center' });
      }

      // Data cell (white bg, dark text)
      doc.setFillColor(white[0], white[1], white[2]);
      doc.setDrawColor(orange[0], orange[1], orange[2]);
      doc.setLineWidth(0.2);
      doc.rect(cx, tableY + hdrRowH, colW, dataRowH, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(dark[0], dark[1], dark[2]);
      const wrapped = doc.splitTextToSize(vals[i] ?? '', colW - 2);
      const textY = tableY + hdrRowH + dataRowH / 2 - (wrapped.length - 1) * 2 + 1;
      doc.text(wrapped, cx + colW / 2, textY, { align: 'center' });
    }
  }

  // ── Footer ──────────────────────────────────────────────────────────────────
  private drawFooter(doc: jsPDF, page: number, total: number): void {
    const { dark, FOOTER_Y, LM, PW, orange } = this;
    // Orange line above footer
    doc.setDrawColor(orange[0], orange[1], orange[2]);
    doc.setLineWidth(0.8);
    doc.line(LM, FOOTER_Y - 3, LM + PW, FOOTER_Y - 3);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text('INTEC de Jalisco S.A. de C.V.', 105, FOOTER_Y, { align: 'center' });
    doc.text(`Página ${page} de ${total}`, LM + PW, FOOTER_Y, { align: 'right' });
  }

  // ── Justified text helper ────────────────────────────────────────────────────
  private drawJustified(doc: jsPDF, lines: string[], x: number, y: number, pw: number, lh: number): number {
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
      y += lh;
    }
    return y;
  }

  // ── Lineamiento table row ────────────────────────────────────────────────────
  private drawLineamientoRow(
    doc: jsPDF, num: string, text: string, boldLabel: string | null,
    y: number, numColW: number, textColW: number, lh: number, fs: number
  ): number {
    const { LM, dark, orange } = this;
    const textX = LM + numColW;

    // Measure text height
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    const allLines = doc.splitTextToSize(text, textColW - 3);
    const rowH = Math.max(allLines.length * lh + 3, lh + 3);

    // Draw cells
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(orange[0], orange[1], orange[2]);
    doc.setLineWidth(0.2);
    doc.rect(LM, y, numColW, rowH, 'FD');
    doc.rect(textX, y, textColW, rowH, 'FD');

    // Num
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text(num, LM + numColW / 2, y + rowH / 2 + 1, { align: 'center' });

    // Text content — if has bold label, draw it inline
    let ty = y + 2 + lh * 0.5;
    if (boldLabel) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fs);
      const labelW = doc.getTextWidth(boldLabel);
      doc.text(boldLabel, textX + 1.5, ty);
      doc.setFont('helvetica', 'normal');
      const restText = text.slice(boldLabel.length);
      const restWrapped = doc.splitTextToSize(restText, textColW - 3 - labelW);
      doc.text(restWrapped[0] ?? '', textX + 1.5 + labelW, ty);
      ty += lh;
      if (restWrapped.length > 1) {
        const more = doc.splitTextToSize(restWrapped.slice(1).join(' '), textColW - 3);
        for (const l of more) {
          doc.text(l, textX + 1.5, ty);
          ty += lh;
        }
      }
    } else {
      for (const l of allLines) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(fs);
        doc.setTextColor(dark[0], dark[1], dark[2]);
        doc.text(l, textX + 1.5, ty);
        ty += lh;
      }
    }

    return y + rowH;
  }

  // ── Page 1 ──────────────────────────────────────────────────────────────────
  private drawPage1(doc: jsPDF, data: PoliticaPrestamosData, logoBase64: string | null): void {
    const { LM, PW, dark, orange, white, HEADER_H } = this;
    const fs = 9;
    const lh = 5;

    this.drawHeader(doc, data, logoBase64);
    this.drawFooter(doc, 1, 2);

    let y = 8 + HEADER_H + 5;
    doc.setTextColor(dark[0], dark[1], dark[2]);

    // ── 1. Objetivo ───────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    // "1. " normal + "Objetivo" bold + " " + texto normal
    const obj1Text = 'Establecer los lineamientos para el otorgamiento de préstamos personales a los que accesar el personal de la compañía, así como el procedimiento para su solicitud, autorización y control.';
    doc.setFont('helvetica', 'bold');
    doc.text('1.', LM, y);
    const n1w = doc.getTextWidth('1. ');
    doc.setFont('helvetica', 'bold');
    doc.text('Objetivo', LM + n1w, y);
    const objW = n1w + doc.getTextWidth('Objetivo ');
    doc.setFont('helvetica', 'normal');
    const obj1Lines = doc.splitTextToSize(obj1Text, PW - objW);
    doc.text(obj1Lines[0] ?? '', LM + objW, y);
    y += lh;
    if (obj1Lines.length > 1) {
      y = this.drawJustified(doc, obj1Lines.slice(1), LM, y, PW, lh);
    }
    y += 3;

    // Sub-bloque "Objetivo (s) de la política:" con marco naranja
    const subBoxH = 7;
    const objSubText = 'Evaluar las situaciones que realmente clasifiquen como una Urgencia en relación a las siguientes problemáticas definidas: salud, vivienda, educación y emergencia económica. Se busca administrar y racionalizar la entrega de los recursos destinados a los préstamos personales a los trabajadores de la empresa.';
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    const innerPadX = 3;
    const innerPadTop = 4;
    const innerPadBot = 4;
    const objSubLines = doc.splitTextToSize(objSubText, PW - innerPadX * 2);
    const objSubTextH = objSubLines.length * lh + innerPadTop + innerPadBot;
    const totalBlockH = subBoxH + objSubTextH;

    // Borde naranja del bloque completo
    doc.setDrawColor(orange[0], orange[1], orange[2]);
    doc.setLineWidth(0.4);
    doc.rect(LM, y, PW, totalBlockH, 'S');

    // Título naranja relleno
    doc.setFillColor(orange[0], orange[1], orange[2]);
    doc.rect(LM, y, PW, subBoxH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.setTextColor(white[0], white[1], white[2]);
    doc.text('Objetivo (s) de la política:', 105, y + subBoxH / 2 + 1.5, { align: 'center' });
    y += subBoxH + innerPadTop;

    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    y = this.drawJustified(doc, objSubLines, LM + innerPadX, y, PW - innerPadX * 2, lh);
    y += innerPadBot + 4;

    // ── Alcance ───────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.text('Alcance:', LM, y);
    const alcW = doc.getTextWidth('Alcance: ');
    doc.setFont('helvetica', 'normal');
    const alcText = 'Todos los trabajadores que tengan al menos 8 a 10 semanas de antigüedad laboral, independientemente del cargo que desempeñen dentro de la empresa.';
    const alcLines = doc.splitTextToSize(alcText, PW - alcW);
    doc.text(alcLines[0] ?? '', LM + alcW, y);
    y += lh;
    if (alcLines.length > 1) {
      y = this.drawJustified(doc, alcLines.slice(1), LM, y, PW, lh);
    }
    y += 2;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    y = this.drawJustified(doc, doc.splitTextToSize('Personal con un buen desempeño, cumplimiento de objetivos y apego a RIT.', PW), LM, y, PW, lh);
    y += 4;

    // ── Responsabilidades ─────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.text('Responsabilidades', LM, y);
    y += lh + 1;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    const resp1 = 'Administración es responsable de la emisión de los lineamientos que afecten a la presente política. Del mismo modo es responsable de llevar el control y registro de las solicitudes de anticipos de sueldos del personal, así como de verificar la disponibilidad de flujo de efectivo para dicho otorgamiento.';
    y = this.drawJustified(doc, doc.splitTextToSize(resp1, PW), LM, y, PW, lh);
    y += 2;

    const resp2 = 'Los trabajadores son responsables de realizar la solicitud de préstamo personal, así como informar a Ingeniería y administración dicha solicitud con anticipación.';
    y = this.drawJustified(doc, doc.splitTextToSize(resp2, PW), LM, y, PW, lh);
    y += 3;

    // ── NOTA ──────────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.text('NOTA:', LM, y);
    const notaW = doc.getTextWidth('NOTA: ');
    const notaText = 'Es importante aclarar que todas las solicitudes de préstamos están sujetas a revisión y previa autorización, teniendo en cuenta si cumples los siguientes requisitos y al flujo de efectivo que la empresa tenga al momento de tu solicitud de préstamo.';
    // Underline + bold the nota text
    const notaLines = doc.splitTextToSize(notaText, PW - notaW);
    doc.text(notaLines[0] ?? '', LM + notaW, y);
    // underline first line
    const firstLineW = doc.getTextWidth(notaLines[0] ?? '');
    doc.setDrawColor(dark[0], dark[1], dark[2]);
    doc.setLineWidth(0.2);
    doc.line(LM + notaW, y + 0.8, LM + notaW + firstLineW, y + 0.8);
    y += lh;
    for (let i = 1; i < notaLines.length; i++) {
      const lw = doc.getTextWidth(notaLines[i]);
      doc.text(notaLines[i], LM, y);
      doc.line(LM, y + 0.8, LM + lw, y + 0.8);
      y += lh;
    }
    y += 3;

    // ── Tabla lineamientos 01–08 ──────────────────────────────────────────────
    const numColW = 12;
    const textColW = PW - numColW;

    // Table header
    const tHdrH = 7;
    doc.setFillColor(orange[0], orange[1], orange[2]);
    doc.setDrawColor(orange[0], orange[1], orange[2]);
    doc.rect(LM, y, numColW, tHdrH, 'FD');
    doc.rect(LM + numColW, y, textColW, tHdrH, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.setTextColor(white[0], white[1], white[2]);
    doc.text('Núm.', LM + numColW / 2, y + tHdrH / 2 + 1.5, { align: 'center' });
    doc.text('Lineamiento', LM + numColW + textColW / 2, y + tHdrH / 2 + 1.5, { align: 'center' });
    y += tHdrH;

    doc.setTextColor(dark[0], dark[1], dark[2]);

    const rows: { num: string; text: string; bold: string | null }[] = [
      { num: '01', text: 'Requisitos: Ser trabajador de la Empresa con contrato indefinido vigente a la fecha de solicitud del préstamo.', bold: 'Requisitos:' },
      { num: '02', text: 'Contar con una antigüedad igual o superior a 3 meses de trabajo continuo en la Empresa.', bold: null },
      { num: '03', text: 'Los descuentos autorizados, incluyendo el monto de la cuota que implique el préstamo, no podrá exceder, en ningún caso, el 30% de su salario promedio de los tres últimos meses en que se haya desempeñado.', bold: null },
      { num: '04', text: 'Para préstamos superiores el trabajador deberá firmar un pagaré por el monto del préstamo otorgado y contar con la autorización de Dirección General.', bold: null },
      { num: '05', text: 'El monto máximo del préstamo no podrá exceder a 1 mes de salario del trabajador.\nLos trabajadores que se encuentren disfrutando de alguna licencia (incapacidad, maternidad, paternidad, matrimonio, etc.) con o sin goce de sueldo NO podrán solicitar préstamos durante la vigencia de dicha licencia.', bold: null },
      { num: '06', text: 'Gestión para solicitud de préstamo personal: Presentar formato establecido para solicitud de préstamo personal.', bold: 'Gestión para solicitud de préstamo personal:' },
      { num: '07', text: 'Presentar Formato de Solicitud de préstamo personal con 72hrs de anticipación para evaluación y autorización del mismo.', bold: null },
      { num: '08', text: 'El trabajador no podrá recibir más de un préstamo hasta no tener saldos deudores con la empresa', bold: null },
    ];

    for (const row of rows) {
      y = this.drawLineamientoRow(doc, row.num, row.text, row.bold, y, numColW, textColW, lh, fs);
    }
  }

  // ── Page 2 ──────────────────────────────────────────────────────────────────
  private drawPage2(doc: jsPDF, data: PoliticaPrestamosData, logoBase64: string | null): void {
    const { LM, PW, dark, orange, white, HEADER_H } = this;
    const fs = 9;
    const lh = 5;

    this.drawHeader(doc, data, logoBase64);
    this.drawFooter(doc, 2, 2);

    let y = 8 + HEADER_H + 4;
    doc.setTextColor(dark[0], dark[1], dark[2]);

    // ── Tabla lineamientos 09–15 ──────────────────────────────────────────────
    const numColW = 12;
    const textColW = PW - numColW;

    const rows: { num: string; text: string; bold: string | null }[] = [
      { num: '09', text: 'Firmar los documentos necesarios que amparen dicho préstamo (Formato de solicitud y/o pagare) según sea el caso.', bold: null },
      { num: '10', text: 'Motivos y montos de préstamos: Las problemáticas abordadas para poder otorgar un préstamo empresa serán las siguientes: Salud, vivienda, educación o emergencia económica', bold: 'Motivos y montos de préstamos:' },
      { num: '11', text: 'El monto máximo del préstamo dependerá de la problemática expuesta, antigüedad en la empresa, documentos que lo acrediten, sueldo y probabilidades de pago.', bold: null },
      { num: '12', text: 'El préstamo será descontado en las cuotas que queden de común acuerdo con Administración y en función de la capacidad de pago del trabajador', bold: null },
      { num: '13', text: 'Se entenderá por capacidad de pago del trabajador, el resultado del análisis que se realice respecto de su nivel de adeudo, descuento en conformidad a la normativa laboral y decisión del Comité Evaluador (administración y dirección general).', bold: null },
      { num: '14', text: 'Reajustes. - El monto del préstamo será en pesos y sin intereses y su recuperación a pagar dependiendo del monto autorizado y el acuerdo con Administración.', bold: 'Reajustes. -' },
      { num: '15', text: 'Si la persona beneficiada con el préstamo pierde la condición de trabajador de la Empresa, el saldo que adeuda del préstamo otorgado, le será descontado en una sola cuota de su finiquito, tal como lo indica el formulario de solicitud', bold: null },
    ];

    for (const row of rows) {
      y = this.drawLineamientoRow(doc, row.num, row.text, row.bold, y, numColW, textColW, lh, fs);
    }

    y += 5;

    // ── 2. Definiciones ───────────────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.setTextColor(dark[0], dark[1], dark[2]);
    doc.text('2.', LM, y);
    const n2w = doc.getTextWidth('2. ');
    doc.text('Definiciones:', LM + n2w, y);
    y += lh + 1;

    const defs: { label: string; text: string }[] = [
      {
        label: 'Necesidad Urgente:',
        text: ' Se entenderá como aquella situación inesperada en la que se encuentra una persona que tiene un grave problema personal y/o económico.'
      },
      {
        label: 'Préstamo Personal:',
        text: ' Es un beneficio formalizado en virtud del cual la Empresa entrega al trabajador una cantidad determinada de dinero a cambio de su devolución en un determinado plazo y según condiciones pactadas.'
      },
      {
        label: 'Pagaré:',
        text: ' Documento legal por el que la persona que hace uso del beneficio se obliga a pagar cierta cantidad de dinero en un momento determinado al prestador, tiene validez legal ejecutoria.'
      },
      {
        label: 'Comité de Aprobación:',
        text: ' Dirección general y Administración cuyo objetivo está orientado a realizar la evaluación de los casos expuestos y definir su aprobación o rechazo en base a la Política de la Empresa, la revisión de los casos y la existencia de presupuesto.'
      },
    ];

    for (const def of defs) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(fs);
      doc.setTextColor(dark[0], dark[1], dark[2]);
      const labelW = doc.getTextWidth(def.label);
      doc.text(def.label, LM, y);
      doc.setFont('helvetica', 'normal');
      const fullText = def.text;
      const firstLineAvailW = PW - labelW;
      const firstLines = doc.splitTextToSize(fullText, firstLineAvailW);
      doc.text(firstLines[0] ?? '', LM + labelW, y);
      y += lh;
      if (firstLines.length > 1) {
        const restText = firstLines.slice(1).join(' ');
        y = this.drawJustified(doc, doc.splitTextToSize(restText, PW), LM, y, PW, lh);
      }
      y += 3;
    }
  }
}
