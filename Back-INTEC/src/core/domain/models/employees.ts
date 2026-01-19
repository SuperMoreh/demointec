export class Employee {
  private id_employee: number | undefined;
  private name_employee: string | undefined;
  private email: string | undefined;
  private phone: string | undefined;
  private pAut1: string | undefined;
  private pAut2: string | undefined;
  private pAut3: string | undefined;
  private pCapSol: string | undefined;
  private pComSol: string | undefined;
  private pControlSol: string | undefined;
  private pEdCats: string | undefined;
  private pEdSol: string | undefined;
  private pEstadisticas: string | undefined;
  private pHistorial: string | undefined;
  private pUsuarios: string | undefined;
  private pVerCats: string | undefined;
  private pPermisosVacaciones: string | undefined;
  private status: boolean | undefined;

  private admission_date: string | undefined;
  private position: string | undefined;
  private location: string | undefined;
  private gender: string | undefined;
  private age: number | undefined;
  private marital_status: string | undefined;
  private education_level: string | undefined;
  private ine_code: string | undefined;
  private address: string | undefined;
  private birth_place: string | undefined;
  private birth_date: string | undefined;
  private nss: string | undefined;
  private rfc: string | undefined;
  private curp: string | undefined;
  private children_count: number | undefined;
  private child1_name: string | undefined;
  private child1_birth_date: string | undefined;
  private child2_name: string | undefined;
  private child2_birth_date: string | undefined;
  private child3_name: string | undefined;
  private child3_birth_date: string | undefined;
  private child4_name: string | undefined;
  private child4_birth_date: string | undefined;
  private child5_name: string | undefined;
  private child5_birth_date: string | undefined;
  private beneficiary: string | undefined;
  private beneficiary_relationship: string | undefined;
  private beneficiary_percentage: string | undefined;
  private infonavit_credit_number: string | undefined;
  private infonavit_factor: string | undefined;
  private blood_type: string | undefined;
  private weight: string | undefined;
  private height: string | undefined;
  private emergency_phone: string | undefined;
  private emergency_contact_name: string | undefined;
  private emergency_contact_relationship: string | undefined;
  private allergies: string | undefined;
  private contract_expiration: string | undefined;


  public get getId(): number | undefined {
    return this.id_employee;
  }
  public set setId(id_employee: number | undefined) {
    this.id_employee = id_employee;
  }

  public get getName(): string | undefined {
    return this.name_employee;
  }
  public set setName(name_employee: string | undefined) {
    this.name_employee = name_employee;
  }

  public get getEmail(): string | undefined {
    return this.email;
  }
  public set setEmail(email: string | undefined) {
    this.email = email;
  }

  public get getPhone(): string | undefined {
    return this.phone;
  }
  public set setPhone(phone: string | undefined) {
    this.phone = phone;
  }

  public get getpAut1(): string | undefined {
    return this.pAut1;
  }
  public set setpAut1(pAut1: string | undefined) {
    this.pAut1 = pAut1;
  }

  public get getpAut2(): string | undefined {
    return this.pAut2;
  }
  public set setpAut2(pAut2: string | undefined) {
    this.pAut2 = pAut2;
  }

  public get getpAut3(): string | undefined {
    return this.pAut3;
  }
  public set setpAut3(pAut3: string | undefined) {
    this.pAut3 = pAut3;
  }

  public get getpCapSol(): string | undefined {
    return this.pCapSol;
  }
  public set setpCapSol(pCapSol: string | undefined) {
    this.pCapSol = pCapSol;
  }

  public get getpComSol(): string | undefined {
    return this.pComSol;
  }
  public set setpComSol(pComSol: string | undefined) {
    this.pComSol = pComSol;
  }

  public get getpControlSol(): string | undefined {
    return this.pControlSol;
  }
  public set setpControlSol(pControlSol: string | undefined) {
    this.pControlSol = pControlSol;
  }

  public get getpEdCats(): string | undefined {
    return this.pEdCats;
  }
  public set setpEdCats(pEdCats: string | undefined) {
    this.pEdCats = pEdCats;
  }

  public get getpEdSol(): string | undefined {
    return this.pEdSol;
  }
  public set setpEdSol(pEdSol: string | undefined) {
    this.pEdSol = pEdSol;
  }

  public get getpEstadisticas(): string | undefined {
    return this.pEstadisticas;
  }
  public set setpEstadisticas(pEstadisticas: string | undefined) {
    this.pEstadisticas = pEstadisticas;
  }

  public get getpHistorial(): string | undefined {
    return this.pHistorial;
  }
  public set setpHistorial(pHistorial: string | undefined) {
    this.pHistorial = pHistorial;
  }

  public get getpUsuarios(): string | undefined {
    return this.pUsuarios;
  }
  public set setpUsuarios(pUsuarios: string | undefined) {
    this.pUsuarios = pUsuarios;
  }

  public get getpVerCats(): string | undefined {
    return this.pVerCats;
  }
  public set setpVerCats(pVerCats: string | undefined) {
    this.pVerCats = pVerCats;
  }

  public get getpPermisosVacaciones(): string | undefined {
    return this.pPermisosVacaciones;
  }
  public set setpPermisosVacaciones(pPermisosVacaciones: string | undefined) {
    this.pPermisosVacaciones = pPermisosVacaciones;
  }

  public get getStatus(): boolean | undefined {
    return this.status;
  }
  public set setStatus(status: boolean | undefined) {
    this.status = status;
  }

  public get getAdmissionDate(): string | undefined { return this.admission_date; }
  public set setAdmissionDate(admission_date: string | undefined) { this.admission_date = admission_date; }

  public get getPosition(): string | undefined { return this.position; }
  public set setPosition(position: string | undefined) { this.position = position; }

  public get getLocation(): string | undefined { return this.location; }
  public set setLocation(location: string | undefined) { this.location = location; }

  public get getGender(): string | undefined { return this.gender; }
  public set setGender(gender: string | undefined) { this.gender = gender; }

  public get getAge(): number | undefined { return this.age; }
  public set setAge(age: number | undefined) { this.age = age; }

  public get getMaritalStatus(): string | undefined { return this.marital_status; }
  public set setMaritalStatus(marital_status: string | undefined) { this.marital_status = marital_status; }

  public get getEducationLevel(): string | undefined { return this.education_level; }
  public set setEducationLevel(education_level: string | undefined) { this.education_level = education_level; }

  public get getIneCode(): string | undefined { return this.ine_code; }
  public set setIneCode(ine_code: string | undefined) { this.ine_code = ine_code; }

  public get getAddress(): string | undefined { return this.address; }
  public set setAddress(address: string | undefined) { this.address = address; }

  public get getBirthPlace(): string | undefined { return this.birth_place; }
  public set setBirthPlace(birth_place: string | undefined) { this.birth_place = birth_place; }

  public get getBirthDate(): string | undefined { return this.birth_date; }
  public set setBirthDate(birth_date: string | undefined) { this.birth_date = birth_date; }

  public get getNss(): string | undefined { return this.nss; }
  public set setNss(nss: string | undefined) { this.nss = nss; }

  public get getRfc(): string | undefined { return this.rfc; }
  public set setRfc(rfc: string | undefined) { this.rfc = rfc; }

  public get getCurp(): string | undefined { return this.curp; }
  public set setCurp(curp: string | undefined) { this.curp = curp; }

  public get getChildrenCount(): number | undefined { return this.children_count; }
  public set setChildrenCount(children_count: number | undefined) { this.children_count = children_count; }

  public get getChild1Name(): string | undefined { return this.child1_name; }
  public set setChild1Name(child1_name: string | undefined) { this.child1_name = child1_name; }

  public get getChild1BirthDate(): string | undefined { return this.child1_birth_date; }
  public set setChild1BirthDate(child1_birth_date: string | undefined) { this.child1_birth_date = child1_birth_date; }

  public get getChild2Name(): string | undefined { return this.child2_name; }
  public set setChild2Name(child2_name: string | undefined) { this.child2_name = child2_name; }

  public get getChild2BirthDate(): string | undefined { return this.child2_birth_date; }
  public set setChild2BirthDate(child2_birth_date: string | undefined) { this.child2_birth_date = child2_birth_date; }

  public get getChild3Name(): string | undefined { return this.child3_name; }
  public set setChild3Name(child3_name: string | undefined) { this.child3_name = child3_name; }

  public get getChild3BirthDate(): string | undefined { return this.child3_birth_date; }
  public set setChild3BirthDate(child3_birth_date: string | undefined) { this.child3_birth_date = child3_birth_date; }

  public get getChild4Name(): string | undefined { return this.child4_name; }
  public set setChild4Name(child4_name: string | undefined) { this.child4_name = child4_name; }

  public get getChild4BirthDate(): string | undefined { return this.child4_birth_date; }
  public set setChild4BirthDate(child4_birth_date: string | undefined) { this.child4_birth_date = child4_birth_date; }

  public get getChild5Name(): string | undefined { return this.child5_name; }
  public set setChild5Name(child5_name: string | undefined) { this.child5_name = child5_name; }

  public get getChild5BirthDate(): string | undefined { return this.child5_birth_date; }
  public set setChild5BirthDate(child5_birth_date: string | undefined) { this.child5_birth_date = child5_birth_date; }

  public get getBeneficiary(): string | undefined { return this.beneficiary; }
  public set setBeneficiary(beneficiary: string | undefined) { this.beneficiary = beneficiary; }

  public get getBeneficiaryRelationship(): string | undefined { return this.beneficiary_relationship; }
  public set setBeneficiaryRelationship(beneficiary_relationship: string | undefined) { this.beneficiary_relationship = beneficiary_relationship; }

  public get getBeneficiaryPercentage(): string | undefined { return this.beneficiary_percentage; }
  public set setBeneficiaryPercentage(beneficiary_percentage: string | undefined) { this.beneficiary_percentage = beneficiary_percentage; }

  public get getInfonavitCreditNumber(): string | undefined { return this.infonavit_credit_number; }
  public set setInfonavitCreditNumber(infonavit_credit_number: string | undefined) { this.infonavit_credit_number = infonavit_credit_number; }

  public get getInfonavitFactor(): string | undefined { return this.infonavit_factor; }
  public set setInfonavitFactor(infonavit_factor: string | undefined) { this.infonavit_factor = infonavit_factor; }

  public get getBloodType(): string | undefined { return this.blood_type; }
  public set setBloodType(blood_type: string | undefined) { this.blood_type = blood_type; }

  public get getWeight(): string | undefined { return this.weight; }
  public set setWeight(weight: string | undefined) { this.weight = weight; }

  public get getHeight(): string | undefined { return this.height; }
  public set setHeight(height: string | undefined) { this.height = height; }

  public get getEmergencyPhone(): string | undefined { return this.emergency_phone; }
  public set setEmergencyPhone(emergency_phone: string | undefined) { this.emergency_phone = emergency_phone; }

  public get getEmergencyContactName(): string | undefined { return this.emergency_contact_name; }
  public set setEmergencyContactName(emergency_contact_name: string | undefined) { this.emergency_contact_name = emergency_contact_name; }

  public get getEmergencyContactRelationship(): string | undefined { return this.emergency_contact_relationship; }
  public set setEmergencyContactRelationship(emergency_contact_relationship: string | undefined) { this.emergency_contact_relationship = emergency_contact_relationship; }

  public get getAllergies(): string | undefined { return this.allergies; }
  public set setAllergies(allergies: string | undefined) { this.allergies = allergies; }

  public get getContractExpiration(): string | undefined { return this.contract_expiration; }
  public set setContractExpiration(contract_expiration: string | undefined) { this.contract_expiration = contract_expiration; }
}
