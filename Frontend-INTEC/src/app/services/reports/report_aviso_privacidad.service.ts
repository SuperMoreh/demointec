import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface AvisoPrivacidadData {
  nombre: string;
}

// Segmento de texto: texto + si va en negritas
interface Seg { t: string; b: boolean; }

@Injectable({
  providedIn: 'root'
})
export class ReportAvisoPrivacidadService {

  async generate(data: AvisoPrivacidadData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    this.drawDocument(doc, data);
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`AvisoPrivacidad_${today}.pdf`);
  }

  private drawDocument(doc: jsPDF, data: AvisoPrivacidadData): void {
    const lm = 25;
    const pw = 210 - lm - 25;
    const lineH = 4.5;
    const fs = 10;
    const BOLD = 'INTEC DE JALISCO S.A. DE C.V.';

    // ---- Título ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(20, 20, 20);
    doc.text('AVISO DE PRIVACIDAD', 105, 15, { align: 'center' });

    let y = 28;

    const paragraphs = [
      'Dando cumplimiento a la Ley Federal de Protección de Datos Personales en Posesión de Particulares se pone a su disposición el presente Aviso de Privacidad.',
      'INTEC DE JALISCO S.A. DE C.V. es responsable de recabar sus datos personales, del uso que se le dé cuando estén bajo su custodia y de su protección. Dichos datos serán incorporados a bases de datos donde se han instrumentado todas las medidas de seguridad, administrativas, técnicas y físicas para proteger la información.',
      'La información personal que se recabe y que se tenga en nuestros archivos, como puede ser nombre, domicilio, correo electrónico, fecha de nacimiento, currículo vitae, número telefónico, número de cédula profesional, entre otros, se tiene y resguarda con el fin de cumplir obligaciones legales, proporcionarle información y servicios para promover actividades culturales y comerciales que pudieran interesarle. Para lo anterior, Usted ratifica que los datos personales con que contamos, aún datos sensibles pueden ser utilizados para los fines anteriormente descritos.',
      'Asimismo, Usted autoriza para que sus datos personales y aún los datos sensibles puedan ser transferidos a terceras personas para que sean resguardados o bien para proporcionarle información de productos y/o servicios siempre y cuando sean lícitos en México y el Extranjero. Si Usted no manifiesta oposición para que sus datos sean transferidos, se entenderá que ha otorgado su consentimiento.',
      'Usted tiene derecho de acceder, rectificar y cancelar sus datos personales, así como de oponerse al tratamiento de los mismos o revocar el consentimiento que para tal fin se hayan otorgado, a través de los procedimientos que se han implementado. Para conocer los procedimientos, los requisitos y plazos, deberá de ponerse en contacto con INTEC DE JALISCO S.A. DE C.V.',
      'Usted cuenta con el término de 60 días hábiles, posterior a la firma de este aviso para expresar por escrito su consentimiento o rechazo respecto al tratamiento que se dará a sus datos personales y aún los sensibles. En caso de no recibir en dicho plazo, el consentimiento o rechazo, se considerará que ha manifestado su consentimiento para ello, en el entendido que no es posible rechazar el tratamiento cuando se trate de cumplimiento de obligaciones legales para INTEC DE JALISCO S.A. DE C.V. Los datos personales y aún los sensibles que estén en poder de esta empresa, se conservarán por el tiempo que sea necesario para cumplir con las obligaciones legales contenidas en la Ley para la Protección de Datos Personales en Posesión de Particulares y demás leyes que apliquen al caso.',
      'En caso de que existan cambios al presente Aviso de Privacidad, el mismo se le hará llegar con oportunidad por medio electrónico, escrito o visual.',
    ];

    doc.setFontSize(fs);
    doc.setTextColor(20, 20, 20);

    for (const para of paragraphs) {
      // Divide el párrafo en segmentos normal/bold según ocurrencias de BOLD
      const segs = this.splitBold(para, BOLD);
      // Construye el texto plano para que jsPDF lo parta en líneas
      const plain = segs.map(s => s.t).join('');
      const lines: string[] = doc.splitTextToSize(plain, pw);
      y = this.drawJustifiedBold(doc, lines, segs, lm, y, pw, lineH, fs);
      y += 3;
    }

    // ---- "EL EMPLEADO" ----
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text('"EL EMPLEADO"', 105, y, { align: 'center' });
    y += 16;

    // ---- Línea de firma ----
    const sigW = 90;
    const sigX = 105 - sigW / 2;
    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(0.2);
    doc.line(sigX, y, sigX + sigW, y);
    y += 6;

    // ---- NOMBRE del empleado ----
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(data.nombre.toUpperCase(), 105, y, { align: 'center' });
    y += 8;

    // ---- Texto de consentimiento ----
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text('Consiento que mis datos personales sean transferidos conforme', 105, y, { align: 'center' });
    y += 5.5;
    doc.text('a los términos y condiciones del presente aviso de privacidad.', 105, y, { align: 'center' });
  }

  // Divide un texto en segmentos marcando como bold las ocurrencias de boldPhrase
  private splitBold(text: string, boldPhrase: string): Seg[] {
    const segs: Seg[] = [];
    let remaining = text;
    while (remaining.length > 0) {
      const idx = remaining.indexOf(boldPhrase);
      if (idx === -1) {
        segs.push({ t: remaining, b: false });
        break;
      }
      if (idx > 0) segs.push({ t: remaining.slice(0, idx), b: false });
      segs.push({ t: boldPhrase, b: true });
      remaining = remaining.slice(idx + boldPhrase.length);
    }
    return segs;
  }

  // Dibuja líneas con justificado, cambiando font a bold para las palabras que pertenecen a segmentos bold.
  // Usa un cursor de caracteres sobre el texto plano para saber si cada palabra es bold.
  private drawJustifiedBold(
    doc: jsPDF, lines: string[], segs: Seg[],
    x: number, y: number, pw: number, lineH: number, fs: number
  ): number {
    // Construir mapa de posición de carácter → bold
    const plain = segs.map(s => s.t).join('');
    const boldMap: boolean[] = new Array(plain.length).fill(false);
    let pos = 0;
    for (const seg of segs) {
      for (let i = 0; i < seg.t.length; i++) {
        boldMap[pos + i] = seg.b;
      }
      pos += seg.t.length;
    }

    let charCursor = 0;

    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      const isLast = li === lines.length - 1;
      const words = line.trim().split(' ');

      // Calcular spaceWidth para justificado
      let spaceWidth: number;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fs);
      if (isLast || words.length <= 1) {
        spaceWidth = doc.getTextWidth(' ');
      } else {
        const lineW = doc.getTextWidth(line.trim());
        spaceWidth = (pw - lineW + doc.getTextWidth(' ') * (words.length - 1)) / (words.length - 1);
      }

      let cx = x;
      for (let wi = 0; wi < words.length; wi++) {
        const word = words[wi];
        // Determinar si esta palabra es bold según su posición en el texto plano
        // Avanzar cursor hasta la primera letra de la palabra (saltando espacios)
        while (charCursor < plain.length && plain[charCursor] === ' ') charCursor++;
        const isBold = charCursor < boldMap.length && boldMap[charCursor];

        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setFontSize(fs);
        doc.text(word, cx, y);
        cx += doc.getTextWidth(word) + spaceWidth;
        charCursor += word.length;
      }
      // Al final de línea jsPDF omite el espacio, avanzamos uno si no es la última
      if (!isLast) charCursor += 1;

      y += lineH;
    }
    return y;
  }
}
