import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { AvatarModule } from 'primeng/avatar';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageService } from 'primeng/api';

import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { UserAdminFacade } from '../../../application/use-cases';
import { KeycloakUser, RoleStatistics } from '../../../domain/models';
import { Role, RoleLabels } from '../../../domain/enums';

@Component({
  selector: 'app-user-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    CardModule,
    TooltipModule,
    ToastModule,
    DialogModule,
    DropdownModule,
    AvatarModule,
    SkeletonModule
  ],
  providers: [MessageService],
  template: `
    <div class="user-admin-container">
      <p-toast></p-toast>

      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Administration des Utilisateurs</h1>
          <p>Gerez les roles et les permissions des utilisateurs</p>
        </div>
        <div class="header-actions">
          <button
            type="button"
            class="btn-refresh"
            (click)="refreshData()">
            <i class="pi pi-refresh"></i>
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon total">
            <i class="pi pi-users"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ statistics?.totalUsers || 0 }}</span>
            <span class="stat-label">Total Utilisateurs</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon pending">
            <i class="pi pi-clock"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ pendingCount }}</span>
            <span class="stat-label">En attente</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon fd">
            <i class="pi pi-heart"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ statistics?.roleDistribution?.['FD'] || 0 }}</span>
            <span class="stat-label">Faiseurs de Disciples</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon pasteur">
            <i class="pi pi-star"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ statistics?.roleDistribution?.['PASTEUR'] || 0 }}</span>
            <span class="stat-label">Pasteurs</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-bar">
        <div class="search-box">
          <i class="pi pi-search search-icon"></i>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Rechercher un utilisateur..."
            class="search-input" />
          @if (searchQuery) {
            <button type="button" class="clear-btn" (click)="searchQuery = ''; onSearchChange('')">
              <i class="pi pi-times"></i>
            </button>
          }
        </div>

        <div class="filter-dropdown">
          <p-dropdown
            [options]="roleOptions"
            [(ngModel)]="selectedRole"
            placeholder="Filtrer par role"
            [showClear]="true"
            (onChange)="onRoleFilterChange($event)"
            styleClass="filter-select">
          </p-dropdown>
        </div>
      </div>

      <!-- Users Table -->
      <p-card styleClass="table-card">
        @if (isLoading) {
          <div class="skeleton-container">
            @for (i of [1,2,3,4,5]; track i) {
              <p-skeleton height="60px" styleClass="mb-2"></p-skeleton>
            }
          </div>
        } @else {
          <p-table
            [value]="filteredUsers"
            [paginator]="true"
            [rows]="10"
            [rowsPerPageOptions]="[5, 10, 25, 50]"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Affichage {first} a {last} sur {totalRecords} utilisateurs"
            styleClass="p-datatable-striped">

            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="nomComplet" style="width: 25%">
                  <div class="th-content">
                    <i class="pi pi-user"></i>
                    <span>Utilisateur</span>
                    <p-sortIcon field="nomComplet"></p-sortIcon>
                  </div>
                </th>
                <th pSortableColumn="email" style="width: 22%">
                  <div class="th-content">
                    <i class="pi pi-envelope"></i>
                    <span>Email</span>
                    <p-sortIcon field="email"></p-sortIcon>
                  </div>
                </th>
                <th pSortableColumn="role" style="width: 15%">
                  <div class="th-content">
                    <i class="pi pi-shield"></i>
                    <span>Role</span>
                    <p-sortIcon field="role"></p-sortIcon>
                  </div>
                </th>
                <th style="width: 13%">
                  <div class="th-content">
                    <i class="pi pi-circle-fill"></i>
                    <span>Statut</span>
                  </div>
                </th>
                <th pSortableColumn="createdAt" style="width: 15%">
                  <div class="th-content">
                    <i class="pi pi-calendar"></i>
                    <span>Inscription</span>
                    <p-sortIcon field="createdAt"></p-sortIcon>
                  </div>
                </th>
                <th style="width: 10%; text-align: right">
                  <div class="th-content" style="justify-content: flex-end">
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-user>
              <tr>
                <td>
                  <div class="user-cell">
                    <div class="entity-icon user-icon">
                      <i class="pi pi-user"></i>
                    </div>
                    <span class="entity-name">{{ user.nomComplet }}</span>
                  </div>
                </td>
                <td class="text-secondary">{{ user.email }}</td>
                <td>
                  <p-tag
                    [value]="getRoleLabel(user.role)"
                    [severity]="getRoleSeverity(user.role)">
                  </p-tag>
                </td>
                <td>
                  <p-tag
                    [value]="user.statut"
                    [severity]="user.statut === 'ACTIF' ? 'success' : 'warn'">
                  </p-tag>
                </td>
                <td class="text-secondary">{{ user.createdAt | date:'dd/MM/yyyy' }}</td>
                <td>
                  <div class="actions-cell">
                    <button
                      pButton
                      icon="pi pi-pencil"
                      class="p-button-text p-button-rounded"
                      pTooltip="Modifier le role"
                      tooltipPosition="top"
                      (click)="openRoleDialog(user)">
                    </button>
                  </div>
                </td>
              </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6" class="empty-message">
                  <div class="empty-state">
                    <i class="pi pi-users"></i>
                    <h3>Aucun utilisateur trouve</h3>
                    <p>Modifiez vos criteres de recherche</p>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        }
      </p-card>

      <!-- Role Assignment Dialog -->
      <p-dialog
        header="Modifier le role"
        [(visible)]="showRoleDialog"
        [modal]="true"
        [style]="{ width: '440px' }"
        [closable]="true"
        styleClass="admin-dialog">
        <div class="dialog-body" *ngIf="selectedUser">
          <div class="entity-preview">
            <div class="entity-icon user-icon large">
              <i class="pi pi-user"></i>
            </div>
            <div class="preview-info">
              <span class="preview-name">{{ selectedUser.nomComplet }}</span>
              <span class="preview-detail">{{ selectedUser.email }}</span>
            </div>
          </div>

          <div class="form-field">
            <label>Nouveau role <span class="required">*</span></label>
            <p-dropdown
              [options]="assignableRoles"
              [(ngModel)]="newRole"
              placeholder="Selectionner un role"
              appendTo="body"
              styleClass="w-full dialog-dropdown">
            </p-dropdown>
          </div>
        </div>
        <ng-template pTemplate="footer">
          <div class="dialog-footer">
            <button type="button" class="btn-dialog-cancel" (click)="showRoleDialog = false">
              <i class="pi pi-times"></i>
              <span>Annuler</span>
            </button>
            <button type="button" class="btn-dialog-save" [disabled]="!newRole" (click)="confirmRoleChange()">
              <i class="pi pi-check"></i>
              <span>Confirmer</span>
            </button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .user-admin-container {
      padding: 0;
    }

    /* ===== Page Header ===== */
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

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    /* ===== Header Buttons (custom) ===== */
    .btn-refresh {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      background: white;
      color: #64748b;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      height: 44px;

      i { font-size: 0.875rem; }

      &:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
        color: #475569;
      }
    }

    /* ===== Statistics Cards (custom, no p-card) ===== */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: white;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

      &:hover {
        border-color: #cbd5e1;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        transform: translateY(-1px);
      }
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;

      &.total { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
      &.pending { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
      &.fd { background: rgba(236, 72, 153, 0.1); color: #ec4899; }
      &.pasteur { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.2;
    }

    .stat-label {
      font-size: 0.75rem;
      color: #64748b;
    }

    /* ===== Filters Bar (custom like CR list) ===== */
    .filters-bar {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: white;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    /* ===== Search Box (custom like CR list) ===== */
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

      i { font-size: 0.7rem; }

      &:hover {
        background: #cbd5e1;
        color: #475569;
      }
    }

    /* ===== Filter Dropdown (custom like CR list) ===== */
    .filter-dropdown {
      min-width: 200px;
    }

    ::ng-deep .filter-select {
      width: 100%;

      &.p-select, .p-dropdown {
        width: 100%;
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
    }

    /* ===== Table Card ===== */
    ::ng-deep .table-card {
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #e2e8f0;

      .p-card-body { padding: 0; }
      .p-card-content { padding: 0; }
    }

    /* ===== Table Header Content (icon + label like CR list) ===== */
    .th-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      i {
        font-size: 0.875rem;
        opacity: 0.7;
      }
    }

    /* ===== Table Styles (matching CR list exactly) ===== */
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

            &:first-child { padding-left: 1.5rem; }
            &:last-child { padding-right: 1.5rem; }

            .p-sortable-column-icon {
              color: #94a3b8;
              margin-left: 0.5rem;
              font-size: 0.75rem;
            }

            &.p-highlight {
              background: linear-gradient(135deg, #ede9fe 0%, #e0e7ff 100%);
              color: #6366f1;

              .p-sortable-column-icon { color: #6366f1; }
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

            &:first-child { padding-left: 1.5rem; }
            &:last-child { padding-right: 1.5rem; }
          }

          &:hover { background: #f8fafc; }
          &:last-child > td { border-bottom: none; }

          &.p-datatable-row-selected {
            background: rgba(99, 102, 241, 0.08);
          }
        }
      }

      /* Pagination (matching CR list exactly) */
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

    /* ===== User Cell (icon + name like entity-cell) ===== */
    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .entity-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.95rem;
      flex-shrink: 0;

      &.user-icon {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%);
        color: #6366f1;
      }

      &.large {
        width: 48px;
        height: 48px;
        font-size: 1.25rem;
      }
    }

    .entity-name {
      font-weight: 600;
      color: #1e293b;
      font-size: 0.9375rem;
    }

    .text-secondary {
      color: #64748b;
    }

    /* ===== Tags ===== */
    ::ng-deep .p-tag {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 6px;
    }

    /* ===== Actions Cell ===== */
    .actions-cell {
      display: flex;
      justify-content: flex-end;
      gap: 0.25rem;
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
        }
      }
    }

    /* ===== Empty State (matching CR list) ===== */
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
        margin: 0 auto;
        color: #64748b;
        font-size: 0.9375rem;
        max-width: 400px;
      }
    }

    /* ===== Skeleton ===== */
    .skeleton-container {
      padding: 1.5rem;
    }

    /* ===== Dialog Styles (matching CR form btn-cancel / btn-save) ===== */
    ::ng-deep .admin-dialog {
      .p-dialog-header {
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #e2e8f0;

        .p-dialog-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
        }

        .p-dialog-header-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          color: #64748b;

          &:hover {
            background: #f1f5f9;
            color: #475569;
          }
        }
      }

      .p-dialog-content {
        padding: 1.5rem;
      }

      .p-dialog-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid #e2e8f0;
      }
    }

    .dialog-body {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .entity-preview {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .preview-info {
      display: flex;
      flex-direction: column;
    }

    .preview-name {
      font-weight: 600;
      color: #1e293b;
      font-size: 1rem;
    }

    .preview-detail {
      font-size: 0.875rem;
      color: #64748b;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        display: block;
        font-weight: 500;
        font-size: 0.875rem;
        color: #374151;
      }

      .required {
        color: #ef4444;
      }
    }

    /* Dialog dropdown */
    ::ng-deep .admin-dialog {
      .dialog-dropdown {
        .p-select, .p-dropdown {
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          height: 44px;
          width: 100%;
          transition: all 0.2s ease;

          &:not(.p-disabled):hover { border-color: #cbd5e1; }
          &:not(.p-disabled).p-focus, &.p-select-open {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }
        }

        .p-select-label, .p-dropdown-label {
          padding: 0.625rem 1rem;
          font-size: 0.9375rem;
        }
      }
    }

    /* Dialog Footer Buttons (matching CR form cancel/save) */
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .btn-dialog-cancel {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      background: transparent;
      border: 2px solid #e2e8f0;
      color: #64748b;
      border-radius: 10px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      height: 44px;
      min-width: 120px;
      justify-content: center;

      i { font-size: 0.875rem; }

      &:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
        color: #475569;
      }
    }

    .btn-dialog-save {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.5rem;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      height: 44px;
      min-width: 140px;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);

      i { font-size: 0.875rem; }

      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
        transform: translateY(-1px);
      }

      &:disabled {
        background: #e2e8f0;
        color: #94a3b8;
        box-shadow: none;
        cursor: not-allowed;
      }
    }

    .w-full {
      width: 100%;
    }

    /* ===== Responsive ===== */
    @media (max-width: 1200px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 1024px) {
      .filters-bar {
        flex-direction: column;
        align-items: stretch;
      }

      .search-box {
        min-width: 100%;
      }

      .filter-dropdown {
        min-width: 100%;
      }
    }

    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: 1fr; }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .header-actions {
        width: 100%;
      }

      .btn-refresh {
        flex: 1;
        justify-content: center;
      }
    }
  `]
})
export class UserAdminComponent implements OnInit, OnDestroy {
  private readonly facade = inject(UserAdminFacade);
  private readonly messageService = inject(MessageService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  // State
  users: KeycloakUser[] = [];
  pendingCount = 0;
  statistics: RoleStatistics | null = null;
  isLoading = true;
  searchQuery = '';
  selectedRole: string | null = null;

  // Client-side search filter
  get filteredUsers(): KeycloakUser[] {
    if (!this.searchQuery) return this.users;
    const term = this.searchQuery.toLowerCase();
    return this.users.filter(u =>
      u.nomComplet.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  }

  // Dialog state
  showRoleDialog = false;
  selectedUser: KeycloakUser | null = null;
  newRole: string | null = null;

  // Options
  roleOptions = [
    { label: 'Fidele', value: 'FIDELE' },
    { label: 'Faiseur de Disciples', value: 'FD' },
    { label: 'Leader', value: 'LEADER' },
    { label: 'Pasteur', value: 'PASTEUR' },
    { label: 'Administrateur', value: 'ADMIN' }
  ];

  assignableRoles = [
    { label: 'Fidele', value: 'FIDELE' },
    { label: 'Faiseur de Disciples', value: 'FD' },
    { label: 'Leader', value: 'LEADER' },
    { label: 'Pasteur', value: 'PASTEUR' }
  ];

  ngOnInit(): void {
    // Subscribe to state
    this.facade.loading$.pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isLoading = loading);

    this.facade.users$.pipe(takeUntil(this.destroy$))
      .subscribe(users => this.users = users);

    this.facade.pendingUsers$.pipe(takeUntil(this.destroy$))
      .subscribe(pending => this.pendingCount = pending.length);

    this.facade.statistics$.pipe(takeUntil(this.destroy$))
      .subscribe(stats => this.statistics = stats);

    // Setup search debounce
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      if (query) {
        this.facade.searchUsers(query);
      } else {
        this.facade.loadAllUsers();
      }
    });

    // Load initial data
    this.refreshData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refreshData(): void {
    this.facade.loadAllUsers();
    this.facade.loadPendingUsers();
    this.facade.loadStatistics();
  }

  onSearchChange(query: string): void {
    this.searchSubject.next(query);
  }

  onRoleFilterChange(event: any): void {
    if (event.value) {
      this.facade.loadUsersByRole(event.value as Role);
    } else {
      this.facade.loadAllUsers();
    }
  }

  getRoleLabel(role: string): string {
    return RoleLabels[role as Role] || role;
  }

  getRoleSeverity(role: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    switch (role) {
      case 'ADMIN': return 'danger';
      case 'PASTEUR': return 'success';
      case 'LEADER': return 'info';
      case 'FD': return 'warn';
      default: return 'secondary';
    }
  }

  openRoleDialog(user: KeycloakUser): void {
    this.selectedUser = user;
    this.newRole = null;
    this.showRoleDialog = true;
  }

  confirmRoleChange(): void {
    if (!this.selectedUser || !this.newRole) return;

    this.facade.assignRole(this.selectedUser.id, this.newRole as Role).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succes',
          detail: `Role modifie avec succes`
        });
        this.showRoleDialog = false;
        this.facade.loadStatistics();
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
}
