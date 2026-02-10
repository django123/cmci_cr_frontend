import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { AuthGuard } from './infrastructure/auth/auth.guard';
import { Role } from './domain/enums';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      // Comptes Rendus
      {
        path: 'compte-rendu',
        children: [
          {
            path: '',
            loadComponent: () => import('./presentation/pages/compte-rendu/compte-rendu-list/compte-rendu-list.component')
              .then(m => m.CompteRenduListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./presentation/pages/compte-rendu/compte-rendu-form/compte-rendu-form.component')
              .then(m => m.CompteRenduFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./presentation/pages/compte-rendu/compte-rendu-detail/compte-rendu-detail.component')
              .then(m => m.CompteRenduDetailComponent)
          },
          {
            path: ':id/edit',
            loadComponent: () => import('./presentation/pages/compte-rendu/compte-rendu-form/compte-rendu-form.component')
              .then(m => m.CompteRenduFormComponent)
          }
        ]
      },
      // Statistiques
      {
        path: 'statistics',
        loadComponent: () => import('./presentation/pages/statistics/statistics.component')
          .then(m => m.StatisticsComponent)
      },
      // Validation (FD, Leaders, Pasteurs, Admin)
      {
        path: 'validation',
        loadComponent: () => import('./presentation/pages/validation/validation.component')
          .then(m => m.ValidationComponent),
        data: { roles: [Role.FD, Role.LEADER, Role.PASTEUR, Role.ADMIN] }
      },
      // Administration des utilisateurs (Pasteur, Admin)
      {
        path: 'users',
        loadComponent: () => import('./presentation/pages/user-admin/user-admin.component')
          .then(m => m.UserAdminComponent),
        data: { roles: [Role.PASTEUR, Role.ADMIN] }
      },
      // Administration hierarchie ecclesiale (Pasteur, Admin)
      {
        path: 'administration',
        loadComponent: () => import('./presentation/pages/administration/administration.component')
          .then(m => m.AdministrationComponent),
        data: { roles: [Role.PASTEUR, Role.ADMIN] }
      },
      // Gestion des disciples (FD, Leader, Pasteur, Admin)
      {
        path: 'disciples',
        loadComponent: () => import('./presentation/pages/disciples/disciples.component')
          .then(m => m.DisciplesComponent),
        data: { roles: [Role.FD, Role.LEADER, Role.PASTEUR, Role.ADMIN] }
      },
      // Profil utilisateur
      {
        path: 'profile',
        loadComponent: () => import('./presentation/pages/profile/profile.component')
          .then(m => m.ProfileComponent)
      },
      // Paramètres
      {
        path: 'settings',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      }
    ]
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login.component')
          .then(m => m.LoginComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
