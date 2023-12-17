import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { University } from '../models/universities.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);

  private url = `http://universities.hipolabs.com/search`;

  getUniversities() {
    return this.http.get<University[]>(this.url);
  }
}
