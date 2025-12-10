import Foundation
import CoreLocation

class LocationManager: NSObject, ObservableObject, CLLocationManagerDelegate {
    static let shared = LocationManager()

    private let manager = CLLocationManager()

    @Published var location: CLLocation?
    @Published var authorizationStatus: CLAuthorizationStatus = .notDetermined
    @Published var locationName: String = "Brisbane, QLD"
    @Published var isLoading = false

    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyHundredMeters
        authorizationStatus = manager.authorizationStatus
    }

    func requestPermission() {
        manager.requestWhenInUseAuthorization()
    }

    func startUpdating() {
        isLoading = true
        manager.requestLocation()
    }

    // MARK: - CLLocationManagerDelegate

    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        self.location = location
        isLoading = false

        // Reverse geocode to get location name
        let geocoder = CLGeocoder()
        geocoder.reverseGeocodeLocation(location) { [weak self] placemarks, error in
            guard let placemark = placemarks?.first else {
                self?.locationName = "Unknown Location"
                return
            }

            // Build a readable location name
            if let locality = placemark.locality {
                if let subLocality = placemark.subLocality {
                    self?.locationName = "\(subLocality), \(locality)"
                } else {
                    self?.locationName = locality
                }
            } else if let administrativeArea = placemark.administrativeArea {
                self?.locationName = administrativeArea
            } else {
                self?.locationName = "Current Location"
            }
        }
    }

    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("Location error: \(error.localizedDescription)")
        isLoading = false
        locationName = "Location Unavailable"
    }

    func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        authorizationStatus = manager.authorizationStatus

        switch authorizationStatus {
        case .authorizedWhenInUse, .authorizedAlways:
            startUpdating()
        case .denied, .restricted:
            locationName = "Location Denied"
        case .notDetermined:
            break
        @unknown default:
            break
        }
    }

    var latitude: Double? {
        location?.coordinate.latitude
    }

    var longitude: Double? {
        location?.coordinate.longitude
    }
}
