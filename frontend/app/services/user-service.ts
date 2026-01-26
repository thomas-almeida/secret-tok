import axios from "axios";

export const createUser = async (name: string, phone: number, password: string) => {
    const response = await axios.post(`${process.env.BACKEND_BASEURL}/users/create`, { name, phone, password });
    return response.data;
}

