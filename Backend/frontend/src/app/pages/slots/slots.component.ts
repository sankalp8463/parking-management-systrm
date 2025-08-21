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
  filterType = '';
  showAddModal = false;
  editingSlot: any = null;
  selectedSlotForBooking = '';

  rows = ['A', 'B', 'C', 'D'];
  cols = [1, 2, 3, 4, 5, 6];

  floors = [
    { type: 'bike', label: 'Underground – Bikes' },
    { type: 'car', label: 'First Floor – Cars' },
    { type: 'truck', label: 'Second Floor – Trucks' }
  ];

  // Proper type for TS
  slotStats: { [key in 'available' | 'occupied' | 'maintenance' | 'total']: number } = {
    available: 0,
    occupied: 0,
    maintenance: 0,
    total: 0
  };

  newSlot = {
    slotNumber: '',
    vehicleType: '',
    hourlyRate: 5,
    status: 'available'
  };

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.loadSlots();
  }

  loadSlots() {
    this.api.getParkingSlots().subscribe({
      next: (data) => {
        this.slots = data;
        this.calculateStats();
      },
      error: (err) => console.error(err)
    });
  }

  calculateStats() {
    this.slotStats.total = this.slots.length;
    this.slotStats.available = this.slots.filter(s => s.status === 'available').length;
    this.slotStats.occupied = this.slots.filter(s => s.status === 'occupied').length;
    this.slotStats.maintenance = this.slots.filter(s => s.status === 'maintenance').length;
  }

  getSortedFilteredSlots() {
    let arr = [...this.slots];
    if (this.filterType) {
      arr = arr.filter(x => x.vehicleType === this.filterType);
    }
    // available → occupied → maintenance
    return arr.sort((a, b) => {
      const order = { available: 1, occupied: 2, maintenance: 3 } as any;
      return order[a.status] - order[b.status];
    });
  }

  getSlotClass(num: string, type: string) {
    const s = this.slots.find(
      x => x.slotNumber.toUpperCase() === num.toUpperCase() && x.vehicleType === type
    );
    return s ? s.status : 'default';
  }

  selectSlot(slot: any) {
    console.log('selected slot:', slot);
  }

  selectSlotFromMatrix(num: string, type: string) {
    const s = this.slots.find(
      x => x.slotNumber.toUpperCase() === num.toUpperCase() && x.vehicleType === type
    );
    if (s) {
      console.log('selected slot:', s);
    } else {
      // Create a new slot when clicking on an available (non-existent) slot
      const newSlot = {
        slotNumber: num,
        vehicleType: type,
        hourlyRate: type === 'bike' ? 5 : type === 'car' ? 10 : 15, // Default rates
        status: 'available'
      };

      this.api.createParkingSlot(newSlot).subscribe({
        next: (createdSlot) => {
          this.slots.push(createdSlot);
          this.calculateStats();
          console.log('Created new slot:', createdSlot);
        },
        error: (e) => console.error('Error creating slot:', e)
      });
    }
  }

  openAddModal() {
    this.showAddModal = true;
    this.resetForm();
  }

  closeAddModal() {
    this.showAddModal = false;
    this.resetForm();
  }

  private resetForm() {
    this.newSlot = {
      slotNumber: '',
      vehicleType: '',
      hourlyRate: 5,
      status: 'available'
    };
    this.selectedSlotForBooking = '';
  }

  onVehicleTypeChange() {
    // Reset selected slot when vehicle type changes
    this.selectedSlotForBooking = '';
    this.newSlot.slotNumber = '';

    // Set default hourly rate based on vehicle type
    switch (this.newSlot.vehicleType) {
      case 'bike':
        this.newSlot.hourlyRate = 5;
        break;
      case 'car':
        this.newSlot.hourlyRate = 10;
        break;
      case 'truck':
        this.newSlot.hourlyRate = 15;
        break;
      default:
        this.newSlot.hourlyRate = 5;
    }
  }

  // Get available slots for the selected vehicle type
getAvailableSlotsByType(vehicleType: string) {
  if (!vehicleType) return [];
  return this.slots
    .filter(slot => slot.vehicleType === vehicleType && slot.status === 'available')
    .sort((a, b) => a.slotNumber.localeCompare(b.slotNumber));
}

  // Get empty slots (not yet created) for the selected vehicle type
