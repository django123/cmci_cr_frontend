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
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Gestion des Disciples</h1>
          <p>Gerez l'assignation des disciples aux Faiseurs de Disciples</p>
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

      <!-- Statistics -->
      <div class="stats-grid">
        <p-card styleClass="stat-card">
          <div class="stat-content">
            <div class="stat-icon my">
              <i class="pi pi-heart"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ myDisciples.length }}</span>
              <span class="stat-label">Mes disciples</span>
            </div>
          </div>
        </p-card>

        <p-card styleClass="stat-card">
          <div class="stat-content">
            <div class="stat-icon unassigned">
              <i class="pi pi-user-plus"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ unassignedDisciples.length }}</span>
              <span class="stat-label">Sans FD</span>
            </div>
          </div>
        </p-card>
      </div>

      <!-- Tabs -->
      <p-tabView>
        <!-- My Disciples Tab -->
        <p-tabPanel header="Mes disciples">
          <p-card styleClass="disciples-table-card">
            @if (isLoading) {
              <div class="skeleton-container">
                @for (i of [1,2,3,4,5]; track i) {
                  <p-skeleton height="60px" styleClass="mb-2"></p-skeleton>
                }
              </div>
            } @else {
              <p-table
                [value]="myDisciples"
                [paginator]="true"
                [rows]="10"
                [showCurrentPageReport]="true"
                currentPageReportTemplate="Affichage {first} a {last} sur {totalRecords} disciples"
                styleClass="p-datatable-striped">

                <ng-template pTemplate="header">
                  <tr>
                    <th style="width: 25%">Disciple</th>
                    <th style="width: 20%">Email</th>
                    <th style="width: 15%">Telephone</th>
                    <th style="width: 15%">Bapteme</th>
                    <th style="width: 15%">Statut</th>
                    <th style="width: 10%; text-align: right">Actions</th>
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
                        <div class="user-info">
                          <span class="user-name">{{ disciple.nomComplet }}</span>
                        </div>
                      </div>
                    </td>
                    <td>{{ disciple.email }}</td>
                    <td>{{ disciple.telephone || '-' }}</td>
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
          <p-card styleClass="disciples-table-card">
            @if (isLoading) {
              <div class="skeleton-container">
                @for (i of [1,2,3,4,5]; track i) {
                  <p-skeleton height="60px" styleClass="mb-2"></p-skeleton>
                }
              </div>
            } @else {
              <p-table
                [value]="unassignedDisciples"
                [paginator]="true"
                [rows]="10"
                [showCurrentPageReport]="true"
                currentPageReportTemplate="Affichage {first} a {last} sur {totalRecords} disciples"
                styleClass="p-datatable-striped">

                <ng-template pTemplate="header">
                  <tr>
                    <th style="width: 25%">Fidele</th>
                    <th style="width: 25%">Email</th>
                    <th style="width: 15%">Telephone</th>
                    <th style="width: 20%">Inscription</th>
                    <th style="width: 15%; text-align: right">Actions</th>
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
                        <div class="user-info">
                          <span class="user-name">{{ disciple.nomComplet }}</span>
                        </div>
                      </div>
                    </td>
                    <td>{{ disciple.email }}</td>
                    <td>{{ disciple.telephone || '-' }}</td>
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
        [style]="{ width: '450px' }"
        [closable]="true">
        <div class="dialog-content" *ngIf="selectedDisciple">
          <div class="disciple-preview">
            <p-avatar
              icon="pi pi-user"
              size="large"
              shape="circle"
              styleClass="dialog-avatar">
            </p-avatar>
            <div class="disciple-preview-info">
              <span class="name">{{ selectedDisciple.nomComplet }}</span>
              <span class="email">{{ selectedDisciple.email }}</span>
            </div>
          </div>

          <div class="fd-selection">
            <label>Selectionner un FD</label>
            <p-dropdown
              [options]="fdList"
              [(ngModel)]="selectedFD"
              optionLabel="nomComplet"
              optionValue="id"
              placeholder="Selectionner un FD"
              [filter]="true"
              filterBy="nomComplet"
              styleClass="w-full">
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
          <button
            pButton
            label="Annuler"
            class="p-button-text"
            (click)="showAssignDialog = false">
          </button>
          <button
            pButton
            label="Assigner"
            icon="pi pi-check"
            [disabled]="!selectedFD"
            (click)="confirmAssign()">
          </button>
        </ng-template>
      </p-dialog>

      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>
    </div>
  `,
  styles: [`
    .disciples-container {
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
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
      max-width: 500px;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
        max-width: 100%;
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

      &.my {
        background: rgba(236, 72, 153, 0.1);
        color: #ec4899;
      }

      &.unassigned {
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
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

    ::ng-deep .disciples-table-card {
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
      gap: 0.25rem;
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

    .disciple-preview {
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

    .disciple-preview-info {
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

    .fd-selection {
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #475569;
      }
    }

    .fd-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
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

  // Dialog state
  showAssignDialog = false;
  selectedDisciple: Disciple | null = null;
  selectedFD: string | null = null;

  ngOnInit(): void {
    // Subscribe to state
    this.disciplesFacade.loading$.pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isLoading = loading);

    this.disciplesFacade.myDisciples$.pipe(takeUntil(this.destroy$))
      .subscribe(disciples => this.myDisciples = disciples);

    this.disciplesFacade.unassigned$.pipe(takeUntil(this.destroy$))
      .subscribe(disciples => this.unassignedDisciples = disciples);

    // Load FD list
    this.userAdminFacade.users$.pipe(takeUntil(this.destroy$))
      .subscribe(users => {
        this.fdList = users.filter(u => u.role === Role.FD || u.role === Role.LEADER || u.role === Role.PASTEUR);
      });

    // Load initial data
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
    // Get current user ID from auth service (simplified for now)
    this.confirmationService.confirm({
      message: `Voulez-vous vous assigner ${disciple.nomComplet} comme disciple ?`,
      header: 'Confirmation',
      icon: 'pi pi-user-plus',
      accept: () => {
        // For now, we'll use the current user's ID from the auth context
        // This would typically come from the auth service
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
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.message
        });
      }
    });
  }

  confirmRemoveFromFD(disciple: Disciple): void {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment retirer ${disciple.nomComplet} de votre groupe de disciples ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.disciplesFacade.removeFromFD(disciple.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succes',
              detail: `${disciple.nomComplet} a ete retire du groupe`
            });
            this.refreshData();
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
}
