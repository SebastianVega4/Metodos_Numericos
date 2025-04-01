import { Component, OnInit } from '@angular/core';
import { GaussSeidelService } from 'src/app/services/gaussSeidelService';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Jacobi } from 'src/app/models/jacobi';
import { JacobiService } from 'src/app/services/jacobiService';

@Component({
  selector: 'app-gauss-seidel',
  templateUrl: './gauss-seidel.component.html',
  styleUrls: ['./gauss-seidel.component.css']
})
export class GaussSeidelComponent implements OnInit {

  titulo = 'Método De Jacobi';
  matrizSize: number = 0;
  matriz: string[][] = []; // Cambiar a string[][]
  vector: string[] = [];   // Cambiar a string[]
  resultado: [] = [];
  iteraciones: { iteration: number, error: number, x: number[] }[] = [];

  constructor(private fb: FormBuilder, private jacobiService: JacobiService) {}

  ngOnInit(): void {
    this.matrizSize = 2;
  }

  generar(): void {
    this.generateMatriz();
  }

  generateMatriz(): void {
    this.matriz = Array.from({ length: this.matrizSize }, () =>
      Array(this.matrizSize).fill(''));
    this.vector = Array(this.matrizSize).fill('');
  }

  parseValue(value: string): number {
    const cleanedValue = value.replace(/\s/g, '');
    const regex = /^([+-]?)(\d*\.?\d*|\.\d+)(x\d*)?$/;
    const match = cleanedValue.match(regex);

    if (!match) return 0;

    const sign = match[1] === '-' ? -1 : 1;
    const numberPart = match[2] || '1';
    return sign * (numberPart === '' ? 1 : parseFloat(numberPart));
  }

  calculate() {
    const matrizNumerica = this.matriz.map(row =>
      row.map(cell => this.parseValue(cell)));
    const vectorNumerico = this.vector.map(val => this.parseValue(val));

    const gaussData = {
      matriz: matrizNumerica,
      vector: vectorNumerico,
      error_min: 0.0001,
      iteraciones_max: 100
    };

    this.gaussService.save(gaussData).subscribe(
      response => {
        this.resultado = response.resultado;
        this.error = response.error;
        this.iteraciones = response.iteraciones;
      },
      error => {
        console.error('Error:', error.error?.error || error.message);
      }
    );
  }
}
