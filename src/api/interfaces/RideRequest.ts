interface RideRequestResponse {
    id: number,
    pickupLocation: string,
    dropOffLocation: string,
    rider: RiderResponse,
    trip: TripResponse,
    requestStatus: string,
    rideRequestStatus: string,
    requestedAt: string
}

interface RideRequestRequest {
    id?: number,
    pickupLocation: string,
    dropOffLocation: string,
    riderId: number,
    rideRequestStatus?: string
}
