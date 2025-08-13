import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastComponent } from './components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'ParkEase';
  isLoggedIn = false;
  sidebarCollapsed = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkLoginStatus();
  }

  checkLoginStatus() {
    this.isLoggedIn = !!localStorage.getItem('token');
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }
}
