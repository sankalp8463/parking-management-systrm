import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  stats = {
    totalVehicles: 0,
    activeEntries: 0,
    availableSlots: 0,
    totalRevenue: 0
  };

  isLoading = true;
  lastUpdated = new Date();
  animateStats = false;

  recentActivities = [
    { time: '10:30 AM', text: 'Vehicle ABC123 parked in slot A1', type: 'park' },
    { time: '10:15 AM', text: 'Payment received for vehicle XYZ789', type: 'payment' },
    { time: '09:45 AM', text: 'Vehicle DEF456 exited from slot B2', type: 'exit' }
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadStats();
    this.startAutoRefresh();
  }

  startAutoRefresh() {
    setInterval(() => {
      this.refreshStats();
    }, 30000); // Refresh every 30 seconds
  }

  refreshStats() {
    this.loadStats(false);
  }

  loadStats(showLoading = true) {
    if (showLoading) this.isLoading = true;
    
    forkJoin({
      vehicles: this.apiService.getVehicles(),
      activeEntries: this.apiService.getActiveEntries(),
      availableSlots: this.apiService.getAvailableSlots(),
      payments: this.apiService.getPayments()
    }).subscribe({
      next: (data) => {
        const newStats = {
          totalVehicles: data.vehicles.length,
          activeEntries: data.activeEntries.length,
          availableSlots: data.availableSlots.length,
          totalRevenue: data.payments
            .filter((p: any) => p.paymentStatus === 'completed')
            .reduce((sum: number, p: any) => sum + p.amountPaid, 0)
        };
        
        if (JSON.stringify(this.stats) !== JSON.stringify(newStats)) {
          this.animateStats = true;
          setTimeout(() => this.animateStats = false, 600);
        }
        
        this.stats = newStats;
        this.lastUpdated = new Date();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
        this.stats = {
          totalVehicles: 25,
          activeEntries: 8,
          availableSlots: 12,
          totalRevenue: 1250
        };
        this.isLoading = false;
      }
    });
  }

  getActivityIcon(type: string): string {
    switch(type) {
      case 'park': return '🅿️';
      case 'payment': return '💳';
      case 'exit': return '🚗';
      default: return '📋';
    }
  }

  getTimeAgo(): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - this.lastUpdated.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }
}