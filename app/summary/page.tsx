"use client";
import { useEffect, useState } from "react";

export default function SummaryPage() {
  const [bills, setBills] = useState<any[]>([]);

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

  // ฟังก์ชันลบบิล
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

  // ✏️ ฟังก์ชันแก้ไขบิล (แก้โต๊ะ / แก้ยอดเงิน)
  const editBill = async (bill: any) => {
    const newTable = prompt("แก้ไขเบอร์โต๊ะ:", bill.table);
    if (newTable === null) return;
    const newMom = prompt("แก้ไขยอดของแม่:", bill.momTotal);
    if (newMom === null) return;
    const newAunt = prompt("แก้ไขยอดของป้า:", bill.auntTotal);
    if (newAunt === null) return;

    const res = await fetch(`https://mom-pos-backend-api.onrender.com/api/bills/${bill._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        table: newTable,
        momTotal: Number(newMom),
        auntTotal: Number(newAunt)
      })
    });

    if (res.ok) {
      alert("✅ แก้ไขบิลสำเร็จ!");
      fetchBills();
    } else {
      alert("❌ แก้ไขไม่สำเร็จ");
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

  return (
    <div className="p-8 bg-gray-100 min-h-screen text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📊 หน้าสรุปยอดขาย (เลือกวันและแก้ไขได้)</h1>
        <a href="/" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700">🔙 กลับไปหน้าขายอาหาร</a>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-md mb-6 flex items-center gap-4 border">
        <label className="text-xl font-bold text-gray-700">📅 เลือกวันที่ต้องการดู:</label>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)}
          className="text-xl p-3 border-2 border-blue-400 rounded-xl font-bold bg-blue-50 focus:outline-none focus:border-blue-600 text-black"
        />
        <button onClick={() => setSelectedDate(getTodayYYYYMMDD())} className="bg-gray-200 px-4 py-3 rounded-xl font-bold text-gray-700 hover:bg-gray-300">
          กลับมาวันปัจจุบัน
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-3">💰 สรุปยอดขายประจำวันที่: {selectedDate}</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-100 p-6 rounded-2xl shadow-md border border-green-300">
            <h3 className="text-xl font-bold text-green-700">👩‍🦰 ยอดของแม่</h3>
            <p className="text-4xl font-extrabold text-green-800 mt-2">{totalMom} ฿</p>
          </div>
          <div className="bg-yellow-100 p-6 rounded-2xl shadow-md border border-yellow-300">
            <h3 className="text-xl font-bold text-yellow-700">👵 ยอดของป้า</h3>
            <p className="text-4xl font-extrabold text-yellow-800 mt-2">{totalAunt} ฿</p>
          </div>
          <div className="bg-blue-100 p-6 rounded-2xl shadow-md border border-blue-300">
            <h3 className="text-xl font-bold text-blue-700">💰 ยอดรวมทั้งร้าน</h3>
            <p className="text-4xl font-extrabold text-blue-800 mt-2">{grandTotal} ฿</p>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-gray-700">📜 รายการบิลของวันที่ {selectedDate}</h2>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200 text-gray-700 text-lg">
              <th className="p-4">เวลาที่บันทึก</th>
              <th className="p-4">โต๊ะ</th>
              <th className="p-4">รายการอาหาร</th>
              <th className="p-4">ยอดของแม่</th>
              <th className="p-4">ยอดของป้า</th>
              <th className="p-4">รวมบิล</th>
              <th className="p-4 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredBills.map((bill) => (
              <tr key={bill._id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-gray-600">{new Date(bill.createdAt).toLocaleTimeString("th-TH")} น.</td>
                <td className="p-4 font-bold text-blue-600">โต๊ะ {bill.table}</td>
                <td className="p-4 text-sm text-gray-700">
                  {bill.items.map((i: any, idx: number) => (
                    <span key={idx}>- {i.name} ({i.price}฿){idx < bill.items.length - 1 ? ", " : ""}</span>
                  ))}
                </td>
                <td className="p-4 font-bold text-green-600">{bill.momTotal} ฿</td>
                <td className="p-4 font-bold text-yellow-600">{bill.auntTotal} ฿</td>
                <td className="p-4 font-bold text-gray-800">{bill.grandTotal} ฿</td>
                <td className="p-4 text-center flex justify-center gap-2">
                  <button onClick={() => editBill(bill)} className="bg-yellow-500 text-white px-3 py-1 rounded-lg font-bold hover:bg-yellow-600">
                    ✏️ แก้ไข
                  </button>
                  <button onClick={() => deleteBill(bill._id)} className="bg-red-500 text-white px-3 py-1 rounded-lg font-bold hover:bg-red-600">
                    🗑️ ลบ
                  </button>
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