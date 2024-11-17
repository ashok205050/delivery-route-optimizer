import { useLoadScript, GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { useState, useEffect, useRef } from "react";

const defaultContainerStyle = {
  width: "100%",
  height: "100%",
};

const responsiveContainerStyle = {
  width: "100vw",
  height: "80vh",
};

interface Location {
  lat: number;
  lng: number;
}

interface Order {
  orderId: string;
  address: string;
  deliveryTime: string; // Format: 'hh:mm AM/PM'
  weight: string;
  lat: number;
  lng: number;
}

interface MapProps {
  selectedWeight: string;
  orders: Order[]; // Orders to display based on the selected driver
  selectedAlgorithm: string; // The selected algorithm for optimization
}

export default function Map({ selectedWeight, orders, selectedAlgorithm }: MapProps) {
  const [containerStyle, setContainerStyle] = useState(defaultContainerStyle);
  const [currentLocation] = useState<Location>({ lat: 19.125777909688953, lng: 72.85239246694378 });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [optimizedOrders, setOptimizedOrders] = useState<Order[]>([]);

  const mapRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null); // DirectionsRenderer ref
  const trafficLayerRef = useRef<google.maps.TrafficLayer | null>(null); // TrafficLayer ref
  const isMapLoaded = useRef(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  useEffect(() => {
    const handleResize = () => {
      setContainerStyle(window.innerWidth < 800 ? responsiveContainerStyle : defaultContainerStyle);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const initMap = (map: google.maps.Map) => {
    mapRef.current = map;

    directionsRendererRef.current = new google.maps.DirectionsRenderer({
      suppressMarkers: true, // Suppress markers for waypoints
    });
    directionsRendererRef.current.setMap(map);

    // Initialize and add the traffic layer to the map
    if (!trafficLayerRef.current) {
      trafficLayerRef.current = new google.maps.TrafficLayer();
    }
    trafficLayerRef.current.setMap(map); // Traffic layer is always visible

    isMapLoaded.current = true;
  };

  const handleMarkerClick = (order: Order) => {
    setSelectedOrder(order);
  };

  const calculateRoute = () => {
    if (!currentLocation || !optimizedOrders.length || !isMapLoaded.current) return;

    const directionsService = new google.maps.DirectionsService();
    const waypoints = optimizedOrders.map((order) => ({
      location: new google.maps.LatLng(order.lat, order.lng),
      stopover: true,
    }));

    const request: google.maps.DirectionsRequest = {
      origin: new google.maps.LatLng(currentLocation.lat, currentLocation.lng),
      destination: new google.maps.LatLng(optimizedOrders[optimizedOrders.length - 1].lat, optimizedOrders[optimizedOrders.length - 1].lng),
      waypoints: waypoints,
      travelMode: google.maps.TravelMode.DRIVING,
      optimizeWaypoints: selectedAlgorithm === "Google Waypoint", // If Google Waypoint is selected, optimize the waypoints
    };

    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && directionsRendererRef.current) {
        directionsRendererRef.current.setDirections(result);
      } else {
        console.error("Error calculating route: ", status);
      }
    });
  };

  const optimizeRoute = () => {
    if (!orders.length) return;

    let optimized: Order[] = [];
    switch (selectedAlgorithm) {
      case "Routes by Delivery Time":
        optimized = optimizeByDeliveryTime(orders);
        break;
      case "Google Waypoint":
        optimized = optimizeByDeliveryTime(orders); // Sort orders by delivery time for Google Waypoints
        break;
      default:
        optimized = orders;
    }

    setOptimizedOrders(optimized);
  };

  const optimizeByDeliveryTime = (orders: Order[]): Order[] => {
    // Sort orders by delivery time (convert from AM/PM format to a 24-hour time string)
    return orders.sort((a, b) => convertTo24HourFormat(a.deliveryTime).localeCompare(convertTo24HourFormat(b.deliveryTime)));
  };

  const convertTo24HourFormat = (time: string): string => {
    const [timePart, period] = time.split(" ");
    const [hours, minutes] = timePart.split(":").map(Number);
    let newHours = hours;

    if (period === "AM" && hours === 12) newHours = 0; // Handle 12 AM case
    if (period === "PM" && hours !== 12) newHours += 12; // Handle PM case

    const formattedHours = newHours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");

    return `${formattedHours}:${formattedMinutes}`;
  };

  useEffect(() => {
    optimizeRoute();
  }, [orders, selectedAlgorithm]);

  useEffect(() => {
    if (currentLocation && optimizedOrders.length && isMapLoaded.current) {
      calculateRoute();
    }
  }, [optimizedOrders]);

  if (loadError) return <div>Error loading Google Maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={currentLocation}
      zoom={12}
      onLoad={initMap}
    >
      {/* Current location marker */}
      {currentLocation && (
        <Marker
          position={currentLocation}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#fff",
          }}
        />
      )}

      {/* Markers for optimized orders */}
      {optimizedOrders.map((order) => (
        <Marker
          key={order.orderId}
          position={{ lat: order.lat, lng: order.lng }}
          onClick={() => handleMarkerClick(order)}
        />
      ))}

      {/* InfoWindow for selected order */}
      {selectedOrder && (
        <InfoWindow
          position={{ lat: selectedOrder.lat, lng: selectedOrder.lng }}
          onCloseClick={() => setSelectedOrder(null)}
        >
          <div>
            <h4>Order ID: {selectedOrder.orderId}</h4>
            <p>Address: {selectedOrder.address}</p>
            <p>Delivery Time: {selectedOrder.deliveryTime}</p>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
