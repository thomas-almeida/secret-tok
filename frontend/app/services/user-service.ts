import axios from "axios";

export const createUser = async (name: string, phone: number, email: string, password: string) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/users/create`, { name, phone, email, password });
    return response.data;
}

