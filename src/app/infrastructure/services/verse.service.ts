import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, catchError, map, tap } from 'rxjs';

export interface DailyVerse {
  text: string;
  reference: string;
  version: string;
}

interface BibleApiResponse {
  reference: string;
  verses: Array<{
    book_id: string;
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
  }>;
  text: string;
  translation_id: string;
  translation_name: string;
  translation_note: string;
}

/**
 * Service pour récupérer le verset du jour
 * Utilise l'API bible-api.com avec la traduction Louis Segond
 */
@Injectable({
  providedIn: 'root'
})
export class VerseService {
  private readonly http = inject(HttpClient);
  private readonly CACHE_KEY = 'daily_verse';
  private readonly CACHE_DATE_KEY = 'daily_verse_date';

  // Liste de versets populaires pour le verset du jour
  private readonly DAILY_VERSES = [
    'jean+3:16',
    'psaumes+23:1-3',
    'philippiens+4:13',
    'jeremie+29:11',
    'proverbes+3:5-6',
    'esaie+41:10',
    'romains+8:28',
    'josue+1:9',
    'psaumes+46:1',
    'matthieu+11:28',
    'philippiens+4:6-7',
    'psaumes+37:4',
    '2+corinthiens+5:17',
    'esaie+40:31',
    'romains+12:2',
    'galates+5:22-23',
    'hebreux+11:1',
    'jacques+1:2-3',
    '1+pierre+5:7',
    'psaumes+91:1-2',
    'matthieu+6:33',
    'jean+14:6',
    'romains+5:8',
    'ephesiens+2:8-9',
    'psaumes+119:105',
    '2+timothee+1:7',
    'esaie+26:3',
    'colossiens+3:23',
    'psaumes+118:24',
    'matthieu+5:16',
    'jean+15:5'
  ];

  /**
   * Récupère le verset du jour
   * Utilise un cache local pour éviter trop de requêtes
   */
  getDailyVerse(): Observable<DailyVerse> {
    // Vérifier le cache
    const cachedVerse = this.getCachedVerse();
    if (cachedVerse) {
      return of(cachedVerse);
    }

    // Sélectionner un verset basé sur le jour de l'année
    const verseRef = this.getVerseForToday();

    return this.http.get<BibleApiResponse>(
      `https://bible-api.com/${verseRef}?translation=louis_second`
    ).pipe(
      map(response => this.transformResponse(response)),
      tap(verse => this.cacheVerse(verse)),
      catchError(() => {
        // En cas d'erreur, retourner un verset par défaut
        return of(this.getDefaultVerse());
      })
    );
  }

  /**
   * Transforme la réponse de l'API en format DailyVerse
   */
  private transformResponse(response: BibleApiResponse): DailyVerse {
    return {
      text: this.cleanVerseText(response.text),
      reference: response.reference,
      version: 'Louis Segond'
    };
  }

  /**
   * Nettoie le texte du verset
   */
  private cleanVerseText(text: string): string {
    // Supprimer les numéros de versets et nettoyer le texte
    return text
      .replace(/^\d+\s*/gm, '')
      .replace(/\n/g, ' ')
      .trim();
  }

  /**
   * Sélectionne un verset basé sur le jour de l'année
   */
  private getVerseForToday(): string {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const index = dayOfYear % this.DAILY_VERSES.length;
    return this.DAILY_VERSES[index];
  }

  /**
   * Récupère le verset en cache s'il est encore valide (même jour)
   */
  private getCachedVerse(): DailyVerse | null {
    try {
      const cachedDate = localStorage.getItem(this.CACHE_DATE_KEY);
      const today = new Date().toDateString();

      if (cachedDate === today) {
        const cached = localStorage.getItem(this.CACHE_KEY);
        if (cached) {
          return JSON.parse(cached);
        }
      }
    } catch {
      // Ignorer les erreurs de localStorage
    }
    return null;
  }

  /**
   * Met en cache le verset du jour
   */
  private cacheVerse(verse: DailyVerse): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(verse));
      localStorage.setItem(this.CACHE_DATE_KEY, new Date().toDateString());
    } catch {
      // Ignorer les erreurs de localStorage
    }
  }

  /**
   * Retourne un verset par défaut en cas d'erreur
   */
  private getDefaultVerse(): DailyVerse {
    return {
      text: "Cherchez premièrement le royaume de Dieu et sa justice, et toutes ces choses vous seront données par-dessus.",
      reference: "Matthieu 6:33",
      version: "Louis Segond"
    };
  }
}
