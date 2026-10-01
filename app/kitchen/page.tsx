"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://mom-pos-backend-api.onrender.com");

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [active, setActive] = useState(false);
  const [now, setNow] = useState(Date.now());

  // ⏱️ อัปเดตเวลาปัจจุบันทุกๆ 10 วินาที เพื่อให้ตัวจับเวลาเดินสดๆ
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // 🔊 เล่นเสียงไฟล์ bell.mp3
  const playSound = () => {
    try {
      const audio = new Audio('/bell.mp3');
      audio.volume = 1.0;
      audio.play().catch(e => console.log("Audio play error:", e));
    } catch (e) {
      console.log("Audio error", e);
    }
  };

  useEffect(() => {
    socket.on("receive_order", (data) => {
      playSound();
      // บันทึกเวลาที่ออเดอร์เข้ามา (receivedAt) เพื่อเอาไปคำนวณนาที
      const newOrder = { ...data, receivedAt: Date.now() };
      setOrders((prev) => [...prev, newOrder]);
    });

    return () => {
      socket.off("receive_order");
    };
  }, []);

  const removeOrder = (id: string) => {
    setOrders(orders.filter((o) => o.id !== id));
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

  // 📌 จัดเรียงออเดอร์: เอาอันที่มาเร็วก่อน (เก่าสุด) ไว้บนสุด
  const sortedOrders = [...orders].sort((a, b) => a.receivedAt - b.receivedAt);

  // 🗂️ แยกหมวดหมู่: ปกติ (< 15 นาที) กับ ล่าช้า (>= 15 นาที)
  const delayedOrders = sortedOrders.filter(o => (now - o.receivedAt) >= 15 * 60 * 1000);
  const normalOrders = sortedOrders.filter(o => (now - o.receivedAt) < 15 * 60 * 1000);

  return (
    <div className="p-8 bg-gray-950 min-h-screen text-white">
      <h1 className="text-4xl font-black text-red-500 mb-8 text-center">🔥 หน้าจอครัว (ระบบคิวอาหารพ่อ)</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-32 text-gray-500 text-2xl">
          <p>ยังไม่มีออเดอร์ (นั่งพักได้เลยพ่อ) ☕</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* 🔴 หมวดหมู่: ออเดอร์ที่เกิน 15 นาที (ช้า) */}
          {delayedOrders.length > 0 && (
            <div>
              <h2 className="text-2xl font-black text-red-500 mb-4 bg-red-950/50 p-3 rounded-xl border border-red-600">
                ⚠️ ออเดอร์ล่าช้าเกิน 15 นาทีแล้ว (ต้องรีบทำด่วน!)
              </h2>
              <div className="grid grid-cols-2 gap-6">
                {delayedOrders.map((order, idx) => {
                  const minutes = Math.floor((now - order.receivedAt) / 60000);
                  return (
                    <div key={order.id || idx} className="bg-gray-900 border-4 border-red-600 rounded-3xl p-6 shadow-2xl animate-pulse">
                      <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
                        <div>
                          <h2 className="text-3xl font-extrabold text-yellow-400">โต๊ะ: {order.table}</h2>
                          <span className="text-red-400 font-bold text-lg">⏳ ส่งมาแล้ว {minutes} นาที (ช้ามาก!)</span>
                        </div>
                        <button 
                          onClick={() => removeOrder(order.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-lg hover:bg-red-700">
                          ✅ ทำเสร็จแล้ว
                        </button>
                      </div>
                      <ul className="space-y-3">
                        {order.items.map((item: any, i: number) => (
                          <li key={i} className="bg-gray-800 p-4 rounded-xl flex flex-col">
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
                  );
                })}
              </div>
            </div>
          )}

          {/* 🟢 หมวดหมู่: ออเดอร์ปกติ (< 15 นาที) เรียงคิวตามลำดับ */}
          {normalOrders.length > 0 && (
            <div>
              <h2 className="text-2xl font-black text-green-400 mb-4 bg-green-950/50 p-3 rounded-xl border border-green-600">
                📋 คิวออเดอร์ปกติ (เรียงตามลำดับก่อน-หลัง)
              </h2>
              <div className="grid grid-cols-2 gap-6">
                {normalOrders.map((order, idx) => {
                  const minutes = Math.floor((now - order.receivedAt) / 60000);
                  return (
                    <div key={order.id || idx} className="bg-gray-900 border-2 border-blue-500 rounded-3xl p-6 shadow-2xl">
                      <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
                        <div>
                          <h2 className="text-3xl font-extrabold text-yellow-400">โต๊ะ: {order.table}</h2>
                          <span className="text-blue-300 font-semibold">⏱️ ส่งมาแล้ว {minutes} นาที</span>
                        </div>
                        <button 
                          onClick={() => removeOrder(order.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-lg hover:bg-red-700">
                          ✅ ทำเสร็จแล้ว
                        </button>
                      </div>
                      <ul className="space-y-3">
                        {order.items.map((item: any, i: number) => (
                          <li key={i} className="bg-gray-800 p-4 rounded-xl flex flex-col">
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
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}