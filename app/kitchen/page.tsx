"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://mom-pos-backend-api.onrender.com");

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [active, setActive] = useState(false);

  // 🔊 เล่นไฟล์เสียง bell.mp3 จากโฟลเดอร์ public ด้วยความดังสูงสุด
  const playSound = () => {
    try {
      const audio = new Audio('/bell.mp3');
      audio.volume = 1.0; // ปรับเสียงดังสุด 100%
      audio.play().catch(e => console.log("Audio play error:", e));
    } catch (e) {
      console.log("Audio error", e);
    }
  };

  useEffect(() => {
    socket.on("receive_order", (data) => {
      playSound();
      setOrders((prev) => [data, ...prev]);
    });

    return () => {
      socket.off("receive_order");
    };
  }, []);

  const removeOrder = (index: number) => {
    setOrders(orders.filter((_, i) => i !== index));
  };

  if (!active) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <h1 className="text-4xl font-bold mb-6">👨‍🍳 หน้าจอครัว (สำหรับพ่อ)</h1>
        <button 
          onClick={() => { setActive(true); playSound(); }} 
          className="bg-green-600 text-white text-3xl font-black px-10 py-6 rounded-2xl shadow-2xl animate-pulse hover:bg-green-500">
          แตะเพื่อเปิดระบบ 👨‍🍳
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-950 min-h-screen text-white">
      <h1 className="text-4xl font-black text-red-500 mb-6 text-center">🔥 หน้าจอครัว (รายการอาหารของพ่อ)</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-32 text-gray-500 text-2xl">
          <p>ยังไม่มีออเดอร์ (นั่งพักได้เลยพ่อ) ☕</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {orders.map((order, idx) => (
            <div key={idx} className="bg-gray-900 border-4 border-red-500 rounded-3xl p-6 shadow-2xl animate-bounce">
              <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
                <h2 className="text-3xl font-extrabold text-yellow-400">โต๊ะ: {order.table}</h2>
                <button 
                  onClick={() => removeOrder(idx)}
                  className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-lg hover:bg-red-700">
                  ✅ ทำเสร็จแล้ว
                </button>
              </div>
              <ul className="space-y-3">
                {order.items.map((item: any, i: number) => (
                  <li key={i} className="bg-gray-800 p-4 rounded-xl flex flex-col">
                    <link />
                    <div className="flex justify-between text-2xl font-bold">
                      <span>• {item.name}</span>
                      <span className="text-green-400">{item.price} ฿</span>
                    </div>
                    {item.note && (
                      <span className="text-yellow-300 text-lg mt-1 bg-gray-700 px-3 py-1 rounded">
                        หมายเหตุ: {item.note}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}