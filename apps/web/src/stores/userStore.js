import { create } from 'zustand';

const STORAGE_KEY = 'baby-current-user';

function getStoredUser() {
  try {
    return localStorage.getItem(STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function setStoredUser(user) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, user);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

export const useUserStore = create((set) => ({
  currentUser: getStoredUser(),
  setCurrentUser: (user) => {
    setStoredUser(user);
    set({ currentUser: user });
  },
}));
