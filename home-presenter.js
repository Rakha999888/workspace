/**
 * Home Presenter
 * Connects HomePage view with StoryModel data
 */
class HomePresenter {
  /**
   * Constructor
   * @param {object} view - HomePage instance
   * @param {object} model - StoryModel instance
   */
  constructor({ view, model }) {
    this.view = view;
    this.model = model;
    this.page = 1;
    this.size = 10;
    this.showMap = false;
  }

  /**
   * Initialize presenter
   */
  async init() {
    await this.loadStories();
  }

  /**
   * Load stories from API
   */
  async loadStories() {
    try {
      const stories = await this.model.getStories({
        page: this.page,
        size: this.size,
        location: 1, // Always get stories with location to support map view
      });
      
      this.view.displayStories(stories.listStory || []);
      
      if (this.showMap) {
        this.view.displayMap(stories.listStory || []);
      }
    } catch (error) {
      this.view.showError(error.message);
    }
  }

  /**
   * Go to a specific page
   * @param {number} page - Page number
   */
  async goToPage(page) {
    if (page !== this.page) {
      this.page = page;
      await this.loadStories();
    }
  }

  /**
   * Change page size
   * @param {number} size - Items per page
   */
  async changePageSize(size) {
    if (size !== this.size) {
      this.size = size;
      this.page = 1; // Reset to first page when changing page size
      await this.loadStories();
    }
  }

  /**
   * Toggle map view
   */
  async toggleMap() {
    this.showMap = !this.showMap;
    
    if (this.showMap) {
      // If showing map for the first time, ensure we have location data
      await this.loadStories();
    }
    
    return this.showMap;
  }
}

export default HomePresenter;
