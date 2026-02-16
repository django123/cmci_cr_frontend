import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CalendarModule } from 'primeng/calendar';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { StatisticsFacade } from '../../../application/use-cases';
import { Statistics, formatMinutesToReadable, getTotalPrayerMinutes } from '../../../domain/models';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule,
    ButtonModule,
    ProgressBarModule,
    SkeletonModule,
    TooltipModule,
    RippleModule,
    ToastModule,
    TranslateModule
  ],
  providers: [MessageService],
  template: `
    <p-toast></p-toast>
    <div class="statistics-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-left">
          <div class="header-title">
            <div class="title-icon">
              <i class="pi pi-chart-bar"></i>
            </div>
            <div>
              <h1>{{ 'STATISTICS.TITLE' | translate }}</h1>
              <p>{{ 'STATISTICS.SUBTITLE' | translate }}</p>
            </div>
          </div>
        </div>
        <div class="header-right">
          <div class="period-selector">
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
            <div class="period-buttons">
              <button
                type="button"
                class="period-btn"
                [class.active]="activePeriod === 'month'"
                (click)="loadCurrentMonth()">
                <i class="pi pi-calendar"></i>
                {{ 'STATISTICS.THIS_MONTH' | translate }}
              </button>
              <button
                type="button"
                class="period-btn"
                [class.active]="activePeriod === 'week'"
                (click)="loadCurrentWeek()">
                <i class="pi pi-calendar-minus"></i>
                {{ 'STATISTICS.THIS_WEEK' | translate }}
              </button>
            </div>
          </div>
          <div class="export-buttons">
            <button
              class="btn-export btn-pdf"
              (click)="downloadFile('pdf')"
              [disabled]="!currentStats || exporting"
              [pTooltip]="'STATISTICS.DOWNLOAD_PDF' | translate"
              tooltipPosition="bottom"
              pRipple>
              @if (exporting && exportFormat === 'pdf') {
                <i class="pi pi-spin pi-spinner"></i>
              } @else {
                <i class="pi pi-file-pdf"></i>
              }
              <span>PDF</span>
            </button>
            <button
              class="btn-export btn-excel"
              (click)="downloadFile('excel')"
              [disabled]="!currentStats || exporting"
              [pTooltip]="'STATISTICS.DOWNLOAD_EXCEL' | translate"
              tooltipPosition="bottom"
              pRipple>
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

      @if (loading$ | async) {
        <!-- Loading Skeletons -->
        <div class="stats-grid">
          @for (i of [1,2,3,4]; track i) {
            <div class="stat-card-skeleton">
              <p-skeleton width="48px" height="48px" borderRadius="12px"></p-skeleton>
              <div class="skeleton-info">
                <p-skeleton width="80px" height="2rem"></p-skeleton>
                <p-skeleton width="120px" height="0.875rem"></p-skeleton>
              </div>
            </div>
          }
        </div>
        <div class="charts-grid">
          <div class="section-skeleton">
            <p-skeleton height="250px" borderRadius="16px"></p-skeleton>
          </div>
          <div class="section-skeleton">
            <p-skeleton height="250px" borderRadius="16px"></p-skeleton>
          </div>
        </div>
      } @else if (currentStats) {
        <!-- Stats Overview Cards -->
        <div class="stats-grid">
          <div class="stat-card primary">
            <div class="stat-icon">
              <i class="pi pi-file-edit"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ currentStats.totalCRSoumis }}</span>
              <span class="stat-label">{{ 'STATISTICS.CR_SUBMITTED' | translate }}</span>
            </div>
            @if (currentStats.totalCRValides > 0) {
              <div class="stat-badge success">
                <i class="pi pi-check"></i> {{ currentStats.totalCRValides }} {{ 'STATISTICS.CR_VALIDATED_COUNT' | translate }}
              </div>
            }
          </div>

          <div class="stat-card success">
            <div class="stat-icon">
              <i class="pi pi-check-circle"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ currentStats.tauxCompletion | number:'1.0-1' }}%</span>
              <span class="stat-label">{{ 'STATISTICS.COMPLETION_RATE' | translate }}</span>
            </div>
            <div class="stat-progress">
              <div class="progress-bar">
                <div class="progress-fill success-fill"
                     [style.width.%]="currentStats.tauxCompletion"></div>
              </div>
            </div>
          </div>

          <div class="stat-card info">
            <div class="stat-icon">
              <i class="pi pi-sun"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ currentStats.moyenneRDQD | number:'1.0-1' }}%</span>
              <span class="stat-label">{{ 'STATISTICS.RDQD_AVERAGE' | translate }}</span>
            </div>
            <div class="stat-sub">
              {{ currentStats.totalRDQDAccomplis }}/{{ currentStats.totalRDQDAttendus }} {{ 'STATISTICS.RDQD_COMPLETED' | translate }}
            </div>
          </div>

          <div class="stat-card warning">
            <div class="stat-icon">
              <i class="pi pi-users"></i>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ currentStats.totalEvangelisations }}</span>
              <span class="stat-label">{{ 'STATISTICS.EVANGELIZATIONS' | translate }}</span>
            </div>
            <div class="stat-sub">
              {{ currentStats.totalContactsUtiles }} {{ 'STATISTICS.USEFUL_CONTACTS' | translate }}
            </div>
          </div>
        </div>

        <!-- Detail Sections -->
        <div class="charts-grid">
          <!-- Prayer Section -->
          <div class="detail-section">
            <div class="section-header">
              <div class="section-title">
                <i class="pi pi-heart"></i>
                <span>{{ 'STATISTICS.PRAYER_TIME' | translate }}</span>
              </div>
            </div>
            <div class="section-body">
              <div class="prayer-total-card">
                <span class="prayer-total-value">{{ getTotalPrayerDisplay() }}</span>
                <span class="prayer-total-label">{{ 'STATISTICS.TOTAL_PRAYER_TIME' | translate }}</span>
              </div>
              <div class="prayer-breakdown">
                <div class="prayer-row">
                  <div class="prayer-row-header">
                    <span class="prayer-dot solo"></span>
                    <span class="prayer-name">{{ 'STATISTICS.SOLO_PRAYER' | translate }}</span>
                    <span class="prayer-time">{{ formatMinutes(currentStats.totalPriereSeuleMinutes) }}</span>
                  </div>
                  <div class="prayer-bar-track">
                    <div class="prayer-bar-fill solo" [style.width.%]="getPrayerPercentageDisplay('solo')"></div>
                  </div>
                </div>
                <div class="prayer-row">
                  <div class="prayer-row-header">
                    <span class="prayer-dot couple"></span>
                    <span class="prayer-name">{{ 'STATISTICS.COUPLE_PRAYER' | translate }}</span>
                    <span class="prayer-time">{{ formatMinutes(currentStats.totalPriereCoupleMinutes) }}</span>
                  </div>
                  <div class="prayer-bar-track">
                    <div class="prayer-bar-fill couple" [style.width.%]="getPrayerPercentageDisplay('couple')"></div>
                  </div>
                </div>
                <div class="prayer-row">
                  <div class="prayer-row-header">
                    <span class="prayer-dot family"></span>
                    <span class="prayer-name">{{ 'STATISTICS.FAMILY_PRAYER' | translate }}</span>
                    <span class="prayer-time">{{ formatMinutes(currentStats.totalPriereAvecEnfantsMinutes) }}</span>
                  </div>
                  <div class="prayer-bar-track">
                    <div class="prayer-bar-fill family" [style.width.%]="getPrayerPercentageDisplay('family')"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Study & Activities Section -->
          <div class="detail-section">
            <div class="section-header">
              <div class="section-title">
                <i class="pi pi-book"></i>
                <span>{{ 'STATISTICS.STUDY_ACTIVITIES' | translate }}</span>
              </div>
            </div>
            <div class="section-body">
              <div class="activity-grid">
                <div class="activity-card">
                  <div class="activity-icon study">
                    <i class="pi pi-book"></i>
                  </div>
                  <span class="activity-value">{{ formatMinutes(currentStats.totalTempsEtudeParoleMinutes) }}</span>
                  <span class="activity-label">{{ 'STATISTICS.STUDY_TIME' | translate }}</span>
                </div>
                <div class="activity-card">
                  <div class="activity-icon contacts">
                    <i class="pi pi-phone"></i>
                  </div>
                  <span class="activity-value">{{ currentStats.totalContactsUtiles }}</span>
                  <span class="activity-label">{{ 'STATISTICS.USEFUL_CONTACTS_LABEL' | translate }}</span>
                </div>
                <div class="activity-card">
                  <div class="activity-icon invitations">
                    <i class="pi pi-building"></i>
                  </div>
                  <span class="activity-value">{{ currentStats.totalInvitationsCulte }}</span>
                  <span class="activity-label">{{ 'STATISTICS.WORSHIP_INVITATIONS' | translate }}</span>
                </div>
                <div class="activity-card">
                  <div class="activity-icon evangelism">
                    <i class="pi pi-megaphone"></i>
                  </div>
                  <span class="activity-value">{{ currentStats.totalEvangelisations }}</span>
                  <span class="activity-label">{{ 'STATISTICS.EVANGELIZATIONS_LABEL' | translate }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Offerings Section -->
        <div class="detail-section offerings-section">
          <div class="section-header">
            <div class="section-title">
              <i class="pi pi-wallet"></i>
              <span>{{ 'STATISTICS.OFFERINGS' | translate }}</span>
            </div>
          </div>
          <div class="section-body">
            <div class="offerings-display">
              <div class="offerings-amount">
                <span class="currency">XAF</span>
                <span class="amount">{{ (currentStats.totalOffrandes) | number:'1.0-0' }}</span>
              </div>
              <p class="offerings-label">{{ 'STATISTICS.TOTAL_OFFERINGS' | translate }}</p>
            </div>
          </div>
        </div>

      } @else {
        <!-- Empty State -->
        <div class="empty-state">
          <div class="empty-icon">
            <i class="pi pi-chart-bar"></i>
          </div>
          <h3>{{ 'STATISTICS.NO_DATA_TITLE' | translate }}</h3>
          <p>{{ 'STATISTICS.NO_DATA_MESSAGE' | translate }}</p>
          <button class="btn-action" (click)="loadCurrentMonth()" pRipple>
            <i class="pi pi-calendar"></i>
            {{ 'STATISTICS.LOAD_CURRENT_MONTH' | translate }}
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .statistics-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    /* ===== Page Header ===== */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1.25rem;
    }

    .header-left {
      display: flex;
      align-items: center;
    }

    .header-title {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .title-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.25rem;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
    }

    .header-title h1 {
      margin: 0 0 0.125rem;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
    }

    .header-title p {
      margin: 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .period-selector {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    ::ng-deep .period-calendar {
      .p-inputtext {
        border-radius: 10px;
        border: 1px solid #e5e7eb;
        padding: 0.625rem 1rem;
        font-size: 0.875rem;
        min-width: 200px;
        height: 44px;
        transition: all 0.2s;

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
      height: 36px;

      i { font-size: 0.875rem; }

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

    /* ===== Export Buttons ===== */
    .export-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn-export {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0 1.25rem;
      height: 44px;
      border: none;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;

      i { font-size: 1rem; }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none !important;
        box-shadow: none !important;
      }
    }

    .btn-pdf {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);

      &:hover:not(:disabled) {
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
        transform: translateY(-1px);
      }
    }

    .btn-excel {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: white;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);

      &:hover:not(:disabled) {
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
        transform: translateY(-1px);
      }
    }

    /* ===== Stats Grid ===== */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
      position: relative;
      overflow: hidden;
      transition: all 0.2s ease;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
      }

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
      }

      &.primary::before { background: linear-gradient(180deg, #6366f1, #8b5cf6); }
      &.success::before { background: linear-gradient(180deg, #22c55e, #16a34a); }
      &.info::before { background: linear-gradient(180deg, #3b82f6, #2563eb); }
      &.warning::before { background: linear-gradient(180deg, #f59e0b, #d97706); }
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;

      .primary & { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
      .success & { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
      .info & { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
      .warning & { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
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
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;

      i { font-size: 0.625rem; }

      &.success {
        background: rgba(34, 197, 94, 0.1);
        color: #16a34a;
      }
    }

    .stat-sub {
      font-size: 0.8rem;
      color: #9ca3af;
    }

    .stat-progress {
      margin-top: auto;
    }

    .progress-bar {
      height: 6px;
      background: #e5e7eb;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: 3px;
      transition: width 0.6s ease;

      &.success-fill {
        background: linear-gradient(90deg, #22c55e, #16a34a);
      }
    }

    /* ===== Skeleton Loading ===== */
    .stat-card-skeleton {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      border: 1px solid #e5e7eb;
    }

    .skeleton-info {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    /* ===== Charts Grid ===== */
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    /* ===== Detail Sections ===== */
    .detail-section {
      background: white;
      border-radius: 16px;
      border: 1px solid #e5e7eb;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .section-header {
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-bottom: 1px solid #e5e7eb;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      font-weight: 600;
      font-size: 0.95rem;
      color: #374151;

      i {
        color: #6366f1;
        font-size: 1.1rem;
      }
    }

    .section-body {
      padding: 1.5rem;
    }

    /* ===== Prayer Section ===== */
    .prayer-total-card {
      text-align: center;
      padding: 1.25rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%);
      border-radius: 12px;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(99, 102, 241, 0.12);
    }

    .prayer-total-value {
      display: block;
      font-size: 2.25rem;
      font-weight: 700;
      color: #6366f1;
      line-height: 1.2;
    }

    .prayer-total-label {
      font-size: 0.85rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .prayer-breakdown {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .prayer-row {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .prayer-row-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .prayer-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;

      &.solo { background: #6366f1; }
      &.couple { background: #8b5cf6; }
      &.family { background: #a855f7; }
    }

    .prayer-name {
      font-size: 0.875rem;
      color: #374151;
      flex: 1;
    }

    .prayer-time {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1f2937;
    }

    .prayer-bar-track {
      height: 8px;
      background: #f3f4f6;
      border-radius: 4px;
      overflow: hidden;
    }

    .prayer-bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.6s ease;
      min-width: 2px;

      &.solo { background: linear-gradient(90deg, #6366f1, #818cf8); }
      &.couple { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
      &.family { background: linear-gradient(90deg, #a855f7, #c084fc); }
    }

    /* ===== Activity Section ===== */
    .activity-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .activity-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 1.25rem 1rem;
      background: #f9fafb;
      border-radius: 12px;
      border: 1px solid #f3f4f6;
      transition: all 0.2s;

      &:hover {
        background: #f3f4f6;
        border-color: #e5e7eb;
      }
    }

    .activity-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.75rem;
      font-size: 1.125rem;

      &.study { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
      &.contacts { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
      &.invitations { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
      &.evangelism { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
    }

    .activity-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
      line-height: 1;
    }

    .activity-label {
      font-size: 0.8rem;
      color: #6b7280;
      margin-top: 0.375rem;
    }

    /* ===== Offerings Section ===== */
    .offerings-section {
      margin-bottom: 1.5rem;
    }

    .offerings-display {
      text-align: center;
      padding: 1.5rem;
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
      font-weight: 500;
    }

    .amount {
      font-size: 3rem;
      font-weight: 700;
      color: #1f2937;
      line-height: 1;
    }

    .offerings-label {
      margin: 0.75rem 0 0;
      color: #6b7280;
      font-size: 0.875rem;
    }

    /* ===== Empty State ===== */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 16px;
      border: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .empty-icon {
      width: 80px;
      height: 80px;
      border-radius: 20px;
      background: rgba(99, 102, 241, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;

      i {
        font-size: 2.5rem;
        color: #c7d2fe;
      }
    }

    .empty-state h3 {
      margin: 0 0 0.5rem;
      color: #374151;
      font-size: 1.125rem;
    }

    .empty-state p {
      margin: 0 0 1.5rem;
      color: #6b7280;
    }

    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
      transition: all 0.2s ease;

      &:hover {
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
        transform: translateY(-1px);
      }
    }

    /* ===== Responsive ===== */
    @media (max-width: 1200px) {
      .header-right {
        flex-wrap: wrap;
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
      .page-header {
        flex-direction: column;
        align-items: stretch;
      }

      .header-right {
        flex-direction: column;
        align-items: stretch;
      }

      .period-selector {
        flex-direction: column;
        align-items: stretch;
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

      .export-buttons {
        justify-content: center;
      }

      .activity-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 640px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .activity-grid {
        grid-template-columns: 1fr;
      }

      .period-buttons {
        flex-direction: column;
      }

      .period-btn {
        justify-content: center;
      }

      .export-buttons {
        flex-direction: column;
      }

      .btn-export {
        justify-content: center;
      }
    }
  `]
})
export class StatisticsComponent implements OnInit {
  private readonly facade = inject(StatisticsFacade);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  statistics$ = this.facade.statistics$;
  loading$ = this.facade.loading$;
  currentStats: Statistics | null = null;

