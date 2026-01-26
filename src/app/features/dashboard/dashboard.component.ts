import { Component, OnInit, AfterViewInit, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { RippleModule } from 'primeng/ripple';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CompteRenduFacade } from '../../application/use-cases';
import { AuthService } from '../../infrastructure/auth';
import { CompteRendu } from '../../domain/models';
import { StatutCR, Role, canViewOthersCR } from '../../domain/enums';

interface StatCard {
  title: string;
  value: string;
  subValue?: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    ChartModule,
    TagModule,
    ProgressBarModule,
    RippleModule,
    SkeletonModule,
    TooltipModule
  ],
  template: `
    <div class="dashboard">
      <!-- Welcome Section -->
      <section class="welcome-section">
        <div class="welcome-content">
          <h1>Bonjour, {{ userName }} <span class="wave">&#128075;</span></h1>
          <p>{{ getGreetingMessage() }}</p>
        </div>
        <div class="quick-actions">
          <button class="quick-action-btn primary" pRipple routerLink="/compte-rendu/new">
            <i class="pi pi-plus"></i>
            <span>Nouveau Compte Rendu</span>
          </button>
          <button class="quick-action-btn secondary" pRipple routerLink="/compte-rendu">
            <i class="pi pi-list"></i>
            <span>Mes CR</span>
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
              @if (stat.subValue) {
                <span class="stat-sub">{{ stat.subValue }}</span>
              }
            </div>
          </div>
        }
      </section>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Recent CR -->
        <section class="cr-section">
          <div class="section-header">
            <h2>Comptes Rendus Récents</h2>
            <a routerLink="/compte-rendu" class="view-all-link">Voir tout <i class="pi pi-arrow-right"></i></a>
          </div>
          <div class="cr-list">
            @for (cr of recentCRs; track cr.id) {
              <div class="cr-card" pRipple (click)="viewCR(cr)">
                <div class="cr-header">
                  <div class="cr-date-icon" [attr.data-status]="cr.statut">
                    <i class="pi pi-calendar"></i>
                  </div>
                  <div class="cr-info">
                    <h3>{{ cr.date | date:'EEEE dd MMMM':'':'fr' }}</h3>
                    <div class="cr-meta">
                      <span><i class="pi pi-clock"></i> {{ cr.priereSeule }}</span>
                      <span><i class="pi pi-book"></i> {{ cr.lectureBiblique || 0 }} chapitres</span>
                    </div>
                  </div>
                  <div class="cr-status">
                    @switch (cr.statut) {
                      @case ('VALIDE') {
                        <span class="status-badge valide">
                          <i class="pi pi-check-circle"></i> Validé
                        </span>
                      }
                      @case ('SOUMIS') {
                        <span class="status-badge soumis">
                          <i class="pi pi-send"></i> Soumis
                        </span>
                      }
                      @case ('BROUILLON') {
                        <span class="status-badge brouillon">
                          <i class="pi pi-pencil"></i> Brouillon
                        </span>
                      }
                    }
                  </div>
                </div>
                <div class="cr-footer">
                  <div class="rdqd-display">
                    <span class="rdqd-label">RDQD</span>
                    <span class="rdqd-value">{{ cr.rdqd }}</span>
                    <div class="rdqd-progress">
                      <div class="rdqd-progress-bar" [style.width.%]="getRdqdPercentage(cr.rdqd)"></div>
                    </div>
                  </div>
                  <div class="cr-actions">
                    @if (cr.confession) {
                      <span class="badge-icon" pTooltip="Confession"><i class="pi pi-heart"></i></span>
                    }
                    @if (cr.jeune) {
                      <span class="badge-icon" pTooltip="Jeûne"><i class="pi pi-sun"></i></span>
                    }
                    @if (cr.offrande) {
                      <span class="badge-icon" pTooltip="Offrande"><i class="pi pi-wallet"></i></span>
                    }
                    @if (cr.evangelisation && cr.evangelisation > 0) {
                      <span class="badge-icon" pTooltip="Évangélisation"><i class="pi pi-users"></i></span>
                    }
                  </div>
                </div>
              </div>
            } @empty {
              <div class="empty-state">
                <i class="pi pi-file-edit"></i>
                <h3>Aucun compte rendu</h3>
                <p>Commencez par créer votre premier compte rendu spirituel</p>
                <button pButton label="Créer un CR" icon="pi pi-plus" routerLink="/compte-rendu/new"></button>
              </div>
            }
          </div>
        </section>

        <!-- Right Sidebar -->
        <aside class="dashboard-sidebar">
          <!-- Weekly Activity Chart -->
          <div class="sidebar-card chart-card">
            <h3>Activité hebdomadaire</h3>
            <p-chart type="bar" [data]="activityChartData" [options]="chartOptions" height="200px"></p-chart>
          </div>

          <!-- Spiritual Progress -->
          <div class="sidebar-card progress-card">
            <h3>Progression spirituelle</h3>
            <div class="progress-item">
              <div class="progress-header">
                <span>RDQD du mois</span>
                <span class="progress-value">{{ rdqdProgress }}%</span>
              </div>
              <p-progressBar [value]="rdqdProgress" [showValue]="false" styleClass="progress-bar"></p-progressBar>
            </div>
            <div class="progress-item">
              <div class="progress-header">
                <span>CR soumis</span>
                <span class="progress-value">{{ submittedCRCount }}/{{ totalExpectedCR }}</span>
              </div>
              <p-progressBar [value]="submissionProgress" [showValue]="false" styleClass="progress-bar secondary"></p-progressBar>
            </div>
            <div class="progress-item">
              <div class="progress-header">
                <span>CR validés</span>
                <span class="progress-value">{{ validatedCRCount }}</span>
              </div>
              <p-progressBar [value]="validationProgress" [showValue]="false" styleClass="progress-bar success"></p-progressBar>
            </div>
          </div>

          <!-- Daily Reminder -->
          <div class="sidebar-card reminder-card">
            <div class="reminder-icon">
              <i class="pi pi-bell"></i>
            </div>
            <h3>Rappel quotidien</h3>
            @if (!hasTodayCR) {
              <p>N'oubliez pas de remplir votre compte rendu du jour !</p>
              <button pButton label="Remplir maintenant" icon="pi pi-plus" class="p-button-sm" routerLink="/compte-rendu/new"></button>
            } @else {
              <p class="success-text"><i class="pi pi-check-circle"></i> Vous avez déjà rempli votre CR aujourd'hui. Continuez ainsi !</p>
            }
          </div>

          <!-- Verse of the Day -->
          <div class="sidebar-card verse-card">
            <div class="verse-icon">
              <i class="pi pi-book"></i>
            </div>
            <h3>Verset du jour</h3>
            <blockquote>
              "Cherchez premièrement le royaume de Dieu et sa justice, et toutes ces choses vous seront données par-dessus."
            </blockquote>
            <cite>- Matthieu 6:33</cite>
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
    }

    .wave {
      display: inline-block;
      animation: wave 2.5s infinite;
      transform-origin: 70% 70%;
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

    .stat-sub {
      font-size: 0.75rem;
      color: #9ca3af;
      margin-top: 0.25rem;
    }

    /* Content Grid */
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 2rem;
    }

    /* CR Section */
    .cr-section {
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

    .cr-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .cr-card {
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

    .cr-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
    }

    .cr-date-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.125rem;

      &[data-status="VALIDE"] {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
      }

      &[data-status="SOUMIS"] {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
      }

      &[data-status="BROUILLON"] {
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
      }
    }

    .cr-info {
      flex: 1;

      h3 {
        margin: 0 0 0.375rem;
        font-size: 1rem;
        font-weight: 600;
        color: #1f2937;
        text-transform: capitalize;
      }
    }

    .cr-meta {
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

      &.valide {
        background: rgba(34, 197, 94, 0.1);
        color: #16a34a;
      }

      &.soumis {
        background: rgba(59, 130, 246, 0.1);
        color: #2563eb;
      }

      &.brouillon {
        background: rgba(245, 158, 11, 0.1);
        color: #d97706;
      }
    }

    .cr-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }

    .rdqd-display {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .rdqd-label {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .rdqd-value {
      font-weight: 600;
      color: #1f2937;
    }

    .rdqd-progress {
      width: 60px;
      height: 6px;
      background: #e5e7eb;
      border-radius: 3px;
      overflow: hidden;
    }

    .rdqd-progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 3px;
      transition: width 0.3s ease;
    }

    .cr-actions {
      display: flex;
      gap: 0.5rem;
    }

    .badge-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #f3f4f6;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      color: #6366f1;
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

    /* Progress Card */
    .progress-item {
      margin-bottom: 1rem;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;

      span:first-child {
        color: #6b7280;
      }
    }

    .progress-value {
      font-weight: 600;
      color: #1f2937;
    }

    ::ng-deep .progress-bar {
      height: 8px !important;
      border-radius: 4px !important;

      .p-progressbar-value {
        background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%) !important;
        border-radius: 4px !important;
      }

      &.secondary .p-progressbar-value {
        background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%) !important;
      }

      &.success .p-progressbar-value {
        background: linear-gradient(90deg, #22c55e 0%, #4ade80 100%) !important;
      }
    }

    /* Reminder Card */
    .reminder-card {
      background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
      border-color: #fcd34d;

      .reminder-icon {
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
        margin: 0 0 1rem;
        font-size: 0.875rem;
        color: #78350f;
        line-height: 1.5;
      }

      .success-text {
        color: #166534;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
      }
    }

    /* Verse Card */
    .verse-card {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      border-color: #93c5fd;

      .verse-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: rgba(59, 130, 246, 0.2);
        color: #1d4ed8;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        margin-bottom: 0.75rem;
      }

      h3 {
        color: #1e40af;
      }

      blockquote {
        margin: 0 0 0.5rem;
        font-size: 0.9rem;
        font-style: italic;
        color: #1e3a8a;
        line-height: 1.6;
      }

      cite {
        font-size: 0.8rem;
        color: #3b82f6;
        font-style: normal;
      }
    }

    /* Empty State */
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
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly crFacade = inject(CompteRenduFacade);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  userName = 'Utilisateur';
  recentCRs: CompteRendu[] = [];
  statsCards: StatCard[] = [];

  activityChartData: any;
  chartOptions: any;

  rdqdProgress = 0;
  submittedCRCount = 0;
  validatedCRCount = 0;
  totalExpectedCR = 30;
  submissionProgress = 0;
  validationProgress = 0;
  hasTodayCR = false;

  ngOnInit(): void {
    this.initChart();
    this.loadUserInfo();
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Force chart resize after view is initialized
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      this.cdr.detectChanges();
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserInfo(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.userName = user.prenom || user.nom || 'Utilisateur';
      },
      error: () => {
        this.userName = 'Utilisateur';
      }
    });
  }

  private loadData(): void {
    // Charger selon le rôle de l'utilisateur
    this.authService.getCurrentUser().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (user) => {
        console.log('[Dashboard] User role:', user.role, 'User ID:', user.id);

        if (canViewOthersCR(user.role)) {
          const supervisedUserIds = this.getSupervisedUserIds(user.role);
          console.log('[Dashboard] Loading CRs for supervised users:', supervisedUserIds);
          this.crFacade.loadCompteRendusForUsers(supervisedUserIds);
        } else {
          this.crFacade.loadMyCompteRendus();
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('[Dashboard] Error getting user:', err);
        this.crFacade.loadMyCompteRendus();
      }
    });

    this.crFacade.comptesRendus$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(crs => {
      this.recentCRs = [...crs]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

      this.calculateStats(crs);
      this.checkTodayCR(crs);
      this.updateChart(crs);

      // Force la détection des changements et le resize des graphiques
      this.cdr.detectChanges();
      window.dispatchEvent(new Event('resize'));
    });
  }

  /**
   * Retourne les IDs des utilisateurs supervisés selon le rôle
   * Basé sur les données seed de la BD
   */
  private getSupervisedUserIds(role: Role): string[] {
    // IDs des fidèles de la BD (V2__seed_data.sql)
    const allFideles = [
      'd1000000-0000-0000-0000-000000000030', // Paul FIDELE (fidele@cmci.org)
      'd1000000-0000-0000-0000-000000000031', // Antoine LAMBERT
      'd1000000-0000-0000-0000-000000000032', // Julie DUBOIS
      'd1000000-0000-0000-0000-000000000033', // Lucas MARTINEZ
      'd1000000-0000-0000-0000-000000000034', // Emma GARCIA
      'd1000000-0000-0000-0000-000000000035', // Nathan THOMAS
      'd1000000-0000-0000-0000-000000000036', // Camille FAURE (Lyon)
      'd1000000-0000-0000-0000-000000000037', // David FOTSO (Douala)
      'd1000000-0000-0000-0000-000000000038', // Esther TAMBA (Douala)
    ];

    // Admin voit tous les fidèles
    if (role === Role.ADMIN || role === Role.PASTEUR) {
      return allFideles;
    }

    // FD/Leader voient les fidèles de leur église de maison
    // Pour simplifier, on retourne tous les fidèles pour l'instant
    return allFideles;
  }

  private calculateStats(crs: CompteRendu[]): void {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthCRs = crs.filter(cr => new Date(cr.date) >= startOfMonth);

    this.submittedCRCount = thisMonthCRs.filter(cr =>
      cr.statut === StatutCR.SOUMIS || cr.statut === StatutCR.VALIDE
    ).length;

    this.validatedCRCount = thisMonthCRs.filter(cr =>
      cr.statut === StatutCR.VALIDE
    ).length;

    const dayOfMonth = now.getDate();
    this.totalExpectedCR = dayOfMonth;
    this.submissionProgress = this.totalExpectedCR > 0
      ? Math.round((this.submittedCRCount / this.totalExpectedCR) * 100)
      : 0;
    this.validationProgress = this.submittedCRCount > 0
      ? Math.round((this.validatedCRCount / this.submittedCRCount) * 100)
      : 0;

    let totalRdqdAccompli = 0;
    let totalRdqdAttendu = 0;
    thisMonthCRs.forEach(cr => {
      const [accompli, attendu] = cr.rdqd.split('/').map(Number);
      totalRdqdAccompli += accompli || 0;
      totalRdqdAttendu += attendu || 0;
    });
    this.rdqdProgress = totalRdqdAttendu > 0
      ? Math.round((totalRdqdAccompli / totalRdqdAttendu) * 100)
      : 0;

    let totalPrayerMinutes = 0;
    let totalEvangelisation = 0;
    let totalBibleChapters = 0;

    thisMonthCRs.forEach(cr => {
      totalPrayerMinutes += this.parseTimeToMinutes(cr.priereSeule);
      totalEvangelisation += cr.evangelisation || 0;
      totalBibleChapters += cr.lectureBiblique || 0;
    });

    const prayerHours = Math.floor(totalPrayerMinutes / 60);
    const prayerMins = totalPrayerMinutes % 60;

    this.statsCards = [
      {
        title: 'CR ce mois',
        value: thisMonthCRs.length.toString(),
        subValue: `sur ${this.totalExpectedCR} jours`,
        icon: 'pi-file-edit',
        color: '#6366f1'
      },
      {
        title: 'Temps de prière',
        value: `${prayerHours}h${prayerMins > 0 ? prayerMins : ''}`,
        subValue: 'ce mois',
        icon: 'pi-clock',
        color: '#8b5cf6'
      },
      {
        title: 'Chapitres lus',
        value: totalBibleChapters.toString(),
        subValue: 'ce mois',
        icon: 'pi-book',
        color: '#22c55e'
      },
      {
        title: 'Évangélisations',
        value: totalEvangelisation.toString(),
        subValue: 'personnes contactées',
        icon: 'pi-users',
        color: '#f59e0b'
      }
    ];
  }

  private checkTodayCR(crs: CompteRendu[]): void {
    const today = new Date().toISOString().split('T')[0];
    this.hasTodayCR = crs.some(cr => {
      const crDate = cr.date instanceof Date
        ? cr.date.toISOString().split('T')[0]
        : String(cr.date);
      return crDate === today;
    });
  }

  private updateChart(crs: CompteRendu[]): void {
    const labels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const prayerData = new Array(7).fill(0);

    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    crs.forEach(cr => {
      const crDate = new Date(cr.date);
      if (crDate >= startOfWeek) {
        const crDay = crDate.getDay();
        const index = crDay === 0 ? 6 : crDay - 1;
        prayerData[index] = this.parseTimeToMinutes(cr.priereSeule);
      }
    });

    this.activityChartData = {
      labels,
      datasets: [
        {
          label: 'Minutes de prière',
          data: prayerData,
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: '#6366f1',
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    };
  }

  private parseTimeToMinutes(time: string): number {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }

  initChart(): void {
    this.activityChartData = {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [
        {
          label: 'Minutes de prière',
          data: [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: 'rgba(99, 102, 241, 0.7)',
          borderColor: '#6366f1',
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 0,
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

  getRdqdPercentage(rdqd: string): number {
    const [accompli, attendu] = rdqd.split('/').map(Number);
    return attendu > 0 ? (accompli / attendu) * 100 : 0;
  }

  getGreetingMessage(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Que le Seigneur bénisse votre matinée !';
    } else if (hour < 18) {
      return 'Bonne continuation dans cette journée bénie !';
    } else {
      return 'Que Dieu veille sur votre soirée !';
    }
  }

  viewCR(cr: CompteRendu): void {
    this.router.navigate(['/compte-rendu', cr.id]);
  }
}
