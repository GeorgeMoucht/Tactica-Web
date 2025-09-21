import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CardModule, ButtonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  private auth = inject(AuthService);

  logout() {
    this.auth.logout().subscribe({
      next: () => this.auth.clearSession(),
      error: () => this.auth.clearSession()
    });
  }
}
