
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type UserType = "student" | "teacher" | null;

interface UserContextType {
  userType: UserType;
  userData: any;
  userId: string | null;
  setUserData: (data: any) => void;
  setUserType: (type: UserType) => void;
  setUserId: (id: string | null) => void;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userType, setUserType] = useState<UserType>(null);
  const [userData, setUserData] = useState<any>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const storedUserType = localStorage.getItem("rms_user_type") as UserType;
    const storedUserData = localStorage.getItem("rms_user_data");
    const storedUserId = localStorage.getItem("rms_user_id");

    if (storedUserType) {
      setUserType(storedUserType);
      setUserId(storedUserId);
      setUserData(storedUserData ? JSON.parse(storedUserData) : null);
      setIsAuthenticated(true);
    }
  }, []);

  const handleSetUserData = (data: any) => {
    setUserData(data);
    localStorage.setItem("rms_user_data", JSON.stringify(data));
  };

  const handleSetUserType = (type: UserType) => {
    setUserType(type);
    if (type) {
      localStorage.setItem("rms_user_type", type);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("rms_user_type");
      setIsAuthenticated(false);
    }
  };

  const handleSetUserId = (id: string | null) => {
    setUserId(id);
    if (id) {
      localStorage.setItem("rms_user_id", id);
    } else {
      localStorage.removeItem("rms_user_id");
    }
  };

  return (
    <UserContext.Provider
      value={{
        userType,
        userData,
        userId,
        setUserData: handleSetUserData,
        setUserType: handleSetUserType,
        setUserId: handleSetUserId,
        isAuthenticated,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
