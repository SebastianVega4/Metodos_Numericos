import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Euler } from 'src/app/models/euler';
import { EulerService } from 'src/app/services/eulerService';

@Component({
  selector: 'app-euler',
  templateUrl: './euler.component.html',
  styleUrls: ['./euler.component.css']
})
export class EulerComponent implements OnInit {
  eventForm: FormGroup;
  titulo = 'Método de Euler para EDOs';
  resultados: any[] = [];
  grafica: string = '';
  mostrarExacta: boolean = false;
  errorMaximo: number = 0;
  errorPromedio: number = 0;
  selectedField: string = '';

  constructor(
    private fb: FormBuilder,
    private eulerService: EulerService
  ) {
    this.eventForm = this.fb.group({
      funcion: ['', Validators.required],
      x0: ['', Validators.required],
      y0: ['', Validators.required],
      xInicio: ['', Validators.required],
      xFin: ['', Validators.required],
      paso: ['', [Validators.required, Validators.min(0.001)]],
      mostrarExacta: [false],
      solucionExacta: ['']
    });
  }

  ngOnInit(): void {
    this.eventForm.get('mostrarExacta')?.valueChanges.subscribe(value => {
      if (value) {
        this.eventForm.get('solucionExacta')?.setValidators([Validators.required]);
      } else {
        this.eventForm.get('solucionExacta')?.clearValidators();
      }
      this.eventForm.get('solucionExacta')?.updateValueAndValidity();
    });
  }

  consulta() {
    if (this.eventForm.invalid) {
      return;
    }

    const formValue = this.eventForm.value;
    const euler: Euler = {
      funcion: formValue.funcion,
      x0: formValue.x0,
      y0: formValue.y0,
      xInicio: formValue.xInicio,
      xFin: formValue.xFin,
      paso: formValue.paso,
      solucionExacta: formValue.mostrarExacta ? formValue.solucionExacta : undefined
    };

    if (euler.xFin <= euler.xInicio) {
      alert('El valor final debe ser mayor que el inicial');
      return;
    }

    this.eulerService.solve(euler).subscribe(
      response => {
        this.resultados = response.resultados;
        this.grafica = 'data:image/png;base64,' + response.grafica;
        
        if (response.errorMaximo !== undefined) {
          this.errorMaximo = response.errorMaximo;
          this.errorPromedio = response.errorPromedio;
        }
      },
      error => {
        console.error(error);
        let errorMessage = 'Error al procesar la solicitud: ';
        if (error instanceof Error) {
          errorMessage += error.message;
        } else if (typeof error === 'string') {
          errorMessage += error;
        } else if (error.error?.error) {
          errorMessage += error.error.error;
        }
        alert(errorMessage);
      }
    );
  }

  openCalculator(field: string) {
    this.selectedField = field;
    const calculatorModal = document.getElementById('calculatorModal');
    if (calculatorModal) {
      calculatorModal.style.display = 'block';
    }
  }

  closeCalculator() {
    const calculatorModal = document.getElementById('calculatorModal');
    if (calculatorModal) {
      calculatorModal.style.display = 'none';
    }
  }

  saveFunction(func: string) {
    if (this.selectedField) {
      this.eventForm.get(this.selectedField)?.setValue(func);
      this.closeCalculator();
    }
  }
}