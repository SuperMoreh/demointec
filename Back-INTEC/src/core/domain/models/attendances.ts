export class Attendances {
    private id_attendance: string | undefined;
    private name_user: string | undefined;
    private date: Date | undefined;
    private hour: string | undefined;
    private latitude: string | undefined;
    private length: string | undefined;
    private observation: string | undefined;
    private type: string | undefined;
    private uuid: string | undefined;
    private status: boolean | undefined;
   
  
    public get getId(): string | undefined {
      return this.id_attendance;
    }
    public set setId(id_attendance: string | undefined) {
      this.id_attendance = id_attendance;
    }
  
    public get getName(): string | undefined {
      return this.name_user;
    }
    public set setName(name_user: string | undefined) {
      this.name_user = name_user;
    }
  
    public get getDate(): Date | undefined {
      return this.date;
    }
    public set setDate(date: Date | undefined) {
      this.date = date;
    }
  
    public get getHour(): string | undefined {
      return this.hour;
    }
    public set setHour(hour: string | undefined) {
      this.hour = hour;
    }
  
    public get getLatitude(): string | undefined {
      return this.latitude;
    }
    public set setLatitude(latitude: string | undefined) {
      this.latitude = latitude ;
    }

    public get getLength(): string | undefined {
        return this.length;
    }
    public set setLength(length: string | undefined) {
        this.length = length ;
    }

    public get getUuid(): string | undefined {
        return this.uuid;
    }
    public set setUuid(uuid: string | undefined) {
        this.uuid = uuid ;
    }

    public get getType(): string | undefined {
        return this.type;
    }
    public set setType(type: string | undefined) {
        this.observation = type ;
    }

    public get getObservation(): string | undefined {
        return this.observation;
    }
    public set setObservation(observation: string | undefined) {
        this.observation = observation ;
    }

    public get getStatus(): boolean | undefined {
      return this.status;
    }
    public set setStatus(status: boolean | undefined) {
      this.status = status;
    }
  
  }