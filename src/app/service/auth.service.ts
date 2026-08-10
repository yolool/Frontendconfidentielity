import { Injectable, signal , inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap,of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface LoginDTO {
  idPersonnel: string;
  dep: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  route = inject(Router)
  private apiUrl = 'http://localhost:8080/api/v1/auth';
  
  isAuthenticated = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  login(credentials: LoginDTO): Observable<any> { 
    return this.http.post(`${this.apiUrl}/login`, credentials,{withCredentials:true}).pipe(
      tap(() => {
        this.isAuthenticated.set(true);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`http://localhost:8080/logout`, {}).pipe(
      tap(() => {
        this.isAuthenticated.set(false);
         this.route.navigate(['/'])
      })
    );
  }
  checkSession(): Observable<boolean> {
  return this.http.get(
    `${this.apiUrl}/me`,
    {
      withCredentials: true
    }
  ).pipe(
    tap(() => this.isAuthenticated.set(true)),
    map(() => true),
    catchError(() => {
      this.isAuthenticated.set(false);
      return of(false);
    })
  );
}
checkrole(){
  return this.http.get( `${this.apiUrl}/me`,{
    withCredentials:true
  })
}

}