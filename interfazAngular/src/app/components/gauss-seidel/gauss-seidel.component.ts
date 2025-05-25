// gauss-seidel.component.ts
import { Component, OnInit } from '@angular/core';
import { GaussSeidel } from 'src/app/models/gauss';
import { GaussSeidelService } from 'src/app/services/gaussSeidelService';

@Component({
  selector: 'app-gauss-seidel',
  templateUrl: './gauss-seidel.component.html',
  styleUrls: ['./gauss-seidel.component.css']
})
export class GaussSeidelComponent implements OnInit {
  titulo = 'Método De Gauss Seidel';
  matrizSize: number = 0;
  matriz: number[][] = [];
  vector: number[] = [];
  resultado: number[] = [];
  error: number[] = [];
  iteraciones: { iteracion: number, x: number[] }[] = [];

  constructor(private gaussService: GaussSeidelService) {}

  ngOnInit(): void {
    this.matrizSize = 2;
  }

  generar(): void {
    if (this.matrizSize < 2 || this.matrizSize > 10) {
      alert('El tamaño de la matriz debe estar entre 2 y 10');
      return;
    }
    this.generateMatriz();
  }

  generateMatriz(): void {
    this.matriz = Array.from({ length: this.matrizSize }, () => Array(this.matrizSize).fill(0));
    this.vector = Array(this.matrizSize).fill(0);
  }

  calculate() {
    // Validar que la matriz no tenga ceros en la diagonal
    for (let i = 0; i < this.matrizSize; i++) {
      if (this.matriz[i][i] === 0) {
        alert(`Error: El elemento diagonal A[${i+1}][${i+1}] no puede ser cero`);
        return;
      }
    }

    // Validar que todos los campos estén completos
    for (let i = 0; i < this.matrizSize; i++) {
      for (let j = 0; j < this.matrizSize; j++) {
        if (this.matriz[i][j] === null || isNaN(this.matriz[i][j])) {
          alert(`Error: Falta completar el elemento A[${i+1}][${j+1}]`);
          return;
        }
      }
      if (this.vector[i] === null || isNaN(this.vector[i])) {
        alert(`Error: Falta completar el elemento b[${i+1}]`);
        return;
      }
    }

    const gauss: GaussSeidel = {
      matriz: this.matriz,
      vector: this.vector,
      error_min: 0.0001,
      iteraciones_max: 100
    };

    this.gaussService.save(gauss).subscribe(
      response => {
        console.log(response);
        this.resultado = response.resultado;
        this.error = response.error;
        this.iteraciones = response.iteraciones;
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
}