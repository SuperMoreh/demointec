export interface SalaryReportRepository {
    list(): Promise<any[]>;
}
