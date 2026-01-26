import { Component, OnInit, OnDestroy, AfterViewInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AvatarModule } from 'primeng/avatar';
import { MessageService, ConfirmationService } from 'primeng/api';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CompteRenduFacade } from '../../../application/use-cases';
import { CompteRendu } from '../../../domain/models';
import { StatutCR } from '../../../domain/enums';

@Component({
  selector: 'app-validation',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    CardModule,
    TooltipModule,
    ToastModule,
    ConfirmDialogModule,
    AvatarModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="validation-container">
      <div class="page-header">
        <div class="header-content">
          <h1>Validation des Comptes Rendus</h1>
          <p>Validez les comptes rendus soumis par vos disciples</p>
        </div>
        <div class="header-stats">
          <div class="stat-badge pending">
            <span class="stat-count">{{ pendingCount }}</span>
            <span class="stat-label">En attente</span>
          </div>
        </div>
      </div>

      <p-card styleClass="validation-card">
        <p-table
          [value]="pendingCRs"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 25]"
          styleClass="p-datatable-striped">

          <ng-template pTemplate="header">
            <tr>
              <th>Fidèle</th>
              <th pSortableColumn="date">Date <p-sortIcon field="date"></p-sortIcon></th>
              <th>RDQD</th>
              <th>Prière</th>
              <th>Soumis le</th>
              <th>Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-cr>
            <tr>
              <td>
                <div class="user-cell">
                  <p-avatar
                    icon="pi pi-user"
                    shape="circle"
                    styleClass="user-avatar">
                  </p-avatar>
                  <span class="user-name">Utilisateur</span>
                </div>
              </td>
              <td>
                <div class="date-cell">
                  <span class="date-value">{{ cr.date | date:'dd/MM/yyyy' }}</span>
                  <span class="date-day">{{ cr.date | date:'EEEE':'':'fr' }}</span>
                </div>
              </td>
              <td>
                <div class="rdqd-cell">
                  <span class="rdqd-value">{{ cr.rdqd }}</span>
                  <div class="rdqd-progress">
                    <div
                      class="rdqd-bar"
                      [style.width.%]="getRdqdPercentage(cr.rdqd)">
                    </div>
                  </div>
                </div>
              </td>
              <td>{{ cr.priereSeule }}</td>
              <td>{{ cr.updatedAt | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>
                <div class="actions-cell">
                  <button
                    pButton
                    icon="pi pi-eye"
                    class="p-button-text p-button-sm"
                    pTooltip="Voir détails"
                    (click)="viewCR(cr)">
                  </button>
                  <button
                    pButton
                    icon="pi pi-check"
                    class="p-button-text p-button-sm p-button-success"
                    pTooltip="Valider"
                    (click)="validateCR(cr)">
                  </button>
                  @if (!cr.vuParFd) {
                    <button
                      pButton
                      icon="pi pi-eye"
                      class="p-button-text p-button-sm p-button-info"
                      pTooltip="Marquer comme vu"
                      (click)="markAsViewed(cr)">
                    </button>
                  }
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="6">
                <div class="empty-state">
                  <i class="pi pi-check-circle"></i>
                  <h3>Aucun compte rendu en attente</h3>
                  <p>Tous les comptes rendus ont été validés</p>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </p-card>

      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>
    </div>
  `,
  styles: [`
    .validation-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header-content h1 {
      margin: 0 0 0.25rem;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
    }

    .header-content p {
      margin: 0;
      color: #6b7280;
    }

    .stat-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem 1.5rem;
      border-radius: 12px;

      &.pending {
        background: rgba(245, 158, 11, 0.1);
      }
    }

    .stat-count {
      font-size: 1.5rem;
      font-weight: 700;
      color: #f59e0b;
    }

    .stat-label {
      font-size: 0.75rem;
      color: #6b7280;
    }

    ::ng-deep .validation-card {
      .p-card-body {
        padding: 0;
      }

      .p-card-content {
        padding: 0;
      }
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    ::ng-deep .user-avatar {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
    }

    .user-name {
      font-weight: 500;
      color: #1f2937;
    }

    .date-cell {
      display: flex;
      flex-direction: column;
    }

    .date-value {
      font-weight: 500;
      color: #1f2937;
    }

    .date-day {
      font-size: 0.75rem;
      color: #6b7280;
      text-transform: capitalize;
    }

    .rdqd-cell {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .rdqd-value {
      font-weight: 600;
      color: #1f2937;
    }

    .rdqd-progress {
      width: 60px;
      height: 4px;
      background: #e5e7eb;
      border-radius: 2px;
      overflow: hidden;
    }

    .rdqd-bar {
      height: 100%;
      background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 2px;
    }

    .actions-cell {
      display: flex;
      gap: 0.25rem;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;

      i {
        font-size: 3rem;
        color: #22c55e;
        margin-bottom: 1rem;
      }

      h3 {
        margin: 0 0 0.5rem;
        color: #374151;
      }

      p {
        margin: 0;
        color: #6b7280;
      }
    }
  `]
})
export class ValidationComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly facade = inject(CompteRenduFacade);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  // State - directly bound properties for immediate rendering
  pendingCRs: CompteRendu[] = [];
  pendingCount = 0;

  ngOnInit(): void {
    // Subscribe to soumis (submitted) CRs
    this.facade.soumis$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(crs => {
      this.pendingCRs = crs;
      this.pendingCount = crs.length;
      this.cdr.detectChanges();
    });

    // Load data
    this.facade.loadMyCompteRendus();
  }

  ngAfterViewInit(): void {
    // Force resize after view is initialized
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      this.cdr.detectChanges();
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getRdqdPercentage(rdqd: string): number {
    const [accompli, attendu] = rdqd.split('/').map(Number);
    return attendu > 0 ? (accompli / attendu) * 100 : 0;
  }

  viewCR(cr: CompteRendu): void {
    this.router.navigate(['/compte-rendu', cr.id]);
  }

  validateCR(cr: CompteRendu): void {
    this.confirmationService.confirm({
      message: 'Voulez-vous valider ce compte rendu ?',
      header: 'Confirmation',
      icon: 'pi pi-check',
      accept: () => {
        this.facade.validate(cr.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Compte rendu validé'
            });
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: err.message
            });
          }
        });
      }
    });
  }

  markAsViewed(cr: CompteRendu): void {
    this.facade.markAsViewed(cr.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Info',
          detail: 'Marqué comme vu'
        });
      }
    });
  }
}
