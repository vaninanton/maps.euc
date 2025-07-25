import * as L from 'leaflet'

export default function calculateRouteDistance(coordinates: [number, number][]): string {
    let totalDistance = 0

    for (let index = 1; index < coordinates.length; index++) {
        const currentCoordinate = coordinates[index]
        const previousCoordinate = coordinates[index - 1]

        const distance = L.latLng(currentCoordinate).distanceTo(L.latLng(previousCoordinate))
        totalDistance += distance
    }

    const routeDistanceInKilometers = totalDistance / 1000
    return routeDistanceInKilometers.toFixed(1)
}
