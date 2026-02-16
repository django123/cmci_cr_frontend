import { Component, OnInit, OnDestroy, AfterViewInit, inject, ChangeDetectorRef, ApplicationRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { Subject, combineLatest } from 'rxjs';
import { takeUntil, map, startWith } from 'rxjs/operators';

import { CompteRenduFacade } from '../../../../application/use-cases';
import { CompteRendu } from '../../../../domain/models';
import { StatutCR, StatutCRLabels } from '../../../../domain/enums';

@Component({
  selector: 'app-compte-rendu-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    CardModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    TooltipModule,
    ConfirmDialogModule,
    ToastModule,
    SkeletonModule,
    TranslateModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="cr-list-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>{{ 'CR_LIST.TITLE' | translate }}</h1>
          <p>{{ 'CR_LIST.SUBTITLE' | translate }}</p>
        </div>
        <button
          type="button"
          class="btn-nouveau-cr"
          (click)="createNew()">
          <i class="pi pi-plus"></i>
          <span>{{ 'CR_LIST.NEW_CR' | translate }}</span>
        </button>
      </div>

      <!-- Filtres -->
      <div class="filters-bar">
        <div class="search-box">
          <i class="pi pi-search search-icon"></i>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            [placeholder]="'CR_LIST.SEARCH_PLACEHOLDER' | translate"
            class="search-input" />
          @if (searchTerm) {
            <button type="button" class="clear-btn" (click)="searchTerm = ''">
              <i class="pi pi-times"></i>
            </button>
          }
        </div>

        <div class="filter-dropdown">
          <p-dropdown
            [options]="statutOptions"
            [(ngModel)]="selectedStatut"
            [placeholder]="'CR_LIST.ALL_STATUS' | translate"
            [showClear]="true"
            styleClass="filter-select">
            <ng-template pTemplate="selectedItem">
              @if (selectedStatut) {
                <div class="status-selected">
                  <span class="status-dot" [attr.data-status]="selectedStatut"></span>
                  <span>{{ getStatutLabelFromValue(selectedStatut) }}</span>
                </div>
              }
            </ng-template>
            <ng-template let-option pTemplate="item">
              <div class="status-option">
                <span class="status-dot" [attr.data-status]="option.value"></span>
                <span>{{ option.label }}</span>
              </div>
            </ng-template>
          </p-dropdown>
        </div>

        <div class="filter-calendar">
          <p-calendar
            [(ngModel)]="dateRange"
            selectionMode="range"
            [readonlyInput]="true"
            [placeholder]="'CR_LIST.SELECT_PERIOD' | translate"
            dateFormat="dd/mm/yy"
            [showIcon]="true"
            [showButtonBar]="true"
            appendTo="body"
            styleClass="filter-date">
          </p-calendar>
        </div>

        @if (searchTerm || selectedStatut || (dateRange && dateRange.length)) {
          <button type="button" class="btn-clear-filters" (click)="clearFilters()">
            <i class="pi pi-filter-slash"></i>
            <span>{{ 'CR_LIST.CLEAR_FILTERS' | translate }}</span>
          </button>
        }
      </div>

      <!-- Liste des CR -->
      <p-card styleClass="cr-table-card">
        @if (isLoading) {
          <div class="skeleton-container">
            @for (i of [1,2,3,4,5]; track i) {
              <p-skeleton height="60px" styleClass="mb-2"></p-skeleton>
            }
          </div>
        } @else {
          <p-table
            [value]="filteredComptesRendus"
            [paginator]="true"
            [rows]="10"
            [rowsPerPageOptions]="[5, 10, 25, 50]"
            [showCurrentPageReport]="true"
            [currentPageReportTemplate]="'CR_LIST.PAGINATION' | translate"
            [globalFilterFields]="['date', 'rdqd', 'statut']"
            styleClass="p-datatable-striped">

            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="date" style="width: 15%">
                  <div class="th-content">
                    <i class="pi pi-calendar"></i>
                    <span>{{ 'CR_LIST.DATE' | translate }}</span>
                    <p-sortIcon field="date"></p-sortIcon>
                  </div>
                </th>
                <th style="width: 12%">
                  <div class="th-content">
                    <i class="pi pi-check-square"></i>
                    <span>{{ 'CR_LIST.RDQD' | translate }}</span>
                  </div>
                </th>
                <th style="width: 12%">
                  <div class="th-content">
                    <i class="pi pi-clock"></i>
                    <span>{{ 'CR_LIST.PRAYER' | translate }}</span>
                  </div>
                </th>
                <th style="width: 15%">
                  <div class="th-content">
                    <i class="pi pi-book"></i>
                    <span>{{ 'CR_LIST.READING' | translate }}</span>
                  </div>
                </th>
                <th pSortableColumn="statut" style="width: 12%">
                  <div class="th-content">
                    <i class="pi pi-tag"></i>
                    <span>{{ 'CR_LIST.STATUS' | translate }}</span>
                    <p-sortIcon field="statut"></p-sortIcon>
                  </div>
                </th>
                <th style="width: 10%; text-align: right">
                  <div class="th-content" style="justify-content: flex-end">
                    <span>{{ 'COMMON.ACTIONS' | translate }}</span>
                  </div>
                </th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-cr>
              <tr>
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
                    <span>{{ cr.lectureBiblique || 0 }} {{ 'COMMON.CHAP' | translate }}</span>
                  </div>
                </td>
                <td>
                  <p-tag
                    [value]="getStatutLabel(cr.statut)"
                    [severity]="getStatutSeverity(cr.statut)">
                  </p-tag>
                </td>
                <td>
                  <div class="actions-cell">
                    <button
                      pButton
                      icon="pi pi-eye"
                      class="p-button-text p-button-rounded"
                      [pTooltip]="'CR_LIST.VIEW_TOOLTIP' | translate"
                      tooltipPosition="top"
                      (click)="viewCR(cr)">
                    </button>
                    @if (canEdit(cr)) {
                      <button
                        pButton
                        icon="pi pi-pencil"
                        class="p-button-text p-button-rounded"
                        [pTooltip]="'CR_LIST.EDIT_TOOLTIP' | translate"
                        tooltipPosition="top"
                        (click)="editCR(cr)">
                      </button>
                    }
                    @if (canSubmit(cr)) {
                      <button
                        pButton
                        icon="pi pi-send"
                        class="p-button-text p-button-rounded p-button-success"
                        [pTooltip]="'CR_LIST.SUBMIT_TOOLTIP' | translate"
                        tooltipPosition="top"
                        (click)="submitCR(cr)">
                      </button>
                    }
                    @if (canDelete(cr)) {
                      <button
                        pButton
                        icon="pi pi-trash"
                        class="p-button-text p-button-rounded p-button-danger"
                        [pTooltip]="'CR_LIST.DELETE_TOOLTIP' | translate"
                        tooltipPosition="top"
                        (click)="confirmDelete(cr)">
                      </button>
                    }
                  </div>
                </td>
              </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6" class="empty-message">
                  <div class="empty-state">
                    <i class="pi pi-file-edit"></i>
                    <h3>{{ 'CR_LIST.NO_CR_TITLE' | translate }}</h3>
                    <p>{{ 'CR_LIST.NO_CR_MESSAGE' | translate }}</p>
                    <button
                      pButton
                      [label]="'CR_LIST.CREATE_CR' | translate"
                      icon="pi pi-plus"
                      (click)="createNew()">
                    </button>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        }
      </p-card>

      <p-confirmDialog></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .cr-list-container {
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

    /* Bouton Nouveau CR */
    .btn-nouveau-cr {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);

      i {
        font-size: 0.875rem;
      }

      &:hover {
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
      }
    }

    /* Filters Bar */
    .filters-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: white;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    /* Search Box */
    .search-box {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 250px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0 1rem;
      height: 44px;
      transition: all 0.2s ease;

      &:focus-within {
        background: white;
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }
    }

    .search-icon {
      color: #94a3b8;
      font-size: 0.9375rem;
      margin-right: 0.75rem;
    }

    .search-box:focus-within .search-icon {
      color: #6366f1;
    }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 0.9375rem;
      color: #1e293b;
      outline: none;

      &::placeholder {
        color: #94a3b8;
      }
    }

    .clear-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border: none;
      background: #e2e8f0;
      border-radius: 50%;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s;

      i {
        font-size: 0.7rem;
      }

      &:hover {
        background: #cbd5e1;
        color: #475569;
      }
    }

    /* Filter Dropdown & Calendar */
    .filter-dropdown,
    .filter-calendar {
      min-width: 180px;
    }

    ::ng-deep .filter-select,
    ::ng-deep .filter-date {
      width: 100%;

      &.p-select, .p-dropdown,
      .p-calendar {
        width: 100%;
      }

      &.p-select, .p-dropdown {
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        background: #f8fafc;
        height: 44px;
        transition: all 0.2s ease;

        &:not(.p-disabled):hover {
          border-color: #cbd5e1;
          background: white;
        }

        &:not(.p-disabled).p-focus,
        &.p-select-open {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          background: white;
        }
      }

      .p-select-label, .p-dropdown-label {
        padding: 0.625rem 1rem;
        font-size: 0.9375rem;
        color: #1e293b;

        &.p-placeholder {
          color: #94a3b8;
        }
      }

      .p-select-dropdown, .p-dropdown-trigger {
        width: 2.5rem;
        color: #64748b;
      }

      .p-inputtext {
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        background: #f8fafc;
        height: 44px;
        padding: 0.625rem 1rem;
        font-size: 0.9375rem;

        &:enabled:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
      }

      .p-datepicker-trigger {
        background: transparent;
        border: none;
        color: #64748b;
        width: 2.5rem;

        &:hover {
          background: transparent;
          color: #6366f1;
        }
      }
    }

    /* Status dot */
    .status-selected,
    .status-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;

      &[data-status="BROUILLON"] {
        background: #f59e0b;
      }

      &[data-status="SOUMIS"] {
        background: #3b82f6;
      }

      &[data-status="VALIDE"] {
        background: #22c55e;
      }
    }

    /* Clear filters button */
    .btn-clear-filters {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      background: #fef2f2;
      color: #dc2626;
      border: 1px solid #fecaca;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      height: 44px;

      i {
        font-size: 0.875rem;
      }

      &:hover {
        background: #fee2e2;
        border-color: #fca5a5;
      }
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .filters-bar {
        flex-direction: column;
        align-items: stretch;
      }

      .search-box {
        min-width: 100%;
      }

      .filter-dropdown,
      .filter-calendar {
        min-width: 100%;
      }
    }

    @media (max-width: 640px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .btn-nouveau-cr {
        width: 100%;
        justify-content: center;
      }
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

          &.p-button-danger {
            color: #ef4444;

            &:hover {
              background: rgba(239, 68, 68, 0.1);
            }
          }
        }
      }
    }

    /* Status Tag */
    ::ng-deep .p-tag {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 6px;

      &.p-tag-success {
        background: rgba(34, 197, 94, 0.1);
        color: #16a34a;
      }

      &.p-tag-info {
        background: rgba(59, 130, 246, 0.1);
        color: #2563eb;
      }

      &.p-tag-secondary {
        background: rgba(245, 158, 11, 0.1);
        color: #d97706;
      }
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;

      i {
        font-size: 4rem;
        color: #cbd5e1;
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
        margin: 0 0 1.5rem;
        color: #64748b;
        font-size: 0.9375rem;
      }

      button {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 10px;
        font-weight: 600;
        box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
      }
    }

    .skeleton-container {
      padding: 1.5rem;
    }
  `]
})
export class CompteRenduListComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly facade = inject(CompteRenduFacade);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly appRef = inject(ApplicationRef);
  private readonly ngZone = inject(NgZone);
  private readonly translate = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();

  // State - directly bound properties for immediate rendering
  allComptesRendus: CompteRendu[] = [];
  isLoading = true;

  searchTerm = '';
  selectedStatut: StatutCR | null = null;
  dateRange: Date[] | null = null;

  statutOptions: { label: string; value: StatutCR }[] = [];

  ngOnInit(): void {
    this.statutOptions = [
      { label: this.translate.instant('CR_LIST.DRAFT'), value: StatutCR.BROUILLON },
      { label: this.translate.instant('CR_LIST.SUBMITTED'), value: StatutCR.SOUMIS },
      { label: this.translate.instant('CR_LIST.VALIDATED'), value: StatutCR.VALIDE }
    ];

    // Subscribe to loading state
    this.facade.loading$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(loading => {
      this.isLoading = loading;
      if (!loading) {
        this.forceUIUpdate();
      }
    });

    // Subscribe to data
    this.facade.comptesRendus$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(crs => {
      this.allComptesRendus = crs;
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

  get filteredComptesRendus(): CompteRendu[] {
    let result = [...this.allComptesRendus];

    if (this.selectedStatut) {
      result = result.filter(cr => cr.statut === this.selectedStatut);
    }

    if (this.dateRange && this.dateRange.length === 2) {
      const [start, end] = this.dateRange;
      result = result.filter(cr => {
        const crDate = new Date(cr.date);
        return crDate >= start && crDate <= end;
      });
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(cr =>
        cr.rdqd.toLowerCase().includes(term) ||
        cr.notes?.toLowerCase().includes(term)
      );
    }

    return result.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  getRdqdPercentage(rdqd: string): number {
    const [accompli, attendu] = rdqd.split('/').map(Number);
    return attendu > 0 ? (accompli / attendu) * 100 : 0;
  }

  getStatutLabel(statut: StatutCR): string {
    return StatutCRLabels[statut];
  }

  getStatutLabelFromValue(statut: StatutCR): string {
    const option = this.statutOptions.find(o => o.value === statut);
    return option?.label || '';
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatut = null;
    this.dateRange = null;
  }

  getStatutSeverity(statut: StatutCR): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severityMap: Record<StatutCR, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      [StatutCR.BROUILLON]: 'secondary',
      [StatutCR.SOUMIS]: 'info',
      [StatutCR.VALIDE]: 'success'
    };
    return severityMap[statut];
  }

  canEdit(cr: CompteRendu): boolean {
    return cr.statut === StatutCR.BROUILLON;
  }

  canSubmit(cr: CompteRendu): boolean {
    return cr.statut === StatutCR.BROUILLON;
  }

  canDelete(cr: CompteRendu): boolean {
    return cr.statut === StatutCR.BROUILLON;
  }

  createNew(): void {
    this.router.navigate(['/compte-rendu/new']);
  }

  viewCR(cr: CompteRendu): void {
    this.router.navigate(['/compte-rendu', cr.id]);
  }

  editCR(cr: CompteRendu): void {
    this.router.navigate(['/compte-rendu', cr.id, 'edit']);
  }

  submitCR(cr: CompteRendu): void {
    this.confirmationService.confirm({
      message: this.translate.instant('CR_LIST.CONFIRM_SUBMIT_MESSAGE'),
      header: this.translate.instant('CR_LIST.CONFIRM_SUBMIT_HEADER'),
      icon: 'pi pi-send',
      accept: () => {
        this.facade.submit(cr.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('COMMON.SUCCESS'),
              detail: this.translate.instant('CR_LIST.SUBMIT_SUCCESS')
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

  confirmDelete(cr: CompteRendu): void {
    this.confirmationService.confirm({
      message: this.translate.instant('CR_LIST.CONFIRM_DELETE_MESSAGE'),
      header: this.translate.instant('CR_LIST.CONFIRM_DELETE_HEADER'),
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.facade.delete(cr.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('COMMON.SUCCESS'),
              detail: this.translate.instant('CR_LIST.DELETE_SUCCESS')
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
}
