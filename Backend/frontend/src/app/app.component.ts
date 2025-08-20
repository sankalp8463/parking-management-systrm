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
  showMobileSidebar = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkLoginStatus();
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());
  }
  
  handleResize() {
    if (window.innerWidth > 768 && this.showMobileSidebar) {
      this.showMobileSidebar = false;
    }
  }

  checkLoginStatus() {
    this.isLoggedIn = !!localStorage.getItem('token');
  }

  toggleSidebar() {
    if (window.innerWidth <= 768) {
      this.showMobileSidebar = !this.showMobileSidebar;
    } else {
      this.sidebarCollapsed = !this.sidebarCollapsed;
    }
  }

  closeMobileSidebar() {
    this.showMobileSidebar = false;
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedIn = false;
    this.showMobileSidebar = false;
    this.router.navigate(['/']);
  }
}
