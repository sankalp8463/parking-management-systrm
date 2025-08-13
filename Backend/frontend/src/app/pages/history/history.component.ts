import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  historyRecords: any[] = [];
  historyStats = {
    total: 0,
    revenue: 0,
    avgHours: 0
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.apiService.getParkingHistory().subscribe({
      next: (data) => {
        this.historyRecords = data;
        this.calculateStats();
      },
      error: (error) => {
        console.error('Error loading history:', error);
      }
    });
  }

  calculateStats() {
    this.historyStats.total = this.historyRecords.length;
    this.historyStats.revenue = this.historyRecords
      .reduce((sum, record) => sum + record.entryInfo.totalAmount, 0);
    this.historyStats.avgHours = this.historyRecords.length > 0 
      ? Math.round(this.historyRecords
          .reduce((sum, record) => sum + record.entryInfo.totalHours, 0) / this.historyRecords.length)
      : 0;
  }
}