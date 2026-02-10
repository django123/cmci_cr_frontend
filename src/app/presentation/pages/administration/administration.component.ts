import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';

import { MessageService, ConfirmationService } from 'primeng/api';

import { AdministrationFacade } from '../../../application/use-cases/administration/administration.facade';
import { Region, Zone, EgliseLocale, EgliseMaison } from '../../../domain/models';

@Component({
  selector: 'app-administration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    TabViewModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    TagModule,
    SkeletonModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast></p-toast>
    <p-confirmDialog></p-confirmDialog>

    <div class="administration-container">
      <div class="page-header">
        <h2><i class="pi pi-building"></i> Administration</h2>
        <p class="subtitle">Gestion de la hierarchie ecclesiale</p>
      </div>

      <p-tabView (onChange)="onTabChange($event)">
        <!-- ==================== TAB REGIONS ==================== -->
        <p-tabPanel header="Regions">
          <div class="tab-toolbar">
            <p-button label="Nouvelle Region" icon="pi pi-plus" (onClick)="openRegionDialog()" severity="primary"></p-button>
            <p-button label="Seed Geographique" icon="pi pi-globe" (onClick)="seedGeography()" severity="secondary" [loading]="isSeedLoading"></p-button>
          </div>

          <p-table
            [value]="regions"
            [paginator]="true"
            [rows]="10"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Affichage {first} a {last} sur {totalRecords} regions"
            [loading]="isLoading"
            styleClass="p-datatable-striped">
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="nom">Nom <p-sortIcon field="nom"></p-sortIcon></th>
                <th pSortableColumn="code">Code <p-sortIcon field="code"></p-sortIcon></th>
                <th pSortableColumn="nombreZones">Zones <p-sortIcon field="nombreZones"></p-sortIcon></th>
                <th>Actions</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-region>
              <tr>
                <td>{{ region.nom }}</td>
                <td><p-tag [value]="region.code" severity="info"></p-tag></td>
                <td>{{ region.nombreZones }}</td>
                <td>
                  <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="primary" (onClick)="openRegionDialog(region)" pTooltip="Modifier"></p-button>
                  <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="confirmDeleteRegion(region)" pTooltip="Supprimer"></p-button>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="4" class="text-center">Aucune region trouvee. Utilisez le bouton "Seed Geographique" pour importer les donnees.</td>
              </tr>
            </ng-template>
          </p-table>
        </p-tabPanel>

        <!-- ==================== TAB ZONES ==================== -->
        <p-tabPanel header="Zones">
          <div class="tab-toolbar">
            <p-button label="Nouvelle Zone" icon="pi pi-plus" (onClick)="openZoneDialog()" severity="primary"></p-button>
            <div class="filter-group">
              <label>Filtrer par region :</label>
              <p-dropdown
                [options]="regionOptions"
                [(ngModel)]="selectedRegionFilter"
                (onChange)="onRegionFilterChange()"
                placeholder="Toutes les regions"
                [showClear]="true"
                optionLabel="label"
                optionValue="value"
                styleClass="filter-dropdown">
              </p-dropdown>
            </div>
          </div>

          <p-table
            [value]="zones"
            [paginator]="true"
            [rows]="10"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Affichage {first} a {last} sur {totalRecords} zones"
            [loading]="isLoading"
            styleClass="p-datatable-striped">
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="nom">Nom <p-sortIcon field="nom"></p-sortIcon></th>
                <th pSortableColumn="regionNom">Region <p-sortIcon field="regionNom"></p-sortIcon></th>
                <th pSortableColumn="nombreEglisesLocales">Eglises Locales <p-sortIcon field="nombreEglisesLocales"></p-sortIcon></th>
                <th>Actions</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-zone>
              <tr>
                <td>{{ zone.nom }}</td>
                <td><p-tag [value]="zone.regionNom" severity="secondary"></p-tag></td>
                <td>{{ zone.nombreEglisesLocales }}</td>
                <td>
                  <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="primary" (onClick)="openZoneDialog(zone)" pTooltip="Modifier"></p-button>
                  <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="confirmDeleteZone(zone)" pTooltip="Supprimer"></p-button>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="4" class="text-center">Aucune zone trouvee.</td>
              </tr>
            </ng-template>
          </p-table>
        </p-tabPanel>

        <!-- ==================== TAB EGLISES LOCALES ==================== -->
        <p-tabPanel header="Eglises Locales">
          <div class="tab-toolbar">
            <p-button label="Nouvelle Eglise Locale" icon="pi pi-plus" (onClick)="openEgliseLocaleDialog()" severity="primary"></p-button>
            <div class="filter-group">
              <label>Filtrer par zone :</label>
              <p-dropdown
                [options]="zoneOptions"
                [(ngModel)]="selectedZoneFilter"
                (onChange)="onZoneFilterChange()"
                placeholder="Toutes les zones"
                [showClear]="true"
                [filter]="true"
                filterPlaceholder="Rechercher..."
                optionLabel="label"
                optionValue="value"
                styleClass="filter-dropdown">
              </p-dropdown>
            </div>
          </div>

          <p-table
            [value]="eglisesLocales"
            [paginator]="true"
            [rows]="10"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Affichage {first} a {last} sur {totalRecords} eglises locales"
            [loading]="isLoading"
            styleClass="p-datatable-striped">
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="nom">Nom <p-sortIcon field="nom"></p-sortIcon></th>
                <th pSortableColumn="zoneNom">Zone <p-sortIcon field="zoneNom"></p-sortIcon></th>
                <th>Adresse</th>
                <th>Pasteur</th>
                <th pSortableColumn="nombreEglisesMaison">Eglises Maison <p-sortIcon field="nombreEglisesMaison"></p-sortIcon></th>
                <th>Actions</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-eglise>
              <tr>
                <td>{{ eglise.nom }}</td>
                <td><p-tag [value]="eglise.zoneNom" severity="secondary"></p-tag></td>
                <td>{{ eglise.adresse || '-' }}</td>
                <td>{{ eglise.pasteurNom || '-' }}</td>
                <td>{{ eglise.nombreEglisesMaison }}</td>
                <td>
                  <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="primary" (onClick)="openEgliseLocaleDialog(eglise)" pTooltip="Modifier"></p-button>
                  <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="confirmDeleteEgliseLocale(eglise)" pTooltip="Supprimer"></p-button>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6" class="text-center">Aucune eglise locale trouvee.</td>
              </tr>
            </ng-template>
          </p-table>
        </p-tabPanel>

        <!-- ==================== TAB EGLISES DE MAISON ==================== -->
        <p-tabPanel header="Eglises de Maison">
          <div class="tab-toolbar">
            <p-button label="Nouvelle Eglise de Maison" icon="pi pi-plus" (onClick)="openEgliseMaisonDialog()" severity="primary"></p-button>
            <div class="filter-group">
              <label>Filtrer par eglise locale :</label>
              <p-dropdown
                [options]="egliseLocaleOptions"
                [(ngModel)]="selectedEgliseLocaleFilter"
                (onChange)="onEgliseLocaleFilterChange()"
                placeholder="Toutes les eglises locales"
                [showClear]="true"
                [filter]="true"
                filterPlaceholder="Rechercher..."
                optionLabel="label"
                optionValue="value"
                styleClass="filter-dropdown">
              </p-dropdown>
            </div>
          </div>

          <p-table
            [value]="eglisesMaison"
            [paginator]="true"
            [rows]="10"
            [showCurrentPageReport]="true"
            currentPageReportTemplate="Affichage {first} a {last} sur {totalRecords} eglises de maison"
            [loading]="isLoading"
            styleClass="p-datatable-striped">
            <ng-template pTemplate="header">
              <tr>
                <th pSortableColumn="nom">Nom <p-sortIcon field="nom"></p-sortIcon></th>
                <th pSortableColumn="egliseLocaleNom">Eglise Locale <p-sortIcon field="egliseLocaleNom"></p-sortIcon></th>
                <th>Leader</th>
                <th>Adresse</th>
                <th pSortableColumn="nombreFideles">Fideles <p-sortIcon field="nombreFideles"></p-sortIcon></th>
                <th>Actions</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-eglise>
              <tr>
                <td>{{ eglise.nom }}</td>
                <td><p-tag [value]="eglise.egliseLocaleNom" severity="secondary"></p-tag></td>
                <td>{{ eglise.leaderNom || '-' }}</td>
                <td>{{ eglise.adresse || '-' }}</td>
                <td>{{ eglise.nombreFideles }}</td>
                <td>
                  <p-button icon="pi pi-pencil" [rounded]="true" [text]="true" severity="primary" (onClick)="openEgliseMaisonDialog(eglise)" pTooltip="Modifier"></p-button>
                  <p-button icon="pi pi-trash" [rounded]="true" [text]="true" severity="danger" (onClick)="confirmDeleteEgliseMaison(eglise)" pTooltip="Supprimer"></p-button>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td colspan="6" class="text-center">Aucune eglise de maison trouvee.</td>
              </tr>
            </ng-template>
          </p-table>
        </p-tabPanel>
      </p-tabView>
    </div>

    <!-- ==================== DIALOG REGION ==================== -->
    <p-dialog
      [header]="editingRegion ? 'Modifier la region' : 'Nouvelle region'"
      [(visible)]="showRegionDialog"
      [modal]="true"
      [style]="{ width: '450px' }">
      <div class="dialog-content">
        <div class="field">
          <label for="regionNom">Nom *</label>
          <input id="regionNom" type="text" pInputText [(ngModel)]="regionForm.nom" class="w-full" />
        </div>
        <div class="field">
          <label for="regionCode">Code *</label>
          <input id="regionCode" type="text" pInputText [(ngModel)]="regionForm.code" class="w-full" maxlength="10" />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <p-button label="Annuler" icon="pi pi-times" (onClick)="showRegionDialog = false" [text]="true"></p-button>
        <p-button label="Enregistrer" icon="pi pi-check" (onClick)="saveRegion()" [disabled]="!regionForm.nom || !regionForm.code"></p-button>
      </ng-template>
    </p-dialog>

    <!-- ==================== DIALOG ZONE ==================== -->
    <p-dialog
      [header]="editingZone ? 'Modifier la zone' : 'Nouvelle zone'"
      [(visible)]="showZoneDialog"
      [modal]="true"
      [style]="{ width: '450px' }">
      <div class="dialog-content">
        <div class="field">
          <label for="zoneNom">Nom *</label>
          <input id="zoneNom" type="text" pInputText [(ngModel)]="zoneForm.nom" class="w-full" />
        </div>
        <div class="field">
          <label for="zoneRegion">Region *</label>
          <p-dropdown
            id="zoneRegion"
            [options]="regionOptions"
            [(ngModel)]="zoneForm.regionId"
            placeholder="Selectionner une region"
            optionLabel="label"
            optionValue="value"
            [filter]="true"
            filterPlaceholder="Rechercher..."
            styleClass="w-full">
          </p-dropdown>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <p-button label="Annuler" icon="pi pi-times" (onClick)="showZoneDialog = false" [text]="true"></p-button>
        <p-button label="Enregistrer" icon="pi pi-check" (onClick)="saveZone()" [disabled]="!zoneForm.nom || !zoneForm.regionId"></p-button>
      </ng-template>
    </p-dialog>

    <!-- ==================== DIALOG EGLISE LOCALE ==================== -->
    <p-dialog
      [header]="editingEgliseLocale ? 'Modifier l\\'eglise locale' : 'Nouvelle eglise locale'"
      [(visible)]="showEgliseLocaleDialog"
      [modal]="true"
      [style]="{ width: '500px' }">
      <div class="dialog-content">
        <div class="field">
          <label for="elNom">Nom *</label>
          <input id="elNom" type="text" pInputText [(ngModel)]="egliseLocaleForm.nom" class="w-full" />
        </div>
        <div class="field">
          <label for="elZone">Zone *</label>
          <p-dropdown
            id="elZone"
            [options]="zoneOptions"
            [(ngModel)]="egliseLocaleForm.zoneId"
            placeholder="Selectionner une zone"
            optionLabel="label"
            optionValue="value"
            [filter]="true"
            filterPlaceholder="Rechercher..."
            styleClass="w-full">
          </p-dropdown>
        </div>
        <div class="field">
          <label for="elAdresse">Adresse</label>
          <input id="elAdresse" type="text" pInputText [(ngModel)]="egliseLocaleForm.adresse" class="w-full" />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <p-button label="Annuler" icon="pi pi-times" (onClick)="showEgliseLocaleDialog = false" [text]="true"></p-button>
        <p-button label="Enregistrer" icon="pi pi-check" (onClick)="saveEgliseLocale()" [disabled]="!egliseLocaleForm.nom || !egliseLocaleForm.zoneId"></p-button>
      </ng-template>
    </p-dialog>

    <!-- ==================== DIALOG EGLISE DE MAISON ==================== -->
    <p-dialog
      [header]="editingEgliseMaison ? 'Modifier l\\'eglise de maison' : 'Nouvelle eglise de maison'"
      [(visible)]="showEgliseMaisonDialog"
      [modal]="true"
      [style]="{ width: '500px' }">
      <div class="dialog-content">
        <div class="field">
          <label for="emNom">Nom *</label>
          <input id="emNom" type="text" pInputText [(ngModel)]="egliseMaisonForm.nom" class="w-full" />
        </div>
        <div class="field">
          <label for="emEgliseLocale">Eglise Locale *</label>
          <p-dropdown
            id="emEgliseLocale"
            [options]="egliseLocaleOptions"
            [(ngModel)]="egliseMaisonForm.egliseLocaleId"
            placeholder="Selectionner une eglise locale"
            optionLabel="label"
            optionValue="value"
            [filter]="true"
            filterPlaceholder="Rechercher..."
            styleClass="w-full">
          </p-dropdown>
        </div>
        <div class="field">
          <label for="emAdresse">Adresse</label>
          <input id="emAdresse" type="text" pInputText [(ngModel)]="egliseMaisonForm.adresse" class="w-full" />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <p-button label="Annuler" icon="pi pi-times" (onClick)="showEgliseMaisonDialog = false" [text]="true"></p-button>
        <p-button label="Enregistrer" icon="pi pi-check" (onClick)="saveEgliseMaison()" [disabled]="!egliseMaisonForm.nom || !egliseMaisonForm.egliseLocaleId"></p-button>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .administration-container {
      padding: 1.5rem;
    }

    .page-header {
      margin-bottom: 1.5rem;

      h2 {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text-color);
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .subtitle {
        color: var(--text-color-secondary);
        margin: 0.25rem 0 0;
        font-size: 0.9rem;
      }
    }

    .tab-toolbar {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-left: auto;

      label {
        font-size: 0.875rem;
        color: var(--text-color-secondary);
        white-space: nowrap;
      }
    }

    .filter-dropdown {
      min-width: 250px;
    }

    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        font-weight: 500;
        font-size: 0.875rem;
      }
    }

    .w-full {
      width: 100%;
    }

    .text-center {
      text-align: center;
      padding: 2rem !important;
      color: var(--text-color-secondary);
    }
  `]
})
export class AdministrationComponent implements OnInit, OnDestroy {
  private readonly facade = inject(AdministrationFacade);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly destroy$ = new Subject<void>();

  // Data
  regions: Region[] = [];
  zones: Zone[] = [];
  eglisesLocales: EgliseLocale[] = [];
  eglisesMaison: EgliseMaison[] = [];
  isLoading = false;
  isSeedLoading = false;

  // Filters
  selectedRegionFilter: string | null = null;
  selectedZoneFilter: string | null = null;
  selectedEgliseLocaleFilter: string | null = null;

  // Dropdown options
  regionOptions: { label: string; value: string }[] = [];
  zoneOptions: { label: string; value: string }[] = [];
  egliseLocaleOptions: { label: string; value: string }[] = [];

  // Region dialog
  showRegionDialog = false;
  editingRegion: Region | null = null;
  regionForm = { nom: '', code: '' };

  // Zone dialog
  showZoneDialog = false;
  editingZone: Zone | null = null;
  zoneForm = { nom: '', regionId: '' };

  // EgliseLocale dialog
  showEgliseLocaleDialog = false;
  editingEgliseLocale: EgliseLocale | null = null;
  egliseLocaleForm = { nom: '', zoneId: '', adresse: '' };

  // EgliseMaison dialog
  showEgliseMaisonDialog = false;
  editingEgliseMaison: EgliseMaison | null = null;
  egliseMaisonForm = { nom: '', egliseLocaleId: '', adresse: '' };

  ngOnInit(): void {
    this.facade.loading$.pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isLoading = loading);

    this.facade.regions$.pipe(takeUntil(this.destroy$))
      .subscribe(regions => {
        this.regions = regions;
        this.regionOptions = regions.map(r => ({ label: `${r.nom} (${r.code})`, value: r.id }));
      });

    this.facade.zones$.pipe(takeUntil(this.destroy$))
      .subscribe(zones => {
        this.zones = zones;
        this.zoneOptions = zones.map(z => ({ label: `${z.nom} - ${z.regionNom}`, value: z.id }));
      });

    this.facade.eglisesLocales$.pipe(takeUntil(this.destroy$))
      .subscribe(eglises => {
        this.eglisesLocales = eglises;
        this.egliseLocaleOptions = eglises.map(e => ({ label: `${e.nom} - ${e.zoneNom}`, value: e.id }));
      });

    this.facade.eglisesMaison$.pipe(takeUntil(this.destroy$))
      .subscribe(eglises => this.eglisesMaison = eglises);

    this.facade.error$.pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        if (error) {
          this.messageService.add({ severity: 'error', summary: 'Erreur', detail: error, life: 5000 });
        }
      });

    // Load initial data
    this.facade.loadRegions();
    this.facade.loadZones();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onTabChange(event: any): void {
    const tabIndex = event.index;
    switch (tabIndex) {
      case 0:
        this.facade.loadRegions();
        break;
      case 1:
        this.facade.loadZones();
        break;
      case 2:
        this.facade.loadEglisesLocales();
        this.facade.loadZones();
        break;
      case 3:
        this.facade.loadEglisesMaison();
        this.facade.loadEglisesLocales();
        break;
    }
  }

  // ========== REGION ==========

  openRegionDialog(region?: Region): void {
    this.editingRegion = region || null;
    this.regionForm = {
      nom: region?.nom || '',
      code: region?.code || ''
    };
    this.showRegionDialog = true;
  }

  saveRegion(): void {
    if (this.editingRegion) {
      this.facade.updateRegion(this.editingRegion.id, this.regionForm).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Region mise a jour' });
          this.showRegionDialog = false;
        },
        error: () => {}
      });
    } else {
      this.facade.createRegion(this.regionForm).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Region creee' });
          this.showRegionDialog = false;
        },
        error: () => {}
      });
    }
  }

  confirmDeleteRegion(region: Region): void {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment supprimer la region "${region.nom}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.facade.deleteRegion(region.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Region supprimee' });
          },
          error: () => {}
        });
      }
    });
  }

  seedGeography(): void {
    this.isSeedLoading = true;
    this.facade.seedGeography().subscribe({
      next: (result) => {
        this.isSeedLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Seed termine',
          detail: `${result.regionsCreated} regions et ${result.zonesCreated} zones creees (${result.regionsSkipped} regions et ${result.zonesSkipped} zones existantes)`,
          life: 8000
        });
      },
      error: () => {
        this.isSeedLoading = false;
      }
    });
  }

  // ========== ZONE ==========

  onRegionFilterChange(): void {
    if (this.selectedRegionFilter) {
      this.facade.loadZonesByRegion(this.selectedRegionFilter);
    } else {
      this.facade.loadZones();
    }
  }

  openZoneDialog(zone?: Zone): void {
    this.editingZone = zone || null;
    this.zoneForm = {
      nom: zone?.nom || '',
      regionId: zone?.regionId || ''
    };
    this.showZoneDialog = true;
  }

  saveZone(): void {
    if (this.editingZone) {
      this.facade.updateZone(this.editingZone.id, this.zoneForm).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Zone mise a jour' });
          this.showZoneDialog = false;
        },
        error: () => {}
      });
    } else {
      this.facade.createZone(this.zoneForm).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Zone creee' });
          this.showZoneDialog = false;
        },
        error: () => {}
      });
    }
  }

  confirmDeleteZone(zone: Zone): void {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment supprimer la zone "${zone.nom}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.facade.deleteZone(zone.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Zone supprimee' });
          },
          error: () => {}
        });
      }
    });
  }

  // ========== EGLISE LOCALE ==========

  onZoneFilterChange(): void {
    if (this.selectedZoneFilter) {
      this.facade.loadEglisesLocalesByZone(this.selectedZoneFilter);
    } else {
      this.facade.loadEglisesLocales();
    }
  }

  openEgliseLocaleDialog(eglise?: EgliseLocale): void {
    this.editingEgliseLocale = eglise || null;
    this.egliseLocaleForm = {
      nom: eglise?.nom || '',
      zoneId: eglise?.zoneId || '',
      adresse: eglise?.adresse || ''
    };
    this.showEgliseLocaleDialog = true;
  }

  saveEgliseLocale(): void {
    if (this.editingEgliseLocale) {
      this.facade.updateEgliseLocale(this.editingEgliseLocale.id, this.egliseLocaleForm).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Eglise locale mise a jour' });
          this.showEgliseLocaleDialog = false;
        },
        error: () => {}
      });
    } else {
      this.facade.createEgliseLocale(this.egliseLocaleForm).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Eglise locale creee' });
          this.showEgliseLocaleDialog = false;
        },
        error: () => {}
      });
    }
  }

  confirmDeleteEgliseLocale(eglise: EgliseLocale): void {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment supprimer l'eglise locale "${eglise.nom}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.facade.deleteEgliseLocale(eglise.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Eglise locale supprimee' });
          },
          error: () => {}
        });
      }
    });
  }

  // ========== EGLISE DE MAISON ==========

  onEgliseLocaleFilterChange(): void {
    if (this.selectedEgliseLocaleFilter) {
      this.facade.loadEglisesMaisonByEgliseLocale(this.selectedEgliseLocaleFilter);
    } else {
      this.facade.loadEglisesMaison();
    }
  }

  openEgliseMaisonDialog(eglise?: EgliseMaison): void {
    this.editingEgliseMaison = eglise || null;
    this.egliseMaisonForm = {
      nom: eglise?.nom || '',
      egliseLocaleId: eglise?.egliseLocaleId || '',
      adresse: eglise?.adresse || ''
    };
    this.showEgliseMaisonDialog = true;
  }

  saveEgliseMaison(): void {
    if (this.editingEgliseMaison) {
      this.facade.updateEgliseMaison(this.editingEgliseMaison.id, this.egliseMaisonForm).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Eglise de maison mise a jour' });
          this.showEgliseMaisonDialog = false;
        },
        error: () => {}
      });
    } else {
      this.facade.createEgliseMaison(this.egliseMaisonForm).subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Eglise de maison creee' });
          this.showEgliseMaisonDialog = false;
        },
        error: () => {}
      });
    }
  }

  confirmDeleteEgliseMaison(eglise: EgliseMaison): void {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment supprimer l'eglise de maison "${eglise.nom}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.facade.deleteEgliseMaison(eglise.id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Eglise de maison supprimee' });
          },
          error: () => {}
        });
      }
    });
  }
}
