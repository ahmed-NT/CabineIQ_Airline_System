export const useAuth = () => {
  const token = localStorage.getItem('ram_token');
  const role = localStorage.getItem('ram_role');
  const username = localStorage.getItem('ram_username');

  const isAuthenticated = !!token;
  const isAdmin = role === 'ADMIN';

  const logout = () => {
    localStorage.removeItem('ram_token');
    localStorage.removeItem('ram_role');
    localStorage.removeItem('ram_username');
    window.location.href = '/login';
  };

  const setAuth = (token: string, username: string, role: string) => {
    localStorage.setItem('ram_token', token);
    localStorage.setItem('ram_username', username);
    localStorage.setItem('ram_role', role);
  };

  return { token, role, username, isAuthenticated, isAdmin, logout, setAuth };
};

