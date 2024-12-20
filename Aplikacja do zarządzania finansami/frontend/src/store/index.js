import {create} from "zustand";

const useStore = create((set) => ({
    user: JSON.parse(localStorage.getItem("user")) ?? null,

    setCredentials: (user) => set({ user }),
    signOut: () => set({ user: null })
}));

export default useStore;