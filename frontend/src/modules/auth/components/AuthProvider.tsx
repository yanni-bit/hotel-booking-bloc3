// src/modules/auth/components/AuthProvider.tsx
// ============================================================================
// Context Auth - Hotel Booking Bloc 3
// 
// Différence Angular → React :
// - Angular : AuthService avec BehaviorSubject, injection via constructor
// - React : Context + Hook useAuth(), wrapping dans un Provider
// ============================================================================

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

// ============================================================================
// TYPES
// ============================================================================
export interface User {
  id_user: number;
  email: string;
  nom: string;
  prenom: string;
  tel?: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  tel?: string;
}

// ============================================================================
// CONTEXT
// ============================================================================
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Récupérer l'utilisateur au chargement
  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Erreur refreshUser:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Au montage du composant
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Login
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        return { success: true };
      }

      return { success: false, error: data.error };
    } catch (error) {
      console.error("Erreur login:", error);
      return { success: false, error: "Erreur de connexion" };
    }
  };

  // Register
  const register = async (
    registerData: RegisterData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        return { success: true };
      }

      return { success: false, error: data.error };
    } catch (error) {
      console.error("Erreur register:", error);
      return { success: false, error: "Erreur lors de l'inscription" };
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
    } catch (error) {
      console.error("Erreur logout:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================
/**
 * Hook pour accéder au contexte Auth
 * 
 * Différence Angular → React :
 * - Angular : constructor(private authService: AuthService)
 * - React : const { user, login } = useAuth()
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  
  return context;
}