  dateRange: Date[] = [];
  activePeriod: 'month' | 'week' | 'custom' = 'month';
  exporting = false;
  exportFormat: 'pdf' | 'excel' = 'pdf';

  ngOnInit(): void {
    this.statistics$.subscribe(stats => {
      this.currentStats = stats;
      this.cdr.detectChanges();
    });
    this.loadCurrentMonth();
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

  downloadFile(format: 'pdf' | 'excel'): void {
    if (!this.dateRange || this.dateRange.length < 2) return;

    this.exporting = true;
    this.exportFormat = format;
    const [startDate, endDate] = this.dateRange;

    this.facade.exportPersonalStatistics(startDate, endDate, format).subscribe({
      next: (blob: Blob) => {
        const extension = format === 'pdf' ? 'pdf' : 'xlsx';
        const start = this.formatDateForFilename(startDate);
        const end = this.formatDateForFilename(endDate);
        const filename = `statistiques_personnelles_${start}_${end}.${extension}`;

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
          detail: this.translate.instant('STATISTICS.EXPORT_SUCCESS_DETAIL', {ext: extension.toUpperCase()}),
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

  getTotalPrayerDisplay(): string {
    if (!this.currentStats) return '0min';
    const totalMinutes = getTotalPrayerMinutes(this.currentStats);
    return formatMinutesToReadable(totalMinutes);
  }

  formatMinutes(minutes: number): string {
    return formatMinutesToReadable(minutes);
  }

  getPrayerPercentageDisplay(type: 'solo' | 'couple' | 'family'): number {
    if (!this.currentStats) return 0;
    const total = getTotalPrayerMinutes(this.currentStats);
    if (total === 0) return 0;

    switch (type) {
      case 'solo':
        return (this.currentStats.totalPriereSeuleMinutes / total) * 100;
      case 'couple':
        return (this.currentStats.totalPriereCoupleMinutes / total) * 100;
      case 'family':
        return (this.currentStats.totalPriereAvecEnfantsMinutes / total) * 100;
    }
  }

  private formatDateForFilename(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
