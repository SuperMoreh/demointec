export interface User {
    id_user?:number;
    name_user:string;
    email:string;
    password:string;
    phone:string;
    photo:Blob;
    createdAt:Date;
    status:boolean;
    role_id:number;
};