import {createSlice} from '@reduxjs/toolkit'

interface Post {
    id: number,
    title: string,
    content: string,
    image: string,
    createdAt: Date,
    updatedAt: Date,

}

interface AuthState {
    Posts: Post[];
    loading: boolean;
    error: string | null;
    isLoggedIn: boolean;
}

const initialState: AuthState = {
    Posts: [],
    loading: false,
    error: null,
    isLoggedIn: false,
};

const postsSlice = createSlice({
    name: "posts",
    initialState,
    reducers: {}
})



export default postsSlice.reducer