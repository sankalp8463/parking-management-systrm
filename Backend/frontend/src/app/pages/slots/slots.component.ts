import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-slots',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './slots.component.html',
  styleUrl: './slots.component.css'
})
export class SlotsComponent implements OnInit {
  slots: any[] = [];
  editingSlot: any = null;
  
  newSlot = {
    slotNumber: '',
    vehicleType: 'car',
    hourlyRate: 5,
    status: 'available'
  };

  slotStats = {
    available: 0,
    occupied: 0,
    maintenance: 0,
    total: 0
  };

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadSlots();
  }

  loadSlots() {
    this.apiService.getParkingSlots().subscribe({
      next: (data) => {
        this.slots = data;
        this.calculateStats();
      },
      error: (error) => {
        console.error('Error loading slots:', error);
      }
    });
  }

  calculateStats() {
    this.slotStats.total = this.slots.length;
    this.slotStats.available = this.slots.filter(s => s.status === 'available').length;
    this.slotStats.occupied = this.slots.filter(s => s.status === 'occupied').length;
    this.slotStats.maintenance = this.slots.filter(s => s.status === 'maintenance').length;
  }

  addSlot() {
    this.apiService.createParkingSlot(this.newSlot).subscribe({
      next: (data) => {
        this.slots.push(data);
        this.calculateStats();
        this.newSlot = {
          slotNumber: '',
          vehicleType: 'car',
          hourlyRate: 5,
          status: 'available'
        };
        alert('Parking slot added successfully!');
      },
      error: (error) => {
        console.error('Error adding slot:', error);
        alert('Error adding parking slot');
      }
    });
  }

  editSlot(slot: any) {
    this.editingSlot = { ...slot };
  }

  updateSlot() {
    this.apiService.updateParkingSlot(this.editingSlot._id, this.editingSlot).subscribe({
      next: (data) => {
        const index = this.slots.findIndex(s => s._id === this.editingSlot._id);
        if (index !== -1) {
          this.slots[index] = data;
        }
        this.calculateStats();
        this.closeModal();
        alert('Parking slot updated successfully!');
      },
      error: (error) => {
        console.error('Error updating slot:', error);
        alert('Error updating parking slot');
      }
    });
  }

  deleteSlot(id: string) {
    if (confirm('Are you sure you want to delete this parking slot?')) {
      this.apiService.deleteParkingSlot(id).subscribe({
        next: () => {
          this.slots = this.slots.filter(s => s._id !== id);
          this.calculateStats();
          alert('Parking slot deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting slot:', error);
          alert('Error deleting parking slot');
        }
      });
    }
  }

  selectSlot(slot: any) {
    console.log('Selected slot:', slot);
    // Could be used for additional functionality
  }

  closeModal() {
    this.editingSlot = null;
  }
}