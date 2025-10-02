import { Component, inject } from "@angular/core";
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormControl,
  FormGroup
} from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../core/services/auth.service";
import { MessageService } from "primeng/api";
import { finalize } from 'rxjs';

import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { CheckboxModule } from "primeng/checkbox";
import { AuthPayload, RegisterRequest } from "../../../core/models";

type RegisterForm = {
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirm: FormControl<string>;
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    InputTextModule, PasswordModule, ButtonModule, DividerModule,
    IconFieldModule, InputIconModule, CheckboxModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(MessageService);

  loading = false;

  form: FormGroup<RegisterForm> = this.fb.nonNullable.group({
    name: this.fb.nonNullable.control('', Validators.required),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    password: this.fb.nonNullable.control('', Validators.required),
    confirm: this.fb.nonNullable.control('', Validators.required),
  });

  get nameCtrl() { return this.form.controls.name; }
  get emailCtrl() { return this.form.controls.email; }
  get passwordCtrl() { return this.form.controls.password; }
  get confirmCtrl() { return this.form.controls.confirm; }

  submit() {
    if (this.form.invalid || this.loading) return;

    const { name, email, password, confirm } = this.form.getRawValue();

    if (password !== confirm) {
      this.confirmCtrl.setErrors({ mismatch: true });
      return;
    }

    this.loading = true;

    const dto: RegisterRequest = {
      name,
      email,
      password,
      password_confirmation: confirm
    };

    this.auth.register(dto)
    .pipe(finalize(() => this.loading = false))
    .subscribe({
      next: (payload: AuthPayload) => {
        this.auth.setSession({
          access_token: payload.access_token!,
          refresh_token: payload.refresh_token!,
          token_type: payload.token_type,
          user: payload.user
        });

        this.toast.add({
          severity: 'success',
          summary: 'Εγγραφή επιτυχής',
          detail: `Καλωσόρισες, ${payload.user.name}!`,
          life: 3000
        });

        setTimeout(() => this.router.navigateByUrl('/dashboard'), 300);
        // this.router.navigateByUrl('/dashboard');
      },
      error: (err) => {
        const detail = err?.error?.message || 'Η εγγραφή απέτυχε';
        this.toast.add({
          severity: 'error',
          summary: 'Σφάλμα',
          detail,
          life: 4000
        });
      },
      complete: () => (this.loading = false)
    });
  }
}
