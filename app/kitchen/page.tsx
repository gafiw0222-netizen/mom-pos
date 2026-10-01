"use client";
import { useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://mom-pos-backend-api.onrender.com");

const menus = [
  { id: 1, name: "ลาบหมู", price: 60, owner: "mom", kitchen: "dad", color: "bg-red-500" },
  { id: 2, name: "ต้มแซ่บ", price: 80, owner: "mom", kitchen: "dad", color: "bg-red-500" },
  { id: 3, name: "ตำไทย", price: 40, owner: "mom", kitchen: "mom", color: "bg-green-500" },
  { id: 4, name: "ตำปูปลาร้า", price: 40, owner: "mom", kitchen: "mom", color: "bg-green-500" },
  { id: 5, name: "คอหมูย่าง", price: 60, owner: "aunt", kitchen: "aunt", color: "bg-yellow-500" },
  { id: 6, name: "ข้าวเหนียว", price: 10, owner: "aunt", kitchen: "aunt", color: "bg-yellow-500" },
];

const tables = ["1", "2", "3", "5", "7", "9", "10", "11", "22", "33", "ใส่ถุง"];

export default function Home() {
  const [cart, setCart] = useState<any[]>([]);
  const [table, setTable] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const playSound = (type: 'success' | 'error') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.setValueAtTime(100, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch (e) {
      console.log("Audio error", e);
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    playSound(type);
    setTimeout(() => { setToast(null); }, 3000);
  };

  // ➕ กดปุ่มเมนู: เพิ่มเป็นแถวใหม่ทันที (เพื่อให้แยกหมายเหตุแต่ละจานได้อิสระ)
  const addToCart = (menu: any) => {
    setCart((prev) => [
      ...prev,
      { ...menu, cartId: Date.now() + Math.random(), quantity: 1, note: "" }
    ]);
  };

  const increaseQty = (cartId: number) => {
    setCart((prev) => prev.map(item => item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item));
  };

  const decreaseQty = (cartId: number) => {
    setCart((prev) => prev.map(item => {
      if (item.cartId === cartId) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (cartId: number) => {
    setCart((prev) => prev.filter(item => item.cartId !== cartId));
  };

  const updateNote = (cartId: number, note: string) => {
    setCart((prev) => prev.map(item => item.cartId === cartId ? { ...item, note } : item));
  };

  const sendToKitchen = () => {
    if (!table) {
      showToast('error', "⚠️ แม่ยังไม่ได้เลือกโต๊ะนะ!");
      return;
    }
    const dadItems = cart.filter((item) => item.kitchen === "dad");
    if (dadItems.length > 0) {
      socket.emit("send_to_kitchen", { 
        id: Date.now(), 
        table, 
        items: dadItems 
      });
      showToast('success', `🔥 ส่งออเดอร์ ${table === 'ใส่ถุง' ? 'ใส่ถุง' : 'โต๊ะ ' + table} ไปครัวพ่อแล้ว!`);
    } else {
      showToast('error', "บิลนี้ไม่มีเมนูของพ่อนะแม่");
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showToast('error', "⚠️ ยังไม่มีรายการอาหารในบิลนะแม่!");
      return;
    }
    if (!table) {
      showToast('error', "⚠️ แม่ยังไม่ได้เลือกโต๊ะก่อนคิดเงินนะ!");
      return;
    }

    const momTotal = cart.filter(item => item.owner === "mom").reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const auntTotal = cart.filter(item => item.owner === "aunt").reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const grandTotal = momTotal + auntTotal;

    const confirmPay = window.confirm(
      `🧾 สรุปยอดเงิน (${table === 'ใส่ถุง' ? 'ใส่ถุง' : 'โต๊ะ ' + table})\n` +
      `----------------------------------\n` +
      `👩‍🦰 ยอดของแม่: ${momTotal} ฿\n` +
      `👵 ยอดของป้า: ${auntTotal} ฿\n` +
      `----------------------------------\n` +
      `💰 ยอดรวมทั้งสิ้น: ${grandTotal} ฿\n\n` +
      `ยืนยันการรับเงินและบันทึกบิลนี้?`
    );

    if (!confirmPay) return;

    setIsSaving(true);
    setProgress(30);
    setStatusText("กำลังบันทึกลงระบบ...");

    try {
      const response = await fetch("https://mom-pos-backend-api.onrender.com/api/bills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: table === 'ใส่ถุง' ? 'ใส่ถุง' : `โต๊ะ ${table}`,
          items: cart,
          momTotal,
          auntTotal,
          grandTotal,
          createdAt: new Date()
        }),
      });

      setProgress(100);
      setStatusText("บันทึกสำเร็จ!");

      if (response.ok) {
        setTimeout(() => {
          setIsSaving(false);
          setCart([]);
          setTable("");
          showToast('success', "✅ บันทึกยอดขายสำเร็จ!");
        }, 200);
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      setIsSaving(false);
      showToast('error', "❌ บันทึกไม่สำเร็จ!");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-100 relative select-none">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-2xl text-white font-bold text-lg transition-all ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.message}
        </div>
      )}

      {isSaving && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-xs text-center border-4 border-blue-500">
            <h3 className="text-xl font-black text-blue-600 mb-3">⏳ กำลังบันทึก...</h3>
            <div className="w-full bg-gray-200 rounded-full h-5 mb-3 overflow-hidden border">
              <div className="bg-blue-600 h-5 font-bold text-white text-xs flex items-center justify-center" style={{ width: `${progress}%` }}>
                {progress}%
              </div>
            </div>
            <p className="text-base font-bold text-gray-600">{statusText}</p>
          </div>
        </div>
      )}

      {/* โซนซ้าย: เมนูอาหาร */}
      <div className="w-full lg:w-2/3 p-3 sm:p-4 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-600">🍽 ระบบ POS ร้านแม่</h1>
          <a href="/summary" target="_blank" className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-purple-700 shadow text-sm">📊 หน้ารวมยอดขาย</a>
        </div>

        <h2 className="text-lg font-bold mb-2 text-red-600">🔥 ของพ่อ (ส่งครัว)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
          {menus.filter(m => m.kitchen === 'dad').map((menu) => (
            <button key={menu.id} onClick={() => addToCart(menu)} className={`${menu.color} text-white font-bold text-lg sm:text-xl p-4 sm:p-6 rounded-xl shadow active:scale-95 transition-transform flex flex-col items-center justify-center`}>
              <span>{menu.name}</span> 
              <span className="text-sm font-normal mt-1">{menu.price} ฿</span>
            </button>
          ))}
        </div>

        <h2 className="text-lg font-bold mb-2 text-green-600">🥗 ของแม่ (ส้มตำ)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
          {menus.filter(m => m.kitchen === 'mom').map((menu) => (
            <button key={menu.id} onClick={() => addToCart(menu)} className={`${menu.color} text-white font-bold text-lg sm:text-xl p-4 sm:p-6 rounded-xl shadow active:scale-95 transition-transform flex flex-col items-center justify-center`}>
              <span>{menu.name}</span> 
              <span className="text-sm font-normal mt-1">{menu.price} ฿</span>
            </button>
          ))}
        </div>

        <h2 className="text-lg font-bold mb-2 text-yellow-600">🍗 ของป้า (ปิ้งย่าง/ข้าว)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-4">
          {menus.filter(m => m.kitchen === 'aunt').map((menu) => (
            <button key={menu.id} onClick={() => addToCart(menu)} className={`${menu.color} text-white font-bold text-lg sm:text-xl p-4 sm:p-6 rounded-xl shadow active:scale-95 transition-transform text-black flex flex-col items-center justify-center`}>
              <span>{menu.name}</span> 
              <span className="text-sm font-normal mt-1">{menu.price} ฿</span>
            </button>
          ))}
        </div>
      </div>

      {/* โซนขวา: ตะกร้าและช่องหมายเหตุแยกแต่ละจาน */}
      <div className="w-full lg:w-1/3 bg-white p-4 shadow-xl flex flex-col border-t lg:border-t-0 lg:border-l">
        <h2 className="text-base font-bold text-gray-700 mb-2">📍 เลือกโต๊ะ หรือ ใส่ถุง:</h2>
        
        <div className="grid grid-cols-4 gap-2 mb-4">
          {tables.map((t) => (
            <button
              key={t}
              onClick={() => setTable(t)}
              className={`py-3 rounded-xl font-black text-lg transition-all ${
                table === t 
                  ? 'bg-blue-600 text-white shadow-lg scale-105 ring-2 ring-blue-300' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              {t === 'ใส่ถุง' ? '🛍️ ใส่ถุง' : `โต๊ะ ${t}`}
            </button>
          ))}
        </div>

        <div className="mb-3 bg-blue-50 p-2 rounded-xl border border-blue-200 text-center">
          <span className="text-sm text-gray-600">กำลังทำรายการของ: </span>
          <span className="text-lg font-extrabold text-blue-600">{table ? (table === 'ใส่ถุง' ? '🛍️ ใส่ถุง' : `📍 โต๊ะ ${table}`) : '⚠️ ยังไม่ได้เลือกโต๊ะ'}</span>
        </div>

        <h2 className="text-base font-bold text-gray-700 mb-1">รายการอาหารในบิล:</h2>
        
        <div className="flex-1 overflow-y-auto mb-3 bg-gray-50 rounded-xl p-2 border max-h-48 lg:max-h-none">
          <ul className="space-y-2">
            {cart.map((item) => (
              <li key={item.cartId} className="flex flex-col border-b border-gray-200 pb-2 bg-white p-2.5 rounded-lg shadow-2xs">
                <div className="flex justify-between items-center text-base font-bold text-black">
                  <div className="flex items-center gap-2">
                    <button onClick={() => removeFromCart(item.cartId)} className="text-red-500 font-bold text-xs px-2 py-0.5 bg-red-100 rounded-full">ลบ</button>
                    <span>{item.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={() => decreaseQty(item.cartId)} className="bg-gray-200 hover:bg-gray-300 w-7 h-7 rounded-lg font-black text-lg flex items-center justify-center">-</button>
                    <span className="text-lg font-black text-blue-600 w-6 text-center">{item.quantity}</span>
                    <button onClick={() => increaseQty(item.cartId)} className="bg-gray-200 hover:bg-gray-300 w-7 h-7 rounded-lg font-black text-lg flex items-center justify-center">+</button>
                    <span className="text-blue-600 ml-1">{item.price * item.quantity} ฿</span>
                  </div>
                </div>
                {/* ช่องหมายเหตุแยกอิสระในแต่ละแถว เหมาะสำหรับพิมพ์ เผ็ดน้อย / เผ็ดมาก / ไม่ใส่พริก */}
                <input 
                  type="text" placeholder="หมายเหตุ (เช่น เผ็ดน้อย, เผ็ดมาก)..." 
                  className="mt-1 w-full p-1.5 border border-gray-200 rounded text-sm bg-gray-50 text-black font-semibold text-orange-600"
                  value={item.note} onChange={(e) => updateNote(item.cartId, e.target.value)}
                />
              </li>
            ))}
            {cart.length === 0 && (
              <p className="text-center text-gray-400 py-6 text-sm">ยังไม่มีเมนูในตะกร้า</p>
            )}
          </ul>
        </div>

        <div className="space-y-2.5 pt-2 border-t">
          <div className="text-2xl font-black text-right text-gray-800">รวม: {cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)} ฿</div>
          <button onClick={sendToKitchen} className="w-full bg-blue-600 text-white font-bold text-lg p-3 rounded-xl shadow active:bg-blue-700">🔥 ส่งรายการให้พ่อ</button>
          <button onClick={handleCheckout} className="w-full bg-black text-white font-bold text-lg p-3 rounded-xl shadow active:bg-gray-800">💰 คิดเงิน (บันทึกลงระบบ)</button>
          <button onClick={() => setCart([])} className="w-full text-red-500 font-bold py-1 hover:bg-red-50 rounded-lg text-sm">ล้างรายการทั้งหมด</button>
        </div>
      </div>
    </div>
  );
}