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
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';
import { MessageService } from 'primeng/api';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

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
    InputTextModule,
    AvatarModule,
    SkeletonModule,
    ChartModule,
    IconFieldModule,
    InputIconModule
  ],
  providers: [MessageService],
  template: `
    <div class="user-admin-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Administration des Utilisateurs</h1>
          <p>Gerez les roles et les permissions des utilisateurs</p>
        </div>
        <div class="header-actions">
          <button
            pButton
            icon="pi pi-refresh"
            label="Actualiser"
            class="p-button-outlined"
            (click)="refreshData()">
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <p-card styleClass="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <i class="pi pi-users"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ statistics?.totalUsers || 0 }}</span>
              <span class="stat-label">Total Utilisateurs</span>
            </div>
          </div>
        </p-card>

        <p-card styleClass="stat-card">
          <div class="stat-content">
            <div class="stat-icon pending">
              <i class="pi pi-clock"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ pendingCount }}</span>
              <span class="stat-label">En attente</span>
            </div>
          </div>
        </p-card>

        <p-card styleClass="stat-card">
          <div class="stat-content">
            <div class="stat-icon fd">
              <i class="pi pi-heart"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ statistics?.roleDistribution?.['FD'] || 0 }}</span>
              <span class="stat-label">Faiseurs de Disciples</span>
            </div>
          </div>
        </p-card>

        <p-card styleClass="stat-card">
          <div class="stat-content">
            <div class="stat-icon pasteur">
              <i class="pi pi-star"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ statistics?.roleDistribution?.['PASTEUR'] || 0 }}</span>
              <span class="stat-label">Pasteurs</span>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Filters -->
      <p-card styleClass="filters-card">
        <div class="filters-row">
          <p-iconField>
            <p-inputIcon styleClass="pi pi-search" />
            <input
              type="text"
              pInputText
              placeholder="Rechercher un utilisateur..."
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              class="search-input" />
          </p-iconField>

          <p-dropdown
            [options]="roleOptions"
            [(ngModel)]="selectedRole"
            placeholder="Filtrer par role"
            [showClear]="true"
            (onChange)="onRoleFilterChange($event)"
            styleClass="role-dropdown">
          </p-dropdown>
        </div>
      </p-card>

      <!-- Users Table -->
      <p-card styleClass="users-table-card">
        @if (isLoading) {
          <div class="skeleton-container">
            @for (i of [1,2,3,4,5]; track i) {
              <p-skeleton height="60px" styleClass="mb-2"></p-skeleton>
            }
          </div>
        } @else {
          <p-table
            [value]="users"
            [paginator]="true"
            [rows]="10"
            [rowsPerPageOptions]="[5, 10, 25, 50]"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Affichage {first} a {last} sur {totalRecords} utilisateurs"
            styleClass="p-datatable-striped">

            <ng-template pTemplate="header">
              <tr>
                <th style="width: 25%">Utilisateur</th>
                <th style="width: 20%">Email</th>
                <th style="width: 15%">Role</th>
                <th style="width: 15%">Statut</th>
                <th style="width: 15%">Inscription</th>
                <th style="width: 10%; text-align: right">Actions</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-user>
              <tr>
                <td>
                  <div class="user-cell">
                    <p-avatar
                      icon="pi pi-user"
                      shape="circle"
                      styleClass="user-avatar">
                    </p-avatar>
                    <div class="user-info">
                      <span class="user-name">{{ user.nomComplet }}</span>
                    </div>
                  </div>
                </td>
                <td>{{ user.email }}</td>
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
                <td>{{ user.createdAt | date:'dd/MM/yyyy' }}</td>
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
        [style]="{ width: '400px' }"
        [closable]="true">
        <div class="dialog-content" *ngIf="selectedUser">
          <div class="user-preview">
            <p-avatar
              icon="pi pi-user"
              size="large"
              shape="circle"
              styleClass="dialog-avatar">
            </p-avatar>
            <div class="user-preview-info">
              <span class="name">{{ selectedUser.nomComplet }}</span>
              <span class="email">{{ selectedUser.email }}</span>
            </div>
          </div>

          <div class="role-selection">
            <label>Nouveau role</label>
            <p-dropdown
              [options]="assignableRoles"
              [(ngModel)]="newRole"
              placeholder="Selectionner un role"
              styleClass="w-full">
            </p-dropdown>
          </div>
        </div>
        <ng-template pTemplate="footer">
          <button
            pButton
            label="Annuler"
            class="p-button-text"
            (click)="showRoleDialog = false">
          </button>
          <button
            pButton
            label="Confirmer"
            icon="pi pi-check"
            [disabled]="!newRole"
            (click)="confirmRoleChange()">
          </button>
        </ng-template>
      </p-dialog>

      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .user-admin-container {
      padding: 0;
    }

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

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    @media (max-width: 1200px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }

    ::ng-deep .stat-card {
      .p-card-body {
        padding: 1rem;
      }
      .p-card-content {
        padding: 0;
      }
    }

    .stat-content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;

      &.total {
        background: rgba(99, 102, 241, 0.1);
        color: #6366f1;
      }

      &.pending {
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
      }

      &.fd {
        background: rgba(236, 72, 153, 0.1);
        color: #ec4899;
      }

      &.pasteur {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
      }
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
    }

    .stat-label {
      font-size: 0.75rem;
      color: #64748b;
    }

    ::ng-deep .filters-card {
      margin-bottom: 1.5rem;

      .p-card-body {
        padding: 1rem;
      }
      .p-card-content {
        padding: 0;
      }
    }

    .filters-row {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .search-input {
      width: 300px;
    }

    ::ng-deep .role-dropdown {
      min-width: 200px;
    }

    ::ng-deep .users-table-card {
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
      font-weight: 600;
      color: #1e293b;
    }

    .actions-cell {
      display: flex;
      justify-content: flex-end;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;

      i {
        font-size: 3rem;
        color: #94a3b8;
        margin-bottom: 1rem;
      }

      h3 {
        margin: 0 0 0.5rem;
        color: #1e293b;
      }

      p {
        margin: 0;
        color: #64748b;
      }
    }

    .skeleton-container {
      padding: 1rem;
    }

    .dialog-content {
      padding: 1rem 0;
    }

    .user-preview {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 12px;
      margin-bottom: 1.5rem;
    }

    ::ng-deep .dialog-avatar {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
    }

    .user-preview-info {
      display: flex;
      flex-direction: column;

      .name {
        font-weight: 600;
        color: #1e293b;
      }

      .email {
        font-size: 0.875rem;
        color: #64748b;
      }
    }

    .role-selection {
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #475569;
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
