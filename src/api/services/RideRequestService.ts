import type {AxiosResponse} from "axios";
import axiosInstance from "@/api/axiosInstance/axiosInstance.ts";

export const createRideRequest = async (rideRequestRequest: RideRequestRequest): Promise<RideRequestResponse> => {
    try {
        const res: AxiosResponse<RideRequestResponse> = await axiosInstance.post("ride-requests/", rideRequestRequest)
        return res.data
    } catch (err: any) {
        console.log("err")
        console.log(err)
        const backendError = err.response?.data;
        throw {
            statusCode: backendError?.statusCode ?? 500,
            message: backendError?.message ?? "An unexpected error occurred",
            error: true
        };
    }
}

export const cancelRideRequests = async (riderId: number): Promise<boolean> => {
    try {
        const res: AxiosResponse<boolean> = await axiosInstance.post(`ride-requests/cancel/rider/${riderId}`)
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

export const getAllRideRequests = async (): Promise<RideRequestResponse[]> => {
    try {
        const res: AxiosResponse<RideRequestResponse[]> = await axiosInstance.get(`ride-requests/all`)
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

export const cancelRideRequest = async (id: number): Promise<boolean> => {
    try {
        const res: AxiosResponse<boolean> = await axiosInstance.post(`ride-requests/cancel/${id}`)
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

export const getRideRequestsByStatusAndRider = async (riderId: number, status: string): Promise<RideRequestResponse[]> => {
    try {
        const res: AxiosResponse<RideRequestResponse[]> = await axiosInstance.get(`ride-requests/rider/${riderId}/status/${status}`)
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

export const getRideRequestsByRider = async (riderId: number): Promise<RideRequestResponse[]> => {
    try {
        const res: AxiosResponse<RideRequestResponse[]> = await axiosInstance.get(`ride-requests/rider/${riderId}`)
        return res.data.sort(
            (a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
        )
    } catch (err: any) {
        const backendError = err.response?.data;
        throw {
            statusCode: backendError?.statusCode ?? 500,
            message: backendError?.message ?? "An unexpected error occurred",
            error: true
        };
    }
}