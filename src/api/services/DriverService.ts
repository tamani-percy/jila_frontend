import type {AxiosResponse} from "axios";
import axiosInstance from "@/api/axiosInstance/axiosInstance.ts";

export const createDriver = async (driverRequest:DriverRequest): Promise<DriverResponse> => {
    try {
        const res: AxiosResponse<DriverResponse> = await axiosInstance.post("drivers/", driverRequest)
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
