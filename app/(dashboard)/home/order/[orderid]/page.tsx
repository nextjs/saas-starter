"use client";
import React from "react";
import { useParams } from "next/navigation";

export default function Page() {
  const { orderId } = useParams();
  return (
    <div className="w-full h-full">
      <h1 className="text-lg font-bold">Order ID: {orderId}</h1>
    </div>
  );
}
