/**
 * Value Object représentant le RDQD (Rencontre Dynamique Quotidien avec Dieu)
 * Format: "accompli/attendu" (ex: "5/7")
 */
export class RDQD {
  private readonly _accompli: number;
  private readonly _attendu: number;

  private constructor(accompli: number, attendu: number) {
    this._accompli = accompli;
    this._attendu = attendu;
  }

  static create(accompli: number, attendu: number): RDQD {
    if (attendu <= 0) {
      throw new Error('Le nombre attendu doit être supérieur à 0');
    }
    if (accompli < 0) {
      throw new Error('Le nombre accompli ne peut pas être négatif');
    }
    if (accompli > attendu) {
      throw new Error('Le nombre accompli ne peut pas dépasser le nombre attendu');
    }
    return new RDQD(accompli, attendu);
  }

  static fromString(value: string): RDQD {
    const pattern = /^(\d+)\/(\d+)$/;
    const match = value.match(pattern);

    if (!match) {
      throw new Error(`Format RDQD invalide: ${value}. Format attendu: "X/Y"`);
    }

    const accompli = parseInt(match[1], 10);
    const attendu = parseInt(match[2], 10);

    return RDQD.create(accompli, attendu);
  }

  get accompli(): number {
    return this._accompli;
  }

  get attendu(): number {
    return this._attendu;
  }

  get isComplete(): boolean {
    return this._accompli >= this._attendu;
  }

  get completionPercentage(): number {
    if (this._attendu === 0) return 0;
    return Math.round((this._accompli / this._attendu) * 100);
  }

  toString(): string {
    return `${this._accompli}/${this._attendu}`;
  }

  equals(other: RDQD): boolean {
    return this._accompli === other._accompli && this._attendu === other._attendu;
  }
}
