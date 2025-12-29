export class Projects {
    private id_project: string | undefined;
    private name_project: string | undefined;
    private locationType: string | undefined;
    private locality: string | undefined;
    private official: string | undefined;
    private status: boolean | undefined;
   
  
    public get getId(): string | undefined {
      return this.id_project;
    }
    public set setId(id_project: string | undefined) {
      this.id_project = id_project;
    }
  
    public get getName(): string | undefined {
      return this.name_project;
    }
    public set setName(name_project: string | undefined) {
      this.name_project = name_project;
    }
  
    public get getType(): string | undefined {
      return this.locationType;
    }
    public set seType(locationType: string | undefined) {
      this.locationType = locationType;
    }
  
    public get getLocality(): string | undefined {
      return this.locality;
    }
    public set setLocality(locality: string | undefined) {
      this.locality = locality;
    }
  
    public get getOfficial(): string | undefined {
      return this.official;
    }
    public set setOfficial(official: string | undefined) {
      this.official = official ;
    }

    public get getStatus(): boolean | undefined {
      return this.status;
    }
    public set setStatus(status: boolean | undefined) {
      this.status = status;
    }
  
  }