// Import styles
import './styles/main.css';
import './styles/components.css';
import './styles/transitions.css';

// Import view-transition polyfill
import './utils/view-transitions';

// Import main app
import App from './views/app';
import routes from './routes/routes';

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch((error) => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

// DOM Content Loaded Event Listener
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the app
  const app = new App({
    content: document.querySelector('#mainContent'),
    routes,
  });

  // Handle hash change event
  window.addEventListener('hashchange', () => {
    app.renderPage();
  });

  // Initially render the page
  app.renderPage();

  // Handle logout button click
  const logoutButton = document.querySelector('#logoutButton');
  logoutButton.addEventListener('click', (event) => {
    event.preventDefault();
    // Clear local storage
    localStorage.removeItem('auth');
    // Update UI
    app.updateAuthUI();
    // Redirect to home
    window.location.hash = '#/';
  });
});
