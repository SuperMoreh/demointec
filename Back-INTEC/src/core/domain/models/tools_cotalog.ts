export class Tools {
    private id_tools: string | undefined;
    private name_tools: string | undefined;
    private code: string | undefined;
    private description: string | undefined;
    private image: string | undefined;
    private status: boolean | undefined;
   
  
    public get getId(): string | undefined {
      return this.id_tools;
    }
    public set setId(id_tools: string | undefined) {
      this.id_tools = id_tools;
    }
  
    public get getName(): string | undefined {
      return this.name_tools;
    }
    public set setName(name_tools: string | undefined) {
      this.name_tools = name_tools;
    }
  
    public get getCode(): string | undefined {
      return this.code;
    }
    public set setDate(code: string | undefined) {
      this.code = code;
    }
  
    public get getDescription(): string | undefined {
      return this.description;
    }
    public set setDescrption(description: string | undefined) {
      this.description = description;
    }
  
    public get getImage(): string | undefined {
      return this.image;
    }
    public set setImage(image: string | undefined) {
      this.image = image ;
    }

    public get getStatus(): boolean | undefined {
      return this.status;
    }
    public set setStatus(status: boolean | undefined) {
      this.status = status;
    }
  
  }