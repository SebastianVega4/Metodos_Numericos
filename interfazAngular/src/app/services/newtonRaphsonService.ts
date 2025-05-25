import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NewtonRaphson } from "src/app/models/NewtonRaphson";

@Injectable({
  providedIn: 'root'
})
export class NewtonRaphsonService {
  private url = 'http://localhost:5000/newton_raphson'

  constructor(private http: HttpClient) { }

  save(newtonRaphson: NewtonRaphson): Observable<any> {
    return this.http.post(this.url, newtonRaphson).pipe(
      catchError(error => {
        let errorMessage = 'Error desconocido';
        if (error.error && error.error.error) {
          errorMessage = error.error.error;
        } else if (error.status === 0) {
          errorMessage = 'No se pudo conectar al servidor. Verifique su conexión.';
        } else if (error.status === 400) {
          errorMessage = 'Datos inválidos enviados al servidor.';
        } else if (error.status === 500) {
          errorMessage = 'Error interno del servidor.';
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}