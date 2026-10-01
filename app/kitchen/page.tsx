"use client";
import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";

// ✅ เปลี่ยนมาใช้ลิงก์ Render ตรงนี้เรียบร้อย
const socket = io("https://mom-pos-backend-api.onrender.com"); 

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isReady, setIsReady] = useState(false); 
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio("/bell.mp3");

    socket.on("new_kitchen_order", (data) => {
      setOrders((prevOrders) => [...prevOrders, data]);
      
      if (isReady && audioRef.current) {
         audioRef.current.play().catch(error => console.log("เล่นเสียงไม่ได้:", error));
      }
    });

    return () => {
      socket.off("new_kitchen_order");
    };
  }, [isReady]);

  const markAsDone = (indexToRemove: number) => {
    setOrders((prevOrders) => prevOrders.filter((_, index) => index !== indexToRemove));
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-6 text-white">
        <h1 className="text-4xl mb-8 font-bold">รอรับออเดอร์ใหม่...</h1>
        <button 
          onClick={() => setIsReady(true)}
          className="bg-red-600 hover:bg-red-500 text-white font-bold text-3xl py-8 px-12 rounded-2xl shadow-xl active:scale-95"
        >
          แตะเพื่อเปิดระบบ 👨‍🍳
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold mb-8 text-center text-red-500 tracking-wider">
        🔥 หน้าจอครัว (สำหรับพ่อ) 🔥
      </h1>

      {orders.length === 0 ? (
        <div className="flex justify-center items-center h-64 text-gray-500 text-3xl font-bold">
          ยังไม่มีออเดอร์ (นั่งพักได้เลยพ่อ) ☕
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((orderGroup, groupIndex) => (
            <div key={groupIndex} className="bg-gray-800 rounded-2xl p-6 shadow-2xl border-t-4 border-red-500">
              <h2 className="text-3xl font-bold mb-4 text-yellow-400 border-b border-gray-700 pb-2">
                {orderGroup.table}
              </h2>
              
              <ul className="space-y-4 mb-6">
                {orderGroup.items.map((item: any, itemIndex: number) => (
                  <li key={itemIndex} className="text-2xl">
                    <span className="font-bold text-white">- {item.name}</span>
                    {item.note && (
                      <div className="text-xl text-red-400 mt-1 pl-4 font-bold">
                        👉 {item.note}
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => markAsDone(groupIndex)}
                className="w-full bg-green-600 hover:bg-green-500 text-white text-2xl font-bold py-4 rounded-xl transition-colors shadow-lg active:scale-95"
              >
                ✅ เสร็จแล้ว (ลบออก)
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}