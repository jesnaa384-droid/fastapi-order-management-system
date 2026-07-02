"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [orders, setOrders] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [amount, setAmount] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const socket = useRef(null);
  const router = useRouter();

  const fetchOrders = async () => {
    const res = await fetch("http://127.0.0.1:8000/orders");
    const data = await res.json();
    setOrders(data);
  };
useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    router.push("/login");
  }
}, [router]);
  useEffect(() => {
    fetchOrders();

    socket.current = new WebSocket("ws://127.0.0.1:8000/ws");

  socket.current.onmessage = () => {
    fetchOrders();
  };

  return () => {
    socket.current.close();
  };
}, []);


  const addOrder = async () => {
    await fetch("http://127.0.0.1:8000/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_name: customerName,
        amount: Number(amount),
      }),
    });

    setCustomerName("");
    setAmount("");
    fetchOrders();
  };

  const deleteOrder = async (id) => {
    await fetch(`http://127.0.0.1:8000/orders/${id}`, {
      method: "DELETE",
    });

    fetchOrders();
  };

  const updateStatus = async (id, status) => {
    await fetch(`http://127.0.0.1:8000/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    fetchOrders();
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.customer_name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
  <div className="min-h-screen bg-gray-100 p-8">
    <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">

      <h1 className="text-4xl font-bold text-center text-blue-700 mb-8">
        Order Management Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-500 text-white rounded-lg p-5 shadow">
          <h3>Total Orders</h3>
          <p className="text-3xl font-bold">{orders.length}</p>
        </div>

        <div className="bg-yellow-500 text-white rounded-lg p-5 shadow">
          <h3>Pending</h3>
          <p className="text-3xl font-bold">
            {orders.filter(o => o.status === "Pending").length}
          </p>
        </div>

        <div className="bg-indigo-500 text-white rounded-lg p-5 shadow">
          <h3>Processing</h3>
          <p className="text-3xl font-bold">
            {orders.filter(o => o.status === "Processing").length}
          </p>
        </div>

        <div className="bg-green-500 text-white rounded-lg p-5 shadow">
          <h3>Completed</h3>
          <p className="text-3xl font-bold">
            {orders.filter(o => o.status === "Completed").length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          className="border rounded-lg p-3 text-black"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />

        <input
          className="border rounded-lg p-3 text-black"
          placeholder="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <button
        onClick={addOrder}
        className="bg-blue-600 text-white px-5 py-3 rounded-lg mb-6"
      >
        Add Order
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          className="border rounded-lg p-3 text-black"
          placeholder="Search customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border rounded-lg p-3 text-black"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-black">
        Orders
      </h2>

      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="flex justify-between items-center bg-white border rounded-lg shadow p-4"
          >
            <div>
              <h3 className="font-bold text-black">
                {order.customer_name}
              </h3>

              <p className="text-gray-700">
                ₹{order.amount} (≈ ${order.amount_usd})
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={order.status}
                onChange={(e) =>
                  updateStatus(order.id, e.target.value)
                }
                className="border rounded p-2 text-black"
              >
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Completed">Completed</option>
              </select>

              <button
                onClick={() => deleteOrder(order.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  </div>
);
}