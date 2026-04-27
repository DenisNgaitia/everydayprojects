import { createContext, useContext, useReducer, useEffect } from 'react';
import reducer from './reducer';
import { seedIfNeeded } from '../utils/seedData';
import { getAllData } from '../utils/dataService';

const AppContext = createContext();

const initialState = {
    user: { name: 'Comrade', xp: 0, badges: [] },
    finance: null,
    schedule: null,
    diet: null,
    study: null,
    fitness: null,
    loading: true
};

export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, initialState);

    // Seed data on first load, then load everything from localStorage
    useEffect(() => {
        seedIfNeeded();
        const data = getAllData();
        dispatch({ type: 'SET_DATA', payload: data });
    }, []);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);