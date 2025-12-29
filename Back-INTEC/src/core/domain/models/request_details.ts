import { Double } from "typeorm";

export class Materials {
    private id_detail: string | undefined;
    private name: string | undefined;
    private amount: number | undefined;
    private code: string | undefined;
    private c1: string | undefined;
    private c2: string | undefined;
    private unit_cost: Double | undefined;
    private description: string | undefined;
    private observation: string | undefined;
    private folio_request: string | undefined;
    private category1: string | undefined;
    private category: string | undefined;
    private subcategory: string | undefined;
    private unit: string | undefined;
    private status: boolean | undefined;
   
  
    public get getId(): string | undefined {
      return this.id_detail;
    }
    public set setId(id_detail: string | undefined) {
      this.id_detail = id_detail;
    }
  
    public get getName(): string | undefined {
      return this.name;
    }
    public set setName(name: string | undefined) {
      this.name = name;
    }
  
    public get getCode(): string | undefined {
      return this.code;
    }
    public set setDate(code: string | undefined) {
      this.code = code;
    }
  
    public get getC1(): string | undefined {
      return this.c1;
    }
    public set setC1(c1: string | undefined) {
      this.c1 = c1;
    }

    public get getC2(): string | undefined {
      return this.c2;
    }
    public set setC2(c2: string | undefined) {
      this.c2 = c2;
    }

    public get getAmount(): number | undefined {
      return this.amount;
    }
    public set setAmount(amount: number | undefined) {
      this.amount = amount ;
    }

    public get getFolio(): string | undefined {
      return this.folio_request;
    }
    public set setFolio(folio_request: string | undefined) {
      this.folio_request = folio_request;
    }

    public get getCost(): Double | undefined {
      return this.unit_cost;
    }
    public set setCost(unit_cost: Double | undefined) {
      this.unit_cost = unit_cost ;
    }

    public get getDescrption(): string | undefined {
      return this.description;
    }
    public set setDescrption(description: string | undefined) {
      this.description = description;
    }

    public get getObservation(): string | undefined {
      return this.observation;
    }
    public set setObservation(observation: string | undefined) {
      this.observation = observation;
    }

    public get getCategory1(): string | undefined {
      return this.category1;
    }
    public set setCategory1(category1: string | undefined) {
      this.category1 = category1 ;
    }

    public get getCategory(): string | undefined {
      return this.category;
    }
    public set setCategory(category: string | undefined) {
      this.category = category ;
    }

     public get getSubCategory(): string | undefined {
      return this.subcategory;
    }
    public set setSubCategory(subcategory: string | undefined) {
      this.subcategory = subcategory ;
    }

    public get getUnit(): string | undefined {
      return this.unit;
    }
    public set setUnit(unit: string | undefined) {
      this.unit = unit ;
    }

    public get getStatus(): boolean | undefined {
      return this.status;
    }
    public set setStatus(status: boolean | undefined) {
      this.status = status;
    }
  
}