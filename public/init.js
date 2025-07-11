// Initialize app data if not present
if (!localStorage.getItem('currentApp')) {
  const defaultApp = {
    id: 'app-1',
    name: 'My App',
    pages: ['page-1'],
    components: [],
    tables: []
  };
  
  const defaultPage = {
    id: 'page-1',
    appId: 'app-1',
    name: 'Home',
    path: '/',
    components: []
  };
  
  localStorage.setItem('currentApp', JSON.stringify(defaultApp));
  localStorage.setItem('currentPage', JSON.stringify(defaultPage));
  
  console.log('Initialized default app and page');
}