'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, User, Package } from 'lucide-react';

interface Item {
  id: string;
  name: string;
  category: string;
  total_quantity: number;
  available_quantity: number;
  location: string;
}

export default function RoboticsInventory() {
  // Member Details
  const [memberName, setMemberName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isMemberSet, setIsMemberSet] = useState(false);

  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  
  // Checkout States
  const [checkoutQty, setCheckoutQty] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [notes, setNotes] = useState('');
  const [borrowDate, setBorrowDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState('');

  useEffect(() => {
    if (isMemberSet) fetchItems();
  }, [isMemberSet]);

  const fetchItems = async () => {
    const { data } = await supabase.from('items').select('*');
    setItems(data || []);
  };

  const handleStart = () => {
    if (!memberName || !regNumber || !email) {
      alert("Please fill in Name, Registration Number, and Email");
      return;
    }
    setIsMemberSet(true);
  };

  const handleCheckout = async () => {
    if (!selectedItem || !returnDate) {
      alert("Please select expected return date");
      return;
    }

    const { error } = await supabase.from('transactions').insert({
      item_id: selectedItem.id,
      member_name: memberName,
      action: 'checkout',
      quantity: checkoutQty,
      project_name: projectName || null,
      notes: notes || null,
      created_at: borrowDate
    });

    if (!error) {
      alert(`✅ Checkout successful!\n\nBorrower: ${memberName}\nEmail: ${email}\nExpected Return: ${returnDate}`);
      setSelectedItem(null);
      resetForm();
      fetchItems();
    } else {
      alert("Checkout failed");
    }
  };

  const resetForm = () => {
    setCheckoutQty(1);
    setProjectName('');
    setNotes('');
    setBorrowDate(new Date().toISOString().split('T')[0]);
    setReturnDate('');
  };

  // Member Login Screen
  if (!isMemberSet) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-zinc-900 p-10 rounded-3xl w-full max-w-lg border border-zinc-700">
          <div className="text-center mb-10">
            <div className="text-7xl mb-4">🤖</div>
            <h1 className="text-4xl font-bold tracking-tight">Robotics Lab</h1>
            <p className="text-zinc-400 mt-2">Inventory Management System</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm text-zinc-400 mb-2">Full Name *</label>
              <input type="text" value={memberName} onChange={(e) => setMemberName(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4 text-lg" placeholder="John Doe" />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Registration Number *</label>
              <input type="text" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4" placeholder="UGR/1234/23" />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Email Address * (for reminders)</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4" placeholder="john@example.com" />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-2">Phone Number</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl px-5 py-4" placeholder="0712345678" />
            </div>

            <button 
              onClick={handleStart}
              className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl text-xl font-semibold mt-6 transition"
            >
              Access Inventory →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Inventory Page
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <p className="text-blue-400 text-sm">Logged in as</p>
            <p className="text-2xl font-bold">{memberName}</p>
            <p className="text-zinc-500">{email} | {regNumber}</p>
          </div>
          <button onClick={() => window.location.reload()} className="text-zinc-400 hover:text-white">Switch User</button>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-5 top-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search components (Arduino, Sensor, Motor...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 pl-14 py-4 rounded-2xl text-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            item.category?.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((item) => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 hover:border-blue-600 transition-all">
              <h3 className="text-2xl font-bold mb-1">{item.name}</h3>
              <p className="text-blue-400 mb-6">{item.category}</p>
              
              <div className="space-y-3 mb-8">
                <p><span className="text-zinc-400">Available:</span> <span className="font-bold">{item.available_quantity} / {item.total_quantity}</span></p>
                <p><span className="text-zinc-400">Location:</span> {item.location || 'Not specified'}</p>
              </div>

              <button 
                onClick={() => setSelectedItem(item)}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-semibold"
              >
                Checkout Component
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-3xl p-8 max-w-lg w-full">
            <h2 className="text-3xl font-bold mb-2">Checkout</h2>
            <p className="text-blue-400 mb-8">{selectedItem.name}</p>

            <div className="space-y-6">
              <div>
                <label>Quantity to borrow</label>
                <input type="number" value={checkoutQty} onChange={e => setCheckoutQty(+e.target.value)} min="1" max={selectedItem.available_quantity} className="w-full bg-zinc-800 rounded-xl p-4" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label>Borrow Date</label>
                  <input type="date" value={borrowDate} className="w-full bg-zinc-800 rounded-xl p-4" />
                </div>
                <div>
                  <label>Expected Return Date *</label>
                  <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} className="w-full bg-zinc-800 rounded-xl p-4" />
                </div>
              </div>

              <div>
                <label>Project Name (Optional)</label>
                <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full bg-zinc-800 rounded-xl p-4" placeholder="Line Follower Robot" />
              </div>

              <div>
                <label>Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-zinc-800 rounded-xl p-4 h-24" placeholder="Additional information..." />
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button onClick={() => setSelectedItem(null)} className="flex-1 py-4 border border-zinc-700 rounded-2xl">Cancel</button>
              <button onClick={handleCheckout} className="flex-1 py-4 bg-blue-600 rounded-2xl font-bold">Confirm Checkout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}