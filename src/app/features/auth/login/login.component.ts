import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { RippleModule } from 'primeng/ripple';
import { DividerModule } from 'primeng/divider';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CheckboxModule,
    RippleModule,
    DividerModule
  ],
  template: `
    <div class="login-container">
      <div class="login-left">
        <div class="brand-section">
          <div class="logo">
            <div class="logo-icon">
              <i class="pi pi-building"></i>
            </div>
            <span class="logo-text">CMCI CR</span>
          </div>
          <h1>Bienvenue</h1>
          <p>Connectez-vous pour accéder à votre espace de compte rendu.</p>
        </div>
       <!-- <div class="features-preview">
          <div class="feature-item">
            <i class="pi pi-microphone"></i>
            <span>Transcription automatique</span>
          </div>
          <div class="feature-item">
            <i class="pi pi-sparkles"></i>
            <span>Analyse IA avancée</span>
          </div>
          <div class="feature-item">
            <i class="pi pi-share-alt"></i>
            <span>Partage collaboratif</span>
          </div>
        </div>-->
      </div>

      <div class="login-right">
        <div class="login-form-container">
          <h2>Connexion</h2>
          <p class="subtitle">Entrez vos identifiants pour continuer</p>

          <form (ngSubmit)="onLogin()" class="login-form">
            <div class="form-field">
              <label for="email">Email</label>
              <input
                id="email"
                type="email"
                pInputText
                [(ngModel)]="email"
                name="email"
                placeholder="votre@email.com" />
            </div>

            <div class="form-field">
              <label for="password">Mot de passe</label>
              <p-password
                id="password"
                [(ngModel)]="password"
                name="password"
                [toggleMask]="true"
                [feedback]="false"
                placeholder="••••••••"
                styleClass="password-input">
              </p-password>
            </div>

            <div class="form-options">
              <p-checkbox
                [(ngModel)]="rememberMe"
                name="rememberMe"
                [binary]="true"
                label="Se souvenir de moi">
              </p-checkbox>
              <a href="#" class="forgot-link">Mot de passe oublié ?</a>
            </div>

            <button
              type="submit"
              class="login-btn"
              pRipple
              [disabled]="isLoading">
              @if (isLoading) {
                <i class="pi pi-spin pi-spinner"></i>
              } @else {
                <span>Se connecter</span>
                <i class="pi pi-arrow-right"></i>
              }
            </button>
          </form>

          <p-divider align="center">
            <span class="divider-text">ou continuer avec</span>
          </p-divider>

          <div class="social-login">
            <button class="social-btn google" pRipple (click)="onSocialLogin('google')">
              <i class="pi pi-google"></i>
              <span>Google</span>
            </button>
            <button class="social-btn microsoft" pRipple (click)="onSocialLogin('microsoft')">
              <i class="pi pi-microsoft"></i>
              <span>Microsoft</span>
            </button>
          </div>

          <p class="signup-link">
            Pas encore de compte ?
            <a href="#">Créer un compte</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      min-height: 100vh;
    }

    .login-left {
      flex: 1;
      background: linear-gradient(135deg, #1a1f2e 0%, #141824 100%);
      padding: 3rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
      }

      &::after {
        content: '';
        position: absolute;
        bottom: -30%;
        left: -30%;
        width: 80%;
        height: 80%;
        background: radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%);
      }
    }

    .brand-section {
      position: relative;
      z-index: 1;
      max-width: 500px;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2.5rem;
    }

    .logo-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
    }

    .logo-text {
      font-size: 1.75rem;
      font-weight: 700;
      color: white;
      letter-spacing: 0.5px;
    }

    .brand-section h1 {
      font-size: 3rem;
      font-weight: 700;
      color: white;
      margin: 0 0 1rem;
      line-height: 1.2;
    }

    .brand-section p {
      font-size: 1.125rem;
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.6;
      margin: 0;
    }

    .features-preview {
      position: relative;
      z-index: 1;
      margin-top: 3rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: white;
      transition: all 0.3s;

      i {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
        border-radius: 10px;
        font-size: 1.125rem;
      }

      span {
        font-size: 1rem;
        font-weight: 500;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        transform: translateX(8px);
      }
    }

    .login-right {
      flex: 1;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .login-form-container {
      width: 100%;
      max-width: 420px;
    }

    .login-form-container h2 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 0.5rem;
    }

    .subtitle {
      color: #6b7280;
      margin: 0 0 2rem;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      label {
        font-size: 0.875rem;
        font-weight: 500;
        color: #374151;
      }

      input {
        padding: 0.875rem 1rem;
        border-radius: 10px;
        border: 1px solid #e5e7eb;
        font-size: 1rem;
        transition: all 0.2s;

        &:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }
      }
    }

    ::ng-deep .password-input {
      width: 100%;

      .p-password-input {
        width: 100%;
        padding: 0.875rem 1rem;
        border-radius: 10px;
      }
    }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .forgot-link {
      color: #6366f1;
      text-decoration: none;
      font-size: 0.875rem;

      &:hover {
        text-decoration: underline;
      }
    }

    .login-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      margin-top: 0.5rem;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }

    ::ng-deep .p-divider {
      margin: 1.5rem 0;

      .p-divider-content {
        background: white;
        padding: 0 1rem;
      }
    }

    .divider-text {
      color: #9ca3af;
      font-size: 0.875rem;
    }

    .social-login {
      display: flex;
      gap: 1rem;
    }

    .social-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem;
      border-radius: 10px;
      border: 1px solid #e5e7eb;
      background: white;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #f9fafb;
        border-color: #d1d5db;
      }

      &.google {
        color: #ea4335;
      }

      &.microsoft {
        color: #00a4ef;
      }
    }

    .signup-link {
      text-align: center;
      margin-top: 1.5rem;
      color: #6b7280;

      a {
        color: #6366f1;
        text-decoration: none;
        font-weight: 500;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    @media (max-width: 1024px) {
      .login-left {
        display: none;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  private readonly keycloak = inject(KeycloakService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  rememberMe = false;
  isLoading = false;

  ngOnInit(): void {
    // Si déjà connecté, rediriger vers le dashboard
    if (this.keycloak.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onLogin(): void {
    this.isLoading = true;
    // Rediriger vers Keycloak pour l'authentification
    this.keycloak.login({
      redirectUri: window.location.origin + '/dashboard'
    });
  }

  onSocialLogin(provider: 'google' | 'microsoft'): void {
    this.isLoading = true;
    // Keycloak peut être configuré pour utiliser des identity providers (Google, Microsoft)
    this.keycloak.login({
      redirectUri: window.location.origin + '/dashboard',
      idpHint: provider
    });
  }
}
