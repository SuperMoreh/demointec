export class User {
  private id_user: number | undefined;
  private name_user: string | undefined;
  private email: string | undefined;
  private password: string | undefined;
  private phone: string | undefined;
  private createdAt: Date | undefined;
  private status: boolean | undefined;
  private role_id: number | undefined;

  public get getId(): number | undefined {
    return this.id_user;
  }
  public set setId(id_user: number | undefined) {
    this.id_user = id_user;
  }

  public get getName(): string | undefined {
    return this.name_user;
  }
  public set setName(name_user: string | undefined) {
    this.name_user = name_user;
  }

  public get getEmail(): string | undefined {
    return this.email;
  }
  public set setEmail(email: string | undefined) {
    this.email = email;
  }

  public get getPassword(): string | undefined {
    return this.password;
  }
  public set setPassword(password: string | undefined) {
    this.password = password;
  }

  public get getCreatedAt(): Date | undefined {
    return this.createdAt;
  }
  public set setCreatedAt(createdAt: Date | undefined) {
    this.createdAt = createdAt;
  }

  public get getIsActive(): boolean | undefined {
    return this.status;
  }
  public set setIsActive(status: boolean | undefined) {
    this.status = status;
  }

  public get getRoleId(): number | undefined {
    return this.role_id;
  }
  public set setRoleId(role_id: number | undefined) {
    this.role_id = role_id;
  }
}

  
  