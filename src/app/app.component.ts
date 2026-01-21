import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { defer, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SignJWT, jwtVerify } from 'jose';

// Декоратор компонента приложения
@Component({
  selector: 'app-root',
  standalone: true, // Не нужно регистрировать ngModele
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  login = '';
  password = '';
  message = '';
  token = '';
  jwtToken = '';
  decodedToken = '';
  errorMessage = '';

  // Кодирование токена, использовал RxJS
  encodeToken$() {
    // В момент подписки, выполняется код
    return defer(async () => {
      // Если нет всех полей пробрасываем ошибку
      if (!this.login || !this.password || !this.message || !this.jwtToken) {
        throw new Error('Все поля обязательны для заполнения');
      }

      const secret = new TextEncoder().encode(this.jwtToken);
      const exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

      // Кодируем токен на основании полученных полей
      return new SignJWT({
        login: this.login,
        password: this.password,
        message: this.message,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(exp)
        .sign(secret);
    }).pipe(
      tap((token) => {
        // Устанавливаем токен
        this.token = token;
        this.errorMessage = '';
      }),
      catchError((error: any) => {
        // Если что-то пошло не так, то записываю в errorMessage сообщение с ошибкой
        this.errorMessage = 'Ошибка при создании токена: ' + error.message;
        return of(null);
      }),
    );
  }

  // Обертка в функцию для обработки события из шаблона
  encodeToken() {
    this.encodeToken$().subscribe();
  }

  // Декодирование токена, и получение объекта, который был закодирован, использовал RxJS
  decodeToken$() {
    // В момент подписки, выполняется код
    return defer(async () => {
      // Если нет токена или JWT
      if (!this.token || !this.jwtToken) {
        throw new Error('Введите токен и секрет для декодирования');
      }

      const secret = new TextEncoder().encode(this.jwtToken);
      const { payload } = await jwtVerify(this.token, secret, {
        algorithms: ['HS256'],
      });

      // Передаем дальше нагрузку
      return payload;
    }).pipe(
      tap((payload) => {
        // Декодирую на основании полученных данных
        this.decodedToken = JSON.stringify(payload, null, 2);
        this.errorMessage = '';
      }),
      // Если что-то пошло не так, то записываю в errorMessage сообщение с ошибкой
      catchError((error: any) => {
        this.errorMessage = 'Ошибка при декодировании токена: ' + error.message;
        return of(null);
      }),
    );
  }

  // Обертка в функцию для обработки события из шаблона
  decodeToken() {
    this.decodeToken$().subscribe();
  }

  randomGenerateToken(): void {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    this.jwtToken = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
}
