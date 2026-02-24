export interface ProjectStaffing {
    id_project?: string | number;
    project: string;
    oficiales: number;
    mo: number;
    ayudantes: number;
    avance_percent?: number;
    requirement?: number;
}

export interface TemplateAnalysis {
    projects: ProjectStaffing[];
    totals: {
        oficiales: number;
        mo: number;
        ayudantes: number;
        active_projects: number;
        requirement: number;
    };
}
