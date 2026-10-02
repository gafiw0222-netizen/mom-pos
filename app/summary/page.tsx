"use client";
import { useEffect, useState } from "react";

// 📋 รายการเมนูทั้งหมดของร้าน พร้อมระบุครัว/เจ้าของให้ถูกต้อง (แก้ปัญหาเงินป้าไปเข้าแม่)
const allMenus = [
  // --- ของแม่ (kitchen: "mom") ---
  { name: "ตำปูปลาร้า", price: 40, kitchen: "mom" },
  { name: "ตำไทย", price: 50, kitchen: "mom" },
  { name: "ตำขนมจีน", price: 40, kitchen: "mom" },
  { name: "ตำซั่ว", price: 50, kitchen: "mom" },
  { name: "ตำปู", price: 50, kitchen: "mom" },
  { name: "ตำไทยไข่เค็ม", price: 60, kitchen: "mom" },
  { name: "ตำหอยดอง", price: 50, kitchen: "mom" },
  { name: "ตำถั่ว", price: 50, kitchen: "mom" },
  { name: "ตำโคราช", price: 50, kitchen: "mom" },
  { name: "ตำข้าวโพด", price: 50, kitchen: "mom" },
  { name: "ตำข้าวโพดไข่เค็ม", price: 60, kitchen: "mom" },
  { name: "ตำมะม่วง", price: 50, kitchen: "mom" },
  { name: "ตำกระท้อน", price: 50, kitchen: "mom" },
  { name: "ตำแตง", price: 40, kitchen: "mom" },
  { name: "ตำป่า", price: 60, kitchen: "mom" },
  { name: "ตำหมูยอ", price: 60, kitchen: "mom" },
  { name: "ตำแคบหมู", price: 60, kitchen: "mom" },
  { name: "ตำปูปลาร้าหอยเชอรี่", price: 60, kitchen: "mom" },
  { name: "ตำผลไม้", price: 60, kitchen: "mom" },
  { name: "ตำปูปลาร้ากุ้งสด", price: 80, kitchen: "mom" },
  { name: "ตำไทยกุ้งสด", price: 80, kitchen: "mom" },
  { name: "ขนมจีน", price: 10, kitchen: "mom" },

  // --- ของพ่อ (kitchen: "dad") ---
  { name: "ตำถาด", price: 150, kitchen: "dad" },
  { name: "ตำเส้นเล็ก", price: 50, kitchen: "dad" },
  { name: "ตำเส้นเล็กหมูยอ", price: 60, kitchen: "dad" },
  { name: "ตำคอหมูย่าง", price: 60, kitchen: "dad" },
  { name: "ตำเหลาทะเล", price: 100, kitchen: "dad" },
  { name: "เกาเหลาหมูยอ", price: 60, kitchen: "dad" },
  { name: "ต้มแซ่บหมู", price: 60, kitchen: "dad" },
  { name: "ต้มแซ่บเห็ด", price: 60, kitchen: "dad" },
  { name: "ต้มแซ่บไก่", price: 60, kitchen: "dad" },
  { name: "ต้มแซ่บปลากระพง", price: 70, kitchen: "dad" },
  { name: "ต้มแซ่บกระดูกอ่อน", price: 70, kitchen: "dad" },
  { name: "ต้มแซ่บทะเล", price: 80, kitchen: "dad" },
  { name: "ต้มยำหมู", price: 60, kitchen: "dad" },
  { name: "ต้มยำไก่", price: 60, kitchen: "dad" },
  { name: "ต้มยำปลากระพง", price: 70, kitchen: "dad" },
  { name: "ต้มยำกระดูกอ่อน", price: 70, kitchen: "dad" },
  { name: "ต้มยำทะเล", price: 80, kitchen: "dad" },
  { name: "ต้มยำรวมมิตร", price: 80, kitchen: "dad" },
  { name: "ยำวุ้นเส้น", price: 60, kitchen: "dad" },
  { name: "ยำหมูยอ", price: 60, kitchen: "dad" },
  { name: "ยำไข่เค็ม", price: 60, kitchen: "dad" },
  { name: "ยำวุ้นเส้นรวมมิตร", price: 70, kitchen: "dad" },
  { name: "ยำรวมมิตร", price: 70, kitchen: "dad" },
  { name: "ยำมาม่า", price: 70, kitchen: "dad" },
  { name: "ยำเล็บมือนาง", price: 70, kitchen: "dad" },
  { name: "ยำเส้นแก้ว", price: 80, kitchen: "dad" },
  { name: "ยำทะเล(กุ้ง,ปลาหมึก)", price: 80, kitchen: "dad" },
  { name: "ลาบเห็ด", price: 50, kitchen: "dad" },
  { name: "ก้อยหอย", price: 50, kitchen: "dad" },
  { name: "ซุปหน่อไม้", price: 50, kitchen: "dad" },
  { name: "ลาบหมู", price: 60, kitchen: "dad" },
  { name: "น้ำตกหมู", price: 60, kitchen: "dad" },
  { name: "ลาบเป็ด", price: 60, kitchen: "dad" },
  { name: "ตับหวานหมู", price: 60, kitchen: "dad" },
  { name: "ตับหวานเนื้อ", price: 70, kitchen: "dad" },
  { name: "ลาบวุ้นเส้น", price: 60, kitchen: "dad" },
  { name: "ลาบปลาดุก", price: 60, kitchen: "dad" },
  { name: "ก้อยหมู", price: 60, kitchen: "dad" },
  { name: "ลาบเนื้อ", price: 70, kitchen: "dad" },
  { name: "ก้อยเนื้อดิบ/สุก", price: 70, kitchen: "dad" },
  { name: "ลาบไก่", price: 60, kitchen: "dad" },
  { name: "ลาบปลาหมึก", price: 80, kitchen: "dad" },
  { name: "ลาบผ้าขี้ริ้ว", price: 70, kitchen: "dad" },
  { name: "ซอยจุ๊", price: 80, kitchen: "dad" },
  { name: "แกงเห็ด", price: 60, kitchen: "dad" },
  { name: "อ่อมหมู", price: 60, kitchen: "dad" },
  { name: "อ่อมไก่", price: 60, kitchen: "dad" },
  { name: "อ่อมปลากระพง", price: 70, kitchen: "dad" },
  { name: "อ่อมกระดูกอ่อน", price: 70, kitchen: "dad" },
  { name: "อ่อมเนื้อ", price: 70, kitchen: "dad" },
  { name: "หมี่ลวก", price: 10, kitchen: "dad" },
  { name: "วุ้นเส้นลวก", price: 10, kitchen: "dad" },
  { name: "เล็กลวก", price: 10, kitchen: "dad" },
  { name: "ม่าๆลวก", price: 10, kitchen: "dad" },

  // --- ของป้า (kitchen: "aunt") ---
  { name: "เนื้อไก่", price: 10, kitchen: "aunt" },
  { name: "หมูปิ้ง", price: 10, kitchen: "aunt" },
  { name: "เครื่องในไก่", price: 10, kitchen: "aunt" },
  { name: "ตูดไก่", price: 12, kitchen: "aunt" },
  { name: "แหนม", price: 15, kitchen: "aunt" },
  { name: "ปีกเต็ม", price: 20, kitchen: "aunt" },
  { name: "ปีกกลาง", price: 20, kitchen: "aunt" },
  { name: "หมูแดดเดียว", price: 20, kitchen: "aunt" },
  { name: "เนื้อแดดเดียว", price: 20, kitchen: "aunt" },
  { name: "ปลาดุกย่าง", price: 40, kitchen: "aunt" },
  { name: "น่องติดสะโพก", price: 50, kitchen: "aunt" },
  { name: "อกไก่ย่าง", price: 60, kitchen: "aunt" },
  { name: "คอหมูย่าง", price: 70, kitchen: "aunt" },
  { name: "ข้าวเหนียว", price: 10, kitchen: "aunt" },
  { name: "ข้าวสวย", price: 10, kitchen: "aunt" },
  { name: "น้ำเปล่าเล็ก", price: 10, kitchen: "aunt" },
  { name: "น้ำเปล่าใหญ่", price: 15, kitchen: "aunt" },
  { name: "โค้ก/เป๊ปซี่เล็ก", price: 25, kitchen: "aunt" },
  { name: "โค้กใหญ่", price: 40, kitchen: "aunt" },
  { name: "เป๊ปซี่ใหญ่", price: 45, kitchen: "aunt" },
  { name: "เป๊ปซี่กลาง", price: 30, kitchen: "aunt" },
  { name: "น้ำแข็งแก้ว", price: 2, kitchen: "aunt" },
  { name: "น้ำแข็งถัง", price: 10, kitchen: "aunt" },
];

