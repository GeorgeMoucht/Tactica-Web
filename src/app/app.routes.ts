// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayout } from './layouts/main/main';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Dashboard } from './features/dashboard/dashboard';
import { StudentsList } from './features/students/list/list';
import { NewStudent } from './features/students/new/new';
import { RegistrationNew } from './features/registration/new/new';
import { RegistrationList } from './features/registration/list/list';
import { StudentRegistrationWizard } from './features/students/student-registration-wizard/student-registration-wizard';
import { GuardiansList } from './features/guardians/list/list';

export const routes: Routes = [
  { path: 'auth/login', component: Login },
  { path: 'auth/register', component: Register },

  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'students', component: StudentsList },
      { path: 'students/new', component: NewStudent },
      // placeholders for next features:
      // { path: 'students', loadComponent: () => import('./features/students/list').then(m => m.StudentsList) },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      
      { path: 'registrations', component: RegistrationList},
      // { path: 'registrations/new', component: RegistrationNew }
      { path: 'registrations/new', component: StudentRegistrationWizard },

      { path: 'guardians', component: GuardiansList},
    ]
  },

  { path: '**', redirectTo: '' }
];
