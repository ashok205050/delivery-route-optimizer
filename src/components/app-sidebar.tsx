"use client";
import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define types for orders and drivers
interface Order {
  orderId: string;
  address: string;
  deliveryTime: string;
  weight: string;
  lat: number;
  lng: number;
}

interface Driver {
  id: number;
  location: { lat: number; lng: number };
  capacity: { light: number; medium: number; heavy: number };
  orders: { light: Order[]; medium: Order[]; heavy: Order[] };
}

export function AppSidebar() {
  const [showOrders, setShowOrders] = useState<boolean>(false);
  const [orders, setOrders] = useState<Order[]>([]); // State for all orders
  const [drivers, setDrivers] = useState<Driver[]>([]); // State for drivers
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null); // State for selected driver
  const [selectedWeight, setSelectedWeight] = useState<string>("");

  // Fetch all orders from an API
  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders"); // Replace with your API endpoint for orders
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      setOrders(data.orders); // Assuming the API returns { orders: [...] }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Fetch drivers and their assigned orders from the optimizeRoutes API
  const fetchDrivers = async () => {
    try {
      const response = await fetch("/api/assignedOrders", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to fetch assigned order");
      }
      const data = await response.json();
      setDrivers(data.data); // Set the drivers with assigned orders
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    fetchOrders();
    fetchDrivers();
  }, []);

  // Toggle orders visibility
  const toggleOrders = () => {
    setShowOrders((prev) => !prev);
  };

  // Handle filter change
  const handleFilterChange = (weight: string) => {
    setSelectedWeight(weight); // Update filter and trigger re-render
  };

  // Handle driver selection with toggle behavior
  const handleDriverSelect = (driver: Driver) => {
    if (selectedDriver?.id === driver.id) {
      setSelectedDriver(null); // If the same driver is clicked, hide the orders table
    } else {
      setSelectedDriver(driver); // If a different driver is clicked, show the assigned orders
    }
  };

  // Filter orders by selected weight category
  const filteredOrders = selectedWeight
    ? orders.filter((order) => order.weight === selectedWeight)
    : orders;

  return (
    <Sidebar variant="sidebar">
      <SidebarHeader className="cursor-pointer font-bold">Rentkar.com</SidebarHeader>
      <hr className="border-t-2"/>
      <SidebarContent>
        <SidebarMenu>
          {/* Button to toggle orders visibility */}
          <Button variant={"secondary"} className="bg-gray-500 hover:bg-gray-700 text-white mt-4" onClick={toggleOrders}>
            {showOrders ? "Hide Orders List" : "Show Orders List"}
          </Button>

          {/* Dropdown menu to filter by weight - Only shown when orders are visible */}
          {showOrders && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  Filter by weight:
                  <ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-48">
                <DropdownMenuItem onClick={() => handleFilterChange("light")}>
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("medium")}>
                  <span>Medium</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("heavy")}>
                  <span>Heavy</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("")}>
                  <span>All</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Display orders table when 'Show Orders' button is clicked */}
          {showOrders && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">All Orders</h3>
              <table className="table-auto w-full border mt-2">
                <thead>
                  <tr>
                    <th className="border p-1 text-xs">Order ID</th>
                    <th className="border p-1 text-xs">Address</th>
                    <th className="border p-1 text-xs">Delivery Time</th>
                    <th className="border p-1 text-xs">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.orderId}>
                      <td className="border p-1 text-xs">{order.orderId}</td>
                      <td className="border p-1 text-xs">{order.address}</td>
                      <td className="border p-1 text-xs">{order.deliveryTime}</td>
                      <td className="border p-1 text-xs">{order.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Display drivers list below the Show Orders button */}
          <div className="flex justify-center font-semibold mt-10 underline">
            <SidebarHeader>Drivers</SidebarHeader>
          </div>
          {drivers.map((driver) => (
            <div key={driver.id}>
              <Button
                variant={"ghost"}
                onClick={() => handleDriverSelect(driver)}
                className="cursor-pointer hover:bg-gray-300"
              >
                Driver {driver.id}
              </Button>
              <hr className="border-t-2"/>

              {/* Render the orders table below the driver button when selected */}
              {selectedDriver?.id === driver.id && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">
                    Assigned Orders for Driver {driver.id}
                  </h3>
                  {["light", "medium", "heavy"].map((weightCategory) => (
                    <div key={weightCategory}>
                      <h4 className="font-medium mt-2">{weightCategory.charAt(0).toUpperCase() + weightCategory.slice(1)} Orders</h4>
                      <table className="table-auto w-full border mt-2">
                        <thead>
                          <tr>
                            <th className="border p-1 text-xs">Order ID</th>
                            <th className="border p-1 text-xs">Address</th>
                            <th className="border p-1 text-xs">Delivery Time</th>
                            <th className="border p-1 text-xs">Weight</th>
                          </tr>
                        </thead>
                        <tbody>
                          {driver.orders[weightCategory as keyof Driver["orders"]].map((order) => (
                            <tr key={order.orderId}>
                              <td className="border p-1 text-xs">{order.orderId}</td>
                              <td className="border p-1 text-xs">{order.address}</td>
                              <td className="border p-1 text-xs">{order.deliveryTime}</td>
                              <td className="border p-1 text-xs">{order.weight}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
