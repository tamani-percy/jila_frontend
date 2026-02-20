interface VehicleResponse {
    id: number,
    make: string,
    model: string,
    year: number,
    color: number,
    plateNumber: string,
    chassisNumber: string,
    engineNumber: string,
    driver: DriverResponse
}

interface VehicleRequest {
    make: string,
    model: string,
    year: number,
    color: number,
    plateNumber: string,
    chassisNumber: string,
    engineNumber: string,
    driverId:number
}