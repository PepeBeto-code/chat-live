// reducers/counterReducer.js
const initialState = {
    token: null,
    user: null,
    colors: null
  };
  
  const rootReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_TOKEN':
        return {
          ...state,
          token: action.payload,
        };
      case 'SET_USER':
        return {
          ...state,
          user: action.payload,
        };
      case 'SET_COLORS':
          return {
            ...state,
            colors: action.payload,
          };
      default:
        return state;
    }
  };
  
  export default rootReducer;