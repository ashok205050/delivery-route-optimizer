"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import { SidebarTrigger } from "@/components/ui/sidebar";

// Dynamically import the Map component
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

// Types for orders and drivers
interface Order {
  orderId: string;
  address: string;
  deliveryTime: string;
  weight: "light" | "medium" | "heavy";
  lat: number;
  lng: number;
}

interface Driver {
  id: number;
  location: { lat: number; lng: number };
  orders: {
    light: Order[];
    medium: Order[];
    heavy: Order[];
  };
}

export default function Home() {
  const [selectedWeight, setSelectedWeight] = useState<string>("");
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>("");
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [driverStats, setDriverStats] = useState({
    totalOrders: 0,
    totalStops: 0,
    totalDistance: "Calculating...",
    estimatedTime: "Calculating...",
  });

  // Fetch drivers and their assigned orders
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch("/api/assignedOrders", { method: "POST" });
        if (!response.ok) throw new Error("Failed to fetch assigned orders");
        const data = await response.json();
        setDrivers(data.data);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };

    fetchDrivers();
  }, []);

  // Calculate driver statistics
  const calculateDriverStats = (driver: Driver) => {
    const totalOrders = driver.orders.light.length + driver.orders.medium.length + driver.orders.heavy.length;
    const allOrders = [...driver.orders.light, ...driver.orders.medium, ...driver.orders.heavy];
    const uniqueStops = new Set(allOrders.map((order) => `${order.lat},${order.lng}`)).size;

    const totalDistance = `${(uniqueStops * 3).toFixed(1)} km`;
    const estimatedTime = `${(uniqueStops * 10).toFixed(0)} mins`;

    setDriverStats({
      totalOrders,
      totalStops: uniqueStops,
      totalDistance,
      estimatedTime,
    });
  };

  // Select a driver
  const handleDriverSelect = (driver: Driver) => {
    setSelectedDriver(driver);
    calculateDriverStats(driver);
    setIsDrawerOpen(true);
  };

  // Handle weight filter change
  const handleWeightChange = (weight: string) => {
    setSelectedWeight(weight);
  };

  // Filter orders based on driver and weight
  const filteredOrders = selectedDriver
    ? selectedWeight
      ? selectedDriver.orders[selectedWeight as keyof Driver["orders"]].sort(
          (a, b) => a.deliveryTime.localeCompare(b.deliveryTime)
        )
      : [...selectedDriver.orders.light, ...selectedDriver.orders.medium, ...selectedDriver.orders.heavy].sort(
          (a, b) => a.deliveryTime.localeCompare(b.deliveryTime)
        )
    : [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Controls */}
      <div className="flex flex-wrap items-center p-4 bg-gray-100 border-b border-gray-300 gap-4">
        <SidebarTrigger className="ml-0 mr-5 left-4 z-50" />

        {/* Driver Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto md:w-[12vw] lg:w-[10vw]">
              {selectedDriver ? `Driver ${selectedDriver.id}` : "Select Driver"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {drivers.map((driver) => (
              <DropdownMenuItem key={driver.id} onClick={() => handleDriverSelect(driver)}>
                Driver {driver.id}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Weight Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto md:w-[12vw] lg:w-[10vw]">
              {selectedWeight ? selectedWeight.charAt(0).toUpperCase() + selectedWeight.slice(1) : "All Weights"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleWeightChange("")}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleWeightChange("light")}>Light</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleWeightChange("medium")}>Medium</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleWeightChange("heavy")}>Heavy</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Algorithm Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto md:w-[12vw] lg:w-[10vw]">
              {selectedAlgorithm || "Optimize Routes"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSelectedAlgorithm("Routes by Delivery Time")}>
              Routes by Delivery Time
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSelectedAlgorithm("Google Waypoint")}>
              Google Waypoint
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Driver Stats Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="flex flex-col justify-between max-h-[90vh] w-full p-6 bg-white rounded-lg shadow-lg">
          <DrawerHeader className="text-center">
            <DrawerTitle className="text-lg font-bold">Driver Details</DrawerTitle>
            <DrawerDescription className="text-sm text-gray-600">
              Driver {selectedDriver?.id}&apos;s Summary:
            </DrawerDescription>
          </DrawerHeader>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Total Orders:</span> {driverStats.totalOrders}
            </p>
            <p className="text-sm">
              <span className="font-medium">Total Stops:</span> {driverStats.totalStops}
            </p>
            <p className="text-sm">
              <span className="font-medium">Total Distance:</span> {driverStats.totalDistance}
            </p>
            <p className="text-sm">
              <span className="font-medium">Estimated Time:</span> {driverStats.estimatedTime}
            </p>
          </div>
          <DrawerFooter className="mt-4">
            <Button variant="outline" className="w-full" onClick={() => setIsDrawerOpen(false)}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Map */}
      <Card className="flex-grow h-[calc(100vh-200px)]">
        <Map orders={filteredOrders} selectedAlgorithm={selectedAlgorithm} />
      </Card>
    </div>
  );
}
