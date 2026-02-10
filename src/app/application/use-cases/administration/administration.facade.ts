import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Region, Zone, EgliseLocale, EgliseMaison, SeedResult } from '../../../domain/models';
import { RegionRepository, ZoneRepository, EgliseLocaleRepository, EgliseMaisonRepository } from '../../../domain/repositories';
import { RegionHttpRepository, ZoneHttpRepository, EgliseLocaleHttpRepository, EgliseMaisonHttpRepository } from '../../../infrastructure/repositories';

/**
 * Facade pour l'administration de la hierarchie ecclesiale
 * Gere l'etat et les operations CRUD pour Region, Zone, EgliseLocale, EgliseMaison
 */
@Injectable({
  providedIn: 'root'
})
export class AdministrationFacade {
  private readonly regionRepo: RegionRepository = inject(RegionHttpRepository);
  private readonly zoneRepo: ZoneRepository = inject(ZoneHttpRepository);
  private readonly egliseLocaleRepo: EgliseLocaleRepository = inject(EgliseLocaleHttpRepository);
  private readonly egliseMaisonRepo: EgliseMaisonRepository = inject(EgliseMaisonHttpRepository);

  // Etat - Regions
  private readonly regionsSubject = new BehaviorSubject<Region[]>([]);
  readonly regions$ = this.regionsSubject.asObservable();

  // Etat - Zones
  private readonly zonesSubject = new BehaviorSubject<Zone[]>([]);
  readonly zones$ = this.zonesSubject.asObservable();

  // Etat - Eglises Locales
  private readonly eglisesLocalesSubject = new BehaviorSubject<EgliseLocale[]>([]);
  readonly eglisesLocales$ = this.eglisesLocalesSubject.asObservable();

  // Etat - Eglises de Maison
  private readonly eglisesMaisonSubject = new BehaviorSubject<EgliseMaison[]>([]);
  readonly eglisesMaison$ = this.eglisesMaisonSubject.asObservable();

  // Etat global
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  // ========== REGIONS ==========

