import { Component, OnInit, AfterViewInit, inject, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { SkeletonModule } from 'primeng/skeleton';

import { StatisticsFacade } from '../../../application/use-cases';
import { Statistics, formatMinutesToReadable, getTotalPrayerMinutes } from '../../../domain/models';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ChartModule,
    CalendarModule,
    ButtonModule,
    ProgressBarModule,
    SkeletonModule
  ],
  template: `
    <div class="statistics-container">
      <div class="page-header">
        <div class="header-content">
          <h1>Mes Statistiques</h1>
          <p>Suivez votre progression spirituelle</p>
        </div>
        <div class="period-selector">
          <p-calendar
            [(ngModel)]="dateRange"
            selectionMode="range"
            [readonlyInput]="true"
            placeholder="Sélectionner une période"
            dateFormat="dd/mm/yy"
            [showIcon]="true"
            (onSelect)="onPeriodChange()"
            styleClass="period-calendar">
          </p-calendar>
          <div class="period-buttons">
            <button
              type="button"
              class="period-btn"
              [class.active]="activePeriod === 'month'"
              (click)="loadCurrentMonth()">
              <i class="pi pi-calendar"></i>
              Ce mois
            </button>
            <button
              type="button"
              class="period-btn"
              [class.active]="activePeriod === 'week'"
              (click)="loadCurrentWeek()">
              <i class="pi pi-calendar-minus"></i>
              Cette semaine
            </button>
          </div>
        </div>
      </div>

      @if (loading$ | async) {
        <div class="stats-grid">
          @for (i of [1,2,3,4]; track i) {
            <p-skeleton height="150px"></p-skeleton>
          }
        </div>
      } @else if (currentStats) {
        <!-- Stats Overview -->
        <div class="stats-grid">
          <div class="stat-card primary">
            <div class="stat-icon">
              <i class="pi pi-file-edit"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ currentStats.totalCRSoumis }}</span>
              <span class="stat-label">CR Soumis</span>
            </div>
            <div class="stat-badge">
              {{ currentStats.totalCRValides }} validés
            </div>
          </div>

          <div class="stat-card success">
            <div class="stat-icon">
              <i class="pi pi-check-circle"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ currentStats.tauxCompletion | number:'1.0-1' }}%</span>
              <span class="stat-label">Taux de complétion</span>
            </div>
          </div>

          <div class="stat-card info">
            <div class="stat-icon">
              <i class="pi pi-sun"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ currentStats.moyenneRDQD | number:'1.0-1' }}%</span>
              <span class="stat-label">Moyenne RDQD</span>
            </div>
            <div class="stat-sub">
              {{ currentStats.totalRDQDAccomplis }}/{{ currentStats.totalRDQDAttendus }}
            </div>
          </div>

          <div class="stat-card warning">
            <div class="stat-icon">
              <i class="pi pi-users"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ currentStats.totalEvangelisations }}</span>
              <span class="stat-label">Évangélisations</span>
            </div>
          </div>
        </div>

        <!-- Charts -->
        <div class="charts-grid">
          <p-card header="Temps de prière" styleClass="chart-card">
            <div class="prayer-stats">
              <div class="prayer-total">
                <span class="total-value">{{ getTotalPrayerDisplay() }}</span>
                <span class="total-label">Temps total de prière</span>
              </div>
              <div class="prayer-breakdown">
                <div class="prayer-item">
                  <div class="prayer-bar">
                    <div class="bar-fill solo" [style.width.%]="getPrayerPercentageDisplay('solo')"></div>
                  </div>
                  <div class="prayer-info">
                    <span class="prayer-label">Prière seul(e)</span>
                    <span class="prayer-value">{{ formatMinutes(currentStats?.totalPriereSeuleMinutes ?? 0) }}</span>
                  </div>
                </div>
                <div class="prayer-item">
                  <div class="prayer-bar">
                    <div class="bar-fill couple" [style.width.%]="getPrayerPercentageDisplay('couple')"></div>
                  </div>
                  <div class="prayer-info">
                    <span class="prayer-label">Prière en couple</span>
                    <span class="prayer-value">{{ formatMinutes(currentStats?.totalPriereCoupleMinutes ?? 0) }}</span>
                  </div>
                </div>
                <div class="prayer-item">
                  <div class="prayer-bar">
                    <div class="bar-fill family" [style.width.%]="getPrayerPercentageDisplay('family')"></div>
                  </div>
                  <div class="prayer-info">
                    <span class="prayer-label">Avec enfants</span>
                    <span class="prayer-value">{{ formatMinutes(currentStats?.totalPriereAvecEnfantsMinutes ?? 0) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </p-card>

          <p-card header="Étude de la Parole" styleClass="chart-card">
            <div class="study-stats">
              <div class="study-item">
                <i class="pi pi-book"></i>
                <div class="study-info">
                  <span class="study-value">{{ formatMinutes(currentStats?.totalTempsEtudeParoleMinutes ?? 0) }}</span>
                  <span class="study-label">Temps d'étude</span>
                </div>
              </div>
              <div class="study-item">
                <i class="pi pi-users"></i>
                <div class="study-info">
                  <span class="study-value">{{ currentStats?.totalContactsUtiles ?? 0 }}</span>
                  <span class="study-label">Contacts utiles</span>
                </div>
              </div>
              <div class="study-item">
                <i class="pi pi-building"></i>
                <div class="study-info">
                  <span class="study-value">{{ currentStats?.totalInvitationsCulte ?? 0 }}</span>
                  <span class="study-label">Invitations au culte</span>
                </div>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Offrandes -->
        <p-card header="Offrandes" styleClass="offerings-card">
          <div class="offerings-display">
            <div class="offerings-amount">
              <span class="currency">XAF</span>
              <span class="amount">{{ (currentStats?.totalOffrandes ?? 0) | number:'1.0-0' }}</span>
            </div>
            <p class="offerings-label">Total des offrandes sur la période</p>
          </div>
        </p-card>
      } @else {
        <div class="no-data">
          <i class="pi pi-chart-bar"></i>
          <h3>Aucune donnée disponible</h3>
          <p>Sélectionnez une période pour voir vos statistiques</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .statistics-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
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
    }

    .period-selector {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    ::ng-deep .period-calendar {
      .p-inputtext {
        border-radius: 10px;
        border: 1px solid #e5e7eb;
        padding: 0.625rem 1rem;
        font-size: 0.875rem;
        min-width: 200px;

        &:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
      }

      .p-datepicker-trigger {
        background: transparent;
        border: none;
        color: #6b7280;

        &:hover {
          background: #f3f4f6;
          color: #6366f1;
        }
      }
    }

    .period-buttons {
      display: flex;
      background: #f3f4f6;
      border-radius: 10px;
      padding: 4px;
      gap: 4px;
    }

    .period-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: #6b7280;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;

      i {
        font-size: 0.875rem;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.7);
        color: #374151;
      }

      &.active {
        background: white;
        color: #6366f1;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
      }

      &.primary::before { background: #6366f1; }
      &.success::before { background: #22c55e; }
      &.info::before { background: #3b82f6; }
      &.warning::before { background: #f59e0b; }
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;

      .primary & {
        background: rgba(99, 102, 241, 0.1);
        color: #6366f1;
      }

      .success & {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
      }

      .info & {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
      }

      .warning & {
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
      }
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .stat-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      padding: 0.25rem 0.75rem;
      background: rgba(34, 197, 94, 0.1);
      color: #16a34a;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .stat-sub {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    ::ng-deep .chart-card,
    ::ng-deep .offerings-card {
      .p-card-header {
        padding: 1rem 1.5rem;
        background: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
        font-weight: 600;
        color: #374151;
      }

      .p-card-body {
        padding: 1.5rem;
      }
    }

    .prayer-stats {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .prayer-total {
      text-align: center;
      padding: 1rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
      border-radius: 12px;
    }

    .total-value {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: #6366f1;
    }

    .total-label {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .prayer-breakdown {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .prayer-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .prayer-bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;

      &.solo { background: #6366f1; }
      &.couple { background: #8b5cf6; }
      &.family { background: #a855f7; }
    }

    .prayer-info {
      display: flex;
      justify-content: space-between;
    }

    .prayer-label {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .prayer-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1f2937;
    }

    .study-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .study-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 12px;

      i {
        font-size: 1.5rem;
        color: #6366f1;
        margin-bottom: 0.75rem;
      }
    }

    .study-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
    }

    .study-label {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .offerings-display {
      text-align: center;
      padding: 2rem;
    }

    .offerings-amount {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 0.5rem;
    }

    .currency {
      font-size: 1.25rem;
      color: #6b7280;
    }

    .amount {
      font-size: 3rem;
      font-weight: 700;
      color: #1f2937;
    }

    .offerings-label {
      margin: 0.5rem 0 0;
      color: #6b7280;
    }

    .no-data {
      text-align: center;
      padding: 4rem;
      background: white;
      border-radius: 16px;
      border: 1px solid #e5e7eb;

      i {
        font-size: 4rem;
        color: #d1d5db;
        margin-bottom: 1rem;
      }

      h3 {
        margin: 0 0 0.5rem;
        color: #374151;
      }

      p {
        margin: 0;
        color: #6b7280;
      }
    }

    @media (max-width: 1024px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .charts-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .period-selector {
        flex-direction: column;
        align-items: stretch;
        width: 100%;
      }

      ::ng-deep .period-calendar {
        width: 100%;

        .p-inputtext {
          width: 100%;
        }
      }

      .period-buttons {
        justify-content: center;
      }
    }

    @media (max-width: 640px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .study-stats {
        grid-template-columns: 1fr;
      }

      .period-buttons {
        flex-direction: column;
      }

      .period-btn {
        justify-content: center;
      }
    }
  `]
})
export class StatisticsComponent implements OnInit, AfterViewInit {
  private readonly facade = inject(StatisticsFacade);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly ngZone = inject(NgZone);

