import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { User } from '../models/users';
import { Role } from '../models/roles';

@Injectable({
  providedIn: 'root'
})
export class PdfReportService {
  // Base64 del logo (puedes reemplazarlo por el tuyo si lo tienes ya convertido)
  private logoBase64: string | null = null;

  constructor() { }

  // Cargar el logo como base64 desde assets/logo.png
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

  async generateUsersReport(users: User[], roles: Role[], title: string = 'REPORTE DE USUARIOS'): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Configurar fuente
    pdf.setFont('helvetica');
    
    // Título del reporte
    pdf.setFontSize(17);
    pdf.setFont('helvetica', 'bold');
    const titleWidth = pdf.getTextWidth(title);
    pdf.text(title, (pageWidth - titleWidth) / 2, 30);
    
    // Fecha del reporte en un cuadro alineado a la derecha
    const dateBoxWidth = 60;
    const dateBoxHeight = 10;
    const dateBoxX = pageWidth - margin - dateBoxWidth;
    const dateBoxY = 20;
    pdf.setFillColor(173, 216, 230); // Azul claro
    pdf.rect(dateBoxX, dateBoxY, dateBoxWidth, dateBoxHeight, 'F');
    pdf.setDrawColor(0, 0, 0);
    pdf.rect(dateBoxX, dateBoxY, dateBoxWidth, dateBoxHeight); // Borde negro
    pdf.setFontSize(10);
    pdf.setTextColor('#000000');
    pdf.text(`Generado el:`, dateBoxX + 3, dateBoxY + 4.5);
    pdf.setFontSize(9);
    const currentDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    pdf.text(currentDate, dateBoxX + 3, dateBoxY + 9);
    
    // Información del reporte
    pdf.setFontSize(10);
    pdf.text(`Total de usuarios: ${users.length}`, margin, 45);
    
    // Tabla de usuarios
    let yPosition = 70;
    const rowHeight = 8;
    const headers = ['Nombre', 'Email', 'Teléfono', 'Rol', 'Estado'];
    const columnWidths = [40, 45, 25, 25, 20];
    
    // Encabezados de la tabla
    pdf.setFont('helvetica', 'bold');
    pdf.setFillColor(173, 216, 230); // Azul claro
    let xPosition = margin;
    
    headers.forEach((header, index) => {
      pdf.rect(xPosition, yPosition - 5, columnWidths[index], rowHeight, 'F');
      // Centrar el texto en cada columna
      const textWidth = pdf.getTextWidth(header);
      const centerX = xPosition + (columnWidths[index] / 2);
      pdf.text(header, centerX - (textWidth / 2), yPosition);
      xPosition += columnWidths[index];
    });
    
    yPosition += rowHeight;
    