  loadRegions(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    this.regionRepo.getAll().pipe(
      tap(regions => {
        console.log('[Facade] Loaded regions:', regions.length);
        this.regionsSubject.next(regions);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error loading regions:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe();
  }

  createRegion(request: { nom: string; code: string }): Observable<Region> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    return this.regionRepo.create(request).pipe(
      tap(region => {
        console.log('[Facade] Region created:', region);
        const current = this.regionsSubject.getValue();
        this.regionsSubject.next([...current, region]);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error creating region:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  updateRegion(id: string, request: { nom?: string; code?: string }): Observable<Region> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    return this.regionRepo.update(id, request).pipe(
      tap(region => {
        console.log('[Facade] Region updated:', region);
        const current = this.regionsSubject.getValue();
        const index = current.findIndex(r => r.id === region.id);
        if (index >= 0) {
          const newList = [...current];
          newList[index] = region;
          this.regionsSubject.next(newList);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error updating region:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  deleteRegion(id: string): Observable<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    return this.regionRepo.delete(id).pipe(
      tap(() => {
        console.log('[Facade] Region deleted:', id);
        const current = this.regionsSubject.getValue();
        this.regionsSubject.next(current.filter(r => r.id !== id));
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error deleting region:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  // ========== ZONES ==========

  loadZones(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    this.zoneRepo.getAll().pipe(
      tap(zones => {
        console.log('[Facade] Loaded zones:', zones.length);
        this.zonesSubject.next(zones);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error loading zones:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe();
  }

  loadZonesByRegion(regionId: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    this.zoneRepo.getByRegionId(regionId).pipe(
      tap(zones => {
        console.log('[Facade] Loaded zones by region:', zones.length);
        this.zonesSubject.next(zones);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error loading zones by region:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe();
  }

  createZone(request: { nom: string; regionId: string }): Observable<Zone> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    return this.zoneRepo.create(request).pipe(
      tap(zone => {
        console.log('[Facade] Zone created:', zone);
        const current = this.zonesSubject.getValue();
        this.zonesSubject.next([...current, zone]);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error creating zone:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  updateZone(id: string, request: { nom?: string; regionId?: string }): Observable<Zone> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    return this.zoneRepo.update(id, request).pipe(
      tap(zone => {
        console.log('[Facade] Zone updated:', zone);
        const current = this.zonesSubject.getValue();
        const index = current.findIndex(z => z.id === zone.id);
        if (index >= 0) {
          const newList = [...current];
          newList[index] = zone;
          this.zonesSubject.next(newList);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error updating zone:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  deleteZone(id: string): Observable<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    return this.zoneRepo.delete(id).pipe(
      tap(() => {
        console.log('[Facade] Zone deleted:', id);
        const current = this.zonesSubject.getValue();
        this.zonesSubject.next(current.filter(z => z.id !== id));
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error deleting zone:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  // ========== EGLISES LOCALES ==========

  loadEglisesLocales(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    this.egliseLocaleRepo.getAll().pipe(
      tap(eglises => {
        console.log('[Facade] Loaded eglises locales:', eglises.length);
        this.eglisesLocalesSubject.next(eglises);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error loading eglises locales:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe();
  }

  loadEglisesLocalesByZone(zoneId: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    this.egliseLocaleRepo.getByZoneId(zoneId).pipe(
      tap(eglises => {
        console.log('[Facade] Loaded eglises locales by zone:', eglises.length);
        this.eglisesLocalesSubject.next(eglises);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error loading eglises locales by zone:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe();
  }

  createEgliseLocale(request: { nom: string; zoneId: string; adresse?: string; pasteurId?: string }): Observable<EgliseLocale> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    return this.egliseLocaleRepo.create(request).pipe(
      tap(eglise => {
        console.log('[Facade] Eglise locale created:', eglise);
        const current = this.eglisesLocalesSubject.getValue();
        this.eglisesLocalesSubject.next([...current, eglise]);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error creating eglise locale:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  updateEgliseLocale(id: string, request: { nom?: string; zoneId?: string; adresse?: string; pasteurId?: string }): Observable<EgliseLocale> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    return this.egliseLocaleRepo.update(id, request).pipe(
      tap(eglise => {
        console.log('[Facade] Eglise locale updated:', eglise);
        const current = this.eglisesLocalesSubject.getValue();
        const index = current.findIndex(e => e.id === eglise.id);
        if (index >= 0) {
          const newList = [...current];
          newList[index] = eglise;
          this.eglisesLocalesSubject.next(newList);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error updating eglise locale:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  deleteEgliseLocale(id: string): Observable<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    return this.egliseLocaleRepo.delete(id).pipe(
      tap(() => {
        console.log('[Facade] Eglise locale deleted:', id);
        const current = this.eglisesLocalesSubject.getValue();
        this.eglisesLocalesSubject.next(current.filter(e => e.id !== id));
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error deleting eglise locale:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  // ========== EGLISES DE MAISON ==========

  loadEglisesMaison(): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    this.egliseMaisonRepo.getAll().pipe(
      tap(eglises => {
        console.log('[Facade] Loaded eglises de maison:', eglises.length);
        this.eglisesMaisonSubject.next(eglises);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error loading eglises de maison:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe();
  }

  loadEglisesMaisonByEgliseLocale(egliseLocaleId: string): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    this.egliseMaisonRepo.getByEgliseLocaleId(egliseLocaleId).pipe(
      tap(eglises => {
        console.log('[Facade] Loaded eglises de maison by eglise locale:', eglises.length);
        this.eglisesMaisonSubject.next(eglises);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error loading eglises de maison by eglise locale:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    ).subscribe();
  }

  createEgliseMaison(request: { nom: string; egliseLocaleId: string; leaderId?: string; adresse?: string }): Observable<EgliseMaison> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    return this.egliseMaisonRepo.create(request).pipe(
      tap(eglise => {
        console.log('[Facade] Eglise de maison created:', eglise);
        const current = this.eglisesMaisonSubject.getValue();
        this.eglisesMaisonSubject.next([...current, eglise]);
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error creating eglise de maison:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  updateEgliseMaison(id: string, request: { nom?: string; egliseLocaleId?: string; leaderId?: string; adresse?: string }): Observable<EgliseMaison> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    return this.egliseMaisonRepo.update(id, request).pipe(
      tap(eglise => {
        console.log('[Facade] Eglise de maison updated:', eglise);
        const current = this.eglisesMaisonSubject.getValue();
        const index = current.findIndex(e => e.id === eglise.id);
        if (index >= 0) {
          const newList = [...current];
          newList[index] = eglise;
          this.eglisesMaisonSubject.next(newList);
        }
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error updating eglise de maison:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  deleteEgliseMaison(id: string): Observable<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    return this.egliseMaisonRepo.delete(id).pipe(
      tap(() => {
        console.log('[Facade] Eglise de maison deleted:', id);
        const current = this.eglisesMaisonSubject.getValue();
        this.eglisesMaisonSubject.next(current.filter(e => e.id !== id));
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('[Facade] Error deleting eglise de maison:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  // ========== SEED ==========

  seedGeography(): Observable<SeedResult> {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);
    return (this.regionRepo as any).seedGeography().pipe(
      tap((result: SeedResult) => {
        console.log('[Facade] Seed result:', result);
        this.loadingSubject.next(false);
        // Recharger les regions et zones apres le seed
        this.loadRegions();
        this.loadZones();
      }),
      catchError((error: any) => {
        console.error('[Facade] Error seeding geography:', error);
        this.errorSubject.next(error.message);
        this.loadingSubject.next(false);
        throw error;
      })
    );
  }

  // ========== UTILS ==========

  clearError(): void {
    this.errorSubject.next(null);
  }

  clear(): void {
    this.regionsSubject.next([]);
    this.zonesSubject.next([]);
    this.eglisesLocalesSubject.next([]);
    this.eglisesMaisonSubject.next([]);
    this.errorSubject.next(null);
    this.loadingSubject.next(false);
  }
}
