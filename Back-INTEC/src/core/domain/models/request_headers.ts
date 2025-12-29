import { Double } from "typeorm";

export class Materials {
    private id_header: string | undefined;
    private auth1: string | undefined;
    private auth2: string | undefined;
    private auth3: string | undefined;
    private status_header: string | undefined;
    private locationType: string | undefined;
    private date: Date | undefined;
    private hour: string | undefined;
    private revision_date1: Date | undefined;
    private revision_date2: Date | undefined;
    private revision_date3: Date | undefined;
    private folio_request: string | undefined;
    private locality: string | undefined;
    private notes: string | undefined;
    private project: string | undefined;
    private official: string | undefined;
    private revision1: string | undefined;
    private revision2: string | undefined;
    private revision3: string | undefined;
    private requester: string | undefined;
    private work: string | undefined;
    private status: boolean | undefined;
   
  
    public get getId(): string | undefined {
      return this.id_header;
    }
    public set setId(id_header: string | undefined) {
      this.id_header = id_header;
    }
  
    public get getAuth1(): string | undefined {
      return this.auth1;
    }
    public set setAuth1(auth1: string | undefined) {
      this.auth1 = auth1;
    }
  
    public get getAuth2(): string | undefined {
      return this.auth2;
    }
    public set setAuth2(auth2: string | undefined) {
      this.auth2 = auth2;
    }
  
    public get getAuth3(): string | undefined {
      return this.auth3;
    }
    public set setAuth3(auth3: string | undefined) {
      this.auth3 = auth3;
    }

    public get getS(): string | undefined {
      return this.status_header;
    }
    public set setS(status_header: string | undefined) {
      this.status_header = status_header;
    }

    public get getLocation(): string | undefined {
      return this.locationType;
    }
    public set setAmount(locationType: string | undefined) {
      this.locationType = locationType ;
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
      this.hour = hour ;
    }

    public get getDateR1(): Date | undefined {
      return this.revision_date1;
    }
    public set setDateR1(revision_date1: Date | undefined) {
      this.revision_date1 = revision_date1;
    }

    public get getDateR2(): Date | undefined {
      return this.revision_date2;
    }
    public set setDateR2(revision_date2: Date | undefined) {
      this.revision_date2 = revision_date2;
    }

    public get getDateR3(): Date | undefined {
      return this.revision_date3;
    }
    public set setDateR3(revision_date3: Date | undefined) {
      this.revision_date3 = revision_date3;
    }

    public get getFolio(): string | undefined {
      return this.folio_request;
    }
    public set setFolio(folio_request: string | undefined) {
      this.folio_request = folio_request;
    }

    public get getLocality(): string | undefined {
      return this.locality;
    }
    public set setLocality(locality: string | undefined) {
      this.locality = locality;
    }

    public get getNotes(): string | undefined {
      return this.notes;
    }
    public set setNotes(notes: string | undefined) {
      this.notes = notes ;
    }

    public get getProject(): string | undefined {
      return this.project;
    }
    public set setProject(proyect: string | undefined) {
      this.project = proyect ;
    }

    public get getOfficial(): string | undefined {
      return this.official;
    }
    public set setOfficial(official: string | undefined) {
      this.official = official ;
    }

    public get getRevision1(): string | undefined {
      return this.revision1;
    }
    public set setRevision1(revision1: string | undefined) {
      this.revision1 = revision1 ;
    }

    public get getRevision2(): string | undefined {
      return this.revision2;
    }
    public set setRevision2(revision2: string | undefined) {
      this.revision2 = revision2 ;
    }

    public get getRevision3(): string | undefined {
      return this.revision3;
    }
    public set setRevision3(revision3: string | undefined) {
      this.revision3 = revision3 ;
    }

    public get getRequester(): string | undefined {
      return this.requester;
    }
    public set setRequester(requester: string | undefined) {
      this.requester = requester ;
    }

    public get getWork(): string | undefined {
      return this.work;
    }
    public set setWork(work: string | undefined) {
      this.work = work ;
    }

    public get getStatus(): boolean | undefined {
      return this.status;
    }
    public set setStatus(status: boolean | undefined) {
      this.status = status;
    }
  
}