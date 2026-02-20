interface DriverResponse {
    id: number,
    name: string,
    nrc: string,
    email: string,
    phoneNumber: string,
    licenseNumber: string,
    driverStatus: string
}

interface DriverRequest {
    name: string,
    nrc: string,
    email: string,
    phoneNumber: string,
    licenseNumber: string,
    driverStatus: string
}