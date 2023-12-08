import MacarteAPI from './MacarteApi'
import serviceURL from './serviceURL';

/** Singleton API object to access the API
 * @memberof MacarteAPI
 */ 
const api = new MacarteAPI(serviceURL.api, serviceURL.logout);

api.on(['login', 'logout', 'me'], () => {
  const user = api.getMe();
  if (user && user.roles) {
    document.body.dataset.userRole = user.roles.join(' ')
  } else {
    document.body.dataset.userRole = ''
  }
})

export default api;
