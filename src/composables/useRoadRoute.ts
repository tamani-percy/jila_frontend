import * as L from 'leaflet'

export interface RouteResult {
    waypoints: L.LatLng[]
    distanceMetres: number
}

export const fetchRoadRoute = async (
    from: L.LatLng,
    to: L.LatLng
): Promise<RouteResult | null> => {
    try {
        const url =
            `https://router.project-osrm.org/route/v1/driving/` +
            `${from.lng},${from.lat};${to.lng},${to.lat}` +
            `?overview=full&geometries=geojson`

        const res = await fetch(url)
        if (!res.ok) return null

        const data = await res.json()
        if (data.code !== 'Ok' || !data.routes?.length) return null

        const coords: [number, number][] = data.routes[0].geometry.coordinates
        const waypoints = coords.map(([lng, lat]) => L.latLng(lat, lng))
        const distanceMetres: number = data.routes[0].distance

        return { waypoints, distanceMetres }
    } catch (e) {
        console.error('OSRM routing failed', e)
        return null
    }
}

export const interpolateAlongRoute = (
    waypoints: L.LatLng[],
    progress: number
): L.LatLng => {
    if (waypoints.length === 0) return L.latLng(0, 0)
    if (progress <= 0) return waypoints[0]
    if (progress >= 1) return waypoints[waypoints.length - 1]

    // Compute cumulative segment lengths
    const segLengths: number[] = []
    let total = 0
    for (let i = 1; i < waypoints.length; i++) {
        const d = waypoints[i - 1].distanceTo(waypoints[i])
        segLengths.push(d)
        total += d
    }

    const target = progress * total
    let accumulated = 0

    for (let i = 0; i < segLengths.length; i++) {
        const segLen = segLengths[i]
        if (accumulated + segLen >= target) {
            const t = (target - accumulated) / segLen
            const a = waypoints[i]
            const b = waypoints[i + 1]
            return L.latLng(
                a.lat + (b.lat - a.lat) * t,
                a.lng + (b.lng - a.lng) * t
            )
        }
        accumulated += segLen
    }

    return waypoints[waypoints.length - 1]
}