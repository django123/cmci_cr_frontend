import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { StatisticsFacade } from '../../../application/use-cases';
import { SubordinatesFacade } from '../../../application/use-cases/subordinates/subordinates.facade';
import {
  Statistics,
  SubordinateStatistics,
  formatMinutesToReadable,
  getTotalPrayerMinutes
} from '../../../domain/models';
import { AuthService } from '../../../infrastructure/auth/auth.service';
import { Role } from '../../../domain/enums';

type StatisticsMode = 'personal' | 'group';
type ExportFormat = 'pdf' | 'excel';
type AlertSeverity = 'success' | 'warn' | 'danger';

interface GroupSummary {
  memberCount: number;
  totalReports: number;
  averageRegularity: number;
  averageRdqd: number;
  totalPrayerMinutes: number;
  totalChaptersRead: number;
  totalEvangelized: number;
  totalConfessions: number;
  totalFasts: number;
  warningCount: number;
  criticalCount: number;
  alertCount: number;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule,
    ButtonModule,
    SkeletonModule,
    TooltipModule,
    RippleModule,
    ToastModule,
    TableModule,
    TagModule,
    TranslateModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>

    <div class="statistics-page">
      <div class="page-header">
        <div class="header-main">
          <div class="title-icon">
            <i class="pi pi-chart-bar"></i>
          </div>
          <div class="title-copy">
            <h1>{{ getTitleKey() | translate }}</h1>
            <p>{{ getSubtitleKey() | translate }}</p>
          </div>
        </div>

        <div class="header-actions">
          @if (canViewGroupStats) {
            <div class="mode-switch">
              <button
                type="button"
                class="mode-btn"
                [class.active]="statsMode === 'personal'"
                (click)="setMode('personal')">
                <i class="pi pi-user"></i>
                <span>{{ 'STATISTICS.MODE_PERSONAL' | translate }}</span>
              </button>
              <button
                type="button"
                class="mode-btn"
                [class.active]="statsMode === 'group'"
                (click)="setMode('group')">
                <i class="pi pi-users"></i>
                <span>{{ 'STATISTICS.MODE_GROUP' | translate }}</span>
              </button>
            </div>
          }

          <div class="period-controls">
            <p-calendar
              [(ngModel)]="dateRange"
              selectionMode="range"
              [readonlyInput]="true"
              [placeholder]="'STATISTICS.CHOOSE_PERIOD' | translate"
              dateFormat="dd/mm/yy"
              [showIcon]="true"
              (onSelect)="onPeriodChange()"
              appendTo="body"
              styleClass="period-calendar">
            </p-calendar>

            <div class="quick-range">
              <button
                type="button"
                class="range-btn"
                [class.active]="activePeriod === 'month'"
                (click)="loadCurrentMonth()">
                <i class="pi pi-calendar"></i>
                <span>{{ 'STATISTICS.THIS_MONTH' | translate }}</span>
              </button>
              <button
                type="button"
                class="range-btn"
                [class.active]="activePeriod === 'week'"
                (click)="loadCurrentWeek()">
                <i class="pi pi-calendar-minus"></i>
                <span>{{ 'STATISTICS.THIS_WEEK' | translate }}</span>
              </button>
            </div>
          </div>

          <div class="export-actions">
            <button
              type="button"
              class="export-btn pdf"
              [disabled]="!hasDataToExport() || exporting"
              [pTooltip]="getPdfTooltipKey() | translate"
              tooltipPosition="bottom"
              pRipple
              (click)="downloadFile('pdf')">
              @if (exporting && exportFormat === 'pdf') {
                <i class="pi pi-spin pi-spinner"></i>
              } @else {
                <i class="pi pi-file-pdf"></i>
              }
              <span>PDF</span>
            </button>

            <button
              type="button"
              class="export-btn excel"
              [disabled]="!hasDataToExport() || exporting"
              [pTooltip]="getExcelTooltipKey() | translate"
              tooltipPosition="bottom"
              pRipple
              (click)="downloadFile('excel')">
              @if (exporting && exportFormat === 'excel') {
                <i class="pi pi-spin pi-spinner"></i>
              } @else {
                <i class="pi pi-file-excel"></i>
              }
              <span>Excel</span>
            </button>
          </div>
        </div>
      </div>

