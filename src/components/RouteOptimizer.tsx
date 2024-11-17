// import React, { useEffect, useState } from "react";

// // Define types for orders
// interface Order {
//   orderId: string;
//   address: string;
//   deliveryTime: string; // Time in "HH:MM AM/PM" format
//   weight: "light" | "medium" | "heavy";
//   lat: number;
//   lng: number;
// }

// // Define types for drivers
// interface Driver {
//   id: number;
//   location: { lat: number; lng: number };
//   capacity: {
//     light: number;
//     medium: number;
//     heavy: number;
//   };
//   orders: {
//     light: Order[];
//     medium: Order[];
//     heavy: Order[];
//   };
// }

// // Props for RouteOptimizer component
// interface RouteOptimizerProps {
//   selectedAlgorithm: string; // Selected optimization algorithm
//   orders: Order[];
//   driver: Driver;
// }

// const RouteOptimizer: React.FC<RouteOptimizerProps> = ({
//   selectedAlgorithm,
//   orders,
//   driver,
// }) => {
//   const [optimizedRoute, setOptimizedRoute] = useState<Order[]>([]);

//   useEffect(() => {
//     const optimize = async () => {
//       console.log("Optimizing with algorithm:", selectedAlgorithm);
//       console.log("Current orders:", orders);
//       const optimized = await optimizeRoute();
//       console.log("Optimized orders:", optimized);
//       const assignedOrders = assignOrdersToDriver(optimized);
//       console.log("Assigned orders to driver:", assignedOrders);
//       setOptimizedRoute(assignedOrders);
//     };
//     optimize();
//   }, [selectedAlgorithm, orders]);

//   const optimizeRoute = async (): Promise<Order[]> => {
//     switch (selectedAlgorithm) {
//       case "Google Maps Waypoint Optimization":
//         return await googleMapsWaypointOptimization(orders);
//       case "Delivery Time Optimization":
//         return deliveryTimeOptimization(orders);
//       default:
//         console.warn("Algorithm not recognized");
//         return orders;
//     }
//   };

//   // Google Maps Waypoint Optimization
//   const googleMapsWaypointOptimization = async (orders: Order[]): Promise<Order[]> => {
//     console.log("Running Google Maps Waypoint Optimization");

//     if (orders.length < 2) return orders; // No optimization needed for one or no orders

//     // Extract waypoints (exclude the starting and ending points for optimization)
//     const waypoints = orders.slice(1, -1).map((order) => ({
//       location: { lat: order.lat, lng: order.lng },
//       stopover: true,
//     }));

//     // Set up the Google Maps API request
//     const directionsService = new google.maps.DirectionsService();

//     const origin = { lat: orders[0].lat, lng: orders[0].lng }; // Start location
//     const destination = { lat: orders[orders.length - 1].lat, lng: orders[orders.length - 1].lng }; // End location

//     try {
//       const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
//         directionsService.route(
//           {
//             origin,
//             destination,
//             waypoints,
//             optimizeWaypoints: true, // Enable waypoint optimization
//             travelMode: google.maps.TravelMode.DRIVING, // Adjust based on delivery type
//           },
//           (response, status) => {
//             if (status === google.maps.DirectionsStatus.OK && response) {
//               resolve(response);
//             } else {
//               reject(`Google Maps Directions API failed with status: ${status}`);
//             }
//           }
//         );
//       });

//       // Extract optimized waypoint order from the result
//       const waypointOrder = result.routes[0].waypoint_order;

//       // Reorder the orders array based on the optimized order
//       const optimizedOrders = [orders[0]]; // Start point remains the same
//       waypointOrder.forEach((index) => optimizedOrders.push(orders[index + 1]));
//       optimizedOrders.push(orders[orders.length - 1]); // End point remains the same

//       return optimizedOrders;
//     } catch (error) {
//       console.error("Error in Google Maps API call:", error);
//       return orders; // Return original orders if API fails
//     }
//   };

//   // Delivery Time Optimization
//   const deliveryTimeOptimization = (orders: Order[]): Order[] => {
//     console.log("Running Delivery Time Optimization");

//     // Helper function to parse delivery time in "HH:MM AM/PM" format to minutes
//     const parseTime = (time: string): number => {
//       const [hourMin, meridiem] = time.split(" ");
//       const [hours, minutes] = hourMin.split(":").map(Number);

//       let hoursIn24 = hours;
//       if (meridiem === "PM" && hours !== 12) hoursIn24 += 12;
//       if (meridiem === "AM" && hours === 12) hoursIn24 = 0; // Handle midnight (12:00 AM)

//       return hoursIn24 * 60 + minutes;
//     };

//     // Sort orders by delivery time
//     const sortedOrders = [...orders].sort((a, b) => {
//       const timeA = parseTime(a.deliveryTime);
//       const timeB = parseTime(b.deliveryTime);
//       return timeA - timeB; // Sort in ascending order
//     });

//     console.log("Sorted orders by delivery time:", sortedOrders);

//     // Initialize the optimized orders array
//     let optimizedOrders: Order[] = [];
//     let lastDeliveryTime = -1; // Initialize the last delivery time to be a negative value

//     // Filter out orders that don't respect the time gap
//     sortedOrders.forEach((order) => {
//       const orderTimeInMinutes = parseTime(order.deliveryTime);
//       if (lastDeliveryTime === -1 || orderTimeInMinutes >= lastDeliveryTime + 60) {
//         optimizedOrders.push(order);
//         lastDeliveryTime = orderTimeInMinutes; // Update the last delivery time
//       }
//     });

//     console.log("Optimized orders based on time:", optimizedOrders);
//     return optimizedOrders;
//   };

//   // Optimize based on the driver's capacity and orders assigned to them
//   const assignOrdersToDriver = (optimizedOrders: Order[]): Order[] => {
//     const assignedOrders: Order[] = [];

//     // Check the capacity of the driver for each weight category
//     for (const weightCategory of ["light", "medium", "heavy"] as const) {
//       const ordersByWeight = driver.orders[weightCategory];
//       const capacity = driver.capacity[weightCategory];

//       // Assign orders based on the driver's capacity for each category
//       const ordersToAssign = ordersByWeight.slice(0, capacity);
//       assignedOrders.push(...ordersToAssign);
//     }

//     return assignedOrders;
//   };

//   return (
//     <div>
//       <h3>Optimized Route</h3>
//       {optimizedRoute.length === 0 ? (
//         <p>No orders available for optimization</p>
//       ) : (
//         <ul>
//           {optimizedRoute.map((order) => (
//             <li key={order.orderId}>
//               <strong>{order.orderId}:</strong> {order.address} (Delivery Time:{" "}
//               {order.deliveryTime})
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default RouteOptimizer;
