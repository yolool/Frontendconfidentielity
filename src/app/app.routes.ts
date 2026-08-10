import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AppComponent } from './app.component';
import { RoleSelectionComponent } from './role-selection/role-selection.component';
import { EngagementFormComponent } from './engagement-form/engagement-form.component';
import { AuthformComponent } from './authform/authform.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { EngagementImpartialityComponent } from './engagement-impartiality/engagement-impartiality.component';
import { authGuard } from './auth.guard';
import { loginGuard } from './login.guard';
import { engagementImpGuard } from './engagement-imp.guard';
import { engagementGuard } from './engagement.guard';
import { signedGuard } from './signed.guard';
import { QrCodeComponent } from './qr-code/qr-code.component';

export const routes: Routes = [
   {path : 'Dashboard' , component: DashboardComponent ,canActivate:[authGuard]},
    {path : '' , component:RoleSelectionComponent , canActivate:[loginGuard]},
    {path : 'Engagment' , component:EngagementFormComponent, canActivate:[engagementGuard ,signedGuard]},
    {path:'login' ,component:AuthformComponent , canActivate:[loginGuard]},
    {path:'404' , component:NotFoundComponent},
    {path:'EngagementImp' , component:EngagementImpartialityComponent , canActivate:[engagementImpGuard , signedGuard]},
    {path:'qr' , component:QrCodeComponent}
];