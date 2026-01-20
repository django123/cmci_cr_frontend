import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ProgressBarModule } from 'primeng/progressbar';
import { RippleModule } from 'primeng/ripple';
import { SkeletonModule } from 'primeng/skeleton';

interface Transcription {
  id: number;
  title: string;
  date: string;
  duration: string;
  status: 'completed' | 'processing' | 'pending';
  participants: string[];
  summary?: string;
}

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ChartModule,
    TableModule,
    TagModule,
    AvatarModule,
    AvatarGroupModule,
    ProgressBarModule,
    RippleModule,
    SkeletonModule
  ],
  template: `
    <div class="dashboard">
      <!-- Welcome Section -->
      <section class="welcome-section">
        <div class="welcome-content">
          <h1>Bonjour, Administrateur <span class="wave">👋</span></h1>
          <p>Voici un aperçu de vos activités récentes et statistiques.</p>
        </div>
        <div class="quick-actions">
          <button class="quick-action-btn primary" pRipple>
            <i class="pi pi-microphone"></i>
            <span>Démarrer une transcription</span>
          </button>
          <button class="quick-action-btn secondary" pRipple>
            <i class="pi pi-upload"></i>
            <span>Importer un fichier</span>
          </button>
        </div>
      </section>

      <!-- Stats Cards -->
      <section class="stats-section">
        @for (stat of statsCards; track stat.title) {
          <div class="stat-card" [style.--accent-color]="stat.color">
            <div class="stat-icon">
              <i class="pi" [ngClass]="stat.icon"></i>
            </div>
            <div class="stat-content">
              <span class="stat-value">{{ stat.value }}</span>
              <span class="stat-title">{{ stat.title }}</span>
            </div>
            <div class="stat-change" [class.increase]="stat.changeType === 'increase'" [class.decrease]="stat.changeType === 'decrease'">
              <i class="pi" [ngClass]="stat.changeType === 'increase' ? 'pi-arrow-up' : 'pi-arrow-down'"></i>
              {{ stat.change }}
            </div>
          </div>
        }
      </section>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Recent Transcriptions -->
        <section class="transcriptions-section">
          <div class="section-header">
            <h2>Transcriptions récentes</h2>
            <a href="/transcriptions" class="view-all-link">Voir tout <i class="pi pi-arrow-right"></i></a>
          </div>
          <div class="transcription-list">
            @for (transcription of recentTranscriptions; track transcription.id) {
              <div class="transcription-card" pRipple>
                <div class="transcription-header">
                  <div class="transcription-icon" [attr.data-status]="transcription.status">
                    <i class="pi pi-file-edit"></i>
                  </div>
                  <div class="transcription-info">
                    <h3>{{ transcription.title }}</h3>
                    <div class="transcription-meta">
                      <span><i class="pi pi-calendar"></i> {{ transcription.date }}</span>
                      <span><i class="pi pi-clock"></i> {{ transcription.duration }}</span>
                    </div>
                  </div>
                  <div class="transcription-status">
                    @switch (transcription.status) {
                      @case ('completed') {
                        <span class="status-badge completed">
                          <i class="pi pi-check-circle"></i> Terminé
                        </span>
                      }
                      @case ('processing') {
                        <span class="status-badge processing">
                          <i class="pi pi-spin pi-spinner"></i> En cours
                        </span>
                      }
                      @case ('pending') {
                        <span class="status-badge pending">
                          <i class="pi pi-clock"></i> En attente
                        </span>
                      }
                    }
                  </div>
                </div>
                @if (transcription.summary) {
                  <p class="transcription-summary">{{ transcription.summary }}</p>
                }
                <div class="transcription-footer">
                  <div class="participants">
                    <p-avatarGroup>
                      @for (participant of transcription.participants.slice(0, 3); track participant) {
                        <p-avatar
                          [label]="participant[0]"
                          shape="circle"
                          size="normal"
                          styleClass="participant-avatar">
                        </p-avatar>
                      }
                      @if (transcription.participants.length > 3) {
                        <p-avatar
                          [label]="'+' + (transcription.participants.length - 3)"
                          shape="circle"
                          size="normal"
                          styleClass="participant-avatar more">
                        </p-avatar>
                      }
                    </p-avatarGroup>
                    <span class="participant-count">{{ transcription.participants.length }} participants</span>
                  </div>
                  <div class="transcription-actions">
                    <button class="icon-action" title="Voir">
                      <i class="pi pi-eye"></i>
                    </button>
                    <button class="icon-action" title="Partager">
                      <i class="pi pi-share-alt"></i>
                    </button>
                    <button class="icon-action" title="Télécharger">
                      <i class="pi pi-download"></i>
                    </button>
                    <button class="icon-action" title="Plus">
                      <i class="pi pi-ellipsis-h"></i>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </section>

        <!-- Right Sidebar -->
        <aside class="dashboard-sidebar">
          <!-- Activity Chart -->
          <div class="sidebar-card chart-card">
            <h3>Activité hebdomadaire</h3>
            <p-chart type="line" [data]="activityChartData" [options]="chartOptions" height="200px"></p-chart>
          </div>

          <!-- Usage Progress -->
          <div class="sidebar-card usage-card">
            <h3>Utilisation du quota</h3>
            <div class="usage-item">
              <div class="usage-header">
                <span>Transcriptions</span>
                <span class="usage-value">45/100</span>
              </div>
              <p-progressBar [value]="45" [showValue]="false" styleClass="usage-progress"></p-progressBar>
            </div>
            <div class="usage-item">
              <div class="usage-header">
                <span>Minutes traitées</span>
                <span class="usage-value">850/1000</span>
              </div>
              <p-progressBar [value]="85" [showValue]="false" styleClass="usage-progress warning"></p-progressBar>
            </div>
            <div class="usage-item">
              <div class="usage-header">
                <span>Stockage</span>
                <span class="usage-value">2.3/5 GB</span>
              </div>
              <p-progressBar [value]="46" [showValue]="false" styleClass="usage-progress"></p-progressBar>
            </div>
            <a href="/billing" class="upgrade-link">
              <i class="pi pi-bolt"></i> Augmenter mon quota
            </a>
          </div>

          <!-- Quick Tips -->
          <div class="sidebar-card tips-card">
            <div class="tip-icon">
              <i class="pi pi-lightbulb"></i>
            </div>
            <h3>Astuce du jour</h3>
            <p>Utilisez les raccourcis clavier <kbd>Ctrl</kbd> + <kbd>M</kbd> pour démarrer rapidement une nouvelle transcription.</p>
          </div>

          <!-- Upcoming Meetings -->
          <div class="sidebar-card meetings-card">
            <h3>Prochaines réunions</h3>
            @for (meeting of upcomingMeetings; track meeting.id) {
              <div class="meeting-item">
                <div class="meeting-time">
                  <span class="time">{{ meeting.time }}</span>
                  <span class="date">{{ meeting.date }}</span>
                </div>
                <div class="meeting-info">
                  <span class="meeting-title">{{ meeting.title }}</span>
                  <span class="meeting-platform">
                    <i class="pi" [ngClass]="meeting.platformIcon"></i>
                    {{ meeting.platform }}
                  </span>
                </div>
              </div>
            }
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      max-width: 1600px;
      margin: 0 auto;
    }

    /* Welcome Section */
    .welcome-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 2rem;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
      border-radius: 20px;
      color: white;
    }

    .welcome-content h1 {
      margin: 0 0 0.5rem;
      font-size: 1.75rem;
      font-weight: 700;

      .wave {
        display: inline-block;
        animation: wave 2.5s infinite;
        transform-origin: 70% 70%;
      }
    }

    .welcome-content p {
      margin: 0;
      opacity: 0.9;
      font-size: 1rem;
    }

    .quick-actions {
      display: flex;
      gap: 1rem;
    }

    .quick-action-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.875rem 1.5rem;
      border-radius: 12px;
      border: none;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &.primary {
        background: white;
        color: #6366f1;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
      }

      &.secondary {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        backdrop-filter: blur(10px);

        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }
    }

    @keyframes wave {
      0%, 60%, 100% { transform: rotate(0deg); }
      10%, 30% { transform: rotate(14deg); }
      20% { transform: rotate(-8deg); }
      40% { transform: rotate(-4deg); }
      50% { transform: rotate(10deg); }
    }

    /* Stats Section */
    .stats-section {
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
      align-items: flex-start;
      gap: 1rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
      transition: all 0.2s;
      position: relative;
      overflow: hidden;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: var(--accent-color);
      }
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: color-mix(in srgb, var(--accent-color) 15%, transparent);
      color: var(--accent-color);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .stat-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1f2937;
      line-height: 1.2;
    }

    .stat-title {
      font-size: 0.875rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    .stat-change {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8rem;
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;

      &.increase {
        background: rgba(34, 197, 94, 0.1);
        color: #16a34a;
      }

      &.decrease {
        background: rgba(239, 68, 68, 0.1);
        color: #dc2626;
      }
    }

    /* Content Grid */
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 2rem;
    }

    /* Transcriptions Section */
    .transcriptions-section {
      background: white;
      border-radius: 20px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: #1f2937;
      }
    }

    .view-all-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #6366f1;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }

    .transcription-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .transcription-card {
      padding: 1.25rem;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      background: #fafafa;
      transition: all 0.2s;
      cursor: pointer;

      &:hover {
        background: white;
        border-color: #d1d5db;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
    }

    .transcription-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .transcription-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.125rem;

      &[data-status="completed"] {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
      }

      &[data-status="processing"] {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
      }

      &[data-status="pending"] {
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
      }
    }

    .transcription-info {
      flex: 1;

      h3 {
        margin: 0 0 0.375rem;
        font-size: 1rem;
        font-weight: 600;
        color: #1f2937;
      }
    }

    .transcription-meta {
      display: flex;
      gap: 1rem;
      font-size: 0.8rem;
      color: #6b7280;

      span {
        display: flex;
        align-items: center;
        gap: 0.375rem;
      }
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.375rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;

      &.completed {
        background: rgba(34, 197, 94, 0.1);
        color: #16a34a;
      }

      &.processing {
        background: rgba(59, 130, 246, 0.1);
        color: #2563eb;
      }

      &.pending {
        background: rgba(245, 158, 11, 0.1);
        color: #d97706;
      }
    }

    .transcription-summary {
      margin: 1rem 0;
      font-size: 0.875rem;
      color: #6b7280;
      line-height: 1.5;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .transcription-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .participants {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    ::ng-deep .participant-avatar {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
      border: 2px solid white !important;
      font-size: 0.75rem !important;

      &.more {
        background: #e5e7eb !important;
        color: #6b7280 !important;
      }
    }

    .participant-count {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .transcription-actions {
      display: flex;
      gap: 0.25rem;
    }

    .icon-action {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: transparent;
      color: #6b7280;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover {
        background: #f3f4f6;
        color: #374151;
      }
    }

    /* Dashboard Sidebar */
    .dashboard-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .sidebar-card {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;

      h3 {
        margin: 0 0 1rem;
        font-size: 1rem;
        font-weight: 600;
        color: #1f2937;
      }
    }

    .chart-card {
      ::ng-deep canvas {
        max-height: 200px;
      }
    }

    /* Usage Card */
    .usage-item {
      margin-bottom: 1rem;

      &:last-of-type {
        margin-bottom: 1.25rem;
      }
    }

    .usage-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;

      span:first-child {
        color: #6b7280;
      }
    }

    .usage-value {
      font-weight: 600;
      color: #1f2937;
    }

    ::ng-deep .usage-progress {
      height: 8px !important;
      border-radius: 4px !important;

      .p-progressbar-value {
        background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%) !important;
        border-radius: 4px !important;
      }

      &.warning .p-progressbar-value {
        background: linear-gradient(90deg, #f59e0b 0%, #f97316 100%) !important;
      }
    }

    .upgrade-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
      border-radius: 10px;
      color: #6366f1;
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s;

      &:hover {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
      }
    }

    /* Tips Card */
    .tips-card {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-color: #fcd34d;
      position: relative;
      overflow: hidden;

      .tip-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: rgba(245, 158, 11, 0.2);
        color: #b45309;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        margin-bottom: 0.75rem;
      }

      h3 {
        color: #92400e;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: #78350f;
        line-height: 1.5;
      }

      kbd {
        padding: 0.125rem 0.375rem;
        background: rgba(146, 64, 14, 0.15);
        border-radius: 4px;
        font-size: 0.75rem;
        font-family: inherit;
      }
    }

    /* Meetings Card */
    .meeting-item {
      display: flex;
      gap: 1rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #e5e7eb;

      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
    }

    .meeting-time {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 60px;

      .time {
        font-size: 0.9rem;
        font-weight: 600;
        color: #1f2937;
      }

      .date {
        font-size: 0.7rem;
        color: #9ca3af;
      }
    }

    .meeting-info {
      display: flex;
      flex-direction: column;
    }

    .meeting-title {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .meeting-platform {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.75rem;
      color: #6b7280;
      margin-top: 0.25rem;
    }

    /* Responsive */
    @media (max-width: 1200px) {
      .content-grid {
        grid-template-columns: 1fr;
      }

      .dashboard-sidebar {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .welcome-section {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.5rem;
      }

      .stats-section {
        grid-template-columns: repeat(2, 1fr);
      }

      .dashboard-sidebar {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  statsCards: StatCard[] = [
    {
      title: 'Total Transcriptions',
      value: '1,284',
      change: '+12.5%',
      changeType: 'increase',
      icon: 'pi-file-edit',
      color: '#6366f1'
    },
    {
      title: 'Heures traitées',
      value: '342h',
      change: '+8.2%',
      changeType: 'increase',
      icon: 'pi-clock',
      color: '#8b5cf6'
    },
    {
      title: 'Utilisateurs actifs',
      value: '48',
      change: '+3',
      changeType: 'increase',
      icon: 'pi-users',
      color: '#22c55e'
    },
    {
      title: 'Taux de précision',
      value: '98.5%',
      change: '-0.2%',
      changeType: 'decrease',
      icon: 'pi-check-circle',
      color: '#f59e0b'
    }
  ];

  recentTranscriptions: Transcription[] = [
    {
      id: 1,
      title: 'Réunion d\'équipe hebdomadaire',
      date: 'Aujourd\'hui, 14:30',
      duration: '45 min',
      status: 'completed',
      participants: ['Jean', 'Marie', 'Pierre', 'Sophie', 'Lucas'],
      summary: 'Discussion sur les objectifs du Q1, révision des KPIs et planification des sprints à venir.'
    },
    {
      id: 2,
      title: 'Appel client - Projet Alpha',
      date: 'Aujourd\'hui, 10:00',
      duration: '1h 15min',
      status: 'processing',
      participants: ['Client A', 'Thomas', 'Julie']
    },
    {
      id: 3,
      title: 'Formation nouveaux employés',
      date: 'Hier, 16:00',
      duration: '2h 30min',
      status: 'completed',
      participants: ['RH', 'Formateur', 'Employé 1', 'Employé 2', 'Employé 3', 'Employé 4'],
      summary: 'Introduction aux processus internes, présentation des outils et de la culture d\'entreprise.'
    },
    {
      id: 4,
      title: 'Brainstorming produit',
      date: 'Hier, 11:00',
      duration: '55 min',
      status: 'completed',
      participants: ['Design', 'Dev', 'Product']
    }
  ];

  upcomingMeetings = [
    {
      id: 1,
      title: 'Daily Standup',
      time: '09:00',
      date: 'Demain',
      platform: 'Google Meet',
      platformIcon: 'pi-google'
    },
    {
      id: 2,
      title: 'Review Sprint 23',
      time: '14:00',
      date: 'Ven 24',
      platform: 'Zoom',
      platformIcon: 'pi-video'
    },
    {
      id: 3,
      title: 'Client Call',
      time: '16:30',
      date: 'Ven 24',
      platform: 'Teams',
      platformIcon: 'pi-microsoft'
    }
  ];

  activityChartData: any;
  chartOptions: any;

  ngOnInit(): void {
    this.initChart();
  }

  initChart(): void {
    const documentStyle = getComputedStyle(document.documentElement);

    this.activityChartData = {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [
        {
          label: 'Transcriptions',
          data: [12, 19, 15, 22, 18, 8, 5],
          fill: true,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }
      ]
    };

    this.chartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#9ca3af'
          }
        },
        y: {
          grid: {
            color: '#f3f4f6'
          },
          ticks: {
            color: '#9ca3af'
          }
        }
      }
    };
  }
}
