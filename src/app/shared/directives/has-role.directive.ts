import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';
import { AuthService } from '../../infrastructure/auth/auth.service';

/**
 * Directive structurelle RBAC : affiche l'élément uniquement si l'utilisateur
 * possède au moins un des rôles requis. Fonctionne comme *ngIf.
 *
 * Usage : *appHasRole="['FD', 'LEADER', 'PASTEUR', 'ADMIN']"
 *         *appHasRole="'ADMIN'"
 */
@Directive({
  selector: '[appHasRole]',
  standalone: true
})
export class HasRoleDirective {
  private readonly authService = inject(AuthService);
  private readonly templateRef = inject(TemplateRef<unknown>);
  private readonly viewContainer = inject(ViewContainerRef);

  @Input() set appHasRole(roles: string | string[]) {
    const roleArray = Array.isArray(roles) ? roles : [roles];
    this.viewContainer.clear();
    if (this.authService.hasAnyRole(roleArray)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}
