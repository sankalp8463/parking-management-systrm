// import { routes } from './../../app.routes';
import { Toast, ToastService } from './../../services/toast.service';
import { ApiService } from './../../services/api.service';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginData = {
    phoneNumber: '',
    password: ''
  };

  // Carousel images
  images: string[] = [
    'assets/images/slide1.png',
    'assets/images/slide2.png',
    'assets/images/slide3.png'
  ];

  currentSlide = 0;

  constructor(private apiService:ApiService,private toast:ToastService,private router:Router) {
    // Auto change slides every 3s
    setInterval(() => {
      this.nextSlide();
    }, 3000);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.images.length;
  }

  onLogin() {
    if (this.loginData.phoneNumber && this.loginData.password) {
      console.log('Login successful', this.loginData);
      this.apiService.login(this.loginData).subscribe({
        next: (response) => {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.toast.success('Login successful! Welcome back.');
          window.location.reload();

          this.router.navigate(['/dashboard']);

        },
        error: (error) => {
          console.error('Login error:', error);
          this.toast.error('Login failed. Please check your credentials.');
        }
      });
    }
    }
  }


