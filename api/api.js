import MacarteAPI from './MacarteApi'
import serviceURL from './serviceURL';
import organization from 'mcutils/api/team';

/** Singleton API object to access the API
 * @memberof MacarteAPI
 */ 
const api = new MacarteAPI(serviceURL.api, serviceURL.logout);

api.on(['login', 'logout', 'me'], () => {
  const user = api.getMe();
  // Set user role
  if (user && user.roles) {
    document.body.dataset.userRole = user.roles.join(' ')
  } else {
    document.body.dataset.userRole = ''
  }
  organization.setUser(user);
})

export default api;
