import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { KeycloakService, KeycloakAngularModule } from 'keycloak-angular';
import Aura from '@primeuix/themes/aura';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localEn from '@angular/common/locales/en';
import { importProvidersFrom } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { initializeKeycloak } from './infrastructure/auth/keycloak-init.factory';
import { AuthInterceptor } from './infrastructure/auth/auth.interceptor';

// Enregistrer les locales
registerLocaleData(localeFr);
registerLocaleData(localEn);

// Repositories (Injection de dépendances - principes SOLID)
import { CompteRenduRepository, CommentaireRepository, StatisticsRepository, AuthRepository, SubordinatesRepository, DiscipleRepository, UserAdminRepository, EgliseMaisonRepository } from './domain/repositories';
import { CompteRenduHttpRepository, CommentaireHttpRepository, StatisticsHttpRepository, SubordinatesHttpRepository, DiscipleHttpRepository, UserAdminHttpRepository, EgliseMaisonHttpRepository } from './infrastructure/repositories';
import { AuthService } from './infrastructure/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: false }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),

    // PrimeNG Configuration
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark-mode',
          cssLayer: {
            name: 'primeng',
            order: 'tailwind-base, primeng, tailwind-utilities'
          }
        }
      },
      ripple: true
    }),

    // Keycloak
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    },

    // HTTP Interceptor pour l'authentification
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },

    // Injection de dépendances - Inversion des dépendances (SOLID - D)
    // Les abstractions (interfaces) dépendent des implémentations concrètes
    { provide: CompteRenduRepository, useClass: CompteRenduHttpRepository },
    { provide: CommentaireRepository, useClass: CommentaireHttpRepository },
    { provide: StatisticsRepository, useClass: StatisticsHttpRepository },
    { provide: SubordinatesRepository, useClass: SubordinatesHttpRepository },
    { provide: DiscipleRepository, useClass: DiscipleHttpRepository },
    { provide: UserAdminRepository, useClass: UserAdminHttpRepository },
    { provide: EgliseMaisonRepository, useClass: EgliseMaisonHttpRepository },
    { provide: AuthRepository, useClass: AuthService },

    // Locale par défaut
    { provide: LOCALE_ID, useValue: 'fr-FR' },

    // ngx-translate
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: 'fr'
      })
    ),
    provideTranslateHttpLoader({
      prefix: './assets/i18n/',
      suffix: '.json'
    })
  ]
};
