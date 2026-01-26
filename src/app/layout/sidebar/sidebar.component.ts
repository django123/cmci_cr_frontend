import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  badge?: string;
  badgeSeverity?: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';
  separator?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    RippleModule,
    TooltipModule,
    AvatarModule,
    BadgeModule
  ],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <!-- Logo Section -->
      <div class="sidebar-header">
        <div class="logo-container">
          <div class="logo-icon">
            <i class="pi pi-building"></i>
          </div>
          <span class="logo-text" *ngIf="!collapsed">CMCI CR</span>
        </div>
        <button
          class="collapse-btn"
          (click)="toggleCollapse()"
          [pTooltip]="collapsed ? 'Expand' : 'Collapse'"
          tooltipPosition="right">
          <i class="pi" [ngClass]="collapsed ? 'pi-angle-right' : 'pi-angle-left'"></i>
        </button>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav">
        <div class="nav-section">
          <span class="nav-section-title" *ngIf="!collapsed">MAIN MENU</span>
          <ul class="nav-list">
            @for (item of mainMenuItems; track item.label) {
              @if (item.separator) {
                <li class="nav-separator"></li>
              } @else {
                <li class="nav-item">
                  <a
                    [routerLink]="item.route"
                    routerLinkActive="active"
                    class="nav-link"
                    [pTooltip]="collapsed ? item.label : ''"
                    tooltipPosition="right"
                    pRipple>
                    <i class="pi" [ngClass]="item.icon"></i>
                    <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
                    @if (item.badge && !collapsed) {
                      <span class="nav-badge" [attr.data-severity]="item.badgeSeverity || 'info'">
                        {{ item.badge }}
                      </span>
                    }
                  </a>
                </li>
              }
            }
          </ul>
        </div>

        <div class="nav-section">
          <span class="nav-section-title" *ngIf="!collapsed">GESTION</span>
          <ul class="nav-list">
            @for (item of managementItems; track item.label) {
              <li class="nav-item">
                <a
                  [routerLink]="item.route"
                  routerLinkActive="active"
                  class="nav-link"
                  [pTooltip]="collapsed ? item.label : ''"
                  tooltipPosition="right"
                  pRipple>
                  <i class="pi" [ngClass]="item.icon"></i>
                  <span class="nav-label" *ngIf="!collapsed">{{ item.label }}</span>
                </a>
              </li>
            }
          </ul>
        </div>
      </nav>

      <!-- Bottom Section -->
      <div class="sidebar-footer">
        <div class="user-section" *ngIf="!collapsed">
          <p-avatar
            icon="pi pi-user"
            size="large"
            shape="circle"
            styleClass="user-avatar">
          </p-avatar>
          <div class="user-info">
            <span class="user-name">Administrateur</span>
            <span class="user-role">Super Admin</span>
          </div>
        </div>
        <a
          routerLink="/settings"
          class="nav-link settings-link"
          [pTooltip]="collapsed ? 'Paramètres' : ''"
          tooltipPosition="right"
          pRipple>
          <i class="pi pi-cog"></i>
          <span class="nav-label" *ngIf="!collapsed">Paramètres</span>
        </a>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      height: 100vh;
      background: linear-gradient(180deg, #1a1f2e 0%, #141824 100%);
      display: flex;
      flex-direction: column;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1000;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      will-change: width;
      transform: translateZ(0); /* Force GPU layer */

      &.collapsed {
        width: 80px;

        .nav-section-title {
          display: none;
        }
      }
    }

    .sidebar-header {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.25rem;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
      letter-spacing: 0.5px;
    }

    .collapse-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover {
        background: rgba(255, 255, 255, 0.15);
        color: white;
      }
    }

    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 1rem 0;

      &::-webkit-scrollbar {
        width: 4px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
      }
    }

    .nav-section {
      margin-bottom: 1.5rem;
    }

    .nav-section-title {
      display: block;
      padding: 0 1.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.7rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.4);
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    .nav-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-item {
      padding: 0 0.75rem;
      margin-bottom: 0.25rem;
    }

    .nav-separator {
      height: 1px;
      background: rgba(255, 255, 255, 0.08);
      margin: 0.75rem 1.5rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      transition: all 0.2s;
      position: relative;
      overflow: hidden;

      i {
        font-size: 1.125rem;
        width: 24px;
        text-align: center;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        color: white;
      }

      &.active {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
        color: white;

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 0 4px 4px 0;
        }
      }
    }

    .nav-label {
      font-size: 0.9rem;
      font-weight: 500;
      white-space: nowrap;
    }

    .nav-badge {
      margin-left: auto;
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.7rem;
      font-weight: 600;

      &[data-severity="info"] {
        background: rgba(59, 130, 246, 0.2);
        color: #60a5fa;
      }

      &[data-severity="success"] {
        background: rgba(34, 197, 94, 0.2);
        color: #4ade80;
      }

      &[data-severity="warn"] {
        background: rgba(245, 158, 11, 0.2);
        color: #fbbf24;
      }

      &[data-severity="danger"] {
        background: rgba(239, 68, 68, 0.2);
        color: #f87171;
      }
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: white;
    }

    .user-role {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.5);
    }

    .settings-link {
      margin-top: 0.5rem;
    }

    ::ng-deep .user-avatar {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
    }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() collapsedChange = new EventEmitter<boolean>();

  mainMenuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi-home', route: '/dashboard' },
    { label: 'Mes CR', icon: 'pi-file-edit', route: '/compte-rendu' },
    { label: 'Statistiques', icon: 'pi-chart-bar', route: '/statistics' }
  ];

  managementItems: MenuItem[] = [
    { label: 'Validation', icon: 'pi-check-square', route: '/validation', badge: 'FD+', badgeSeverity: 'warn' },
    { label: 'Utilisateurs', icon: 'pi-users', route: '/users' }
  ];

  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.collapsedChange.emit(this.collapsed);
  }
}
