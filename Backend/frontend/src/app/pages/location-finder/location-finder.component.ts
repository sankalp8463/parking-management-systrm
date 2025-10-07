import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

declare var ol: any;

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
  vectorSource: any;
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
    // Default center (Mumbai coordinates)
    const defaultLat = 19.0760;
    const defaultLng = 72.8777;
    
    // Create vector source for markers
    const vectorSource = new ol.source.Vector();
    
    // Create vector layer for markers
    const vectorLayer = new ol.layer.Vector({
      source: vectorSource
    });
    
    // Initialize map
    this.map = new ol.Map({
      target: 'map',
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        }),
        vectorLayer
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([defaultLng, defaultLat]),
        zoom: 10
      })
    });
    
    // Store vector source for adding markers
    this.vectorSource = vectorSource;
    
    // Add markers once locations are loaded
    if (this.locations.length > 0) {
      this.addMarkersToMap();
    }
  }

  addMarkersToMap() {
    if (!this.vectorSource) return;
    
    // Clear existing markers
    this.vectorSource.clear();
    this.markers = [];
    
    const features = [];
    
    // Add user location marker if available
    if (this.userLocation) {
      const userFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([this.userLocation.longitude, this.userLocation.latitude])),
        type: 'user',
        name: 'Your Location'
      });
      
      userFeature.setStyle(new ol.style.Style({
        image: new ol.style.Circle({
          radius: 8,
          fill: new ol.style.Fill({ color: '#ef4444' }),
          stroke: new ol.style.Stroke({ color: 'white', width: 2 })
        })
      }));
      
      features.push(userFeature);
    }
    
    // Add parking location markers
    this.filteredLocations.forEach(location => {
      const feature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([location.coordinates.longitude, location.coordinates.latitude])),
        type: 'parking',
        location: location
      });
      
      feature.setStyle(new ol.style.Style({
        image: new ol.style.Circle({
          radius: 12,
          fill: new ol.style.Fill({ color: '#3b82f6' }),
          stroke: new ol.style.Stroke({ color: 'white', width: 3 })
        }),
        text: new ol.style.Text({
          text: 'P',
          fill: new ol.style.Fill({ color: 'white' }),
          font: 'bold 12px Arial'
        })
      }));
      
      features.push(feature);
    });
    
    // Add all features to the vector source
    this.vectorSource.addFeatures(features);
    
    // Add click handler for popups
    this.map.on('click', (event: any) => {
      const feature = this.map.forEachFeatureAtPixel(event.pixel, (feature: any) => feature);
      if (feature && feature.get('type') === 'parking') {
        const location = feature.get('location');
        this.showPopup(event.coordinate, location);
      }
    });
    
    // Fit map to show all markers
    if (features.length > 0) {
      const extent = this.vectorSource.getExtent();
      this.map.getView().fit(extent, { padding: [50, 50, 50, 50] });
    }
  }
  
  showPopup(coordinate: any, location: any) {
    // Remove existing popup
    const existingPopup = document.getElementById('map-popup');
    if (existingPopup) {
      existingPopup.remove();
    }
    
    // Create popup element
    const popup = document.createElement('div');
    popup.id = 'map-popup';
    popup.className = 'ol-popup';
    popup.innerHTML = `
      <div class="popup-content">
        <button class="popup-closer" onclick="document.getElementById('map-popup').remove()">&times;</button>
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
    `;
    
    // Create overlay
    const overlay = new ol.Overlay({
      element: popup,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -10]
    });
    
    this.map.addOverlay(overlay);
    overlay.setPosition(coordinate);
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