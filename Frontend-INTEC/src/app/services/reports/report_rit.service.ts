import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export interface RitData {
  lugar: string;
  dia: string;
  mes: string;
  anio: string;
  nombreTrabajador: string;
  nombreRepresentante: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportRitService {

  async generate(data: RitData): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    this.drawDocument(doc, data);

    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    doc.save(`RIT_${today}.pdf`);
  }

  // ── Layout constants ────────────────────────────────────────────────────────
  private readonly LM = 20;
  private readonly PW = 170;
  private readonly FS = 8.5;
  private readonly LH = 5;
  private readonly PAGE_BOTTOM = 282;
  private readonly PAGE_TOP = 14;

  // ── Pagination ──────────────────────────────────────────────────────────────
  private checkPageBreak(doc: jsPDF, y: number, needed = 0): number {
    if (y + needed > this.PAGE_BOTTOM) {
      this.pageFooter(doc);
      doc.addPage();
      return this.PAGE_TOP;
    }
    return y;
  }

  private pageFooter(doc: jsPDF): void {
    const pageH = 297;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(20, 20, 20);
    doc.text('RIT', this.LM, pageH - 8);
    doc.text('INTEC DE JALISCO S.A. DE C.V.', 190, pageH - 8, { align: 'right' });
  }

  // ── Text helpers ────────────────────────────────────────────────────────────
  private drawJustified(doc: jsPDF, lines: string[], x: number, y: number, pw: number): number {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(this.FS);
    doc.setTextColor(20, 20, 20);
    for (let i = 0; i < lines.length; i++) {
      y = this.checkPageBreak(doc, y, this.LH);
      const line = lines[i];
      const isLast = i === lines.length - 1;
      const words = line.trim().split(' ');
      if (isLast || words.length <= 1) {
        doc.text(line, x, y);
      } else {
        const lw = doc.getTextWidth(line.trim());
        const sp = (pw - lw + doc.getTextWidth(' ') * (words.length - 1)) / (words.length - 1);
        let cx = x;
        for (const word of words) {
          doc.text(word, cx, y);
          cx += doc.getTextWidth(word) + sp;
        }
      }
      y += this.LH;
    }
    return y;
  }

  private drawCenter(doc: jsPDF, text: string, y: number, fs: number): void {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(fs);
    doc.setTextColor(20, 20, 20);
    doc.text(text, 105, y, { align: 'center' });
  }

  private drawBoldLeft(doc: jsPDF, text: string, x: number, y: number): void {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(this.FS);
    doc.setTextColor(20, 20, 20);
    doc.text(text, x, y);
  }

  /** Renders bold article number inline + justified body. Handles page breaks. */
  private drawArticle(doc: jsPDF, title: string, body: string, y: number): number {
    const full = title + body;
    const lines = doc.splitTextToSize(full, this.PW);

    for (let i = 0; i < lines.length; i++) {
      y = this.checkPageBreak(doc, y, this.LH);
      const line = lines[i];
      const isLast = i === lines.length - 1;
      const words = line.trim().split(' ');

      if (i === 0) {
        // First line: bold prefix up to title.length, rest normal
        const boldPart = line.substring(0, Math.min(title.length, line.length));
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(this.FS);
        doc.setTextColor(20, 20, 20);
        const boldW = doc.getTextWidth(boldPart);

        if (!isLast && words.length > 1 && line.length > title.length) {
          // Justify first line with mixed bold/normal
          // Measure each word with its correct font
          const wordMeta: { w: string; bold: boolean; width: number }[] = [];
          let charPos = 0;
          for (const word of words) {
            const isBold = charPos < title.length;
            doc.setFont('helvetica', isBold ? 'bold' : 'normal');
            doc.setFontSize(this.FS);
            wordMeta.push({ w: word, bold: isBold, width: doc.getTextWidth(word) });
            charPos += word.length + 1;
          }
          const totalW = wordMeta.reduce((s, m) => s + m.width, 0);
          const sp = (this.PW - totalW) / (words.length - 1);
          let cx = this.LM;
          for (const wm of wordMeta) {
            doc.setFont('helvetica', wm.bold ? 'bold' : 'normal');
            doc.setFontSize(this.FS);
            doc.text(wm.w, cx, y);
            cx += wm.width + sp;
          }
        } else {
          // Last line or single word: left align with bold prefix
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(this.FS);
          doc.text(boldPart, this.LM, y);
          if (line.length > title.length) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(this.FS);
            doc.text(line.substring(title.length), this.LM + boldW, y);
          }
        }
      } else {
        // Continuation lines: fully normal justified
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(this.FS);
        if (isLast || words.length <= 1) {
          doc.text(line, this.LM, y);
        } else {
          const lw = doc.getTextWidth(line.trim());
          const sp = (this.PW - lw + doc.getTextWidth(' ') * (words.length - 1)) / (words.length - 1);
          let cx = this.LM;
          for (const word of words) {
            doc.text(word, cx, y);
            cx += doc.getTextWidth(word) + sp;
          }
        }
      }
      y += this.LH;
    }
    return y;
  }

  /** Renders indented list item with justification. */
  private drawItem(doc: jsPDF, text: string, indent: number, y: number): number {
    const iw = this.PW - indent;
    const lines = doc.splitTextToSize(text, iw);
    return this.drawJustified(doc, lines, this.LM + indent, y, iw);
  }

  // ── Main document ───────────────────────────────────────────────────────────
  private drawDocument(doc: jsPDF, data: RitData): void {
    let y = this.PAGE_TOP;
    doc.setTextColor(20, 20, 20);

    // ── Encabezado ────────────────────────────────────────────────────────────
    this.drawCenter(doc, 'INTEC DE JALISCO, S.A. DE C.V.', y, 10); y += 6;
    this.drawCenter(doc, 'REGLAMENTO INTERIOR DE TRABAJO', y, 10); y += 10;

    // ── CAPÍTULO I ────────────────────────────────────────────────────────────
    this.drawCenter(doc, 'CAPITULO I', y, 9); y += 6;
    this.drawBoldLeft(doc, 'DISPOSICIONES GENERALES.', this.LM, y); y += this.LH + 1;

    y = this.drawArticle(doc, 'ARTICULO 1.- ', 'Este Reglamento Interior de Trabajo (RIT) es de observancia general, para todo el personal, que labore para Intec de Jalisco, S.A. de C.V. Con la actividad de construcción, proyección, dirección, planeación, cimentación, edificación, estructura, ejecución, instalación, reparación y administración de toda clase de obras de ingeniería en general, cableado, estructurado, fibra óptica y redes de comunicación en general, proporcionar o recibir toda clase de servicios profesionales, técnicos, administrativos o de supervisión, contratación y subcontratación para el cumplimiento de los fines mencionados.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 2.- ', 'Todo trabajador y Personal que ingrese a las instalaciones están obligados a cumplir las disposiciones de carácter técnico, administrativo, operativo, o de seguridad que la empresa, mediante sus representantes considere necesarias para la optimización en la realización de sus actividades. Será facultad de la empresa el modificarlas o reformarlas, de acuerdo a sus necesidades en forma verbal o escrita.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 3. \u2013 ', 'Además de las normas que establece este reglamento y de las órdenes que emanan de los superiores inmediatos, todo el personal queda obligado a enterarse y acatar las disposiciones y órdenes que la empresa dicte por escrito y que se publiquen.', y);
    y = this.drawJustified(doc, doc.splitTextToSize('Cualquier desatención de las disposiciones contenidas en los avisos que hayan sido publicados será considerada como desobediencia a una orden relativa de trabajo.', this.PW), this.LM, y, this.PW); y += 3;

    // ── CAPÍTULO II ───────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, 12);
    this.drawCenter(doc, 'CAPITULO II', y, 9); y += 5;
    this.drawBoldLeft(doc, 'JORNADAS DE TRABAJO.', this.LM, y); y += this.LH + 1;

    y = this.drawArticle(doc, 'ARTICULO 4.- ', 'El trabajador deberá sujetarse a las jornadas de trabajo de conformidad con lo establecido con la Ley Federal del Trabajo (LFT), estas estarán sujetas al horario que se requiera según su puesto y área, teniendo para comer de 60 min. y la cual también se establecerá con su jefe inmediato.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 5.- ', 'La empresa podrá modificar las horas de entrada, así como los turnos y el lugar de trabajo cuando lo considere necesario, reportándolo al trabajador por escrito, con 24 horas de anticipación por lo menos. Por la naturaleza y el giro en que se desempeñan este podrá reducirse a 12hrs de anticipación.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 6.- ', 'Por tener proceso continuo, por necesidades de la empresa y con base a los Art. 69 y 70 de la LFT, el día de descanso se determinará de común acuerdo, en función de las programaciones que el mercado y/o el cliente requiere, pudiendo ser cualquier día de la semana. Este será de preferencia en domingo.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 7.- ', 'Cuando el trabajador preste sus servicios en domingo, en base al Art. 71 de la LFT, tendrá derecho a una prima adicional del 25% sobre el salario de un día ordinario de trabajo, siempre y cuando trabaje turno completo en revisión art 71. En caso de trabajar solo algunas horas, entre las 0:00 y las 24 hrs. del domingo, se pagará parte proporcional.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 8.- ', 'Cuando un trabajador labore su día de descanso, recibirá según el Art. 73 de la LFT, un salario doble independiente al salario correspondiente por el 7º. Día.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 9.- ', 'Se considera tiempo extraordinario el que rebase la jornada normal semanal, (los descansos laborados NO son tiempo extra) previa solicitud y autorización de laborarlo por parte del jefe inmediato superior.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 10.- ', 'Cuando se trabaja el día de descanso, las horas normales de jornada NO se contabilizan como tiempo extra, sino como descanso laborado. Si por necesidades se excede la jornada, el tiempo de más, si se contabiliza como tiempo extra. (Si una persona trabaja en su descanso, un turno según el artículo III, su pago seria, sino hubo ausencia en la semana, de 6 + 1 días, mas 2 días por descanso laborado, pero si labora un turno más 2hrs. extras, su pago sería, si no hubo faltas, de 6 + 1 días, más 2 días por descanso laborado, más 2hrs. extras)', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 11.- ', 'El pago de tiempo extraordinario se sujetará a lo determinado en la LFT en Arts. 61, 65, 66, 67, y 68 y con las siguientes reglas:', y);
    y = this.drawItem(doc, 'A.   Se considera tiempo extraordinario únicamente, el que aparezca checado de acuerdo a los artículos 12,13,14 y 15 del presente reglamento y que además sea autorizado, con la firma del jefe de área o de quien sea designado por éste.', 8, y);
    y = this.drawItem(doc, 'B.   Para efectos de pago en la nómina se computará el tiempo normal y extraordinario de Jueves a Miercoles.', 8, y); y += 3;

    // ── CAPÍTULO III ──────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, 12);
    this.drawCenter(doc, 'CAPITULO III', y, 9); y += 5;
    this.drawBoldLeft(doc, 'PUNTUALIDAD Y ASISTENCIA.', this.LM, y); y += this.LH + 1;

    y = this.drawArticle(doc, 'ARTICULO 12.\u2013 ', 'La justificación y comprobación de la asistencia y puntualidad de los trabajadores y empleados a sus labores se harán a través de una lista de asistencia, donde el trabajador registrará sus horarios de entrada y de salida, así como al salir y/o regresar de comida por escrito. Dicho registro deberá de ser personalmente a puño y letra por el trabajador o empleado al iniciar y terminar cada turno de trabajo, así como al salir y/o regresar de comida  teniendo estrictamente prohibido hacerlo otra persona por él.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 13.- ', 'Los salarios, así como las horas extras, serán cubiertos a los trabajadores y empleados de acuerdo a los días y tiempo trabajados que aparezcan en el reporte de incidencias semanal. Y de cuyo importe se harán las deducciones legales que correspondan.', y);
    y = this.drawJustified(doc, doc.splitTextToSize('Cualquier reclamación de salarios, por error de cálculo deberá hacerse de inmediato antes de firmar de conformidad el recibo de nómina correspondiente.', this.PW), this.LM, y, this.PW); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 14.- ', 'Si por alguna causa extraordinaria, no fuera posible registrarse en la bitácora, será obligación del trabajador dar aviso por escrito de su horario de entrada y salida, debiendo validar mediante una firma de su jefe inmediato.', y); y += 2;
    y = this.drawArticle(doc, 'ARTIUCLO 15.- ', 'Los trabajadores estarán obligados al finalizar la semana que hayan laborado, a firmar su recibo de nómina, para sustentar sus registros de horario y los pagos efectuados.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 16.- ', 'Se contará con los registros de cada trabajador en casos de inspección por alguna autoridad gubernamental que lo requiera, y para asuntos jurídicos federales o estatales, comprobando con esto la asistencia y puntualidad de los trabajadores.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 17.- ', 'La hora marcada como inicio debe darse en el área de trabajo, por lo que todo trabajador tiene la obligación de iniciar labores a la hora y en el lugar indicado, sólo podrá retirarse con la autorización de su jefe inmediato.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 18.- ', 'El registro, tanto al inicio como al final de la jornada, debe hacerse con uniforme y EPP, por lo que el trabajador debe considerar el tiempo necesario para cambiarse y/o asearse, principalmente al iniciar labores y así evitar retardos. Toda checada encimada, doble o mal hecha se considerará retardo. Si la lista de asistencia no se encuentra, reportar al jefe inmediato. El no registrar a la entrada y/o salida, tanto al inicio y final de turno, como al salir y/o regresar de comida, será motivo de suspensión.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 19.- ', 'El trabajador tiene derecho, dentro de su jornada continua a tomar sus alimentos (incluye calentar, lavar, etc.) en un periodo de solamente 60 minutos en la jornada. Este tiempo será asignado con el jefe inmediato en el momento que lo permitan las necesidades.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 20.- ', 'El trabajador también está obligado a registrar, su ingreso y su salida a ingerir sus alimentos, con el fin de computar el tiempo establecido. Todo tiempo excedente será considerado como retardo y recibirá la sanción correspondiente.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 21.- ', 'Al iniciar la jornada si el trabajador llega con 1 a 9 minutos de retardo, checará e iniciara sus labores, en el entendido que ha acumulado un retardo. Si el retardo es mayor a 10 minutos, deberá presentarse con su jefe inmediato superior, a fin de obtener autorización para que labore, quien podrá permitirle o no el acceso. Si entra a trabajar tiene retardo y si no, se considerará falta injustificada. Si el retardo es de 30 minutos o más, pierde automáticamente la autorización para trabajar, así mismo perderá el bono.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 22.- ', 'Tres retardos en 30 días o uno solo de 30 minutos, perderá el bono de asistencia y puntualidad.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 23. \u2013 ', 'Será considerado como falta de probidad cualquier mal uso que se haga de la lista de asistencia. Debe entenderse por mal uso:', y);
    y = this.drawItem(doc, 'a)  Marcar o alterar los registros.', 8, y);
    y = this.drawItem(doc, 'b)  Permitir su mal uso en cualquier forma.', 8, y);
    y = this.drawItem(doc, 'c)  En caso de pérdida deberán de notificar al encargado de obra en un plazo no mayor a 24 hrs., la reposición se dará en máximo 24 hrs. y llevará un costo previamente establecido y notificado.', 8, y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 24.- ', 'Durante la jornada de trabajo ningún trabajador o empleado podrá abandonar el lugar de trabajo, ni dejar de ejercer sus labores, si no es con la autorización de su jefe inmediato o del Depto. de Personal.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 25.- ', 'En base al artículo anterior, el trabajador tendrá que contar con el formato establecido, firmado por su jefe inmediato al momento de abandonar su lugar de trabajo.', y); y += 2;
    y = this.drawArticle(doc, 'ARTÍCULO 26.- ', 'Es facultad exclusiva de la empresa otorgar permisos para ausentarse al trabajo siempre y cuando las necesidades y disponibilidades lo permitan, por lo que por ningún motivo es obligatorio otorgar el permiso, aunque se avise con anticipación. Todo permiso es sin goce de sueldo.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 27.- ', 'Las ausencias se clasificarán en:', y); y += 1;

    y = this.drawItem(doc, '1. ENFERMEDAD O ACCIDENTE DE TRABAJO (E) O (A/T).-', 4, y);
    y = this.drawItem(doc, 'a)  Solo es comprobable con incapacidad otorgada por el IMSS. No son válidas recetas de médicos particulares, ni hojas expedidas por el IMSS que no tienen folio ni registro del médico.', 12, y);
    y = this.drawItem(doc, 'b)  En caso de la incapacidad por enfermedad o accidente de trabajo, es obligación del trabajador comunicarse ese mismo día para reportar su ausencia y entregar o enviar la incapacidad a más tardar al día siguiente a su jefe inmediato superior, quien a su vez, ya enterado y habiendo hecho las anotaciones en la hoja de servicio, la enviara a oficinas.', 12, y); y += 1;

    y = this.drawItem(doc, '2. Todo PERMISO CON GOCE de sueldo se sujetará a lo siguiente:', 4, y);
    y = this.drawItem(doc, 'a)  Defunción de padres, esposa (o), o hijos. - Un día con goce de sueldo. Hay que comprobar con copia de acta de defunción en un plazo no mayor de tres días.', 12, y);
    y = this.drawItem(doc, 'b)  Defunción de hermanos y abuelos. - Un día sin goce de sueldo. Comprobación igual al inciso anterior.', 12, y);
    y = this.drawItem(doc, 'c)  Matrimonio. - Dos días con goce de sueldo. Hay que comprobar con copia del acta de matrimonio civil. Sólo se da una vez.', 12, y);
    y = this.drawItem(doc, 'd)  Por nacimiento. - Cinco días con goce de sueldo. Se comprueba con el acta de registro en un periodo no mayor a una semana.', 12, y); y += 1;

    y = this.drawItem(doc, '3. FALTAS CON AVISO (PERMISO). - Sujeto al Art.26', 4, y);
    y = this.drawItem(doc, '4. FALTAS INJUSTIFICADAS (F/I). - Cualquier ausencia que no entre en las descripciones anteriores.', 4, y); y += 1;

    y = this.drawJustified(doc, doc.splitTextToSize('Cuando el trabajador acepte y se comprometa a trabajar su descanso y no asista, se considerará falta injustificada (F/I), salvo que medie justificante o incapacidad.', this.PW), this.LM, y, this.PW); y += 2;

    y = this.drawArticle(doc, 'ARTICULO 28.- ', 'las faltas injustificadas (F/I), además de perder el día, se sancionan con:', y);
    y = this.drawItem(doc, '1ª. Falta   1 día de suspensión sin goce de sueldo y sustento en Amonestación escrita', 4, y);
    y = this.drawItem(doc, '2ª. Falta   Suspensión hasta por cuatro días y sustento en Acta Administrativa', 4, y);
    y = this.drawItem(doc, '3ª. Falta   Suspensión hasta por ocho días y sustento en Acta Administrativa', 4, y);
    y = this.drawItem(doc, '4ª. Falta   Rescisión de Contrato.', 4, y);
    y = this.drawJustified(doc, ['Esto en periodo de 30 días corridos o consecutivos.'], this.LM, y, this.PW);
    y = this.drawJustified(doc, doc.splitTextToSize('Hay un margen de 30 días, a partir de la falta, para la aplicación del castigo correspondiente, después de lo cual ya no se puede aplicar.', this.PW), this.LM, y, this.PW); y += 2;

    y = this.drawArticle(doc, 'ARTICULO 29.- ', 'Las faltas injustificadas que se computen en un periodo de 30 días corridos y excedan de tres serán causal para rescisión de la relación obrero-patronal, en base al Art. 47 fracc. X de la LFT, sin responsabilidad para la empresa.', y); y += 3;

    // ── CAPÍTULO IV ───────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, 12);
    this.drawCenter(doc, 'CAPITULO IV', y, 9); y += 5;
    this.drawBoldLeft(doc, 'VACACIONES', this.LM, y); y += this.LH + 1;

    y = this.drawArticle(doc, 'ARTICULO 30.- ', 'Con el objeto de planear adecuadamente los periodos de vacaciones se estarán sujetos a lo siguiente:', y);
    const vacIncisos = [
      'a)  La Coordinación de Recursos Humanos y/o Administrativa deberá entregar a los jefes de Área los reportes actualizados de vacaciones, para que éstos a su vez elaboren la planeación de las mismas del personal a su cargo.',
      'b)  Es responsabilidad de cada Jefe de Área de entregar dicha programación a Recursos Humanos y/o Administración.',
      'c)  Los trabajadores y empleados deben de ponerse de acuerdo con sus jefes inmediatos para que la decisión de las vacaciones sea en beneficio de ambas partes.',
      'd)  Las vacaciones preferentemente NO podrán tomarse en la semana de Navidad.',
      'e)  Como política de la empresa y como reglamento en la Ley Federal del Trabajo (Art. 76), queda estrictamente prohibido realizar el pago de Vacaciones atrasadas sin que éstas se disfruten. Todo trabajador o empleado debe de disfrutar de sus vacaciones.',
      'f)   Si el trabajador o empleado no goza de sus vacaciones, éstas expirarán después del año. También es responsabilidad del trabajador o empleado de pedir sus vacaciones a su jefe inmediato. Si existe algún problema o negación de parte del jefe, el trabajador o empleado deberá de asistir al departamento Recursos Humanos y/o Administración.',
      'g)  Para que no existan periodos largos sin que sean gozadas las vacaciones se podrán gozar como máximo con seis meses después de haber cumplido el año de servicio en la empresa como lo establece el Art. 81.',
      'h)  El jefe deberá tomar en cuenta para la planeación de las vacaciones las solicitudes de sus colaboradores y en caso de coincidencia de periodos de otro colaborador, se determinará en base a jerarquía y después a la antigüedad.',
      'i)   Se deberá evitar que gocen de vacaciones simultáneamente dos jefes del mismo departamento, o el jefe y alguno de sus colaboradores directos',
      'j)   Si durante el periodo de vacaciones coincide algún día festivo, este día se considerará como adicional a los días solicitados. Pero si en el periodo vacacional el colaborador sufre una enfermedad, y no presenta incapacidad del IMSS, los días de la misma se considerarán como vacaciones devengadas y gozadas.',
      'k)  Con respecto a la prima vacacional del 25%, ésta será pagada automáticamente, cada que el trabajador o empleado disfrute de sus vacaciones.',
    ];
    for (const inc of vacIncisos) {
      y = this.drawItem(doc, inc, 8, y);
    }
    y += 3;

    // ── CAPÍTULO V ────────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, 12);
    this.drawCenter(doc, 'CAPITULO V', y, 9); y += 5;
    this.drawBoldLeft(doc, 'DIAS Y FORMA DE PAGO.', this.LM, y); y += this.LH + 1;

    y = this.drawArticle(doc, 'ARTICULO 31.- ', 'En caso que el trabajador su pago se efectué quincenalmente este se llevarán a cabo los días 15 y ultimo de cada mes, en caso de que el pago de salario al trabajador sea por semana deberá cubrirse el sábado de cada una de ellas.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 32.- ', 'Si algún día de fiesta, feriado o contemplado en la LFT, por calendario se cruzara con un sábado, el pago será el día inmediato anterior o el día que determine la Administración. Se considera días de descanso obligatorio los marcados en la ley federal de trabajo. Se reforma el artículo 74 de la ley Federal del Trabajo, para quedar como sigue, el primero de enero, el primer lunes de febrero en conmemoración del 5 de febrero, el tercer lunes de marzo en conmemoración del 21 de marzo, el 1 ero de mayo, el 16 de septiembre, el tercer lunes de noviembre en conmemoración del 20 de noviembre, el 1ero de diciembre de cada seis años, cuando corresponde a la transmisión del poder ejecutivo federal, el 25 de diciembre y el que determinen las leyes federales y locales electorales, en caso de elecciones ordinarias, para efectuar la jornada electoral', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 33.- ', 'El trabajador deberá firmar personalmente cada semana o quincena según sea su forma de pago, su recibo de nómina. Por ningún motivo se le entregara el recibo de nómina de otra persona.', y);
    y = this.drawJustified(doc, doc.splitTextToSize('El pago de salarios se hará directamente al trabajador y en los casos en que este imposibilitado para efectuar el cobro, el pago se hará a la persona que designe mediante carta poder firmada por dos testigos, según lo establece el Art.100 de la LFT.', this.PW), this.LM, y, this.PW); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 34. \u2013 ', 'Los salarios serán cubiertos a los trabajadores y empleados de acuerdo a los días y tiempo trabajados que aparezcan en la lista de asistencia. Y de cuyo importe se harán las deducciones legales que correspondan.', y);
    y = this.drawJustified(doc, doc.splitTextToSize('Cualquier reclamación por error de cálculo deberá hacerse de inmediato antes de firmar de conformidad el recibo correspondiente', this.PW), this.LM, y, this.PW); y += 3;

    // ── CAPÍTULO VI ───────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, 12);
    this.drawCenter(doc, 'CAPITULO VI', y, 9); y += 5;
    this.drawBoldLeft(doc, 'SEGURIDAD E HIGIENE Y PREVENCION DE LOS RIESGOS DE TRABAJO', this.LM, y); y += this.LH + 1;

    y = this.drawArticle(doc, 'ARTICULO 35.- ', 'Todos los trabajadores deberán avisar a su jefe de cualquier lugar inseguro en el que pudiera ocurrir un accidente, para que sea reparado tan pronto sea conveniente.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 36.- ', 'Al detectar alguna condición y/o lugar inseguro, el trabajador debe reportar esto a la Comisión Mixta de Seguridad e Higiene y/o a su jefe inmediato, para aplicar de inmediato medidas preventivas o correctivas, según sea el caso.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 37.- ', 'El trabajador debe respetar los señalamientos, guardias y protecciones. El bloquear pasillos, trabajar sin protección, o violar las medidas establecidas, será motivo de amonestación, suspensión o separación definitiva según la fracción XII del Art. 47 de la LFT.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 38. \u2013 ', 'Siempre deben de observar las siguientes reglas de seguridad:', y);
    const seg38 = [
      'a)  El trabajador deberá efectuar sus labores, siguiendo las recomendaciones y reglas de seguridad indicadas por la empresa, a través de instructivos, señalamientos o indicaciones, ya sean verbales o escritas por conducto de los jefes o encargados de obra. Es parte de las labores de todo trabajador el aseo y limpieza ya sea de su área o equipo o del que se le solicite. En ambos casos debe quedar limpio y ordenado al final del turno, verificando que no queden restos de materiales que dañen los equipos o herramientas como lo señala el Art 134 de la LFT.',
      'b)  Se debe mantener siempre en condiciones limpias y sanitarias los lavabos y sanitarios.',
      'c)  El trabajador deberá abstenerse de manejar maquinaria que desconozca, así mismo la que no esté autorizado a hacerlo.',
      'd)  En caso de daño a maquinaria, herramienta o material, le será cobrado en su totalidad conforme lo acuerden patrón y trabajador siguiendo lo establecido en el Art. 110 Fracción I de la LFT.',
      'e)  No debe de obstruirse el paso cerca de puertas, pasillos y otros lugares para donde haya mucho tránsito de personas o tipo móvil.',
      'f)   Usar siempre los pasamanos de escaleras y bajarlas despacio.',
      'g)  El trabajador deberá respetar los manuales y las indicaciones de operación de las máquinas y herramientas cuidando siempre el que no se dañen ni ocasionen daño a las personas.',
      'h)  Toda persona acepta sujetarse a revisión aleatoria de sus pertenencias: valijas, portafolio, bolsas, mochilas, bultos, así como el interior y cajuelas de vehículos, etc., por parte del personal de seguridad con el objeto de verificar su contenido. Así mismo la empresa tiene derecho de pedir al personal que muestre el interior y contenido de escritorios y casilleros del centro de trabajo.',
      'i)   Por seguridad NO SE PERMITE trabajar ni utilizar dentro de las instalaciones, audífonos, ipad, tablets, teléfonos celulares, cámaras fotográficas etc.',
      'j)   Todo el personal deberá usar el equipo de seguridad específico para el área y el puesto que desempeña.',
      'k)  El equipo será proporcionado por la empresa y el trabajador se compromete a utilizarlo y mantenerlo en buen estado.',
    ];
    for (const s of seg38) {
      y = this.drawItem(doc, s, 8, y);
    }
    y += 2;

    y = this.drawArticle(doc, 'ARTICULO 39. \u2013 ', 'La comisión mixta de Seguridad e Higiene tiene a su cuidado el estudio y la supervisión continua de todas las operaciones, especialmente peligrosas desde el punto de vista de la Seguridad Industrial, tanto para los trabajadores como para el local en que está situada la obra o empresa.', y);
    y = this.drawJustified(doc, doc.splitTextToSize('Deberá hacerse la inspección mensual, levantar actas de las mismas y sugerir los cambios y mejoras necesarias para hacer el trabajo más seguro.', this.PW), this.LM, y, this.PW);
    y = this.drawJustified(doc, doc.splitTextToSize('Se deberá de asignar una comisión contra incendios, así como ropa adecuada para su buen funcionamiento (botas, cascos, guantes, lentes, fajas, etc.)', this.PW), this.LM, y, this.PW);
    y = this.drawJustified(doc, doc.splitTextToSize('En caso de que un accidente se produzca, deberá hacerse un análisis de las causas, sugerir medidas correctivas necesarias y ver que el accidentado reciba atención médica.', this.PW), this.LM, y, this.PW); y += 2;

    y = this.drawArticle(doc, 'ARTICULO 40. \u2013 ', 'Será obligación de la Comisión Mixta de Seguridad e Higiene el verificar, durante su inspección mensual, que los extintores deberán de estar en perfectas condiciones para ser utilizados y que ningún equipo de seguridad sea removido de su lugar. Verificará también que no haya ningún objeto que obstruya el libre y fácil acceso a las salidas de emergencia.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 41. \u2013 ', 'En caso de incendio, los trabajadores tendrán la obligación de informar de inmediato a Recursos Humanos, administración (o personal de Seguridad), y ellos a su vez avisarán y notificarán de inmediato a los bomberos de la ciudad.', y);
    y = this.drawJustified(doc, doc.splitTextToSize('Tan pronto como termine el incendio el jefe de los trabajadores junto con los funcionarios de la empresa, la comisión mixta de seguridad e higiene y los testigos correspondientes harán un reporte exacto de las causas, daños y perjuicios del incendio.', this.PW), this.LM, y, this.PW);
    y = this.drawJustified(doc, doc.splitTextToSize('En tanto dura la emergencia, todo el personal estará a disposición de los bomberos, y cualquier desobediencia a sus órdenes será castigada con la rescisión de sus contratos de trabajo. Los extintores que se usen deberán ser reportados de inmediato a fin de poder ser cargados para otra emergencia.', this.PW), this.LM, y, this.PW); y += 2;

    y = this.drawArticle(doc, 'ARTICULO 42.- ', 'Por el giro de de la empresa, no se permite el uso de bermudas, short, huaraches o sandalias, o cualquier calzado descubierto.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 43.- ', 'Queda estrictamente prohibido fumar. Solo podrá hacerse en lugares asignados para este fin.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 44.- ', 'Será obligación de la Comisión Mixta de Seguridad e Higiene proporcionar a cada obra dos sillas con respaldo para el descanso intermitente de los trabajadores durante la jornada laboral', y); y += 3;

    // ── CAPÍTULO VII ──────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, 12);
    this.drawCenter(doc, 'CAPITULO VII', y, 9); y += 5;
    this.drawBoldLeft(doc, 'CAPACITACION Y ADIESTRAMIENTO', this.LM, y); y += this.LH + 1;

    y = this.drawArticle(doc, 'ARTICULO 45.- ', 'La capacitación y adiestramiento que proporcione la empresa deberán tener por objeto:', y);
    const cap45 = [
      'a)  Actualizar y perfeccionar los conocimientos y habilidades del trabajador en su actividad, así como proporcionarle información sobre la aplicación de nueva tecnología en ella.',
      'b)  Preparar al trabajador para ocupar una vacante o puesto de nueva creación.',
      'c)  Prevenir los riesgos de trabajo',
      'd)  Incrementar la productividad',
      'e)  Incrementar la calidad',
      'f)   En general, mejorar las aptitudes del trabajador',
    ];
    for (const c of cap45) {
      y = this.drawItem(doc, c, 8, y);
    }
    y += 2;

    y = this.drawArticle(doc, 'ARTICULO 46.- ', 'En la empresa se constituirá y se mantendrá en funcionamiento una Comisión Mixta de Capacitación y Adiestramiento, integrada por igual número de representantes de los trabajadores y de la empresa, la cual vigilará la instrumentación, operación y mejora continua del sistema, así como de los procedimientos que se implanten para la capacitación y adiestramiento del personal.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 47.- ', 'Atendiendo a la naturaleza de los servicios que presta la empresa, patrón y trabajadores convienen en que la capacitación y adiestramiento podrá impartirse durante las horas de la jornada o fuera de ella y dentro o fuera de la empresa, según se favorezca el mayor aprovechamiento de los mismos.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 48.- ', 'De acuerdo con lo establecido en el artículo 153-H de la Ley Federal del Trabajo, los trabajadores a quienes se imparta capacitación o adiestramiento están obligados a:', y);
    y = this.drawItem(doc, 'I.   Asistir puntualmente a los cursos, sesiones de grupo y demás actividades que formen parte del proceso de capacitación o adiestramiento.', 8, y);
    y = this.drawItem(doc, 'II.  Atender a las indicaciones de las personas que impartan la capacitación o adiestramiento y cumplir con los programas respectivos.', 8, y);
    y = this.drawItem(doc, 'III. Presentar los exámenes de evaluación de conocimientos y de aptitud que sean requeridos.', 8, y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 49.- ', 'Cuando implantado un programa de capacitación, un trabajador se niegue a recibirla por considerar que tiene los conocimientos necesarios para el desempeño de su puesto y del inmediatamente superior, de acuerdo con lo que dispone el artículo 153-U de la Ley Federal del Trabajo, deberá acreditar documentalmente dicha capacidad, así como presentar y aprobar ante la entidad instructora el examen de suficiencia que señale la Secretaría del Trabajo y Previsión Social. Si el trabajador aprobare los exámenes mencionados, le serán expedidas las constancias de habilidad correspondientes.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 50.- ', 'El Incumplimiento de las obligaciones que en materia de capacitación o adiestramiento tiene el personal, darán lugar a sanciones que irán desde actas administrativas, hasta suspensión en el trabajo sin goce de salario, de acuerdo a lo establecido en la fracción X del artículo 423 de la Ley Federal del Trabajo.', y); y += 3;

    // ── CAPÍTULO VIII ─────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, 12);
    this.drawCenter(doc, 'CAPITULO VIII.', y, 9); y += 5;
    this.drawBoldLeft(doc, 'OBLIGACIONES DEL TRABAJADOR.', this.LM, y); y += this.LH + 1;

    y = this.drawArticle(doc, 'ARTICULO 51.- ', 'Son obligaciones del trabajador las que a continuación se citan:', y);
    const obl51 = [
      'I.    Las establecidas en el Artículo 134 de la LFT, o el que en lo futuro lo contemple.',
      'II.   Notificar al Depto. de Personal, encargado de obra y/o a su jefe inmediato el cambio de domicilio, así como entregar a la mayor brevedad posible la información o documentos que la empresa solicite de acuerdo y en base a las necesidades generales de la misma contemplada en el marco legal que en derecho laboral procede.',
      'III.  Firmar la lista de asistencia de asistencia, en caso de NO hacerlo, no entrará al proceso de nómina y por lo tanto no cobrará semana.',
      'IV.  Cumplir las disposiciones tanto de trabajo como de seguridad y moralidad, que sean dadas a conocer por la empresa, tanto en forma verbal como escrita.',
      'V.   Utilizar todos los días laborados el uniforme establecido según lo determine el patrón y según lo requiera las actividades de los diferentes puestos.',
      'VI.  Limpiar su área, maquinaria, herramienta, etc. No tirar basura, ni ensuciar las áreas de trabajo, etc.',
      'VII. Llenar con veracidad las listas de trabajo o los reportes de su actividad que le sean solicitados poniendo la información que se requiera.',
      'VIII. Obedecer las indicaciones del Jefe inmediato y/o encargado de obra en todo lo referente al trabajo.',
      'IX.  Aprender y prepararse para ocupar otros puestos de mayor responsabilidad.',
      'X.   En áreas de servicio, es obligatorio que siempre haya personal presente, por lo que no es permitido vayan juntos a tomar sus alimentos.',
      'XI.  Es responsabilidad del trabajador mantener y guardar la confidencialidad de manuales, procedimientos y funciones que se le confieran para el desempeño de sus funciones.',
      'XII. Reservar el uso de teléfonos celulares personales para los horarios de descanso o de comida o en términos generales, de manera que no interfieran con las actividades laborales de la persona o de la empresa',
      'XIII. Ejecutar el trabajo con la intensidad, cuidado y esmero apropiados, en la forma, tiempo y lugar convenidos.',
      'XIV. Dar aviso inmediato al patrón, salvo caso fortuito o fuerza mayor, de las causas justificadas que le impidan concurrir a su trabajo.',
      'XV.  Restituir al patrón los materiales no usados y conservados en buen estado, los instrumentos y herramientas que por descuido se pierdan, sufran daños, o se descompongan',
      'XVI. Integrar los organismos que establece la Ley Federal del Trabajo.',
      'XVII. Someterse a los chequeos médicos previstos en este el reglamento interior y demás normas vigentes en la empresa o establecimiento, y demás normas oficiales mexicanas y la ley.',
      'XVIII. Poner en conocimiento del patrón las enfermedades contagiosas que padecen, tan pronto como tengan conocimiento de las mismas.',
      'XIX. Comunicar al patrón o a su representante las deficiencias que adviertan, a fin de evitar daños y perjuicios a los intereses, vidas de sus compañeros de trabajo o de los patrones.',
      'XX.  Cuidar, mantener en buen estado las sillas proporcionadas para su descanso durante la jornada.',
      'XXI. Respetar los horarios y en caso de utilizar la silla deberá ser por no más de 10 minutos o más de dos ocasiones durante la jornada laboral.',
    ];
    for (const o of obl51) {
      y = this.drawItem(doc, o, 8, y);
    }
    y += 3;

    // ── CAPÍTULO IX ───────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, 12);
    this.drawCenter(doc, 'CAPITULO IX.', y, 9); y += 5;
    this.drawBoldLeft(doc, 'PROHIBICIONES AL TRABAJADOR.', this.LM, y); y += this.LH + 1;

    y = this.drawArticle(doc, 'ARTICULO 52.- ', 'Está prohibido al trabajador lo que a continuación se cita:', y);
    const proh52 = [
      'I.    Lo establecido en la LFT en el artículo 135 o el que en lo futuro contemple este reglamento.',
      'II.   Organizar rifas, colectas, juegos de azar o apuestas, dentro de la jornada de labores y/o dentro de las instalaciones de la empresa y/o venta de cualquier tipo de artículos.',
      'III.  Dormirse dentro de las horas de trabajo.',
      'IV.  Alterar, modificar o sustraer información, documentos o bienes de la empresa, sin consentimiento y autorización por escrito del jefe del área.',
      'V.   Sacar herramienta, material o bienes de la empresa,',
      'VI.  Utilizar el nombre de la empresa para conseguir beneficios a título personal.',
      'VII. Dañar, anunciar, rayar paredes y/o maquinaria, etc.',
      'VIII. Presentarse a laborar con aliento alcohólico o bajo la influencia de alguna droga o medicamento no prescrito (notificado a la empresa).',
      'IX.  Introducir armas de fuego y/o blancas.',
      'X.   Participar en riñas, ofensas, malos tratos o dañar a compañeros y/o representante de la administración tanto en su persona como en sus bienes.',
      'XI.  Salir en su horario de trabajo sin autorización, sea la causa que fuere. Esto se considera abandono de trabajo.',
      'XII.  Ingerir bebidas embriagantes o algún tipo de droga dentro de las obras u oficinas como en las áreas colindantes a ella (estacionamiento, calle, transporte, etc.).',
      'XIII. Hacer desorden o alterar la disciplina.',
      'XIV. Presentarse a trabajar con hijos o acompañantes.',
      'XV.  Tomar productos sin autorización escrita.',
      'XVI. Utilizar materiales o herramientas para cualquier otro uso que no sean los propios a la empresa.',
      'XVII. Distraer a sus compañeros durante sus labores, tratar asuntos políticos o sindicales y tratar asuntos ajenos al trabajo.',
      'XVIII. Introducir periódicos o impresos de cualquier índole; o leer cualquier cosa ajena al trabajo y que distraiga la atención.',
      'XIX. Encender o apagar las luces o cualquier otro equipo electrónico salvo el equipo propio de su trabajo y por el cual es responsable. Entrar a los departamentos destinados a la trasformación de voltaje de energía o de motores o aparatos eléctricos, lo cual solo podrá hacerlo el personal autorizado para ello.',
      'XX.  Queda estrictamente prohibido que el trabajador labore al mismo tiempo para otra empresa, a reservas que tenga permiso por escrito de dirección general.',
    ];
    for (const p of proh52) {
      y = this.drawItem(doc, p, 8, y);
    }
    y += 3;

    // ── CAPÍTULO X ────────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, 12);
    this.drawCenter(doc, 'CAPITULO X.', y, 9); y += 5;
    this.drawBoldLeft(doc, 'OBLIGACIONES DEL PATRON:', this.LM, y); y += this.LH + 1;

    y = this.drawArticle(doc, 'ARTICULO 53.- ', 'Son obligaciones del patrón las establecidas en el Artículo 132 de la LFT, o el que en lo futuro lo contemple.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 54. \u2013 ', 'El patrón tiene las siguientes obligaciones;', y);
    const obl54 = [
      'I.    Guardar el debido respeto a los trabajadores, no agrediéndolos de palabras, ni físicamente.',
      'II.   Comunicar a los trabajadores las sanciones que se les impongan y explicarles por que se les esta sancionando.',
      'III.  Cumplir las disposiciones de las normas de trabajo aplicables a su empresa.',
      'IV.  Pagar a los trabajadores o empleados los salarios o sueldos, vacaciones, prima vacacional y aguinaldo correspondiente e indemnizaciones de conformidad con las normas vigentes en la empresa o establecimiento.',
      'V.   Proporcionar oportunamente a los trabajadores las herramientas, instrumentos y materiales necesarios para la ejecución del trabajo, debiendo darlos en buen estado y reponerlos cuando dejen de ser funcionales. El patrón no podrá exigir indemnización alguna por el desgaste natural que sufran las herramientas y materiales de trabajo.',
      'VI.  Proporcionar capacitación y adiestramiento a sus trabajadores, en los términos que marca la Ley Federal del Trabajo.',
      'VII. Cumplir las disposiciones de Seguridad e Higiene que fijen las leyes y los reglamentos para prevenir los accidentes y enfermedades en los centros de trabajo, y en general, en los lugares en que deben ejecutarse las labores. Deberán de disponer en todo tiempo de los medicamentos y materiales de curación indispensables que señalen los instructivos que se expidan, para que se presten oportunamente y eficazmente los primeros auxilios; debiendo desde luego dar aviso a las autoridades competentes de cada accidente que ocurra.',
      'VIII. Hacer las deducciones que soliciten los sindicatos de las cuotas sindicales ordinarias, siempre que se compruebe que son las previstas en el artículo 110 fracción VI de la Ley Federal del Trabajo.',
      'IX.  Participar en la integración y funcionamiento de las comisiones que deban formarse en cada centro de trabajo, de acuerdo con lo establecido por la Ley Federal del Trabajo y las demás que le impongan las leyes y los reglamentos (STPS).',
    ];
    for (const o of obl54) {
      y = this.drawItem(doc, o, 8, y);
    }
    y += 3;

    // ── CAPÍTULO XI ───────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, 12);
    this.drawCenter(doc, 'CAPITULO XI.', y, 9); y += 5;
    this.drawBoldLeft(doc, 'PROHIBICIONES AL PATRON.', this.LM, y); y += this.LH + 1;

    y = this.drawArticle(doc, 'ARTICULO 56.- ', 'Queda prohibido al patrón lo establecido en el Artículo 133 de la LFT.:', y);
    const proh56 = [
      'I.    Negarse a aceptar trabajadores por razón de edad o de su sexo.',
      'II.   Exigir que los trabajadores compren sus artículos de consumo en tienda o lugar determinado.',
      'III.  Exigir o aceptar dinero de los trabajadores como gratificación porque se les admita en el trabajo o por cualquier otro motivo que se refiera a las condiciones de éste.',
      'IV.  Obligar a los trabajadores por coacción o por cualquier otro medio, a afiliarse o retirarse del sindicato o agrupación a que pertenezcan, o a que voten pro determinada candidatura.',
      'V.   Hacer autorizar colectas o suscripciones en los establecimientos y lugares de trabajo.',
      'VI.  Ejecutar cualquier acto que restrinja a los trabajadores los derechos que les otorgan las leyes.',
      'VII. Presentarse en los establecimientos en estado de embriaguez o bajo la influencia de un narcótico o droga enervante.',
    ];
    for (const p of proh56) {
      y = this.drawItem(doc, p, 8, y);
    }
    y += 4;

    // ── CAPÍTULO XII ──────────────────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, 12);
    this.drawCenter(doc, 'CAPITULO XII.', y, 9); y += 5;
    this.drawBoldLeft(doc, 'SANCIONES.', this.LM, y); y += this.LH + 2;

    y = this.drawArticle(doc, 'ARTICULO 57.- ', 'Los trabajadores que incurran en el uso incompleto de su uniforme o en la alteración y/o modificación del mismo y en las citadas en el Articulo 38, serán sancionados por la empresa de la siguiente manera:', y);
    y = this.drawItem(doc, 'a)  Por un incumplimiento:         Llamada de atención verbal y escrita y perdida de bono', 8, y);
    y = this.drawItem(doc, 'b)  Por dos incumplimientos:      Un día de suspensión sin goce de sueldo', 8, y);
    y = this.drawItem(doc, 'c)  Por tres incumplimientos:      Dos días de suspensión sin goce de sueldo y se evaluara al personal y se tomara la decisión de la separación laboral.', 8, y);
    y = this.drawJustified(doc, ['Esto será aplicable en un periodo de 30 días.'], this.LM, y, this.PW); y += 2;

    y = this.drawArticle(doc, 'ARTICULO 58.- ', 'Además de las sanciones ya establecidas en el Articulo 51 y en los Artículos establecidos en el capítulo III, referentes a retardos y/o faltas, cualquier violación a alguno de los artículos mencionados; Así como las faltas aún no establecidas en este reglamento que originen indisciplina, inseguridad para el producto o para cualquier persona, según la gravedad y/o frecuencia de la falta, ameritará las siguientes sanciones:', y);
    y = this.drawItem(doc, 'I.   Amonestación verbal', 8, y);
    y = this.drawItem(doc, 'II.  Amonestación escrita. (Actas administrativas)', 8, y);
    y = this.drawItem(doc, 'III. Suspensión hasta por ocho (8) días laborables', 8, y);
    y = this.drawItem(doc, 'IV.  Rescisión de contrato de trabajo.', 8, y);
    y = this.drawJustified(doc, ['Esto según lo establecido en el Artículo 423 Fracción X de la Ley Federal de Trabajo.'], this.LM, y, this.PW); y += 2;

    y = this.drawArticle(doc, 'ARTICULO 59.- ', 'Los errores, pérdidas y averías de los trabajadores les serán descontados según lo establecido por la fracción I del artículo 110 de la Ley Federal del Trabajo.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 60.- ', 'En caso de pérdida de herramienta o no devuelta al término de la jornada de trabajo, su costo será descontado al trabajador que la hubiere recibido. Si la herramienta fuera de uso común a varias personas, el descuento del costo será repartido entre todo el grupo de usuarios al que estuviera destinada.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 61.- ', 'El hostigamiento sexual en el establecimiento o lugar de trabajo será sancionado como mal tratamiento y acto inmoral, dando lugar incluso a la rescisión de la relación de trabajo, según las circunstancias, gravedad de la falta y reincidencia.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 62.- ', 'Intervenir o promover paros ilegales en la empresa, serán considerados como causales de rescisión de las que contempla el artículo 47 de la Ley Federal del Trabajo en sus fracciones II y XV. Cualquier conflicto o reclamación deberá conducirse por los canales legales a los representantes autorizados de la empresa.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 63.- ', 'El personal estará obligado a guardar escrupulosamente los secretos de operación a cuya elaboración concurran directa o indirectamente, así como de los asuntos administrativos reservados que conozcan por razón de su trabajo, según establece la fracción XIII del artículo 134 de la Ley Federal del Trabajo. El incumplimiento de esta obligación será considerado como falta grave de probidad dándose lugar a la rescisión de la relación o contrato de trabajo.', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 64.- ', 'El Patrón se reserva el derecho de llevar a cabo pruebas antidoping para constatar que el trabajador no se encuentra bajo la influencia de algún narcótico o de drogas de cualquier índole. En caso de resultar positiva ésta prueba, se rescindirá la relación laboral, sin responsabilidad para el patrón, como lo establece el artículo 47 de la Ley Federal del Trabajo en su fracción XIII', y); y += 2;
    y = this.drawArticle(doc, 'ARTICULO 65.- ', 'Este reglamento será depositado ante la Junta Local de Conciliación y Arbitraje.', y); y += 4;

    // ── Línea punteada de corte ────────────────────────────────────────────
    y = this.checkPageBreak(doc, y, 60);
    doc.setLineDashPattern([1, 1.5], 0);
    doc.setLineWidth(0.3);
    doc.setDrawColor(20, 20, 20);
    doc.line(this.LM, y, this.LM + this.PW, y);
    doc.setLineDashPattern([], 0);
    y += 8;

    // ── Lugar y Fecha ─────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(this.FS);
    doc.setTextColor(20, 20, 20);
    const fechaStr = `Lugar y Fecha  ${data.lugar || '_____________'}  a  ${data.dia || '______'}  de  ${data.mes || '_____________'}  del 20${data.anio ? data.anio.slice(-2) : '__'}`;
    doc.text(fechaStr, 105, y, { align: 'center' });
    y += 12;

    // ── Yo (nombre trabajador) ────────────────────────────────────────────
    const yoText = 'Yo ' + data.nombreTrabajador + ' he leído todo el reglamento de la empresa, lo he comprendido y no me han quedado dudas al respecto por lo que me comprometo a acatarlo y en caso de no ser así estoy consciente de las sanciones que de aquí se desprenden y las cuales se me aplicaran.';
    y = this.drawJustified(doc, doc.splitTextToSize(yoText, this.PW), this.LM, y, this.PW);
    y += 12;

    // ── Firmas ────────────────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(this.FS);
    doc.text('REPRESENTANTE DEL PATRON', this.LM + 10, y);
    doc.text('TRABAJADOR', this.LM + this.PW - 40, y);
    y += 14;

    doc.setLineWidth(0.4);
    doc.setDrawColor(20, 20, 20);
    doc.line(this.LM + 10, y, this.LM + 10 + 45, y);
    doc.line(this.LM + this.PW - 55, y, this.LM + this.PW - 10, y);
    y += 5;

    doc.text(data.nombreRepresentante, this.LM + 10 + 22.5, y, { align: 'center' });
    doc.text(data.nombreTrabajador, this.LM + this.PW - 32.5, y, { align: 'center' });
    y += this.LH;
    doc.text('(Nombre y firma)', this.LM + 10 + 22.5, y, { align: 'center' });
    doc.text('(Nombre y firma)', this.LM + this.PW - 32.5, y, { align: 'center' });

    this.pageFooter(doc);
  }
}
