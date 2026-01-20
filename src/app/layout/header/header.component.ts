import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { MenuModule } from 'primeng/menu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { RippleModule } from 'primeng/ripple';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    AvatarModule,
    BadgeModule,
    MenuModule,
    OverlayPanelModule,
    RippleModule,
    IconFieldModule,
    InputIconModule
  ],
  template: `
    <header class="header">
      <div class="header-left">
        <div class="search-container">
          <p-iconfield>
            <p-inputicon styleClass="pi pi-search" />
            <input
              type="text"
              pInputText
              [(ngModel)]="searchQuery"
              placeholder="Rechercher transcriptions, réunions..."
              class="search-input" />
          </p-iconfield>
          <div class="search-shortcut">
            <kbd>⌘</kbd><kbd>K</kbd>
          </div>
        </div>
      </div>

      <div class="header-right">
        <!-- Quick Actions -->
        <div class="quick-actions">
          <button
            class="action-btn primary-action"
            pRipple
            (click)="onNewTranscription()">
            <i class="pi pi-plus"></i>
            <span>Nouvelle transcription</span>
          </button>
        </div>

        <!-- Notifications -->
        <button
          class="icon-btn"
          pRipple
          (click)="notificationPanel.toggle($event)">
          <i class="pi pi-bell"></i>
          <span class="notification-badge">3</span>
        </button>

        <!-- Theme Toggle -->
        <button
          class="icon-btn"
          pRipple
          (click)="toggleTheme()">
          <i class="pi" [ngClass]="isDarkMode ? 'pi-sun' : 'pi-moon'"></i>
        </button>

        <!-- Help -->
        <button class="icon-btn" pRipple>
          <i class="pi pi-question-circle"></i>
        </button>

        <!-- User Menu -->
        <div class="user-menu" (click)="userPanel.toggle($event)">
          <p-avatar
            icon="pi pi-user"
            shape="circle"
            styleClass="user-avatar-header">
          </p-avatar>
          <i class="pi pi-chevron-down"></i>
        </div>
      </div>

      <!-- Notification Panel -->
      <p-overlayPanel #notificationPanel styleClass="notification-panel">
        <div class="panel-header">
          <h4>Notifications</h4>
          <button class="mark-read-btn">Tout marquer comme lu</button>
        </div>
        <div class="notification-list">
          @for (notification of notifications; track notification.id) {
            <div class="notification-item" [class.unread]="!notification.read">
              <div class="notification-icon" [attr.data-type]="notification.type">
                <i class="pi" [ngClass]="notification.icon"></i>
              </div>
              <div class="notification-content">
                <p class="notification-title">{{ notification.title }}</p>
                <p class="notification-time">{{ notification.time }}</p>
              </div>
            </div>
          }
        </div>
        <div class="panel-footer">
          <a href="/notifications">Voir toutes les notifications</a>
        </div>
      </p-overlayPanel>

      <!-- User Panel -->
      <p-overlayPanel #userPanel styleClass="user-panel">
        <div class="user-panel-header">
          <p-avatar
            icon="pi pi-user"
            size="large"
            shape="circle"
            styleClass="user-avatar-large">
          </p-avatar>
          <div class="user-panel-info">
            <span class="user-panel-name">Administrateur</span>
            <span class="user-panel-email">admin&#64;cmci.com</span>
          </div>
        </div>
        <div class="user-panel-menu">
          <a class="user-panel-item" pRipple>
            <i class="pi pi-user"></i>
            <span>Mon profil</span>
          </a>
          <a class="user-panel-item" pRipple>
            <i class="pi pi-cog"></i>
            <span>Paramètres</span>
          </a>
          <a class="user-panel-item" pRipple>
            <i class="pi pi-credit-card"></i>
            <span>Abonnement</span>
          </a>
          <div class="panel-separator"></div>
          <a class="user-panel-item logout" pRipple>
            <i class="pi pi-sign-out"></i>
            <span>Déconnexion</span>
          </a>
        </div>
      </p-overlayPanel>
    </header>
  `,
  styles: [`
    .header {
      height: 70px;
      background: white;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-left {
      flex: 1;
      max-width: 600px;
    }

    .search-container {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-input {
      width: 100%;
      min-width: 350px;
      padding: 0.75rem 1rem 0.75rem 2.75rem;
      border-radius: 12px;
      border: 1px solid #e5e7eb;
      background: #f9fafb;
      font-size: 0.9rem;
      transition: all 0.2s;

      &:focus {
        background: white;
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
      }

      &::placeholder {
        color: #9ca3af;
      }
    }

    .search-shortcut {
      position: absolute;
      right: 12px;
      display: flex;
      gap: 4px;

      kbd {
        padding: 2px 6px;
        border-radius: 4px;
        background: #e5e7eb;
        color: #6b7280;
        font-size: 0.7rem;
        font-family: inherit;
        border: 1px solid #d1d5db;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .quick-actions {
      margin-right: 0.5rem;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.625rem 1rem;
      border-radius: 10px;
      border: none;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &.primary-action {
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
        color: white;
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }
      }
    }

    .icon-btn {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: none;
      background: transparent;
      color: #6b7280;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      i {
        font-size: 1.125rem;
      }

      &:hover {
        background: #f3f4f6;
        color: #374151;
      }
    }

    .notification-badge {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #ef4444;
      color: white;
      font-size: 0.65rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #f3f4f6;
      }

      i {
        font-size: 0.75rem;
        color: #9ca3af;
      }
    }

    ::ng-deep .user-avatar-header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
      width: 36px !important;
      height: 36px !important;
    }

    ::ng-deep .notification-panel,
    ::ng-deep .user-panel {
      border-radius: 16px !important;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
      border: 1px solid #e5e7eb !important;
      overflow: hidden;

      .p-overlaypanel-content {
        padding: 0 !important;
      }
    }

    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      border-bottom: 1px solid #e5e7eb;

      h4 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: #1f2937;
      }
    }

    .mark-read-btn {
      background: none;
      border: none;
      color: #6366f1;
      font-size: 0.8rem;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }

    .notification-list {
      max-height: 320px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 0.875rem;
      padding: 1rem 1.25rem;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #f9fafb;
      }

      &.unread {
        background: rgba(99, 102, 241, 0.05);
      }
    }

    .notification-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;

      &[data-type="success"] {
        background: rgba(34, 197, 94, 0.1);
        color: #22c55e;
      }

      &[data-type="info"] {
        background: rgba(59, 130, 246, 0.1);
        color: #3b82f6;
      }

      &[data-type="warning"] {
        background: rgba(245, 158, 11, 0.1);
        color: #f59e0b;
      }
    }

    .notification-content {
      flex: 1;
    }

    .notification-title {
      margin: 0 0 0.25rem;
      font-size: 0.875rem;
      color: #1f2937;
    }

    .notification-time {
      margin: 0;
      font-size: 0.75rem;
      color: #9ca3af;
    }

    .panel-footer {
      padding: 0.875rem 1.25rem;
      border-top: 1px solid #e5e7eb;
      text-align: center;

      a {
        color: #6366f1;
        font-size: 0.875rem;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .user-panel-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
    }

    ::ng-deep .user-avatar-large {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
    }

    .user-panel-info {
      display: flex;
      flex-direction: column;
    }

    .user-panel-name {
      font-weight: 600;
      color: #1f2937;
    }

    .user-panel-email {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .user-panel-menu {
      padding: 0.5rem;
    }

    .user-panel-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      color: #374151;
      text-decoration: none;
      cursor: pointer;
      transition: background 0.2s;

      i {
        width: 20px;
        color: #6b7280;
      }

      &:hover {
        background: #f3f4f6;
      }

      &.logout {
        color: #ef4444;

        i {
          color: #ef4444;
        }
      }
    }

    .panel-separator {
      height: 1px;
      background: #e5e7eb;
      margin: 0.5rem 0;
    }
  `]
})
export class HeaderComponent {
  @Output() newTranscription = new EventEmitter<void>();

  searchQuery = '';
  isDarkMode = false;

  notifications = [
    {
      id: 1,
      title: 'Transcription terminée avec succès',
      time: 'Il y a 5 minutes',
      icon: 'pi-check-circle',
      type: 'success',
      read: false
    },
    {
      id: 2,
      title: 'Nouvelle mise à jour disponible',
      time: 'Il y a 1 heure',
      icon: 'pi-info-circle',
      type: 'info',
      read: false
    },
    {
      id: 3,
      title: 'Quota mensuel presque atteint',
      time: 'Il y a 2 heures',
      icon: 'pi-exclamation-triangle',
      type: 'warning',
      read: true
    }
  ];

  onNewTranscription(): void {
    this.newTranscription.emit();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }
}
