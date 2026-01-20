/**
 * Value Object représentant une durée en minutes
 */
export class Duration {
  private readonly _minutes: number;

  private constructor(minutes: number) {
    this._minutes = minutes;
  }

  static fromMinutes(minutes: number): Duration {
    if (minutes < 0) {
      throw new Error('La durée ne peut pas être négative');
    }
    return new Duration(minutes);
  }

  static fromHoursAndMinutes(hours: number, minutes: number): Duration {
    if (hours < 0 || minutes < 0) {
      throw new Error('Les heures et minutes ne peuvent pas être négatives');
    }
    return new Duration(hours * 60 + minutes);
  }

  static fromISODuration(iso: string): Duration {
    // Parse ISO 8601 duration format (e.g., "PT30M", "PT1H30M")
    const pattern = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
    const match = iso.match(pattern);

    if (!match) {
      // Try simple HH:MM format
      const simplePattern = /^(\d{2}):(\d{2})$/;
      const simpleMatch = iso.match(simplePattern);
      if (simpleMatch) {
        const hours = parseInt(simpleMatch[1], 10);
        const mins = parseInt(simpleMatch[2], 10);
        return Duration.fromHoursAndMinutes(hours, mins);
      }
      throw new Error(`Format de durée invalide: ${iso}`);
    }

    const hours = match[1] ? parseInt(match[1], 10) : 0;
    const mins = match[2] ? parseInt(match[2], 10) : 0;

    return Duration.fromHoursAndMinutes(hours, mins);
  }

  get minutes(): number {
    return this._minutes;
  }

  get hours(): number {
    return Math.floor(this._minutes / 60);
  }

  get remainingMinutes(): number {
    return this._minutes % 60;
  }

  toISODuration(): string {
    const h = this.hours;
    const m = this.remainingMinutes;

    let result = 'PT';
    if (h > 0) result += `${h}H`;
    if (m > 0 || h === 0) result += `${m}M`;

    return result;
  }

  toFormattedString(): string {
    const h = this.hours;
    const m = this.remainingMinutes;

    if (h > 0 && m > 0) {
      return `${h}h ${m}min`;
    } else if (h > 0) {
      return `${h}h`;
    } else {
      return `${m}min`;
    }
  }

  toTimeString(): string {
    const h = this.hours.toString().padStart(2, '0');
    const m = this.remainingMinutes.toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  add(other: Duration): Duration {
    return Duration.fromMinutes(this._minutes + other._minutes);
  }

  equals(other: Duration): boolean {
    return this._minutes === other._minutes;
  }

  isGreaterThan(other: Duration): boolean {
    return this._minutes > other._minutes;
  }
}
