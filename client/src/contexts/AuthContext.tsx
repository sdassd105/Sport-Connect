import React, { createContext, useContext, useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "atleta" | "treinador";
  profilePhoto?: string;
  bio?: string;
  trainerVerified?: boolean;
  trainerCertification?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: "atleta" | "treinador") => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("sportconnect_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Erro ao carregar utilizador:", error);
        localStorage.removeItem("sportconnect_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const loggedUser = await trpc.auth.login.mutate({ email, password });

    const newUser: User = {
      id: loggedUser.id,
      name: loggedUser.name,
      email: loggedUser.email,
      role: loggedUser.role,
      profilePhoto: loggedUser.profilePhoto,
      trainerVerified: false,
      trainerCertification: undefined,
    };

    setUser(newUser);
    localStorage.setItem("sportconnect_user", JSON.stringify(newUser));
  };

  const register = async (name: string, email: string, password: string, role: "atleta" | "treinador") => {
    const createdUser = await trpc.auth.register.mutate({ name, email, password, role });

    const newUser: User = {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      profilePhoto: createdUser.profilePhoto,
      trainerVerified: false,
      trainerCertification: undefined,
    };

    setUser(newUser);
    localStorage.setItem("sportconnect_user", JSON.stringify(newUser));
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("sportconnect_user", JSON.stringify(updatedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sportconnect_user");
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, isAuthenticated: !!user, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
