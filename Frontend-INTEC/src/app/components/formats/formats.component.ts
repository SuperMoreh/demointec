import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface FormatItem {
  key: string;
  label: string;
  description: string;
  icon: string;
  filePath: string;
  fileName: string;
}

@Component({
  selector: 'app-formats',
  templateUrl: './formats.component.html',
  styleUrl: './formats.component.css',
  imports: [CommonModule]
})
export class FormatsComponent {

  formats: FormatItem[] = [
    {
      key: 'entrevista-salida',
      label: 'Entrevista de Salida',
      description: 'Formulario de entrevista de salida del colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/ENTREVISTA DE SALIDA.pdf',
      fileName: 'Entrevista de Salida.pdf'
    },
    {
      key: 'encuesta-satisfaccion',
      label: 'Encuesta de Satisfacción Laboral',
      description: 'Encuesta de satisfacción laboral del colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/Encuesta de satisfacción laboral.pdf',
      fileName: 'Encuesta de Satisfacción Laboral.pdf'
    },
    {
      key: 'aviso-privacidad',
      label: 'Aviso de Privacidad',
      description: 'Aviso de privacidad para el colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/AVISO DE PRIVACIDAD.pdf',
      fileName: 'Aviso de Privacidad.pdf'
    },
    {
      key: 'caratula-ingreso',
      label: 'Carátula de Ingreso',
      description: 'Carátula de ingreso del colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/CARATULA DE INGRESO.pdf',
      fileName: 'Carátula de Ingreso.pdf'
    },
    {
      key: 'carta-patronal',
      label: 'Carta Patronal',
      description: 'Carta patronal del colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/CARTA PATRONAL.pdf',
      fileName: 'Carta Patronal.pdf'
    },
    {
      key: 'constancia-abandono',
      label: 'Constancia de Abandono de Trabajo',
      description: 'Constancia de abandono de trabajo del colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/constancia de abandono de trabajo.pdf',
      fileName: 'Constancia de Abandono de Trabajo.pdf'
    },
    {
      key: 'contrato-confidencialidad',
      label: 'Contrato de Confidencialidad',
      description: 'Contrato de confidencialidad del colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/CONTRATO CONFIDENCIALIDAD.pdf',
      fileName: 'Contrato de Confidencialidad.pdf'
    },
    {
      key: 'contrato-obra-determinada',
      label: 'Contrato Individual por Obra Determinada',
      description: 'Contrato individual por obra determinada del colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/CONTRATO INDIVIDUAL POR OBRA DETERMINADA.pdf',
      fileName: 'Contrato Individual por Obra Determinada.pdf'
    },
    {
      key: 'contrato-tiempo-determinado',
      label: 'Contrato por Tiempo Determinado',
      description: 'Contrato por tiempo determinado del colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/Contrato por Tiempo Determinado.pdf',
      fileName: 'Contrato por Tiempo Determinado.pdf'
    },
    {
      key: 'politica-prestamos',
      label: 'Política de Préstamos Personales',
      description: 'Política de préstamos personales para colaboradores',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/POLITICA DE PRESTAMOS PERSONALES.pdf',
      fileName: 'Política de Préstamos Personales.pdf'
    },
    {
      key: 'politica-bono-permanencia',
      label: 'Política de Bono por Permanencia',
      description: 'Política de bono por permanencia para colaboradores',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/POLITICA DE BONO POR PERMANENCIA.pdf',
      fileName: 'Política de Bono por Permanencia.pdf'
    },
    {
      key: 'renuncia-laboral',
      label: 'Renuncia Laboral',
      description: 'Formato de renuncia laboral del colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/RENUNCIA LABORAL.pdf',
      fileName: 'Renuncia Laboral.pdf'
    },
    {
      key: 'responsiva-epp',
      label: 'Responsiva Entrega de EPP',
      description: 'Responsiva de entrega de equipo de protección personal',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/Responsiva Entrega de EPP.pdf',
      fileName: 'Responsiva Entrega de EPP.pdf'
    },
    {
      key: 'responsiva-llaves',
      label: 'Responsiva Llaves',
      description: 'Responsiva de entrega de llaves al colaborador',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/Responsiva Llaves.pdf',
      fileName: 'Responsiva Llaves.pdf'
    },
    {
      key: 'rit',
      label: 'RIT — Reglamento Interior de Trabajo',
      description: 'Reglamento interior de trabajo de la empresa',
      icon: 'bi-file-earmark-pdf',
      filePath: '/formatos/RIT Reglamento interior de trabajo.pdf',
      fileName: 'RIT Reglamento Interior de Trabajo.pdf'
    }
  ];

  downloadFormat(format: FormatItem): void {
    const link = document.createElement('a');
    link.href = format.filePath;
    link.download = format.fileName;
    link.click();
  }
}
