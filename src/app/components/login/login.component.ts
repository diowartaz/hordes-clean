import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
} from '@angular/core';
import { take } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthResponse, SignInParams } from '../../models/auth';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface SignInForm {
  login: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, MatProgressSpinnerModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  formgroup!: FormGroup<SignInForm>;
  loginLoading = false;
  invalidAuthentification = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const savedLogin: string = localStorage.getItem('login') ?? '';

    this.formgroup = new FormGroup<SignInForm>({
      login: new FormControl<string>(savedLogin, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      password: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });

    this.formgroup.valueChanges
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(() => {
        this.invalidAuthentification = false;
      });
  }

  login() {
    if (this.loginLoading) {
      return;
    }
    this.formgroup.markAllAsTouched();
    if (this.formgroup.invalid) {
      this.invalidAuthentification = true;
      return;
    }
    this.loginLoading = true;
    const params: SignInParams = {
      login: this.formgroup.controls.login.value,
      password: this.formgroup.controls.password.value,
    };
    this.authService
      .signIn(params)
      .pipe(take(1))
      .subscribe((result: AuthResponse) => {
        this.invalidAuthentification = false;
        localStorage.setItem('token', result.token);
        localStorage.setItem('login', params.login);
        this.router.navigate(['load-player']);
        this.loginLoading = false;
      });
  }

  loginTemp() {
    if (this.loginLoading) {
      return;
    }
    this.loginLoading = true;

    this.authService
      .signInTemp()
      .pipe(take(1))
      .subscribe((result: AuthResponse) => {
        localStorage.setItem('token', result.token);
        localStorage.setItem('login', result.email);
        this.router.navigate(['load-player']);
        this.loginLoading = false;
      });
  }

  signUp() {
    this.router.navigate(['signup']);
  }

  forgotPassword() {
    console.log('TODO');
  }

  fieldHasError(field: keyof SignInForm): boolean {
    const control = this.formgroup.controls[field];
    return control.touched && control.invalid;
  }
}
