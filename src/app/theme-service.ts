import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private _isDarkTheme = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this._isDarkTheme.asObservable();

  toggleTheme() {
    this._isDarkTheme.next(!this._isDarkTheme.value);
    document.body.style.colorScheme = this._isDarkTheme.value ? 'dark' : 'light';
  }

  constructor() {
    const initialTheme = localStorage.getItem('theme') || 'light';
    document.body.style.colorScheme = initialTheme;
    this._isDarkTheme.next(initialTheme === 'dark');
  }
}