import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const orders = [
    { orderId: "101", address: "Oberoi Mall, Goregaon", deliveryTime: "10:00 AM", weight: "light", lat: 19.1683, lng: 72.8369 },
    { orderId: "102", address: "Lokhandwala, Andheri West", deliveryTime: "10:30 AM", weight: "light", lat: 19.1362, lng: 72.8288 },
    { orderId: "103", address: "BKC, Bandra", deliveryTime: "11:00 AM", weight: "medium", lat: 19.0558, lng: 72.8676 },
    { orderId: "104", address: "Raghuleela Mall, Kandivali", deliveryTime: "9:45 AM", weight: "heavy", lat: 19.2094, lng: 72.8443 },
    { orderId: "105", address: "Khar West", deliveryTime: "12:00 PM", weight: "light", lat: 19.0665, lng: 72.8332 },
    { orderId: "106", address: "Vashi", deliveryTime: "12:30 PM", weight: "medium", lat: 19.076, lng: 72.8777 },
    { orderId: "107", address: "Palm Beach Road, Nerul", deliveryTime: "11:15 AM", weight: "heavy", lat: 19.033, lng: 73.0297 },
    { orderId: "108", address: "CBD Belapur", deliveryTime: "11:45 AM", weight: "light", lat: 19.0188, lng: 73.0365 },
    { orderId: "109", address: "High Street Phoenix, Lower Parel", deliveryTime: "9:00 AM", weight: "medium", lat: 18.9941, lng: 72.8258 },
    { orderId: "110", address: "Infiniti Mall, Malad", deliveryTime: "1:00 PM", weight: "light", lat: 19.1726, lng: 72.8369 },
    { orderId: "111", address: "Dadar TT Circle, Dadar", deliveryTime: "9:30 AM", weight: "medium", lat: 19.018, lng: 72.8439 },
    { orderId: "112", address: "Versova Beach, Andheri", deliveryTime: "10:45 AM", weight: "heavy", lat: 19.1312, lng: 72.8126 },
    { orderId: "113", address: "Worli Sea Face", deliveryTime: "8:45 AM", weight: "light", lat: 18.9916, lng: 72.8128 },
    { orderId: "114", address: "Carter Road, Bandra", deliveryTime: "11:15 AM", weight: "medium", lat: 19.0635, lng: 72.8267 },
    { orderId: "115", address: "Kamothe, Panvel", deliveryTime: "12:45 PM", weight: "light", lat: 19.0226, lng: 73.1089 },
    { orderId: "116", address: "Seawoods, Nerul", deliveryTime: "1:30 PM", weight: "medium", lat: 19.0288, lng: 73.0356 },
    { orderId: "117", address: "Powai Lake", deliveryTime: "9:15 AM", weight: "light", lat: 19.1185, lng: 72.9097 },
    { orderId: "118", address: "Phoenix Market City, Kurla", deliveryTime: "10:15 AM", weight: "medium", lat: 19.0896, lng: 72.8904 },
    { orderId: "119", address: "Hiranandani Gardens, Powai", deliveryTime: "11:45 AM", weight: "heavy", lat: 19.1173, lng: 72.9055 },
    { orderId: "120", address: "Bandra Reclamation", deliveryTime: "8:00 AM", weight: "light", lat: 19.0496, lng: 72.8183 },
    { orderId: "121", address: "Sion Circle, Sion", deliveryTime: "9:50 AM", weight: "medium", lat: 19.0468, lng: 72.8626 },
    { orderId: "122", address: "Mahalaxmi Temple", deliveryTime: "11:30 AM", weight: "heavy", lat: 18.9807, lng: 72.8184 },
    { orderId: "123", address: "Gateway of India, Colaba", deliveryTime: "10:20 AM", weight: "light", lat: 18.922, lng: 72.8347 },
    { orderId: "124", address: "Juhu Beach", deliveryTime: "12:15 PM", weight: "medium", lat: 19.0968, lng: 72.8266 },
    { orderId: "125", address: "Chembur Station", deliveryTime: "1:45 PM", weight: "light", lat: 19.0638, lng: 72.8995 }
  ];

  res.status(200).json({ orders });
}
