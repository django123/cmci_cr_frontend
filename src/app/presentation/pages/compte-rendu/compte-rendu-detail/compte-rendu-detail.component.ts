import { Component, OnInit, AfterViewInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { InputTextarea } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SkeletonModule } from 'primeng/skeleton';
import { TimelineModule } from 'primeng/timeline';
import { MessageService, ConfirmationService } from 'primeng/api';

import { CompteRenduFacade, CommentaireFacade } from '../../../../application/use-cases';
import { CompteRendu, Commentaire, getAuteurFullName, getAuteurInitials } from '../../../../domain/models';
import { StatutCR, StatutCRLabels } from '../../../../domain/enums';
import { AuthService } from '../../../../infrastructure/auth';

@Component({
  selector: 'app-compte-rendu-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    DividerModule,
    AvatarModule,
    InputTextarea,
    ToastModule,
    ConfirmDialogModule,
    SkeletonModule,
    TimelineModule
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <div class="cr-detail-page">
      @if (loading) {
        <div class="loading-container">
          <div class="skeleton-header">
            <p-skeleton width="60px" height="60px" shape="circle"></p-skeleton>
            <div class="skeleton-text">
              <p-skeleton width="300px" height="24px"></p-skeleton>
              <p-skeleton width="200px" height="16px"></p-skeleton>
            </div>
          </div>
          <div class="skeleton-cards">
            <p-skeleton height="200px" borderRadius="16px"></p-skeleton>
            <p-skeleton height="200px" borderRadius="16px"></p-skeleton>
          </div>
        </div>
      } @else if (compteRendu) {
        <!-- Hero Header -->
        <div class="detail-hero">
          <div class="hero-background"></div>
          <div class="hero-content">
            <button
              pButton
              icon="pi pi-arrow-left"
              class="btn-back"
              (click)="goBack()">
            </button>

            <div class="hero-main">
              <div class="hero-icon">
                <i class="pi pi-calendar"></i>
              </div>
              <div class="hero-info">
                <div class="hero-title-row">
                  <h1>Compte Rendu Spirituel</h1>
                  <p-tag
                    [value]="getStatutLabel(compteRendu.statut)"
                    [severity]="getStatutSeverity(compteRendu.statut)"
                    styleClass="status-tag">
                  </p-tag>
                </div>
                <p class="hero-date">
                  <i class="pi pi-calendar-plus"></i>
                  {{ compteRendu.date | date:'EEEE dd MMMM yyyy':'':'fr' }}
                </p>
              </div>
            </div>

            <div class="hero-actions">
              @if (canEdit) {
                <button
                  pButton
                  label="Modifier"
                  icon="pi pi-pencil"
                  class="btn-edit"
                  (click)="editCR()">
                </button>
              }
              @if (canSubmit) {
                <button
                  pButton
                  label="Soumettre"
                  icon="pi pi-send"
                  class="btn-submit"
                  (click)="submitCR()">
                </button>
              }
              @if (canValidate) {
                <button
                  pButton
                  label="Valider"
                  icon="pi pi-check-circle"
                  class="btn-validate"
                  (click)="validateCR()">
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Meta Bar -->
        <div class="meta-bar">
          <div class="meta-bar-item">
            <i class="pi pi-clock"></i>
            <div class="meta-bar-content">
              <span class="meta-bar-label">Créé le</span>
              <span class="meta-bar-value">{{ compteRendu.createdAt | date:'dd/MM/yyyy à HH:mm' }}</span>
            </div>
          </div>
          <div class="meta-bar-divider"></div>
          <div class="meta-bar-item">
            <i class="pi pi-refresh"></i>
            <div class="meta-bar-content">
              <span class="meta-bar-label">Modifié le</span>
              <span class="meta-bar-value">{{ compteRendu.updatedAt | date:'dd/MM/yyyy à HH:mm' }}</span>
            </div>
          </div>
          <div class="meta-bar-divider"></div>
          <div class="meta-bar-item">
            <i class="pi pi-eye" [class.active]="compteRendu.vuParFd"></i>
            <div class="meta-bar-content">
              <span class="meta-bar-label">Vu par FD</span>
              <span class="meta-bar-value" [class.text-success]="compteRendu.vuParFd" [class.text-muted]="!compteRendu.vuParFd">
                {{ compteRendu.vuParFd ? 'Oui' : 'Non' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="detail-content">
          <div class="main-content">
            <!-- RDQD Card -->
            <div class="content-card rdqd-card">
              <div class="card-header-custom">
                <div class="card-icon rdqd-icon">
                  <i class="pi pi-heart-fill"></i>
                </div>
                <div class="card-title-group">
                  <h2>Rendez-vous Quotidien avec Dieu</h2>
                  <p>Votre temps de communion quotidien</p>
                </div>
              </div>
              <div class="card-body-custom">
                <div class="rdqd-display">
                  <div class="rdqd-progress-ring" [style.--progress]="getRdqdPercentage()">
                    <svg viewBox="0 0 100 100">
                      <circle class="progress-bg" cx="50" cy="50" r="45"></circle>
                      <circle class="progress-fill" cx="50" cy="50" r="45"
                        [style.stroke-dasharray]="283"
                        [style.stroke-dashoffset]="283 - (283 * getRdqdPercentage() / 100)">
                      </circle>
                    </svg>
                    <div class="rdqd-center">
                      <span class="rdqd-value">{{ compteRendu.rdqd }}</span>
                      <span class="rdqd-unit">jours</span>
                    </div>
                  </div>
                  <div class="rdqd-details">
                    <div class="rdqd-stat">
                      <span class="rdqd-stat-value">{{ getRdqdPercentage() }}%</span>
                      <span class="rdqd-stat-label">Taux d'accomplissement</span>
                    </div>
                    <div class="rdqd-message" [class.excellent]="getRdqdPercentage() >= 80" [class.good]="getRdqdPercentage() >= 50 && getRdqdPercentage() < 80" [class.needs-improvement]="getRdqdPercentage() < 50">
                      @if (getRdqdPercentage() >= 80) {
                        <i class="pi pi-star-fill"></i>
                        <span>Excellent ! Continuez ainsi !</span>
                      } @else if (getRdqdPercentage() >= 50) {
                        <i class="pi pi-thumbs-up"></i>
                        <span>Bon travail, persévérez !</span>
                      } @else {
                        <i class="pi pi-heart"></i>
                        <span>Chaque effort compte !</span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="stats-row">
              <!-- Prière Card -->
              <div class="content-card">
                <div class="card-header-custom">
                  <div class="card-icon prayer-icon">
                    <i class="pi pi-clock"></i>
                  </div>
                  <div class="card-title-group">
                    <h2>Temps de prière</h2>
                    <p>Vos moments de prière</p>
                  </div>
                </div>
                <div class="card-body-custom">
                  <div class="stat-items">
                    <div class="stat-item-modern">
                      <div class="stat-icon-box blue">
                        <i class="pi pi-user"></i>
                      </div>
                      <div class="stat-info">
                        <span class="stat-value-large">{{ compteRendu.priereSeule || '00:00' }}</span>
                        <span class="stat-label-small">Prière seul(e)</span>
                      </div>
                    </div>
                    @if (compteRendu.priereCouple) {
                      <div class="stat-item-modern">
                        <div class="stat-icon-box purple">
                          <i class="pi pi-users"></i>
                        </div>
                        <div class="stat-info">
                          <span class="stat-value-large">{{ compteRendu.priereCouple }}</span>
                          <span class="stat-label-small">En couple</span>
                        </div>
                      </div>
                    }
                    @if (compteRendu.priereAvecEnfants) {
                      <div class="stat-item-modern">
                        <div class="stat-icon-box pink">
                          <i class="pi pi-heart"></i>
                        </div>
                        <div class="stat-info">
                          <span class="stat-value-large">{{ compteRendu.priereAvecEnfants }}</span>
                          <span class="stat-label-small">Avec enfants</span>
                        </div>
                      </div>
                    }
                    @if (compteRendu.priereAutres) {
                      <div class="stat-item-modern">
                        <div class="stat-icon-box gray">
                          <i class="pi pi-ellipsis-h"></i>
                        </div>
                        <div class="stat-info">
                          <span class="stat-value-large">{{ compteRendu.priereAutres }}x</span>
                          <span class="stat-label-small">Autres prières</span>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>

              <!-- Étude Card -->
              <div class="content-card">
                <div class="card-header-custom">
                  <div class="card-icon study-icon">
                    <i class="pi pi-book"></i>
                  </div>
                  <div class="card-title-group">
                    <h2>Étude de la Parole</h2>
                    <p>Votre lecture biblique</p>
                  </div>
                </div>
                <div class="card-body-custom">
                  <div class="stat-items">
                    <div class="stat-item-modern">
                      <div class="stat-icon-box green">
                        <i class="pi pi-book"></i>
                      </div>
                      <div class="stat-info">
                        <span class="stat-value-large">{{ compteRendu.lectureBiblique || 0 }}</span>
                        <span class="stat-label-small">Chapitres lus</span>
                      </div>
                    </div>
                    @if (compteRendu.livreBiblique) {
                      <div class="stat-item-modern">
                        <div class="stat-icon-box teal">
                          <i class="pi pi-bookmark"></i>
                        </div>
                        <div class="stat-info">
                          <span class="stat-value-large text-book">{{ compteRendu.livreBiblique }}</span>
                          <span class="stat-label-small">Livre de la Bible</span>
                        </div>
                      </div>
                    }
                    @if (compteRendu.litteraturePages) {
                      <div class="stat-item-modern">
                        <div class="stat-icon-box orange">
                          <i class="pi pi-file"></i>
                        </div>
                        <div class="stat-info">
                          <span class="stat-value-large">{{ compteRendu.litteraturePages }}<span class="stat-total">/{{ compteRendu.litteratureTotal || '?' }}</span></span>
                          <span class="stat-label-small">Pages littérature</span>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Pratiques spirituelles -->
            <div class="content-card practices-card">
              <div class="card-header-custom">
                <div class="card-icon practices-icon">
                  <i class="pi pi-star"></i>
                </div>
                <div class="card-title-group">
                  <h2>Pratiques spirituelles</h2>
                  <p>Vos engagements du jour</p>
                </div>
              </div>
              <div class="card-body-custom">
                <div class="practices-grid">
                  <div class="practice-card" [class.active]="compteRendu.confession" [class.inactive]="!compteRendu.confession">
                    <div class="practice-icon-wrapper">
                      <i class="pi" [ngClass]="compteRendu.confession ? 'pi-check' : 'pi-times'"></i>
                    </div>
                    <span class="practice-label">Confession</span>
                    <span class="practice-status">{{ compteRendu.confession ? 'Fait' : 'Non fait' }}</span>
                  </div>

                  <div class="practice-card" [class.active]="compteRendu.jeune" [class.inactive]="!compteRendu.jeune">
                    <div class="practice-icon-wrapper">
                      <i class="pi" [ngClass]="compteRendu.jeune ? 'pi-check' : 'pi-times'"></i>
                    </div>
                    <span class="practice-label">Jeûne</span>
                    <span class="practice-status">{{ compteRendu.jeune ? (compteRendu.typeJeune || 'Fait') : 'Non fait' }}</span>
                  </div>

                  <div class="practice-card" [class.active]="compteRendu.offrande" [class.inactive]="!compteRendu.offrande">
                    <div class="practice-icon-wrapper">
                      <i class="pi" [ngClass]="compteRendu.offrande ? 'pi-check' : 'pi-times'"></i>
                    </div>
                    <span class="practice-label">Offrande</span>
                    <span class="practice-status">{{ compteRendu.offrande ? 'Fait' : 'Non fait' }}</span>
                  </div>

                  <div class="practice-card evangelisation" [class.active]="compteRendu.evangelisation && compteRendu.evangelisation > 0" [class.inactive]="!compteRendu.evangelisation || compteRendu.evangelisation === 0">
                    <div class="practice-icon-wrapper">
                      @if (compteRendu.evangelisation && compteRendu.evangelisation > 0) {
                        <span class="evangelisation-number">{{ compteRendu.evangelisation }}</span>
                      } @else {
                        <i class="pi pi-times"></i>
                      }
                    </div>
                    <span class="practice-label">Évangélisation</span>
                    <span class="practice-status">{{ compteRendu.evangelisation ? compteRendu.evangelisation + ' personne(s)' : 'Non fait' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notes -->
            @if (compteRendu.notes) {
              <div class="content-card notes-card">
                <div class="card-header-custom">
                  <div class="card-icon notes-icon">
                    <i class="pi pi-pencil"></i>
                  </div>
                  <div class="card-title-group">
                    <h2>Notes personnelles</h2>
                    <p>Vos réflexions et prières</p>
                  </div>
                </div>
                <div class="card-body-custom">
                  <p class="notes-text">{{ compteRendu.notes }}</p>
                </div>
              </div>
            }
          </div>

          <!-- Sidebar -->
          <div class="sidebar-content">
            <!-- Commentaires -->
            <div class="content-card comments-card">
              <div class="card-header-custom compact">
                <div class="card-icon comments-icon">
                  <i class="pi pi-comments"></i>
                </div>
                <h3>Commentaires</h3>
                <span class="comment-count">{{ commentaires.length }}</span>
              </div>
              <div class="card-body-custom">
                <div class="comments-list">
                  @for (comment of commentaires; track comment.id) {
                    <div class="comment-item">
                      <p-avatar
                        [label]="getInitials(comment)"
                        shape="circle"
                        styleClass="comment-avatar">
                      </p-avatar>
                      <div class="comment-content">
                        <div class="comment-header">
                          <span class="comment-author">{{ getFullName(comment) }}</span>
                          <span class="comment-date">{{ comment.createdAt | date:'dd/MM HH:mm' }}</span>
                        </div>
                        <p class="comment-text">{{ comment.contenu }}</p>
                      </div>
                    </div>
                  } @empty {
                    <div class="no-comments">
                      <div class="no-comments-icon">
                        <i class="pi pi-comments"></i>
                      </div>
                      <p>Aucun commentaire</p>
                      <span>Soyez le premier à commenter</span>
                    </div>
                  }
                </div>

                @if (canComment) {
                  <div class="add-comment">
                    <textarea
                      pInputTextarea
                      [(ngModel)]="newComment"
                      [rows]="2"
                      placeholder="Écrire un commentaire..."
                      class="comment-input">
                    </textarea>
                    <button
                      pButton
                      icon="pi pi-send"
                      class="btn-send-comment"
                      [disabled]="!newComment.trim()"
                      [loading]="sendingComment"
                      (click)="addComment()">
                    </button>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      }

      <p-toast position="top-right"></p-toast>
      <p-confirmDialog></p-confirmDialog>
    </div>
  `,
  styles: [`
    .cr-detail-page {
      min-height: 100vh;
      background: #f8fafc;
    }

    /* Loading State */
    .loading-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .skeleton-header {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .skeleton-text {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .skeleton-cards {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    /* Hero Header */
    .detail-hero {
      position: relative;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
      padding: 1.5rem 2rem 2rem;
      overflow: hidden;
    }

    .hero-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      opacity: 0.5;
    }

    .hero-content {
      position: relative;
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .btn-back {
      align-self: flex-start;
      background: rgba(255, 255, 255, 0.15) !important;
      border: 1px solid rgba(255, 255, 255, 0.3) !important;
      color: white !important;
      width: 40px;
      height: 40px;
      border-radius: 10px !important;
      backdrop-filter: blur(10px);
      transition: all 0.2s ease;
    }

    .btn-back:hover {
      background: rgba(255, 255, 255, 0.25) !important;
      transform: translateX(-2px);
    }

    .hero-main {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .hero-icon {
      width: 72px;
      height: 72px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.3);

      i {
        font-size: 2rem;
        color: white;
      }
    }

    .hero-info {
      flex: 1;
    }

    .hero-title-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .hero-info h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: white;
      letter-spacing: -0.02em;
    }

    ::ng-deep .status-tag {
      font-size: 0.75rem !important;
      padding: 0.35rem 0.75rem !important;
      border-radius: 20px !important;
    }

    .hero-date {
      margin: 0.5rem 0 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.85);
      font-size: 1rem;

      i {
        font-size: 0.875rem;
      }
    }

    .hero-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .btn-edit {
      background: rgba(255, 255, 255, 0.15) !important;
      border: 1px solid rgba(255, 255, 255, 0.4) !important;
      color: white !important;
      font-weight: 600 !important;
      border-radius: 10px !important;
      backdrop-filter: blur(10px);
    }

    .btn-edit:hover {
      background: rgba(255, 255, 255, 0.25) !important;
    }

    .btn-submit, .btn-validate {
      background: white !important;
      color: #6366f1 !important;
      border: none !important;
      font-weight: 600 !important;
      border-radius: 10px !important;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
    }

    .btn-submit:hover, .btn-validate:hover {
      background: #f8fafc !important;
      transform: translateY(-1px);
    }

    /* Meta Bar */
    .meta-bar {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .meta-bar-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      > i {
        width: 36px;
        height: 36px;
        background: #f1f5f9;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #64748b;
        font-size: 0.9rem;

        &.active {
          background: #dcfce7;
          color: #16a34a;
        }
      }
    }

    .meta-bar-content {
      display: flex;
      flex-direction: column;
    }

    .meta-bar-label {
      font-size: 0.7rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .meta-bar-value {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1e293b;
    }

    .meta-bar-divider {
      width: 1px;
      height: 32px;
      background: #e2e8f0;
    }

    .text-success {
      color: #16a34a !important;
    }

    .text-muted {
      color: #94a3b8 !important;
    }

    /* Main Content */
    .detail-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 1.5rem;
    }

    .main-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Content Cards */
    .content-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.03);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .card-header-custom {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;

      &.compact {
        padding: 1rem 1.25rem;

        h3 {
          flex: 1;
          margin: 0;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #1e293b;
        }
      }
    }

    .card-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;

      i {
        font-size: 1.125rem;
        color: white;
      }
    }

    .rdqd-icon { background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); }
    .prayer-icon { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); }
    .study-icon { background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); }
    .practices-icon { background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); }
    .notes-icon { background: linear-gradient(135deg, #64748b 0%, #475569 100%); }
    .comments-icon { background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); }

    .card-title-group {
      flex: 1;

      h2 {
        margin: 0;
        font-size: 1.0625rem;
        font-weight: 600;
        color: #1e293b;
      }

      p {
        margin: 0.125rem 0 0;
        font-size: 0.8125rem;
        color: #64748b;
      }
    }

    .card-body-custom {
      padding: 1.5rem;
    }

    /* RDQD Card */
    .rdqd-display {
      display: flex;
      align-items: center;
      gap: 2.5rem;
    }

    .rdqd-progress-ring {
      position: relative;
      width: 140px;
      height: 140px;
      flex-shrink: 0;

      svg {
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
      }

      .progress-bg {
        fill: none;
        stroke: #f1f5f9;
        stroke-width: 8;
      }

      .progress-fill {
        fill: none;
        stroke: url(#gradient);
        stroke: #6366f1;
        stroke-width: 8;
        stroke-linecap: round;
        transition: stroke-dashoffset 0.5s ease;
      }
    }

    .rdqd-center {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }

    .rdqd-value {
      display: block;
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1;
    }

    .rdqd-unit {
      display: block;
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.25rem;
    }

    .rdqd-details {
      flex: 1;
    }

    .rdqd-stat {
      margin-bottom: 1rem;
    }

    .rdqd-stat-value {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: #6366f1;
      line-height: 1;
    }

    .rdqd-stat-label {
      font-size: 0.875rem;
      color: #64748b;
    }

    .rdqd-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      font-size: 0.875rem;
      font-weight: 500;

      &.excellent {
        background: #dcfce7;
        color: #16a34a;
      }

      &.good {
        background: #fef3c7;
        color: #d97706;
      }

      &.needs-improvement {
        background: #fce7f3;
        color: #db2777;
      }

      i {
        font-size: 1rem;
      }
    }

    /* Stats Row */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .stat-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .stat-item-modern {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #f1f5f9;
    }

    .stat-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      i {
        font-size: 1.125rem;
        color: white;
      }

      &.blue { background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); }
      &.purple { background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); }
      &.pink { background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); }
      &.gray { background: linear-gradient(135deg, #64748b 0%, #475569 100%); }
      &.green { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
      &.teal { background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); }
      &.orange { background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%); }
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value-large {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
      line-height: 1.2;

      &.text-book {
        font-size: 1rem;
      }
    }

    .stat-total {
      font-size: 0.875rem;
      color: #94a3b8;
      font-weight: 500;
    }

    .stat-label-small {
      font-size: 0.8125rem;
      color: #64748b;
    }

    /* Practices Grid */
    .practices-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }

    .practice-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 1.25rem 1rem;
      border-radius: 16px;
      border: 2px solid transparent;
      transition: all 0.2s ease;

      &.active {
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(16, 185, 129, 0.12) 100%);
        border-color: rgba(34, 197, 94, 0.3);

        .practice-icon-wrapper {
          background: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
          color: white;
        }

        .practice-label {
          color: #16a34a;
        }

        .practice-status {
          color: #15803d;
        }
      }

      &.inactive {
        background: #f8fafc;
        border-color: #e2e8f0;

        .practice-icon-wrapper {
          background: #e2e8f0;
          color: #94a3b8;
        }

        .practice-label {
          color: #64748b;
        }

        .practice-status {
          color: #94a3b8;
        }
      }
    }

    .practice-icon-wrapper {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 0.75rem;

      i {
        font-size: 1.25rem;
      }
    }

    .evangelisation-number {
      font-size: 1.25rem;
      font-weight: 700;
    }

    .practice-label {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .practice-status {
      font-size: 0.75rem;
    }

    /* Notes */
    .notes-text {
      margin: 0;
      color: #475569;
      font-size: 0.9375rem;
      line-height: 1.7;
      white-space: pre-wrap;
    }

    /* Sidebar */
    .sidebar-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .comment-count {
      background: #6366f1;
      color: white;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.625rem;
      border-radius: 20px;
    }

    .comments-list {
      max-height: 350px;
      overflow-y: auto;
    }

    .comment-item {
      display: flex;
      gap: 0.75rem;
      padding: 0.875rem 0;
      border-bottom: 1px solid #f1f5f9;

      &:last-child {
        border-bottom: none;
      }
    }

    ::ng-deep .comment-avatar {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
      width: 36px !important;
      height: 36px !important;
      font-size: 0.75rem !important;
      flex-shrink: 0;
    }

    .comment-content {
      flex: 1;
      min-width: 0;
    }

    .comment-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
    }

    .comment-author {
      font-weight: 600;
      font-size: 0.8125rem;
      color: #1e293b;
    }

    .comment-date {
      font-size: 0.6875rem;
      color: #94a3b8;
    }

    .comment-text {
      margin: 0;
      font-size: 0.8125rem;
      color: #475569;
      line-height: 1.5;
    }

    .no-comments {
      text-align: center;
      padding: 2rem 1rem;

      .no-comments-icon {
        width: 56px;
        height: 56px;
        background: #f1f5f9;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1rem;

        i {
          font-size: 1.5rem;
          color: #94a3b8;
        }
      }

      p {
        margin: 0;
        font-size: 0.9375rem;
        font-weight: 500;
        color: #64748b;
      }

      span {
        font-size: 0.8125rem;
        color: #94a3b8;
      }
    }

    .add-comment {
      display: flex;
      gap: 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
      margin-top: 0.5rem;
    }

    .comment-input {
      flex: 1;
      resize: none;
      border-radius: 12px !important;
      border: 1px solid #e2e8f0 !important;
      font-size: 0.875rem !important;

      &:focus {
        border-color: #6366f1 !important;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
      }
    }

    .btn-send-comment {
      align-self: flex-end;
      width: 44px !important;
      height: 44px !important;
      border-radius: 12px !important;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
      border: none !important;
    }

    .btn-send-comment:disabled {
      background: #e2e8f0 !important;
      color: #94a3b8 !important;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .detail-content {
        grid-template-columns: 1fr;
        padding: 1.5rem;
      }

      .stats-row {
        grid-template-columns: 1fr;
      }

      .practices-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .rdqd-display {
        flex-direction: column;
        text-align: center;
        gap: 1.5rem;
      }

      .rdqd-details {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
    }

    @media (max-width: 768px) {
      .detail-hero {
        padding: 1rem 1rem 1.5rem;
      }

      .hero-main {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .hero-icon {
        width: 56px;
        height: 56px;

        i {
          font-size: 1.5rem;
        }
      }

      .hero-info h1 {
        font-size: 1.375rem;
      }

      .hero-title-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }

      .meta-bar {
        padding: 1rem;
        gap: 1rem;
      }

      .meta-bar-divider {
        display: none;
      }

      .meta-bar-item {
        flex: 1;
        min-width: 100px;
      }

      .detail-content {
        padding: 1rem;
      }

      .card-body-custom {
        padding: 1rem;
      }

      .practices-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
      }

      .practice-card {
        padding: 1rem 0.75rem;
      }
    }

    @media (max-width: 480px) {
      .skeleton-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CompteRenduDetailComponent implements OnInit, AfterViewInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly crFacade = inject(CompteRenduFacade);
  private readonly commentaireFacade = inject(CommentaireFacade);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly cdr = inject(ChangeDetectorRef);

  compteRendu: CompteRendu | null = null;
  commentaires: Commentaire[] = [];
  loading = true;
  newComment = '';
  sendingComment = false;

  canEdit = false;
  canSubmit = false;
  canValidate = false;
  canComment = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCompteRendu(id);
      this.loadCommentaires(id);
    }
  }

  ngAfterViewInit(): void {
    // Force layout recalculation after view is initialized
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
      this.cdr.detectChanges();
    }, 0);
  }

  private loadCompteRendu(id: string): void {
    this.crFacade.getById(id).subscribe({
      next: (cr) => {
        this.compteRendu = cr;
        this.loading = false;
        this.updatePermissions();
      },
      error: () => {
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger le compte rendu'
        });
      }
    });
  }

  private loadCommentaires(crId: string): void {
    this.commentaireFacade.loadByCompteRenduId(crId).subscribe({
      next: (commentaires) => {
        this.commentaires = commentaires;
      }
    });
  }

  private updatePermissions(): void {
    if (!this.compteRendu) return;

    this.canEdit = this.compteRendu.statut === StatutCR.BROUILLON;
    this.canSubmit = this.compteRendu.statut === StatutCR.BROUILLON;
    this.canValidate = this.compteRendu.statut === StatutCR.SOUMIS && this.authService.hasAnyRole(['FD', 'LEADER', 'PASTEUR', 'ADMIN']);
    this.canComment = this.authService.hasAnyRole(['FD', 'LEADER', 'PASTEUR', 'ADMIN']);
  }

  getRdqdPercentage(): number {
    if (!this.compteRendu) return 0;
    const [accompli, attendu] = this.compteRendu.rdqd.split('/').map(Number);
    return attendu > 0 ? Math.round((accompli / attendu) * 100) : 0;
  }

  getStatutLabel(statut: StatutCR): string {
    return StatutCRLabels[statut];
  }

  getStatutSeverity(statut: StatutCR): 'success' | 'info' | 'secondary' {
    const map: Record<StatutCR, 'success' | 'info' | 'secondary'> = {
      [StatutCR.BROUILLON]: 'secondary',
      [StatutCR.SOUMIS]: 'info',
      [StatutCR.VALIDE]: 'success'
    };
    return map[statut];
  }

  getFullName(comment: Commentaire): string {
    return getAuteurFullName(comment);
  }

  getInitials(comment: Commentaire): string {
    return getAuteurInitials(comment);
  }

  editCR(): void {
    if (this.compteRendu) {
      this.router.navigate(['/compte-rendu', this.compteRendu.id, 'edit']);
    }
  }

  submitCR(): void {
    if (!this.compteRendu) return;

    this.confirmationService.confirm({
      message: 'Voulez-vous soumettre ce compte rendu ?',
      accept: () => {
        this.crFacade.submit(this.compteRendu!.id).subscribe({
          next: (cr) => {
            this.compteRendu = cr;
            this.updatePermissions();
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Compte rendu soumis'
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

  validateCR(): void {
    if (!this.compteRendu) return;

    this.crFacade.validate(this.compteRendu.id).subscribe({
      next: (cr) => {
        this.compteRendu = cr;
        this.updatePermissions();
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Compte rendu validé'
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

  addComment(): void {
    if (!this.compteRendu || !this.newComment.trim()) return;

    this.sendingComment = true;
    this.commentaireFacade.add(this.compteRendu.id, { contenu: this.newComment }).subscribe({
      next: (comment) => {
        this.commentaires = [...this.commentaires, comment];
        this.newComment = '';
        this.sendingComment = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Commentaire ajouté'
        });
      },
      error: (err) => {
        this.sendingComment = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: err.message
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/compte-rendu']);
  }
}
