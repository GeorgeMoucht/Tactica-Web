import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, DrawerModule, ButtonModule, AvatarModule, TooltipModule, DividerModule, ToastModule, RouterLinkActive],
  templateUrl: './main.html',
  styleUrl: './main.scss'
})
export class MainLayout {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(MessageService);

  sidebarOpen = signal(false);
  user$ = this.auth.user;

  toggleSidebar() { this.sidebarOpen.update(v => !v); }

  logout() {
    this.auth.logout().subscribe({
      next: () => {
        this.auth.clearSession();
        this.toast.add({ severity: 'success', summary: 'Αποσύνδεση', life: 1500 });
        this.router.navigateByUrl('/auth/login');
      },
      error: () => {
        this.auth.clearSession();
        this.router.navigateByUrl('/auth/login');
      }
    });
  }
}
