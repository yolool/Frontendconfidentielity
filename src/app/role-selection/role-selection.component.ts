import { NgFor } from '@angular/common';
import { Component,inject} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {Router} from '@angular/router';
@Component({
  selector: 'app-role-selection',
  imports: [ReactiveFormsModule],
  templateUrl: './role-selection.component.html',
  styleUrl: './role-selection.component.css'
})
export class RoleSelectionComponent {
  statut:any
  private router = inject(Router);
  showoption : any
   fb:FormBuilder = new FormBuilder
   radioGroupe = this.fb.group({
    role : [''] 
   })

   ngOnInit() {
  this.statut = localStorage.getItem('msg');
  localStorage.clear()
    

  if (this.statut) {
    localStorage.removeItem('msg');

       setTimeout(() => {
      this.statut = '';
         }, 5000);
     }
    }

   verifierTE(){
    if(this.radioGroupe.get('role')?.value  === 'PersonelTE' ){
       this.showoption = true
    }else if (this.radioGroupe.get('role')?.value  === 'PersonelExtern'){
      this.showoption = false
    }
   }
     
      OnSubmit(){
          if (this.radioGroupe.get('role')?.value  === 'PersonelExtern'){
            this.router.navigate(['/Engagment'])
            localStorage.setItem('type','guest')

          }else if(this.radioGroupe.get('role')?.value  === 'PersonelLaboTE'){
                this.router.navigate(['/login'])
                localStorage.setItem('as','PersonelLaboTE')
                
          }else if(this.radioGroupe.get('role')?.value  === 'AutrePersonelTE'){
                  this.router.navigate(['/login'])
                  localStorage.setItem('as','AutrePersonelTE')
          }

      }
}
