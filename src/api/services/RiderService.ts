import type {AxiosResponse} from "axios";
import axiosInstance from "@/api/axiosInstance/axiosInstance.ts";

export const createRider = async (riderRequest: RiderRequest): Promise<RiderResponse> => {
    try {
        const res: AxiosResponse<RiderResponse> = await axiosInstance.post("riders/", riderRequest)
        return res.data
    } catch (err: any) {
        const backendError = err.response?.data;
        throw {
            statusCode: backendError?.statusCode ?? 500,
            message: backendError?.message ?? "An unexpected error occurred",
            error: true
        };
    }
}

export const getRiderById = async (id: number): Promise<RiderResponse> => {
    try {
        const res: AxiosResponse<RiderResponse> = await axiosInstance.get(`riders/${id}`)
        return res.data
    } catch (err: any) {
        const backendError = err.response?.data;
        throw {
            statusCode: backendError?.statusCode ?? 500,
            message: backendError?.message ?? "An unexpected error occurred",
            error: true
        };
    }
}