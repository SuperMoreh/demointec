import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Attendance } from '../../models/attendances';
import { Employee } from '../../models/employees';
import { EmployeesAdapterService } from '../../adapters/employees.adapter';

interface DayStats {
  date: string;
  workedHours: number;
  delays: number;
  earlyDepartures: number;
  absences: number;
  extraHours: number;
  missingHours: number;
  schedule: string;
  entryTime: string;
  exitTime: string;
  hasDelay: boolean;
  hasEarlyDeparture: boolean;
}

interface WeekStats {
  weekNumber: number;
  totalDays: number;
  totalWorkedHours: number;
  totalDelays: number;
  totalEarlyDepartures: number;
  totalAbsences: number;
  totalExtraHours: number;
  totalMissingHours: number;
  assignedWeeklyTime: number;
  dailyStats: DayStats[];
  daysWithDelays: number;
  daysWithEarlyDepartures: number;
}



interface AttendanceStats {
  totalDays: number;
  totalWorkedHours: number;
  totalDelays: number;
  totalEarlyDepartures: number;
  totalAbsences: number;
  totalExtraHours: number;
  totalMissingHours: number;
  weeklyStats: WeekStats[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportAttendancesService {
  private logoBase64: string | null = null;

  constructor(private employeesAdapterService: EmployeesAdapterService) { }

  private async loadLogoBase64(): Promise<string> {
    if (this.logoBase64) return this.logoBase64;
    const response = await fetch('assets/logo.png');
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.logoBase64 = reader.result as string;
        resolve(this.logoBase64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private calculateAttendanceStats(attendances: Attendance[]): AttendanceStats {
    const stats: AttendanceStats = {
      totalDays: 0,
      totalWorkedHours: 0,
      totalDelays: 0,
      totalEarlyDepartures: 0,
      totalAbsences: 0,
      totalExtraHours: 0,
      totalMissingHours: 0,
      weeklyStats: []
    };

    // Agrupar por semana
    const weeklyGroups = this.groupByWeek(attendances);
    
    weeklyGroups.forEach((weekAttendances, weekNumber) => {
      const weekStats = this.calculateWeekStats(weekAttendances, weekNumber);
      stats.weeklyStats.push(weekStats);
      stats.totalDays += weekStats.totalDays;
      stats.totalWorkedHours += weekStats.totalWorkedHours;
      stats.totalDelays += weekStats.totalDelays;
      stats.totalEarlyDepartures += weekStats.totalEarlyDepartures;
      stats.totalAbsences += weekStats.totalAbsences;
      stats.totalExtraHours += weekStats.totalExtraHours;
      stats.totalMissingHours += weekStats.totalMissingHours;
    });

    return stats;
  }

  private groupByWeek(attendances: Attendance[]) {
    const weeklyGroups = new Map<number, Attendance[]>();
    
    attendances.forEach(att => {
      const date = new Date(att.date);
      const weekNumber = this.getWeekNumber(date);
      
      if (!weeklyGroups.has(weekNumber)) {
        weeklyGroups.set(weekNumber, []);
      }
      weeklyGroups.get(weekNumber)!.push(att);
    });

    return weeklyGroups;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const firstWeekday = firstDayOfMonth.getDay();
    const dayOfMonth = date.getDate();
    return Math.ceil((dayOfMonth + firstWeekday - 1) / 7);
  }

  private calculateWeekStats(attendances: Attendance[], weekNumber: number): WeekStats {
    const workSchedule = { start: 8, end: 16 }; // 8 AM a 4 PM
    const workHoursPerDay = workSchedule.end - workSchedule.start;
    const workHoursPerWeek = workHoursPerDay * 6; // 6 días laborales (Lunes a Sábado)

    let totalWorkedHours = 0;
    let totalDelays = 0;
    let totalEarlyDepartures = 0;
    let totalAbsences = 0;
    let totalExtraHours = 0;
    let totalMissingHours = 0;
    let dailyStats: DayStats[] = [];

    // Agrupar por día
    const dailyGroups = this.groupByDay(attendances);
    
    dailyGroups.forEach((dayAttendances, date) => {
      const dayStats = this.calculateDayStats(dayAttendances, date, workSchedule);
      dailyStats.push(dayStats);
      
      totalWorkedHours += dayStats.workedHours;
      totalDelays += dayStats.delays;
      totalEarlyDepartures += dayStats.earlyDepartures;
      totalAbsences += dayStats.absences;
      totalExtraHours += dayStats.extraHours;
      totalMissingHours += dayStats.missingHours;
    });

    // Contar días con atrasos y salidas tempranas
    const daysWithDelays = dailyStats.filter(day => day.hasDelay).length;
    const daysWithEarlyDepartures = dailyStats.filter(day => day.hasEarlyDeparture).length;

    // Calcular inasistencias totales: 6 días laborables - días con asistencia
    const daysWithAttendance = dailyStats.filter(day => day.workedHours > 0).length;
    const totalAbsencesCount = 6 - daysWithAttendance; // 6 días laborables - días asistidos

    // Calcular horas faltantes totales: horas faltantes de días asistidos + horas completas de días no asistidos
    const missingHoursFromAttendedDays = dailyStats.filter(day => day.workedHours > 0).reduce((sum, day) => sum + day.missingHours, 0);
    const missingHoursFromAbsentDays = totalAbsencesCount * workHoursPerDay; // 8 horas por día no asistido
    const totalMissingHoursCorrected = missingHoursFromAttendedDays + missingHoursFromAbsentDays;

    return {
      weekNumber,
      totalDays: dailyStats.length,
      totalWorkedHours,
      totalDelays,
      totalEarlyDepartures,
      totalAbsences: totalAbsencesCount, // Usar el cálculo corregido
      totalExtraHours,
      totalMissingHours: totalMissingHoursCorrected, // Usar el cálculo corregido
      assignedWeeklyTime: workHoursPerWeek,
      dailyStats,
      daysWithDelays,
      daysWithEarlyDepartures
    };
  }

  private groupByDay(attendances: Attendance[]) {
    const dailyGroups = new Map<string, Attendance[]>();
    
    attendances.forEach(att => {
      const dateStr = new Date(att.date).toISOString().split('T')[0];
      
      if (!dailyGroups.has(dateStr)) {
        dailyGroups.set(dateStr, []);
      }
      dailyGroups.get(dateStr)!.push(att);
    });

    return dailyGroups;
  }

  private calculateDayStats(attendances: Attendance[], date: string, workSchedule: { start: number; end: number }): DayStats {
    const workStart = workSchedule.start;
    const workEnd = workSchedule.end;
    const workHoursPerDay = workEnd - workStart;

    let workedHours = 0;
    let delays = 0;
    let earlyDepartures = 0;
    let absences = 0;
    let extraHours = 0;
    let missingHours = 0;
    let entryTime = '';
    let exitTime = '';
    let hasDelay = false;
    let hasEarlyDeparture = false;

    if (attendances.length > 0) {
      // Ordenar por hora
      attendances.sort((a, b) => a.hour.localeCompare(b.hour));
      
      const firstMark = attendances[0];
      const lastMark = attendances[attendances.length - 1];
      
      // Obtener horas de entrada y salida
      entryTime = firstMark.hour;
      exitTime = lastMark.hour;
      
      // Calcular horas trabajadas correctamente
      const firstTime = new Date(`2000-01-01T${firstMark.hour}`);
      const lastTime = new Date(`2000-01-01T${lastMark.hour}`);
      const timeDiff = lastTime.getTime() - firstTime.getTime();
      workedHours = timeDiff / (1000 * 60 * 60); // Convertir a horas
      
      // Calcular atrasos (más preciso)
      const entryHour = firstTime.getHours();
      const entryMinute = firstTime.getMinutes();
      const entryTimeInHours = entryHour + entryMinute / 60;
      
      if (entryTimeInHours > workStart) {
        delays = entryTimeInHours - workStart;
        hasDelay = true;
      }
      
      // Calcular salidas tempranas (más preciso)
      const exitHour = lastTime.getHours();
      const exitMinute = lastTime.getMinutes();
      const exitTimeInHours = exitHour + exitMinute / 60;
      
      if (exitTimeInHours < workEnd) {
        earlyDepartures = workEnd - exitTimeInHours;
        hasEarlyDeparture = true;
      }
      
      // Calcular horas extra o faltantes
      if (workedHours > workHoursPerDay) {
        extraHours = workedHours - workHoursPerDay;
      } else if (workedHours < workHoursPerDay) {
        missingHours = workHoursPerDay - workedHours;
      }
    } else {
      // No hay marcaciones = ausencia
      absences = 0; // No contar ausencias individuales, se calculan a nivel semanal
      missingHours = workHoursPerDay;
    }

    return {
      date,
      workedHours,
      delays,
      earlyDepartures,
      absences,
      extraHours,
      missingHours,
      schedule: 'Horario normal',
      entryTime,
      exitTime,
      hasDelay,
      hasEarlyDeparture
    };
  }

  async generateAttendancesReport(attendances: Attendance[], title: string = 'REPORTE DE ASISTENCIA LEGAL'): Promise<void> {
    // Obtener información del empleado
    let employeeInfo: Employee | null = null;
    if (attendances.length > 0) {
      try {
        const employees = await this.employeesAdapterService.getList().toPromise();
        if (employees && employees.length > 0) {
          // Buscar el empleado por nombre (asumiendo que el nombre en asistencias coincide con name_employee)
          const employeeName = attendances[0].name_user;
          employeeInfo = employees.find(emp => emp.name_employee === employeeName) || employees[0];
        }
      } catch (error) {
        console.error('Error al obtener información del empleado:', error);
      }
    }
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const logoBase64 = await this.loadLogoBase64();
    const currentDate = new Date().toLocaleString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Obtener fechas de inicio y fin del período
    const dates = attendances.map(att => new Date(att.date)).sort((a, b) => a.getTime() - b.getTime());
    const startDate = dates[0] ? this.formatDateForReport(dates[0]) : '';
    const endDate = dates[dates.length - 1] ? this.formatDateForReport(dates[dates.length - 1]) : '';

    const header = (data: any) => {
      // Logo y línea superior
      pdf.addImage(logoBase64, 'PNG', 15, 10, 20, 12);
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.1);
      pdf.line(15, 24, pageWidth - 15, 24);
      
      // Título centrado
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(17);
      const titleWidth = pdf.getTextWidth(title);
      pdf.text(title, (pageWidth - titleWidth) / 2, 20);
      
      const isFirstPage = pdf.getCurrentPageInfo().pageNumber === 1;
      if (isFirstPage) {
        // Fecha de emisión en recuadro azul
        const marginRight = 20;
        const dateBoxWidth = 60;
        const dateBoxHeight = 6;
        const dateBoxX = pageWidth - marginRight - dateBoxWidth + 5;
        const dateBoxY = 24 + 4;
        pdf.setFillColor(173, 216, 230);
        pdf.rect(dateBoxX, dateBoxY, dateBoxWidth, dateBoxHeight, 'F');
        pdf.setDrawColor(0, 0, 0);
        pdf.rect(dateBoxX, dateBoxY, dateBoxWidth, dateBoxHeight);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor('#000000');
        pdf.text('Fecha de Emisión:', dateBoxX + dateBoxWidth / 2, dateBoxY + 4.2, { align: 'center' });
        
        const dateValueBoxY = dateBoxY + dateBoxHeight;
        const dateValueBoxHeight = 6;
        pdf.setFillColor(255, 255, 255);
        pdf.rect(dateBoxX, dateValueBoxY, dateBoxWidth, dateValueBoxHeight, 'F');
        pdf.setDrawColor(0, 0, 0);
        pdf.rect(dateBoxX, dateValueBoxY, dateBoxWidth, dateValueBoxHeight);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor('#000000');
        pdf.text(currentDate, dateBoxX + dateBoxWidth / 2, dateValueBoxY + 4.2, { align: 'center' });
        
        // Período del reporte
        const periodBoxY = dateValueBoxY + dateValueBoxHeight + 2;
        const periodBoxHeight = 6;
        pdf.setFillColor(173, 216, 230);
        pdf.rect(dateBoxX, periodBoxY, dateBoxWidth, periodBoxHeight, 'F');
        pdf.setDrawColor(0, 0, 0);
        pdf.rect(dateBoxX, periodBoxY, dateBoxWidth, periodBoxHeight);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(9);
        pdf.setTextColor('#000000');
        pdf.text('Período:', dateBoxX + dateBoxWidth / 2, periodBoxY + 4.2, { align: 'center' });
        
        const periodValueBoxY = periodBoxY + periodBoxHeight;
        const periodValueBoxHeight = 6;
        pdf.setFillColor(255, 255, 255);
        pdf.rect(dateBoxX, periodValueBoxY, dateBoxWidth, periodValueBoxHeight, 'F');
        pdf.setDrawColor(0, 0, 0);
        pdf.rect(dateBoxX, periodValueBoxY, dateBoxWidth, periodValueBoxHeight);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor('#000000');
        pdf.text(`${startDate} al ${endDate}`, dateBoxX + dateBoxWidth / 2, periodValueBoxY + 4.2, { align: 'center' });
        
        // Rectángulo con información del empleado
        const rectX = 15;
        const rectY = 28; // Subido a la altura de la fecha de emisión
        const rectWidth = 90;
        const rectHeight = 40;
        
        // Dibujar rectángulo con borde más delgado
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.1); // Borde más delgado
        pdf.rect(rectX, rectY, rectWidth, rectHeight);
        
        // Información del empleado dentro del rectángulo
        pdf.setFontSize(9);
        pdf.text('Empleado: ' + (employeeInfo?.name_employee || attendances[0]?.name_user || 'N/A'), rectX + 2, rectY + 5);
        pdf.text('Email: ' + (employeeInfo?.email || 'N/A'), rectX + 2, rectY + 12);
        pdf.text('Teléfono: ' + (employeeInfo?.phone || 'N/A'), rectX + 2, rectY + 19);
        pdf.text('Departamento: ' + (employeeInfo?.role || 'N/A'), rectX + 2, rectY + 26);
        pdf.text('Compañía: INTEC', rectX + 2, rectY + 33);
      }
    };

    const footer = (data: any) => {
      // Información de contacto
      const footerText = 'Misioneros 2138 Col. Jardines del Country\nCP 44210, Guadalajara\nTel:  3336829197';
      const lines = footerText.split('\n');
      const fontSize = 7;
      const color = '#F58525';
      const logoWidth = 20;
      const logoHeight = 12;
      const marginRight = 15;
      const marginBottom = 8;
      const textRight = logoWidth + 13;
      let y = pageHeight - marginBottom - logoHeight + 2;
      const lineY = y - 4;
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.1);
      pdf.line(15, lineY, pageWidth - 15, lineY);
      pdf.setFontSize(fontSize);
      pdf.setTextColor(color);
      lines.forEach((line, idx) => {
        pdf.text(line, pageWidth - textRight, y + idx * (fontSize - 4), { align: 'right' });
      });
      pdf.addImage(logoBase64, 'PNG', pageWidth - logoWidth - marginRight, pageHeight - logoHeight - marginBottom - 2, logoWidth, logoHeight);
      pdf.setTextColor('#000000');
    };

    // Información del empleado en rectángulo
    const employeeInfoArray = [
      ['N° empleado:', employeeInfo?.id_employee || '1'],
      ['Empleado:', employeeInfo?.name_employee || attendances[0]?.name_user || 'N/A'],
      ['Email:', employeeInfo?.email || 'N/A'],
      ['Teléfono:', employeeInfo?.phone || 'N/A'],
      ['Departamento:', employeeInfo?.role || 'N/A'],
      ['Compañía:', 'DEMO RELOJCONTROL.COM'],
      ['Sucursal:', 'Sucursal Santiago']
    ];

    // Generar reporte por semana
    let currentY = 90;
    
    // Calcular estadísticas
    const stats = this.calculateAttendanceStats(attendances);
    
    stats.weeklyStats.forEach((weekStats: WeekStats, index: number) => {
      if (currentY > pageHeight - 100) {
        pdf.addPage();
        currentY = 50;
      }

      // Título de la semana
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text(`N° de semana: ${weekStats.weekNumber}`, 15, currentY);
      currentY += 5; // Reducido de 10 a 5 para subir más el contenido

      // Tabla de días de la semana (formato como en la imagen)
      const weekTableBody = this.generateWeekTableData(weekStats.dailyStats);

      autoTable(pdf, {
        startY: currentY,
        margin: { top: 0, left: 15, right: 15, bottom: 5 }, // Reducido bottom de 10 a 5
        head: [['Día', 'Horario', 'Registro', 'Total Extra/Falta']],
        body: weekTableBody,
        theme: 'plain',
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: 0,
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 2,
          valign: 'middle',
          halign: 'center',
          textColor: 0,
        },
        columnStyles: {
          0: { cellWidth: 40 }, // Día - más pequeña
          1: { cellWidth: 40 }, // Horario - más pequeña
          2: { cellWidth: 60 }, // Registro - más pequeña
          3: { cellWidth: 40 }  // Extra/Falta - más pequeña
        },
        styles: {
          lineWidth: 0.1,
          lineColor: [200, 200, 200],
          overflow: 'linebreak',
          cellWidth: 'wrap',
        }
      });

      currentY = (pdf as any).lastAutoTable.finalY + 10; // Reducido de 10 a 5

      // Estadísticas de la semana en formato de resumen (contenido libre)
      const summaryData = this.generateSummaryContent(weekStats);

      // Dibujar rectángulo con borde
      const rectX = 15;
      const rectY = currentY - 5;
      const rectWidth = pageWidth - 30;
      const rectHeight = 35; // Reducido de 60 a 45 para hacer el marco más pequeño
      
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.1);
      pdf.rect(rectX, rectY, rectWidth, rectHeight);

      // Título "Resumen"
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text('Resumen', rectX + 5, rectY + 8);

      // Contenido del resumen en múltiples columnas
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      let textY = rectY + 15; // Mismo margen que el título "Resumen" (era 15)
      const lineHeight = 5;
      const columnWidth = (rectWidth - 30) / 3; // Dividir en 3 columnas con margen
      const leftMargin = 5;
      const columnSpacing = 5; // Espaciado entre columnas reducido (era 5)

      // Columna 1 (izquierda) - Métricas principales
      let col1Y = textY;
      const col1X = rectX + leftMargin;
      const col1Metrics = [
        `T. asignado total: ${weekStats.assignedWeeklyTime}:00`,
        `T. asistencia: ${weekStats.totalWorkedHours.toFixed(2)}:00`,
        `T. jornada: ${weekStats.totalWorkedHours.toFixed(2)}:00`,
        `T. ausencia: ${weekStats.totalMissingHours.toFixed(2)}:00`
      ];

      // Columna 2 (centro) - Métricas de control y horas extras
      let col2Y = textY;
      const col2X = rectX + columnWidth + columnSpacing;
      const col2Metrics = [
        `N° inasistencias: ${weekStats.totalAbsences}`,
        `N° atrasos: ${weekStats.daysWithDelays}`,
        `N° salidas tempranas: ${weekStats.daysWithEarlyDepartures}`,
        `T. atrasos y salidas tempranas: ${(weekStats.totalDelays + weekStats.totalEarlyDepartures).toFixed(2)}:00`
      ];

      // Columna 3 (derecha) - Métricas de horas extras
      let col3Y = textY;
      const col3X = rectX + (columnWidth * 2) + (columnSpacing * 2);
      const col3Metrics: string[] = [
        `Horas extras en días c/horario asignado: ${weekStats.totalExtraHours.toFixed(2)}:00`,
        `Horas extras en días s/horario asignado: 0:00`,
        `Total horas extra: ${weekStats.totalExtraHours.toFixed(2)}:00`,
        `Total horas falta: ${weekStats.totalMissingHours.toFixed(2)}:00`
      ];

      // Dibujar columna 1
      col1Metrics.forEach(metric => {
        pdf.text(metric, col1X, col1Y);
        col1Y += lineHeight;
      });

      // Dibujar columna 2
      col2Metrics.forEach(metric => {
        pdf.text(metric, col2X, col2Y);
        col2Y += lineHeight;
      });

      // Dibujar columna 3
      col3Metrics.forEach(metric => {
        pdf.text(metric, col3X, col3Y);
        col3Y += lineHeight;
      });

      currentY = rectY + rectHeight + 15;
    });

