import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, of } from 'rxjs';
import { MessageService } from 'primeng/api';

let refreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const toast = inject(MessageService);

  // Attach Authorization only for our API calls
  const isApi = req.url.includes('/api/');
  const token = auth.token();
  const type = auth.tokenType();

  if (isApi && token) {
    req = req.clone({ setHeaders: { Authorization: `${type} ${token}` } });
  }

  const handleUnauthorized = () => {
    // If we have a refresh token (remember = true), try to refresh once.
    const rt = auth.refreshToken();

    if (rt && !refreshing) {
      refreshing = true;
      return auth.refresh(rt).pipe(
        switchMap((p) => {
          refreshing = false;

          // If backend issued a new token, persist it (will obey remember policy in setSession).
          if (p?.access_token) {
            auth.setSession({
              access_token: p.access_token,
              refresh_token: p.refresh_token,
              token_type: p.token_type || 'Bearer'
            });

            // Retry the original request with fresh token
            const retry = req.clone({
              setHeaders: { Authorization: `${auth.tokenType()} ${auth.token()}` }
            });
            return next(retry);
          }

          // No token in refresh response → treat as logged out
          auth.clearSession();
          toast.add({
            severity: 'warn',
            summary: 'Αποσύνδεση',
            detail: 'Η συνεδρία σας έληξη. Παρακαλώ συνδεθείτε ξανά.',
            life: 4000
          });
          router.navigateByUrl('/auth/login');
          return throwError(() => new Error('Unauthorized'));
        }),
        catchError(err => {
          refreshing = false;
          auth.clearSession();
          toast.add({
            severity: 'warn',
            summary: 'Αποσύνδεση',
            detail: 'Η συνεδρία σας έληξε. Παρακαλώ συνδεθείτε ξανά.',
            life: 4000
          });
          router.navigateByUrl('/auth/login');
          return throwError(() => err);
        })
      );
    }

    // No refresh token (remember = false) OR already refreshing → just logout and redirect
    auth.clearSession();
    toast.add({
      severity: 'warn',
      summary: 'Αποσύνδεση',
      detail: 'Η συνεδρία σας έληξε. Παρακαλώ συνδεθείτε ξανά.',
      life: 4000
    });
    router.navigateByUrl('/auth/login');
    return throwError(() => new Error('Unauthorized'));
  };

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (isApi && (err.status === 401 || err.status === 419)) {
        // 419 (Laravel “Page Expired”/CSRF) sometimes appears for expired tokens too
        return handleUnauthorized();
      }

      // Optional: treat forbidden (403) as logged out if your API uses it that way
      // if (isApi && err.status === 403) { auth.clearSession(); router.navigateByUrl('/auth/login'); }

      return throwError(() => err);
    })
  );
};
