import { Component, OnInit, inject } from '@angular/core';
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

import { CompteRenduFacade } from '../../../../application/use-cases';
import { CompteRendu } from '../../../../domain/models';
import { StatutCR, StatutCRLabels, StatutCRColors } from '../../../../domain/enums';

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
    SkeletonModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="cr-list-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Mes Comptes Rendus</h1>
          <p>Gérez vos comptes rendus spirituels quotidiens</p>
        </div>
        <button
          pButton
          label="Nouveau CR"
          icon="pi pi-plus"
          class="p-button-primary"
          (click)="createNew()">
        </button>
      </div>

      <!-- Filtres -->
      <div class="filters-section">
        <div class="filter-group">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input
              type="text"
              pInputText
              [(ngModel)]="searchTerm"
              placeholder="Rechercher..."
              class="search-input" />
          </span>
        </div>

        <div class="filter-group">
          <p-dropdown
            [options]="statutOptions"
            [(ngModel)]="selectedStatut"
            placeholder="Tous les statuts"
            [showClear]="true"
            styleClass="statut-dropdown">
          </p-dropdown>
        </div>

        <div class="filter-group">
          <p-calendar
            [(ngModel)]="dateRange"
            selectionMode="range"
            [readonlyInput]="true"
            placeholder="Période"
            dateFormat="dd/mm/yy"
            [showIcon]="true"
            styleClass="date-filter">
          </p-calendar>
        </div>
      </div>

      <!-- Liste des CR -->
      <p-card styleClass="cr-table-card">
        @if (loading$ | async) {
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
            currentPageReportTemplate="Affichage {first} à {last} sur {totalRecords} comptes rendus"
            [globalFilterFields]="['date', 'rdqd', 'statut']"
            styleClass="p-datatable-striped">

            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="date">Date <p-sortIcon field="date"></p-sortIcon></th>
                <th>RDQD</th>
                <th>Prière</th>
                <th>Lecture</th>
                <th pSortableColumn="statut">Statut <p-sortIcon field="statut"></p-sortIcon></th>
                <th>Actions</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-cr>
              <tr>
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
                        class="rdqd-progress-bar"
                        [style.width.%]="getRdqdPercentage(cr.rdqd)">
                      </div>
                    </div>
                  </div>
                </td>
                <td>{{ cr.priereSeule }}</td>
                <td>{{ cr.lectureBiblique || 0 }} chapitres</td>
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
                      class="p-button-text p-button-sm"
                      pTooltip="Voir"
                      (click)="viewCR(cr)">
                    </button>
                    @if (canEdit(cr)) {
                      <button
                        pButton
                        icon="pi pi-pencil"
                        class="p-button-text p-button-sm"
                        pTooltip="Modifier"
                        (click)="editCR(cr)">
                      </button>
                    }
                    @if (canSubmit(cr)) {
                      <button
                        pButton
                        icon="pi pi-send"
                        class="p-button-text p-button-sm p-button-success"
                        pTooltip="Soumettre"
                        (click)="submitCR(cr)">
                      </button>
                    }
                    @if (canDelete(cr)) {
                      <button
                        pButton
                        icon="pi pi-trash"
                        class="p-button-text p-button-sm p-button-danger"
                        pTooltip="Supprimer"
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
                    <h3>Aucun compte rendu</h3>
                    <p>Commencez par créer votre premier compte rendu spirituel</p>
                    <button
                      pButton
                      label="Créer un CR"
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

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
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
      font-size: 0.9rem;
    }

    .filters-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .filter-group {
      flex: 1;
      min-width: 200px;
    }

    .search-input {
      width: 100%;
    }

    ::ng-deep .statut-dropdown,
    ::ng-deep .date-filter {
      width: 100%;
    }

    ::ng-deep .cr-table-card {
      .p-card-body {
        padding: 0;
      }

      .p-card-content {
        padding: 0;
      }
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

    .rdqd-progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 2px;
      transition: width 0.3s ease;
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
        color: #d1d5db;
        margin-bottom: 1rem;
      }

      h3 {
        margin: 0 0 0.5rem;
        color: #374151;
      }

      p {
        margin: 0 0 1rem;
        color: #6b7280;
      }
    }

    .skeleton-container {
      padding: 1rem;
    }
  `]
})
export class CompteRenduListComponent implements OnInit {
  private readonly facade = inject(CompteRenduFacade);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  comptesRendus$ = this.facade.comptesRendus$;
  loading$ = this.facade.loading$;

  searchTerm = '';
  selectedStatut: StatutCR | null = null;
  dateRange: Date[] | null = null;

  statutOptions = [
    { label: 'Brouillon', value: StatutCR.BROUILLON },
    { label: 'Soumis', value: StatutCR.SOUMIS },
    { label: 'Validé', value: StatutCR.VALIDE }
  ];

  private allComptesRendus: CompteRendu[] = [];

  ngOnInit(): void {
    this.facade.loadMyCompteRendus();
    this.comptesRendus$.subscribe(crs => {
      this.allComptesRendus = crs;
    });
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
      message: 'Êtes-vous sûr de vouloir soumettre ce compte rendu ? Vous ne pourrez plus le modifier.',
      header: 'Confirmation de soumission',
      icon: 'pi pi-send',
      accept: () => {
        this.facade.submit(cr.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Compte rendu soumis avec succès'
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

  confirmDelete(cr: CompteRendu): void {
    this.confirmationService.confirm({
      message: 'Êtes-vous sûr de vouloir supprimer ce compte rendu ?',
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.facade.delete(cr.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Compte rendu supprimé'
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
}
