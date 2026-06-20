import axios from "axios";

const setAuthHeader = (token: string) => {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

const clearAuthHeader = () => {
    delete axios.defaults.headers.common["Authorization"];
};

export const userLogin = async (email: string, password: string) => {
    try {
        const response = await axios.post("/user/login", { email, password });
        if (response.status !== 200) throw new Error();
        const data = response.data;
        localStorage.setItem("token", data.token);
        setAuthHeader(data.token);
        return data;
    } catch (err: any) {
        throw new Error(`Error! Cannot Login. ${err.message}`);
    }
};

export const userSignup = async (name: string, email: string, password: string) => {
    try {
        const response = await axios.post("/user/signup", { name, email, password });
        const data = response.data;
        localStorage.setItem("token", data.token);
        setAuthHeader(data.token);
        return data;
    } catch (err: any) {
        console.log(err);
        throw new Error(`Error! Cannot Signup. ${err.message}`);
    }
};

export const getAuthStatus = async () => {
    try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token found");
        setAuthHeader(token);
        const response = await axios.get("/user/auth-status");
        if (response.status !== 200) throw new Error("Could not verify authentication status");
        return response.data;
    } catch (err: any) {
        throw new Error(err.message);
    }
};

export const postChatRequest = async (message: string) => {
    console.log("hello", message);
    try {
        const response = await axios.post("/chat/new", { message });
        console.log(response);
        if (response.status !== 200) throw new Error();
        return response.data;
    } catch (err: any) {
        console.log(err);
        throw new Error(err.message);
    }
};

export const getAllChats = async () => {
    try {
        const response = await axios.get("/chat/all-chats");
        if (response.status !== 200) throw new Error();
        return response.data;
    } catch (err: any) {
        console.log(err);
        throw new Error(err.message);
    }
};

export const deleteAllChats = async () => {
    try {
        const response = await axios.delete("/chat/delete-all-chats");
        if (response.status !== 200) throw new Error();
        return response.data;
    } catch (err: any) {
        console.log(err);
        throw new Error(err.message);
    }
};

export const logoutUser = async () => {
    try {
        const response = await axios.get("/user/logout");
        if (response.status !== 200) throw new Error();
        const data = response.data;
        localStorage.removeItem("token");
        clearAuthHeader();
        return data;
    } catch (err: any) {
        console.log(err);
        throw new Error(err.message);
    }
};
