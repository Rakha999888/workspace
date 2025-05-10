import HomePage from '../views/pages/home-page';
import DetailPage from '../views/pages/detail-page';
import AddStoryPage from '../views/pages/add-story-page';
import LoginPage from '../views/pages/login-page';
import RegisterPage from '../views/pages/register-page';

/**
 * Routes configuration for the application
 * Each route defines a URL pattern and the page to render
 * The auth property specifies if the route requires authentication
 */
const routes = [
  {
    url: '/',
    page: HomePage,
    auth: false,
  },
  {
    url: {
      resource: 'detail',
      id: ':id',
      verb: null,
    },
    page: DetailPage,
    auth: false, // Allow guests to view story details
  },
  {
    url: 'add',
    page: AddStoryPage,
    auth: false, // Allow guest submissions
  },
  {
    url: 'login',
    page: LoginPage,
    auth: false,
  },
  {
    url: 'register',
    page: RegisterPage,
    auth: false,
  },
];

export default routes;
