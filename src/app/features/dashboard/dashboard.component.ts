import { Component, OnInit, AfterViewInit, inject, ChangeDetectorRef, OnDestroy, ApplicationRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { RippleModule } from 'primeng/ripple';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';

import { Subject, forkJoin, of } from 'rxjs';
import { takeUntil, catchError, finalize } from 'rxjs/operators';

import { CompteRenduFacade, SubordinatesFacade } from '../../application/use-cases';
import { AuthService } from '../../infrastructure/auth';
import { VerseService, DailyVerse } from '../../infrastructure/services/verse.service';
import { CompteRendu, DiscipleWithCRStatus } from '../../domain/models';
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
    ButtonModule,
    ChartModule,
    RippleModule,
    SkeletonModule,
    TooltipModule,
    AvatarModule
  ],
  template: `
    <div class="dashboard">
      <!-- Welcome Section -->
      <section class="welcome-section">
        <div class="welcome-content">
          @if (isLoading) {
            <p-skeleton width="200px" height="2rem" styleClass="mb-2"></p-skeleton>
            <p-skeleton width="300px" height="1rem"></p-skeleton>
          } @else {
            <h1>Bonjour, {{ userName }} <span class="wave">&#128075;</span></h1>
            <p>{{ getGreetingMessage() }}</p>
          }
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
              @if (isLoading) {
                <p-skeleton width="60px" height="1.75rem" styleClass="mb-1"></p-skeleton>
                <p-skeleton width="80px" height="0.875rem"></p-skeleton>
              } @else {
                <span class="stat-value">{{ stat.value }}</span>
                <span class="stat-title">{{ stat.title }}</span>
                @if (stat.subValue) {
                  <span class="stat-sub">{{ stat.subValue }}</span>
                }
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
            <div class="section-title-group">
              <div class="section-title-icon">
                <i class="pi pi-history"></i>
              </div>
              <div>
                <h2>Comptes Rendus Récents</h2>
                <span class="section-subtitle">Vos 5 derniers comptes rendus</span>
              </div>
            </div>
            <a routerLink="/compte-rendu" class="view-all-link">Voir tout <i class="pi pi-arrow-right"></i></a>
          </div>
          <div class="cr-list">
            @if (isLoading) {
              @for (i of [1,2,3]; track i) {
                <div class="cr-card skeleton-card">
                  <div class="cr-header">
                    <p-skeleton shape="circle" size="44px"></p-skeleton>
                    <div class="cr-info" style="flex: 1">
                      <p-skeleton width="150px" height="1rem" styleClass="mb-2"></p-skeleton>
                      <p-skeleton width="200px" height="0.75rem"></p-skeleton>
                    </div>
                    <p-skeleton width="80px" height="1.5rem" borderRadius="20px"></p-skeleton>
                  </div>
                  <div class="cr-footer">
                    <p-skeleton width="100px" height="0.75rem"></p-skeleton>
                  </div>
                </div>
              }
            } @else {
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
                <div class="empty-icon-wrapper">
                  <i class="pi pi-file-edit"></i>
                </div>
                <h3>Aucun compte rendu</h3>
                <p>Commencez par créer votre premier compte rendu spirituel</p>
                <button class="btn-empty-cta" pRipple routerLink="/compte-rendu/new">
                  <i class="pi pi-plus"></i>
                  <span>Créer un CR</span>
                </button>
              </div>
            }
            }
          </div>
        </section>

        <!-- Right Sidebar -->
        <aside class="dashboard-sidebar">
          <!-- Weekly Activity Chart -->
          <div class="sidebar-card chart-card">
            <div class="sidebar-card-header">
              <div class="sidebar-card-icon chart-icon-bg">
                <i class="pi pi-chart-bar"></i>
              </div>
              <h3>Activité hebdomadaire</h3>
            </div>
            @if (isLoading) {
              <p-skeleton width="100%" height="200px"></p-skeleton>
            } @else {
              <p-chart type="bar" [data]="activityChartData" [options]="chartOptions" height="200px"></p-chart>
            }
          </div>

          <!-- Spiritual Progress -->
          <div class="sidebar-card progress-card">
            <div class="sidebar-card-header">
              <div class="sidebar-card-icon progress-icon-bg">
                <i class="pi pi-chart-line"></i>
              </div>
              <h3>Progression spirituelle</h3>
            </div>
            @if (isLoading) {
              @for (i of [1,2,3]; track i) {
                <div class="progress-item">
                  <p-skeleton width="100%" height="0.875rem" styleClass="mb-2"></p-skeleton>
                  <p-skeleton width="100%" height="8px"></p-skeleton>
                </div>
              }
            } @else {
              <div class="progress-item">
                <div class="progress-header">
                  <span>RDQD du mois</span>
                  <span class="progress-value">{{ rdqdProgress }}%</span>
                </div>
                <div class="custom-progress-bar">
                  <div class="custom-progress-fill indigo" [style.width.%]="rdqdProgress"></div>
                </div>
              </div>
              <div class="progress-item">
                <div class="progress-header">
                  <span>CR soumis</span>
                  <span class="progress-value">{{ submittedCRCount }}/{{ totalExpectedCR }}</span>
                </div>
                <div class="custom-progress-bar">
                  <div class="custom-progress-fill blue" [style.width.%]="submissionProgress"></div>
                </div>
              </div>
              <div class="progress-item">
                <div class="progress-header">
                  <span>CR validés</span>
                  <span class="progress-value">{{ validatedCRCount }}</span>
                </div>
                <div class="custom-progress-bar">
                  <div class="custom-progress-fill green" [style.width.%]="validationProgress"></div>
                </div>
              </div>
            }
          </div>

          <!-- Daily Reminder -->
          <div class="sidebar-card reminder-card">
            <div class="reminder-icon">
              <i class="pi pi-bell"></i>
            </div>
            <h3>Rappel quotidien</h3>
            @if (!hasTodayCR) {
              <p>N'oubliez pas de remplir votre compte rendu du jour !</p>
              <button class="btn-reminder" pRipple routerLink="/compte-rendu/new">
                <i class="pi pi-plus"></i>
                <span>Remplir maintenant</span>
              </button>
            } @else {
              <p class="success-text"><i class="pi pi-check-circle"></i> Vous avez déjà rempli votre CR aujourd'hui. Continuez ainsi !</p>
            }
          </div>

          <!-- Disciples Widget (visible only for FD, Leader, Pasteur, Admin) -->
          @if (canViewDisciples) {
            <div class="sidebar-card disciples-card">
              <div class="disciples-header">
                <div class="disciples-title">
                  <div class="disciples-icon">
                    <i class="pi pi-users"></i>
                  </div>
                  <div>
                    <h3>Mes Disciples</h3>
                    <span class="disciples-subtitle">Suivi spirituel</span>
                  </div>
                </div>
                @if (disciplesWithAlert > 0) {
                  <span class="alert-badge" pTooltip="Disciples nécessitant attention">
                    {{ disciplesWithAlert }}
                  </span>
                }
              </div>

              @if (disciplesLoading) {
                <div class="disciples-list">
                  @for (i of [1, 2, 3]; track i) {
                    <div class="disciple-item skeleton">
                      <p-skeleton shape="circle" size="40px"></p-skeleton>
                      <div class="disciple-info">
                        <p-skeleton width="120px" height="0.9rem" styleClass="mb-2"></p-skeleton>
                        <p-skeleton width="80px" height="0.75rem"></p-skeleton>
                      </div>
                      <p-skeleton width="50px" height="1.5rem" borderRadius="12px"></p-skeleton>
                    </div>
                  }
                </div>
              } @else {
                @if (disciples.length > 0) {
                  <div class="disciples-stats">
                    <div class="stat-mini">
                      <span class="stat-mini-value">{{ disciples.length }}</span>
                      <span class="stat-mini-label">Total</span>
                    </div>
                    <div class="stat-mini success">
                      <span class="stat-mini-value">{{ disciplesWithCRToday }}</span>
                      <span class="stat-mini-label">CR aujourd'hui</span>
                    </div>
                    <div class="stat-mini warning">
                      <span class="stat-mini-value">{{ disciplesWithAlert }}</span>
                      <span class="stat-mini-label">Alertes</span>
                    </div>
                  </div>

                  <div class="disciples-list">
                    @for (disciple of disciplesToShow; track disciple.discipleId) {
                      <div class="disciple-item" [class.has-alert]="disciple.alerte" pRipple>
                        <div class="disciple-avatar" [class.online]="disciple.crAujourdhui">
                          @if (disciple.avatarUrl) {
                            <img [src]="disciple.avatarUrl" [alt]="disciple.nomComplet" />
                          } @else {
                            <span class="avatar-initials">{{ getInitials(disciple.prenom, disciple.nom) }}</span>
                          }
                          <span class="status-dot" [class.active]="disciple.crAujourdhui" [class.warning]="!disciple.crAujourdhui && disciple.niveauAlerte === 'WARNING'" [class.critical]="disciple.niveauAlerte === 'CRITICAL'"></span>
                        </div>
                        <div class="disciple-info">
                          <span class="disciple-name">{{ disciple.prenom }} {{ disciple.nom }}</span>
                          <span class="disciple-status">
                            @if (disciple.crAujourdhui) {
                              <i class="pi pi-check-circle success"></i> CR rempli aujourd'hui
                            } @else if (disciple.joursDepuisDernierCR !== null && disciple.joursDepuisDernierCR !== undefined) {
                              @if (disciple.joursDepuisDernierCR === 0) {
                                <i class="pi pi-check-circle success"></i> CR rempli aujourd'hui
                              } @else if (disciple.joursDepuisDernierCR <= 2) {
                                <i class="pi pi-clock"></i> {{ disciple.joursDepuisDernierCR }}j sans CR
                              } @else {
                                <i class="pi pi-exclamation-triangle warning"></i> {{ disciple.joursDepuisDernierCR }}j sans CR
                              }
                            } @else {
                              <i class="pi pi-info-circle"></i> Aucun CR
                            }
                          </span>
                        </div>
                        <div class="disciple-rate" [class.good]="disciple.tauxRegularite30j >= 70" [class.medium]="disciple.tauxRegularite30j >= 40 && disciple.tauxRegularite30j < 70" [class.low]="disciple.tauxRegularite30j < 40">
                          {{ disciple.tauxRegularite30j | number:'1.0-0' }}%
                        </div>
                      </div>
                    }
                  </div>

                  @if (disciples.length > 4) {
                    <button class="view-all-disciples" pRipple (click)="toggleShowAllDisciples()">
                      @if (showAllDisciples) {
                        <i class="pi pi-chevron-up"></i> Réduire
                      } @else {
                        <i class="pi pi-chevron-down"></i> Voir tous ({{ disciples.length }})
                      }
                    </button>
                  }
                } @else {
                  <div class="disciples-empty">
                    <i class="pi pi-user-plus"></i>
                    <p>Aucun disciple assigné</p>
                  </div>
                }
              }
            </div>
          }

          <!-- Verse of the Day -->
          <div class="sidebar-card verse-card">
            <div class="sidebar-card-header verse-header">
              <div class="verse-icon">
                <i class="pi pi-book"></i>
              </div>
              <h3>Verset du jour</h3>
            </div>
            @if (verseLoading) {
              <div class="verse-skeleton">
                <p-skeleton width="100%" height="1rem" styleClass="mb-2"></p-skeleton>
                <p-skeleton width="100%" height="1rem" styleClass="mb-2"></p-skeleton>
                <p-skeleton width="80%" height="1rem" styleClass="mb-3"></p-skeleton>
                <p-skeleton width="40%" height="0.875rem"></p-skeleton>
              </div>
            } @else {
              <blockquote>
                "{{ dailyVerse.text }}"
              </blockquote>
              <cite>- {{ dailyVerse.reference }}</cite>
              <span class="verse-version">{{ dailyVerse.version }}</span>
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
        font-size: 1.125rem;
        font-weight: 600;
        color: #1f2937;
      }
    }

    .section-title-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .section-title-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 10px rgba(99, 102, 241, 0.3);

      i {
        font-size: 1rem;
        color: white;
      }
    }

    .section-subtitle {
      font-size: 0.75rem;
      color: #9ca3af;
      margin-top: 0.125rem;
      display: block;
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
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: #1f2937;
      }
    }

    .sidebar-card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }

    .sidebar-card-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 1rem;
        color: white;
      }
    }

    .chart-icon-bg {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      box-shadow: 0 3px 10px rgba(99, 102, 241, 0.3);
    }

    .progress-icon-bg {
      background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
      box-shadow: 0 3px 10px rgba(245, 158, 11, 0.3);
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

    .custom-progress-bar {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }

    .custom-progress-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;

      &.indigo {
        background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
      }

      &.blue {
        background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
      }

      &.green {
        background: linear-gradient(90deg, #22c55e 0%, #4ade80 100%);
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

    .btn-reminder {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1.25rem;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(245, 158, 11, 0.35);
      transition: all 0.2s ease;

      i {
        font-size: 0.875rem;
      }

      &:hover {
        background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.45);
      }
    }

    /* Verse Card */
    .verse-card {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      border-color: #93c5fd;

      .verse-header {
        margin-bottom: 1rem;
      }

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
      }

      h3 {
        color: #1e40af;
      }

      blockquote {
        margin: 0 0 0.75rem;
        font-size: 0.9rem;
        font-style: italic;
        color: #1e3a8a;
        line-height: 1.6;
      }

      cite {
        font-size: 0.875rem;
        color: #3b82f6;
        font-style: normal;
        font-weight: 600;
        display: block;
      }

      .verse-version {
        display: block;
        font-size: 0.7rem;
        color: #64748b;
        margin-top: 0.5rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .verse-skeleton {
        padding: 0.5rem 0;
      }
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 3rem;

      .empty-icon-wrapper {
        width: 72px;
        height: 72px;
        margin: 0 auto 1.25rem;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;

        i {
          font-size: 2rem;
          color: #6366f1;
        }
      }

      h3 {
        margin: 0 0 0.5rem;
        font-size: 1.125rem;
        font-weight: 600;
        color: #374151;
      }

      p {
        margin: 0 0 1.5rem;
        color: #6b7280;
        font-size: 0.9rem;
      }
    }

    .btn-empty-cta {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.75rem;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
      transition: all 0.2s ease;

      i {
        font-size: 0.875rem;
      }

      &:hover {
        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.45);
      }
    }

    /* Skeleton Card */
    .skeleton-card {
      cursor: default;

      .cr-footer {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
      }
    }

    /* Disciples Card */
    .disciples-card {
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      border-color: #86efac;
      overflow: hidden;

      .disciples-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
      }

      .disciples-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .disciples-icon {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
      }

      h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: #166534;
      }

      .disciples-subtitle {
        font-size: 0.75rem;
        color: #4ade80;
        font-weight: 500;
      }

      .alert-badge {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.25rem 0.625rem;
        border-radius: 12px;
        min-width: 24px;
        text-align: center;
        box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
        animation: pulse-alert 2s infinite;
      }

      @keyframes pulse-alert {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    }

    .disciples-stats {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }

    .stat-mini {
      flex: 1;
      text-align: center;
      padding: 0.5rem;
      border-radius: 8px;
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

      .stat-mini-value {
        display: block;
        font-size: 1.25rem;
        font-weight: 700;
        color: #1f2937;
      }

      .stat-mini-label {
        display: block;
        font-size: 0.65rem;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.3px;
        margin-top: 0.125rem;
      }

      &.success {
        background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
        .stat-mini-value { color: #16a34a; }
        .stat-mini-label { color: #22c55e; }
      }

      &.warning {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        .stat-mini-value { color: #d97706; }
        .stat-mini-label { color: #f59e0b; }
      }
    }

    .disciples-list {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }

    .disciple-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      background: white;
      border-radius: 12px;
      transition: all 0.2s ease;
      cursor: pointer;
      border: 1px solid transparent;

      &:hover {
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        border-color: #86efac;
      }

      &.has-alert {
        background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
        border-color: #fdba74;

        &:hover {
          border-color: #f97316;
        }
      }

      &.skeleton {
        cursor: default;
        &:hover {
          transform: none;
          box-shadow: none;
        }
      }
    }

    .disciple-avatar {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: visible;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid #e5e7eb;
      }

      .avatar-initials {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85rem;
        font-weight: 600;
        border: 2px solid #e5e7eb;
      }

      &.online {
        img, .avatar-initials {
          border-color: #22c55e;
        }
      }

      .status-dot {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
        background: #9ca3af;

        &.active {
          background: #22c55e;
          box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
        }

        &.warning {
          background: #f59e0b;
          box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
        }

        &.critical {
          background: #ef4444;
          box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
          animation: blink 1.5s infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      }
    }

    .disciple-info {
      flex: 1;
      min-width: 0;

      .disciple-name {
        display: block;
        font-size: 0.875rem;
        font-weight: 600;
        color: #1f2937;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .disciple-status {
        display: flex;
        align-items: center;
        gap: 0.375rem;
        font-size: 0.7rem;
        color: #6b7280;
        margin-top: 0.125rem;

        i {
          font-size: 0.7rem;

          &.success { color: #22c55e; }
          &.warning { color: #f59e0b; }
        }
      }
    }

    .disciple-rate {
      padding: 0.25rem 0.625rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      min-width: 48px;
      text-align: center;

      &.good {
        background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
        color: #16a34a;
      }

      &.medium {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
        color: #d97706;
      }

      &.low {
        background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
        color: #dc2626;
      }
    }

    .view-all-disciples {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      margin-top: 0.75rem;
      padding: 0.625rem;
      background: rgba(255, 255, 255, 0.7);
      border: 1px dashed #86efac;
      border-radius: 10px;
      color: #16a34a;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: white;
        border-style: solid;
        box-shadow: 0 2px 8px rgba(34, 197, 94, 0.15);
      }

      i {
        font-size: 0.75rem;
      }
    }

    .disciples-empty {
      text-align: center;
      padding: 1.5rem;

      i {
        font-size: 2rem;
        color: #86efac;
        margin-bottom: 0.5rem;
      }

      p {
        margin: 0;
        font-size: 0.875rem;
        color: #4ade80;
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
  private readonly subordinatesFacade = inject(SubordinatesFacade);
  private readonly authService = inject(AuthService);
  private readonly verseService = inject(VerseService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly appRef = inject(ApplicationRef);
  private readonly ngZone = inject(NgZone);
  private readonly destroy$ = new Subject<void>();

  // État de chargement global
  isLoading = true;
  verseLoading = true;
  disciplesLoading = true;

  userName = 'Utilisateur';
  recentCRs: CompteRendu[] = [];
  statsCards: StatCard[] = [];

  // Verset du jour
  dailyVerse: DailyVerse = {
    text: "Cherchez premièrement le royaume de Dieu et sa justice, et toutes ces choses vous seront données par-dessus.",
    reference: "Matthieu 6:33",
    version: "Louis Segond"
  };

  activityChartData: any;
  chartOptions: any;

  rdqdProgress = 0;
  submittedCRCount = 0;
  validatedCRCount = 0;
  totalExpectedCR = 30;
  submissionProgress = 0;
  validationProgress = 0;
  hasTodayCR = false;

  // Disciples (pour FD/Leader/Pasteur/Admin)
  canViewDisciples = false;
  disciples: DiscipleWithCRStatus[] = [];
  showAllDisciples = false;
  disciplesWithAlert = 0;
  disciplesWithCRToday = 0;

  /**
   * Retourne les disciples à afficher (4 premiers ou tous selon showAllDisciples)
   */
  get disciplesToShow(): DiscipleWithCRStatus[] {
    if (this.showAllDisciples) {
      return this.disciples;
    }
    return this.disciples.slice(0, 4);
  }

  ngOnInit(): void {
    this.initChart();
    this.initDefaultStats();
    this.loadAllData();
    this.loadDailyVerse();
  }

  /**
   * Charge le verset du jour depuis l'API
   */
  private loadDailyVerse(): void {
    this.verseLoading = true;
    this.verseService.getDailyVerse().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (verse) => {
        this.dailyVerse = verse;
        this.verseLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.verseLoading = false;
        // Garder le verset par défaut
      }
    });
  }

  ngAfterViewInit(): void {
    // Force chart resize après l'initialisation de la vue
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.ngZone.run(() => {
          window.dispatchEvent(new Event('resize'));
          this.cdr.detectChanges();
          this.appRef.tick();
        });
      }, 100);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Initialise les stats par défaut pour éviter l'écran vide
   */
  private initDefaultStats(): void {
    this.statsCards = [
      { title: 'CR ce mois', value: '0', subValue: 'chargement...', icon: 'pi-file-edit', color: '#6366f1' },
      { title: 'Temps de prière', value: '0h', subValue: 'ce mois', icon: 'pi-clock', color: '#8b5cf6' },
      { title: 'Chapitres lus', value: '0', subValue: 'ce mois', icon: 'pi-book', color: '#22c55e' },
      { title: 'Évangélisations', value: '0', subValue: 'personnes contactées', icon: 'pi-users', color: '#f59e0b' }
    ];
  }

  /**
   * Charge toutes les données en une seule fois
   */
  private loadAllData(): void {
    this.isLoading = true;

    // Charger l'utilisateur d'abord
    this.authService.getCurrentUser().pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('[Dashboard] Error getting user:', err);
        this.userName = 'Utilisateur';
        return of(null);
      })
    ).subscribe(user => {
      if (user) {
        this.userName = user.prenom || user.nom || 'Utilisateur';

        // Vérifier si l'utilisateur peut voir les disciples
        this.canViewDisciples = canViewOthersCR(user.role);

        // Charger les CRs selon le rôle
        if (this.canViewDisciples) {
          const supervisedUserIds = this.getSupervisedUserIds(user.role);
          this.crFacade.loadCompteRendusForUsers(supervisedUserIds);
          // Charger les disciples
          this.loadDisciples();
        } else {
          this.crFacade.loadMyCompteRendus();
          this.disciplesLoading = false;
        }
      } else {
        this.crFacade.loadMyCompteRendus();
        this.disciplesLoading = false;
      }

      // Force un rafraîchissement immédiat
      this.forceUIUpdate();
    });

    // S'abonner aux CRs
    this.crFacade.comptesRendus$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(crs => {
      this.processCompteRendus(crs);
    });

    // S'abonner au loading state
    this.crFacade.loading$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(loading => {
      this.isLoading = loading;
      if (!loading) {
        // Quand le chargement est terminé, forcer la mise à jour complète
        this.ngZone.run(() => {
          this.forceUIUpdate();
          // Delay supplémentaire pour les graphiques
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
            this.cdr.detectChanges();
          }, 50);
        });
      }
    });
  }

  /**
   * Traite les comptes rendus chargés
   */
  private processCompteRendus(crs: CompteRendu[]): void {
    this.recentCRs = [...crs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    this.calculateStats(crs);
    this.checkTodayCR(crs);
    this.updateChart(crs);

    // Force la mise à jour de l'UI
    this.forceUIUpdate();
  }

  /**
   * Force la mise à jour de l'interface utilisateur
   */
  private forceUIUpdate(): void {
    this.cdr.detectChanges();
    this.appRef.tick();
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

  /**
   * Charge les disciples depuis l'API
   */
  private loadDisciples(): void {
    this.disciplesLoading = true;

    this.subordinatesFacade.getDisciplesStatus().pipe(
      takeUntil(this.destroy$),
      catchError(err => {
        console.error('[Dashboard] Error loading disciples:', err);
        return of([]);
      })
    ).subscribe(disciples => {
      this.disciples = this.sortDisciples(disciples);
      this.calculateDisciplesStats();
      this.disciplesLoading = false;
      this.forceUIUpdate();
    });
  }

  /**
   * Trie les disciples: alertes en premier, puis par taux de régularité
   */
  private sortDisciples(disciples: DiscipleWithCRStatus[]): DiscipleWithCRStatus[] {
    return [...disciples].sort((a, b) => {
      // Alertes critiques en premier
      if (a.niveauAlerte === 'CRITICAL' && b.niveauAlerte !== 'CRITICAL') return -1;
      if (b.niveauAlerte === 'CRITICAL' && a.niveauAlerte !== 'CRITICAL') return 1;

      // Puis alertes warning
      if (a.niveauAlerte === 'WARNING' && b.niveauAlerte === 'NONE') return -1;
      if (b.niveauAlerte === 'WARNING' && a.niveauAlerte === 'NONE') return 1;

      // Ensuite par taux de régularité (les plus bas en premier pour attention)
      return (a.tauxRegularite30j || 0) - (b.tauxRegularite30j || 0);
    });
  }

  /**
   * Calcule les statistiques des disciples
   */
  private calculateDisciplesStats(): void {
    this.disciplesWithAlert = this.disciples.filter(d => d.alerte).length;
    this.disciplesWithCRToday = this.disciples.filter(d => d.crAujourdhui).length;
  }

  /**
   * Retourne les initiales d'un nom
   */
  getInitials(prenom: string, nom: string): string {
    const firstInitial = prenom?.charAt(0)?.toUpperCase() || '';
    const lastInitial = nom?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  }

  /**
   * Bascule l'affichage de tous les disciples
   */
  toggleShowAllDisciples(): void {
    this.showAllDisciples = !this.showAllDisciples;
  }
}
