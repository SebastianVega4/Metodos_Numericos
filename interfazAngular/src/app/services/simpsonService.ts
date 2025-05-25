// simpsonService.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Simpson } from '../models/Simpson';

@Injectable({
  providedIn: 'root'
})
export class SimpsonService {
  private url = 'http://localhost:5008/simpson'

  constructor(private http: HttpClient) { }

  save(simpson: Simpson): Observable<any> {
    return this.http.post(this.url, simpson).pipe(
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