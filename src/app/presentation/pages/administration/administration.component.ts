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
    <div class="admin-container">
      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>

      <!-- Page Header -->
      <div class="page-header">
        <div class="header-content">
          <h1>Administration</h1>
          <p>Gestion de la hierarchie ecclesiale : Regions, Zones, Eglises Locales et Eglises de Maison</p>
        </div>
        <div class="header-actions">
          <button
            type="button"
            class="btn-seed"
            [class.loading]="isSeedLoading"
            [disabled]="isSeedLoading"
            (click)="seedGeography()"
            pTooltip="Importer les regions et zones depuis RestCountries"
            tooltipPosition="left">
            <i class="pi pi-globe"></i>
            <span>{{ isSeedLoading ? 'Importation...' : 'Seed Geographique' }}</span>
          </button>
          <button
            type="button"
            class="btn-refresh"
            (click)="refreshCurrentTab()">
            <i class="pi pi-refresh"></i>
            <span>Actualiser</span>
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card" (click)="activeTab = 0">
          <div class="stat-icon regions">
            <i class="pi pi-globe"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ regions.length }}</span>
            <span class="stat-label">Regions</span>
          </div>
        </div>

        <div class="stat-card" (click)="activeTab = 1">
          <div class="stat-icon zones">
            <i class="pi pi-map"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ zones.length }}</span>
            <span class="stat-label">Zones</span>
          </div>
        </div>

        <div class="stat-card" (click)="activeTab = 2">
          <div class="stat-icon eglises-locales">
            <i class="pi pi-building"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ eglisesLocales.length }}</span>
            <span class="stat-label">Eglises Locales</span>
          </div>
        </div>

        <div class="stat-card" (click)="activeTab = 3">
          <div class="stat-icon eglises-maison">
            <i class="pi pi-home"></i>
          </div>
          <div class="stat-info">
            <span class="stat-value">{{ eglisesMaison.length }}</span>
            <span class="stat-label">Eglises de Maison</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <p-tabView (onChange)="onTabChange($event)" [(activeIndex)]="activeTab">

        <!-- ==================== TAB REGIONS ==================== -->
        <p-tabPanel header="Regions">
          <!-- Filters -->
          <div class="filters-bar">
            <div class="search-box">
              <i class="pi pi-search search-icon"></i>
              <input
                type="text"
                [(ngModel)]="regionSearch"
                placeholder="Rechercher une region par nom ou code..."
                class="search-input" />
              @if (regionSearch) {
                <button type="button" class="clear-btn" (click)="regionSearch = ''">
                  <i class="pi pi-times"></i>
                </button>
              }
            </div>

            <button
              type="button"
              class="btn-create"
              (click)="openRegionDialog()">
              <i class="pi pi-plus"></i>
              <span>Nouvelle Region</span>
            </button>
          </div>

          <!-- Table -->
          <p-card styleClass="table-card">
            @if (isLoading) {
              <div class="skeleton-container">
                @for (i of [1,2,3,4,5]; track i) {
                  <p-skeleton height="56px" styleClass="mb-2"></p-skeleton>
                }
              </div>
            } @else {
              <p-table
                [value]="filteredRegions"
                [paginator]="true"
                [rows]="10"
                [rowsPerPageOptions]="[5, 10, 25, 50]"
                [showCurrentPageReport]="true"
                currentPageReportTemplate="Affichage {first} a {last} sur {totalRecords} regions"
                styleClass="p-datatable-striped">

                <ng-template pTemplate="header">
                  <tr>
                    <th pSortableColumn="nom" style="width: 40%">
                      <div class="th-content">
                        <i class="pi pi-globe"></i>
                        <span>Nom</span>
                        <p-sortIcon field="nom"></p-sortIcon>
                      </div>
                    </th>
                    <th pSortableColumn="code" style="width: 20%">
                      <div class="th-content">
                        <i class="pi pi-hashtag"></i>
                        <span>Code</span>
                        <p-sortIcon field="code"></p-sortIcon>
                      </div>
                    </th>
                    <th pSortableColumn="nombreZones" style="width: 20%">
                      <div class="th-content">
                        <i class="pi pi-map"></i>
                        <span>Zones</span>
                        <p-sortIcon field="nombreZones"></p-sortIcon>
                      </div>
                    </th>
                    <th style="width: 20%; text-align: right">
                      <div class="th-content" style="justify-content: flex-end">
                        <span>Actions</span>
                      </div>
                    </th>
                  </tr>
                </ng-template>

                <ng-template pTemplate="body" let-region>
                  <tr>
                    <td>
                      <div class="entity-cell">
                        <div class="entity-icon region-icon">
                          <i class="pi pi-globe"></i>
                        </div>
                        <span class="entity-name">{{ region.nom }}</span>
                      </div>
                    </td>
                    <td>
                      <p-tag [value]="region.code" severity="info"></p-tag>
                    </td>
                    <td>
                      <span class="count-badge">{{ region.nombreZones }}</span>
                    </td>
                    <td>
                      <div class="actions-cell">
                        <button pButton icon="pi pi-pencil" class="p-button-text p-button-rounded" pTooltip="Modifier" tooltipPosition="top" (click)="openRegionDialog(region)"></button>
                        <button pButton icon="pi pi-trash" class="p-button-text p-button-rounded p-button-danger" pTooltip="Supprimer" tooltipPosition="top" (click)="confirmDeleteRegion(region)"></button>
                      </div>
                    </td>
                  </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="4" class="empty-message">
                      <div class="empty-state">
                        <i class="pi pi-globe"></i>
                        <h3>Aucune region trouvee</h3>
                        <p>Cliquez sur "Seed Geographique" pour importer les regions et zones depuis l'API RestCountries</p>
                      </div>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            }
          </p-card>
        </p-tabPanel>

        <!-- ==================== TAB ZONES ==================== -->
        <p-tabPanel header="Zones">
          <div class="filters-bar">
            <div class="search-box">
              <i class="pi pi-search search-icon"></i>
              <input
                type="text"
                [(ngModel)]="zoneSearch"
                placeholder="Rechercher une zone..."
                class="search-input" />
              @if (zoneSearch) {
                <button type="button" class="clear-btn" (click)="zoneSearch = ''">
                  <i class="pi pi-times"></i>
                </button>
              }
            </div>

            <div class="filter-dropdown">
              <p-dropdown
                [options]="regionOptions"
                [(ngModel)]="selectedRegionFilter"
                placeholder="Toutes les regions"
                [showClear]="true"
                [filter]="true"
                filterPlaceholder="Rechercher..."
                optionLabel="label"
                optionValue="value"
                (onChange)="onRegionFilterChange()"
                styleClass="filter-select">
              </p-dropdown>
            </div>

            <button
              type="button"
              class="btn-create"
              (click)="openZoneDialog()">
              <i class="pi pi-plus"></i>
              <span>Nouvelle Zone</span>
            </button>
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
                [value]="filteredZones"
                [paginator]="true"
                [rows]="10"
                [rowsPerPageOptions]="[5, 10, 25, 50]"
                [showCurrentPageReport]="true"
                currentPageReportTemplate="Affichage {first} a {last} sur {totalRecords} zones"
                styleClass="p-datatable-striped">

                <ng-template pTemplate="header">
                  <tr>
                    <th pSortableColumn="nom" style="width: 35%">
                      <div class="th-content">
                        <i class="pi pi-map"></i>
                        <span>Nom</span>
                        <p-sortIcon field="nom"></p-sortIcon>
                      </div>
                    </th>
                    <th pSortableColumn="regionNom" style="width: 25%">
                      <div class="th-content">
                        <i class="pi pi-globe"></i>
                        <span>Region</span>
                        <p-sortIcon field="regionNom"></p-sortIcon>
                      </div>
                    </th>
                    <th pSortableColumn="nombreEglisesLocales" style="width: 20%">
                      <div class="th-content">
                        <i class="pi pi-building"></i>
                        <span>Eglises Locales</span>
                        <p-sortIcon field="nombreEglisesLocales"></p-sortIcon>
                      </div>
                    </th>
                    <th style="width: 20%; text-align: right">
                      <div class="th-content" style="justify-content: flex-end">
                        <span>Actions</span>
                      </div>
                    </th>
                  </tr>
                </ng-template>

                <ng-template pTemplate="body" let-zone>
                  <tr>
                    <td>
                      <div class="entity-cell">
                        <div class="entity-icon zone-icon">
                          <i class="pi pi-map"></i>
                        </div>
                        <span class="entity-name">{{ zone.nom }}</span>
                      </div>
                    </td>
                    <td>
                      <p-tag [value]="zone.regionNom" severity="info"></p-tag>
                    </td>
                    <td>
                      <span class="count-badge">{{ zone.nombreEglisesLocales }}</span>
                    </td>
                    <td>
                      <div class="actions-cell">
                        <button pButton icon="pi pi-pencil" class="p-button-text p-button-rounded" pTooltip="Modifier" tooltipPosition="top" (click)="openZoneDialog(zone)"></button>
                        <button pButton icon="pi pi-trash" class="p-button-text p-button-rounded p-button-danger" pTooltip="Supprimer" tooltipPosition="top" (click)="confirmDeleteZone(zone)"></button>
                      </div>
                    </td>
                  </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="4" class="empty-message">
                      <div class="empty-state">
                        <i class="pi pi-map"></i>
                        <h3>Aucune zone trouvee</h3>
                        <p>Modifiez vos criteres de recherche ou creez une nouvelle zone</p>
                      </div>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            }
          </p-card>
        </p-tabPanel>

        <!-- ==================== TAB EGLISES LOCALES ==================== -->
        <p-tabPanel header="Eglises Locales">
          <div class="filters-bar">
            <div class="search-box">
              <i class="pi pi-search search-icon"></i>
              <input
                type="text"
                [(ngModel)]="egliseLocaleSearch"
                placeholder="Rechercher une eglise locale..."
                class="search-input" />
              @if (egliseLocaleSearch) {
                <button type="button" class="clear-btn" (click)="egliseLocaleSearch = ''">
                  <i class="pi pi-times"></i>
                </button>
              }
            </div>

            <div class="filter-dropdown">
              <p-dropdown
                [options]="zoneOptions"
                [(ngModel)]="selectedZoneFilter"
                placeholder="Toutes les zones"
                [showClear]="true"
                [filter]="true"
                filterPlaceholder="Rechercher..."
                optionLabel="label"
                optionValue="value"
                (onChange)="onZoneFilterChange()"
                styleClass="filter-select">
              </p-dropdown>
            </div>

            <button
              type="button"
              class="btn-create"
              (click)="openEgliseLocaleDialog()">
              <i class="pi pi-plus"></i>
              <span>Nouvelle Eglise</span>
            </button>
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
                [value]="filteredEglisesLocales"
                [paginator]="true"
                [rows]="10"
                [rowsPerPageOptions]="[5, 10, 25, 50]"
                [showCurrentPageReport]="true"
                currentPageReportTemplate="Affichage {first} a {last} sur {totalRecords} eglises locales"
                styleClass="p-datatable-striped">

                <ng-template pTemplate="header">
                  <tr>
                    <th pSortableColumn="nom" style="width: 25%">
                      <div class="th-content">
                        <i class="pi pi-building"></i>
                        <span>Nom</span>
                        <p-sortIcon field="nom"></p-sortIcon>
                      </div>
                    </th>
                    <th pSortableColumn="zoneNom" style="width: 18%">
                      <div class="th-content">
                        <i class="pi pi-map"></i>
                        <span>Zone</span>
                        <p-sortIcon field="zoneNom"></p-sortIcon>
                      </div>
                    </th>
                    <th style="width: 20%">
                      <div class="th-content">
                        <i class="pi pi-map-marker"></i>
                        <span>Adresse</span>
                      </div>
                    </th>
                    <th style="width: 15%">
                      <div class="th-content">
                        <i class="pi pi-user"></i>
                        <span>Pasteur</span>
                      </div>
                    </th>
                    <th pSortableColumn="nombreEglisesMaison" style="width: 10%">
                      <div class="th-content">
                        <i class="pi pi-home"></i>
                        <span>Maisons</span>
                        <p-sortIcon field="nombreEglisesMaison"></p-sortIcon>
                      </div>
                    </th>
                    <th style="width: 12%; text-align: right">
                      <div class="th-content" style="justify-content: flex-end">
                        <span>Actions</span>
                      </div>
                    </th>
                  </tr>
                </ng-template>

                <ng-template pTemplate="body" let-eglise>
                  <tr>
                    <td>
                      <div class="entity-cell">
                        <div class="entity-icon el-icon">
                          <i class="pi pi-building"></i>
                        </div>
                        <span class="entity-name">{{ eglise.nom }}</span>
                      </div>
                    </td>
                    <td>
                      <p-tag [value]="eglise.zoneNom" severity="secondary"></p-tag>
                    </td>
                    <td class="text-secondary">{{ eglise.adresse || '-' }}</td>
                    <td>
                      @if (eglise.pasteurNom) {
                        <span class="pasteur-badge">
                          <i class="pi pi-user"></i>
                          {{ eglise.pasteurNom }}
                        </span>
                      } @else {
                        <span class="text-secondary">-</span>
                      }
                    </td>
                    <td>
                      <span class="count-badge">{{ eglise.nombreEglisesMaison }}</span>
                    </td>
                    <td>
                      <div class="actions-cell">
                        <button pButton icon="pi pi-pencil" class="p-button-text p-button-rounded" pTooltip="Modifier" tooltipPosition="top" (click)="openEgliseLocaleDialog(eglise)"></button>
                        <button pButton icon="pi pi-trash" class="p-button-text p-button-rounded p-button-danger" pTooltip="Supprimer" tooltipPosition="top" (click)="confirmDeleteEgliseLocale(eglise)"></button>
                      </div>
                    </td>
                  </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="6" class="empty-message">
                      <div class="empty-state">
                        <i class="pi pi-building"></i>
                        <h3>Aucune eglise locale trouvee</h3>
                        <p>Modifiez vos criteres de recherche ou creez une nouvelle eglise locale</p>
                      </div>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            }
          </p-card>
        </p-tabPanel>

        <!-- ==================== TAB EGLISES DE MAISON ==================== -->
        <p-tabPanel header="Eglises de Maison">
          <div class="filters-bar">
            <div class="search-box">
              <i class="pi pi-search search-icon"></i>
              <input
                type="text"
                [(ngModel)]="egliseMaisonSearch"
                placeholder="Rechercher une eglise de maison..."
                class="search-input" />
              @if (egliseMaisonSearch) {
                <button type="button" class="clear-btn" (click)="egliseMaisonSearch = ''">
                  <i class="pi pi-times"></i>
                </button>
              }
            </div>

            <div class="filter-dropdown">
              <p-dropdown
                [options]="egliseLocaleOptions"
                [(ngModel)]="selectedEgliseLocaleFilter"
                placeholder="Toutes les eglises locales"
                [showClear]="true"
                [filter]="true"
                filterPlaceholder="Rechercher..."
                optionLabel="label"
                optionValue="value"
                (onChange)="onEgliseLocaleFilterChange()"
                styleClass="filter-select">
              </p-dropdown>
            </div>

            <button
              type="button"
              class="btn-create"
              (click)="openEgliseMaisonDialog()">
              <i class="pi pi-plus"></i>
              <span>Nouvelle Eglise</span>
            </button>
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
                [value]="filteredEglisesMaison"
                [paginator]="true"
                [rows]="10"
                [rowsPerPageOptions]="[5, 10, 25, 50]"
                [showCurrentPageReport]="true"
                currentPageReportTemplate="Affichage {first} a {last} sur {totalRecords} eglises de maison"
                styleClass="p-datatable-striped">

                <ng-template pTemplate="header">
                  <tr>
                    <th pSortableColumn="nom" style="width: 22%">
                      <div class="th-content">
                        <i class="pi pi-home"></i>
                        <span>Nom</span>
                        <p-sortIcon field="nom"></p-sortIcon>
                      </div>
                    </th>
                    <th pSortableColumn="egliseLocaleNom" style="width: 20%">
                      <div class="th-content">
                        <i class="pi pi-building"></i>
                        <span>Eglise Locale</span>
                        <p-sortIcon field="egliseLocaleNom"></p-sortIcon>
                      </div>
                    </th>
                    <th style="width: 18%">
                      <div class="th-content">
                        <i class="pi pi-user"></i>
                        <span>Leader</span>
                      </div>
                    </th>
                    <th style="width: 18%">
                      <div class="th-content">
                        <i class="pi pi-map-marker"></i>
                        <span>Adresse</span>
                      </div>
                    </th>
                    <th pSortableColumn="nombreFideles" style="width: 10%">
                      <div class="th-content">
                        <i class="pi pi-users"></i>
                        <span>Fideles</span>
                        <p-sortIcon field="nombreFideles"></p-sortIcon>
                      </div>
                    </th>
                    <th style="width: 12%; text-align: right">
                      <div class="th-content" style="justify-content: flex-end">
                        <span>Actions</span>
                      </div>
                    </th>
                  </tr>
                </ng-template>

                <ng-template pTemplate="body" let-eglise>
                  <tr>
                    <td>
                      <div class="entity-cell">
                        <div class="entity-icon em-icon">
                          <i class="pi pi-home"></i>
                        </div>
                        <span class="entity-name">{{ eglise.nom }}</span>
                      </div>
                    </td>
                    <td>
                      <p-tag [value]="eglise.egliseLocaleNom" severity="secondary"></p-tag>
                    </td>
                    <td>
                      @if (eglise.leaderNom) {
                        <span class="pasteur-badge">
                          <i class="pi pi-user"></i>
                          {{ eglise.leaderNom }}
                        </span>
                      } @else {
                        <span class="text-secondary">-</span>
                      }
                    </td>
                    <td class="text-secondary">{{ eglise.adresse || '-' }}</td>
                    <td>
                      <span class="count-badge">{{ eglise.nombreFideles }}</span>
                    </td>
                    <td>
                      <div class="actions-cell">
                        <button pButton icon="pi pi-pencil" class="p-button-text p-button-rounded" pTooltip="Modifier" tooltipPosition="top" (click)="openEgliseMaisonDialog(eglise)"></button>
                        <button pButton icon="pi pi-trash" class="p-button-text p-button-rounded p-button-danger" pTooltip="Supprimer" tooltipPosition="top" (click)="confirmDeleteEgliseMaison(eglise)"></button>
                      </div>
                    </td>
                  </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="6" class="empty-message">
                      <div class="empty-state">
                        <i class="pi pi-home"></i>
                        <h3>Aucune eglise de maison trouvee</h3>
                        <p>Modifiez vos criteres de recherche ou creez une nouvelle eglise de maison</p>
                      </div>
                    </td>
                  </tr>
                </ng-template>
              </p-table>
            }
          </p-card>
        </p-tabPanel>
      </p-tabView>
    </div>

    <!-- ==================== DIALOG REGION ==================== -->
    <p-dialog
      [header]="editingRegion ? 'Modifier la region' : 'Nouvelle region'"
      [(visible)]="showRegionDialog"
      [modal]="true"
      [style]="{ width: '480px' }"
      [closable]="true"
      styleClass="admin-dialog">
      <div class="dialog-body">
        @if (editingRegion) {
          <div class="entity-preview">
            <div class="entity-icon region-icon large">
              <i class="pi pi-globe"></i>
            </div>
            <div class="preview-info">
              <span class="preview-name">{{ editingRegion.nom }}</span>
              <span class="preview-detail">Code: {{ editingRegion.code }}</span>
            </div>
          </div>
        }
        <div class="form-field">
          <label for="regionNom">Nom de la region <span class="required">*</span></label>
          <input id="regionNom" type="text" pInputText [(ngModel)]="regionForm.nom" placeholder="Ex: Afrique, Europe..." class="w-full" />
        </div>
        <div class="form-field">
          <label for="regionCode">Code <span class="required">*</span></label>
          <input id="regionCode" type="text" pInputText [(ngModel)]="regionForm.code" placeholder="Ex: AFR, EUR..." class="w-full" maxlength="10" style="text-transform: uppercase" />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button type="button" class="btn-dialog-cancel" (click)="showRegionDialog = false">
            <i class="pi pi-times"></i>
            <span>Annuler</span>
          </button>
          <button type="button" class="btn-dialog-save" [disabled]="!regionForm.nom || !regionForm.code" (click)="saveRegion()">
            <i class="pi pi-check"></i>
            <span>{{ editingRegion ? 'Mettre a jour' : 'Creer' }}</span>
          </button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- ==================== DIALOG ZONE ==================== -->
    <p-dialog
      [header]="editingZone ? 'Modifier la zone' : 'Nouvelle zone'"
      [(visible)]="showZoneDialog"
      [modal]="true"
      [style]="{ width: '480px' }"
      [closable]="true"
      styleClass="admin-dialog">
      <div class="dialog-body">
        @if (editingZone) {
          <div class="entity-preview">
            <div class="entity-icon zone-icon large">
              <i class="pi pi-map"></i>
            </div>
            <div class="preview-info">
              <span class="preview-name">{{ editingZone.nom }}</span>
              <span class="preview-detail">Region: {{ editingZone.regionNom }}</span>
            </div>
          </div>
        }
        <div class="form-field">
          <label for="zoneNom">Nom de la zone <span class="required">*</span></label>
          <input id="zoneNom" type="text" pInputText [(ngModel)]="zoneForm.nom" placeholder="Ex: France, Cameroun..." class="w-full" />
        </div>
        <div class="form-field">
          <label for="zoneRegion">Region <span class="required">*</span></label>
          <p-dropdown
            id="zoneRegion"
            [options]="regionOptions"
            [(ngModel)]="zoneForm.regionId"
            placeholder="Selectionner une region"
            optionLabel="label"
            optionValue="value"
            [filter]="true"
            filterPlaceholder="Rechercher..."
            appendTo="body"
            styleClass="w-full dialog-dropdown">
          </p-dropdown>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button type="button" class="btn-dialog-cancel" (click)="showZoneDialog = false">
            <i class="pi pi-times"></i>
            <span>Annuler</span>
          </button>
          <button type="button" class="btn-dialog-save" [disabled]="!zoneForm.nom || !zoneForm.regionId" (click)="saveZone()">
            <i class="pi pi-check"></i>
            <span>{{ editingZone ? 'Mettre a jour' : 'Creer' }}</span>
          </button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- ==================== DIALOG EGLISE LOCALE ==================== -->
    <p-dialog
      [header]="editingEgliseLocale ? 'Modifier l\\'eglise locale' : 'Nouvelle eglise locale'"
      [(visible)]="showEgliseLocaleDialog"
      [modal]="true"
      [style]="{ width: '520px' }"
      [closable]="true"
      styleClass="admin-dialog">
      <div class="dialog-body">
        @if (editingEgliseLocale) {
          <div class="entity-preview">
            <div class="entity-icon el-icon large">
              <i class="pi pi-building"></i>
            </div>
            <div class="preview-info">
              <span class="preview-name">{{ editingEgliseLocale.nom }}</span>
              <span class="preview-detail">Zone: {{ editingEgliseLocale.zoneNom }}</span>
            </div>
          </div>
        }
        <div class="form-field">
          <label for="elNom">Nom de l'eglise <span class="required">*</span></label>
          <input id="elNom" type="text" pInputText [(ngModel)]="egliseLocaleForm.nom" placeholder="Ex: CMCI Paris..." class="w-full" />
        </div>
        <div class="form-field">
          <label for="elZone">Zone <span class="required">*</span></label>
          <p-dropdown
            id="elZone"
            [options]="zoneOptions"
            [(ngModel)]="egliseLocaleForm.zoneId"
            placeholder="Selectionner une zone"
            optionLabel="label"
            optionValue="value"
            [filter]="true"
            filterPlaceholder="Rechercher..."
            appendTo="body"
            styleClass="w-full dialog-dropdown">
          </p-dropdown>
        </div>
        <div class="form-field">
          <label for="elAdresse">Adresse <span class="optional">(optionnel)</span></label>
          <input id="elAdresse" type="text" pInputText [(ngModel)]="egliseLocaleForm.adresse" placeholder="Adresse de l'eglise..." class="w-full" />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button type="button" class="btn-dialog-cancel" (click)="showEgliseLocaleDialog = false">
            <i class="pi pi-times"></i>
            <span>Annuler</span>
          </button>
          <button type="button" class="btn-dialog-save" [disabled]="!egliseLocaleForm.nom || !egliseLocaleForm.zoneId" (click)="saveEgliseLocale()">
            <i class="pi pi-check"></i>
            <span>{{ editingEgliseLocale ? 'Mettre a jour' : 'Creer' }}</span>
          </button>
        </div>
      </ng-template>
    </p-dialog>

    <!-- ==================== DIALOG EGLISE DE MAISON ==================== -->
    <p-dialog
      [header]="editingEgliseMaison ? 'Modifier l\\'eglise de maison' : 'Nouvelle eglise de maison'"
      [(visible)]="showEgliseMaisonDialog"
      [modal]="true"
      [style]="{ width: '520px' }"
      [closable]="true"
      styleClass="admin-dialog">
      <div class="dialog-body">
        @if (editingEgliseMaison) {
          <div class="entity-preview">
            <div class="entity-icon em-icon large">
              <i class="pi pi-home"></i>
            </div>
            <div class="preview-info">
              <span class="preview-name">{{ editingEgliseMaison.nom }}</span>
              <span class="preview-detail">Eglise locale: {{ editingEgliseMaison.egliseLocaleNom }}</span>
            </div>
          </div>
        }
        <div class="form-field">
          <label for="emNom">Nom de l'eglise de maison <span class="required">*</span></label>
          <input id="emNom" type="text" pInputText [(ngModel)]="egliseMaisonForm.nom" placeholder="Ex: Cellule Esperance..." class="w-full" />
        </div>
        <div class="form-field">
          <label for="emEgliseLocale">Eglise Locale <span class="required">*</span></label>
          <p-dropdown
            id="emEgliseLocale"
            [options]="egliseLocaleOptions"
            [(ngModel)]="egliseMaisonForm.egliseLocaleId"
            placeholder="Selectionner une eglise locale"
            optionLabel="label"
            optionValue="value"
            [filter]="true"
            filterPlaceholder="Rechercher..."
            appendTo="body"
            styleClass="w-full dialog-dropdown">
          </p-dropdown>
        </div>
        <div class="form-field">
          <label for="emAdresse">Adresse <span class="optional">(optionnel)</span></label>
          <input id="emAdresse" type="text" pInputText [(ngModel)]="egliseMaisonForm.adresse" placeholder="Adresse du lieu de reunion..." class="w-full" />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <div class="dialog-footer">
          <button type="button" class="btn-dialog-cancel" (click)="showEgliseMaisonDialog = false">
            <i class="pi pi-times"></i>
            <span>Annuler</span>
          </button>
          <button type="button" class="btn-dialog-save" [disabled]="!egliseMaisonForm.nom || !egliseMaisonForm.egliseLocaleId" (click)="saveEgliseMaison()">
            <i class="pi pi-check"></i>
            <span>{{ editingEgliseMaison ? 'Mettre a jour' : 'Creer' }}</span>
          </button>
        </div>
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .admin-container {
      padding: 0;
    }

    /* ===== TabView Styling (PrimeNG 19) ===== */
    ::ng-deep .p-tabs {
      .p-tablist {
        background: white;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        padding: 0.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      }

      .p-tablist-content {
        background: transparent;
      }

      .p-tablist-tab-list {
        border: none;
        gap: 0.375rem;
        background: transparent;
      }

      .p-tab {
        border: none;
        background: transparent;
        color: #64748b;
        font-weight: 600;
        font-size: 0.9375rem;
        padding: 0.75rem 1.5rem;
        border-radius: 12px;
        transition: all 0.2s ease;
        white-space: nowrap;
        cursor: pointer;
        margin: 0;

        &:focus {
          box-shadow: none;
        }

        &:hover:not(.p-tab-active) {
          background: #f1f5f9;
          color: #475569;
        }

        &.p-tab-active {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
          border: none;
        }
      }

      .p-tablist-active-bar {
        display: none;
      }

      .p-tabpanels {
        background: transparent;
        padding: 0;
        border: none;
      }
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

    /* ===== Header Buttons (custom, like btn-nouveau-cr) ===== */
    .btn-seed {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      background: white;
      color: #6366f1;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      height: 44px;

      i { font-size: 0.875rem; }

      &:hover:not(:disabled) {
        border-color: #6366f1;
        background: rgba(99, 102, 241, 0.04);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      &.loading {
        border-color: #6366f1;
        background: rgba(99, 102, 241, 0.04);
      }
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
      cursor: pointer;
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

      &.regions { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
      &.zones { background: rgba(14, 165, 233, 0.1); color: #0ea5e9; }
      &.eglises-locales { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
      &.eglises-maison { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
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

    /* ===== Filter Dropdown (PrimeNG 19) ===== */
    .filter-dropdown {
      min-width: 220px;
    }

    ::ng-deep .filter-select {
      width: 100%;

      /* PrimeNG 19 uses p-select as host class */
      &.p-select {
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

      .p-select-label {
        padding: 0.625rem 1rem;
        font-size: 0.9375rem;
        color: #1e293b;

        &.p-placeholder {
          color: #94a3b8;
        }
      }

      .p-select-dropdown {
        width: 2.5rem;
        color: #64748b;
      }

      .p-select-clear-icon {
        color: #94a3b8;
        &:hover { color: #64748b; }
      }

      /* Also keep p-dropdown selectors for backward compat */
      .p-dropdown {
        width: 100%;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        background: #f8fafc;
        height: 44px;

        &:not(.p-disabled):hover {
          border-color: #cbd5e1;
        }

        &:not(.p-disabled).p-focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
      }

      .p-dropdown-label {
        padding: 0.625rem 1rem;
        font-size: 0.9375rem;
        color: #1e293b;

        &.p-placeholder {
          color: #94a3b8;
        }
      }

      .p-dropdown-trigger {
        width: 2.5rem;
        color: #64748b;
      }
    }

    /* Dropdown overlay panel (PrimeNG 19) */
    ::ng-deep .p-select-overlay {
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
      border: 1px solid #e5e7eb;
      overflow: hidden;
      margin-top: 4px;

      .p-select-header {
        padding: 0.75rem;
        border-bottom: 1px solid #e5e7eb;

        .p-select-filter {
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;

          &:focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }
        }
      }

      .p-select-list {
        padding: 0.375rem;

        .p-select-option {
          border-radius: 8px;
          padding: 0.625rem 1rem;
          font-size: 0.9375rem;
          margin: 0.125rem 0;
          transition: all 0.15s ease;

          &:hover {
            background: #f1f5f9;
          }

          &.p-select-option-selected {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
            color: #6366f1;
            font-weight: 500;
          }
        }
      }
    }

    /* ===== Create Button (gradient like btn-nouveau-cr) ===== */
    .btn-create {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
      height: 44px;
      white-space: nowrap;

      i { font-size: 0.875rem; }

      &:hover {
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
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

    /* ===== Entity Cell (icon + name) ===== */
    .entity-cell {
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

      &.region-icon { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
      &.zone-icon { background: rgba(14, 165, 233, 0.1); color: #0ea5e9; }
      &.el-icon { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
      &.em-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

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

    /* ===== Count Badge ===== */
    .count-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 28px;
      height: 28px;
      padding: 0 8px;
      border-radius: 8px;
      background: #f1f5f9;
      color: #475569;
      font-weight: 600;
      font-size: 0.85rem;
    }

    /* ===== Pasteur/Leader Badge ===== */
    .pasteur-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.85rem;
      color: #475569;

      i {
        font-size: 0.75rem;
        color: #94a3b8;
      }
    }

    .text-secondary {
      color: #94a3b8;
    }

    /* ===== Status Tag ===== */
    ::ng-deep .p-tag {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 6px;

      &.p-tag-info {
        background: rgba(59, 130, 246, 0.1);
        color: #2563eb;
      }

      &.p-tag-secondary {
        background: rgba(100, 116, 139, 0.1);
        color: #475569;
      }
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

          &.p-button-danger {
            color: #ef4444;

            &:hover {
              background: rgba(239, 68, 68, 0.1);
            }
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

      .optional {
        font-weight: 400;
        color: #94a3b8;
        font-size: 0.8rem;
      }
    }

    /* Dialog inputs (matching CR form style) */
    ::ng-deep .admin-dialog {
      .p-inputtext {
        border-radius: 10px;
        border: 1px solid #e2e8f0;
        padding: 0.75rem 1rem;
        font-size: 0.9375rem;
        transition: all 0.2s;

        &:enabled:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
      }

      .dialog-dropdown {
        /* PrimeNG 19 p-select */
        .p-select {
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          height: 44px;
          width: 100%;
          transition: all 0.2s ease;

          &:not(.p-disabled):hover {
            border-color: #cbd5e1;
          }

          &:not(.p-disabled).p-focus,
          &.p-select-open {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }
        }

        .p-select-label {
          padding: 0.625rem 1rem;
          font-size: 0.9375rem;
        }

        /* Legacy p-dropdown fallback */
        .p-dropdown {
          border-radius: 10px;
          border: 1px solid #e2e8f0;
          height: 44px;

          &:not(.p-disabled).p-focus {
            border-color: #6366f1;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }
        }

        .p-dropdown-label {
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

      .btn-create {
        width: 100%;
        justify-content: center;
      }
    }

    @media (max-width: 768px) {
      .stats-grid { grid-template-columns: 1fr; }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .header-actions {
        width: 100%;
      }

      .btn-seed, .btn-refresh {
        flex: 1;
        justify-content: center;
      }
    }

    @media (max-width: 640px) {
      .header-actions {
        flex-direction: column;
      }

      .btn-seed, .btn-refresh {
        width: 100%;
      }
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
  activeTab = 0;

  // Search
  regionSearch = '';
  zoneSearch = '';
  egliseLocaleSearch = '';
  egliseMaisonSearch = '';

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

  // ===== Computed filtered lists =====

  get filteredRegions(): Region[] {
    if (!this.regionSearch) return this.regions;
    const term = this.regionSearch.toLowerCase();
    return this.regions.filter(r =>
      r.nom.toLowerCase().includes(term) || r.code.toLowerCase().includes(term)
    );
  }

  get filteredZones(): Zone[] {
    if (!this.zoneSearch) return this.zones;
    const term = this.zoneSearch.toLowerCase();
    return this.zones.filter(z =>
      z.nom.toLowerCase().includes(term) || z.regionNom.toLowerCase().includes(term)
    );
  }

  get filteredEglisesLocales(): EgliseLocale[] {
    if (!this.egliseLocaleSearch) return this.eglisesLocales;
    const term = this.egliseLocaleSearch.toLowerCase();
    return this.eglisesLocales.filter(e =>
      e.nom.toLowerCase().includes(term) ||
      e.zoneNom.toLowerCase().includes(term) ||
      (e.adresse?.toLowerCase().includes(term) ?? false) ||
      (e.pasteurNom?.toLowerCase().includes(term) ?? false)
    );
  }

  get filteredEglisesMaison(): EgliseMaison[] {
    if (!this.egliseMaisonSearch) return this.eglisesMaison;
    const term = this.egliseMaisonSearch.toLowerCase();
    return this.eglisesMaison.filter(e =>
      e.nom.toLowerCase().includes(term) ||
      e.egliseLocaleNom.toLowerCase().includes(term) ||
      (e.leaderNom?.toLowerCase().includes(term) ?? false) ||
      (e.adresse?.toLowerCase().includes(term) ?? false)
    );
  }

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
    switch (event.index) {
      case 0: this.facade.loadRegions(); break;
      case 1: this.facade.loadZones(); break;
      case 2: this.facade.loadEglisesLocales(); this.facade.loadZones(); break;
      case 3: this.facade.loadEglisesMaison(); this.facade.loadEglisesLocales(); break;
    }
  }

  refreshCurrentTab(): void {
    this.onTabChange({ index: this.activeTab });
  }

  // ========== REGION ==========

  openRegionDialog(region?: Region): void {
    this.editingRegion = region || null;
    this.regionForm = { nom: region?.nom || '', code: region?.code || '' };
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
          this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Region creee avec succes' });
          this.showRegionDialog = false;
        },
        error: () => {}
      });
    }
  }

  confirmDeleteRegion(region: Region): void {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment supprimer la region "${region.nom}" ? Cette action est irreversible.`,
      header: 'Confirmer la suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.facade.deleteRegion(region.id).subscribe({
          next: () => this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Region supprimee' }),
          error: () => {}
        });
      }
    });
  }

  seedGeography(): void {
    this.confirmationService.confirm({
      message: 'Cette action va importer les regions (continents) et les zones (pays) depuis l\'API RestCountries. Les doublons seront ignores.',
      header: 'Seed Geographique',
      icon: 'pi pi-globe',
      acceptLabel: 'Lancer le seed',
      rejectLabel: 'Annuler',
      accept: () => {
        this.isSeedLoading = true;
        this.facade.seedGeography().subscribe({
          next: (result) => {
            this.isSeedLoading = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Seed termine avec succes',
              detail: `${result.regionsCreated} regions et ${result.zonesCreated} zones creees. ${result.regionsSkipped + result.zonesSkipped} elements existants ignores.`,
              life: 8000
            });
          },
          error: () => { this.isSeedLoading = false; }
        });
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
    this.zoneForm = { nom: zone?.nom || '', regionId: zone?.regionId || '' };
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
          this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Zone creee avec succes' });
          this.showZoneDialog = false;
        },
        error: () => {}
      });
    }
  }

  confirmDeleteZone(zone: Zone): void {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment supprimer la zone "${zone.nom}" ? Cette action est irreversible.`,
      header: 'Confirmer la suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.facade.deleteZone(zone.id).subscribe({
          next: () => this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Zone supprimee' }),
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
    this.egliseLocaleForm = { nom: eglise?.nom || '', zoneId: eglise?.zoneId || '', adresse: eglise?.adresse || '' };
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
          this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Eglise locale creee avec succes' });
          this.showEgliseLocaleDialog = false;
        },
        error: () => {}
      });
    }
  }

  confirmDeleteEgliseLocale(eglise: EgliseLocale): void {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment supprimer l'eglise locale "${eglise.nom}" ? Cette action est irreversible.`,
      header: 'Confirmer la suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.facade.deleteEgliseLocale(eglise.id).subscribe({
          next: () => this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Eglise locale supprimee' }),
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
    this.egliseMaisonForm = { nom: eglise?.nom || '', egliseLocaleId: eglise?.egliseLocaleId || '', adresse: eglise?.adresse || '' };
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
          this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Eglise de maison creee avec succes' });
          this.showEgliseMaisonDialog = false;
        },
        error: () => {}
      });
    }
  }

  confirmDeleteEgliseMaison(eglise: EgliseMaison): void {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment supprimer l'eglise de maison "${eglise.nom}" ? Cette action est irreversible.`,
      header: 'Confirmer la suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.facade.deleteEgliseMaison(eglise.id).subscribe({
          next: () => this.messageService.add({ severity: 'success', summary: 'Succes', detail: 'Eglise de maison supprimee' }),
          error: () => {}
        });
      }
    });
  }
}
