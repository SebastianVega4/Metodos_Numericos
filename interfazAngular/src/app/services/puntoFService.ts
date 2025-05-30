import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PuntoF } from '../models/PuntoF';

@Injectable({
  providedIn: 'root'
})
export class PuntoFService {
  private url = 'http://localhost:5001/punto_fijo'

  constructor(private http: HttpClient) { }

  save(puntoF: PuntoF): Observable<any> {
    return this.http.post(this.url, puntoF).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }
}