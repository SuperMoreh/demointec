export class Subcategories {
  private id_subcategory: string | undefined;
  private name_subcategory: string | undefined;
  private c1: string | undefined;
  private c2: string | undefined;
  private status: boolean | undefined;
  private category_id: number | undefined;

  public get getId(): string | undefined {
    return this.id_subcategory;
  }
  public set setId(id_subcategory: string | undefined) {
    this.id_subcategory = id_subcategory;
  }

  public get getName(): string | undefined {
    return this.name_subcategory;
  }
  public set setName(name_subcategory: string | undefined) {
    this.name_subcategory = name_subcategory;
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

  public get getStatus(): boolean | undefined {
    return this.status;
  }
  public set setStatus(status: boolean | undefined) {
    this.status = status;
  }

  public get getCategoryId(): number | undefined {
    return this.category_id;
  }
  public set setCategoryId(category_id: number | undefined) {
    this.category_id = category_id;
  }
}