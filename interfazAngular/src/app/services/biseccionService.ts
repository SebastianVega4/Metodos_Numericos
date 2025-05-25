import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Biseccion } from '../models/biseccion';

@Injectable({
  providedIn: 'root'
})
export class BiseccionService {
  private url = 'http://localhost:5002/biseccion'

  constructor(private http: HttpClient) { }

  save(biseccion: Biseccion): Observable<any> {
    return this.http.post(this.url, biseccion).pipe(
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