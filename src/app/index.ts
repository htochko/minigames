import './../styles/globals.scss';
import { registerHeader } from '../components/header/header';
import { registerFooter } from '../components/footer/footer';
import { registerHomePage } from '../pages/home/home-page';
import { registerLibraryPage } from '../pages/library/library-page';
import { registerGameDetailDialog } from '../components/dialogs/game-details-dialog';
import { registerGameComments } from '../components/comments/game-comments';
import { registerAuthDialog } from '../components/dialogs/auth-dialog';

import { Router } from './router';

export function bootstrapApp(): void {
  registerHeader();
  registerHomePage();
  registerLibraryPage();
  registerFooter();
  registerGameDetailDialog();
  registerAuthDialog();
  registerGameComments();

  const portal = document.querySelector('main')!;
  if (!portal) {
    console.error('No root element found');
  }

  const router = new Router(portal);
  router.addRoute('/', 'home-page');
  router.addRoute('/library', 'library-page');

  router.handleRoute();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => bootstrapApp());
} else {
  bootstrapApp();
}
