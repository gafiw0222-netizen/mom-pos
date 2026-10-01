"use client";
import { useEffect, useState } from "react";

export default function SummaryPage() {
  const [bills, setBills] = useState<any[]>([]);

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

  // ฟังก์ชันลบบิลย้อนหลัง (กรณีคิดเงินผิด)
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

  // 📅 กรองเฉพาะบิลที่เป็นของ "วันนี้" เท่านั้น (เทียบวันที่ปัจจุบัน)
  const todayStr = new Date().toDateString();
  const todayBills = bills.filter(b => new Date(b.createdAt).toDateString() === todayStr);

  // คำนวณยอดขายเฉพาะ "วันนี้" สำหรับแม่และป้า
  const todayMom = todayBills.reduce((sum, b) => sum + (b.momTotal || 0), 0);
  const todayAunt = todayBills.reduce((sum, b) => sum + (b.auntTotal || 0), 0);
  const todayGrandTotal = todayMom + todayAunt;

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📊 หน้าสรุปยอดขาย (คิดรายวัน)</h1>
        <a href="/" className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700">🔙 กลับไปหน้าขายอาหาร</a>
      </div>

      {/* กล่องโชว์ยอดขายเฉพาะ "วันนี้" (เหมาะกับแม่ที่คิดวันต่อวัน) */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-3">📅 ยอดขายประจำวันนี้ (แยกตามวัน)</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-100 p-6 rounded-2xl shadow-md border border-green-300">
            <h3 className="text-xl font-bold text-green-700">👩‍🦰 ยอดของแม่ (วันนี้)</h3>
            <p className="text-4xl font-extrabold text-green-800 mt-2">{todayMom} ฿</p>
          </div>
          <div className="bg-yellow-100 p-6 rounded-2xl shadow-md border border-yellow-300">
            <h3 className="text-xl font-bold text-yellow-700">👵 ยอดของป้า (วันนี้)</h3>
            <p className="text-4xl font-extrabold text-yellow-800 mt-2">{todayAunt} ฿</p>
          </div>
          <div className="bg-blue-100 p-6 rounded-2xl shadow-md border border-blue-300">
            <h3 className="text-xl font-bold text-blue-700">💰 ยอดรวมทั้งร้าน (วันนี้)</h3>
            <p className="text-4xl font-extrabold text-blue-800 mt-2">{todayGrandTotal} ฿</p>
          </div>
        </div>
      </div>

      {/* ตารางแสดงประวัติบิลทั้งหมด (เผื่ออยากเช็คย้อนหลังหรือลบแก้บิลผิด) */}
      <h2 className="text-2xl font-bold mb-4 text-gray-700">📜 ประวัติบิลทั้งหมดในระบบ</h2>
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
            {bills.map((bill) => (
              <tr key={bill._id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-gray-600">
                  {new Date(bill.createdAt).toLocaleString("th-TH")}
                </td>
                <td className="p-4 font-bold text-blue-600">โต๊ะ {bill.table}</td>
                <td className="p-4 text-sm text-gray-700">
                  {bill.items.map((i: any, idx: number) => (
                    <span key={idx}>- {i.name} ({i.price}฿){idx < bill.items.length - 1 ? ", " : ""}</span>
                  ))}
                </td>
                <td className="p-4 font-bold text-green-600">{bill.momTotal} ฿</td>
                <td className="p-4 font-bold text-yellow-600">{bill.auntTotal} ฿</td>
                <td className="p-4 font-bold text-gray-800">{bill.grandTotal} ฿</td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => deleteBill(bill._id)} 
                    className="bg-red-500 text-white px-3 py-1 rounded-lg font-bold hover:bg-red-600">
                    🗑️ ลบ
                  </button>
                </td>
              </tr>
            ))}
            {bills.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center p-8 text-gray-400 text-xl">ยังไม่มีประวัติการขายในระบบ</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}