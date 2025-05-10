import { applyTransitionClass } from '../../utils/view-transitions';
import StoryModel from '../../models/story-model';
import AuthModel from '../../models/auth-model';
import StoryItem from '../components/story-item';
import MapView from '../components/map-view';

class HomePage {
  constructor() {
    this.storyModel = new StoryModel();
    this.authModel = new AuthModel();
    this.page = 1;
    this.size = 10;
    this.showMap = false;
    this.stories = [];
    this.totalPages = 0;
    this.isAuthenticated = this.authModel.isAuthenticated();
  }

  getTemplate() {
    applyTransitionClass('home');
    
    return `
      <section class="content">
        <h2>Dicoding Story</h2>
        <p>Berbagi cerita seputar Dicoding, mirip seperti post Instagram namun khusus untuk Dicoding.</p>
        
        ${!this.isAuthenticated ? `
          <div class="alert alert-info" style="margin: 20px 0;">
            <p>You need to <a href="#/login">login</a> to view and share stories.</p>
            <div style="margin-top: 10px;">
              <a href="#/login" class="form-button">Login</a>
              <a href="#/register" class="form-button">Register</a>
            </div>
          </div>
        ` : `
          <div class="actions" style="margin: 20px 0; display: flex; justify-content: space-between;">
            <div>
              <button id="toggleMapButton" class="form-button">
                <i class="fas fa-map-marker-alt"></i> ${this.showMap ? 'Hide Map' : 'Show Map'}
              </button>
              <a href="#/add" class="form-button" style="text-decoration: none; display: inline-block; margin-left: 10px;">
                <i class="fas fa-plus"></i> Add Story
              </a>
            </div>
            <div>
              <select id="pageSizeSelect" class="form-input" style="width: auto;">
                <option value="5" ${this.size === 5 ? 'selected' : ''}>5 per page</option>
                <option value="10" ${this.size === 10 ? 'selected' : ''}>10 per page</option>
                <option value="20" ${this.size === 20 ? 'selected' : ''}>20 per page</option>
              </select>
            </div>
          </div>
          
          <div id="mapContainer" class="map-container" style="display: ${this.showMap ? 'block' : 'none'};"></div>
          
          <div id="storyList" class="story-list">
            <div class="loader">
              <div></div><div></div><div></div><div></div>
            </div>
          </div>
          
          <div class="pagination" id="pagination"></div>
        `}
      </section>
    `;
  }

  async afterRender() {
    // Only load stories and initialize event listeners if authenticated
    if (this.isAuthenticated) {
      this._initEventListeners();
      await this._loadStories();
    } else {
      // Add event listeners for login and register buttons if present
      const loginButton = document.querySelector('a[href="#/login"]');
      const registerButton = document.querySelector('a[href="#/register"]');
      
      if (loginButton) {
        loginButton.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.hash = '/login';
        });
      }
      
