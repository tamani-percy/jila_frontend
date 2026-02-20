export function formatRideRequestStatus(status: string): string {
    if (!status) return '';

    return status
        .toUpperCase()
        .replace(/_/g, ' ');
}
