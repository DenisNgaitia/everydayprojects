const reducer = (state, action) => {
    switch (action.type) {
        case 'SET_DATA':
            return { ...state, ...action.payload, loading: false };
        case 'SET_LOADING':
            return { ...state, loading: action.payload };
        case 'UPDATE_USER':
            return { ...state, user: action.payload };
        case 'UPDATE_FINANCE':
            return { ...state, finance: action.payload };
        case 'UPDATE_SCHEDULE':
            return { ...state, schedule: action.payload };
        case 'UPDATE_DIET':
            return { ...state, diet: action.payload };
        case 'UPDATE_STUDY':
            return { ...state, study: action.payload };
        case 'UPDATE_FITNESS':
            return { ...state, fitness: action.payload };
        case 'ADD_XP':
            return { ...state, user: { ...state.user, xp: state.user.xp + action.payload } };
        default:
            return state;
    }
};

export default reducer;