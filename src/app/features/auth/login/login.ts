import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AuthPayload, LoginRequest } from '../../../core/models';

type LoginForm = {
  email: FormControl<string>; 
  password: FormControl<string>;
  remember: FormControl<boolean>;
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, IconFieldModule, InputIconModule, RouterLink, InputTextModule, PasswordModule, CheckboxModule, ButtonModule, DividerModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;

  form: FormGroup<LoginForm> = this.fb.nonNullable.group({
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    password: this.fb.nonNullable.control('', Validators.required),
    remember: this.fb.nonNullable.control(true)
  });

  get email() { return this.form.controls.email; }
  get password() { return this.form.controls.password; }

  submit() {
    if (this.form.invalid || this.loading) {
      return;
    }
    this.loading = true;

    const { email, password } = this.form.getRawValue();

    const dto: LoginRequest = { email, password}

    this.auth.login(dto).subscribe({
      next: (payload: AuthPayload) => {
        this.auth.setSession({
          access_token: payload.access_token!,
          refresh_token: payload.refresh_token!,
          token_type: payload.token_type,
          user: payload.user
        });
        this.router.navigateByUrl('/dashboard');
      },
      error: (err) => alert(err?.error?.message || 'Login failed'),
      complete: () => (this.loading = false)
    });
  }
}