      if (registerButton) {
        registerButton.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.hash = '/register';
        });
      }
    }
  }

  _initEventListeners() {
    // Toggle map view
    const toggleMapButton = document.getElementById('toggleMapButton');
    toggleMapButton.addEventListener('click', async () => {
      this.showMap = !this.showMap;
      
      const mapContainer = document.getElementById('mapContainer');
      mapContainer.style.display = this.showMap ? 'block' : 'none';
      toggleMapButton.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${this.showMap ? 'Hide Map' : 'Show Map'}`;
      
      if (this.showMap && !this.mapInitialized) {
        await this._initMap();
      }
    });
    
    // Handle page size change
    const pageSizeSelect = document.getElementById('pageSizeSelect');
    pageSizeSelect.addEventListener('change', async (event) => {
      this.size = parseInt(event.target.value, 10);
      this.page = 1; // Reset to first page when changing page size
      await this._loadStories();
    });
  }

  async _loadStories() {
    try {
      const storyListElement = document.getElementById('storyList');
      storyListElement.innerHTML = `
        <div class="loader">
          <div></div><div></div><div></div><div></div>
        </div>
      `;
      
      // Fetch stories from guest endpoint
      const response = await this.storyModel.getStories();
      
      // For guest endpoint, stories are in response.stories array
      this.stories = response.stories || [];
      
      // Set a default number of pages
      this.totalPages = Math.max(1, Math.ceil(this.stories.length / this.size));
      
      this._renderStories();
      this._renderPagination();
      
      if (this.showMap) {
        await this._initMap();
      }
      
      // Initialize map button to show the correct state
      const toggleMapButton = document.getElementById('toggleMapButton');
      if (toggleMapButton) {
        toggleMapButton.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${this.showMap ? 'Hide Map' : 'Show Map'}`;
      }
    } catch (error) {
      document.getElementById('storyList').innerHTML = `
        <div class="alert alert-error">
          Failed to load stories: ${error.message}
        </div>
      `;
    }
  }

  _renderStories() {
    const storyListElement = document.getElementById('storyList');
    
    if (this.stories.length === 0) {
      storyListElement.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">
            <i class="fas fa-book-open"></i>
          </div>
          <p class="empty-state__message">No stories found</p>
          <a href="#/add" class="empty-state__action">Add Story</a>
        </div>
      `;
      return;
    }
    
    storyListElement.innerHTML = this.stories
      .map((story) => StoryItem(story))
      .join('');
  }

  _renderPagination() {
    const paginationElement = document.getElementById('pagination');
    
    if (this.totalPages <= 1) {
      paginationElement.innerHTML = '';
      return;
    }
    
    let paginationHTML = `
      <button 
        class="pagination-button" 
        id="prevPage"
        ${this.page === 1 ? 'disabled' : ''}
      >
        <i class="fas fa-chevron-left"></i> Prev
      </button>
    `;
    
    for (let i = 1; i <= this.totalPages; i++) {
      paginationHTML += `
        <button 
          class="pagination-button ${i === this.page ? 'active' : ''}" 
          data-page="${i}"
        >
          ${i}
        </button>
      `;
    }
    
    paginationHTML += `
      <button 
        class="pagination-button" 
        id="nextPage"
        ${this.page === this.totalPages ? 'disabled' : ''}
      >
        Next <i class="fas fa-chevron-right"></i>
      </button>
    `;
    
    paginationElement.innerHTML = paginationHTML;
    
    // Add event listeners for pagination buttons
    document.getElementById('prevPage').addEventListener('click', async () => {
      if (this.page > 1) {
        this.page--;
        await this._loadStories();
      }
    });
    
    document.getElementById('nextPage').addEventListener('click', async () => {
      if (this.page < this.totalPages) {
        this.page++;
        await this._loadStories();
      }
    });
    
    // Add event listeners for page number buttons
    const pageButtons = document.querySelectorAll('.pagination-button[data-page]');
    pageButtons.forEach((button) => {
      button.addEventListener('click', async () => {
        const pageNumber = parseInt(button.dataset.page, 10);
        if (this.page !== pageNumber) {
          this.page = pageNumber;
          await this._loadStories();
        }
      });
    });
  }

  async _initMap() {
    try {
      const mapView = new MapView({
        containerId: 'mapContainer',
        center: [-2.5489, 118.0149], // Indonesia's approximate center
        zoom: 5,
      });
      
      // Add markers for stories with location data
      const storiesWithLocation = this.stories.filter((story) => 
        story.lat && story.lon && !isNaN(story.lat) && !isNaN(story.lon)
      );
      
      if (storiesWithLocation.length > 0) {
        mapView.addMarkers(storiesWithLocation);
      } else {
        const mapContainer = document.getElementById('mapContainer');
        mapContainer.innerHTML += `
          <div style="position: absolute; top: 10px; left: 10px; right: 10px; background: white; padding: 10px; border-radius: 4px; z-index: 1000;">
            <p>No stories with location data available.</p>
          </div>
        `;
      }
      
      this.mapInitialized = true;
    } catch (error) {
      console.error('Failed to initialize map:', error);
      const mapContainer = document.getElementById('mapContainer');
      mapContainer.innerHTML = `
        <div class="alert alert-error">
          Failed to load map: ${error.message}
        </div>
      `;
    }
  }
}

export default HomePage;
