import type {AxiosResponse} from "axios";
import axiosInstance from "@/api/axiosInstance/axiosInstance.ts";

export const createTrip = async (tripRequest: TripRequest): Promise<TripResponse> => {
    try {
        const res: AxiosResponse<TripResponse> = await axiosInstance.post("trips/", tripRequest)
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

export const markTripsAsCompleted = async (id: number): Promise<boolean> => {
    try {
        const res: AxiosResponse<boolean> = await axiosInstance.post(`trips/${id}`)
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