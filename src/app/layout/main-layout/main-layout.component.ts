import { Component, AfterViewInit, ChangeDetectorRef, inject, OnDestroy, OnInit, ElementRef, ViewChild, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SidebarComponent,
    HeaderComponent
  ],
  template: `
    <div class="app-layout" [class.sidebar-collapsed]="sidebarCollapsed">
      <app-sidebar
        [collapsed]="sidebarCollapsed"
        (collapsedChange)="onSidebarToggle($event)">
      </app-sidebar>

      <div class="main-container">
        <app-header (newTranscription)="onNewTranscription()"></app-header>

        <main class="main-content" #mainContent>
          <div class="content-wrapper">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background: #f8fafc;
    }

    .main-container {
      flex: 1;
      margin-left: 280px;
      display: flex;
      flex-direction: column;
      min-width: 0;
      height: 100vh;
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sidebar-collapsed .main-container {
      margin-left: 80px;
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      height: calc(100vh - 70px);
      position: relative;
      isolation: isolate;
    }

    .content-wrapper {
      height: 100%;
      width: 100%;
    }

    @media (max-width: 1024px) {
      .main-container {
        margin-left: 80px;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly appRef = inject(ApplicationRef);
  private readonly destroy$ = new Subject<void>();

  @ViewChild('mainContent') mainContent!: ElementRef<HTMLElement>;

  sidebarCollapsed = false;

  ngOnInit(): void {
    // Force tick on navigation start to prepare for new component
    this.router.events.pipe(
      filter(event => event instanceof NavigationStart),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.appRef.tick();
    });

    // Force complete re-render on navigation end
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // Force Angular to detect all changes immediately
      this.cdr.detectChanges();
      this.appRef.tick();

      // Force layout recalculation immediately
      this.forceReflow();

      // Also force after a microtask to catch lazy-loaded content
      Promise.resolve().then(() => {
        this.cdr.detectChanges();
        this.appRef.tick();
        this.forceReflow();
      });

      // And after a short delay to catch async content
      setTimeout(() => {
        this.cdr.detectChanges();
        this.forceReflow();
      }, 50);
    });
  }

  ngAfterViewInit(): void {
    // Initial reflow
    this.forceReflow();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSidebarToggle(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
    this.cdr.detectChanges();

    // Dispatch resize at multiple points during transition
    this.dispatchResizeEvent();
    setTimeout(() => this.dispatchResizeEvent(), 150);
    setTimeout(() => this.dispatchResizeEvent(), 320);
  }

  private forceReflow(): void {
    // Force browser to recalculate layout synchronously
    if (this.mainContent?.nativeElement) {
      // Reading offsetHeight forces a synchronous reflow
      void this.mainContent.nativeElement.offsetHeight;
    }

    // Dispatch resize event for charts/tables
    this.dispatchResizeEvent();
  }

  private dispatchResizeEvent(): void {
    window.dispatchEvent(new Event('resize'));
  }

  onNewTranscription(): void {
    console.log('New transcription requested');
  }
}
