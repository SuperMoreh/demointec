export class Materials {
    private id_materials: string | undefined;
    private name_materials: string | undefined;
    private code: string | undefined;
    private c1: string | undefined;
    private c2: string | undefined;
    private image: string | undefined;
    private category: string | undefined;
    private subcategory: string | undefined;
    private unit: string | undefined;
    private status: boolean | undefined;
   
  
    public get getId(): string | undefined {
      return this.id_materials;
    }
    public set setId(id_materials: string | undefined) {
      this.id_materials = id_materials;
    }
  
    public get getName(): string | undefined {
      return this.name_materials;
    }
    public set setName(name_materials: string | undefined) {
      this.name_materials = name_materials;
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

    public get getImage(): string | undefined {
      return this.image;
    }
    public set setImage(image: string | undefined) {
      this.image = image ;
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