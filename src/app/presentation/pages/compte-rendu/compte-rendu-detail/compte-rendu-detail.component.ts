import { Component, OnInit, inject } from '@angular/core';
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
    <div class="cr-detail-container">
      @if (loading) {
        <div class="skeleton-header">
          <p-skeleton width="200px" height="30px"></p-skeleton>
          <p-skeleton width="100px" height="30px"></p-skeleton>
        </div>
        <div class="skeleton-content">
          <p-skeleton height="200px"></p-skeleton>
        </div>
      } @else if (compteRendu) {
        <!-- Header -->
        <div class="detail-header">
          <div class="header-left">
            <button
              pButton
              icon="pi pi-arrow-left"
              class="p-button-text"
              (click)="goBack()">
            </button>
            <div class="header-info">
              <h1>Compte Rendu du {{ compteRendu.date | date:'dd MMMM yyyy':'':'fr' }}</h1>
              <p-tag
                [value]="getStatutLabel(compteRendu.statut)"
                [severity]="getStatutSeverity(compteRendu.statut)">
              </p-tag>
            </div>
          </div>
          <div class="header-actions">
            @if (canEdit) {
              <button
                pButton
                label="Modifier"
                icon="pi pi-pencil"
                class="p-button-outlined"
                (click)="editCR()">
              </button>
            }
            @if (canSubmit) {
              <button
                pButton
                label="Soumettre"
                icon="pi pi-send"
                class="p-button-success"
                (click)="submitCR()">
              </button>
            }
            @if (canValidate) {
              <button
                pButton
                label="Valider"
                icon="pi pi-check"
                class="p-button-success"
                (click)="validateCR()">
              </button>
            }
          </div>
        </div>

        <div class="detail-content">
          <!-- Informations principales -->
          <div class="main-content">
            <!-- RDQD -->
            <p-card header="RDQD" styleClass="detail-card">
              <div class="rdqd-display">
                <div class="rdqd-circle" [style.--progress]="getRdqdPercentage() + '%'">
                  <span class="rdqd-value">{{ compteRendu.rdqd }}</span>
                </div>
                <div class="rdqd-info">
                  <span class="rdqd-label">Rendez-vous Quotidien avec Dieu</span>
                  <span class="rdqd-percentage">{{ getRdqdPercentage() }}% accompli</span>
                </div>
              </div>
            </p-card>

            <!-- Prière -->
            <p-card header="Temps de prière" styleClass="detail-card">
              <div class="stats-grid">
                <div class="stat-item">
                  <i class="pi pi-user"></i>
                  <div class="stat-content">
                    <span class="stat-value">{{ compteRendu.priereSeule }}</span>
                    <span class="stat-label">Prière seul(e)</span>
                  </div>
                </div>
                @if (compteRendu.priereCouple) {
                  <div class="stat-item">
                    <i class="pi pi-users"></i>
                    <div class="stat-content">
                      <span class="stat-value">{{ compteRendu.priereCouple }}</span>
                      <span class="stat-label">Prière en couple</span>
                    </div>
                  </div>
                }
                @if (compteRendu.priereAvecEnfants) {
                  <div class="stat-item">
                    <i class="pi pi-heart"></i>
                    <div class="stat-content">
                      <span class="stat-value">{{ compteRendu.priereAvecEnfants }}</span>
                      <span class="stat-label">Avec enfants</span>
                    </div>
                  </div>
                }
                @if (compteRendu.priereAutres) {
                  <div class="stat-item">
                    <i class="pi pi-ellipsis-h"></i>
                    <div class="stat-content">
                      <span class="stat-value">{{ compteRendu.priereAutres }}</span>
                      <span class="stat-label">Autres prières</span>
                    </div>
                  </div>
                }
              </div>
            </p-card>

            <!-- Étude -->
            <p-card header="Étude de la Parole" styleClass="detail-card">
              <div class="stats-grid">
                <div class="stat-item">
                  <i class="pi pi-book"></i>
                  <div class="stat-content">
                    <span class="stat-value">{{ compteRendu.lectureBiblique || 0 }}</span>
                    <span class="stat-label">Chapitres lus</span>
                  </div>
                </div>
                @if (compteRendu.livreBiblique) {
                  <div class="stat-item">
                    <i class="pi pi-bookmark"></i>
                    <div class="stat-content">
                      <span class="stat-value">{{ compteRendu.livreBiblique }}</span>
                      <span class="stat-label">Livre</span>
                    </div>
                  </div>
                }
                @if (compteRendu.litteraturePages) {
                  <div class="stat-item">
                    <i class="pi pi-file"></i>
                    <div class="stat-content">
                      <span class="stat-value">{{ compteRendu.litteraturePages }}/{{ compteRendu.litteratureTotal || '?' }}</span>
                      <span class="stat-label">Pages littérature</span>
                    </div>
                  </div>
                }
              </div>
            </p-card>

            <!-- Pratiques -->
            <p-card header="Pratiques spirituelles" styleClass="detail-card">
              <div class="practices-grid">
                <div class="practice-item" [class.active]="compteRendu.confession">
                  <i class="pi" [ngClass]="compteRendu.confession ? 'pi-check-circle' : 'pi-times-circle'"></i>
                  <span>Confession</span>
                </div>
                <div class="practice-item" [class.active]="compteRendu.jeune">
                  <i class="pi" [ngClass]="compteRendu.jeune ? 'pi-check-circle' : 'pi-times-circle'"></i>
                  <span>Jeûne</span>
                </div>
                <div class="practice-item" [class.active]="compteRendu.offrande">
                  <i class="pi" [ngClass]="compteRendu.offrande ? 'pi-check-circle' : 'pi-times-circle'"></i>
                  <span>Offrande</span>
                </div>
                @if (compteRendu.evangelisation) {
                  <div class="practice-item active">
                    <span class="evangelisation-count">{{ compteRendu.evangelisation }}</span>
                    <span>Évangélisation(s)</span>
                  </div>
                }
              </div>
            </p-card>

            <!-- Notes -->
            @if (compteRendu.notes) {
              <p-card header="Notes" styleClass="detail-card">
                <p class="notes-content">{{ compteRendu.notes }}</p>
              </p-card>
            }
          </div>

          <!-- Sidebar - Commentaires -->
          <div class="sidebar-content">
            <p-card header="Commentaires" styleClass="comments-card">
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
                        <span class="comment-date">{{ comment.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                      </div>
                      <p class="comment-text">{{ comment.contenu }}</p>
                    </div>
                  </div>
                } @empty {
                  <div class="no-comments">
                    <i class="pi pi-comments"></i>
                    <p>Aucun commentaire</p>
                  </div>
                }
              </div>

              @if (canComment) {
                <p-divider></p-divider>
                <div class="add-comment">
                  <textarea
                    pInputTextarea
                    [(ngModel)]="newComment"
                    [rows]="3"
                    placeholder="Ajouter un commentaire..."
                    class="comment-input">
                  </textarea>
                  <button
                    pButton
                    label="Envoyer"
                    icon="pi pi-send"
                    [disabled]="!newComment.trim()"
                    [loading]="sendingComment"
                    (click)="addComment()">
                  </button>
                </div>
              }
            </p-card>

            <!-- Métadonnées -->
            <p-card header="Informations" styleClass="meta-card">
              <div class="meta-list">
                <div class="meta-item">
                  <span class="meta-label">Créé le</span>
                  <span class="meta-value">{{ compteRendu.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Modifié le</span>
                  <span class="meta-value">{{ compteRendu.updatedAt | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Vu par FD</span>
                  <span class="meta-value">
                    <i class="pi" [ngClass]="compteRendu.vuParFd ? 'pi-check text-green' : 'pi-times text-red'"></i>
                  </span>
                </div>
              </div>
            </p-card>
          </div>
        </div>
      }

      <p-toast></p-toast>
      <p-confirmDialog></p-confirmDialog>
    </div>
  `,
  styles: [`
    .cr-detail-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-info {
      display: flex;
      align-items: center;
      gap: 1rem;

      h1 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #1f2937;
      }
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    .detail-content {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 1.5rem;
    }

    .main-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    ::ng-deep .detail-card {
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

    .rdqd-display {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .rdqd-circle {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: conic-gradient(
        #6366f1 var(--progress),
        #e5e7eb var(--progress)
      );
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        width: 90px;
        height: 90px;
        background: white;
        border-radius: 50%;
      }
    }

    .rdqd-value {
      position: relative;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
    }

    .rdqd-info {
      display: flex;
      flex-direction: column;
    }

    .rdqd-label {
      font-size: 1rem;
      color: #374151;
      font-weight: 500;
    }

    .rdqd-percentage {
      font-size: 0.875rem;
      color: #6b7280;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1.5rem;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 1rem;

      i {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
        color: #6366f1;
      }
    }

    .stat-content {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 600;
      color: #1f2937;
    }

    .stat-label {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .practices-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .practice-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      background: #f3f4f6;
      color: #6b7280;

      &.active {
        background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.2) 100%);
        color: #16a34a;

        i {
          color: #16a34a;
        }
      }
    }

    .evangelisation-count {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #16a34a;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .notes-content {
      color: #374151;
      line-height: 1.6;
      white-space: pre-wrap;
    }

    .sidebar-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    ::ng-deep .comments-card,
    ::ng-deep .meta-card {
      .p-card-header {
        padding: 1rem 1.25rem;
        background: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
        font-weight: 600;
        color: #374151;
        font-size: 0.9rem;
      }

      .p-card-body {
        padding: 1rem 1.25rem;
      }
    }

    .comments-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .comment-item {
      display: flex;
      gap: 0.75rem;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f3f4f6;

      &:last-child {
        border-bottom: none;
      }
    }

    ::ng-deep .comment-avatar {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
      flex-shrink: 0;
    }

    .comment-content {
      flex: 1;
    }

    .comment-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.25rem;
    }

    .comment-author {
      font-weight: 500;
      font-size: 0.875rem;
      color: #1f2937;
    }

    .comment-date {
      font-size: 0.75rem;
      color: #9ca3af;
    }

    .comment-text {
      margin: 0;
      font-size: 0.875rem;
      color: #4b5563;
      line-height: 1.5;
    }

    .no-comments {
      text-align: center;
      padding: 2rem;
      color: #9ca3af;

      i {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }

      p {
        margin: 0;
      }
    }

    .add-comment {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .comment-input {
      width: 100%;
      resize: none;
    }

    .meta-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .meta-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .meta-label {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .meta-value {
      font-size: 0.875rem;
      color: #1f2937;
      font-weight: 500;
    }

    .text-green {
      color: #16a34a;
    }

    .text-red {
      color: #dc2626;
    }

    @media (max-width: 1024px) {
      .detail-content {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CompteRenduDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly crFacade = inject(CompteRenduFacade);
  private readonly commentaireFacade = inject(CommentaireFacade);
  private readonly authService = inject(AuthService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

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
