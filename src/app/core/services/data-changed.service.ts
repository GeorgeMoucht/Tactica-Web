import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

export type DataDomain =
  | 'payment'
  | 'student'
  | 'enrollment'
  | 'attendance'
  | 'expense'
  | 'class'
  | 'registration'
  | 'membership';

@Injectable({ providedIn: 'root' })
export class DataChangedService {
  private changes$ = new Subject<DataDomain>();

  /** Emit a change event for a given domain. */
  notify(domain: DataDomain): void {
    this.changes$.next(domain);
  }

  /** Listen to changes on specific domains. */
  on(...domains: DataDomain[]): Observable<DataDomain> {
    return this.changes$.pipe(
      filter(d => domains.includes(d))
    );
  }

  /** Listen to all changes. */
  onAny(): Observable<DataDomain> {
    return this.changes$.asObservable();
  }
}
