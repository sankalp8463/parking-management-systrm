import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { forkJoin } from 'rxjs';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { TimelineModule } from 'primeng/timeline';
import { PanelModule } from 'primeng/panel';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { DividerModule } from 'primeng/divider';

interface RecentActivity {
  time: string;
  text: string;
  type: 'park' | 'payment' | 'exit';
  vehicle?: string;
  slot?: string;
  amount?: number;
}

interface ChartData {
  labels: string[];
  datasets: any[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    // PrimeNG Modules
    CardModule,
    ButtonModule,
    ChartModule,
    TableModule,
    TagModule,
    TooltipModule,
    ProgressBarModule,
    TimelineModule,
    PanelModule,
    RippleModule,
    AvatarModule,
    BadgeModule,
    DividerModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  stats = {
    totalVehicles: 7, // Default values matching your screenshot
    activeEntries: 2,
    availableSlots: 11,
    dailyRevenue: 60
  };
  
  isLoading = false;
  lastUpdated = new Date();
  animateStats = false;
  
  // Chart Data
  occupancyChartData: ChartData = { labels: [], datasets: [] };
  revenueChartData: ChartData = { labels: [], datasets: [] };
  chartOptions: any = {};
  
  // Timeline Events for Recent Activity
  timelineEvents: any[] = [];
  
  recentActivities: RecentActivity[] = [
    { time: '10:30 AM', text: 'Vehicle ABC123 parked in slot A1', type: 'park', vehicle: 'ABC123', slot: 'A1' },
    { time: '10:15 AM', text: 'Payment received for vehicle XYZ789', type: 'payment', vehicle: 'XYZ789', amount: 25 },
    { time: '09:45 AM', text: 'Vehicle DEF456 exited from slot B2', type: 'exit', vehicle: 'DEF456', slot: 'B2' }
  ];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.initializeCharts();
    this.setupTimeline();
    this.loadStats();
    this.startAutoRefresh();
  }

  initializeCharts() {
    // Revenue Trend Chart with better styling
    this.revenueChartData = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Revenue (₹)',
        data: [450, 520, 380, 670, 590, 720, 450],
        fill: true,
        backgroundColor: 'rgba(78, 205, 196, 0.2)',
        borderColor: '#4ECDC4',
        tension: 0.4,
        pointBackgroundColor: '#4ECDC4',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    };

    this.chartOptions = {
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            font: {
              family: 'Inter, sans-serif',
              size: 12
            },
            color: '#2c3e50'
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0,0,0,0.1)',
            drawBorder: false
          },
          ticks: {
            color: '#7f8c8d',
            font: {
              family: 'Inter, sans-serif'
            }
          }
        },
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: '#7f8c8d',
            font: {
              family: 'Inter, sans-serif'
            }
          }
        }
      },
      elements: {
        point: {
          hoverBorderWidth: 3
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    };
  }

  setupTimeline() {
    this.timelineEvents = this.recentActivities.map((activity, index) => ({
      status: this.getActivityStatus(activity.type),
      date: activity.time,
      icon: this.getActivityIcon(activity.type),
      color: this.getActivityColor(activity.type),
      description: activity.text,
      vehicle: activity.vehicle,
      slot: activity.slot,
      amount: activity.amount
    }));
  }

  getActivityStatus(type: string): string {
    switch (type) {
      case 'park': return 'Parked';
      case 'payment': return 'Payment';
      case 'exit': return 'Exited';
      default: return 'Activity';
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'park': return 'pi pi-map-marker';
      case 'payment': return 'pi pi-credit-card';
      case 'exit': return 'pi pi-sign-out';
      default: return 'pi pi-info-circle';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'park': return '#4ECDC4';
      case 'payment': return '#45B7D1';
      case 'exit': return '#FF6B6B';
      default: return '#95A5A6';
    }
  }

  getSeverityForActivity(status: string): "success" | "secondary" | "info" | "warning" | "danger" | "contrast" | undefined {
    switch (status.toLowerCase()) {
      case 'parked': return 'success';
      case 'payment': return 'info';
      case 'exited': return 'warning';
      default: return 'secondary';
    }
  }

  getOccupancyPercentage(): number {
    const total = this.stats.activeEntries + this.stats.availableSlots;
    return total > 0 ? Math.round((this.stats.activeEntries / total) * 100) : 0;
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
    
    // Check if ApiService exists and has required methods
    if (!this.apiService || typeof this.apiService.getVehicles !== 'function') {
      console.warn('ApiService not available or methods missing, using mock data');
      this.isLoading = false;
      this.lastUpdated = new Date();
      return;
    }
    
    forkJoin({
      vehicles: this.apiService.getVehicles(),
      activeEntries: this.apiService.getActiveEntries(),
      availableSlots: this.apiService.getAvailableSlots(),
      payments: this.apiService.getPayments()
    }).subscribe({
      next: (data) => {
        // Calculate daily revenue (today only)
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
        
        const newStats = {
          totalVehicles: data.vehicles.length,
          activeEntries: data.activeEntries.length,
          availableSlots: data.availableSlots.length,
          dailyRevenue: data.payments
            .filter((p: any) => {
              const paymentDate = new Date(p.paymentDate);
              return p.paymentStatus === 'completed' &&
                     paymentDate >= startOfDay &&
                     paymentDate <= endOfDay;
            })
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
        // Keep existing stats or use defaults
        this.isLoading = false;
        this.lastUpdated = new Date();
      }
    });
  }

  getTimeAgo(): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - this.lastUpdated.getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }
  
}