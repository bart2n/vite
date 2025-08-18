import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/context/auth-context';

export function ExternalAuth() {
  const navigate = useNavigate();
  const { saveAuth, verify } = useAuth();

  useEffect(() => {
    const access  = Cookies.get('access_token');
    const refresh = Cookies.get('refresh_token');

    if (access && refresh) {
      // Bu admin app’in beklediği format
      saveAuth({ access_token: access, refresh_token: refresh });
      // (opsiyonel) kullanıcı bilgisini çek, sonra ana sayfaya geç
       navigate('/', { replace: true });
    } else {
      navigate('/auth/signin', { replace: true });
    }
  }, []);

  return null;
}