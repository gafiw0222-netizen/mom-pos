"use client";
import { useEffect, useState } from "react";

const presetMenus = [
  { name: "ลาบหมู", price: 60, owner: "mom" },
  { name: "ต้มแซ่บ", price: 80, owner: "mom" },
  { name: "ตำไทย", price: 40, owner: "mom" },
  { name: "ตำปูปลาร้า", price: 40, owner: "mom" },
  { name: "คอหมูย่าง", price: 60, owner: "aunt" },
  { name: "ข้าวเหนียว", price: 10, owner: "aunt" },
];

export default function SummaryPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [editingBill, setEditingBill] = useState<any>(null);

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
    if (confirm("⚠️ ต้องการลบบิลนี้ใช่หรือไม่?")) {
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
    const newItems = [...editingBill.items, { ...menu, cartId: Date.now() }];
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

  const editMomTotal = editingBill?.items?.filter((i: any) => i.owner === "mom").reduce((sum: number, i: any) => sum + Number(i.price), 0) || 0;
  const editAuntTotal = editingBill?.items?.filter((i: any) => i.owner === "aunt").reduce((sum: number, i: any) => sum + Number(i.price), 0) || 0;
  const editGrandTotal = editMomTotal + editAuntTotal;

  return (
    <div className="p-4 sm:p-8 bg-gray-100 min-h-screen text-black relative">
      {editingBill && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border-4 border-blue-500">
            <h2 className="text-2xl font-black text-blue-600 mb-4">✏️ แก้ไขรายการบิล</h2>
            
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
              {editingBill.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-2">
                    <button onClick={() => removeItemFromEditing(idx)} className="bg-red-100 text-red-600 font-bold px-2 py-1 rounded-full text-sm hover:bg-red-200">X</button>
                    <span className="font-bold">{item.name}</span>
                    <span className="text-xs text-gray-500">({item.owner === 'mom' ? '👩‍🦰 แม่' : '👵 ป้า'})</span>
                  </div>
                  <span className="font-bold text-blue-600">{item.price} ฿</span>
                </div>
              ))}
              {editingBill.items.length === 0 && (
                <p className="text-center text-gray-400 py-4">ไม่มีเมนูในบิลนี้แล้ว</p>
              )}
            </div>

            <h3 className="font-bold text-gray-700 mb-2">➕ เพิ่มเมนูอาหาร:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
              {presetMenus.map((menu, idx) => (
                <button 
                  key={idx} 
                  onClick={() => addItemToEditing(menu)}
                  className="bg-gray-200 hover:bg-blue-100 p-2 rounded-xl text-sm font-bold border flex flex-col items-center">
                  <span>{menu.name}</span>
                  <span className="text-blue-600">{menu.price} ฿</span>
                </button>
              ))}
            </div>

            <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 mb-6 flex flex-col sm:flex-row justify-between items-center font-bold text-base gap-1">
              <span>ยอดใหม่: แม่ {editMomTotal}฿ | ป้า {editAuntTotal}฿</span>
              <span className="text-xl text-blue-700">รวม: {editGrandTotal} ฿</span>
            </div>

            <div className="flex gap-3">
              <button onClick={saveEditedBill} className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 shadow">
                💾 บันทึก
              </button>
              <button onClick={() => setEditingBill(null)} className="flex-1 bg-gray-400 text-white font-bold py-3 rounded-xl hover:bg-gray-500 shadow">
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center sm:text-left">📊 หน้าสรุปยอดขาย</h1>
        <a href="/" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 text-sm sm:text-base">🔙 กลับหน้าขาย</a>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md mb-6 flex flex-col sm:flex-row items-center gap-3 border">
        <label className="text-lg font-bold text-gray-700">📅 เลือกวันที่:</label>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
          className="text-lg p-2.5 border-2 border-blue-400 rounded-xl font-bold bg-blue-50 text-black w-full sm:w-auto"
        />
        <button onClick={() => setSelectedDate(getTodayYYYYMMDD())} className="bg-gray-200 px-4 py-2.5 rounded-xl font-bold text-gray-700 hover:bg-gray-300 w-full sm:w-auto">
          วันปัจจุบัน
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-700 mb-3">💰 สรุปยอดวันที่: {selectedDate}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-100 p-5 rounded-2xl shadow-md border border-green-300">
            <h3 className="text-lg font-bold text-green-700">👩‍🦰 ยอดของแม่</h3>
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

      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-700">📜 รายการบิล</h2>
      {/* ทำตารางให้เลื่อนขวาซ้ายได้บนมือถือ (overflow-x-auto) */}
      <div className="bg-white rounded-2xl shadow-xl overflow-x-auto border">
        <table className="w-full min-w-[650px] text-left border-collapse">
          <thead>
            <tr className="bg-gray-200 text-gray-700 text-base sm:text-lg">
              <th className="p-3 sm:p-4">เวลา</th>
              <th className="p-3 sm:p-4">โต๊ะ</th>
              <th className="p-3 sm:p-4">รายการอาหาร</th>
              <th className="p-3 sm:p-4">ยอดแม่</th>
              <th className="p-3 sm:p-4">ยอดป้า</th>
              <th className="p-3 sm:p-4">รวม</th>
              <th className="p-3 sm:p-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.map((bill) => (
              <tr key={bill._id} className="border-b hover:bg-gray-50 text-sm sm:text-base">
                <td className="p-3 sm:p-4 text-gray-600 whitespace-nowrap">{new Date(bill.createdAt).toLocaleTimeString("th-TH")} น.</td>
                <td className="p-3 sm:p-4 font-bold text-blue-600 whitespace-nowrap">โต๊ะ {bill.table}</td>
                <td className="p-3 sm:p-4 text-gray-700 max-w-xs">
                  {bill.items.map((i: any, idx: number) => (
                    <span key={idx}>• {i.name} ({i.price}฿){idx < bill.items.length - 1 ? ", " : ""}</span>
                  ))}
                </td>
                <td className="p-3 sm:p-4 font-bold text-green-600 whitespace-nowrap">{bill.momTotal} ฿</td>
                <td className="p-3 sm:p-4 font-bold text-yellow-600 whitespace-nowrap">{bill.auntTotal} ฿</td>
                <td className="p-3 sm:p-4 font-bold text-gray-800 whitespace-nowrap">{bill.grandTotal} ฿</td>
                <td className="p-3 sm:p-4 text-center whitespace-nowrap">
                  <div className="flex justify-center gap-1 sm:gap-2">
                    <button onClick={() => openEditModal(bill)} className="bg-yellow-500 text-white px-2.5 py-1 rounded-lg font-bold text-xs sm:text-sm hover:bg-yellow-600">
                      ✏️ แก้ไข
                    </button>
                    <button onClick={() => deleteBill(bill._id)} className="bg-red-500 text-white px-2.5 py-1 rounded-lg font-bold text-xs sm:text-sm hover:bg-red-600">
                      🗑️ ลบ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredBills.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center p-8 text-gray-400 text-lg sm:text-xl">ไม่มีประวัติการขายในวันที่เลือกนี้</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}