      @if (isLoading) {
        <div class="stats-grid">
          @for (i of [1,2,3,4]; track i) {
            <div class="stat-card skeleton-card">
              <p-skeleton width="48px" height="48px" borderRadius="14px"></p-skeleton>
              <div class="skeleton-lines">
                <p-skeleton width="120px" height="1.8rem"></p-skeleton>
                <p-skeleton width="160px" height="0.875rem"></p-skeleton>
              </div>
            </div>
          }
        </div>
      } @else if (statsMode === 'personal' && currentStats) {
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-kicker">{{ 'STATISTICS.CR_SUBMITTED' | translate }}</span>
            <span class="stat-value">{{ currentStats.totalCRSoumis }}</span>
            <span class="stat-meta">{{ currentStats.totalCRValides }} {{ 'STATISTICS.CR_VALIDATED_COUNT' | translate }}</span>
          </div>

          <div class="stat-card">
            <span class="stat-kicker">{{ 'STATISTICS.COMPLETION_RATE' | translate }}</span>
            <span class="stat-value">{{ currentStats.tauxCompletion | number:'1.0-1' }}%</span>
            <div class="mini-bar">
              <div class="mini-bar-fill" [style.width.%]="currentStats.tauxCompletion"></div>
            </div>
          </div>

          <div class="stat-card">
            <span class="stat-kicker">{{ 'STATISTICS.RDQD_AVERAGE' | translate }}</span>
            <span class="stat-value">{{ currentStats.moyenneRDQD | number:'1.0-1' }}%</span>
            <span class="stat-meta">
              {{ currentStats.totalRDQDAccomplis }}/{{ currentStats.totalRDQDAttendus }}
              {{ 'STATISTICS.RDQD_COMPLETED' | translate }}
            </span>
          </div>

          <div class="stat-card">
            <span class="stat-kicker">{{ 'STATISTICS.TOTAL_PRAYER_TIME' | translate }}</span>
            <span class="stat-value">{{ getTotalPrayerDisplay() }}</span>
            <span class="stat-meta">{{ 'STATISTICS.PRAYER_TIME' | translate }}</span>
          </div>
        </div>

        <div class="details-grid">
          <section class="detail-card">
            <div class="section-header">
              <h2>{{ 'STATISTICS.PRAYER_TIME' | translate }}</h2>
            </div>
            <div class="metric-list">
              <div class="metric-row">
                <span>{{ 'STATISTICS.SOLO_PRAYER' | translate }}</span>
                <strong>{{ formatMinutes(currentStats.totalPriereSeuleMinutes) }}</strong>
              </div>
              <div class="metric-row">
                <span>{{ 'STATISTICS.COUPLE_PRAYER' | translate }}</span>
                <strong>{{ formatMinutes(currentStats.totalPriereCoupleMinutes) }}</strong>
              </div>
              <div class="metric-row">
                <span>{{ 'STATISTICS.FAMILY_PRAYER' | translate }}</span>
                <strong>{{ formatMinutes(currentStats.totalPriereAvecEnfantsMinutes) }}</strong>
              </div>
            </div>
          </section>

          <section class="detail-card">
            <div class="section-header">
              <h2>{{ 'STATISTICS.STUDY_ACTIVITIES' | translate }}</h2>
            </div>
            <div class="metric-list">
              <div class="metric-row">
                <span>{{ 'STATISTICS.STUDY_TIME' | translate }}</span>
                <strong>{{ formatMinutes(currentStats.totalTempsEtudeParoleMinutes) }}</strong>
              </div>
              <div class="metric-row">
                <span>{{ 'STATISTICS.USEFUL_CONTACTS_LABEL' | translate }}</span>
                <strong>{{ currentStats.totalContactsUtiles }}</strong>
              </div>
              <div class="metric-row">
                <span>{{ 'STATISTICS.WORSHIP_INVITATIONS' | translate }}</span>
                <strong>{{ currentStats.totalInvitationsCulte }}</strong>
              </div>
              <div class="metric-row">
                <span>{{ 'STATISTICS.EVANGELIZATIONS_LABEL' | translate }}</span>
                <strong>{{ currentStats.totalEvangelisations }}</strong>
              </div>
            </div>
          </section>

          <section class="detail-card detail-card-wide">
            <div class="section-header">
              <h2>{{ 'STATISTICS.OFFERINGS' | translate }}</h2>
            </div>
            <div class="offering-block">
              <span class="offering-currency">XAF</span>
              <span class="offering-value">{{ currentStats.totalOffrandes | number:'1.0-0' }}</span>
            </div>
            <p class="offering-caption">{{ 'STATISTICS.TOTAL_OFFERINGS' | translate }}</p>
          </section>
        </div>
      } @else if (statsMode === 'group' && groupStatistics.length > 0) {
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-kicker">{{ 'STATISTICS.GROUP_MEMBERS' | translate }}</span>
            <span class="stat-value">{{ groupSummary.memberCount }}</span>
            <span class="stat-meta">{{ 'STATISTICS.GROUP_ACTIVE_SCOPE' | translate }}</span>
          </div>

          <div class="stat-card">
            <span class="stat-kicker">{{ 'STATISTICS.GROUP_TOTAL_REPORTS' | translate }}</span>
            <span class="stat-value">{{ groupSummary.totalReports }}</span>
            <span class="stat-meta">{{ 'STATISTICS.CR_SUBMITTED' | translate }}</span>
          </div>

          <div class="stat-card">
            <span class="stat-kicker">{{ 'STATISTICS.GROUP_AVG_REGULARITY' | translate }}</span>
            <span class="stat-value">{{ groupSummary.averageRegularity | number:'1.0-1' }}%</span>
            <div class="mini-bar">
              <div class="mini-bar-fill" [style.width.%]="groupSummary.averageRegularity"></div>
            </div>
          </div>

          <div class="stat-card">
            <span class="stat-kicker">{{ 'STATISTICS.GROUP_ALERTS' | translate }}</span>
            <span class="stat-value">{{ groupSummary.alertCount }}</span>
            <span class="stat-meta">
              {{ groupSummary.criticalCount }} {{ 'STATISTICS.ALERT_CRITICAL' | translate }},
              {{ groupSummary.warningCount }} {{ 'STATISTICS.ALERT_WARNING' | translate }}
            </span>
          </div>
        </div>

        <div class="details-grid">
          <section class="detail-card">
            <div class="section-header">
              <h2>{{ 'STATISTICS.GROUP_SPIRITUAL_ACTIVITY' | translate }}</h2>
            </div>
            <div class="metric-list">
              <div class="metric-row">
                <span>{{ 'STATISTICS.RDQD_AVERAGE' | translate }}</span>
                <strong>{{ groupSummary.averageRdqd | number:'1.0-1' }}%</strong>
              </div>
              <div class="metric-row">
                <span>{{ 'STATISTICS.TOTAL_PRAYER_TIME' | translate }}</span>
                <strong>{{ formatMinutes(groupSummary.totalPrayerMinutes) }}</strong>
              </div>
              <div class="metric-row">
                <span>{{ 'STATISTICS.GROUP_TOTAL_CHAPTERS' | translate }}</span>
                <strong>{{ groupSummary.totalChaptersRead }}</strong>
              </div>
              <div class="metric-row">
                <span>{{ 'STATISTICS.EVANGELIZATIONS_LABEL' | translate }}</span>
                <strong>{{ groupSummary.totalEvangelized }}</strong>
              </div>
            </div>
          </section>

          <section class="detail-card">
            <div class="section-header">
              <h2>{{ 'STATISTICS.GROUP_PRACTICES' | translate }}</h2>
            </div>
            <div class="metric-list">
              <div class="metric-row">
                <span>{{ 'STATISTICS.GROUP_CONFESSIONS' | translate }}</span>
                <strong>{{ groupSummary.totalConfessions }}</strong>
              </div>
              <div class="metric-row">
                <span>{{ 'STATISTICS.GROUP_FASTS' | translate }}</span>
                <strong>{{ groupSummary.totalFasts }}</strong>
              </div>
              <div class="metric-row">
                <span>{{ 'STATISTICS.GROUP_WITH_ALERTS' | translate }}</span>
                <strong>{{ groupSummary.alertCount }}</strong>
              </div>
            </div>
          </section>
        </div>

        <section class="table-card">
          <div class="section-header">
            <h2>{{ 'STATISTICS.GROUP_MEMBER_LIST' | translate }}</h2>
          </div>

          <p-table
            [value]="groupStatistics"
            [paginator]="true"
            [rows]="10"
            [rowsPerPageOptions]="[5, 10, 25, 50]"
            [showCurrentPageReport]="true"
            [currentPageReportTemplate]="'COMMON.PAGINATION' | translate"
            styleClass="p-datatable-striped">

            <ng-template pTemplate="header">
              <tr>
                <th>{{ 'STATISTICS.GROUP_MEMBER' | translate }}</th>
                <th>{{ 'STATISTICS.GROUP_ROLE' | translate }}</th>
                <th>{{ 'STATISTICS.GROUP_TOTAL_REPORTS' | translate }}</th>
                <th>{{ 'STATISTICS.GROUP_REGULARITY_RATE' | translate }}</th>
                <th>{{ 'STATISTICS.GROUP_RDQD_RATE' | translate }}</th>
                <th>{{ 'STATISTICS.GROUP_TOTAL_PRAYER' | translate }}</th>
                <th>{{ 'STATISTICS.GROUP_TOTAL_CHAPTERS' | translate }}</th>
                <th>{{ 'STATISTICS.GROUP_EVANGELIZED' | translate }}</th>
                <th>{{ 'STATISTICS.GROUP_ALERT_LEVEL' | translate }}</th>
              </tr>
            </ng-template>

            <ng-template pTemplate="body" let-stat>
              <tr>
                <td>
                  <div class="member-cell">
                    <span class="member-name">{{ stat.nomComplet }}</span>
                    <span class="member-email">{{ stat.email }}</span>
                  </div>
                </td>
                <td>
                  <span class="role-chip">{{ stat.roleDisplayName }}</span>
                </td>
                <td>{{ stat.nombreTotalCRs }}</td>
                <td>{{ stat.tauxRegularite | number:'1.0-1' }}%</td>
                <td>{{ stat.tauxRDQD | number:'1.0-1' }}%</td>
                <td>{{ stat.dureeTotalePriere }}</td>
                <td>{{ stat.totalChapitresLus }}</td>
                <td>{{ stat.totalPersonnesEvangelisees }}</td>
                <td>
                  <p-tag
                    [value]="getAlertLabel(stat.alertLevel)"
                    [severity]="getAlertSeverity(stat.alertLevel)">
                  </p-tag>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </section>
      } @else {
        <div class="empty-state">
          <div class="empty-icon">
            <i class="pi pi-chart-bar"></i>
          </div>
          <h3>{{ 'STATISTICS.NO_DATA_TITLE' | translate }}</h3>
          <p>{{ getEmptyMessageKey() | translate }}</p>
          <button type="button" class="reload-btn" pRipple (click)="loadCurrentMonth()">
            <i class="pi pi-calendar"></i>
            <span>{{ 'STATISTICS.LOAD_CURRENT_MONTH' | translate }}</span>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .statistics-page {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header,
    .detail-card,
    .table-card,
    .empty-state,
    .stat-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
    }

    .page-header {
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      gap: 1.25rem;
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .header-main {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .title-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .title-copy h1 {
      margin: 0 0 0.2rem;
      font-size: 1.5rem;
      color: #111827;
    }

    .title-copy p {
      margin: 0;
      color: #6b7280;
      font-size: 0.92rem;
    }

    .header-actions {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      align-items: flex-end;
      flex: 1;
    }

    .mode-switch,
    .quick-range {
      display: inline-flex;
      gap: 0.35rem;
      padding: 0.25rem;
      border-radius: 12px;
      background: #f3f4f6;
    }

    .mode-btn,
    .range-btn,
    .export-btn,
    .reload-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 600;
    }

    .mode-btn,
    .range-btn {
      padding: 0.6rem 0.9rem;
      border-radius: 10px;
      background: transparent;
      color: #4b5563;
    }

    .mode-btn.active,
    .range-btn.active {
      background: white;
      color: #1d4ed8;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.12);
    }

    .period-controls {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    ::ng-deep .period-calendar .p-inputtext {
      min-width: 220px;
      height: 42px;
      border-radius: 10px;
      border: 1px solid #d1d5db;
      padding: 0.6rem 0.9rem;
    }

    .export-actions {
      display: flex;
      gap: 0.5rem;
    }

    .export-btn,
    .reload-btn {
      height: 42px;
      padding: 0 1rem;
      border-radius: 10px;
      color: white;
    }

    .export-btn.pdf,
    .reload-btn {
      background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
    }

    .export-btn.excel {
      background: linear-gradient(135deg, #059669 0%, #16a34a 100%);
    }

    .export-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1rem;
    }

    .stat-card {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      min-height: 158px;
    }

    .skeleton-card {
      align-items: flex-start;
      justify-content: center;
    }

    .skeleton-lines {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
    }

    .stat-kicker {
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #6b7280;
      font-weight: 700;
    }

    .stat-value {
      font-size: 2rem;
      line-height: 1;
      color: #111827;
      font-weight: 700;
    }

    .stat-meta {
      color: #6b7280;
      font-size: 0.88rem;
    }

    .mini-bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 999px;
      overflow: hidden;
    }

    .mini-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #2563eb 0%, #7c3aed 100%);
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }

    .detail-card {
      padding: 1.25rem;
    }

    .detail-card-wide {
      grid-column: 1 / -1;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .section-header h2 {
      margin: 0;
      font-size: 1rem;
      color: #111827;
    }

    .metric-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .metric-row {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding-bottom: 0.65rem;
      border-bottom: 1px solid #f3f4f6;
      color: #374151;
    }

    .metric-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .metric-row strong {
      color: #111827;
    }

    .offering-block {
      display: flex;
      gap: 0.5rem;
      align-items: baseline;
    }

    .offering-currency {
      color: #6b7280;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .offering-value {
      font-size: 2.4rem;
      font-weight: 700;
      color: #111827;
    }

    .offering-caption {
      margin: 0.75rem 0 0;
      color: #6b7280;
    }

    .table-card {
      padding: 1.25rem;
    }

    .member-cell {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .member-name {
      font-weight: 600;
      color: #111827;
    }

    .member-email {
      font-size: 0.84rem;
      color: #6b7280;
    }

    .role-chip {
      display: inline-flex;
      padding: 0.25rem 0.6rem;
      border-radius: 999px;
      background: #eef2ff;
      color: #4338ca;
      font-size: 0.78rem;
      font-weight: 700;
    }

    .empty-state {
      padding: 3rem 2rem;
      text-align: center;
    }

    .empty-icon {
      width: 72px;
      height: 72px;
      border-radius: 18px;
      background: #eff6ff;
      color: #60a5fa;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      margin: 0 auto 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem;
      color: #111827;
    }

    .empty-state p {
      margin: 0 0 1.25rem;
      color: #6b7280;
    }

    @media (max-width: 1200px) {
      .stats-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 900px) {
      .details-grid {
        grid-template-columns: 1fr;
      }

      .header-actions {
        align-items: stretch;
      }

      .period-controls {
        justify-content: stretch;
      }
    }

    @media (max-width: 640px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .period-controls,
      .export-actions {
        flex-direction: column;
      }

      .mode-switch,
      .quick-range {
        display: grid;
        grid-template-columns: 1fr;
      }

      ::ng-deep .period-calendar .p-inputtext {
        min-width: 100%;
        width: 100%;
      }
    }
  `]
})
export class StatisticsComponent implements OnInit {
  private readonly statisticsFacade = inject(StatisticsFacade);
  private readonly subordinatesFacade = inject(SubordinatesFacade);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  currentStats: Statistics | null = null;
  groupStatistics: SubordinateStatistics[] = [];
  groupSummary: GroupSummary = this.createEmptyGroupSummary();

  dateRange: Date[] = [];
  activePeriod: 'month' | 'week' | 'custom' = 'month';
  statsMode: StatisticsMode = 'personal';
  canViewGroupStats = false;

  isLoading = false;
  exporting = false;
  exportFormat: ExportFormat = 'pdf';

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe({
      next: user => {
        this.canViewGroupStats = [Role.FD, Role.LEADER, Role.PASTEUR, Role.ADMIN].includes(user.role);
        this.loadCurrentMonth();
      },
      error: () => this.loadCurrentMonth()
    });
  }

  setMode(mode: StatisticsMode): void {
    if (mode === 'group' && !this.canViewGroupStats) {
      return;
    }

    if (this.statsMode === mode) {
      return;
    }

    this.statsMode = mode;
    this.reloadCurrentMode();
  }

  loadCurrentMonth(): void {
    this.activePeriod = 'month';
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.dateRange = [startDate, endDate];
    this.loadCurrentMode(startDate, endDate);
  }

  loadCurrentWeek(): void {
    this.activePeriod = 'week';
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    this.dateRange = [startDate, endDate];
    this.loadCurrentMode(startDate, endDate);
  }

  onPeriodChange(): void {
    this.activePeriod = 'custom';
    if (this.dateRange.length === 2) {
      this.loadCurrentMode(this.dateRange[0], this.dateRange[1]);
    }
  }

  hasDataToExport(): boolean {
    return this.statsMode === 'personal'
      ? this.currentStats !== null
      : this.groupStatistics.length > 0;
  }

  downloadFile(format: ExportFormat): void {
    if (this.dateRange.length < 2) {
      return;
    }

    this.exporting = true;
    this.exportFormat = format;

    const [startDate, endDate] = this.dateRange;
    const export$ = this.statsMode === 'group'
      ? this.statisticsFacade.exportGroupStatistics(startDate, endDate, format)
      : this.statisticsFacade.exportPersonalStatistics(startDate, endDate, format);

    export$.subscribe({
      next: blob => {
        const extension = format === 'pdf' ? 'pdf' : 'xlsx';
        const filename = this.buildExportFilename(startDate, endDate, extension);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);

        this.exporting = false;
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('STATISTICS.EXPORT_SUCCESS'),
          detail: this.translate.instant('STATISTICS.EXPORT_SUCCESS_DETAIL', { ext: extension.toUpperCase() }),
          life: 3000
        });
      },
      error: () => {
        this.exporting = false;
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('COMMON.ERROR'),
          detail: this.translate.instant('STATISTICS.EXPORT_ERROR'),
          life: 5000
        });
      }
    });
  }

  getTitleKey(): string {
    return this.statsMode === 'group' ? 'STATISTICS.GROUP_TITLE' : 'STATISTICS.TITLE';
  }

  getSubtitleKey(): string {
    return this.statsMode === 'group' ? 'STATISTICS.GROUP_SUBTITLE' : 'STATISTICS.SUBTITLE';
  }

  getPdfTooltipKey(): string {
    return this.statsMode === 'group' ? 'STATISTICS.DOWNLOAD_GROUP_PDF' : 'STATISTICS.DOWNLOAD_PDF';
  }

  getExcelTooltipKey(): string {
    return this.statsMode === 'group' ? 'STATISTICS.DOWNLOAD_GROUP_EXCEL' : 'STATISTICS.DOWNLOAD_EXCEL';
  }

  getEmptyMessageKey(): string {
    return this.statsMode === 'group' ? 'STATISTICS.NO_GROUP_DATA_MESSAGE' : 'STATISTICS.NO_DATA_MESSAGE';
  }

  getTotalPrayerDisplay(): string {
    if (!this.currentStats) {
      return '0min';
    }
    return formatMinutesToReadable(getTotalPrayerMinutes(this.currentStats));
  }

  formatMinutes(minutes: number): string {
    return formatMinutesToReadable(minutes);
  }

  getAlertLabel(level: string): string {
    switch (level) {
      case 'CRITICAL':
        return this.translate.instant('STATISTICS.ALERT_CRITICAL');
      case 'WARNING':
        return this.translate.instant('STATISTICS.ALERT_WARNING');
      default:
        return this.translate.instant('STATISTICS.ALERT_NONE');
    }
  }

  getAlertSeverity(level: string): AlertSeverity {
    switch (level) {
      case 'CRITICAL':
        return 'danger';
      case 'WARNING':
        return 'warn';
      default:
        return 'success';
    }
  }

  private reloadCurrentMode(): void {
    if (this.dateRange.length === 2) {
      this.loadCurrentMode(this.dateRange[0], this.dateRange[1]);
    } else {
      this.loadCurrentMonth();
    }
  }

  private loadCurrentMode(startDate: Date, endDate: Date): void {
    this.isLoading = true;

    if (this.statsMode === 'group') {
      this.currentStats = null;
      this.subordinatesFacade.getSubordinatesStatistics(startDate, endDate).subscribe({
        next: stats => {
          this.groupStatistics = stats;
          this.groupSummary = this.buildGroupSummary(stats);
          this.isLoading = false;
        },
        error: () => {
          this.groupStatistics = [];
          this.groupSummary = this.createEmptyGroupSummary();
          this.isLoading = false;
        }
      });
      return;
    }

    this.groupStatistics = [];
    this.groupSummary = this.createEmptyGroupSummary();
    this.statisticsFacade.loadPersonalStatistics(startDate, endDate).subscribe({
      next: stats => {
        this.currentStats = stats;
        this.isLoading = false;
      },
      error: () => {
        this.currentStats = null;
        this.isLoading = false;
      }
    });
  }

  private buildGroupSummary(stats: SubordinateStatistics[]): GroupSummary {
    if (!stats.length) {
      return this.createEmptyGroupSummary();
    }

    const summary = stats.reduce<GroupSummary>((summary, stat) => {
      summary.memberCount += 1;
      summary.totalReports += stat.nombreTotalCRs;
      summary.averageRegularity += stat.tauxRegularite;
      summary.averageRdqd += stat.tauxRDQD;
      summary.totalPrayerMinutes += this.parseDurationToMinutes(stat.dureeTotalePriere);
      summary.totalChaptersRead += stat.totalChapitresLus;
      summary.totalEvangelized += stat.totalPersonnesEvangelisees;
      summary.totalConfessions += stat.nombreConfessions;
      summary.totalFasts += stat.nombreJeunes;

      if (stat.alertLevel === 'CRITICAL') {
        summary.criticalCount += 1;
      } else if (stat.alertLevel === 'WARNING') {
        summary.warningCount += 1;
      }

      summary.alertCount = summary.criticalCount + summary.warningCount;
      return summary;
    }, this.createEmptyGroupSummary());

    summary.averageRegularity = summary.averageRegularity / stats.length;
    summary.averageRdqd = summary.averageRdqd / stats.length;
    return summary;
  }

  private createEmptyGroupSummary(): GroupSummary {
    return {
      memberCount: 0,
      totalReports: 0,
      averageRegularity: 0,
      averageRdqd: 0,
      totalPrayerMinutes: 0,
      totalChaptersRead: 0,
      totalEvangelized: 0,
      totalConfessions: 0,
      totalFasts: 0,
      warningCount: 0,
      criticalCount: 0,
      alertCount: 0
    };
  }

  private parseDurationToMinutes(duration: string): number {
    const hoursMatch = duration.match(/(\d+)\s*h/);
    const minutesMatch = duration.match(/(\d+)\s*min/);
    const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;
    return (hours * 60) + minutes;
  }

  private buildExportFilename(startDate: Date, endDate: Date, extension: string): string {
    const start = this.formatDateForFilename(startDate);
    const end = this.formatDateForFilename(endDate);
    const prefix = this.statsMode === 'group' ? 'statistiques_groupe' : 'statistiques_personnelles';
    return `${prefix}_${start}_${end}.${extension}`;
  }

  private formatDateForFilename(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