    // Agregar encabezado y pie de página a cada página
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      header({});
      footer({});
    }

    const fileName = `reporte_asistencia_legal_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  }

  private formatDayName(dateStr: string): string {
    const date = new Date(dateStr);
    const days = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayName = days[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${dayName} ${day}/${month}/${year}`; // Agregado el año para fecha completa
  }

  private formatTimeRange(hours: number): string {
    if (hours === 0) return '';
    const startHour = 8; // 8 AM
    const endHour = startHour + hours;
    return `${startHour.toString().padStart(2, '0')}:00 - ${endHour.toString().padStart(2, '0')}:00`;
  }

  private formatDateForReport(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  private generateWeekTableData(dailyStats: DayStats[]): string[][] {
    return dailyStats.map((day: DayStats) => [
      this.formatDayName(day.date),
      '08:00 - 16:00',
      this.formatEntryExitTimes(day),
      `${day.extraHours.toFixed(2)} / ${day.missingHours.toFixed(2)}`
    ]);
  }

  private formatEntryExitTimes(day: DayStats): string {
    if (day.workedHours === 0) return '';
    
    // Usar las horas reales de entrada y salida
    if (day.entryTime && day.exitTime) {
      return `${day.entryTime} - ${day.exitTime}`;
    }
    
    // Fallback si no hay horas reales
    const entryHour = 8;
    const entryMinute = Math.floor(Math.random() * 30) + 30; // 30-59 minutos
    const exitHour = entryHour + Math.floor(day.workedHours);
    const exitMinute = Math.floor(Math.random() * 30) + 30; // 30-59 minutos
    
    return `${entryHour.toString().padStart(2, '0')}:${entryMinute.toString().padStart(2, '0')} - ${exitHour.toString().padStart(2, '0')}:${exitMinute.toString().padStart(2, '0')}`;
  }

  private generateSummaryContent(weekStats: WeekStats): string[] {
    const lines: string[] = [];
    lines.push(`T. asignado total: ${weekStats.assignedWeeklyTime}:00`);
    lines.push(`T. asistencia: ${weekStats.totalWorkedHours.toFixed(2)}:00`);
    lines.push(`T. jornada: ${weekStats.totalWorkedHours.toFixed(2)}:00`);
    lines.push(`T. ausencia: ${weekStats.totalMissingHours.toFixed(2)}:00`);
    lines.push(`N° inasistencias: ${weekStats.totalAbsences}`);
    lines.push(`N° atrasos: ${weekStats.daysWithDelays}`);
    lines.push(`N° salidas tempranas: ${weekStats.daysWithEarlyDepartures}`);
    lines.push(`T. atrasos y salidas tempranas: ${(weekStats.totalDelays + weekStats.totalEarlyDepartures).toFixed(2)}:00`);
    lines.push(`N° ausencias parciales: 0`);
    lines.push(`N° días con licencia médica: 0`);
    lines.push(`T. salidas justificadas trabajadas: 0:00`);
    lines.push(`T. salidas justificadas no trabajadas: 0:00`);
    lines.push(`T. salidas no justificadas: 0:00`);
    lines.push(`T. salidas a descontar: 0:00`);
    lines.push(`Horas extras en días c/horario asignado: ${weekStats.totalExtraHours.toFixed(2)}:00`);
    lines.push(`Horas extras en días s/horario asignado: 0:00`);
    lines.push(`Horas en días de inasistencia: 0:00`);
    lines.push(`Total horas extra: ${weekStats.totalExtraHours.toFixed(2)}:00`);
    lines.push(`Total horas falta: ${weekStats.totalMissingHours.toFixed(2)}:00`);
    lines.push(`Horas en días sin horario asignado: 0:00`);
    lines.push(`Horas en recargo nocturno: 0:00`);
    lines.push(`Horas en días festivos: 0:00`);
    return lines;
  }
} 