getEmptySlotsByType(vehicleType: string): string[] {
  if (!vehicleType) return [];

  const existingSlotsForType = this.slots
    .filter(slot => slot.vehicleType === vehicleType)
    .map(slot => slot.slotNumber.toUpperCase());

  const allPossibleSlots: string[] = [];


    // Generate all possible slot combinations based on vehicle type
  this.rows.forEach(row => {
    this.cols.forEach(col => {
      let slotNumber = '';

      if (vehicleType === 'bike') {
        slotNumber = row + col;
      } else if (vehicleType === 'car') {
        slotNumber = this.toChar(row, 4) + col;
      } else if (vehicleType === 'truck') {
        slotNumber = this.toChar(row, 10) + col;
      }

      if (slotNumber && !existingSlotsForType.includes(slotNumber.toUpperCase())) {
        allPossibleSlots.push(slotNumber);
      }
    });
  });

  return allPossibleSlots.sort();
}

selectSlotForBooking(slot: any) {
  this.newSlot.slotNumber = slot.slotNumber;

  // Remove selection from all preview slots
  const previewSlots = document.querySelectorAll('.preview-slot');
  previewSlots.forEach(el => el.classList.remove('selected'));

  // Add selection to clicked slot
  if (event?.target) {
    (event.target as HTMLElement).classList.add('selected');
  }
}

selectEmptySlot(slotNumber: string) {
  this.newSlot.slotNumber = slotNumber;

  // Remove selection from all preview slots
  const previewSlots = document.querySelectorAll('.preview-slot');
  previewSlots.forEach(el => el.classList.remove('selected'));

  // Add selection to clicked slot
  if (event?.target) {
    (event.target as HTMLElement).classList.add('selected');
  }
}

  

  isFormValid(): boolean {
    return !!(
      this.newSlot.slotNumber &&
      this.newSlot.vehicleType &&
      this.newSlot.hourlyRate > 0
    );
  }

  addSlot() {
    if (!this.isFormValid()) {
      alert('Please fill in all required fields');
      return;
    }

    console.log('Sending:', this.newSlot);
    this.api.createParkingSlot(this.newSlot).subscribe({
      next: (d) => {
        this.slots.push(d);
        this.calculateStats();
        alert('Slot added successfully!');
        this.closeAddModal();
      },
      error: (e) => {
        console.error(e);
        alert('Error adding slot. Please try again.');
      }
    });
  }

  editSlot(slot: any) {
    this.editingSlot = { ...slot };
  }

  updateSlot() {
    this.api.updateParkingSlot(this.editingSlot._id, this.editingSlot).subscribe({
      next: (d) => {
        const i = this.slots.findIndex(x => x._id === this.editingSlot._id);
        if (i !== -1) this.slots[i] = d;
        this.calculateStats();
        this.editingSlot = null;
      },
      error: (e) => console.error(e)
    });
  }

  deleteSlot(id: string) {
    if (confirm('Are you sure you want to delete this slot?')) {
      this.api.deleteParkingSlot(id).subscribe({
        next: () => {
          this.slots = this.slots.filter(x => x._id !== id);
          this.calculateStats();
          alert('Slot deleted successfully!');
        },
        error: (e) => console.error(e)
      });
    }
  }

  convertForDisplay(slot: any): string {
    const letter = slot.slotNumber[0];
    const num = slot.slotNumber.slice(1);

    if (slot.vehicleType === 'car') {
      // reverse shift => E/F/G/H (backend) → A/B/C/D (display)
      return String.fromCharCode(letter.charCodeAt(0) - 4) + num;
    }
    if (slot.vehicleType === 'truck') {
      // reverse shift => L/M/N/O (backend) → A/B/C/D (display)
      return String.fromCharCode(letter.charCodeAt(0) - 10) + num;
    }
    return slot.slotNumber; // bikes stay same
  }

  toChar(base: string, offset: number) {
    return String.fromCharCode(base.charCodeAt(0) + offset);
  }

  getSlotsByType(vehicleType: string) {
    return this.slots
      .filter(slot => slot.vehicleType === vehicleType)
      .sort((a, b) => {
        const order = { available: 1, occupied: 2, maintenance: 3 } as any;
        return order[a.status] - order[b.status];
      });
  }

}
