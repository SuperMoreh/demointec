import { Query, TemplateAnalysisRepository } from "../../domain/repository/template-analysis.repository";
import database from "../../../config/db";
import { EmployeeEntity } from "../entity/employees.entity";
import { ProjectEntity } from "../entity/projects_catalog.entity";

interface ProjectStaffing {
  project: string;
  oficiales: number;
  mo: number;
  ayudantes: number;
}

interface TemplateAnalysisResult {
  projects: ProjectStaffing[];
  totals: {
    oficiales: number;
    mo: number;
    ayudantes: number;
    active_projects: number;
    requirement: number;
  };
}

export class TemplateAnalysisAdapterRepository implements TemplateAnalysisRepository {

  async list(query?: Query): Promise<TemplateAnalysisResult> {
    const employeeRepo = database.getRepository(EmployeeEntity);
    const projectRepo = database.getRepository(ProjectEntity);

    const activeProjects = await projectRepo.find({
      where: { status: true },
      select: ['id_project', 'name_project'],
    });

    const activeEmployees = await employeeRepo.find({
      where: { status: true },
      select: ['id_employee', 'position', 'project'],
    });

    const projectsMap = new Map<string, ProjectStaffing>();

    for (const proj of activeProjects) {
      projectsMap.set(proj.name_project, {
        project: proj.name_project,
        oficiales: 0,
        mo: 0,
        ayudantes: 0,
      });
    }

    for (const emp of activeEmployees) {
      if (!emp.project) continue;

      const staffing = projectsMap.get(emp.project);
      if (!staffing) continue;

      const position = (emp.position || '').toLowerCase().trim();

      if (position === 'oficial') {
        staffing.oficiales++;
      } else if (position === 'medio oficial') {
        staffing.mo++;
      } else if (position === 'ayudante') {
        staffing.ayudantes++;
      }
    }

    const projects = Array.from(projectsMap.values());

    const totals = projects.reduce(
      (acc, p) => {
        acc.oficiales += p.oficiales;
        acc.mo += p.mo;
        acc.ayudantes += p.ayudantes;
        return acc;
      },
      { oficiales: 0, mo: 0, ayudantes: 0 }
    );

    const activeProjectCount = activeProjects.length;
    const requirement = 2.5 * activeProjectCount;

    return {
      projects,
      totals: {
        ...totals,
        active_projects: activeProjectCount,
        requirement,
      },
    };
  }
}
