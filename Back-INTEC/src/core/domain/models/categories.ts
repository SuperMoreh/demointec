export class Categories {
    private id_category: number | undefined;
    private name_category: string | undefined;
    private status: boolean | undefined;
  
    public get getId(): number | undefined {
      return this.id_category;
    }
    public set setId(id_category: number | undefined) {
      this.id_category = id_category;
    }
  
    public get getName(): string | undefined {
      return this.name_category;
    }
    public set setName(name_category: string | undefined) {
      this.name_category = name_category;
    }

    public get getIsActive(): boolean | undefined {
      return this.status;
    }
    public set setIsActive(status: boolean | undefined) {
      this.status = status;
    }
  
}