    // Datos de la tabla
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    
    users.forEach((user, index) => {
      // Verificar si necesitamos una nueva página
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 30;
      }
      
      xPosition = margin;
      
      // Nombre
      const name = this.truncateText(user.name_user, 35);
      pdf.text(name, xPosition + 2, yPosition);
      xPosition += columnWidths[0];
      
      // Email
      const email = this.truncateText(user.email, 40);
      pdf.text(email, xPosition + 2, yPosition);
      xPosition += columnWidths[1];
      
      // Teléfono
      pdf.text(user.phone, xPosition + 2, yPosition);
      xPosition += columnWidths[2];
      
      // Rol
      const role = this.getRoleName(user.role_id, roles);
      pdf.text(role, xPosition + 2, yPosition);
      xPosition += columnWidths[3];
      
      // Estado
      const status = user.status ? 'Activo' : 'Inactivo';
      pdf.text(status, xPosition + 2, yPosition);
      xPosition += columnWidths[4];
    });
    
    // Pie de página
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - 30, pageHeight - 10);
    }
    
    // Guardar el PDF
    const fileName = `reporte_usuarios_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  }

  async generateUsersReportFromHTML(users: User[], roles: Role[], title: string = 'Reporte de Usuarios'): Promise<void> {
    // Crear elemento HTML temporal para el reporte
    const reportElement = this.createReportHTML(users, roles, title);
    document.body.appendChild(reportElement);
    const logoBase64 = await this.loadLogoBase64();
    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 10;
      
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Pie de página y encabezado en todas las páginas
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        this.drawHeader(pdf, pageWidth, logoBase64);
        this.drawFooter(pdf, pageWidth, pageHeight, logoBase64);
      }
      
      const fileName = `reporte_usuarios_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      
    } finally {
      document.body.removeChild(reportElement);
    }
  }

  private drawHeader(pdf: jsPDF, pageWidth: number, logoBase64: string) {
    // Logo en el encabezado (arriba a la izquierda), mismo tamaño que el pie de página
    const logoWidth = 20;
    const logoHeight = 12;
    pdf.addImage(logoBase64, 'PNG', 15, 10, logoWidth, logoHeight);
    
    // Dibuja una línea negra horizontal debajo del logo
    const lineY = 10 + logoHeight + 2; // 2px de separación debajo del logo
    pdf.setDrawColor(0, 0, 0); // Negro
    pdf.setLineWidth(0.1);
    pdf.line(15, lineY, pageWidth - 15, lineY); // Línea de margen a margen
  }

  private drawFooter(pdf: jsPDF, pageWidth: number, pageHeight: number, logoBase64: string) {
    // Pie de página con texto y logo exactamente como la imagen
    const footerText = 'Misioneros 2138 Col. Jardines del Country\nCP 44210, Guadalajara\nTel:  3336829197';
    const lines = footerText.split('\n');
    const fontSize = 7;
    const color = '#F58525';
    const logoWidth = 20;
    const logoHeight = 12;
    const marginRight = 15;
    const marginBottom = 8;
    const textRight = logoWidth + 13;
    pdf.setFontSize(fontSize);
    pdf.setTextColor(color);
    // Calcular la posición Y inicial para el texto
    let y = pageHeight - marginBottom - logoHeight + 2;
    // Dibuja una línea negra horizontal por encima del texto y la imagen
    const lineY = y - 4; // Ajusta la distancia de la línea respecto al texto
    pdf.setDrawColor(0, 0, 0); // Negro
    pdf.setLineWidth(0.1);
    pdf.line(15, lineY, pageWidth - 15, lineY); // Línea de margen a margen
    // Dibujar cada línea de texto alineada a la derecha del logo
    lines.forEach((line, idx) => {
      pdf.text(line, pageWidth - textRight, y + idx * (fontSize - 4), { align: 'right' });
    });
    // Dibujar el logo a la derecha del texto
    pdf.addImage(logoBase64, 'PNG', pageWidth - logoWidth - marginRight, pageHeight - logoHeight - marginBottom - 2, logoWidth, logoHeight);
    // Restaurar color
    pdf.setTextColor('#000000');
  }

  private createReportHTML(users: User[], roles: Role[], title: string): HTMLElement {
    const div = document.createElement('div');
    div.style.cssText = `
      width: 800px;
      padding: 20px;
      font-family: Arial, sans-serif;
      background: white;
      color: black;
    `;
    
    div.innerHTML = `
      <div style=\"text-align: center; margin-bottom: 30px;\">\n        <h1 style=\"color: #333; margin-bottom: 10px; text-transform: uppercase; font-weight: bold; font-size: 20px;\">${title}</h1>\n      </div>\n      <div style=\"display: flex; justify-content: flex-end; margin-bottom: 40px;\">\n        <div style=\"min-width: 180px;\">\n          <div style=\"background: #ADD8E6; border: 1px solid #222; border-radius: 4px 4px 0 0; padding: 6px 14px 2px 14px; text-align: center; font-size: 14px; font-weight: bold; color: #222; border-bottom: none;\">\n            Fecha de Emisión\n          </div>\n          <div style=\"border: 1px solid #222; border-top: none; border-radius: 0 0 4px 4px; padding: 4px 14px 4px 14px; text-align: center; font-size: 14px; color: #222; background: #fff;\">\n            ${new Date().toLocaleString('es-ES')}\n          </div>\n        </div>\n      </div>\n      <table style=\"width: 100%; border-collapse: collapse; margin-top: 40px; border: 1px solid #222;\">\n        <thead>\n          <tr style=\"background-color: #ADD8E6;\">\n            <th style=\"border: 1px solid #222; padding: 12px; text-align: center;\">Nombre</th>\n            <th style=\"border: 1px solid #222; padding: 12px; text-align: center;\">Email</th>\n            <th style=\"border: 1px solid #222; padding: 12px; text-align: center;\">Teléfono</th>\n            <th style=\"border: 1px solid #222; padding: 12px; text-align: center;\">Rol</th>\n            <th style=\"border: 1px solid #222; padding: 12px; text-align: center;\">Estado</th>\n          </tr>\n        </thead>\n        <tbody>\n          ${users.map(user => `\n            <tr>\n              <td style=\"border: 1px solid #888; padding: 8px;\">${user.name_user}</td>\n              <td style=\"border: 1px solid #888; padding: 8px;\">${user.email}</td>\n              <td style=\"border: 1px solid #888; padding: 8px;\">${user.phone}</td>\n              <td style=\"border: 1px solid #888; padding: 8px;\">${this.getRoleName(user.role_id, roles)}</td>\n              <td style=\"border: 1px solid #888; padding: 8px;\"><span style=\"color: ${user.status ? 'green' : 'red'}; font-weight: bold;\">${user.status ? 'Activo' : 'Inactivo'}</span></td>\n            </tr>\n          `).join('')}\n        </tbody>\n      </table>\n    `;
    
    return div;
  }

  private truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  private getRoleName(roleId: number, roles: Role[]): string {
    const role = roles.find(r => r.id_role === roleId);
    return role ? role.name_role : 'Sin rol';
  }
} 