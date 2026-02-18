export class Disability {
    private id: number | undefined;
    private id_employee: string | undefined;
    private name: string | undefined;
    private admission_date: string | undefined;
    private position: string | undefined;
    private location: string | undefined;
    private start_date: string | undefined;
    private folio: string | undefined;
    private days: number | undefined;
    private end_date: string | undefined;
    private type: string | undefined;
    private insurance_branch: string | undefined;
    private eg: boolean | undefined;
    private rt: boolean | undefined;
    private at_field: boolean | undefined;
    private st7: boolean | undefined;
    private st2: boolean | undefined;
    private return_to_work_date: string | undefined;
    private document_path: string | undefined;
    private document_name: string | undefined;
    private created_at: Date | undefined;
    private updated_at: Date | undefined;

    public get getId(): number | undefined {
        return this.id;
    }
    public set setId(id: number | undefined) {
        this.id = id;
    }

    public get getIdEmployee(): string | undefined {
        return this.id_employee;
    }
    public set setIdEmployee(id_employee: string | undefined) {
        this.id_employee = id_employee;
    }

    public get getName(): string | undefined {
        return this.name;
    }
    public set setName(name: string | undefined) {
        this.name = name;
    }

    public get getAdmissionDate(): string | undefined {
        return this.admission_date;
    }
    public set setAdmissionDate(admission_date: string | undefined) {
        this.admission_date = admission_date;
    }

    public get getPosition(): string | undefined {
        return this.position;
    }
    public set setPosition(position: string | undefined) {
        this.position = position;
    }

    public get getLocation(): string | undefined {
        return this.location;
    }
    public set setLocation(location: string | undefined) {
        this.location = location;
    }

    public get getStartDate(): string | undefined {
        return this.start_date;
    }
    public set setStartDate(start_date: string | undefined) {
        this.start_date = start_date;
    }

    public get getFolio(): string | undefined {
        return this.folio;
    }
    public set setFolio(folio: string | undefined) {
        this.folio = folio;
    }

    public get getDays(): number | undefined {
        return this.days;
    }
    public set setDays(days: number | undefined) {
        this.days = days;
    }

    public get getEndDate(): string | undefined {
        return this.end_date;
    }
    public set setEndDate(end_date: string | undefined) {
        this.end_date = end_date;
    }

    public get getType(): string | undefined {
        return this.type;
    }
    public set setType(type: string | undefined) {
        this.type = type;
    }

    public get getInsuranceBranch(): string | undefined {
        return this.insurance_branch;
    }
    public set setInsuranceBranch(insurance_branch: string | undefined) {
        this.insurance_branch = insurance_branch;
    }

    public get getEg(): boolean | undefined {
        return this.eg;
    }
    public set setEg(eg: boolean | undefined) {
        this.eg = eg;
    }

    public get getRt(): boolean | undefined {
        return this.rt;
    }
    public set setRt(rt: boolean | undefined) {
        this.rt = rt;
    }

    public get getAtField(): boolean | undefined {
        return this.at_field;
    }
    public set setAtField(at_field: boolean | undefined) {
        this.at_field = at_field;
    }

    public get getSt7(): boolean | undefined {
        return this.st7;
    }
    public set setSt7(st7: boolean | undefined) {
        this.st7 = st7;
    }

    public get getSt2(): boolean | undefined {
        return this.st2;
    }
    public set setSt2(st2: boolean | undefined) {
        this.st2 = st2;
    }

    public get getReturnToWorkDate(): string | undefined {
        return this.return_to_work_date;
    }
    public set setReturnToWorkDate(return_to_work_date: string | undefined) {
        this.return_to_work_date = return_to_work_date;
    }

    public get getDocumentPath(): string | undefined {
        return this.document_path;
    }
    public set setDocumentPath(document_path: string | undefined) {
        this.document_path = document_path;
    }

    public get getDocumentName(): string | undefined {
        return this.document_name;
    }
    public set setDocumentName(document_name: string | undefined) {
        this.document_name = document_name;
    }

    public get getCreatedAt(): Date | undefined {
        return this.created_at;
    }
    public set setCreatedAt(created_at: Date | undefined) {
        this.created_at = created_at;
    }

    public get getUpdatedAt(): Date | undefined {
        return this.updated_at;
    }
    public set setUpdatedAt(updated_at: Date | undefined) {
        this.updated_at = updated_at;
    }
}
