import { Component, inject, OnInit, } from '@angular/core';
import { RouterLink,Router } from '@angular/router';
import { PersonnelDto, PersonnelService } from '../service/personnel.service';
import { EngagementService } from '../service/engagement.service';


@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent  {
  router = inject(Router)
  constructor(private personnelserv:PersonnelService ,private engagementserv:EngagementService){}
  type=''
  showexpand = false
  showcollapse = true
  sign=false
  personnel:PersonnelDto = {
    IdPersonnel:'',
    Name:'',
    Department: ''
     
  }
 

  ngOnInit(){
    const id =localStorage.getItem('id') || ''
    this.personnelserv.getPersonnel(id).subscribe({
      next : (data) =>{
        this.personnel = data
       
      },
      error : (err) =>{
        return
      }
    })
    this.engagementserv.getStatut(id).subscribe({
      next : (data)=>{
        
          if(data['statut'] === 'signed'){
          localStorage.setItem('sign',data['statut'])
          this.sign = true
        }else{
          this.sign = false
        }
      },
      error : (err) =>{
            return
      }
    })
   
    
  }
   collapse(){
    this.showcollapse=true
     this.showexpand = false
   }
   
   extand(){
     this.showcollapse=false
     this.showexpand = true
   }
   

  }
