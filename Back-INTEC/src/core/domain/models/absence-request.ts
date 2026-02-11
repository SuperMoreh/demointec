export class AbsenceRequest {
    private id: string | undefined;
    private id_employee: string | undefined;
    private type: string | undefined;
    private start_date: Date | undefined;
    private end_date: Date | undefined;
    private days_count: number | undefined;
    private reason: string | undefined;
    private description: string | undefined;
    private with_pay: boolean | undefined;
    private vacation_year: number | undefined;
    private document_url: string | undefined;
    private request_date: Date | undefined;

    public get getId(): string | undefined {
        return this.id;
    }
    public set setId(id: string | undefined) {
        this.id = id;
    }

    public get getIdEmployee(): string | undefined {
        return this.id_employee;
    }
    public set setIdEmployee(id_employee: string | undefined) {
        this.id_employee = id_employee;
    }

    public get getType(): string | undefined {
        return this.type;
    }
    public set setType(type: string | undefined) {
        this.type = type;
    }

    public get getStartDate(): Date | undefined {
        return this.start_date;
    }
    public set setStartDate(start_date: Date | undefined) {
        this.start_date = start_date;
    }

    public get getEndDate(): Date | undefined {
        return this.end_date;
    }
    public set setEndDate(end_date: Date | undefined) {
        this.end_date = end_date;
    }

    public get getDaysCount(): number | undefined {
        return this.days_count;
    }
    public set setDaysCount(days_count: number | undefined) {
        this.days_count = days_count;
    }

    public get getReason(): string | undefined {
        return this.reason;
    }
    public set setReason(reason: string | undefined) {
        this.reason = reason;
    }

    public get getDescription(): string | undefined {
        return this.description;
    }
    public set setDescription(description: string | undefined) {
        this.description = description;
    }

    public get getWithPay(): boolean | undefined {
        return this.with_pay;
    }
    public set setWithPay(with_pay: boolean | undefined) {
        this.with_pay = with_pay;
    }

    public get getVacationYear(): number | undefined {
        return this.vacation_year;
    }
    public set setVacationYear(vacation_year: number | undefined) {
        this.vacation_year = vacation_year;
    }

    public get getDocumentUrl(): string | undefined {
        return this.document_url;
    }
    public set setDocumentUrl(document_url: string | undefined) {
        this.document_url = document_url;
    }

    public get getRequestDate(): Date | undefined {
        return this.request_date;
    }
    public set setRequestDate(request_date: Date | undefined) {
        this.request_date = request_date;
    }
}