  statistics$ = this.facade.statistics$;
  loading$ = this.facade.loading$;
  currentStats: Statistics | null = null;

  dateRange: Date[] = [];
  activePeriod: 'month' | 'week' | 'custom' = 'month';
  isViewReady = false;

  ngOnInit(): void {
    this.statistics$.subscribe(stats => {
      this.currentStats = stats;
      // Force change detection and resize when data arrives
      this.cdr.detectChanges();
      window.dispatchEvent(new Event('resize'));
    });
    this.loadCurrentMonth();
  }

  ngAfterViewInit(): void {
    // Force a layout recalculation after view init
    this.isViewReady = true;
    this.cdr.detectChanges();
    // Dispatch resize to ensure any charts/tables are properly sized
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      this.cdr.detectChanges();
    }, 0);
  }

  loadCurrentMonth(): void {
    this.activePeriod = 'month';
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.dateRange = [startDate, endDate];
    this.facade.loadPersonalStatistics(startDate, endDate).subscribe();
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
    this.facade.loadPersonalStatistics(startDate, endDate).subscribe();
  }

  onPeriodChange(): void {
    this.activePeriod = 'custom';
    if (this.dateRange && this.dateRange.length === 2) {
      const [startDate, endDate] = this.dateRange;
      this.facade.loadPersonalStatistics(startDate, endDate).subscribe();
    }
  }

  getTotalPrayer(stats: Statistics): string {
    const totalMinutes = getTotalPrayerMinutes(stats);
    return formatMinutesToReadable(totalMinutes);
  }

  getTotalPrayerDisplay(): string {
    if (!this.currentStats) return '0min';
    return this.getTotalPrayer(this.currentStats);
  }

  formatMinutes(minutes: number): string {
    return formatMinutesToReadable(minutes);
  }

  getPrayerPercentage(stats: Statistics, type: 'solo' | 'couple' | 'family'): number {
    const total = getTotalPrayerMinutes(stats);
    if (total === 0) return 0;

    switch (type) {
      case 'solo':
        return (stats.totalPriereSeuleMinutes / total) * 100;
      case 'couple':
        return (stats.totalPriereCoupleMinutes / total) * 100;
      case 'family':
        return (stats.totalPriereAvecEnfantsMinutes / total) * 100;
    }
  }

  getPrayerPercentageDisplay(type: 'solo' | 'couple' | 'family'): number {
    if (!this.currentStats) return 0;
    return this.getPrayerPercentage(this.currentStats, type);
  }
}
