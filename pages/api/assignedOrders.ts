// pages/api/optimizeRoutes.ts

import type { NextApiRequest, NextApiResponse } from 'next';

// Mock Data for Drivers (initial set, this can be expanded dynamically)
const initialDrivers = [
  { id: 1, location: { lat: 19.2183, lng: 72.9781 }, capacity: { light: 3, medium: 2, heavy: 1 } },
  { id: 2, location: { lat: 19.3000, lng: 72.9630 }, capacity: { light: 3, medium: 2, heavy: 1 } },
  { id: 3, location: { lat: 19.3700, lng: 72.8800 }, capacity: { light: 3, medium: 2, heavy: 1 } },
];

// Helper Function to Assign Orders to Drivers Based on Weight Constraints
const assignOrdersToDrivers = (orders: any[], drivers: any[]) => {
  const remainingOrders = [...orders];
  const assignedOrders = drivers.map(driver => {
    const capacity = { ...driver.capacity };
    const assigned = { ...driver, orders: { light: [], medium: [], heavy: [] } };

    for (let i = 0; i < remainingOrders.length; i++) {
      const order = remainingOrders[i];

      if (order.weight === 'light' && assigned.orders.light.length < capacity.light) {
        assigned.orders.light.push(order);
        remainingOrders.splice(i, 1); // Remove assigned order
        i--; // Adjust index after removal
      } else if (order.weight === 'medium' && assigned.orders.medium.length < capacity.medium) {
        assigned.orders.medium.push(order);
        remainingOrders.splice(i, 1);
        i--;
      } else if (order.weight === 'heavy' && assigned.orders.heavy.length < capacity.heavy) {
        assigned.orders.heavy.push(order);
        remainingOrders.splice(i, 1);
        i--;
      }
    }

    return assigned;
  });

  return { assignedOrders, remainingOrders };
};

// Helper Function to Create New Drivers If Needed
const createAdditionalDrivers = (remainingOrders: any[], initialDrivers: any[]) => {
  const neededDrivers = Math.ceil(remainingOrders.length / 3); // Assume 3 orders per new driver

  let newDrivers = [];
  for (let i = 0; i < neededDrivers; i++) {
    const newDriverId = initialDrivers.length + i + 1;
    newDrivers.push({
      id: newDriverId,
      location: { lat: 19.4 + Math.random() * 0.1, lng: 72.9 + Math.random() * 0.1 }, // Random locations
      capacity: { light: 3, medium: 2, heavy: 1 },
    });
  }

  return newDrivers;
};

// Fetch Orders from the Orders API
const fetchOrders = async () => {
  const response = await fetch('http://localhost:3000/api/orders');
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  const data = await response.json();
  return data.orders; // Assuming the API returns { orders: [...] }
};

// Handler for the API Request
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Fetch Orders from Orders API
      const orders = await fetchOrders();
      console.log('Fetched Orders:', orders);

      // Assign Orders to Initial Drivers
      let drivers = [...initialDrivers];
      let { assignedOrders, remainingOrders } = assignOrdersToDrivers(orders, drivers);

      // If there are remaining unassigned orders, create new drivers
      while (remainingOrders.length > 0) {
        const newDrivers = createAdditionalDrivers(remainingOrders, drivers);
        drivers = [...drivers, ...newDrivers];

        // Reassign remaining orders to the new drivers
        const reassigned = assignOrdersToDrivers(remainingOrders, newDrivers);
        assignedOrders = [...assignedOrders, ...reassigned.assignedOrders];
        remainingOrders = reassigned.remainingOrders;
      }

      console.log('Assigned Orders:', assignedOrders);

      res.status(200).json({
        success: true,
        message: 'Orders assigned and routes optimized',
        data: assignedOrders,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error optimizing routes.',
      });
    }
  } else {
    res.status(405).json({
      success: false,
      message: 'Method Not Allowed',
    });
  }
}
