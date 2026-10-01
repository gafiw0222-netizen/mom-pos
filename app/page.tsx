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

export default function Home() {
  const [cart, setCart] = useState<any[]>([]);
  const [table, setTable] = useState("");

  const addToCart = (menu: any) => {
    setCart([...cart, { ...menu, cartId: Date.now(), note: "" }]);
  };

  const removeFromCart = (cartId: number) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const updateNote = (cartId: number, note: string) => {
    setCart(cart.map(item => item.cartId === cartId ? { ...item, note } : item));
  };

  const sendToKitchen = () => {
    if (!table) {
      alert("⚠️ แม่อย่าลืมใส่เบอร์โต๊ะนะ!");
      return;
    }
    const dadItems = cart.filter((item) => item.kitchen === "dad");
    if (dadItems.length > 0) {
      socket.emit("send_to_kitchen", { table, items: dadItems });
      alert(`🔥 ส่งออเดอร์ โต๊ะ ${table} ไปครัวพ่อแล้ว!`);
    } else {
      alert("บิลนี้ไม่มีเมนูของพ่อนะแม่");
    }
  };

  // 💰 คิดเงินและบันทึกลงฐานข้อมูล MongoDB พร้อมเวลาเรียลไทม์
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("⚠️ ยังไม่มีรายการอาหารในบิลนะแม่!");
      return;
    }
    if (!table) {
      alert("⚠️ แม่อย่าลืมใส่เบอร์โต๊ะก่อนคิดเงินนะ!");
      return;
    }

    const momTotal = cart.filter(item => item.owner === "mom").reduce((sum, item) => sum + item.price, 0);
    const auntTotal = cart.filter(item => item.owner === "aunt").reduce((sum, item) => sum + item.price, 0);
    const grandTotal = momTotal + auntTotal;

    const confirmPay = window.confirm(
      `🧾 สรุปยอดเงิน โต๊ะ ${table}\n` +
      `----------------------------------\n` +
      `👩‍🦰 ยอดของแม่: ${momTotal} ฿\n` +
      `👵 ยอดของป้า: ${auntTotal} ฿\n` +
      `----------------------------------\n` +
      `💰 ยอดรวมทั้งสิ้น: ${grandTotal} ฿\n\n` +
      `ยืนยันการรับเงินและบันทึกบิลนี้?`
    );

    if (confirmPay) {
      try {
        const response = await fetch("https://mom-pos-backend-api.onrender.com/api/bills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            table,
            items: cart,
            momTotal,
            auntTotal,
            grandTotal,
            createdAt: new Date() // ส่งเวลาปัจจุบันแบบเรียลไทม์
          }),
        });

        if (response.ok) {
          alert("✅ บันทึกยอดขายและเวลาเรียบร้อย!");
          setCart([]);
          setTable("");
        } else {
          alert("❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        }
      } catch (error) {
        console.error(error);
        alert("❌ เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-2/3 p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-extrabold text-blue-600"> ระบบ POS ร้านอาหาร</h1>
          <a href="/summary" target="_blank" className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-purple-700">📊 ไปดูหน้ารวมยอดขาย</a>
        </div>

        <h2 className="text-2xl font-bold mb-2 text-red-600">🔥 ของพ่อ (ส่งเข้าครัว)</h2>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {menus.filter(m => m.kitchen === 'dad').map((menu) => (
            <button key={menu.id} onClick={() => addToCart(menu)} className={`${menu.color} text-white font-bold text-2xl p-8 rounded-xl shadow-md active:scale-95 transition-transform`}>
              {menu.name} <div className="text-lg mt-2 font-normal">{menu.price} ฿</div>
            </button>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-2 text-green-600">🥗 ของแม่ (ส้มตำ)</h2>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {menus.filter(m => m.kitchen === 'mom').map((menu) => (
            <button key={menu.id} onClick={() => addToCart(menu)} className={`${menu.color} text-white font-bold text-2xl p-8 rounded-xl shadow-md active:scale-95 transition-transform`}>
              {menu.name} <div className="text-lg mt-2 font-normal">{menu.price} ฿</div>
            </button>
          ))}
        </div>

        <h2 className="text-2xl font-bold mb-2 text-yellow-600">🍗 ของป้า (ปิ้งย่าง/ข้าว)</h2>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {menus.filter(m => m.kitchen === 'aunt').map((menu) => (
            <button key={menu.id} onClick={() => addToCart(menu)} className={`${menu.color} text-white font-bold text-2xl p-8 rounded-xl shadow-md active:scale-95 transition-transform text-black`}>
              {menu.name} <div className="text-lg mt-2 font-normal">{menu.price} ฿</div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-1/3 bg-white p-6 shadow-xl flex flex-col h-full">
        <div className="mb-4">
          <input 
            type="text" placeholder="📍 ระบุเบอร์โต๊ะ หรือ พิมพ์ว่า ใส่ถุง" 
            className="w-full text-2xl p-4 border-2 border-blue-400 rounded-lg focus:outline-none focus:border-blue-600 font-bold bg-blue-50"
            value={table} onChange={(e) => setTable(e.target.value)}
          />
        </div>
        <h2 className="text-xl font-bold mb-2 text-gray-700">รายการอาหาร:</h2>
        
        <div className="flex-1 overflow-y-auto mb-4 bg-gray-50 rounded-lg p-2 border">
          <ul className="space-y-3">
            {cart.map((item) => (
              <li key={item.cartId} className="flex flex-col border-b border-gray-200 pb-3 bg-white p-3 rounded shadow-sm">
                <div className="flex justify-between items-center text-xl font-bold">
                  <div className="flex items-center gap-2">
                    <button onClick={() => removeFromCart(item.cartId)} className="text-red-500 font-bold text-sm px-3 py-1 bg-red-100 rounded-full hover:bg-red-200">X</button>
                    <span>{item.name}</span>
                  </div>
                  <span className="text-blue-600">{item.price} ฿</span>
                </div>
                <input 
                  type="text" placeholder="หมายเหตุ: เผ็ดน้อย..." 
                  className="mt-2 w-full p-2 border border-gray-300 rounded text-lg focus:outline-none focus:border-blue-500"
                  value={item.note} onChange={(e) => updateNote(item.cartId, e.target.value)}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4 pt-4 border-t-2">
          <div className="text-3xl font-bold text-right text-gray-800">รวม: {cart.reduce((sum, item) => sum + item.price, 0)} ฿</div>
          <button onClick={sendToKitchen} className="w-full bg-blue-600 text-white font-bold text-2xl p-4 rounded-xl shadow-lg active:bg-blue-700 transition-colors">🔥 ส่งรายการให้พ่อ</button>
          <button onClick={handleCheckout} className="w-full bg-black text-white font-bold text-xl p-4 rounded-xl shadow-lg active:bg-gray-800 transition-colors">💰 คิดเงิน (บันทึกลงระบบ)</button>
          <button onClick={() => {setCart([]); setTable("");}} className="w-full text-red-500 font-bold p-2 hover:bg-red-50 rounded-lg transition-colors text-lg">ล้างรายการทั้งหมด</button>
        </div>
      </div>
    </div>
  );
}