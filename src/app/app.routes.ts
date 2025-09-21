import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
    
    { path: 'auth/login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
    { path: 'auth/register', loadComponent: () => import('./features/auth/register/register').then(m => m.Register) },

    {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
    },

    { path: '**', redirectTo: 'auth/login' }
];
