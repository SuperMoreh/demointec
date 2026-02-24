import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateAnalysisAdapterService } from '../../adapters/template-analysis.adapter';
import { TemplateAnalysis, ProjectStaffing } from '../../models/template-analysis';

@Component({
  selector: 'app-template-analysis',
  templateUrl: './template-analysis.component.html',
  styleUrl: './template-analysis.component.css',
  standalone: true,
  imports: [CommonModule]
})
export class TemplateAnalysisComponent implements OnInit {
  private adapter = inject(TemplateAnalysisAdapterService);

  data: TemplateAnalysis | null = null;
  searchTerm: string = '';
  isLoading: boolean = false;
  hasConsulted: boolean = false;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.hasConsulted = true;
    this.adapter.getList().subscribe({
      next: (data) => {
        this.data = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  get projects(): ProjectStaffing[] {
    const all = this.data?.projects ?? [];
    if (!this.searchTerm.trim()) return all;
    const term = this.searchTerm.toLowerCase();
    return all.filter(r => r.project?.toLowerCase().includes(term));
  }

  get totals() {
    return this.data?.totals ?? null;
  }
}
