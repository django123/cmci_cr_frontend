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
    <div class="cr-form-page">
      <!-- Header -->
      <div class="form-header">
        <div class="header-left">
          <button
            pButton
            icon="pi pi-arrow-left"
            class="p-button-text p-button-rounded"
            (click)="goBack()">
          </button>
          <div class="header-title">
            <h1>{{ isEditMode ? 'Modifier le' : 'Nouveau' }} Compte Rendu</h1>
            <p>Remplissez votre compte rendu spirituel quotidien</p>
          </div>
        </div>
        <div class="header-actions">
          <button
            pButton
            type="button"
            label="Annuler"
            icon="pi pi-times"
            class="p-button-outlined p-button-secondary"
            (click)="goBack()">
          </button>
          <button
            pButton
            type="submit"
            [label]="isEditMode ? 'Mettre à jour' : 'Enregistrer'"
            icon="pi pi-check"
            class="p-button-primary"
            [loading]="loading"
            [disabled]="form.invalid"
            (click)="onSubmit()">
          </button>
        </div>
      </div>

      <!-- Form Content -->
      <form [formGroup]="form" class="form-content">
        <!-- Row 1: Date & RDQD + Prière -->
        <div class="form-row">
          <!-- Informations générales -->
          <div class="form-card">
            <div class="card-header">
              <i class="pi pi-calendar"></i>
              <span>Informations générales</span>
            </div>
            <div class="card-body">
              <div class="field">
                <label for="date">Date <span class="required">*</span></label>
                <p-calendar
                  id="date"
                  formControlName="date"
                  [showIcon]="true"
                  dateFormat="dd/mm/yy"
                  [maxDate]="today"
                  styleClass="w-full"
                  placeholder="Sélectionnez une date">
                </p-calendar>
                @if (form.get('date')?.invalid && form.get('date')?.touched) {
                  <small class="error-text">La date est requise</small>
                }
              </div>

              <div class="field">
                <label>RDQD (Rendez-vous Quotidien avec Dieu) <span class="required">*</span></label>
                <div class="rdqd-container">
                  <div class="rdqd-input-group">
                    <p-inputNumber
                      formControlName="rdqdAccompli"
                      [min]="0"
                      [max]="7"
                      [showButtons]="true"
                      buttonLayout="horizontal"
                      spinnerMode="horizontal"
                      decrementButtonClass="p-button-secondary"
                      incrementButtonClass="p-button-secondary"
                      incrementButtonIcon="pi pi-plus"
                      decrementButtonIcon="pi pi-minus"
                      styleClass="rdqd-number">
                    </p-inputNumber>
                    <span class="rdqd-divider">/</span>
                    <p-inputNumber
                      formControlName="rdqdAttendu"
                      [min]="1"
                      [max]="7"
                      [showButtons]="true"
                      buttonLayout="horizontal"
                      spinnerMode="horizontal"
                      decrementButtonClass="p-button-secondary"
                      incrementButtonClass="p-button-secondary"
                      incrementButtonIcon="pi pi-plus"
                      decrementButtonIcon="pi pi-minus"
                      styleClass="rdqd-number">
                    </p-inputNumber>
                  </div>
                  <small class="hint-text">Nombre de rendez-vous accomplis / attendus</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Temps de prière -->
          <div class="form-card">
            <div class="card-header">
              <i class="pi pi-clock"></i>
              <span>Temps de prière</span>
            </div>
            <div class="card-body">
              <div class="fields-grid">
                <div class="field">
                  <label for="priereSeuleMinutes">Prière seul(e) <span class="required">*</span></label>
                  <p-inputNumber
                    id="priereSeuleMinutes"
                    formControlName="priereSeuleMinutes"
                    [min]="0"
                    suffix=" min"
                    [showButtons]="true"
                    styleClass="w-full">
                  </p-inputNumber>
                </div>

                <div class="field">
                  <label for="priereCoupleMinutes">Prière en couple</label>
                  <p-inputNumber
                    id="priereCoupleMinutes"
                    formControlName="priereCoupleMinutes"
                    [min]="0"
                    suffix=" min"
                    [showButtons]="true"
                    styleClass="w-full">
                  </p-inputNumber>
                </div>

                <div class="field">
                  <label for="priereAvecEnfantsMinutes">Prière avec enfants</label>
                  <p-inputNumber
                    id="priereAvecEnfantsMinutes"
                    formControlName="priereAvecEnfantsMinutes"
                    [min]="0"
                    suffix=" min"
                    [showButtons]="true"
                    styleClass="w-full">
                  </p-inputNumber>
                </div>

                <div class="field">
                  <label for="priereAutres">Autres prières</label>
                  <p-inputNumber
                    id="priereAutres"
                    formControlName="priereAutres"
                    [min]="0"
                    suffix=" fois"
                    [showButtons]="true"
                    styleClass="w-full">
                  </p-inputNumber>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 2: Étude + Pratiques -->
        <div class="form-row">
          <!-- Étude de la Parole -->
          <div class="form-card">
            <div class="card-header">
              <i class="pi pi-book"></i>
              <span>Étude de la Parole</span>
            </div>
            <div class="card-body">
              <div class="fields-grid cols-2">
                <div class="field">
                  <label for="lectureBiblique">Chapitres lus</label>
                  <p-inputNumber
                    id="lectureBiblique"
                    formControlName="lectureBiblique"
                    [min]="0"
                    [showButtons]="true"
                    styleClass="w-full">
                  </p-inputNumber>
                </div>

                <div class="field">
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

              <div class="fields-grid cols-3">
                <div class="field">
                  <label for="litteraturePages">Pages lues</label>
                  <p-inputNumber
                    id="litteraturePages"
                    formControlName="litteraturePages"
                    [min]="0"
                    [showButtons]="true"
                    styleClass="w-full">
                  </p-inputNumber>
                </div>

                <div class="field">
                  <label for="litteratureTotal">Total pages</label>
                  <p-inputNumber
                    id="litteratureTotal"
                    formControlName="litteratureTotal"
                    [min]="0"
                    [showButtons]="true"
                    styleClass="w-full">
                  </p-inputNumber>
                </div>

                <div class="field">
                  <label for="litteratureTitre">Titre du livre</label>
                  <input
                    id="litteratureTitre"
                    type="text"
                    pInputText
                    formControlName="litteratureTitre"
                    placeholder="Titre du livre/magazine"
                    class="w-full" />
                </div>
              </div>
            </div>
          </div>

          <!-- Pratiques spirituelles -->
          <div class="form-card">
            <div class="card-header">
              <i class="pi pi-heart"></i>
              <span>Pratiques spirituelles</span>
            </div>
            <div class="card-body">
              <div class="checkbox-group">
                <div class="checkbox-item">
                  <p-checkbox
                    formControlName="confession"
                    [binary]="true"
                    inputId="confession">
                  </p-checkbox>
                  <label for="confession">
                    <i class="pi pi-heart-fill"></i>
                    Confession effectuée
                  </label>
                </div>

                <div class="checkbox-item">
                  <p-checkbox
                    formControlName="jeune"
                    [binary]="true"
                    inputId="jeune">
                  </p-checkbox>
                  <label for="jeune">
                    <i class="pi pi-sun"></i>
                    Jeûne pratiqué
                  </label>
                </div>

                <div class="checkbox-item">
                  <p-checkbox
                    formControlName="offrande"
                    [binary]="true"
                    inputId="offrande">
                  </p-checkbox>
                  <label for="offrande">
                    <i class="pi pi-wallet"></i>
                    Offrande donnée
                  </label>
                </div>
              </div>

              @if (form.get('jeune')?.value) {
                <div class="field mt-3">
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

              <div class="field">
                <label for="evangelisation">
                  <i class="pi pi-users"></i>
                  Personnes évangélisées
                </label>
                <p-inputNumber
                  id="evangelisation"
                  formControlName="evangelisation"
                  [min]="0"
                  [showButtons]="true"
                  styleClass="w-full">
                </p-inputNumber>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 3: Notes -->
        <div class="form-row full-width">
          <div class="form-card">
            <div class="card-header">
              <i class="pi pi-pencil"></i>
              <span>Notes et commentaires</span>
            </div>
            <div class="card-body">
              <div class="field">
                <label for="notes">Notes personnelles</label>
                <textarea
                  id="notes"
                  pInputTextarea
                  formControlName="notes"
                  [rows]="4"
                  [autoResize]="true"
                  placeholder="Ajoutez vos réflexions, prières exaucées, points de reconnaissance..."
                  class="w-full">
                </textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile Actions -->
        <div class="mobile-actions">
          <button
            pButton
            type="button"
            label="Annuler"
            icon="pi pi-times"
            class="p-button-outlined p-button-secondary p-button-lg"
            (click)="goBack()">
          </button>
          <button
            pButton
            type="submit"
            [label]="isEditMode ? 'Mettre à jour' : 'Enregistrer'"
            icon="pi pi-check"
            class="p-button-primary p-button-lg"
            [loading]="loading"
            [disabled]="form.invalid"
            (click)="onSubmit()">
          </button>
        </div>
      </form>

      <p-toast position="top-right"></p-toast>
    </div>
  `,
  styles: [`
    .cr-form-page {
      min-height: 100vh;
      background: #f8fafc;
      padding-bottom: 2rem;
    }

    /* Header */
    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      background: white;
      border-bottom: 1px solid #e2e8f0;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-title h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
    }

    .header-title p {
      margin: 0.25rem 0 0;
      font-size: 0.875rem;
      color: #64748b;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
    }

    /* Form Content */
    .form-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .form-row.full-width {
      grid-template-columns: 1fr;
    }

    /* Form Card */
    .form-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
      border: 1px solid #e2e8f0;
      overflow: hidden;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      font-weight: 600;
      font-size: 1rem;
    }

    .card-header i {
      font-size: 1.125rem;
    }

    .card-body {
      padding: 1.5rem;
    }

    /* Fields */
    .field {
      margin-bottom: 1.25rem;
    }

    .field:last-child {
      margin-bottom: 0;
    }

    .field label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    .field label i {
      color: #6366f1;
    }

    .required {
      color: #ef4444;
    }

    .error-text {
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .hint-text {
      color: #64748b;
      font-size: 0.75rem;
      margin-top: 0.5rem;
    }

    .fields-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .fields-grid.cols-2 {
      grid-template-columns: repeat(2, 1fr);
    }

    .fields-grid.cols-3 {
      grid-template-columns: repeat(3, 1fr);
    }

    /* RDQD Styles */
    .rdqd-container {
      display: flex;
      flex-direction: column;
    }

    .rdqd-input-group {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: #f8fafc;
      padding: 1rem;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .rdqd-divider {
      font-size: 1.5rem;
      font-weight: 700;
      color: #6366f1;
    }

    ::ng-deep .rdqd-number {
      width: 120px;
    }

    /* Checkbox Group */
    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .checkbox-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      background: #f8fafc;
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      transition: all 0.2s;
    }

    .checkbox-item:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }

    .checkbox-item label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      cursor: pointer;
      font-weight: 500;
      color: #475569;
    }

    .checkbox-item label i {
      color: #6366f1;
    }

    /* PrimeNG Overrides */
    ::ng-deep .p-inputtext,
    ::ng-deep .p-inputnumber-input,
    ::ng-deep .p-calendar .p-inputtext {
      border-radius: 10px;
      border: 1px solid #e2e8f0;
      padding: 0.75rem 1rem;
      font-size: 0.9375rem;
      transition: all 0.2s;
    }

    ::ng-deep .p-inputtext:focus,
    ::ng-deep .p-inputnumber-input:focus,
    ::ng-deep .p-calendar .p-inputtext:focus {
      border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    ::ng-deep .p-inputnumber-buttons-horizontal .p-button {
      border-radius: 8px;
    }

    ::ng-deep .p-checkbox .p-checkbox-box {
      border-radius: 6px;
      width: 22px;
      height: 22px;
    }

    ::ng-deep .p-checkbox .p-checkbox-box.p-highlight {
      background: #6366f1;
      border-color: #6366f1;
    }

    ::ng-deep .p-inputtextarea {
      border-radius: 12px;
      resize: none;
    }

    ::ng-deep .p-divider {
      margin: 1.25rem 0;
    }

    ::ng-deep .p-button.p-button-primary {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      border: none;
    }

    ::ng-deep .p-button.p-button-primary:hover {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
    }

    .w-full {
      width: 100%;
    }

    .mt-3 {
      margin-top: 1rem;
    }

    /* Mobile Actions (hidden on desktop) */
    .mobile-actions {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1rem 1.5rem;
      background: white;
      border-top: 1px solid #e2e8f0;
      gap: 1rem;
      z-index: 100;
    }

    .mobile-actions button {
      flex: 1;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .fields-grid.cols-3 {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .form-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem;
      }

      .header-actions {
        display: none;
      }

      .mobile-actions {
        display: flex;
      }

      .form-content {
        padding: 1rem;
        padding-bottom: 100px;
      }

      .fields-grid,
      .fields-grid.cols-2,
      .fields-grid.cols-3 {
        grid-template-columns: 1fr;
      }

      .rdqd-input-group {
        flex-direction: column;
        gap: 0.75rem;
      }

      ::ng-deep .rdqd-number {
        width: 100%;
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
      rdqdAccompli: [1, [Validators.required, Validators.min(0), Validators.max(7)]],
      rdqdAttendu: [1, [Validators.required, Validators.min(1), Validators.max(7)]],
      priereSeuleMinutes: [30, [Validators.required, Validators.min(0)]],
      priereCoupleMinutes: [0, Validators.min(0)],
      priereAvecEnfantsMinutes: [0, Validators.min(0)],
      priereAutres: [0, Validators.min(0)],
      lectureBiblique: [1, Validators.min(0)],
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
      error: () => {
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
