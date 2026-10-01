"use client";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("https://mom-pos-backend-api.onrender.com");

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [active, setActive] = useState(false);
  const [now, setNow] = useState(Date.now());

  // 🔊 ใช้ useRef โหลดไฟล์ bell.mp3 ไว้ในความจำ เพื่อให้มือถือเล่นซ้ำได้ทุกออเดอร์
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('/bell.mp3');
    audioRef.current.load();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // ฟังก์ชันเล่นเสียง bell.mp3 ด้วยความดังสุด และรีเซ็ตเวลาเพื่อให้เล่นซ้ำได้ตลอด
  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // รีเซบเพลงกลับมาเริ่มใหม่
      audioRef.current.volume = 1.0;     // ความดัง 100%
      audioRef.current.play().catch(e => {
        console.log("Audio play blocked:", e);
      });
    }
  };

  const fetchKitchenOrders = async () => {
    try {
      const res = await fetch("https://mom-pos-backend-api.onrender.com/api/kitchen-orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();

    socket.on("receive_order", (data) => {
      playSound();
      setOrders((prev) => [...prev, data]);
    });

    socket.on("order_removed", (id) => {
      setOrders((prev) => prev.filter(o => o.id !== id));
    });

    return () => {
      socket.off("receive_order");
      socket.off("order_removed");
    };
  }, []);

  const removeOrder = async (id: string | number) => {
    setOrders(orders.filter((o) => o.id !== id));
    socket.emit("finish_order", id);

    try {
      await fetch(`https://mom-pos-backend-api.onrender.com/api/kitchen-orders/${id}`, {
        method: "DELETE"
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (!active) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">👨‍🍳 หน้าจอครัว (สำหรับพ่อ)</h1>
        <button 
          onClick={() => { 
            setActive(true); 
            // ปลุกระบบเสียงตอนกดปุ่มเปิดครั้งแรกเพื่อให้มือถืออนุญาต
            if (audioRef.current) {
              audioRef.current.play().then(() => {
                audioRef.current?.pause();
                audioRef.current!.currentTime = 0;
              }).catch(e => console.log(e));
            }
          }} 
          className="bg-green-600 text-white text-2xl sm:text-3xl font-black px-8 py-5 rounded-2xl shadow-2xl animate-pulse hover:bg-green-500">
          แตะเพื่อเปิดระบบ 👨‍🍳
        </button>
      </div>
    );
  }

  const sortedOrders = [...orders].sort((a, b) => a.receivedAt - b.receivedAt);
  const delayedOrders = sortedOrders.filter(o => (now - o.receivedAt) >= 15 * 60 * 1000);
  const normalOrders = sortedOrders.filter(o => (now - o.receivedAt) < 15 * 60 * 1000);

  return (
    <div className="p-4 sm:p-8 bg-gray-950 min-h-screen text-white">
      <h1 className="text-3xl sm:text-4xl font-black text-red-500 mb-6 sm:mb-8 text-center">🔥 หน้าจอครัว (ระบบคิวอาหารพ่อ)</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-32 text-gray-500 text-xl sm:text-2xl text-center">
          <p>ยังไม่มีออเดอร์ (นั่งพักได้เลยพ่อ) ☕</p>
        </div>
      ) : (
        <div className="space-y-8">
          {delayedOrders.length > 0 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-red-500 mb-4 bg-red-950/50 p-3 rounded-xl border border-red-600">
                ⚠️️ ออเดอร์ล่าช้าเกิน 15 นาทีแล้ว (ต้องรีบทำด่วน!)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {delayedOrders.map((order, idx) => {
                  const minutes = Math.floor((now - order.receivedAt) / 60000);
                  return (
                    <div key={order.id || idx} className="bg-gray-900 border-4 border-red-600 rounded-3xl p-5 sm:p-6 shadow-2xl animate-pulse">
                      <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3 gap-2">
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-extrabold text-yellow-400">โต๊ะ: {order.table}</h2>
                          <span className="text-red-400 font-bold text-sm sm:text-lg">⏳ ส่งมาแล้ว {minutes} นาที (ช้ามาก!)</span>
                        </div>
                        <button 
                          onClick={() => removeOrder(order.id)}
                          className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-xl font-bold text-sm sm:text-lg hover:bg-red-700 whitespace-nowrap">
                          ✅ ทำเสร็จแล้ว
                        </button>
                      </div>
                      <ul className="space-y-3">
                        {order.items.map((item: any, i: number) => (
                          <li key={i} className="bg-gray-800 p-3 sm:p-4 rounded-xl flex flex-col">
                            <div className="flex justify-between text-xl sm:text-2xl font-bold">
                              <span>• {item.name}</span>
                              <span className="text-green-400">{item.price} ฿</span>
                            </div>
                            {item.note && (
                              <span className="text-yellow-300 text-base sm:text-lg mt-1 bg-gray-700 px-3 py-1 rounded">
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

          {normalOrders.length > 0 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-green-400 mb-4 bg-green-950/50 p-3 rounded-xl border border-green-600">
                📋 คิวออเดอร์ปกติ (เรียงตามลำดับก่อน-หลัง)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {normalOrders.map((order, idx) => {
                  const minutes = Math.floor((now - order.receivedAt) / 60000);
                  return (
                    <div key={order.id || idx} className="bg-gray-900 border-2 border-blue-500 rounded-3xl p-5 sm:p-6 shadow-2xl">
                      <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3 gap-2">
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-extrabold text-yellow-400">โต๊ะ: {order.table}</h2>
                          <span className="text-blue-300 font-semibold text-sm sm:text-base">⏱️ ส่งมาแล้ว {minutes} นาที</span>
                        </div>
                        <button 
                          onClick={() => removeOrder(order.id)}
                          className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-xl font-bold text-sm sm:text-lg hover:bg-red-700 whitespace-nowrap">
                          ✅ ทำเสร็จแล้ว
                        </button>
                      </div>
                      <ul className="space-y-3">
                        {order.items.map((item: any, i: number) => (
                          <li key={i} className="bg-gray-800 p-3 sm:p-4 rounded-xl flex flex-col">
                            <div className="flex justify-between text-xl sm:text-2xl font-bold">
                              <span>• {item.name}</span>
                              <span className="text-green-400">{item.price} ฿</span>
                            </div>
                            {item.note && (
                              <span className="text-yellow-300 text-base sm:text-lg mt-1 bg-gray-700 px-3 py-1 rounded">
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