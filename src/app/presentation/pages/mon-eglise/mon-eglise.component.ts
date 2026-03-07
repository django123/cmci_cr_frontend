import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { AvatarModule } from 'primeng/avatar';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseHttpService } from '../../../infrastructure/http/base-http.service';
import { ApiEndpoints } from '../../../infrastructure/config/api.config';

interface EgliseMaisonInfo {
  id: string;
  nom: string;
  egliseLocaleId: string;
  egliseLocaleNom: string;
  leaderId?: string;
  leaderNom?: string;
  adresse?: string;
  nombreFideles: number;
}

interface MembreEglise {
  id: string;
  nom: string;
  prenom: string;
  nomComplet: string;
  email: string;
  telephone?: string;
  role: string;
  roleDisplayName: string;
}

interface EgliseMaisonStatistiques {
  nombreMembres: number;
  nombreTotalCRs: number;
  dureeTotalePriere: string;
  totalChapitresLus: number;
  totalPersonnesEvangelisees: number;
  nombreConfessions: number;
  nombreJeunes: number;
  tauxMoyenRegularite: number;
  startDate: string;
  endDate: string;
}

interface MonEgliseMaisonData {
  egliseMaison: EgliseMaisonInfo;
  membres: MembreEglise[];
  statistiques: EgliseMaisonStatistiques;
}

type PageState = 'loading' | 'no-church' | 'error' | 'loaded';

