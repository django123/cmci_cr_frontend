import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';

import { AuthService } from '../../../infrastructure/auth/auth.service';
import { Utilisateur } from '../../../domain/models';
import { Role } from '../../../domain/enums';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    AvatarModule,
    ButtonModule,
    TagModule,
    DividerModule,
    SkeletonModule
  ],
  template: `
    <div class="profile-container">
      <div class="page-header">
        <div class="header-content">
          <h1>Mon Profil</h1>
          <p>Consultez vos informations personnelles</p>
        </div>
      </div>

      @if (loading) {
        <div class="profile-content">
          <div class="profile-card-skeleton">
            <p-skeleton shape="circle" size="120px"></p-skeleton>
            <p-skeleton width="200px" height="24px"></p-skeleton>
            <p-skeleton width="150px" height="16px"></p-skeleton>
          </div>
        </div>
      } @else if (currentUser) {
        <div class="profile-content">
          <!-- Carte principale du profil -->
          <div class="profile-main-card">
            <div class="profile-header-section">
              <div class="avatar-section">
                <p-avatar
                  [label]="getInitials()"
                  [image]="currentUser.avatarUrl || ''"
                  size="xlarge"
                  shape="circle"
                  styleClass="profile-avatar">
                </p-avatar>
                <div class="online-indicator"></div>
              </div>
              <div class="user-identity">
                <h2>{{ currentUser.prenom }} {{ currentUser.nom }}</h2>
                <p class="user-email">{{ currentUser.email }}</p>
                <p-tag
                  [value]="getRoleLabel(currentUser.role)"
                  [severity]="getRoleSeverity(currentUser.role)"
                  styleClass="role-tag">
                </p-tag>
              </div>
            </div>

            <p-divider></p-divider>

            <!-- Informations détaillées -->
            <div class="profile-details">
              <h3>Informations personnelles</h3>
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-icon">
                    <i class="pi pi-envelope"></i>
                  </div>
                  <div class="detail-content">
                    <span class="detail-label">Email</span>
                    <span class="detail-value">{{ currentUser.email }}</span>
                  </div>
                </div>

                @if (currentUser.telephone) {
                  <div class="detail-item">
                    <div class="detail-icon">
                      <i class="pi pi-phone"></i>
                    </div>
                    <div class="detail-content">
                      <span class="detail-label">Téléphone</span>
                      <span class="detail-value">{{ currentUser.telephone }}</span>
                    </div>
                  </div>
                }

                @if (currentUser.dateNaissance) {
                  <div class="detail-item">
                    <div class="detail-icon">
                      <i class="pi pi-calendar"></i>
                    </div>
                    <div class="detail-content">
                      <span class="detail-label">Date de naissance</span>
                      <span class="detail-value">{{ currentUser.dateNaissance | date:'dd MMMM yyyy' }}</span>
                    </div>
                  </div>
                }

                @if (currentUser.dateBapteme) {
                  <div class="detail-item">
                    <div class="detail-icon">
                      <i class="pi pi-star"></i>
                    </div>
                    <div class="detail-content">
                      <span class="detail-label">Date de baptême</span>
                      <span class="detail-value">{{ currentUser.dateBapteme | date:'dd MMMM yyyy' }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <p-divider></p-divider>

            <!-- Informations église -->
            <div class="profile-details">
              <h3>Informations d'église</h3>
              <div class="details-grid">
                <div class="detail-item">
                  <div class="detail-icon church">
                    <i class="pi pi-building"></i>
                  </div>
                  <div class="detail-content">
                    <span class="detail-label">Rôle</span>
                    <span class="detail-value">{{ getRoleLabel(currentUser.role) }}</span>
                  </div>
                </div>

                @if (currentUser.egliseMaisonId) {
                  <div class="detail-item">
                    <div class="detail-icon church">
                      <i class="pi pi-home"></i>
                    </div>
                    <div class="detail-content">
                      <span class="detail-label">Église Maison</span>
                      <span class="detail-value">ID: {{ currentUser.egliseMaisonId }}</span>
                    </div>
                  </div>
                }

                @if (currentUser.fdId) {
                  <div class="detail-item">
                    <div class="detail-icon church">
                      <i class="pi pi-users"></i>
                    </div>
                    <div class="detail-content">
                      <span class="detail-label">Famille de Disciples</span>
                      <span class="detail-value">ID: {{ currentUser.fdId }}</span>
                    </div>
                  </div>
                }
              </div>
            </div>

            <p-divider></p-divider>

            <!-- Actions -->
            <div class="profile-actions">
              <button
                pButton
                label="Modifier le profil sur Keycloak"
                icon="pi pi-external-link"
                class="p-button-outlined"
                (click)="openKeycloakProfile()">
              </button>
              <button
                pButton
                label="Se déconnecter"
                icon="pi pi-sign-out"
                class="p-button-danger p-button-outlined"
                (click)="onLogout()">
              </button>
            </div>
          </div>
        </div>
      } @else {
        <div class="no-data">
          <i class="pi pi-user"></i>
          <h3>Profil non disponible</h3>
          <p>Impossible de charger vos informations</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
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

    .profile-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .profile-card-skeleton {
      background: white;
      border-radius: 16px;
      padding: 3rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      border: 1px solid #e5e7eb;
    }

    .profile-main-card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
    }

    .profile-header-section {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding-bottom: 1rem;
    }

    .avatar-section {
      position: relative;
    }

    ::ng-deep .profile-avatar {
      width: 120px !important;
      height: 120px !important;
      font-size: 2.5rem !important;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
    }

    .online-indicator {
      position: absolute;
      bottom: 8px;
      right: 8px;
      width: 20px;
      height: 20px;
      background: #22c55e;
      border-radius: 50%;
      border: 3px solid white;
    }

    .user-identity {
      flex: 1;
    }

    .user-identity h2 {
      margin: 0 0 0.5rem;
      font-size: 1.75rem;
      font-weight: 600;
      color: #1f2937;
    }

    .user-email {
      margin: 0 0 1rem;
      color: #6b7280;
      font-size: 1rem;
    }

    ::ng-deep .role-tag {
      font-size: 0.875rem;
      padding: 0.5rem 1rem;
    }

    .profile-details {
      padding: 1rem 0;
    }

    .profile-details h3 {
      margin: 0 0 1.25rem;
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }

    .detail-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 12px;
    }

    .detail-icon {
      width: 44px;
      height: 44px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(99, 102, 241, 0.1);
      color: #6366f1;
      flex-shrink: 0;

      i {
        font-size: 1.125rem;
      }

      &.church {
        background: rgba(139, 92, 246, 0.1);
        color: #8b5cf6;
      }
    }

    .detail-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .detail-label {
      font-size: 0.8rem;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-value {
      font-size: 1rem;
      font-weight: 500;
      color: #1f2937;
    }

    .profile-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 1rem;
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

    @media (max-width: 640px) {
      .profile-header-section {
        flex-direction: column;
        text-align: center;
      }

      .details-grid {
        grid-template-columns: 1fr;
      }

      .profile-actions {
        flex-direction: column;
      }

      .profile-actions button {
        width: 100%;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);

  currentUser: Utilisateur | null = null;
  loading = true;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.loading = false;
    });

    // Charger l'utilisateur si pas déjà chargé
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement profil:', err);
        this.loading = false;
      }
    });
  }

  getInitials(): string {
    if (!this.currentUser) return '';
    const prenom = this.currentUser.prenom?.charAt(0) || '';
    const nom = this.currentUser.nom?.charAt(0) || '';
    return (prenom + nom).toUpperCase();
  }

  getRoleLabel(role: Role): string {
    const labels: Record<Role, string> = {
      [Role.ADMIN]: 'Administrateur',
      [Role.PASTEUR]: 'Pasteur',
      [Role.LEADER]: 'Leader',
      [Role.FD]: 'Famille de Disciples',
      [Role.FIDELE]: 'Fidèle'
    };
    return labels[role] || role;
  }

  getRoleSeverity(role: Role): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const severities: Record<Role, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      [Role.ADMIN]: 'danger',
      [Role.PASTEUR]: 'warn',
      [Role.LEADER]: 'info',
      [Role.FD]: 'success',
      [Role.FIDELE]: 'secondary'
    };
    return severities[role] || 'secondary';
  }

  openKeycloakProfile(): void {
    // Ouvrir le profil Keycloak dans un nouvel onglet
    const keycloakUrl = (window as any).__env?.keycloakUrl || 'http://localhost:8080';
    const realm = (window as any).__env?.keycloakRealm || 'cmci';
    window.open(`${keycloakUrl}/realms/${realm}/account`, '_blank');
  }

  onLogout(): void {
    this.authService.logout();
  }
}
