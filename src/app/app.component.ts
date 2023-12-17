import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ApiService } from './core/services/api.service';
import {
  Observable,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
} from 'rxjs';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { University } from './core/models/universities.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  private api = inject(ApiService);

  public universities$ = this.api.getUniversities();
  public countryControl = new FormControl('', { nonNullable: true });
  public nameControl = new FormControl('', { nonNullable: true });

  public countryControl$: Observable<string> =
    this.countryControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged()
    );

  public nameControl$: Observable<string> = this.nameControl.valueChanges.pipe(
    startWith(''),
    debounceTime(300),
    distinctUntilChanged()
  );

  public filteredUniversities$ = combineLatest([
    this.universities$,
    this.countryControl$,
    this.nameControl$,
  ]).pipe(
    map(([universities, country, name]) => {
      const filteredUniversities = this.filterUniversities(
        universities,
        country,
        name
      );
      const sortedUniversities = filteredUniversities.sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      return sortedUniversities.slice(0, 10);
    })
  );

  public countries$ = this.universities$.pipe(
    map((universities) => {
      return [...new Set(universities.map((university) => university.country))];
    })
  );

  private filterUniversities(
    universities: University[],
    country: string,
    name: string
  ) {
    return universities.filter((university) => {
      const countryMatch = university.country
        .toLowerCase()
        .includes(country.toLowerCase());
      const nameMatch = university.name
        .toLowerCase()
        .includes(name.trim().toLowerCase());
      return countryMatch && nameMatch;
    });
  }

  ngOnInit(): void {
    this.api.getUniversities().subscribe((data) => {
      console.log(data);
    });
  }
}
