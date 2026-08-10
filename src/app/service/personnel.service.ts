import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export interface DepartementDto{
    dep:string
}
export interface PersonnelDto{
       IdPersonnel : string,
       Name:string,
       Department:string,
}



@Injectable({
  providedIn: 'root'
})
export class PersonnelService {
   apiUrl =   "http://localhost:8080/api/v1/Personnel"
  constructor(private http:HttpClient) {}

  getdeps():Observable<DepartementDto[]>{
    return this.http.get<DepartementDto[]>(`${this.apiUrl}/deps`)
  }

  getPersonnel(id:string){
      
      return this.http.get<PersonnelDto>(`${this.apiUrl}/${id}`)
  }
}
