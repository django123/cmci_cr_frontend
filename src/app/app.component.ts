import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule],
  template: '<router-outlet></router-outlet>',
  styles: []
})
export class AppComponent {
  title = 'CMCI CR';
  private readonly translate = inject(TranslateService);

  constructor() {
    this.translate.addLangs(['fr', 'en']);
    this.translate.setDefaultLang('fr');
    const savedLang = localStorage.getItem('app-lang') || 'fr';
    this.translate.use(savedLang);
  }
}
