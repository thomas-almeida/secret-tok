import axios from "axios";

export const getModels = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_BASEURL}/api/models/get-all-models`)
    return response.data
}