@Component({
  selector: 'app-mon-eglise',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    SkeletonModule,
    AvatarModule,
    ToastModule,
    ButtonModule,
    RippleModule,
    TranslateModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="mon-eglise-container">

      <!-- Header -->
      <div class="page-header">
        <div class="header-icon">
          <i class="pi pi-home"></i>
        </div>
        <div class="header-content">
          <h1>{{ 'MON_EGLISE.TITLE' | translate }}</h1>
          <p>{{ 'MON_EGLISE.SUBTITLE' | translate }}</p>
        </div>
      </div>

      <!-- Loading Skeleton -->
      @if (state === 'loading') {
        <div class="skeleton-container">
          <p-skeleton height="200px" styleClass="mb-4 p-skeleton-card"></p-skeleton>
          <p-skeleton height="280px" styleClass="mb-4 p-skeleton-card"></p-skeleton>
          <p-skeleton height="320px" styleClass="p-skeleton-card"></p-skeleton>
        </div>
      }

      <!-- No Church Assigned -->
      @if (state === 'no-church') {
        <div class="feedback-state no-church">
          <div class="state-icon">
            <i class="pi pi-building"></i>
          </div>
          <h3>{{ 'MON_EGLISE.NO_CHURCH' | translate }}</h3>
          <p>{{ 'MON_EGLISE.NO_CHURCH_MESSAGE' | translate }}</p>
        </div>
      }

      <!-- Error State -->
      @if (state === 'error') {
        <div class="feedback-state error">
          <div class="state-icon error-icon">
            <i class="pi pi-exclamation-triangle"></i>
          </div>
          <h3>{{ 'MON_EGLISE.ERROR_LOAD' | translate }}</h3>
          <p>{{ errorMessage }}</p>
          <button
            pButton pRipple
            type="button"
            icon="pi pi-refresh"
            [label]="'COMMON.REFRESH' | translate"
            class="p-button-outlined p-button-primary mt-3"
            (click)="loadData()">
          </button>
        </div>
      }

      <!-- Loaded State -->
      @if (state === 'loaded' && data) {

        <!-- Church Info Card -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-icon church-color">
              <i class="pi pi-home"></i>
            </div>
            <div>
              <h2>{{ 'MON_EGLISE.CHURCH_INFO' | translate }}</h2>
              <span class="section-subtitle">{{ data.egliseMaison.nom }}</span>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-tile">
              <span class="tile-label"><i class="pi pi-user"></i> {{ 'MON_EGLISE.LEADER' | translate }}</span>
              <span class="tile-value">{{ data.egliseMaison.leaderNom || ('MON_EGLISE.NO_LEADER' | translate) }}</span>
            </div>
            <div class="info-tile">
              <span class="tile-label"><i class="pi pi-map-marker"></i> {{ 'MON_EGLISE.ADDRESS' | translate }}</span>
              <span class="tile-value">{{ data.egliseMaison.adresse || ('MON_EGLISE.NO_ADDRESS' | translate) }}</span>
            </div>
            <div class="info-tile">
              <span class="tile-label"><i class="pi pi-building"></i> {{ 'MON_EGLISE.LOCAL_CHURCH' | translate }}</span>
              <span class="tile-value">{{ data.egliseMaison.egliseLocaleNom }}</span>
            </div>
            <div class="info-tile accent">
              <span class="tile-label"><i class="pi pi-users"></i> {{ 'MON_EGLISE.MEMBERS_COUNT' | translate }}</span>
              <span class="tile-value large">{{ data.egliseMaison.nombreFideles }}</span>
            </div>
          </div>
        </div>

        <!-- Statistics Card -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-icon stats-color">
              <i class="pi pi-chart-bar"></i>
            </div>
            <div>
              <h2>{{ 'MON_EGLISE.STATS_TITLE' | translate }}</h2>
              <span class="section-subtitle">
                {{ 'MON_EGLISE.CURRENT_MONTH' | translate }}
                &nbsp;·&nbsp;
                {{ data.statistiques.startDate | date:'dd/MM' }} – {{ data.statistiques.endDate | date:'dd/MM/yyyy' }}
              </span>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card indigo">
              <div class="stat-icon"><i class="pi pi-file-edit"></i></div>
              <div class="stat-body">
                <span class="stat-num">{{ data.statistiques.nombreTotalCRs }}</span>
                <span class="stat-lbl">{{ 'MON_EGLISE.STAT_TOTAL_CRS' | translate }}</span>
              </div>
            </div>

            <div class="stat-card emerald">
              <div class="stat-icon"><i class="pi pi-clock"></i></div>
              <div class="stat-body">
                <span class="stat-num">{{ data.statistiques.dureeTotalePriere }}</span>
                <span class="stat-lbl">{{ 'MON_EGLISE.STAT_PRAYER_HOURS' | translate }}</span>
              </div>
            </div>

            <div class="stat-card blue">
              <div class="stat-icon"><i class="pi pi-book"></i></div>
              <div class="stat-body">
                <span class="stat-num">{{ data.statistiques.totalChapitresLus }}</span>
                <span class="stat-lbl">{{ 'MON_EGLISE.STAT_CHAPTERS' | translate }}</span>
              </div>
            </div>

            <div class="stat-card amber">
              <div class="stat-icon"><i class="pi pi-send"></i></div>
              <div class="stat-body">
                <span class="stat-num">{{ data.statistiques.totalPersonnesEvangelisees }}</span>
                <span class="stat-lbl">{{ 'MON_EGLISE.STAT_EVANGELISM' | translate }}</span>
              </div>
            </div>

            <div class="stat-card purple">
              <div class="stat-icon"><i class="pi pi-heart"></i></div>
              <div class="stat-body">
                <span class="stat-num">{{ data.statistiques.nombreConfessions }}</span>
                <span class="stat-lbl">{{ 'MON_EGLISE.STAT_CONFESSIONS' | translate }}</span>
              </div>
            </div>

            <div class="stat-card orange">
              <div class="stat-icon"><i class="pi pi-sun"></i></div>
              <div class="stat-body">
                <span class="stat-num">{{ data.statistiques.nombreJeunes }}</span>
                <span class="stat-lbl">{{ 'MON_EGLISE.STAT_FASTING' | translate }}</span>
              </div>
            </div>

            <div class="stat-card teal wide">
              <div class="stat-icon"><i class="pi pi-percentage"></i></div>
              <div class="stat-body">
                <span class="stat-num">{{ data.statistiques.tauxMoyenRegularite | number:'1.0-1' }}%</span>
                <span class="stat-lbl">{{ 'MON_EGLISE.STAT_REGULARITY' | translate }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Members Table -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-icon members-color">
              <i class="pi pi-users"></i>
            </div>
            <div>
              <h2>{{ 'MON_EGLISE.MEMBERS_TITLE' | translate }}
                <span class="member-count-badge">{{ data.membres.length }}</span>
              </h2>
              <span class="section-subtitle">{{ 'MON_EGLISE.MEMBERS_SUBTITLE' | translate }}</span>
            </div>
          </div>

          @if (data.membres.length === 0) {
            <div class="no-data-row">
              <i class="pi pi-users"></i>
              <span>{{ 'MON_EGLISE.NO_MEMBERS' | translate }}</span>
            </div>
          } @else {
            <p-table
              [value]="data.membres"
              [paginator]="true"
              [rows]="10"
              [rowsPerPageOptions]="[5, 10, 25]"
              styleClass="p-datatable-sm p-datatable-gridlines"
              [tableStyle]="{'min-width': '40rem'}">

              <ng-template pTemplate="header">
                <tr>
                  <th style="min-width: 200px">{{ 'MON_EGLISE.MEMBER_NAME' | translate }}</th>
                  <th>{{ 'MON_EGLISE.MEMBER_EMAIL' | translate }}</th>
                  <th>{{ 'MON_EGLISE.MEMBER_PHONE' | translate }}</th>
                  <th style="min-width: 120px">{{ 'MON_EGLISE.MEMBER_ROLE' | translate }}</th>
                </tr>
              </ng-template>

              <ng-template pTemplate="body" let-membre>
                <tr>
                  <td>
                    <div class="member-cell">
                      <div class="member-avatar">
                        {{ getInitials(membre.nomComplet) }}
                      </div>
                      <span>{{ membre.nomComplet }}</span>
                    </div>
                  </td>
                  <td>{{ membre.email }}</td>
                  <td>{{ membre.telephone || '—' }}</td>
                  <td>
                    <p-tag
                      [value]="membre.roleDisplayName"
                      [severity]="getRoleSeverity(membre.role)">
                    </p-tag>
                  </td>
                </tr>
              </ng-template>

            </p-table>
          }
        </div>

      }
    </div>
  `,
  styles: [`
    .mon-eglise-container {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* ─── Page Header ─── */
    .page-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .header-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      i { font-size: 1.5rem; color: white; }
    }

    .header-content h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-color, #1e293b);
      margin: 0 0 0.25rem 0;
    }

    .header-content p {
      color: var(--text-color-secondary, #64748b);
      margin: 0;
      font-size: 0.95rem;
    }

    /* ─── Skeleton ─── */
    .skeleton-container { display: flex; flex-direction: column; gap: 1.5rem; }

    :host ::ng-deep .p-skeleton-card {
      border-radius: 16px !important;
    }

    /* ─── Feedback States ─── */
    .feedback-state {
      text-align: center;
      padding: 4rem 2rem;
      background: var(--surface-card, white);
      border-radius: 16px;
      border: 1px solid var(--surface-border, #e2e8f0);

      .state-icon {
        width: 80px;
        height: 80px;
        background: var(--surface-100, #f1f5f9);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
        i { font-size: 2rem; color: var(--text-color-secondary, #64748b); }
      }

      .error-icon { background: rgba(239, 68, 68, 0.08); i { color: #ef4444; } }

      h3 {
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--text-color, #1e293b);
        margin: 0 0 0.5rem;
      }

      p { color: var(--text-color-secondary, #64748b); margin: 0; }
    }

    /* ─── Section Cards ─── */
    .section-card {
      background: var(--surface-card, white);
      border-radius: 16px;
      border: 1px solid var(--surface-border, #e2e8f0);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;

      h2 {
        font-size: 1.05rem;
        font-weight: 600;
        color: var(--text-color, #1e293b);
        margin: 0 0 0.15rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
    }

    .section-subtitle {
      font-size: 0.82rem;
      color: var(--text-color-secondary, #64748b);
    }

    .section-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      i { font-size: 1.2rem; }
    }

    .church-color  { background: rgba(99, 102, 241, 0.12); i { color: #6366f1; } }
    .stats-color   { background: rgba(16, 185, 129, 0.12); i { color: #10b981; } }
    .members-color { background: rgba(59, 130, 246, 0.12); i { color: #3b82f6; } }

    .member-count-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: rgba(99, 102, 241, 0.12);
      color: #6366f1;
      font-size: 0.75rem;
      font-weight: 700;
      border-radius: 20px;
      padding: 2px 8px;
      min-width: 24px;
    }

    /* ─── Info Tiles ─── */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: 1rem;
    }

    .info-tile {
      background: var(--surface-50, #f8fafc);
      border: 1px solid var(--surface-border, #e2e8f0);
      border-radius: 12px;
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      &.accent {
        background: rgba(99, 102, 241, 0.06);
        border-color: rgba(99, 102, 241, 0.2);
      }
    }

    .tile-label {
      font-size: 0.78rem;
      font-weight: 500;
      color: var(--text-color-secondary, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      i { font-size: 0.8rem; }
    }

    .tile-value {
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-color, #1e293b);
      &.large { font-size: 1.6rem; color: #6366f1; line-height: 1; }
    }

    /* ─── Stats Grid ─── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(175px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      background: var(--surface-50, #f8fafc);
      border-radius: 12px;
      padding: 1rem;
      border-left: 4px solid transparent;

      &.wide { grid-column: 1 / -1; }

      &.indigo { border-left-color: #6366f1; .stat-icon { background: rgba(99, 102, 241, 0.1); i { color: #6366f1; } } }
      &.emerald{ border-left-color: #10b981; .stat-icon { background: rgba(16, 185, 129, 0.1); i { color: #10b981; } } }
      &.blue   { border-left-color: #3b82f6; .stat-icon { background: rgba(59, 130, 246, 0.1);  i { color: #3b82f6; } } }
      &.amber  { border-left-color: #f59e0b; .stat-icon { background: rgba(245, 158, 11, 0.1);  i { color: #f59e0b; } } }
      &.purple { border-left-color: #8b5cf6; .stat-icon { background: rgba(139, 92, 246, 0.1);  i { color: #8b5cf6; } } }
      &.orange { border-left-color: #f97316; .stat-icon { background: rgba(249, 115, 22, 0.1);  i { color: #f97316; } } }
      &.teal   { border-left-color: #14b8a6; .stat-icon { background: rgba(20, 184, 166, 0.1);  i { color: #14b8a6; } } }
    }

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      i { font-size: 1.1rem; }
    }

    .stat-body { display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }

    .stat-num {
      font-size: 1.45rem;
      font-weight: 700;
      color: var(--text-color, #1e293b);
      line-height: 1;
    }

    .stat-lbl {
      font-size: 0.75rem;
      color: var(--text-color-secondary, #64748b);
      font-weight: 500;
      white-space: nowrap;
    }

    /* ─── Members ─── */
    .member-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .member-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      font-size: 0.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .no-data-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 2.5rem;
      color: var(--text-color-secondary, #64748b);
      font-size: 0.95rem;
      i { font-size: 1.5rem; }
    }

    :host ::ng-deep {
      .p-datatable.p-datatable-sm .p-datatable-thead > tr > th {
        background: var(--surface-50, #f8fafc);
        font-weight: 600;
        color: var(--text-color-secondary, #64748b);
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 0.6rem 1rem;
      }

      .p-datatable.p-datatable-sm .p-datatable-tbody > tr > td {
        padding: 0.6rem 1rem;
      }

      .p-tag { font-size: 0.72rem; padding: 0.2rem 0.5rem; }
    }

    .mt-3 { margin-top: 1rem; }
  `]
})
export class MonEgliseComponent implements OnInit, OnDestroy {
  private readonly http = inject(BaseHttpService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();

  state: PageState = 'loading';
  data: MonEgliseMaisonData | null = null;
  errorMessage = '';

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData(): void {
    this.state = 'loading';
    this.data = null;
    this.errorMessage = '';

    this.http.get<MonEgliseMaisonData>(ApiEndpoints.MON_EGLISE.BASE)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.data = response;
          this.state = 'loaded';
        },
        error: (error) => {
          if (error.status === 404) {
            this.state = 'no-church';
          } else {
            this.state = 'error';
            this.errorMessage = error.message || this.translate.instant('MON_EGLISE.ERROR_LOAD');
          }
        }
      });
  }

  getInitials(nomComplet: string): string {
    const parts = nomComplet.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nomComplet.substring(0, 2).toUpperCase();
  }

  getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (role) {
      case 'ADMIN':   return 'danger';
      case 'PASTEUR': return 'warn';
      case 'LEADER':  return 'info';
      case 'FD':      return 'success';
      default:        return 'secondary';
    }
  }
}
