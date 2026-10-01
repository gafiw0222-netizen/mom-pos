"use client";
import { useState } from "react";
import { io } from "socket.io-client";

const socket = io("https://mom-pos-backend-api.onrender.com");

const allMenus = [
  // --- 🥗 ของแม่ (ส้มตำทั่วไป) ---
  { id: 101, name: "ตำปูปลาร้า", price: 40, owner: "mom", kitchen: "mom", category: "somtum", color: "bg-green-500" },
  { id: 102, name: "ตำไทย", price: 50, owner: "mom", kitchen: "mom", category: "somtum", color: "bg-green-500" }, // แก้เป็น 50
  { id: 103, name: "ตำขนมจีน", price: 40, owner: "mom", kitchen: "mom", category: "somtum", color: "bg-green-500" },
  { id: 104, name: "ตำซั่ว", price: 50, owner: "mom", kitchen: "mom", category: "somtum", color: "bg-green-500" },
  { id: 105, name: "ตำปู", price: 50, owner: "mom", kitchen: "mom", category: "somtum", color: "bg-green-500" },
  { id: 106, name: "ตำไทยไข่เค็ม", price: 60, owner: "mom", kitchen: "mom", category: "somtum", color: "bg-green-500" },
  { id: 107, name: "ตำหอยดอง", price: 50, owner: "mom", kitchen: "mom", category: "somtum", color: "bg-green-500" },
  { id: 108, name: "ตำถั่ว", price: 50, owner: "mom", kitchen: "mom", category: "somtum", color: "bg-green-500" },
  { id: 109, name: "ตำโคราช", price: 50, owner: "mom", kitchen: "mom", category: "somtum", color: "bg-green-500" },
  { id: 110, name: "ตำข้าวโพด", price: 50, owner: "mom", kitchen: "mom", category: "somtum", color: "bg-green-500" },
  { id: 111, name: "ตำข้าวโพดไข่เค็ม", price: 60, owner: "mom", kitchen: "mom", category: "somtum", color: "bg-green-500" },
  { id: 112, name: "ตำมะม่วง", price: 50, owner: "mom", kitchen: "mom", category: "somtum", color: "bg-green-500" },
  { id: 113, name: "ตำกระท้อน", price: 50, owner: "mom", kitchen: "mom", category: "somtum", color: "bg-green-500" },
  { id: 114, name: "ตำแตง", price: 40, owner: "mom", kitchen: "mom", category: "somtum", color: "bg-green-500" }, // เพิ่มตำแตง 40
  { id: 115, name: "ตำป่า", price: 60, owner: "mom", kitchen: "mom", category: "somtum", color: "bg-green-500" },
  { id: 116, name: "ตำหมูยอ", price: 60, owner: "mom", kitchen: "mom", category: "somtum", color: "bg-green-500" },
  { id: 117, name: "ตำแคบหมู", price: 60, owner: "mom", kitchen: "mom", category: "somtum", color: "bg-green-500" },
  { id: 118, name: "ตำปูปลาร้าหอยเชอรี่", price: 60, owner: "mom", kitchen: "mom", category: "somtum", color: "bg-green-500" },
  { id: 119, name: "เกาเหลาหมูยอ", price: 60, owner: "mom", kitchen: "mom", category: "somtum", color: "bg-green-500" },
  { id: 120, name: "ตำผลไม้", price: 60, owner: "mom", kitchen: "mom", category: "somtum", color: "bg-green-500" },
  { id: 121, name: "ตำปูปลาร้ากุ้งสด", price: 80, owner: "mom", kitchen: "mom", category: "somtum", color: "bg-green-500" },
  { id: 122, name: "ตำไทยกุ้งสด", price: 80, owner: "mom", kitchen: "mom", category: "somtum", color: "bg-green-500" },

  // --- 🔥 ของพ่อ (ต้ม, ยำ, ลาบ, ก้อย, อ่อม, เส้นลวก, ตำถาด/เส้นเล็ก/คอหมูย่าง/เกาเหลาหมูยอ) ---
  { id: 201, name: "ตำถาด", price: 150, owner: "mom", kitchen: "dad", category: "dad", color: "bg-red-600" },
  { id: 202, name: "ตำเส้นเล็ก", price: 50, owner: "mom", kitchen: "dad", category: "dad", color: "bg-red-600" },
  { id: 203, name: "ตำเส้นเล็กหมูยอ", price: 60, owner: "mom", kitchen: "dad", category: "dad", color: "bg-red-600" },
  { id: 204, name: "ตำคอหมูย่าง", price: 60, owner: "mom", kitchen: "dad", category: "dad", color: "bg-red-600" },
  { id: 205, name: "ตำเหลาทะเล", price: 100, owner: "mom", kitchen: "dad", category: "dad", color: "bg-red-600" },
  { id: 206, name: "เกาเหลาหมูยอ", price: 60, owner: "mom", kitchen: "dad", category: "dad", color: "bg-red-600" },

  { id: 207, name: "ต้มแซ่บหมู", price: 60, owner: "mom", kitchen: "dad", category: "dad", color: "bg-red-600" },
  { id: 208, name: "ต้มแซ่บเห็ด", price: 60, owner: "mom", kitchen: "dad", category: "dad", color: "bg-red-600" },
  { id: 209, name: "ต้มแซ่บไก่", price: 60, owner: "mom", kitchen: "dad", category: "dad", color: "bg-red-600" },
  { id: 210, name: "ต้มแซ่บปลากระพง", price: 70, owner: "mom", kitchen: "dad", category: "dad", color: "bg-red-600" },
  { id: 211, name: "ต้มแซ่บกระดูกอ่อน", price: 70, owner: "mom", kitchen: "dad", category: "dad", color: "bg-red-600" },
  { id: 212, name: "ต้มแซ่บทะเล", price: 80, owner: "mom", kitchen: "dad", category: "dad", color: "bg-red-600" },
  { id: 213, name: "ต้มยำหมู", price: 60, owner: "mom", kitchen: "dad", category: "dad", color: "bg-red-600" },
  { id: 214, name: "ต้มยำไก่", price: 60, owner: "mom", kitchen: "dad", category: "dad", color: "bg-red-600" },
  { id: 215, name: "ต้มยำปลากระพง", price: 70, owner: "mom", kitchen: "dad", category: "dad", color: "bg-red-600" },
  { id: 216, name: "ต้มยำกระดูกอ่อน", price: 70, owner: "mom", kitchen: "dad", category: "dad", color: "bg-red-600" },
  { id: 217, name: "ต้มยำทะเล", price: 80, owner: "mom", kitchen: "dad", category: "dad", color: "bg-red-600" },
  { id: 218, name: "ต้มยำรวมมิตร", price: 80, owner: "mom", kitchen: "dad", category: "dad", color: "bg-red-600" },

  { id: 219, name: "ยำวุ้นเส้น", price: 60, owner: "mom", kitchen: "dad", category: "dad", color: "bg-emerald-600" },
  { id: 220, name: "ยำหมูยอ", price: 60, owner: "mom", kitchen: "dad", category: "dad", color: "bg-emerald-600" },
  { id: 221, name: "ยำไข่เค็ม", price: 60, owner: "mom", kitchen: "dad", category: "dad", color: "bg-emerald-600" },
  { id: 222, name: "ยำวุ้นเส้นรวมมิตร", price: 70, owner: "mom", kitchen: "dad", category: "dad", color: "bg-emerald-600" },
  { id: 223, name: "ยำรวมมิตร", price: 70, owner: "mom", kitchen: "dad", category: "dad", color: "bg-emerald-600" },
  { id: 224, name: "ยำมาม่า", price: 70, owner: "mom", kitchen: "dad", category: "dad", color: "bg-emerald-600" },
  { id: 225, name: "ยำเล็บมือนาง", price: 70, owner: "mom", kitchen: "dad", category: "dad", color: "bg-emerald-600" },
  { id: 226, name: "ยำเส้นแก้ว", price: 80, owner: "mom", kitchen: "dad", category: "dad", color: "bg-emerald-600" },
  { id: 227, name: "ยำทะเล(กุ้ง,ปลาหมึก)", price: 80, owner: "mom", kitchen: "dad", category: "dad", color: "bg-emerald-600" },

  { id: 228, name: "ลาบเห็ด", price: 50, owner: "mom", kitchen: "dad", category: "dad", color: "bg-rose-600" },
  { id: 229, name: "ก้อยหอย", price: 50, owner: "mom", kitchen: "dad", category: "dad", color: "bg-rose-600" },
  { id: 230, name: "ซุปหน่อไม้", price: 50, owner: "mom", kitchen: "dad", category: "dad", color: "bg-rose-600" }, // แทนลาบห่อไก่
  { id: 231, name: "ลาบหมู", price: 60, owner: "mom", kitchen: "dad", category: "dad", color: "bg-rose-600" },
  { id: 232, name: "น้ำตกหมู", price: 60, owner: "mom", kitchen: "dad", category: "dad", color: "bg-rose-600" },
  { id: 233, name: "ลาบเป็ด", price: 60, owner: "mom", kitchen: "dad", category: "dad", color: "bg-rose-600" },
  { id: 234, name: "ตับหวานหมู", price: 60, owner: "mom", kitchen: "dad", category: "dad", color: "bg-rose-600" },
  { id: 235, name: "ตับหวานเนื้อ", price: 70, owner: "mom", kitchen: "dad", category: "dad", color: "bg-rose-600" },
  { id: 236, name: "ลาบวุ้นเส้น", price: 60, owner: "mom", kitchen: "dad", category: "dad", color: "bg-rose-600" },
  { id: 237, name: "ลาบปลาดุก", price: 60, owner: "mom", kitchen: "dad", category: "dad", color: "bg-rose-600" }, // ลาบปลาดุก 60 (ป้า 40 / แม่ 20)
  { id: 238, name: "ก้อยหมู", price: 60, owner: "mom", kitchen: "dad", category: "dad", color: "bg-rose-600" }, // แก้จากก้อยดิบ/สุก เป็นก้อยหมู 60
  { id: 239, name: "ลาบเนื้อ", price: 70, owner: "mom", kitchen: "dad", category: "dad", color: "bg-rose-600" },
  { id: 240, name: "ก้อยเนื้อดิบ/สุก", price: 70, owner: "mom", kitchen: "dad", category: "dad", color: "bg-rose-600" },
  { id: 241, name: "ลาบไก่", price: 60, owner: "mom", kitchen: "dad", category: "dad", color: "bg-rose-600" },
  { id: 242, name: "ลาบปลาหมึก", price: 80, owner: "mom", kitchen: "dad", category: "dad", color: "bg-rose-600" },
  { id: 243, name: "ลาบผ้าขี้ริ้ว", price: 70, owner: "mom", kitchen: "dad", category: "dad", color: "bg-rose-600" },
  { id: 244, name: "ซอยจุ๊", price: 80, owner: "mom", kitchen: "dad", category: "dad", color: "bg-rose-600" },

  { id: 245, name: "แกงเห็ด", price: 60, owner: "mom", kitchen: "dad", category: "dad", color: "bg-orange-600" },
  { id: 246, name: "อ่อมหมู", price: 60, owner: "mom", kitchen: "dad", category: "dad", color: "bg-orange-600" },
  { id: 247, name: "อ่อมไก่", price: 60, owner: "mom", kitchen: "dad", category: "dad", color: "bg-orange-600" },
  { id: 248, name: "อ่อมปลากระพง", price: 70, owner: "mom", kitchen: "dad", category: "dad", color: "bg-orange-600" },
  { id: 249, name: "อ่อมกระดูกอ่อน", price: 70, owner: "mom", kitchen: "dad", category: "dad", color: "bg-orange-600" },
  { id: 250, name: "อ่อมเนื้อ", price: 70, owner: "mom", kitchen: "dad", category: "dad", color: "bg-orange-600" },

  { id: 251, name: "หมี่ลวก", price: 10, owner: "mom", kitchen: "dad", category: "dad", color: "bg-amber-600" },
  { id: 252, name: "วุ้นเส้นลวก", price: 10, owner: "mom", kitchen: "dad", category: "dad", color: "bg-amber-600" },
  { id: 253, name: "เล็กลวก", price: 10, owner: "mom", kitchen: "dad", category: "dad", color: "bg-amber-600" },
  { id: 254, name: "ม่าๆลวก", price: 10, owner: "mom", kitchen: "dad", category: "dad", color: "bg-amber-600" },

  // --- 🍗 ของป้า (ปิ้งย่าง, ข้าว, ขนมจีน, น้ำ) ---
  { id: 301, name: "เนื้อไก่", price: 10, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-amber-500" },
  { id: 302, name: "หมูปิ้ง", price: 10, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-amber-500" },
  { id: 303, name: "เครื่องในไก่", price: 10, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-amber-500" },
  { id: 304, name: "ตูดไก่", price: 12, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-amber-500" },
  { id: 305, name: "แหนม", price: 15, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-amber-500" },
  { id: 306, name: "ปีกเต็ม", price: 20, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-amber-500" },
  { id: 307, name: "ปีกกลาง", price: 20, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-amber-500" },
  { id: 308, name: "หมูแดดเดียว", price: 20, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-amber-500" },
  { id: 309, name: "เนื้อแดดเดียว", price: 20, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-amber-500" },
  { id: 310, name: "ปลาดุกย่าง", price: 40, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-amber-500" },
  { id: 311, name: "น่องติดสะโพก", price: 50, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-amber-500" },
  { id: 312, name: "อกไก่ย่าง", price: 60, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-amber-500" },
  { id: 313, name: "คอหมูย่าง", price: 70, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-amber-500" },

  { id: 314, name: "ข้าวเหนียว", price: 10, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-yellow-600" },
  { id: 315, name: "ข้าวสวย", price: 10, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-yellow-600" },
  { id: 316, name: "ขนมจีน", price: 10, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-yellow-600" },

  { id: 317, name: "น้ำเปล่าเล็ก", price: 10, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-blue-500" },
  { id: 318, name: "น้ำเปล่าใหญ่", price: 15, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-blue-500" },
  { id: 319, name: "โค้ก/เป๊ปซี่เล็ก", price: 25, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-blue-500" },
  { id: 320, name: "โค้กใหญ่", price: 40, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-blue-500" },
  { id: 321, name: "เป๊ปซี่ใหญ่", price: 45, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-blue-500" },
  { id: 322, name: "เป๊ปซี่กลาง", price: 30, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-blue-500" },
  { id: 323, name: "น้ำแข็งแก้ว", price: 2, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-blue-500" },
  { id: 324, name: "น้ำแข็งถัง", price: 10, owner: "aunt", kitchen: "aunt", category: "aunt", color: "bg-blue-500" },
];

const tables = ["1", "2", "3", "5", "7", "9", "10", "11", "22", "33", "ใส่ถุง"];

export default function Home() {
  const [cart, setCart] = useState<any[]>([]);
  const [table, setTable] = useState("");
  const [activeCategory, setActiveCategory] = useState<'somtum' | 'dad' | 'aunt'>('somtum');
  
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

  const addToCart = (menu: any) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === menu.id && !item.note);
      if (existingIndex > -1) {
        const newCart = [...prev];
        newCart[existingIndex].quantity += 1;
        return newCart;
      } else {
        return [...prev, { ...menu, cartId: Date.now() + Math.random(), quantity: 1, note: "" }];
      }
    });
  };

  const addCustomMenu = () => {
    const customName = prompt("📝 พิมพ์ชื่อเมนูอื่นๆ:");
    if (!customName || customName.trim() === "") return;

    const customPriceStr = prompt(`💵 ใส่ราคาของ "${customName}" (บาท):`);
    const customPrice = Number(customPriceStr);
    if (isNaN(customPrice) || customPrice <= 0) {
      alert("❌ กรุณาใส่ราคาเป็นตัวเลขที่ถูกต้อง");
      return;
    }

    const newItem = {
      id: Date.now(),
      name: `✨ ${customName.trim()}`,
      price: customPrice,
      owner: "mom",
      kitchen: "dad",
      quantity: 1,
      note: "เมนูพิเศษ",
      cartId: Date.now() + Math.random()
    };

    setCart((prev) => [...prev, newItem]);
    showToast('success', `➕ เพิ่ม ${customName} เรียบร้อย!`);
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

    let momTotal = 0;
    let auntTotal = 0;

    cart.forEach(item => {
      const qty = item.quantity || 1;
      const itemTotal = item.price * qty;
      if (item.name === "ลาบปลาดุก") {
        auntTotal += 40 * qty;
        momTotal += 20 * qty;
      } else if (item.kitchen === "aunt") {
        auntTotal += itemTotal;
      } else {
        momTotal += itemTotal;
      }
    });

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

      <div className="w-full lg:w-2/3 p-3 sm:p-4 overflow-y-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-600">🍽 ส้มตำยโสธร (POS)</h1>
          <div className="flex gap-2">
            <button onClick={addCustomMenu} className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-orange-600 shadow text-sm">
              ✨ เมนูอื่นๆ (พิมพ์เอง)
            </button>
            <a href="/summary" target="_blank" className="bg-purple-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-purple-700 shadow text-sm">📊 ยอดขาย</a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4 sticky top-0 bg-gray-100 py-2 z-10">
          <button 
            onClick={() => setActiveCategory('somtum')}
            className={`py-3 rounded-2xl font-bold text-base sm:text-lg transition-all shadow ${
              activeCategory === 'somtum' ? 'bg-green-600 text-white scale-105' : 'bg-white text-gray-700 hover:bg-gray-200 border'
            }`}
          >
            🥗 ส้มตำ (แม่)
          </button>
          <button 
            onClick={() => setActiveCategory('dad')}
            className={`py-3 rounded-2xl font-bold text-base sm:text-lg transition-all shadow ${
              activeCategory === 'dad' ? 'bg-red-600 text-white scale-105' : 'bg-white text-gray-700 hover:bg-gray-200 border'
            }`}
          >
            🔥 ต้ม,ยำ,ลาบ,ลวก (พ่อ)
          </button>
          <button 
            onClick={() => setActiveCategory('aunt')}
            className={`py-3 rounded-2xl font-bold text-base sm:text-lg transition-all shadow ${
              activeCategory === 'aunt' ? 'bg-amber-500 text-white scale-105' : 'bg-white text-gray-700 hover:bg-gray-200 border'
            }`}
          >
            🍗 ปิ้งย่าง & น้ำ (ป้า)
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pb-10">
          {allMenus.filter(m => m.category === activeCategory).map((menu) => (
            <button 
              key={menu.id} 
              onClick={() => addToCart(menu)} 
              className={`${menu.color} text-white font-bold text-base sm:text-xl p-4 rounded-xl shadow active:scale-95 transition-transform flex flex-col items-center justify-center min-h-[90px]`}
            >
              <span className="text-center leading-snug">{menu.name}</span> 
              <span className="text-sm font-normal mt-1 bg-black/20 px-2 py-0.5 rounded-full">{menu.price} ฿</span>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-1/3 bg-white p-4 shadow-xl flex flex-col border-t lg:border-t-0 lg:border-l">
        <h2 className="text-base font-bold text-gray-700 mb-2">📍 เลือกโต๊ะ หรือ ใส่ถุง:</h2>
        
        <div className="grid grid-cols-4 gap-2 mb-4">
          {tables.map((t) => (
            <button
              key={t}
              onClick={() => setTable(t)}
              className={`py-2.5 rounded-xl font-black text-base transition-all ${
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
        
        <div className="flex-1 overflow-y-auto mb-3 bg-gray-50 rounded-xl p-2 border max-h-56 lg:max-h-none">
          <ul className="space-y-2">
            {cart.map((item) => (
              <li key={item.cartId} className="flex flex-col border-b border-gray-200 pb-2 bg-white p-2.5 rounded-lg shadow-2xs">
                <div className="flex justify-between items-center text-base font-bold text-black">
                  <div className="flex items-center gap-2">
                    <button onClick={() => removeFromCart(item.cartId)} className="text-red-500 font-bold text-xs px-2 py-0.5 bg-red-100 rounded-full">ลบ</button>
                    <span>{item.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => decreaseQty(item.cartId)} className="bg-gray-200 hover:bg-gray-300 w-7 h-7 rounded-lg font-black text-lg flex items-center justify-center">-</button>
                    <span className="text-lg font-black text-blue-600 w-6 text-center">{item.quantity}</span>
                    <button onClick={() => increaseQty(item.cartId)} className="bg-gray-200 hover:bg-gray-300 w-7 h-7 rounded-lg font-black text-lg flex items-center justify-center">+</button>
                    <span className="text-blue-600 ml-1">{item.price * item.quantity} ฿</span>
                  </div>
                </div>
                <input 
                  type="text" placeholder="หมายเหตุ (เช่น เผ็ดน้อย)..." 
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