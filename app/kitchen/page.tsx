"use client";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

const socket = io("https://mom-pos-backend-api.onrender.com");

export default function KitchenPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [active, setActive] = useState(false);
  const [now, setNow] = useState(Date.now());

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

  // 🔔 1. ฟังก์ชันขออนุญาตแจ้งเตือน (เรียกตอนกดเข้าแอป)
  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          console.log("✅ อนุญาตการแจ้งเตือนแล้ว");
        }
      });
    }
  };

  // 🔔 2. ฟังก์ชันเด้งแจ้งเตือนลงมาจากขอบจอ
  const showPushNotification = (orderData: any) => {
    if ("Notification" in window && Notification.permission === "granted") {
      // เอาชื่อเมนูมาต่อกันให้เห็นในแจ้งเตือนเลย
      const menuList = orderData.items.map((i: any) => `${i.name} x${i.quantity || 1}`).join(", ");
      
      const notification = new Notification(`🔥 ออเดอร์ใหม่ โต๊ะ: ${orderData.table}`, {
        body: `เมนู: ${menuList}`,
        icon: "https://cdn-icons-png.flaticon.com/512/3565/3565418.png", // ไอคอนกระทะเท่ๆ
        vibrate: [200, 100, 200, 100, 200], // สั่นเตือน
      });

      // พอกดที่แจ้งเตือน ให้เด้งเปิดหน้าเว็บครัวขึ้นมา
      notification.onclick = function() {
        window.focus();
        this.close();
      };
    }
  };

  // 🔊 ระบบเสียงดังลั่น
  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1.0;
      audioRef.current.play().catch(e => {
        console.log("Audio file play error, using fallback beep:", e);
        playBeepFallback();
      });
    } else {
      playBeepFallback();
    }
  };

  const playBeepFallback = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.8, audioCtx.currentTime); // เร่งเสียงให้ดังขึ้น
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (err) {
      console.log("Fallback beep error:", err);
    }
  };

  const fetchKitchenData = async () => {
    try {
      const resActive = await fetch("https://mom-pos-backend-api.onrender.com/api/kitchen-orders");
      const dataActive = await resActive.json();
      setOrders(dataActive);

      const resHistory = await fetch("https://mom-pos-backend-api.onrender.com/api/kitchen-history");
      const dataHistory = await resHistory.json();
      setHistory(dataHistory);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchKitchenData();

    socket.on("receive_order", (data) => {
      playSound(); // เล่นเสียงดังๆ
      showPushNotification(data); // เด้งแจ้งเตือนจากขอบจอ
      setOrders((prev) => [...prev, data]);
    });

    socket.on("state_updated", ({ active, history }) => {
      setOrders(active);
      setHistory(history);
    });

    socket.on("history_cleared", () => {
      setHistory([]);
    });

    return () => {
      socket.off("receive_order");
      socket.off("state_updated");
      socket.off("history_cleared");
    };
  }, []);

  const finishOrder = (id: string | number) => {
    socket.emit("finish_order", id);
  };

  const revertOrder = (id: string | number) => {
    socket.emit("revert_order", id);
  };

  const clearHistoryToday = async () => {
    if (confirm("🔄 ต้องการล้างประวัติออเดอร์ทั้งหมดของวันนี้ใช่หรือไม่?")) {
      socket.emit("clear_history");
      try {
        await fetch("https://mom-pos-backend-api.onrender.com/api/kitchen-history", { method: "DELETE" });
      } catch (e) {
        console.error(e);
      }
    }
  };

  if (!active) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6">👨‍🍳 หน้าจอครัว (สำหรับพ่อ)</h1>
        <button 
          onClick={() => { 
            setActive(true); 
            requestNotificationPermission(); // ขออนุญาตเด้งแจ้งเตือนตอนกด
            playSound();
          }} 
          className="bg-green-600 text-white text-2xl sm:text-3xl font-black px-8 py-5 rounded-2xl shadow-2xl animate-pulse hover:bg-green-500">
          แตะเพื่อเปิดระบบ 👨‍‍🍳
        </button>
        <p className="mt-6 text-gray-400 text-sm">⚠️ ถ้าระบบถามหาการแจ้งเตือน ให้กด <span className="text-white font-bold">"อนุญาต"</span> ด้วยนะครับ</p>
      </div>
    );
  }

  const sortedOrders = [...orders].sort((a, b) => a.receivedAt - b.receivedAt);
  const delayedOrders = sortedOrders.filter(o => (now - o.receivedAt) >= 15 * 60 * 1000);
  const normalOrders = sortedOrders.filter(o => (now - o.receivedAt) < 15 * 60 * 1000);

  return (
    <div className="p-4 sm:p-8 bg-gray-950 min-h-screen text-white">
      <h1 className="text-3xl sm:text-4xl font-black text-red-500 mb-6 text-center">🔥 หน้าจอครัว (ระบบคิวอาหารพ่อ)</h1>

      <div className="flex justify-center gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('active')}
          className={`px-6 py-3 rounded-2xl font-bold text-lg transition-all ${
            activeTab === 'active' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          🔥 ออเดอร์ที่ต้องทำ ({orders.length})
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 rounded-2xl font-bold text-lg transition-all ${
            activeTab === 'history' ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          📜 ประวัติที่ทำเสร็จแล้ววันนี้ ({history.length})
        </button>
      </div>

      {activeTab === 'active' && (
        <>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-24 text-gray-500 text-xl sm:text-2xl text-center">
              <p>ยังไม่มีออเดอร์ (นั่งพักได้เลยพ่อ) ☕</p>
            </div>
          ) : (
            <div className="space-y-8">
              {delayedOrders.length > 0 && (
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-red-500 mb-4 bg-red-950/50 p-3 rounded-xl border border-red-600">
                    ⚠️ ออเดอร์ล่าช้าเกิน 15 นาทีแล้ว (ต้องรีบทำด่วน!)
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
                              onClick={() => finishOrder(order.id)}
                              className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-xl font-bold text-sm sm:text-lg hover:bg-red-700 whitespace-nowrap">
                              ✅ ทำเสร็จแล้ว
                            </button>
                          </div>
                          <ul className="space-y-3">
                            {order.items.map((item: any, i: number) => {
                              const qty = item.quantity || 1;
                              return (
                                <li key={i} className="bg-gray-800 p-3 sm:p-4 rounded-xl flex flex-col">
                                  <div className="flex justify-between text-xl sm:text-2xl font-bold">
                                    <span>• {item.name} {qty > 1 && <span className="text-yellow-400 font-black">x{qty}</span>}</span>
                                    <span className="text-green-400">{item.price * qty} ฿</span>
                                  </div>
                                  {item.note && (
                                    <span className="text-yellow-300 text-base sm:text-lg mt-1 bg-gray-700 px-3 py-1 rounded">
                                      หมายเหตุ: {item.note}
                                    </span>
                                  )}
                                </li>
                              );
                            })}
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
                              onClick={() => finishOrder(order.id)}
                              className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-xl font-bold text-sm sm:text-lg hover:bg-red-700 whitespace-nowrap">
                              ✅ ทำเสร็จแล้ว
                            </button>
                          </div>
                          <ul className="space-y-3">
                            {order.items.map((item: any, i: number) => {
                              const qty = item.quantity || 1;
                              return (
                                <li key={i} className="bg-gray-800 p-3 sm:p-4 rounded-xl flex flex-col">
                                  <div className="flex justify-between text-xl sm:text-2xl font-bold">
                                    <span>• {item.name} {qty > 1 && <span className="text-yellow-400 font-black">x{qty}</span>}</span>
                                    <span className="text-green-400">{item.price * qty} ฿</span>
                                  </div>
                                  {item.note && (
                                    <span className="text-yellow-300 text-base sm:text-lg mt-1 bg-gray-700 px-3 py-1 rounded">
                                      หมายเหตุ: {item.note}
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === 'history' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-300">📜 รายการที่ทำเสร็จแล้วในวันนี้</h2>
            {history.length > 0 && (
              <button 
                onClick={clearHistoryToday}
                className="bg-red-600 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-red-700 shadow">
                🔄 รีเซ็ตประวัติวันนี้ทั้งหมด
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-24 text-gray-500 text-xl sm:text-2xl text-center">
              <p>ยังไม่มีประวัติการทำอาหารในวันนี้</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {history.map((order, idx) => (
                <div key={order.id || idx} className="bg-gray-900 border-2 border-purple-500/50 rounded-3xl p-5 sm:p-6 shadow-xl opacity-90">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3 gap-2">
                    <div>
                      <h2 className="text-2xl font-extrabold text-yellow-400">โต๊ะ: {order.table}</h2>
                      <span className="text-gray-400 text-sm">
                        เสร็จเมื่อ: {new Date(order.completedAt).toLocaleTimeString("th-TH")} น.
                      </span>
                    </div>
                    <button 
                      onClick={() => revertOrder(order.id)}
                      className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold text-sm hover:bg-yellow-400 shadow">
                      ↩️ ยังไม่เสร็จ (กู้คืนคิว)
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {order.items.map((item: any, i: number) => {
                      const qty = item.quantity || 1;
                      return (
                        <li key={i} className="bg-gray-800/60 p-3 rounded-xl flex justify-between text-lg text-gray-300">
                          <span>• {item.name} {qty > 1 && <span className="text-yellow-400 font-black">x{qty}</span>}</span>
                          <span className="text-green-400">{item.price * qty} ฿</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}