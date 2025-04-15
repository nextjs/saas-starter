"use client";
import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import OrderItem from "./compontents/order-item";
import { Datum } from "@/app/types/types";
import { getOrderList } from "@/app/request/api";
import { NotepadTextDashed } from "lucide-react";
import OrderSkeleton from "./compontents/order-skeleton";
export default function Page() {
  const [orderList, setOrderList] = useState<Datum[]>([]);
  const [activeTab, setActiveTab] = useState<string>("agreement");
  const [loading, setLoading] = useState<boolean>(false);
  const getOrders = async () => {
    try {
      setLoading(true);
      const res = await getOrderList({ kol_audit_status: activeTab });
      setLoading(false);
      if (res.code === 200) {
        setOrderList(res.data);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  useEffect(() => {
    getOrders();
  }, [activeTab]);
  return (
    <div className="w-full h-full">
      <h1 className="text-lg font-bold mb-4">Order List</h1>
      <div className="w-full flex flex-col gap-4">
        {loading ? (
          Array.from({ length: 10 }).map((_, index) => (
            <OrderSkeleton key={index} />
          ))
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 w-full md:w-sm">
              <TabsTrigger value="agreement">Agreement</TabsTrigger>
              <TabsTrigger value="doing">Doing</TabsTrigger>
              <TabsTrigger value="finished">Finish</TabsTrigger>
              <TabsTrigger value="reject">Reject</TabsTrigger>
            </TabsList>
            {orderList.length > 0 ? (
              <>
                <TabsContent value="agreement">
                  {orderList.map((order) => (
                    <OrderItem key={order.id} order={order} />
                  ))}
                </TabsContent>
                <TabsContent value="doing">
                  {orderList.map((order) => (
                    <OrderItem key={order.id} order={order} />
                  ))}
                </TabsContent>
                <TabsContent value="finished">
                  {orderList.map((order) => (
                    <OrderItem key={order.id} order={order} />
                  ))}
                </TabsContent>
                <TabsContent value="reject">
                  {orderList.map((order) => (
                    <OrderItem key={order.id} order={order} />
                  ))}
                </TabsContent>
              </>
            ) : (
              <div className="w-full h-full flex flex-col gap-2 items-center justify-center py-40">
                <NotepadTextDashed className="w-10 h-10 text-muted-foreground" />
                <span className="text-md text-muted-foreground">No data</span>
              </div>
            )}
          </Tabs>
        )}
      </div>
    </div>
  );
}
