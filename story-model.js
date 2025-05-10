/**
 * Story Model - handles data-related operations for stories
 */
class StoryModel {
  constructor() {
    this.baseUrl = 'https://story-api.dicoding.dev/v1';
  }

  /**
   * Get all stories
   * @param {object} options - Query options
   * @param {number} options.page - Page number
   * @param {number} options.size - Number of items per page
   * @param {number} options.location - Whether to include location (1) or not (0)
   * @returns {Promise<object>} Stories data
   */
  async getStories({ page = 1, size = 10, location = 0 } = {}) {
    try {
      const token = this._getToken();
      
      // Use authenticated endpoint if token exists, otherwise try guest endpoint
      const url = `${this.baseUrl}/stories?page=${page}&size=${size}&location=${location}`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      
      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson;
    } catch (error) {
      throw new Error(`Failed to fetch stories: ${error.message}`);
    }
  }

  /**
   * Get story detail by ID
   * @param {string} id - Story ID
   * @returns {Promise<object>} Story detail
   */
  async getStoryDetail(id) {
    try {
      const token = this._getToken();
      
      // Use authenticated endpoint for story details
      const url = `${this.baseUrl}/stories/${id}`;

      const response = await fetch(url, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      
      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson;
    } catch (error) {
      throw new Error(`Failed to fetch story detail: ${error.message}`);
    }
  }

  /**
   * Add new story
   * @param {object} storyData - Story data
   * @param {string} storyData.description - Story description
   * @param {File} storyData.photo - Photo file
   * @param {number} storyData.lat - Latitude (optional)
   * @param {number} storyData.lon - Longitude (optional)
   * @returns {Promise<object>} Response from API
   */
  async addStory({ description, photo, lat, lon }) {
    try {
      const token = this._getToken();
      
      if (!token) {
        throw new Error('Authentication required to add a story');
      }
      
      const formData = new FormData();
      
      formData.append('description', description);
      formData.append('photo', photo);
      
      if (lat !== undefined && lon !== undefined) {
        formData.append('lat', lat);
        formData.append('lon', lon);
      }

      // Use authenticated endpoint for adding stories
      const url = `${this.baseUrl}/stories`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson;
    } catch (error) {
      throw new Error(`Failed to add story: ${error.message}`);
    }
  }

  /**
   * Get auth token from local storage
   * @returns {string|null} Auth token
   * @private
   */
  _getToken() {
    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    return auth.token || null;
  }
}

export default StoryModel;
