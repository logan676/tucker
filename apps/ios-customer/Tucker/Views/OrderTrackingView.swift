import SwiftUI
import MapKit

struct OrderTrackingView: View {
    let order: Order
    @State private var region: MKCoordinateRegion
    @State private var driverLocation: CLLocationCoordinate2D?
    @State private var estimatedArrival = "15-20 min"
    @State private var trackingSteps: [TrackingStep] = []
    @Environment(\.dismiss) var dismiss

    init(order: Order) {
        self.order = order
        // Default to Brisbane CBD
        let defaultLocation = CLLocationCoordinate2D(latitude: -27.4705, longitude: 153.0260)
        _region = State(initialValue: MKCoordinateRegion(
            center: defaultLocation,
            span: MKCoordinateSpan(latitudeDelta: 0.02, longitudeDelta: 0.02)
        ))
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            // Map
            Map(coordinateRegion: $region, annotationItems: mapAnnotations) { item in
                MapAnnotation(coordinate: item.coordinate) {
                    annotationView(for: item)
                }
            }
            .ignoresSafeArea(edges: .top)

            // Bottom Sheet
            VStack(spacing: 0) {
                // Handle
                RoundedRectangle(cornerRadius: 2.5)
                    .fill(Color.gray.opacity(0.3))
                    .frame(width: 40, height: 5)
                    .padding(.top, 8)

                // Driver Info
                driverInfoSection
                    .padding()

                Divider()

                // Tracking Steps
                ScrollView {
                    trackingStepsSection
                        .padding()
                }
                .frame(maxHeight: 200)
            }
            .background(Color.white)
            .cornerRadius(20, corners: [.topLeft, .topRight])
            .shadow(color: .black.opacity(0.1), radius: 10, y: -5)
        }
        .navigationTitle("Track Order")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button {
                    // Call driver
                } label: {
                    Image(systemName: "phone.fill")
                        .foregroundColor(.tuckerOrange)
                }
            }
        }
        .onAppear {
            setupTracking()
        }
    }

    // MARK: - Map Annotations
    private var mapAnnotations: [MapAnnotationItem] {
        var items: [MapAnnotationItem] = []

        // Merchant location (simulated)
        items.append(MapAnnotationItem(
            id: "merchant",
            type: .merchant,
            coordinate: CLLocationCoordinate2D(latitude: -27.4680, longitude: 153.0230)
        ))

        // Delivery address (simulated)
        items.append(MapAnnotationItem(
            id: "delivery",
            type: .delivery,
            coordinate: CLLocationCoordinate2D(latitude: -27.4730, longitude: 153.0290)
        ))

        // Driver location
        if let driverLoc = driverLocation {
            items.append(MapAnnotationItem(
                id: "driver",
                type: .driver,
                coordinate: driverLoc
            ))
        }

        return items
    }

    @ViewBuilder
    private func annotationView(for item: MapAnnotationItem) -> some View {
        switch item.type {
        case .merchant:
            VStack(spacing: 2) {
                Image(systemName: "storefront.fill")
                    .font(.title2)
                    .foregroundColor(.white)
                    .padding(8)
                    .background(Color.tuckerOrange)
                    .clipShape(Circle())
                Text("Restaurant")
                    .font(.caption2)
                    .fontWeight(.medium)
            }
        case .delivery:
            VStack(spacing: 2) {
                Image(systemName: "house.fill")
                    .font(.title2)
                    .foregroundColor(.white)
                    .padding(8)
                    .background(Color.blue)
                    .clipShape(Circle())
                Text("Your Location")
                    .font(.caption2)
                    .fontWeight(.medium)
            }
        case .driver:
            VStack(spacing: 2) {
                Image(systemName: "bicycle")
                    .font(.title2)
                    .foregroundColor(.white)
                    .padding(8)
                    .background(Color.green)
                    .clipShape(Circle())
                Text("Driver")
                    .font(.caption2)
                    .fontWeight(.medium)
            }
        }
    }

    // MARK: - Driver Info Section
    private var driverInfoSection: some View {
        HStack(spacing: 16) {
            // Driver Avatar
            Image(systemName: "person.circle.fill")
                .font(.system(size: 50))
                .foregroundColor(.gray)

            VStack(alignment: .leading, spacing: 4) {
                Text("Your rider")
                    .font(.caption)
                    .foregroundColor(.gray)
                Text("Michael T.")
                    .font(.headline)
                    .fontWeight(.bold)

                HStack(spacing: 4) {
                    Image(systemName: "star.fill")
                        .foregroundColor(.tuckerOrange)
                        .font(.caption)
                    Text("4.9")
                        .font(.caption)
                        .fontWeight(.medium)
                    Text("(1.2k deliveries)")
                        .font(.caption)
                        .foregroundColor(.gray)
                }
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 4) {
                Text("Arriving in")
                    .font(.caption)
                    .foregroundColor(.gray)
                Text(estimatedArrival)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.tuckerOrange)
            }
        }
    }

    // MARK: - Tracking Steps Section
    private var trackingStepsSection: some View {
        VStack(alignment: .leading, spacing: 0) {
            ForEach(Array(trackingSteps.enumerated()), id: \.element.id) { index, step in
                HStack(alignment: .top, spacing: 16) {
                    // Timeline indicator
                    VStack(spacing: 0) {
                        Circle()
                            .fill(step.isCompleted ? Color.tuckerOrange : Color.gray.opacity(0.3))
                            .frame(width: 12, height: 12)

                        if index < trackingSteps.count - 1 {
                            Rectangle()
                                .fill(trackingSteps[index + 1].isCompleted ? Color.tuckerOrange : Color.gray.opacity(0.3))
                                .frame(width: 2, height: 40)
                        }
                    }

                    VStack(alignment: .leading, spacing: 4) {
                        Text(step.title)
                            .font(.subheadline)
                            .fontWeight(step.isCompleted ? .semibold : .regular)
                            .foregroundColor(step.isCompleted ? .primary : .gray)

                        if let time = step.time {
                            Text(time)
                                .font(.caption)
                                .foregroundColor(.gray)
                        }

                        if let subtitle = step.subtitle {
                            Text(subtitle)
                                .font(.caption)
                                .foregroundColor(.gray)
                        }
                    }

                    Spacer()

                    if step.isCurrent {
                        ProgressView()
                            .scaleEffect(0.8)
                    } else if step.isCompleted {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundColor(.tuckerOrange)
                    }
                }
            }
        }
    }

    // MARK: - Setup
    private func setupTracking() {
        // Simulate tracking steps based on order status
        trackingSteps = [
            TrackingStep(
                id: "1",
                title: "Order Confirmed",
                subtitle: "Your order has been received",
                time: formatTime(order.createdAt),
                isCompleted: true,
                isCurrent: false
            ),
            TrackingStep(
                id: "2",
                title: "Preparing Your Order",
                subtitle: "Restaurant is preparing your food",
                time: nil,
                isCompleted: order.status != "pending",
                isCurrent: order.status == "preparing"
            ),
            TrackingStep(
                id: "3",
                title: "Order Ready",
                subtitle: "Waiting for rider pickup",
                time: nil,
                isCompleted: ["delivering", "delivered"].contains(order.status),
                isCurrent: order.status == "ready"
            ),
            TrackingStep(
                id: "4",
                title: "On the Way",
                subtitle: "Your rider is heading to you",
                time: nil,
                isCompleted: order.status == "delivered",
                isCurrent: order.status == "delivering"
            ),
            TrackingStep(
                id: "5",
                title: "Delivered",
                subtitle: "Enjoy your meal!",
                time: nil,
                isCompleted: order.status == "delivered",
                isCurrent: false
            ),
        ]

        // Simulate driver location if order is being delivered
        if order.status == "delivering" {
            driverLocation = CLLocationCoordinate2D(latitude: -27.4700, longitude: 153.0270)

            // Simulate driver movement
            Timer.scheduledTimer(withTimeInterval: 3.0, repeats: true) { timer in
                if let current = driverLocation {
                    // Move towards delivery location
                    let newLat = current.latitude + Double.random(in: -0.0005...0.0005)
                    let newLon = current.longitude + Double.random(in: -0.0005...0.0005)
                    withAnimation {
                        driverLocation = CLLocationCoordinate2D(latitude: newLat, longitude: newLon)
                    }
                }
            }
        }
    }

    private func formatTime(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        if let date = formatter.date(from: dateString) {
            let displayFormatter = DateFormatter()
            displayFormatter.dateFormat = "h:mm a"
            return displayFormatter.string(from: date)
        }
        return ""
    }
}

// MARK: - Supporting Types
struct MapAnnotationItem: Identifiable {
    let id: String
    let type: AnnotationType
    let coordinate: CLLocationCoordinate2D

    enum AnnotationType {
        case merchant, delivery, driver
    }
}

struct TrackingStep: Identifiable {
    let id: String
    let title: String
    let subtitle: String?
    let time: String?
    let isCompleted: Bool
    let isCurrent: Bool
}

#Preview {
    NavigationStack {
        OrderTrackingView(order: Order(
            id: "1",
            orderNo: "T202412100001",
            merchantId: "1",
            merchantName: "Fresh Bites Cafe",
            totalAmount: 45.90,
            deliveryFee: 5.0,
            discountAmount: 0,
            payAmount: 50.90,
            status: "delivering",
            deliveryAddress: nil,
            items: nil,
            createdAt: "2024-12-10T10:30:00Z",
            paidAt: nil
        ))
    }
}
