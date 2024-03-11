// redux/reducers.js
const initialState = {
    canvas: {},
  };
  
  function rootReducer(state = initialState, action) {
    switch (action.type) {
      case 'UPDATE_CANVAS':
        return { ...state, canvas: action.payload };
      default:
        return state;
    }
  }
  
  export default rootReducer;  