import './../styles/globals.scss';
import { registerHeader } from '../components/header/header';
import { registerFooter } from '../components/footer/footer';
import { registerHomePage } from '../pages/home/home-page';
import { registerLibraryPage } from '../pages/library/library-page';
import { Router } from './router';

registerHeader();
registerHomePage();
registerLibraryPage();
registerFooter();

const portal = document.querySelector('main');
if (portal) {
  const router = new Router(portal);

  router.addRoute('/', 'home-page');
  router.addRoute('/library', 'library-page');
  // Handle initial load
  router.handleRoute();
}
