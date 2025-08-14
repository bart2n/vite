import { useEffect, useState, useCallback } from 'react';
import { SupabaseAdapter } from '@/auth/adapters/supabase-adapter';
import { AuthContext } from '@/auth/context/auth-context';
import * as authHelper from '@/auth/lib/helpers';
import { useGetUserInstitutionsQuery } from '@/redux/Auth/authApi'; // ✅ from eklendi
import Cookies from 'js-cookie';

// Define the Supabase Auth Provider
export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(authHelper.getAuth());
  const [currentUser, setCurrentUser] = useState();
  const [isAdmin, setIsAdmin] = useState(false);

  // ✅ RTK Query: query hook obje döndürür
  // token yoksa çağrıyı atlaması için skip ekledim (auth varsa dene)
  const access = Cookies.get("access_token");
  const refresh = localStorage.getItem("refresh_token");
  const {
    data: userData,
    isLoading: userLoading,
    isError: userError,
    refetch,
  } = useGetUserInstitutionsQuery(access);

  // Check if user is admin
  useEffect(() => {
    setIsAdmin(currentUser?.is_admin === true);
  }, [currentUser]);

  // ✅ userData geldikçe context'teki user'ı güncelle
  useEffect(() => {
    if (userData) setCurrentUser(userData);
  }, [userData]);

  // ✅ loading'i query durumu ile senkronla (ilk yüklemede spinner vs.)
  useEffect(() => {
    if (!userLoading) setLoading(false);
  }, [userLoading]);

  const verify = useCallback(async () => {
    if (auth) {
      try {
        // ✅ fetch(user) yanlıştı; refetch ile veriyi tazele
        const res = await refetch();
        // RTK Query v1: res.data varsa kullanıcıyı yaz
        if ('data' in res && res.data) {
          setCurrentUser(res.data || undefined);
        } else if (userError) {
          saveAuth(undefined);
          setCurrentUser(undefined);
        }
      } catch {
        saveAuth(undefined);
        setCurrentUser(undefined);
      }
    }
  }, [auth, refetch, userError]);

  const saveAuth = (authVal) => {
    setAuth(authVal);
    if (authVal) {
      authHelper.setAuth(authVal);
    } else {
      authHelper.removeAuth();
    }
  };

  const login = async (email, password) => {
    try {
      const auth = await SupabaseAdapter.login(email, password);
      saveAuth(auth);
      const user = await getUser();
      setCurrentUser(user || undefined);
    } catch (error) {
      saveAuth(undefined);
      throw error;
    }
  };

  const register = async (
    email,
    password,
    password_confirmation,
    firstName,
    lastName,
  ) => {
    try {
      const auth = await SupabaseAdapter.register(
        email,
        password,
        password_confirmation,
        firstName,
        lastName,
      );
      saveAuth(auth);
      const user = await getUser();
      setCurrentUser(user || undefined);
    } catch (error) {
      saveAuth(undefined);
      throw error;
    }
  };

  const requestPasswordReset = async (email) => {
    await SupabaseAdapter.requestPasswordReset(email);
  };

  const resetPassword = async (password, password_confirmation) => {
    await SupabaseAdapter.resetPassword(password, password_confirmation);
  };

  const resendVerificationEmail = async (email) => {
    await SupabaseAdapter.resendVerificationEmail(email);
  };

  const getUser = async () => {
    return await SupabaseAdapter.getCurrentUser();
  };

  const updateProfile = async (userData) => {
    return await SupabaseAdapter.updateUserProfile(userData);
  };

  const logout = () => {
    SupabaseAdapter.logout();
    saveAuth(undefined);
    setCurrentUser(undefined);
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        auth,
        saveAuth,
        user: currentUser,
        setUser: setCurrentUser,
        login,
        register,
        requestPasswordReset,
        resetPassword,
        resendVerificationEmail,
        getUser,
        updateProfile,
        logout,
        verify,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
