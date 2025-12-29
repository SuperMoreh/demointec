export class Role {
    private id_role: number | undefined;
    private name_role: string | undefined;
    private user_id: number | undefined;
    private status: boolean | undefined;
  
    public get getId(): number | undefined {
      return this.id_role;
    }
    public set setId(id_rol: number | undefined) {
      this.id_role = id_rol;
    }
  
    public get getName(): string | undefined {
      return this.name_role;
    }
    public set setName(name_rol: string | undefined) {
      this.name_role = name_rol;
    }

    public get getIsActive(): boolean | undefined {
      return this.status;
    }
    public set setIsActive(status: boolean | undefined) {
      this.status = status;
    }
  
    public get getUserId(): number | undefined {
      return this.user_id;
    }
    public set setUserId(user_id: number | undefined) {
      this.user_id = user_id;
    }
  }
  