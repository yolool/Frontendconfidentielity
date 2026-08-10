import { Component, inject, Input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent  {
  route = inject(Router)
  authserv = inject(AuthService)
  login = this.authserv.isAuthenticated;

constructor(){
  }

  ngOnInit(){
    

   } 
  

      Logout(){
       localStorage.clear()
       this.authserv.logout().subscribe({
        error : (err)=>{
               console.log(err)
        }
       })
       
     }

  
  
  
}
