import type {AxiosResponse} from "axios";
import axiosInstance from "@/api/axiosInstance/axiosInstance.ts";

export const createVehicle = async (vehicleRequest: VehicleRequest): Promise<VehicleResponse> => {
    try {
        const res: AxiosResponse<VehicleResponse> = await axiosInstance.post("vehicles/", vehicleRequest)
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
