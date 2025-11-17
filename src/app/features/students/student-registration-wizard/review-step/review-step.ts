import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { Card } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { Tag } from 'primeng/tag';

@Component({
  selector: 'app-review-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Card, Tag],
  templateUrl: './review-step.html',
})
export class ReviewStepComponent {
  @Input({ required: true }) form!: FormGroup;
  @Input({ required: true }) isMinor = false;

  get guardiansFA(): FormArray {
    return this.form.get('guardians') as FormArray;
  }

  student = computed(() => this.form.getRawValue());
}
