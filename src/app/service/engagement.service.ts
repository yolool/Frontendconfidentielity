import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface EngagementDto{
          id:bigint,
          name:string,
          type:string,
          statut:string,
          url:string,
          IdPersonnel:string
}

@Injectable({
  providedIn: 'root'
})
export class EngagementService {
   

  private apiUrl = 'http://localhost:8080/api/v1/engagement';
  constructor(private http:HttpClient) {}

  uploadEngagement(file:File ,subject:string,idPersonnel:string ): Observable<EngagementDto>{
    const formdata = new FormData()
    formdata.append('file' , file , file.name)
    formdata.append('subject', subject);
    if(idPersonnel){
    formdata.append('idPersonnel' ,idPersonnel);}
    return this.http.post<EngagementDto>(`${this.apiUrl}/upload`,formdata)
    
  }
  
  getStatut(id:string){
    return this.http.get<EngagementDto>(`${this.apiUrl}/perso/${id}`)
  }

}
