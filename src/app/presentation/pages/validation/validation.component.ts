import { Component, OnInit, OnDestroy, AfterViewInit, inject, ChangeDetectorRef, ApplicationRef, NgZone } from '@angular/core';
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
import { SkeletonModule } from 'primeng/skeleton';
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
    AvatarModule,
    SkeletonModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="validation-container">
      <!-- Header -->
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

      <!-- Liste des CR à valider -->
      <p-card styleClass="cr-table-card">
        @if (isLoading) {
          <div class="skeleton-container">
            @for (i of [1,2,3,4,5]; track i) {
              <p-skeleton height="60px" styleClass="mb-2"></p-skeleton>
            }
          </div>
        } @else {
          <p-table
            [value]="pendingCRs"
            [paginator]="true"
            [rows]="10"
            [rowsPerPageOptions]="[5, 10, 25, 50]"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Affichage {first} à {last} sur {totalRecords} comptes rendus"
            styleClass="p-datatable-striped">

            <ng-template pTemplate="header">
              <tr>
                <th style="width: 18%">
                  <div class="th-content">
                    <i class="pi pi-user"></i>
                    <span>Fidèle</span>
                  </div>
                </th>
                <th pSortableColumn="date" style="width: 15%">
                  <div class="th-content">
                    <i class="pi pi-calendar"></i>
                    <span>Date</span>
                    <p-sortIcon field="date"></p-sortIcon>
                  </div>
                </th>
                <th style="width: 12%">
                  <div class="th-content">
                    <i class="pi pi-check-square"></i>
                    <span>RDQD</span>
                  </div>
                </th>
                <th style="width: 12%">
                  <div class="th-content">
                    <i class="pi pi-clock"></i>
                    <span>Prière</span>
                  </div>
                </th>
                <th style="width: 15%">
                  <div class="th-content">
                    <i class="pi pi-book"></i>
                    <span>Lecture</span>
                  </div>
                </th>
                <th pSortableColumn="updatedAt" style="width: 14%">
                  <div class="th-content">
                    <i class="pi pi-send"></i>
                    <span>Soumis le</span>
                    <p-sortIcon field="updatedAt"></p-sortIcon>
                  </div>
                </th>
                <th style="width: 14%; text-align: right">
                  <div class="th-content" style="justify-content: flex-end">
                    <span>Actions</span>
                  </div>
                </th>
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
                    <div class="user-info">
                      <span class="user-name">Utilisateur</span>
                      @if (!cr.vuParFd) {
                        <span class="new-badge">Nouveau</span>
                      }
                    </div>
                  </div>
                </td>
                <td>
                  <div class="date-cell">
                    <span class="date-value">{{ cr.date | date:'dd MMM yyyy' }}</span>
                    <span class="date-day">{{ cr.date | date:'EEEE' }}</span>
                  </div>
                </td>
                <td>
                  <div class="rdqd-cell">
                    <span class="rdqd-value">{{ cr.rdqd }}</span>
                    <div class="rdqd-progress">
                      <div
                        class="rdqd-progress-bar"
                        [style.width.%]="getRdqdPercentage(cr.rdqd)">
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="prayer-cell">
                    <span>{{ cr.priereSeule || '00:00' }}</span>
                  </div>
                </td>
                <td>
                  <div class="lecture-cell">
                    <span class="lecture-icon">
                      <i class="pi pi-book"></i>
                    </span>
                    <span>{{ cr.lectureBiblique || 0 }} chap.</span>
                  </div>
                </td>
                <td>
                  <div class="date-cell">
                    <span class="date-value">{{ cr.updatedAt | date:'dd/MM/yyyy' }}</span>
                    <span class="date-day">{{ cr.updatedAt | date:'HH:mm' }}</span>
                  </div>
                </td>
                <td>
                  <div class="actions-cell">
                    <button
                      pButton
                      icon="pi pi-eye"
                      class="p-button-text p-button-rounded"
                      pTooltip="Voir détails"
                      tooltipPosition="top"
                      (click)="viewCR(cr)">
                    </button>
                    <button
                      pButton
                      icon="pi pi-check"
                      class="p-button-text p-button-rounded p-button-success"
                      pTooltip="Valider"
                      tooltipPosition="top"
                      (click)="validateCR(cr)">
                    </button>
                    @if (!cr.vuParFd) {
                      <button
                        pButton
                        icon="pi pi-bookmark"
                        class="p-button-text p-button-rounded p-button-info"
                        pTooltip="Marquer comme vu"
                        tooltipPosition="top"
                        (click)="markAsViewed(cr)">
                      </button>
                    }
                  </div>
                </td>
              </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="7" class="empty-message">
                  <div class="empty-state">
                    <i class="pi pi-check-circle"></i>
                    <h3>Aucun compte rendu en attente</h3>
                    <p>Tous les comptes rendus ont été validés</p>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        }
      </p-card>

      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>
    </div>
  `,
  styles: [`
    .validation-container {
      padding: 0;
    }

    /* Page Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .header-content h1 {
      margin: 0 0 0.25rem;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
    }

    .header-content p {
      margin: 0;
      color: #64748b;
      font-size: 0.875rem;
    }

    .stat-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(251, 191, 36, 0.1) 100%);
      border: 1px solid rgba(245, 158, 11, 0.2);
    }

    .stat-count {
      font-size: 1.75rem;
      font-weight: 700;
      color: #f59e0b;
    }

    .stat-label {
      font-size: 0.75rem;
      color: #92400e;
      font-weight: 500;
    }

    /* Table Card */
    ::ng-deep .cr-table-card {
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #e2e8f0;

      .p-card-body {
        padding: 0;
      }

      .p-card-content {
        padding: 0;
      }
    }

    /* Table Header Content */
    .th-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      i {
        font-size: 0.875rem;
        opacity: 0.7;
      }
    }

    /* Table Styles */
    ::ng-deep .p-datatable {
      .p-datatable-thead {
        > tr {
          > th {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: none;
            border-bottom: 2px solid #e2e8f0;
            padding: 1rem 1.25rem;
            font-weight: 600;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #64748b;
            white-space: nowrap;

            &:first-child {
              padding-left: 1.5rem;
            }

            &:last-child {
              padding-right: 1.5rem;
            }

            .p-sortable-column-icon {
              color: #94a3b8;
              margin-left: 0.5rem;
              font-size: 0.75rem;
            }

            &.p-highlight {
              background: linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%);
              color: #6366f1;

              .p-sortable-column-icon {
                color: #6366f1;
              }
            }

            &:hover:not(.p-highlight) {
              background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
              color: #475569;
            }
          }
        }
      }

      .p-datatable-tbody {
        > tr {
          transition: all 0.15s ease;

          > td {
            padding: 1rem 1.25rem;
            border: none;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
            font-size: 0.9375rem;
            color: #1e293b;

            &:first-child {
              padding-left: 1.5rem;
            }

            &:last-child {
              padding-right: 1.5rem;
            }
          }

          &:hover {
            background: #f8fafc;
          }

          &:last-child > td {
            border-bottom: none;
          }

          &.p-datatable-row-selected {
            background: rgba(99, 102, 241, 0.08);
          }
        }
      }

      /* Pagination */
      .p-paginator {
        padding: 1rem 1.5rem;
        background: #f8fafc;
        border: none;
        border-top: 1px solid #e2e8f0;

        .p-paginator-current {
          color: #64748b;
          font-size: 0.875rem;
        }

        .p-paginator-element {
          min-width: 2.25rem;
          height: 2.25rem;
          border-radius: 8px;
          margin: 0 0.125rem;
          color: #64748b;
          border: 1px solid transparent;

          &:hover:not(.p-disabled) {
            background: #e2e8f0;
            color: #1e293b;
          }

          &.p-highlight {
            background: #6366f1;
            color: white;
            border-color: #6366f1;
          }
        }

        .p-dropdown {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          height: 2.25rem;

          .p-dropdown-label {
            padding: 0.375rem 0.75rem;
            font-size: 0.875rem;
          }
        }
      }
    }

    /* User Cell */
    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    ::ng-deep .user-avatar {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
      width: 36px !important;
      height: 36px !important;
    }

    .user-name {
      font-weight: 600;
      color: #1e293b;
      font-size: 0.9375rem;
    }

    .new-badge {
      font-size: 0.625rem;
      font-weight: 600;
      color: #f59e0b;
      background: rgba(245, 158, 11, 0.1);
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    /* Custom Cell Styles */
    .date-cell {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .date-value {
      font-weight: 600;
      color: #1e293b;
      font-size: 0.9375rem;
    }

    .date-day {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: capitalize;
    }

    .rdqd-cell {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .rdqd-value {
      font-weight: 700;
      color: #1e293b;
      font-size: 1rem;
    }

    .rdqd-progress {
      width: 50px;
      height: 5px;
      background: #e2e8f0;
      border-radius: 3px;
      overflow: hidden;
    }

    .rdqd-progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    /* Prayer cell */
    .prayer-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      i {
        color: #8b5cf6;
        font-size: 0.875rem;
      }
    }

    /* Lecture cell */
    .lecture-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .lecture-icon {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
      }
    }

    /* Actions cell */
    .actions-cell {
      display: flex;
      gap: 0.25rem;
      justify-content: flex-end;
    }

    ::ng-deep .actions-cell {
      .p-button {
        width: 32px;
        height: 32px;
        border-radius: 8px;

        &.p-button-text {
          color: #64748b;

          &:hover {
            background: #f1f5f9;
            color: #1e293b;
          }

          &.p-button-success {
            color: #22c55e;

            &:hover {
              background: rgba(34, 197, 94, 0.1);
            }
          }

          &.p-button-info {
            color: #3b82f6;

            &:hover {
              background: rgba(59, 130, 246, 0.1);
            }
          }

          &.p-button-danger {
            color: #ef4444;

            &:hover {
              background: rgba(239, 68, 68, 0.1);
            }
          }
        }
      }
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;

      i {
        font-size: 4rem;
        color: #22c55e;
        margin-bottom: 1.5rem;
        display: block;
      }

      h3 {
        margin: 0 0 0.5rem;
        color: #1e293b;
        font-size: 1.25rem;
        font-weight: 600;
      }

      p {
        margin: 0;
        color: #64748b;
        font-size: 0.9375rem;
      }
    }

    .skeleton-container {
      padding: 1.5rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .stat-badge {
        width: 100%;
        flex-direction: row;
        justify-content: center;
        gap: 0.5rem;
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
  private readonly appRef = inject(ApplicationRef);
  private readonly ngZone = inject(NgZone);
  private readonly destroy$ = new Subject<void>();

  // State - directly bound properties for immediate rendering
  pendingCRs: CompteRendu[] = [];
  pendingCount = 0;
  isLoading = true;

  ngOnInit(): void {
    // Subscribe to loading state
    this.facade.loading$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(loading => {
      this.isLoading = loading;
      if (!loading) {
        this.forceUIUpdate();
      }
    });

    // Subscribe to soumis (submitted) CRs
    this.facade.soumis$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(crs => {
      this.pendingCRs = crs;
      this.pendingCount = crs.length;
      this.forceUIUpdate();
    });

    // Load data
    this.facade.loadMyCompteRendus();
  }

  ngAfterViewInit(): void {
    // Force resize after view is initialized
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.ngZone.run(() => {
          window.dispatchEvent(new Event('resize'));
          this.forceUIUpdate();
        });
      }, 100);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private forceUIUpdate(): void {
    this.cdr.detectChanges();
    this.appRef.tick();
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
