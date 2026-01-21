import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { defer, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SignJWT, jwtVerify } from 'jose';

// Декоратор компонента приложения
@Component({
  selector: 'app-root',
  standalone: true, // Не нужно регистрировать ngModele
  imports: [CommonModule, RouterOutlet, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  encodeForm = new FormGroup({
    login: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    message: new FormControl('', [Validators.required]),
    jwtToken: new FormControl('', [Validators.required]),
  });

  decodeForm = new FormGroup({
    token: new FormControl(''),
    decodedToken: new FormControl(''),
  });

  errorMessage = new FormControl('');

  // Кодирование токена, использовал RxJS
  encodeToken$() {
    // В момент подписки, выполняется код
    return defer(async () => {
      // Если нет всех полей пробрасываем ошибку
      if (
        !this.encodeForm.value.login ||
        !this.encodeForm.value.password ||
        !this.encodeForm.value.message ||
        !this.encodeForm.value.jwtToken
      ) {
        throw new Error('Все поля обязательны для заполнения');
      }

      const secret = new TextEncoder().encode(this.encodeForm.value.jwtToken);
      const exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60;

      // Кодируем токен на основании полученных полей
      return await new SignJWT({
        login: this.encodeForm.value.login,
        password: this.encodeForm.value.password,
        message: this.encodeForm.value.message,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime(exp)
        .sign(secret);
    }).pipe(
      tap((token) => {
        // Устанавливаем токен
        this.decodeForm.get('token')?.setValue(token);
        this.errorMessage.setValue('');
      }),
      catchError((error: any) => {
        // Если что-то пошло не так, то записываю в errorMessage сообщение с ошибкой
        this.errorMessage.setValue('Ошибка при создании токена: ' + error.message);
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
      if (!this.decodeForm.value.token || !this.encodeForm.value.jwtToken) {
        throw new Error('Введите токен и секрет для декодирования');
      }

      const secret = new TextEncoder().encode(this.encodeForm.value.jwtToken);
      const { payload } = await jwtVerify(this.decodeForm.value.token, secret, {
        algorithms: ['HS256'],
      });

      // Передаем дальше нагрузку
      return await payload;
    }).pipe(
      tap((payload) => {
        // Декодирую на основании полученных данных
        this.decodeForm.get('decodedToken')?.setValue(JSON.stringify(payload, null, 2));
        this.errorMessage.setValue('');
      }),
      // Если что-то пошло не так, то записываю в errorMessage сообщение с ошибкой
      catchError((error: any) => {
        this.errorMessage.setValue('Ошибка при декодировании токена: ' + error.message);
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
    this.encodeForm.get('jwtToken')?.setValue(Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(''));
  }
}
