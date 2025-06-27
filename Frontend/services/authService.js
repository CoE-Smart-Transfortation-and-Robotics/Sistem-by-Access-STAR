import axios from 'axios';
import Cookies from 'js-cookie';

const AUTH_TOKEN = 'auth_token';

export const authService = {
  login: async (credentials) => {
    const response = await axios.post('/api/auth/login', credentials);
    const { token, user } = response.data;
    Cookies.set(AUTH_TOKEN, token);
    return user;
  },

  logout: () => {
    Cookies.remove(AUTH_TOKEN);
  },

  getUser: () => {
    const token = Cookies.get(AUTH_TOKEN);
    if (!token) return null;
  }
};