export default function SummaryPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [editingBill, setEditingBill] = useState<any>(null);
  const [menuSearch, setMenuSearch] = useState("");

  const getTodayYYYYMMDD = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayYYYYMMDD());

  const fetchBills = async () => {
    try {
      const res = await fetch("https://mom-pos-backend-api.onrender.com/api/bills");
      const data = await res.json();
      setBills(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const deleteBill = async (id: string) => {
    if (confirm("⚠️️ ต้องการลบบิลนี้ใช่หรือไม่?")) {
      const res = await fetch(`https://mom-pos-backend-api.onrender.com/api/bills/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("🗑️ ลบบิลเรียบร้อย");
        fetchBills();
      }
    }
  };

  const openEditModal = (bill: any) => {
    setEditingBill(JSON.parse(JSON.stringify(bill)));
  };

  const removeItemFromEditing = (index: number) => {
    const newItems = [...editingBill.items];
    newItems.splice(index, 1);
    setEditingBill({ ...editingBill, items: newItems });
  };

  const addItemToEditing = (menu: any) => {
    const newItems = [...editingBill.items, { ...menu, quantity: 1, cartId: Date.now() + Math.random() }];
    setEditingBill({ ...editingBill, items: newItems });
  };

  // ✨ เพิ่มเมนูพิเศษ (พิมพ์เอง) ในหน้าแก้ไขบิล
  const addCustomMenuEditing = () => {
    const customName = prompt("📝 พิมพ์ชื่อเมนูพิเศษ:");
    if (!customName || customName.trim() === "") return;

    const customPriceStr = prompt(`💵 ใส่ราคาของ "${customName}" (บาท):`);
    const customPrice = Number(customPriceStr);
    if (isNaN(customPrice) || customPrice <= 0) {
      alert("❌ กรุณาใส่ราคาเป็นตัวเลขที่ถูกต้อง");
      return;
    }

    const newItem = {
      name: `✨ ${customName.trim()}`,
      price: customPrice,
      kitchen: "dad",
      quantity: 1,
      note: "เมนูพิเศษ",
      cartId: Date.now() + Math.random()
    };

    const newItems = [...editingBill.items, newItem];
    setEditingBill({ ...editingBill, items: newItems });
  };

  const saveEditedBill = async () => {
    try {
      const res = await fetch(`https://mom-pos-backend-api.onrender.com/api/bills/${editingBill._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          table: editingBill.table,
          items: editingBill.items
        })
      });

      if (res.ok) {
        alert("✅ แก้ไขบิลสำเร็จ!");
        setEditingBill(null);
        fetchBills();
      } else {
        alert("❌ แก้ไขไม่สำเร็จ");
      }
    } catch (e) {
      console.error(e);
      alert("❌ เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const filteredBills = bills.filter(b => {
    const billDate = new Date(b.createdAt);
    const year = billDate.getFullYear();
    const month = String(billDate.getMonth() + 1).padStart(2, '0');
    const day = String(billDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}` === selectedDate;
  });

  const totalMom = filteredBills.reduce((sum, b) => sum + (b.momTotal || 0), 0);
  const totalAunt = filteredBills.reduce((sum, b) => sum + (b.auntTotal || 0), 0);
  const grandTotal = totalMom + totalAunt;

  // คำนวณยอดชั่วคราวตอนกำลังแก้ใน Modal (รองรับลาบปลาดุก ป้า40/แม่20 และของป้า)
  const editMomTotal = editingBill?.items?.reduce((sum: number, i: any) => {
    const qty = i.quantity || 1;
    const price = Number(i.price) * qty;
    if (i.name === "ลาบปลาดุก") return sum + (20 * qty);
    if (i.kitchen === "aunt") return sum;
    return sum + price;
  }, 0) || 0;

  const editAuntTotal = editingBill?.items?.reduce((sum: number, i: any) => {
    const qty = i.quantity || 1;
    const price = Number(i.price) * qty;
    if (i.name === "ลาบปลาดุก") return sum + (40 * qty);
    if (i.kitchen === "aunt") return sum + price;
    return sum;
  }, 0) || 0;

  const editGrandTotal = editMomTotal + editAuntTotal;

  const filteredModalMenus = menuSearch.trim() !== ""
    ? allMenus.filter(m => m.name.toLowerCase().includes(menuSearch.toLowerCase()))
    : allMenus.slice(0, 12);

  return (
    <div className="p-4 sm:p-8 bg-gray-100 min-h-screen text-black relative select-none">
      {editingBill && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto border-4 border-blue-500">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black text-blue-600">✏️ แก้ไขรายการบิล</h2>
              <button onClick={addCustomMenuEditing} className="bg-orange-500 text-white px-3 py-1.5 rounded-xl font-bold text-sm shadow hover:bg-orange-600">
                ✨ เมนูพิเศษ (พิมพ์เอง)
              </button>
            </div>
            
            <div className="mb-4">
              <label className="font-bold text-gray-700 block mb-1">เบอร์โต๊ะ:</label>
              <input 
                type="text" 
                value={editingBill.table} 
                onChange={(e) => setEditingBill({ ...editingBill, table: e.target.value })}
                className="w-full text-xl p-3 border-2 border-blue-400 rounded-xl font-bold bg-blue-50 text-black"
              />
            </div>

            <h3 className="font-bold text-gray-700 mb-2">รายการอาหารในบิลนี้ (กด X เพื่อลบ):</h3>
            <div className="bg-gray-50 p-3 rounded-xl border mb-4 max-h-48 overflow-y-auto space-y-2">
              {editingBill.items.map((item: any, idx: number) => {
                const qty = item.quantity || 1;
                return (
                  <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-2xs border">
                    <div className="flex items-center gap-3">
                      <button onClick={() => removeItemFromEditing(idx)} className="bg-red-100 text-red-600 font-bold px-3 py-1 rounded-full text-xs hover:bg-red-200">X ลบ</button>
                      <span className="font-bold text-base">{item.name} {qty > 1 && <span className="text-blue-600">x{qty}</span>}</span>
                    </div>
                    <span className="font-bold text-blue-600 text-base">{item.price * qty} ฿</span>
                  </div>
                );
              })}
              {editingBill.items.length === 0 && (
                <p className="text-center text-gray-400 py-4">ไม่มีเมนูในบิลนี้แล้ว</p>
              )}
            </div>

            <h3 className="font-bold text-gray-700 mb-1">➕ เพิ่มเมนูอาหาร (ค้นหาทุกเมนูในร้าน):</h3>
            <div className="mb-3">
              <input 
                type="text"
                placeholder="🔍 พิมพ์ชื่อเมนูเพื่อค้นหา..."
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                className="w-full p-2.5 border-2 border-blue-300 rounded-xl bg-white font-bold text-black focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6 max-h-48 overflow-y-auto p-1 bg-gray-50 rounded-xl border">
              {filteredModalMenus.map((menu, idx) => (
                <button 
                  key={idx} 
                  onClick={() => addItemToEditing(menu)}
                  className="bg-white hover:bg-blue-50 p-2.5 rounded-xl text-xs font-bold border flex flex-col items-center shadow-2xs">
                  <span className="text-center">{menu.name}</span>
                  <span className="text-blue-600 mt-1">{menu.price} ฿</span>
                </button>
              ))}
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-6 flex justify-between items-center font-bold text-base">
              <span>ยอดใหม่: แม่ {editMomTotal}฿ | ป้า {editAuntTotal}฿</span>
              <span className="text-xl text-blue-700">รวม: {editGrandTotal} ฿</span>
            </div>

            <div className="flex gap-3">
              <button onClick={saveEditedBill} className="flex-1 bg-green-600 text-white font-bold text-lg py-3 rounded-xl hover:bg-green-700 shadow">
                💾 บันทึกการแก้ไข
              </button>
              <button onClick={() => setEditingBill(null)} className="flex-1 bg-gray-400 text-white font-bold text-lg py-3 rounded-xl hover:bg-gray-500 shadow">
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">📊 หน้าสรุปยอดขาย (แก้ไขบิลได้)</h1>
        <a href="/" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700">🔙 กลับไปหน้าขาย</a>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md mb-6 flex flex-col sm:flex-row items-center gap-3 border">
        <label className="text-lg font-bold text-gray-700">📅 เลือกวันที่ต้องการดู:</label>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
          className="text-lg p-2.5 border-2 border-blue-400 rounded-xl font-bold bg-blue-50 text-black w-full sm:w-auto"
        />
        <button onClick={() => setSelectedDate(getTodayYYYYMMDD())} className="bg-gray-200 px-4 py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-300 w-full sm:w-auto">
          กลับมาวันปัจจุบัน
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-3">💰 สรุปยอดขายประจำวันที่: {selectedDate}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-100 p-5 rounded-2xl shadow-md border border-green-300">
            <h3 className="text-lg font-bold text-green-700">👩‍‍🦰 ยอดของแม่</h3>
            <p className="text-3xl sm:text-4xl font-extrabold text-green-800 mt-1">{totalMom} ฿</p>
          </div>
          <div className="bg-yellow-100 p-5 rounded-2xl shadow-md border border-yellow-300">
            <h3 className="text-lg font-bold text-yellow-700">👵 ยอดของป้า</h3>
            <p className="text-3xl sm:text-4xl font-extrabold text-yellow-800 mt-1">{totalAunt} ฿</p>
          </div>
          <div className="bg-blue-100 p-5 rounded-2xl shadow-md border border-blue-300">
            <h3 className="text-lg font-bold text-blue-700">💰 ยอดรวมทั้งร้าน</h3>
            <p className="text-3xl sm:text-4xl font-extrabold text-blue-800 mt-1">{grandTotal} ฿</p>
          </div>
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-700">📜 รายการบิลของวันที่ {selectedDate}</h2>
      
      <div className="bg-white rounded-2xl shadow-xl overflow-x-auto border">
        <table className="w-full min-w-[700px] text-left border-collapse">
          <thead>
            <tr className="bg-gray-200 text-gray-700 text-base">
              <th className="p-4 w-28">เวลา</th>
              <th className="p-4 w-28">โต๊ะ</th>
              <th className="p-4">รายการอาหาร</th>
              <th className="p-4 w-28">ยอดแม่</th>
              <th className="p-4 w-28">ยอดป้า</th>
              <th className="p-4 w-28">รวม</th>
              <th className="p-4 text-center w-36">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.map((bill) => (
              <tr key={bill._id} className="border-b hover:bg-gray-50 align-top text-sm">
                <td className="p-4 text-gray-600 whitespace-nowrap">{new Date(bill.createdAt).toLocaleTimeString("th-TH")} น.</td>
                <td className="p-4 font-bold text-blue-600 whitespace-nowrap">{bill.table}</td>
                
                <td className="p-4">
                  <div className="space-y-1 bg-gray-50 p-2.5 rounded-xl border">
                    {bill.items.map((i: any, idx: number) => {
                      const qty = i.quantity || 1;
                      return (
                        <div key={idx} className="flex justify-between items-center text-gray-800 font-medium">
                          <span>• {i.name} {qty > 1 && <strong className="text-blue-600">x{qty}</strong>} {i.note ? `(${i.note})` : ''}</span>
                          <span className="text-gray-500 font-bold ml-2">{i.price * qty} ฿</span>
                        </div>
                      );
                    })}
                  </div>
                </td>

                <td className="p-4 font-bold text-green-600 whitespace-nowrap">{bill.momTotal} ฿</td>
                <td className="p-4 font-bold text-yellow-600 whitespace-nowrap">{bill.auntTotal} ฿</td>
                <td className="p-4 font-bold text-gray-800 whitespace-nowrap">{bill.grandTotal} ฿</td>
                
                <td className="p-4 text-center whitespace-nowrap">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openEditModal(bill)} className="bg-yellow-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-yellow-600 shadow-2xs">
                      ✏️ แก้ไข
                    </button>
                    <button onClick={() => deleteBill(bill._id)} className="bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-red-600 shadow-2xs">
                      🗑️ ลบ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredBills.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center p-8 text-gray-400 text-xl">ไม่มีประวัติการขายในวันที่เลือกนี้</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}