import { registerRootComponent } from 'expo';
import App from './App';

// Importa l'icona per far sì che Expo e Webpack la includano nella build finale
import iconImage from './assets/apple-touch-icon.png';

if (typeof document !== 'undefined') {
  const head = document.getElementsByTagName('head')[0];

  // 1. Inietta il link per l'icona iOS (Aggiungi a schermata Home)
  let appleIconLink = document.querySelector("link[rel*='apple-touch-icon']");
  if (!appleIconLink) {
    appleIconLink = document.createElement('link');
    appleIconLink.rel = 'apple-touch-icon';
    head.appendChild(appleIconLink);
  }
  appleIconLink.href = iconImage;

  // 2. Inietta il favicon standard per il browser
  let faviconLink = document.querySelector("link[rel*='icon']");
  if (!faviconLink) {
    faviconLink = document.createElement('link');
    faviconLink.rel = 'shortcut icon';
    head.appendChild(faviconLink);
  }
  faviconLink.href = iconImage;

  // 3. Forzatura metadati iOS per la StatusBar e la modalità Web App
  const metaStatus = document.createElement('meta');
  metaStatus.name = 'apple-mobile-web-app-status-bar-style';
  metaStatus.content = 'black-translucent';
  head.appendChild(metaStatus);

  const metaCapable = document.createElement('meta');
  metaCapable.name = 'apple-mobile-web-app-capable';
  metaCapable.content = 'yes';
  head.appendChild(metaCapable);
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);