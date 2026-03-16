import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface ContratoTiempoDeterminadoData {
  // Encabezado / fecha
  ciudad: string;
  dia: string;
  mes: string;
  anio: string;
  // Datos personales
  nombreEmpleado: string;
  sexo: string;
  edad: string;
  nacionalidad: string;
  claveElector: string;
  calle: string;
  numero: string;
  ext: string;
  colonia: string;
  cp: string;
  lugarNacimiento: string;
  diaNacimiento: string;
  mesNacimiento: string;
  anioNacimiento: string;
  nss: string;
  rfc: string;
  curp: string;
  // Trabajo
  puesto: string;
  diasPrueba: string;
  diaInicioContrato: string;
  mesInicioContrato: string;
  anioInicioContrato: string;
  diaFinContrato: string;
  mesFinContrato: string;
  anioFinContrato: string;
  // Horario (CUARTA)
  horaInicioLV: string;
  horaFinLV: string;
  horaInicioSab: string;
  horaFinSab: string;
  // Salario (QUINTA)
  salarioNum: string;
  salarioLetras: string;
  // Beneficiarios
  benNombre1: string;
  benParentesco1: string;
  benPorcentaje1: string;
  benNombre2: string;
  benParentesco2: string;
  benPorcentaje2: string;
  benNombre3: string;
  benParentesco3: string;
  benPorcentaje3: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportContratoTiempoDeterminadoService {

  async generate(data: ContratoTiempoDeterminadoData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    this.drawDocument(doc, data);

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`ContratoTiempoDeterminado_${today}.pdf`);
  }

  // ─── constants ─────────────────────────────────────────────────────────────

  private readonly PAGE_BOTTOM = 272;

  // ─── helpers ───────────────────────────────────────────────────────────────

  private checkPageBreak(doc: jsPDF, y: number, lm: number): number {
    if (y > this.PAGE_BOTTOM) {
      doc.addPage();
      this.drawPageHeader(doc);
      return 28;
    }
    return y;
  }

  private drawPageHeader(doc: jsPDF): void {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text('CONTRATO INDIVIDUAL DE TRABAJO', 105, 13, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
  }

  private drawDocument(doc: jsPDF, data: ContratoTiempoDeterminadoData): void {
    const lm = 18;
    const pw = 210 - lm - 18;
    const lh = 6;
    const fs = 10;

    this.drawPageHeader(doc);
    let y = 26;
    doc.setTextColor(20, 20, 20);

    // ── Párrafo introductorio ───────────────────────────────────────────────
    const introSegs = [
      { t: 'CONTRATO INDIVIDUAL DE TRABAJO POR TIEMPO DETERMINADO, SUJETO A PRUEBA', b: true },
      { t: ', que se celebran por una parte la empresa ', b: false },
      { t: 'INTEC DE JALISCO SA DE CV.', b: true },
      { t: ', a quien en lo sucesivo se le denominara como ', b: false },
      { t: '"LA EMPRESA Y/O EL PATRON"', b: true },
      { t: ' y por la otra ', b: false },
      { t: data.nombreEmpleado.toUpperCase(), b: true },
      { t: ' por su propio derecho, a quien se le denominará ', b: false },
      { t: '"EL EMPLEADO Y/O EL TRABAJADOR"', b: true },
      { t: ', mismos que se sujetan a las cláusulas que van precedidas de las siguientes declaraciones.', b: false },
    ];
    y = this.drawInlineSegs(doc, introSegs, lm, y, pw, lh, fs);
    y += 4;

    // ── I. Declara INTEC ────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const p1segs = [
      { t: 'I.- ', b: true },
      { t: 'Declara ', b: false },
      { t: 'INTEC DE JALISCO SA DE CV.', b: true },
      { t: ', que es una sociedad constituida conforme a las leyes de la República Mexicana, con domicilio en ', b: false },
      { t: 'Misioneros #2138, Jardines del Country. C.P.44210 Guadalajara, Jal.', b: true },
    ];
    y = this.drawInlineSegs(doc, p1segs, lm, y, pw, lh, fs);
    y += 4;

    // ── II. Declara EL EMPLEADO ─────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const p2head = [
      { t: 'II.- ', b: true },
      { t: 'Declara EL EMPLEADO:', b: false },
    ];
    y = this.drawInlineSegs(doc, p2head, lm, y, pw, lh, fs);
    y += 2;

    const pA1 = [
      { t: 'A) Ser de sexo ', b: false },
      { t: data.sexo, b: true },
      { t: ' de nombre ', b: false },
      { t: data.nombreEmpleado.toUpperCase(), b: true },
      { t: ' de ', b: false },
      { t: data.edad, b: true },
      { t: ' años de edad, de nacionalidad ', b: false },
      { t: data.nacionalidad, b: true },
      { t: ' quien se identifica con su credencial para votar expedida por el ', b: false },
      { t: 'INE', b: true },
      { t: ' con número de clave de elector ', b: false },
      { t: data.claveElector, b: true },
      { t: ', tener su domicilio particular en ', b: false },
      { t: data.calle, b: true },
      { t: ' # ', b: false },
      { t: data.numero, b: true },
      { t: ' – ', b: false },
      { t: data.ext, b: true },
      { t: ', ', b: false },
      { t: data.colonia, b: true },
      { t: ', ', b: false },
      { t: 'JALISCO. C.P.', b: true },
      { t: ' ', b: false },
      { t: data.cp, b: true },
      { t: '.', b: false },
    ];
    y = this.drawInlineSegs(doc, pA1, lm, y, pw, lh, fs);

    const pA2 = [
      { t: 'B) Haber nacido en ', b: false },
      { t: data.lugarNacimiento, b: true },
      { t: ' el día ', b: false },
      { t: data.diaNacimiento, b: true },
      { t: ' del mes de ', b: false },
      { t: data.mesNacimiento, b: true },
      { t: ' del año ', b: false },
      { t: data.anioNacimiento, b: true },
      { t: ' con número de seguridad social ', b: false },
      { t: data.nss, b: true },
      { t: '- Registro Federal de Contribuyentes (RFC) ', b: false },
      { t: data.rfc, b: true },
      { t: ', y Clave Única de Registro de Población (CURP) ', b: false },
      { t: data.curp, b: true },
      { t: '.', b: false },
    ];
    y = this.drawInlineSegs(doc, pA2, lm, y, pw, lh, fs);
    y += 3;

    const pB = [
      { t: 'B) Que ha recibido una completa explicación de la naturaleza temporal del trabajo que va a desarrollar y que tiene los conocimientos y aptitudes necesarios para el desarrollo del puesto de "', b: false },
      { t: data.puesto, b: true },
      { t: '", por lo que está conforme en prestar los servicios mediante el contrato ', b: false },
      { t: 'A PRUEBA', b: true },
      { t: ', durante el término de ', b: false },
      { t: data.diasPrueba, b: true },
      { t: ' ', b: false },
      { t: 'DIAS NATURALES', b: true },
      { t: '. En consideración a las declaraciones que anteceden, las partes convienen en las siguientes:', b: false },
    ];
    y = this.drawInlineSegs(doc, pB, lm, y, pw, lh, fs);
    y += 5;

    // ── CLAUSULAS ──────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('CLAUSULAS', 105, y, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    y += 5;

    // ── PRIMERA ────────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const p1c = [
      { t: 'PRIMERA.- ', b: true },
      { t: 'El presente contrato se celebra por ', b: false },
      { t: 'TIEMPO DETERMINADO, SUJETO A PRUEBA', b: true },
      { t: ' a partir de la firma del presente instrumento legal del ', b: false },
      { t: data.diaInicioContrato, b: true },
      { t: '/', b: false },
      { t: data.mesInicioContrato, b: true },
      { t: '/', b: false },
      { t: data.anioInicioContrato, b: true },
      { t: ' al ', b: false },
      { t: data.diaFinContrato, b: true },
      { t: '/', b: false },
      { t: data.mesFinContrato, b: true },
      { t: '/', b: false },
      { t: data.anioFinContrato, b: true },
      { t: ' fecha en la que el trabajador está de acuerdo y sabedor de que a partir de este momento comenzará a generar derechos a cargo de la fuente de trabajo, de acuerdo a la Ley Federal del Trabajo.', b: false },
    ];
    y = this.drawInlineSegs(doc, p1c, lm, y, pw, lh, fs);
    y += 3;

    // ── SEGUNDA ────────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const p2c = [
      { t: 'SEGUNDA. - ', b: true },
      { t: '"EL EMPLEADO"', b: true },
      { t: ', conviene en prestar sus servicios personales subordinados a la ', b: false },
      { t: '"EMPRESA"', b: true },
      { t: ', con el puesto de "', b: false },
      { t: data.puesto, b: true },
      { t: '" sujetándose a la dirección, vigilancia o instrucción que establezca la empresa, así como las políticas, procedimientos y reglamentos de trabajo que tenga establecidos o que en un futuro establezca, reconociendo que dichas normas son parte integrante de las condiciones de trabajo. Esto de conformidad con los artículos 20, 21, 24 y 25 de la Ley Federal del Trabajo.', b: false },
    ];
    y = this.drawInlineSegs(doc, p2c, lm, y, pw, lh, fs);
    y += 3;

    // ── TERCERA (texto fijo) ────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    y = this.drawClause(doc, 'TERCERA.', 'La empresa no tendrá en sus establecimientos trabajos insalubres o peligrosos, según el Reglamento respectivo, trabajos nocturnos industriales o labores peligrosas para menores de dieciséis años de edad y en el caso de que llegare a emplear a menores de edad, lo hará de conformidad con lo dispuesto por los artículos 173 al 180 de la Ley Federal del Trabajo.', lm, y, pw, lh, fs);
    y += 3;

    // ── CUARTA – Jornada ───────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const p4c = [
      { t: 'CUARTA.- ', b: true },
      { t: 'Las partes acuerdan en que el ', b: false },
      { t: '"TRABAJADOR"', b: true },
      { t: ' prestará sus servicios en una jornada laboral de 8 horas diarias, en un horario de ', b: false },
      { t: data.horaInicioLV, b: true },
      { t: ' a ', b: false },
      { t: data.horaFinLV, b: true },
      { t: ' horas de Lunes a Viernes y de ', b: false },
      { t: data.horaInicioSab, b: true },
      { t: ' a ', b: false },
      { t: data.horaFinSab, b: true },
      { t: ' horas los días Sábados, descansando los días Domingos de cada semana; haciendo un total de 48 horas a la semana. Con fundamento en el artículo 59 de la Ley, las partes podrán fijar las modalidades que consideren convenientes con objeto de distribuir la jornada a que se refiere la presente cláusula. Estos horarios pueden cambiar dependiendo la necesidad de ', b: false },
      { t: '"EL PATRÓN,"', b: true },
      { t: ' respetando siempre los máximos legales de la jornada. Consecuentemente el ', b: false },
      { t: '"TRABAJADOR"', b: true },
      { t: ' iniciará puntualmente sus labores en el sitio o lugar de trabajo que se le haya asignado.', b: false },
    ];
    y = this.drawInlineSegs(doc, p4c, lm, y, pw, lh, fs);
    y += 3;

    // Continuación CUARTA – horas extras
    y = this.checkPageBreak(doc, y, lm);
    const p4extra = [
      { t: '"EL TRABAJADOR"', b: true },
      { t: ' no podrá laborar jornada de trabajo extraordinaria alguna sino es mediante autorización expresa por escrito y firmado por el "EL PATRÓN" y sin este requisito no le será reconocido ningún trabajo extraordinario y en consecuencia ', b: false },
      { t: '"EL PATRÓN"', b: true },
      { t: ' no tendrá obligación de pagar cantidad alguna por concepto de horas extras, de lo anterior EL TRABAJADOR en este acto manifiesta estar plenamente sabedor de tal instrucción y manifiesta su conformidad y obligación de respetar, por lo que en este acto de violentar esta política laboral de la empresa el trabajador de forma adelantada se desiste del derecho de reclamar al patrón por el pago de aquellas horas que trabaje por su propia cuenta y voluntad ya que como ha quedado asentado y acordado por ambas partes sin la autorización y/o petición expresa por parte de EL PATRON de que labore horas extras no serán reconocidas ni exigibles por el TRABAJADOR, materializando su aceptación con la firma al calce y al margen del presente instrumento legal como debida constancia.', b: false },
    ];
    y = this.drawInlineSegs(doc, p4extra, lm, y, pw, lh, fs);
    y += 3;

    // ── QUINTA – Salario ───────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const p5 = [
      { t: 'QUINTA.-', b: true },
      { t: ' Como remuneración por sus servicios, el ', b: false },
      { t: '"TRABAJADOR"', b: true },
      { t: ' recibirá la cantidad de ', b: false },
      { t: `$${data.salarioNum}`, b: true },
      { t: ' (', b: false },
      { t: data.salarioLetras.toUpperCase(), b: true },
      { t: ' pesos 00/100 M.N.) de sueldo, cuyo pago será hecho por semanas vencidas, conviniendo las partes en que el salario mencionado en la presente cláusula incluye el importe de la parte proporcional del séptimo día y el pago de los días de descanso obligatorio. Ello conforme a lo dispuesto por los artículos 100 y 101 de la Ley Federal del Trabajo.', b: false },
    ];
    y = this.drawInlineSegs(doc, p5, lm, y, pw, lh, fs);
    y += 3;

    // ── Cláusulas fijas SEXTA–DÉCIMA TERCERA ──────────────────────────────
    const clausulasFijas = [
      {
        num: 'SEXTA.',
        text: 'El "PATRÓN" se obliga a otorgar recibo por la totalidad de los salarios ordinarios y extraordinarios devengados a que tuviese derecho hasta la fecha del recibo correspondiente, por lo que, si el "TRABAJADOR" tuviese alguna aclaración que hacer sobre sus salarios en el momento de recibirlos, deberá hacerlo precisamente en ese momento, pues no se admitirá aclaración alguna una vez firmado el recibo respectivo.'
      },
      {
        num: 'SÉPTIMA.',
        text: 'El "TRABAJADOR" disfrutará de un día de descanso por cada seis de trabajo. En los casos en que el "PATRÓN" señale días de descanso que no coincidan con el día domingo, se obliga a pagar al "TRABAJADOR" la prima a que se refiere el artículo 71 de la Ley, durante el tiempo que el "TRABAJADOR" labore en día domingo. El "PATRÓN" se obliga a proporcionar al "TRABAJADOR" los días de descanso obligatorio que establece la Ley Federal del Trabajo y que coincidan con la duración del presente Contrato, de acuerdo a lo dispuesto por el artículo 74 de la Ley Federal del Trabajo.'
      },
      {
        num: 'OCTAVA.',
        text: '"EL TRABAJADOR" tendrá derecho al pago de la parte proporcional de vacaciones al tiempo de servicios prestados, con una prima del 25% sobre los salarios correspondientes a la misma, teniendo en cuenta el término de la relación de trabajo, con arreglo a lo dispuesto en los artículos 76, 77 y 80 de la Ley Federal del Trabajo.'
      },
      {
        num: 'NOVENA.',
        text: '"EL TRABAJADOR" percibirá un aguinaldo anual, que deberá pagarse antes del veinte de diciembre, equivalente a 15 días de salario por lo menos y cuando no haya cumplido el año de servicios, tendrá derecho a que se le pague la parte proporcional al tiempo trabajado, de conformidad con lo dispuesto por el artículo 87 de la Ley Federal del Trabajo.'
      },
      {
        num: 'DÉCIMA.',
        text: '"EL TRABAJADOR" conviene en someterse a los reconocimientos médicos que periódicamente ordene el patrón en los términos de la fracción X del artículo 134 de la Ley Federal del Trabajo, en la inteligencia de que el médico que los practique será designado y retribuido por "EL PATRÓN".'
      },
      {
        num: 'DÉCIMA PRIMERA.',
        text: '"EL PATRÓN" inscribirá oportunamente al "TRABAJADOR" ante el Instituto Mexicano del Seguro Social, obligándose "EL TRABAJADOR" a permitir que "EL PATRÓN" le haga los descuentos a su salario que sean necesarios y que tengan por objeto cubrir la cuota obrera ante el Instituto Mexicano del Seguro Social. Ambas partes se comprometen a cumplir con todo lo relativo a la Ley del Seguro Social y sus Reglamentos.'
      },
      {
        num: 'DÉCIMA SEGUNDA.',
        text: 'Las partes convienen en que, al término del plazo pactado en el presente contrato, quedará terminada automáticamente la relación contractual, sin necesidad de aviso, ni de ningún otro requisito y cesarán todos sus efectos, de acuerdo con la fracción I del artículo 53 de la Ley Federal del Trabajo.'
      },
      {
        num: 'DÉCIMA TERCERA.',
        text: 'Los cambios de puesto y modificaciones de sueldo por promociones, serán consignados en los anexos del presente contrato que al efecto se formule, debiendo recibir el "EMPLEADO", la copia para que el original archive en el expediente personal y formar parte del mismo.'
      },
    ];

    for (const cl of clausulasFijas) {
      y = this.checkPageBreak(doc, y, lm);
      y = this.drawClause(doc, cl.num, cl.text, lm, y, pw, lh, fs);
      y += 3;
    }

    // ── Duplicado ciudad ───────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const pDup = [
      { t: 'Duplicado en la ciudad de ', b: false },
      { t: data.ciudad, b: true },
      { t: ', JALISCO el día ', b: false },
      { t: data.dia, b: true },
      { t: ' del mes de ', b: false },
      { t: data.mes, b: true },
      { t: ' del año ', b: false },
      { t: data.anio, b: true },
      { t: ', quedando un ejemplar en poder de cada una de las partes.', b: false },
    ];
    y = this.drawInlineSegs(doc, pDup, lm, y, pw, lh, fs);
    y += 3;

    // ── DÉCIMA QUINTA – Beneficiarios ──────────────────────────────────────
    y = this.checkPageBreak(doc, y, lm);
    const d15segs = [
      { t: 'DECIMA QUINTA. ', b: true },
      { t: 'El trabajador designa para el pago de salarios y prestaciones devengadas, dando cumplimiento con lo establecido en el artículo 25 fracción X a los siguientes beneficiarios y sus porcentajes:', b: false },
    ];
    y = this.drawInlineSegs(doc, d15segs, lm, y, pw, lh, fs);
    y += 4;

    // Tabla beneficiarios
    y = this.checkPageBreak(doc, y + 28, lm);
    const orange: [number, number, number] = [245, 133, 37];
    const colW = [90, 45, pw - 90 - 45];
    const hdrH = 6;
    const rowH = 7;

    const hdrs = ['NOMBRE', 'PARENTESCO', 'PORCENTAJE'];
    let cx = lm;
    for (let i = 0; i < 3; i++) {
      doc.setFillColor(orange[0], orange[1], orange[2]);
      doc.setDrawColor(200, 100, 0);
      doc.setLineWidth(0.3);
      doc.rect(cx, y, colW[i], hdrH, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(255, 255, 255);
      doc.text(hdrs[i], cx + colW[i] / 2, y + hdrH / 2 + 1.5, { align: 'center' });
      cx += colW[i];
    }
    y += hdrH;

    const bens = [
      [data.benNombre1, data.benParentesco1, data.benPorcentaje1],
      [data.benNombre2, data.benParentesco2, data.benPorcentaje2],
      [data.benNombre3, data.benParentesco3, data.benPorcentaje3],
    ];

    for (const row of bens) {
      cx = lm;
      for (let i = 0; i < 3; i++) {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.rect(cx, y, colW[i], rowH, 'FD');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(20, 20, 20);
        doc.text(row[i] ?? '', cx + 2, y + rowH / 2 + 1.5);
        cx += colW[i];
      }
      y += rowH;
    }

    y += 12;

    // ── Firmas ─────────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y + 30, lm);
    const sigW = 70;
    const leftSigX = lm + 10;
    const rightSigX = 210 - 18 - 10 - sigW;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text('TRABAJADOR', leftSigX + sigW / 2, y, { align: 'center' });
    doc.text('PATRÓN', rightSigX + sigW / 2, y, { align: 'center' });
    y += 14;
    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(0.3);
    doc.line(leftSigX, y, leftSigX + sigW, y);
    doc.line(rightSigX, y, rightSigX + sigW, y);
    y += 10;

    doc.text('TESTIGO', leftSigX + sigW / 2, y, { align: 'center' });
    doc.text('TESTIGO', rightSigX + sigW / 2, y, { align: 'center' });
    y += 14;
    doc.line(leftSigX, y, leftSigX + sigW, y);
    doc.line(rightSigX, y, rightSigX + sigW, y);
  }

  // ─── Clause renderer: bold number inline + justified text, with page breaks ─

  private drawClause(
    doc: jsPDF, num: string, text: string,
    lm: number, y: number, pw: number, lh: number, fs: number
  ): number {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.setTextColor(20, 20, 20);
    const numStr = num + ' ';
    const numW = doc.getTextWidth(numStr);

    doc.setFont('helvetica', 'normal');
    const firstLineArr = doc.splitTextToSize(text, pw - numW);
    const firstLine = firstLineArr[0] ?? '';
    const firstLineWords = firstLine.trim().split(/\s+/);
    const allWords = text.split(/\s+/);
    const remainingWords = allWords.slice(firstLineWords.length);
    const remainingText = remainingWords.join(' ');
    const restLines = remainingText.length > 0 ? doc.splitTextToSize(remainingText, pw) : [];

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.text(numStr, lm, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fs);
    const firstLineW = pw - numW;
    const firstWords = firstLine.trim().split(' ');
    if (firstWords.length > 1 && restLines.length > 0) {
      const lw = doc.getTextWidth(firstLine.trim());
      const sp = (firstLineW - lw + doc.getTextWidth(' ') * (firstWords.length - 1)) / (firstWords.length - 1);
      let cx = lm + numW;
      for (const word of firstWords) {
        doc.text(word, cx, y);
        cx += doc.getTextWidth(word) + sp;
      }
    } else {
      doc.text(firstLine, lm + numW, y);
    }
    y += lh;

    for (let i = 0; i < restLines.length; i++) {
      y = this.checkPageBreak(doc, y, lm);
      const line = restLines[i];
      const isLast = i === restLines.length - 1;
      const words = line.trim().split(' ');
      if (isLast || words.length <= 1) {
        doc.text(line, lm, y);
      } else {
        const lw = doc.getTextWidth(line.trim());
        const sp = (pw - lw + doc.getTextWidth(' ') * (words.length - 1)) / (words.length - 1);
        let cx = lm;
        for (const word of words) {
          doc.text(word, cx, y);
          cx += doc.getTextWidth(word) + sp;
        }
      }
      y += lh;
    }
    return y;
  }

  // ─── Inline segments renderer (justified, bold-aware, with page breaks) ────

  private drawInlineSegs(
    doc: jsPDF,
    segs: { t: string; b: boolean }[],
    lm: number, y: number, pw: number, lh: number, fs: number
  ): number {
    const plain = segs.map(s => s.t).join('');
    const boldMap: boolean[] = [];
    for (const seg of segs) {
      for (let i = 0; i < seg.t.length; i++) boldMap.push(seg.b);
    }

    const lines: string[] = doc.splitTextToSize(plain, pw);
    let charCursor = 0;

    for (let li = 0; li < lines.length; li++) {
      y = this.checkPageBreak(doc, y, lm);
      const line = lines[li];
      const isLast = li === lines.length - 1;
      const words = line.trim().split(' ');

      // Determine bold and measure each word with its correct font
      const wordMeta: { w: string; bold: boolean; width: number }[] = [];
      let tmpCursor = charCursor;
      for (const word of words) {
        while (tmpCursor < plain.length && plain[tmpCursor] === ' ') tmpCursor++;
        const isBold = tmpCursor < boldMap.length && boldMap[tmpCursor];
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setFontSize(fs);
        wordMeta.push({ w: word, bold: isBold, width: doc.getTextWidth(word) });
        tmpCursor += word.length;
      }

      // Calculate space width using real word widths
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(fs);
      const naturalSpaceW = doc.getTextWidth(' ');
      let spaceW: number;
      if (isLast || words.length <= 1) {
        spaceW = naturalSpaceW;
      } else {
        const totalWordsW = wordMeta.reduce((s, m) => s + m.width, 0);
        spaceW = (pw - totalWordsW) / (words.length - 1);
      }

      let cx = lm;
      for (const meta of wordMeta) {
        while (charCursor < plain.length && plain[charCursor] === ' ') charCursor++;
        doc.setFont('helvetica', meta.bold ? 'bold' : 'normal');
        doc.setFontSize(fs);
        doc.setTextColor(20, 20, 20);
        doc.text(meta.w, cx, y);
        cx += meta.width + spaceW;
        charCursor += meta.w.length;
      }
      if (!isLast) charCursor += 1;
      y += lh;
    }
    return y;
  }
}
