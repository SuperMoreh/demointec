export class SalaryTabulator {
    private id_salary_tabulator: number | undefined;
    private position: string | undefined;
    private geographic_zone: string | undefined;
    private weekly_salary: number | undefined;

    public get getId(): number | undefined {
        return this.id_salary_tabulator;
    }
    public set setId(id_salary_tabulator: number | undefined) {
        this.id_salary_tabulator = id_salary_tabulator;
    }

    public get getPosition(): string | undefined {
        return this.position;
    }
    public set setPosition(position: string | undefined) {
        this.position = position;
    }

    public get getGeographicZone(): string | undefined {
        return this.geographic_zone;
    }
    public set setGeographicZone(geographic_zone: string | undefined) {
        this.geographic_zone = geographic_zone;
    }

    public get getWeeklySalary(): number | undefined {
        return this.weekly_salary;
    }
    public set setWeeklySalary(weekly_salary: number | undefined) {
        this.weekly_salary = weekly_salary;
    }
}
