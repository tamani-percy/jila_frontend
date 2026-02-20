interface TripResponse {
    id: number,
    driver: DriverResponse,
    rideRequestId: number,
    vehicle: VehicleResponse,
    tripStatus: string,
    fareTotal: string,
    distance: string,
    endedAt: string,
    startedAt: string
}

interface TripRequest {
    distance: number,
    fareTotal: number,
    tripStatus: string,
    driverId: number,
    vehicleId: number,
    paymentId?: number,
    rideRequestId: number
}

