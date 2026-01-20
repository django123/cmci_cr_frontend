import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextarea } from 'primeng/inputtextarea';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { CompteRenduFacade } from '../../../../application/use-cases';
import { CreateCompteRenduRequest, UpdateCompteRenduRequest } from '../../../../domain/repositories';

@Component({
  selector: 'app-compte-rendu-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    InputTextarea,
    CalendarModule,
    CheckboxModule,
    DropdownModule,
    DividerModule,
    ToastModule
  ],
  providers: [MessageService],
  template: `
    <div class="cr-form-container">
      <div class="page-header">
        <button
          pButton
          icon="pi pi-arrow-left"
          class="p-button-text"
          (click)="goBack()">
        </button>
        <div class="header-content">
          <h1>{{ isEditMode ? 'Modifier le' : 'Nouveau' }} Compte Rendu</h1>
          <p>{{ isEditMode ? 'Modifiez les informations de votre CR' : 'Remplissez votre compte rendu spirituel quotidien' }}</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="form-grid">
          <!-- Informations de base -->
          <p-card header="Informations générales" styleClass="form-card">
            <div class="form-row">
              <div class="form-field">
                <label for="date">Date *</label>
                <p-calendar
                  id="date"
                  formControlName="date"
                  [showIcon]="true"
                  dateFormat="dd/mm/yy"
                  [maxDate]="today"
                  styleClass="w-full">
                </p-calendar>
                @if (form.get('date')?.invalid && form.get('date')?.touched) {
                  <small class="p-error">La date est requise</small>
                }
              </div>

              <div class="form-field">
                <label for="rdqdAccompli">RDQD (Rendez-vous Quotidien avec Dieu) *</label>
                <div class="rdqd-input">
                  <p-inputNumber
                    formControlName="rdqdAccompli"
                    [min]="0"
                    [max]="7"
                    placeholder="Accompli"
                    styleClass="rdqd-field">
                  </p-inputNumber>
                  <span class="rdqd-separator">/</span>
                  <p-inputNumber
                    formControlName="rdqdAttendu"
                    [min]="1"
                    [max]="7"
                    placeholder="Attendu"
                    styleClass="rdqd-field">
                  </p-inputNumber>
                </div>
              </div>
            </div>
          </p-card>

          <!-- Prière -->
          <p-card header="Temps de prière" styleClass="form-card">
            <div class="form-row">
              <div class="form-field">
                <label for="priereSeuleMinutes">Prière seul(e) (minutes) *</label>
                <p-inputNumber
                  id="priereSeuleMinutes"
                  formControlName="priereSeuleMinutes"
                  [min]="0"
                  suffix=" min"
                  styleClass="w-full">
                </p-inputNumber>
              </div>

              <div class="form-field">
                <label for="priereCoupleMinutes">Prière en couple (minutes)</label>
                <p-inputNumber
                  id="priereCoupleMinutes"
                  formControlName="priereCoupleMinutes"
                  [min]="0"
                  suffix=" min"
                  styleClass="w-full">
                </p-inputNumber>
              </div>

              <div class="form-field">
                <label for="priereAvecEnfantsMinutes">Prière avec enfants (minutes)</label>
                <p-inputNumber
                  id="priereAvecEnfantsMinutes"
                  formControlName="priereAvecEnfantsMinutes"
                  [min]="0"
                  suffix=" min"
                  styleClass="w-full">
                </p-inputNumber>
              </div>

              <div class="form-field">
                <label for="priereAutres">Autres prières (nombre)</label>
                <p-inputNumber
                  id="priereAutres"
                  formControlName="priereAutres"
                  [min]="0"
                  styleClass="w-full">
                </p-inputNumber>
              </div>
            </div>
          </p-card>

          <!-- Étude biblique -->
          <p-card header="Étude de la Parole" styleClass="form-card">
            <div class="form-row">
              <div class="form-field">
                <label for="lectureBiblique">Chapitres lus</label>
                <p-inputNumber
                  id="lectureBiblique"
                  formControlName="lectureBiblique"
                  [min]="0"
                  styleClass="w-full">
                </p-inputNumber>
              </div>

              <div class="form-field">
                <label for="livreBiblique">Livre de la Bible</label>
                <input
                  id="livreBiblique"
                  type="text"
                  pInputText
                  formControlName="livreBiblique"
                  placeholder="Ex: Matthieu"
                  class="w-full" />
              </div>
            </div>

            <p-divider></p-divider>

            <div class="form-row">
              <div class="form-field">
                <label for="litteraturePages">Pages de littérature lues</label>
                <p-inputNumber
                  id="litteraturePages"
                  formControlName="litteraturePages"
                  [min]="0"
                  styleClass="w-full">
                </p-inputNumber>
              </div>

              <div class="form-field">
                <label for="litteratureTotal">Total de pages du livre</label>
                <p-inputNumber
                  id="litteratureTotal"
                  formControlName="litteratureTotal"
                  [min]="0"
                  styleClass="w-full">
                </p-inputNumber>
              </div>

              <div class="form-field">
                <label for="litteratureTitre">Titre de la littérature</label>
                <input
                  id="litteratureTitre"
                  type="text"
                  pInputText
                  formControlName="litteratureTitre"
                  placeholder="Titre du livre/magazine"
                  class="w-full" />
              </div>
            </div>
          </p-card>

          <!-- Pratiques spirituelles -->
          <p-card header="Pratiques spirituelles" styleClass="form-card">
            <div class="checkbox-row">
              <p-checkbox
                formControlName="confession"
                [binary]="true"
                inputId="confession"
                label="Confession effectuée">
              </p-checkbox>

              <p-checkbox
                formControlName="jeune"
                [binary]="true"
                inputId="jeune"
                label="Jeûne pratiqué">
              </p-checkbox>

              <p-checkbox
                formControlName="offrande"
                [binary]="true"
                inputId="offrande"
                label="Offrande donnée">
              </p-checkbox>
            </div>

            @if (form.get('jeune')?.value) {
              <div class="form-field mt-3">
                <label for="typeJeune">Type de jeûne</label>
                <input
                  id="typeJeune"
                  type="text"
                  pInputText
                  formControlName="typeJeune"
                  placeholder="Ex: Jeûne complet, jeûne de Daniel..."
                  class="w-full" />
              </div>
            }

            <p-divider></p-divider>

            <div class="form-field">
              <label for="evangelisation">Personnes évangélisées</label>
              <p-inputNumber
                id="evangelisation"
                formControlName="evangelisation"
                [min]="0"
                styleClass="w-full">
              </p-inputNumber>
            </div>
          </p-card>

          <!-- Notes -->
          <p-card header="Notes et commentaires" styleClass="form-card full-width">
            <div class="form-field">
              <label for="notes">Notes personnelles</label>
              <textarea
                id="notes"
                pInputTextarea
                formControlName="notes"
                [rows]="4"
                placeholder="Ajoutez vos réflexions, prières exaucées, points de reconnaissance..."
                class="w-full">
              </textarea>
            </div>
          </p-card>
        </div>

        <!-- Actions -->
        <div class="form-actions">
          <button
            pButton
            type="button"
            label="Annuler"
            class="p-button-outlined"
            (click)="goBack()">
          </button>
          <button
            pButton
            type="submit"
            [label]="isEditMode ? 'Mettre à jour' : 'Enregistrer'"
            icon="pi pi-save"
            [loading]="loading"
            [disabled]="form.invalid">
          </button>
        </div>
      </form>

      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .cr-form-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .header-content h1 {
      margin: 0 0 0.25rem;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
    }

    .header-content p {
      margin: 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    ::ng-deep .form-card {
      height: 100%;

      .p-card-header {
        padding: 1rem 1.5rem;
        background: #f9fafb;
        border-bottom: 1px solid #e5e7eb;
        font-weight: 600;
        font-size: 1rem;
        color: #374151;
      }

      .p-card-body {
        padding: 1.5rem;
      }
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
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
    }

    .rdqd-input {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .rdqd-separator {
      font-size: 1.25rem;
      font-weight: 600;
      color: #6b7280;
    }

    ::ng-deep .rdqd-field {
      width: 100px;
    }

    .checkbox-row {
      display: flex;
      flex-wrap: wrap;
      gap: 2rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }

    .w-full {
      width: 100%;
    }

    .mt-3 {
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CompteRenduFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly facade = inject(CompteRenduFacade);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);

  form!: FormGroup;
  isEditMode = false;
  crId: string | null = null;
  loading = false;
  today = new Date();

  ngOnInit(): void {
    this.initForm();

    this.crId = this.route.snapshot.paramMap.get('id');
    if (this.crId && this.crId !== 'new') {
      this.isEditMode = true;
      this.loadCompteRendu();
    }
  }

  private initForm(): void {
    this.form = this.fb.group({
      date: [new Date(), Validators.required],
      rdqdAccompli: [0, [Validators.required, Validators.min(0), Validators.max(7)]],
      rdqdAttendu: [7, [Validators.required, Validators.min(1), Validators.max(7)]],
      priereSeuleMinutes: [0, [Validators.required, Validators.min(0)]],
      priereCoupleMinutes: [0, Validators.min(0)],
      priereAvecEnfantsMinutes: [0, Validators.min(0)],
      priereAutres: [0, Validators.min(0)],
      lectureBiblique: [0, Validators.min(0)],
      livreBiblique: [''],
      litteraturePages: [0, Validators.min(0)],
      litteratureTotal: [0, Validators.min(0)],
      litteratureTitre: [''],
      confession: [false],
      jeune: [false],
      typeJeune: [''],
      evangelisation: [0, Validators.min(0)],
      offrande: [false],
      notes: ['']
    });
  }

  private loadCompteRendu(): void {
    if (!this.crId) return;

    this.facade.getById(this.crId).subscribe({
      next: (cr) => {
        const [accompli, attendu] = cr.rdqd.split('/').map(Number);
        const priereMinutes = this.parseTimeToMinutes(cr.priereSeule);

        this.form.patchValue({
          date: new Date(cr.date),
          rdqdAccompli: accompli,
          rdqdAttendu: attendu,
          priereSeuleMinutes: priereMinutes,
          priereCoupleMinutes: cr.priereCouple ? this.parseTimeToMinutes(cr.priereCouple) : 0,
          priereAvecEnfantsMinutes: cr.priereAvecEnfants ? this.parseTimeToMinutes(cr.priereAvecEnfants) : 0,
          priereAutres: cr.priereAutres || 0,
          lectureBiblique: cr.lectureBiblique || 0,
          livreBiblique: cr.livreBiblique || '',
          litteraturePages: cr.litteraturePages || 0,
          litteratureTotal: cr.litteratureTotal || 0,
          litteratureTitre: cr.litteratureTitre || '',
          confession: cr.confession,
          jeune: cr.jeune,
          typeJeune: cr.typeJeune || '',
          evangelisation: cr.evangelisation || 0,
          offrande: cr.offrande,
          notes: cr.notes || ''
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger le compte rendu'
        });
      }
    });
  }

  private parseTimeToMinutes(time: string): number {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    const values = this.form.value;

    const rdqd = `${values.rdqdAccompli}/${values.rdqdAttendu}`;
    const date = this.formatDate(values.date);

    if (this.isEditMode && this.crId) {
      const request: UpdateCompteRenduRequest = {
        rdqd,
        priereSeuleMinutes: values.priereSeuleMinutes,
        priereCoupleMinutes: values.priereCoupleMinutes,
        priereAvecEnfantsMinutes: values.priereAvecEnfantsMinutes,
        priereAutres: values.priereAutres,
        lectureBiblique: values.lectureBiblique,
        livreBiblique: values.livreBiblique,
        litteraturePages: values.litteraturePages,
        litteratureTotal: values.litteratureTotal,
        litteratureTitre: values.litteratureTitre,
        confession: values.confession,
        jeune: values.jeune,
        typeJeune: values.typeJeune,
        evangelisation: values.evangelisation,
        offrande: values.offrande,
        notes: values.notes
      };

      this.facade.update(this.crId, request).subscribe({
        next: () => {
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Compte rendu mis à jour'
          });
          setTimeout(() => this.goBack(), 1000);
        },
        error: (err) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: err.message
          });
        }
      });
    } else {
      const request: CreateCompteRenduRequest = {
        date,
        rdqd,
        priereSeuleMinutes: values.priereSeuleMinutes,
        priereCoupleMinutes: values.priereCoupleMinutes,
        priereAvecEnfantsMinutes: values.priereAvecEnfantsMinutes,
        priereAutres: values.priereAutres,
        lectureBiblique: values.lectureBiblique,
        livreBiblique: values.livreBiblique,
        litteraturePages: values.litteraturePages,
        litteratureTotal: values.litteratureTotal,
        litteratureTitre: values.litteratureTitre,
        confession: values.confession,
        jeune: values.jeune,
        typeJeune: values.typeJeune,
        evangelisation: values.evangelisation,
        offrande: values.offrande,
        notes: values.notes
      };

      this.facade.create(request).subscribe({
        next: () => {
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Compte rendu créé'
          });
          setTimeout(() => this.goBack(), 1000);
        },
        error: (err) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: err.message
          });
        }
      });
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  goBack(): void {
    this.router.navigate(['/compte-rendu']);
  }
}
