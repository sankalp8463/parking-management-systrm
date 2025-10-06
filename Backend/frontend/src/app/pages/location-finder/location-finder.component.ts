import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

declare var L: any;

@Component({
  selector: 'app-location-finder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './location-finder.component.html',
  styleUrl: './location-finder.component.css'
})
export class LocationFinderComponent implements OnInit, AfterViewInit {
  locations: any[] = [];
  filteredLocations: any[] = [];
  searchTerm = '';
  userLocation: { latitude: number; longitude: number } | null = null;
  isLoading = true;
  map: any;
  markers: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadLocations();
    this.getCurrentLocation();
  }

  ngAfterViewInit() {
    this.initializeMap();
  }

  initializeMap() {
    // Default center (you can change this to your preferred location)
    const defaultLat = 19.0760;
    const defaultLng = 72.8777; // Mumbai coordinates
    
    this.map = L.map('map').setView([defaultLat, defaultLng], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    
    // Add markers once locations are loaded
    if (this.locations.length > 0) {
      this.addMarkersToMap();
    }
  }

  addMarkersToMap() {
    // Clear existing markers
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];
    
    // Add user location marker if available
    if (this.userLocation) {
      const userMarker = L.marker([this.userLocation.latitude, this.userLocation.longitude])
        .addTo(this.map)
        .bindPopup('Your Location')
        .openPopup();
      
      const userIcon = L.divIcon({
        html: '<div style="background: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white;"></div>',
        iconSize: [20, 20],
        className: 'user-location-marker'
      });
      userMarker.setIcon(userIcon);
      this.markers.push(userMarker);
    }
    
    // Add parking location markers
    this.filteredLocations.forEach(location => {
      const marker = L.marker([location.coordinates.latitude, location.coordinates.longitude])
        .addTo(this.map)
        .bindPopup(`
          <div class="map-popup">
            <h4>${location.locationName}</h4>
            <p><strong>Address:</strong> ${location.address}</p>
            <p><strong>Contact:</strong> ${location.contactInfo.phone}</p>
            <p><strong>Hours:</strong> ${location.operatingHours.open} - ${location.operatingHours.close}</p>
            <p><strong>Total Slots:</strong> ${location.totalSlots}</p>
            <p><strong>Admin:</strong> ${location.adminId.name}</p>
            ${location.distance ? `<p><strong>Distance:</strong> ${location.distance.toFixed(1)} km</p>` : ''}
            <div class="popup-actions">
              <button onclick="window.open('https://www.google.com/maps?q=${location.coordinates.latitude},${location.coordinates.longitude}', '_blank')" class="btn-sm btn-primary">View on Maps</button>
              ${this.userLocation ? `<button onclick="window.open('https://www.google.com/maps/dir/${this.userLocation!.latitude},${this.userLocation!.longitude}/${location.coordinates.latitude},${location.coordinates.longitude}', '_blank')" class="btn-sm btn-secondary">Get Directions</button>` : ''}
            </div>
          </div>
        `);
      
      // Custom parking icon
      const parkingIcon = L.divIcon({
        html: '<div style="background: #3b82f6; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">P</div>',
        iconSize: [30, 30],
        className: 'parking-marker'
      });
      marker.setIcon(parkingIcon);
      
      this.markers.push(marker);
    });
    
    // Fit map to show all markers
    if (this.markers.length > 0) {
      const group = new L.featureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  loadLocations() {
    this.apiService.getAllLocations().subscribe({
      next: (locations) => {
        this.locations = locations;
        this.filteredLocations = locations;
        this.isLoading = false;
        this.calculateDistances();
        // Add markers to map if map is already initialized
        if (this.map) {
          this.addMarkersToMap();
        }
      },
      error: (error) => {
        console.error('Error loading locations:', error);
        this.isLoading = false;
      }
    });
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          this.calculateDistances();
          // Update map with user location if map is initialized
          if (this.map) {
            this.addMarkersToMap();
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }

  calculateDistances() {
    if (!this.userLocation) return;

    this.filteredLocations = this.filteredLocations.map(location => ({
      ...location,
      distance: this.calculateDistance(
        this.userLocation!.latitude,
        this.userLocation!.longitude,
        location.coordinates.latitude,
        location.coordinates.longitude
      )
    })).sort((a, b) => (a.distance || 999) - (b.distance || 999));
  }

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredLocations = this.locations;
    } else {
      this.filteredLocations = this.locations.filter(location =>
        location.locationName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        location.address.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.calculateDistances();
    // Update map markers based on search results
    if (this.map) {
      this.addMarkersToMap();
    }
  }

  openInMaps(location: any) {
    const url = `https://www.google.com/maps?q=${location.coordinates.latitude},${location.coordinates.longitude}`;
    window.open(url, '_blank');
  }

  getDirections(location: any) {
    if (this.userLocation) {
      const url = `https://www.google.com/maps/dir/${this.userLocation.latitude},${this.userLocation.longitude}/${location.coordinates.latitude},${location.coordinates.longitude}`;
      window.open(url, '_blank');
    } else {
      this.openInMaps(location);
    }
  }
}