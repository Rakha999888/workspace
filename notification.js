/**
 * Notification Model - handles web push notifications
 */
class NotificationModel {
  constructor() {
    this.baseUrl = 'https://story-api.dicoding.dev/v1';
    this.vapidPublicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
  }

  /**
   * Check if notifications are supported in the browser
   * @returns {boolean} Whether notifications are supported
   */
  isNotificationSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  /**
   * Request notification permission
   * @returns {Promise<string>} Permission status
   */
  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      throw new Error(`Failed to request notification permission: ${error.message}`);
    }
  }

  /**
   * Subscribe to push notifications
   * @returns {Promise<object>} Subscription details
   */
  async subscribeToPushNotification() {
    try {
      const token = this._getToken();
      
      if (!token) {
        throw new Error('Authentication token is required');
      }

      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.vapidPublicKey,
      });

      const subscriptionJson = subscription.toJSON();

      const response = await fetch(`${this.baseUrl}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscriptionJson.endpoint,
          keys: {
            p256dh: subscriptionJson.keys.p256dh,
            auth: subscriptionJson.keys.auth,
          },
        }),
      });

      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      return responseJson;
    } catch (error) {
      throw new Error(`Failed to subscribe to push notifications: ${error.message}`);
    }
  }

  /**
   * Unsubscribe from push notifications
   * @returns {Promise<object>} Unsubscription result
   */
  async unsubscribeFromPushNotification() {
    try {
      const token = this._getToken();
      
      if (!token) {
        throw new Error('Authentication token is required');
      }

      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        return { error: false, message: 'Not subscribed to push notifications' };
      }

      const subscriptionJson = subscription.toJSON();

      const response = await fetch(`${this.baseUrl}/notifications/subscribe`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscriptionJson.endpoint,
        }),
      });

      const responseJson = await response.json();
      
      if (responseJson.error) {
        throw new Error(responseJson.message);
      }

      // Also unsubscribe locally
      await subscription.unsubscribe();

      return responseJson;
    } catch (error) {
      throw new Error(`Failed to unsubscribe from push notifications: ${error.message}`);
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

export default NotificationModel;
