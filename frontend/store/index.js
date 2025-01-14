import { createStore } from 'redux';

const initialState = {
    user: null,
    markers: [],
    shapes: [],
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload };
        case 'ADD_MARKER':
            return { ...state, markers: [...state.markers, action.payload] };
        case 'ADD_SHAPE':
            return { ...state, shapes: [...state.shapes, action.payload] };
        default:
            return state;
    }
};

export const store = createStore(reducer);
