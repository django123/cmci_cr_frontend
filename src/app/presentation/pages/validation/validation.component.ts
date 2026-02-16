import { Component, OnInit, OnDestroy, AfterViewInit, inject, ChangeDetectorRef, ApplicationRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { AvatarModule } from 'primeng/avatar';
import { SkeletonModule } from 'primeng/skeleton';
import { RippleModule } from 'primeng/ripple';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    TooltipModule,
    ToastModule,
    ConfirmDialogModule,
    AvatarModule,
    SkeletonModule,
    RippleModule,
    TranslateModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="validation-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <div class="header-icon">
            <i class="pi pi-check-square"></i>
          </div>
          <div class="header-content">
            <h1>{{ 'VALIDATION.TITLE' | translate }}</h1>
            <p>{{ 'VALIDATION.SUBTITLE' | translate }}</p>
          </div>
        </div>
        <div class="header-stats">
          <div class="stat-badge pending">
            <div class="stat-badge-icon">
              <i class="pi pi-clock"></i>
            </div>
            <div class="stat-badge-content">
              <span class="stat-count">{{ pendingCount }}</span>
              <span class="stat-label">{{ 'VALIDATION.PENDING' | translate }}</span>
            </div>
          </div>
          <div class="stat-badge validated">
            <div class="stat-badge-icon validated-icon">
              <i class="pi pi-check-circle"></i>
            </div>
            <div class="stat-badge-content">
              <span class="stat-count validated-count">{{ validatedCount }}</span>
              <span class="stat-label">{{ 'VALIDATION.VALIDATED' | translate }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Section -->
      <div class="table-section">
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
            [currentPageReportTemplate]="'VALIDATION.PAGINATION' | translate"
            styleClass="p-datatable-striped">

            <ng-template pTemplate="header">
              <tr>
                <th style="width: 18%">
                  <div class="th-content">
                    <i class="pi pi-user"></i>
                    <span>{{ 'VALIDATION.FAITHFUL' | translate }}</span>
                  </div>
                </th>
                <th pSortableColumn="date" style="width: 15%">
                  <div class="th-content">
                    <i class="pi pi-calendar"></i>
                    <span>{{ 'VALIDATION.DATE' | translate }}</span>
                    <p-sortIcon field="date"></p-sortIcon>
                  </div>
                </th>
                <th style="width: 12%">
                  <div class="th-content">
                    <i class="pi pi-check-square"></i>
                    <span>{{ 'VALIDATION.RDQD' | translate }}</span>
                  </div>
                </th>
                <th style="width: 12%">
                  <div class="th-content">
                    <i class="pi pi-clock"></i>
                    <span>{{ 'VALIDATION.PRAYER' | translate }}</span>
                  </div>
                </th>
                <th style="width: 15%">
                  <div class="th-content">
                    <i class="pi pi-book"></i>
                    <span>{{ 'VALIDATION.READING' | translate }}</span>
                  </div>
                </th>
                <th pSortableColumn="updatedAt" style="width: 14%">
                  <div class="th-content">
                    <i class="pi pi-send"></i>
                    <span>{{ 'VALIDATION.SUBMITTED_ON' | translate }}</span>
                    <p-sortIcon field="updatedAt"></p-sortIcon>
                  </div>
                </th>
                <th style="width: 14%; text-align: right">
                  <div class="th-content" style="justify-content: flex-end">
                    <span>{{ 'COMMON.ACTIONS' | translate }}</span>
                  </div>
                </th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-cr>
              <tr>
                <td>
                  <div class="user-cell">
                    <div class="user-avatar-custom">
                      <i class="pi pi-user"></i>
                    </div>
                    <div class="user-info">
                      <span class="user-name">{{ 'VALIDATION.USER_LABEL' | translate }}</span>
                      @if (!cr.vuParFd) {
                        <span class="new-badge">{{ 'VALIDATION.NEW_BADGE' | translate }}</span>
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
                    <span class="prayer-time-icon"><i class="pi pi-clock"></i></span>
                    <span>{{ cr.priereSeule || '00:00' }}</span>
                  </div>
                </td>
                <td>
                  <div class="lecture-cell">
                    <span class="lecture-icon">
                      <i class="pi pi-book"></i>
                    </span>
                    <span>{{ cr.lectureBiblique || 0 }} {{ 'COMMON.CHAP' | translate }}</span>
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
                      class="action-btn view"
                      [pTooltip]="'VALIDATION.VIEW_DETAILS' | translate"
                      tooltipPosition="top"
                      pRipple
                      (click)="viewCR(cr)">
                      <i class="pi pi-eye"></i>
                    </button>
                    <button
                      class="action-btn validate"
                      [pTooltip]="'VALIDATION.VALIDATE_TOOLTIP' | translate"
                      tooltipPosition="top"
                      pRipple
                      (click)="validateCR(cr)">
                      <i class="pi pi-check"></i>
                    </button>
                    @if (!cr.vuParFd) {
                      <button
                        class="action-btn mark-seen"
                        [pTooltip]="'VALIDATION.MARK_AS_SEEN' | translate"
                        tooltipPosition="top"
                        pRipple
                        (click)="markAsViewed(cr)">
                        <i class="pi pi-bookmark"></i>
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
                    <div class="empty-icon-wrapper">
                      <i class="pi pi-check-circle"></i>
                    </div>
                    <h3>{{ 'VALIDATION.NO_PENDING_TITLE' | translate }}</h3>
                    <p>{{ 'VALIDATION.NO_PENDING_MESSAGE' | translate }}</p>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        }
      </div>

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
      margin-bottom: 2rem;
      padding: 1.75rem 2rem;
      background: white;
      border-radius: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-icon {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);

      i {
        font-size: 1.5rem;
        color: white;
      }
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

    .header-stats {
      display: flex;
      gap: 1rem;
    }

    .stat-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.25rem;
      border-radius: 14px;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(251, 191, 36, 0.08) 100%);
      border: 1px solid rgba(245, 158, 11, 0.15);

      &.validated {
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(74, 222, 128, 0.08) 100%);
        border-color: rgba(34, 197, 94, 0.15);
      }
    }

    .stat-badge-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 8px rgba(245, 158, 11, 0.3);

      i {
        font-size: 1rem;
        color: white;
      }

      &.validated-icon {
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        box-shadow: 0 3px 8px rgba(34, 197, 94, 0.3);
      }
    }

    .stat-badge-content {
      display: flex;
      flex-direction: column;
    }

    .stat-count {
      font-size: 1.5rem;
      font-weight: 700;
      color: #f59e0b;
      line-height: 1.2;

      &.validated-count {
        color: #22c55e;
      }
    }

    .stat-label {
      font-size: 0.7rem;
      color: #64748b;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Table Section */
    .table-section {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
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
        background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
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
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            border-color: transparent;
            box-shadow: 0 3px 8px rgba(99, 102, 241, 0.3);
          }
        }

        .p-select, .p-dropdown {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          height: 2.25rem;

          .p-select-label, .p-dropdown-label {
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

    .user-avatar-custom {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 8px rgba(99, 102, 241, 0.25);

      i {
        font-size: 0.9rem;
        color: white;
      }
    }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .user-name {
      font-weight: 600;
      color: #1e293b;
      font-size: 0.9375rem;
    }

    .new-badge {
      display: inline-flex;
      align-items: center;
      font-size: 0.6rem;
      font-weight: 700;
      color: white;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      padding: 0.125rem 0.5rem;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      width: fit-content;
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

      .prayer-time-icon {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: rgba(139, 92, 246, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;

        i {
          color: #8b5cf6;
          font-size: 0.75rem;
        }
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
        border-radius: 8px;
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
      }
    }

    /* Action Buttons */
    .actions-cell {
      display: flex;
      gap: 0.375rem;
      justify-content: flex-end;
    }

    .action-btn {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;

      i {
        font-size: 0.875rem;
      }

      &.view {
        background: rgba(99, 102, 241, 0.08);
        color: #6366f1;

        &:hover {
          background: rgba(99, 102, 241, 0.15);
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(99, 102, 241, 0.2);
        }
      }

      &.validate {
        background: rgba(34, 197, 94, 0.08);
        color: #22c55e;

        &:hover {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(34, 197, 94, 0.3);
        }
      }

      &.mark-seen {
        background: rgba(59, 130, 246, 0.08);
        color: #3b82f6;

        &:hover {
          background: rgba(59, 130, 246, 0.15);
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(59, 130, 246, 0.2);
        }
      }
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;

      .empty-icon-wrapper {
        width: 80px;
        height: 80px;
        margin: 0 auto 1.5rem;
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(74, 222, 128, 0.1) 100%);
        border-radius: 24px;
        display: flex;
        align-items: center;
        justify-content: center;

        i {
          font-size: 2.5rem;
          color: #22c55e;
        }
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
        gap: 1.25rem;
        padding: 1.25rem;
      }

      .header-stats {
        width: 100%;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
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
  private readonly translate = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();

  // State - directly bound properties for immediate rendering
  pendingCRs: CompteRendu[] = [];
  pendingCount = 0;
  validatedCount = 0;
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

    // Subscribe to validated CRs count
    this.facade.valides$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(crs => {
      this.validatedCount = crs.length;
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
      message: this.translate.instant('VALIDATION.CONFIRM_VALIDATE'),
      header: this.translate.instant('COMMON.CONFIRMATION'),
      icon: 'pi pi-check',
      accept: () => {
        this.facade.validate(cr.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('COMMON.SUCCESS'),
              detail: this.translate.instant('VALIDATION.SUCCESS_VALIDATE')
            });
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('COMMON.ERROR'),
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
          summary: this.translate.instant('COMMON.INFO'),
          detail: this.translate.instant('VALIDATION.MARKED_AS_SEEN')
        });
      }
    });
  }
}
