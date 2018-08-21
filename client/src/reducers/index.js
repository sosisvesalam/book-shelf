import { combineReducers } from 'redux';
import book from './book_reducer';
import user from './user_reducer';

const rootReducer = combineReducers({
    book,
    user
})

export default rootReducer;