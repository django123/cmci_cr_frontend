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
import { TabViewModule } from 'primeng/tabview';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { DisciplesFacade, UserAdminFacade } from '../../../application/use-cases';
import { Disciple, KeycloakUser } from '../../../domain/models';
import { Role, RoleLabels } from '../../../domain/enums';

@Component({
  selector: 'app-disciples',
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
    SkeletonModule,
    TabViewModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="disciples-container">
      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>

      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Gestion des Disciples</h1>
          <p>Gerez l'assignation des disciples aux Faiseurs de Disciples</p>
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

      <!-- Statistics -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon my">
            <i class="pi pi-heart"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ myDisciples.length }}</span>
            <span class="stat-label">Mes disciples</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon unassigned">
            <i class="pi pi-user-plus"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ unassignedDisciples.length }}</span>
            <span class="stat-label">Sans FD</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <p-tabView>
        <!-- My Disciples Tab -->
        <p-tabPanel header="Mes disciples">
          <!-- Filters -->
          <div class="filters-bar">
            <div class="search-box">
              <i class="pi pi-search search-icon"></i>
              <input
                type="text"
                [(ngModel)]="myDisciplesSearch"
                placeholder="Rechercher un disciple..."
                class="search-input" />
              @if (myDisciplesSearch) {
                <button type="button" class="clear-btn" (click)="myDisciplesSearch = ''">
                  <i class="pi pi-times"></i>
                </button>
              }
            </div>
          </div>

          <p-card styleClass="table-card">
            @if (isLoading) {
              <div class="skeleton-container">
                @for (i of [1,2,3,4,5]; track i) {
                  <p-skeleton height="56px" styleClass="mb-2"></p-skeleton>
                }
              </div>
            } @else {
              <p-table
                [value]="filteredMyDisciples"
                [paginator]="true"
                [rows]="10"
                [rowsPerPageOptions]="[5, 10, 25, 50]"
                [showCurrentPageReport]="true"
                currentPageReportTemplate="Affichage {first} a {last} sur {totalRecords} disciples"
                styleClass="p-datatable-striped">

                <ng-template pTemplate="header">
                  <tr>
                    <th pSortableColumn="nomComplet" style="width: 25%">
                      <div class="th-content">
                        <i class="pi pi-user"></i>
                        <span>Disciple</span>
                        <p-sortIcon field="nomComplet"></p-sortIcon>
                      </div>
                    </th>
                    <th style="width: 20%">
                      <div class="th-content">
                        <i class="pi pi-envelope"></i>
                        <span>Email</span>
                      </div>
                    </th>
                    <th style="width: 15%">
                      <div class="th-content">
                        <i class="pi pi-phone"></i>
                        <span>Telephone</span>
                      </div>
                    </th>
                    <th pSortableColumn="dateBapteme" style="width: 15%">
                      <div class="th-content">
                        <i class="pi pi-calendar"></i>
                        <span>Bapteme</span>
                        <p-sortIcon field="dateBapteme"></p-sortIcon>
                      </div>
                    </th>
                    <th style="width: 15%">
                      <div class="th-content">
                        <i class="pi pi-tag"></i>
                        <span>Statut</span>
                      </div>
                    </th>
                    <th style="width: 10%; text-align: right">
                      <div class="th-content" style="justify-content: flex-end">
                        <span>Actions</span>
                      </div>
                    </th>
                  </tr>
                </ng-template>

                <ng-template pTemplate="body" let-disciple>
                  <tr>
                    <td>
                      <div class="user-cell">
                        <p-avatar
                          [image]="disciple.avatarUrl"
                          icon="pi pi-user"
                          shape="circle"
                          styleClass="user-avatar">
                        </p-avatar>
                        <span class="user-name">{{ disciple.nomComplet }}</span>
                      </div>
                    </td>
                    <td class="text-secondary">{{ disciple.email }}</td>
                    <td class="text-secondary">{{ disciple.telephone || '-' }}</td>
                    <td>{{ disciple.dateBapteme | date:'dd/MM/yyyy' }}</td>
                    <td>
                      <p-tag
                        [value]="disciple.statut"
                        [severity]="disciple.statut === 'ACTIF' ? 'success' : 'warn'">
                      </p-tag>
                    </td>
                    <td>
                      <div class="actions-cell">
                        <button
                          pButton
                          icon="pi pi-user-minus"
                          class="p-button-text p-button-rounded p-button-danger"
                          pTooltip="Retirer du groupe"
                          tooltipPosition="top"
                          (click)="confirmRemoveFromFD(disciple)">
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
                        <h3>Aucun disciple assigne</h3>
                        <p>Assignez des fideles depuis l'onglet "Sans FD"</p>
                      </div>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            }
          </p-card>
        </p-tabPanel>

        <!-- Unassigned Disciples Tab -->
        <p-tabPanel header="Sans FD">
          <div class="filters-bar">
            <div class="search-box">
              <i class="pi pi-search search-icon"></i>
              <input
                type="text"
                [(ngModel)]="unassignedSearch"
                placeholder="Rechercher un fidele sans FD..."
                class="search-input" />
              @if (unassignedSearch) {
                <button type="button" class="clear-btn" (click)="unassignedSearch = ''">
                  <i class="pi pi-times"></i>
                </button>
              }
            </div>
          </div>

          <p-card styleClass="table-card">
            @if (isLoading) {
              <div class="skeleton-container">
                @for (i of [1,2,3,4,5]; track i) {
                  <p-skeleton height="56px" styleClass="mb-2"></p-skeleton>
                }
              </div>
            } @else {
              <p-table
                [value]="filteredUnassigned"
                [paginator]="true"
                [rows]="10"
                [rowsPerPageOptions]="[5, 10, 25, 50]"
                [showCurrentPageReport]="true"
                currentPageReportTemplate="Affichage {first} a {last} sur {totalRecords} disciples"
                styleClass="p-datatable-striped">

                <ng-template pTemplate="header">
                  <tr>
                    <th pSortableColumn="nomComplet" style="width: 25%">
                      <div class="th-content">
                        <i class="pi pi-user"></i>
                        <span>Fidele</span>
                        <p-sortIcon field="nomComplet"></p-sortIcon>
                      </div>
                    </th>
                    <th style="width: 25%">
                      <div class="th-content">
                        <i class="pi pi-envelope"></i>
                        <span>Email</span>
                      </div>
                    </th>
                    <th style="width: 15%">
                      <div class="th-content">
                        <i class="pi pi-phone"></i>
                        <span>Telephone</span>
                      </div>
                    </th>
                    <th pSortableColumn="createdAt" style="width: 20%">
                      <div class="th-content">
                        <i class="pi pi-calendar"></i>
                        <span>Inscription</span>
                        <p-sortIcon field="createdAt"></p-sortIcon>
                      </div>
                    </th>
                    <th style="width: 15%; text-align: right">
                      <div class="th-content" style="justify-content: flex-end">
                        <span>Actions</span>
                      </div>
                    </th>
                  </tr>
                </ng-template>

                <ng-template pTemplate="body" let-disciple>
                  <tr>
                    <td>
                      <div class="user-cell">
                        <p-avatar
                          [image]="disciple.avatarUrl"
                          icon="pi pi-user"
                          shape="circle"
                          styleClass="user-avatar">
                        </p-avatar>
                        <span class="user-name">{{ disciple.nomComplet }}</span>
                      </div>
                    </td>
                    <td class="text-secondary">{{ disciple.email }}</td>
                    <td class="text-secondary">{{ disciple.telephone || '-' }}</td>
                    <td>{{ disciple.createdAt | date:'dd/MM/yyyy' }}</td>
                    <td>
                      <div class="actions-cell">
                        <button
                          pButton
                          icon="pi pi-user-plus"
                          class="p-button-text p-button-rounded p-button-success"
                          pTooltip="M'assigner ce disciple"
                          tooltipPosition="top"
                          (click)="assignToMe(disciple)">
                        </button>
                        <button
                          pButton
                          icon="pi pi-share-alt"
                          class="p-button-text p-button-rounded"
                          pTooltip="Assigner a un FD"
                          tooltipPosition="top"
                          (click)="openAssignDialog(disciple)">
                        </button>
                      </div>
                    </td>
                  </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="5" class="empty-message">
                      <div class="empty-state">
                        <i class="pi pi-check-circle"></i>
                        <h3>Tous les fideles sont assignes</h3>
                        <p>Aucun fidele en attente d'un FD</p>
                      </div>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            }
          </p-card>
        </p-tabPanel>
      </p-tabView>

      <!-- Assign FD Dialog -->
      <p-dialog
        header="Assigner a un Faiseur de Disciples"
        [(visible)]="showAssignDialog"
        [modal]="true"
        [style]="{ width: '480px' }"
        [closable]="true"
        styleClass="disciples-dialog">
        <div class="dialog-body" *ngIf="selectedDisciple">
          <div class="entity-preview">
            <p-avatar
              icon="pi pi-user"
              size="large"
              shape="circle"
              styleClass="preview-avatar">
            </p-avatar>
            <div class="preview-info">
              <span class="preview-name">{{ selectedDisciple.nomComplet }}</span>
              <span class="preview-detail">{{ selectedDisciple.email }}</span>
            </div>
          </div>

          <div class="form-field">
            <label>Selectionner un FD <span class="required">*</span></label>
            <p-dropdown
              [options]="fdList"
              [(ngModel)]="selectedFD"
              optionLabel="nomComplet"
              optionValue="id"
              placeholder="Selectionner un FD"
              [filter]="true"
              filterBy="nomComplet"
              appendTo="body"
              styleClass="w-full dialog-dropdown">
              <ng-template let-fd pTemplate="item">
                <div class="fd-option">
                  <p-avatar
                    icon="pi pi-user"
                    shape="circle"
                    size="normal">
                  </p-avatar>
                  <span>{{ fd.nomComplet }}</span>
                </div>
              </ng-template>
            </p-dropdown>
          </div>
        </div>
        <ng-template pTemplate="footer">
          <div class="dialog-footer">
            <button type="button" class="btn-dialog-cancel" (click)="showAssignDialog = false">
              <i class="pi pi-times"></i>
              <span>Annuler</span>
            </button>
            <button type="button" class="btn-dialog-save" [disabled]="!selectedFD" (click)="confirmAssign()">
              <i class="pi pi-check"></i>
              <span>Assigner</span>
            </button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .disciples-container {
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

    /* ===== Statistics Cards ===== */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
      max-width: 500px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: white;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      transition: all 0.2s ease;

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

      &.my { background: rgba(236, 72, 153, 0.1); color: #ec4899; }
      &.unassigned { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
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

    /* ===== Filters Bar ===== */
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

    /* ===== Search Box ===== */
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

    .search-box:focus-within .search-icon { color: #6366f1; }

    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 0.9375rem;
      color: #1e293b;
      outline: none;

      &::placeholder { color: #94a3b8; }
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

      &:hover { background: #cbd5e1; color: #475569; }
    }

    /* ===== Table Card ===== */
    ::ng-deep .table-card {
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #e2e8f0;

      .p-card-body { padding: 0; }
      .p-card-content { padding: 0; }
    }

    /* ===== Table Header ===== */
    .th-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      i { font-size: 0.875rem; opacity: 0.7; }
    }

    /* ===== Table Styles ===== */
    ::ng-deep .p-datatable {
      .p-datatable-thead > tr > th {
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

        .p-sortable-column-icon { color: #94a3b8; margin-left: 0.5rem; font-size: 0.75rem; }

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

      .p-datatable-tbody > tr {
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
      }

      .p-paginator {
        padding: 1rem 1.5rem;
        background: #f8fafc;
        border: none;
        border-top: 1px solid #e2e8f0;

        .p-paginator-current { color: #64748b; font-size: 0.875rem; }

        .p-paginator-element {
          min-width: 2.25rem; height: 2.25rem; border-radius: 8px;
          margin: 0 0.125rem; color: #64748b; border: 1px solid transparent;

          &:hover:not(.p-disabled) { background: #e2e8f0; color: #1e293b; }
          &.p-highlight { background: #6366f1; color: white; border-color: #6366f1; }
        }

        .p-select, .p-dropdown {
          border: 1px solid #e2e8f0; border-radius: 8px; height: 2.25rem;
          .p-select-label, .p-dropdown-label { padding: 0.375rem 0.75rem; font-size: 0.875rem; }
        }
      }
    }

    /* ===== User Cell ===== */
    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    ::ng-deep .user-avatar {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
    }

    .user-name {
      font-weight: 600;
      color: #1e293b;
      font-size: 0.9375rem;
    }

    .text-secondary { color: #94a3b8; }

    /* ===== Status Tag ===== */
    ::ng-deep .p-tag {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 6px;

      &.p-tag-success { background: rgba(34, 197, 94, 0.1); color: #16a34a; }
      &.p-tag-warn { background: rgba(245, 158, 11, 0.1); color: #d97706; }
    }

    /* ===== Actions Cell ===== */
    .actions-cell {
      display: flex;
      justify-content: flex-end;
      gap: 0.25rem;
    }

    ::ng-deep .actions-cell .p-button {
      width: 32px; height: 32px; border-radius: 8px;

      &.p-button-text {
        color: #64748b;
        &:hover { background: #f1f5f9; color: #1e293b; }
        &.p-button-danger { color: #ef4444; &:hover { background: rgba(239, 68, 68, 0.1); } }
        &.p-button-success { color: #22c55e; &:hover { background: rgba(34, 197, 94, 0.1); } }
      }
    }

    /* ===== Empty State ===== */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;

      i { font-size: 4rem; color: #cbd5e1; margin-bottom: 1.5rem; display: block; }
      h3 { margin: 0 0 0.5rem; color: #1e293b; font-size: 1.25rem; font-weight: 600; }
      p { margin: 0 auto; color: #64748b; font-size: 0.9375rem; max-width: 400px; }
    }

    .skeleton-container { padding: 1.5rem; }

    /* ===== Dialog ===== */
    ::ng-deep .disciples-dialog {
      .p-dialog-header {
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #e2e8f0;
        .p-dialog-title { font-size: 1.125rem; font-weight: 700; color: #1e293b; }
        .p-dialog-header-icon { width: 32px; height: 32px; border-radius: 8px; color: #64748b;
          &:hover { background: #f1f5f9; color: #475569; }
        }
      }
      .p-dialog-content { padding: 1.5rem; }
      .p-dialog-footer { padding: 1rem 1.5rem; border-top: 1px solid #e2e8f0; }
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

    ::ng-deep .preview-avatar {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
    }

    .preview-info { display: flex; flex-direction: column; }
    .preview-name { font-weight: 600; color: #1e293b; font-size: 1rem; }
    .preview-detail { font-size: 0.875rem; color: #64748b; }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label { font-weight: 500; font-size: 0.875rem; color: #374151; }
      .required { color: #ef4444; }
    }

    ::ng-deep .disciples-dialog {
      .p-inputtext {
        border-radius: 10px; border: 1px solid #e2e8f0; padding: 0.75rem 1rem; font-size: 0.9375rem;
        &:enabled:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
      }
      .dialog-dropdown .p-select, .dialog-dropdown .p-dropdown {
        border-radius: 10px; border: 1px solid #e2e8f0; height: 44px; width: 100%;
        transition: all 0.2s ease;
        &:not(.p-disabled):hover { border-color: #cbd5e1; }
        &:not(.p-disabled).p-focus, &.p-select-open { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1); }
      }
      .dialog-dropdown .p-select-label, .dialog-dropdown .p-dropdown-label { padding: 0.625rem 1rem; font-size: 0.9375rem; }
    }

    .fd-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .btn-dialog-cancel {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.25rem;
      background: transparent; border: 2px solid #e2e8f0; color: #64748b; border-radius: 10px;
      font-size: 0.9375rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease;
      height: 44px; min-width: 120px; justify-content: center;
      i { font-size: 0.875rem; }
      &:hover { background: #f8fafc; border-color: #cbd5e1; color: #475569; }
    }

    .btn-dialog-save {
      display: flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.5rem;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; border: none;
      border-radius: 10px; font-size: 0.9375rem; font-weight: 600; cursor: pointer;
      transition: all 0.2s ease; height: 44px; min-width: 140px; justify-content: center;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
      i { font-size: 0.875rem; }
      &:hover:not(:disabled) { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45); transform: translateY(-1px); }
      &:disabled { background: #e2e8f0; color: #94a3b8; box-shadow: none; cursor: not-allowed; }
    }

    .w-full { width: 100%; }

    /* ===== Responsive ===== */
    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: 1fr; max-width: 100%; }
      .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .filters-bar { flex-direction: column; align-items: stretch; }
      .search-box { min-width: 100%; }
    }
  `]
})
export class DisciplesComponent implements OnInit, OnDestroy {
  private readonly disciplesFacade = inject(DisciplesFacade);
  private readonly userAdminFacade = inject(UserAdminFacade);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroy$ = new Subject<void>();

  // State
  myDisciples: Disciple[] = [];
  unassignedDisciples: Disciple[] = [];
  fdList: KeycloakUser[] = [];
  isLoading = true;

  // Search
  myDisciplesSearch = '';
  unassignedSearch = '';

  // Dialog state
  showAssignDialog = false;
  selectedDisciple: Disciple | null = null;
  selectedFD: string | null = null;

  // Filtered lists
  get filteredMyDisciples(): Disciple[] {
    if (!this.myDisciplesSearch) return this.myDisciples;
    const term = this.myDisciplesSearch.toLowerCase();
    return this.myDisciples.filter(d =>
      d.nomComplet.toLowerCase().includes(term) ||
      d.email.toLowerCase().includes(term) ||
      (d.telephone?.toLowerCase().includes(term) ?? false)
    );
  }

  get filteredUnassigned(): Disciple[] {
    if (!this.unassignedSearch) return this.unassignedDisciples;
    const term = this.unassignedSearch.toLowerCase();
    return this.unassignedDisciples.filter(d =>
      d.nomComplet.toLowerCase().includes(term) ||
      d.email.toLowerCase().includes(term) ||
      (d.telephone?.toLowerCase().includes(term) ?? false)
    );
  }

  ngOnInit(): void {
    this.disciplesFacade.loading$.pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isLoading = loading);

    this.disciplesFacade.myDisciples$.pipe(takeUntil(this.destroy$))
      .subscribe(disciples => this.myDisciples = disciples);

    this.disciplesFacade.unassigned$.pipe(takeUntil(this.destroy$))
      .subscribe(disciples => this.unassignedDisciples = disciples);

    this.userAdminFacade.users$.pipe(takeUntil(this.destroy$))
      .subscribe(users => {
        this.fdList = users.filter(u => u.role === Role.FD || u.role === Role.LEADER || u.role === Role.PASTEUR);
      });

    this.refreshData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  refreshData(): void {
    this.disciplesFacade.loadMyDisciples();
    this.disciplesFacade.loadUnassignedDisciples();
    this.userAdminFacade.loadUsersByRole(Role.FD);
  }

  assignToMe(disciple: Disciple): void {
    this.confirmationService.confirm({
      message: `Voulez-vous vous assigner ${disciple.nomComplet} comme disciple ?`,
      header: 'Confirmation',
      icon: 'pi pi-user-plus',
      accept: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Information',
          detail: 'Utilisez le bouton "Assigner a un FD" pour selectionner le FD'
        });
      }
    });
  }

  openAssignDialog(disciple: Disciple): void {
    this.selectedDisciple = disciple;
    this.selectedFD = null;
    this.showAssignDialog = true;
  }

  confirmAssign(): void {
    if (!this.selectedDisciple || !this.selectedFD) return;

    this.disciplesFacade.assignToFD(this.selectedDisciple.id, this.selectedFD).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succes',
          detail: `${this.selectedDisciple?.nomComplet} a ete assigne avec succes`
        });
        this.showAssignDialog = false;
        this.refreshData();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.message });
      }
    });
  }

  confirmRemoveFromFD(disciple: Disciple): void {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment retirer ${disciple.nomComplet} de votre groupe de disciples ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Retirer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.disciplesFacade.removeFromFD(disciple.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Succes', detail: `${disciple.nomComplet} a ete retire du groupe` });
            this.refreshData();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: err.message });
          }
        });
      }
    });
  }
}
