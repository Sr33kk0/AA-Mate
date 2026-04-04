import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Camera, Receipt, Users, UserPlus, UserCircle } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');

  const activeReceipts = [
    {
      id: 1,
      type: 'host',
      name: 'Murni Discovery',
      participants: 4,
      date: 'Oct 24, 2023',
      status: 'Verification Needed',
      statusColor: 'bg-yellow-400',
      statusTextColor: 'text-yellow-400',
      iconText: 'M',
      route: '/host-receipt',
      amount: 22.40,
      isOwedToYou: true
    },
    {
      id: 2,
      type: 'client',
      name: 'Sae Ma Eul BBQ',
      participants: 6,
      date: 'Oct 22, 2023',
      status: 'Pending Payment',
      statusColor: 'bg-[#00FF87]',
      statusTextColor: 'text-[#00FF87]',
      iconText: 'S',
      route: '/client-receipt',
      amount: 21.46,
      isYouOwe: true
    },
    {
      id: 3,
      type: 'client',
      name: 'Nasi Lemak Antarabangsa',
      participants: 2,
      date: 'Oct 20, 2023',
      status: 'Pending Payment',
      statusColor: 'bg-[#00FF87]',
      statusTextColor: 'text-[#00FF87]',
      iconText: 'N',
      route: '/client-receipt',
      amount: 15.50,
      isYouOwe: true
    },
    {
      id: 4,
      type: 'host',
      name: 'KFC',
      participants: 3,
      date: 'Oct 19, 2023',
      status: 'Verification Needed',
      statusColor: 'bg-yellow-400',
      statusTextColor: 'text-yellow-400',
      iconText: 'K',
      route: '/host-receipt',
      amount: 40.00,
      isOwedToYou: true
    }
  ];

  const settledReceipts = [
    {
      id: 5,
      type: 'host',
      name: 'Din Tai Fung',
      participants: 3,
      date: 'Oct 15, 2023',
      status: 'Settled',
      statusColor: 'bg-white/40',
      statusTextColor: 'text-white/60',
      iconText: 'D',
      amount: 45.00,
      isOwedToYou: true,
      route: '/host-receipt-settled'
    },
    {
      id: 6,
      type: 'client',
      name: 'McDonalds',
      participants: 5,
      date: 'Oct 12, 2023',
      status: 'Settled',
      statusColor: 'bg-white/40',
      statusTextColor: 'text-white/60',
      iconText: 'M',
      amount: 18.20,
      isYouOwe: true
    }
  ];

  const totalOwedToYou = useMemo(() => {
    return activeReceipts.reduce((acc, curr) => curr.isOwedToYou ? acc + curr.amount : acc, 0);
  }, []);

  const totalYouOwe = useMemo(() => {
    return activeReceipts.reduce((acc, curr) => curr.isYouOwe ? acc + curr.amount : acc, 0);
  }, []);

  const displayedReceipts = activeTab === 'active' ? activeReceipts : settledReceipts;

  return (
    <div className="flex-1 flex w-full max-w-md mx-auto h-full bg-black relative flex-col">
      {/* Header */}
      <header className="bg-black/80 backdrop-blur-xl absolute top-0 z-50 flex justify-between items-center w-full px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Menu className="w-6 h-6 text-white hover:opacity-80 transition-opacity active:scale-95 duration-200 ease-out cursor-pointer" />
          <h1 className="text-xl font-bold tracking-tight text-white font-sans">AA-Mate</h1>
        </div>
        <div 
          className="w-10 h-10 rounded-full border border-white/10 overflow-hidden hover:opacity-80 transition-opacity active:scale-95 duration-200 cursor-pointer"
        >
          <img 
            alt="User Profile" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB04hfs9-r7Z3uS2588xEf5MJeC0wOZooy03L9EZqQ_iRvu6sQb_oBmV4IMMWYSTHtFIYI8VSMSPYwe28Dh1YluHZHdJRBb5q2dRrESvqxCr_VBBXvjxC8b7P7_wG3RM7oZFM7ijmIiGJhAjGv32R06znQt6Afkk_H2z_3rbgl0Bm-WGfzyuV-ku6NwxC9AkVS9xtKo3jiFj22_lc9cGu67DS2AXFoLmNgbwgHjTwtaxh5IWvMstSrm1xOnlgP4PLzwkcgjWVVLh6WA" 
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 items-stretch overflow-y-auto px-6 pt-24 pb-48 space-y-8 scroll-smooth z-10 font-sans [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        
        {/* Balance Section */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-32 hover:bg-white/5 transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">You Owe</span>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-[#FF007F] tabular-nums drop-shadow-[0_0_12px_rgba(255,0,127,0.4)]">RM {totalYouOwe.toFixed(2)}</span>
            </div>
          </div>
          <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 flex flex-col justify-between h-32 hover:bg-white/5 transition-colors">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Owed to You</span>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-[#00FF87] tabular-nums drop-shadow-[0_0_12px_rgba(0,255,135,0.4)]">RM {totalOwedToYou.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="flex bg-[#1a1c22] p-1 rounded-xl w-full border border-white/5 relative">
          <div 
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg transition-all duration-300 ease-out ${activeTab === 'active' ? 'left-1' : 'left-[calc(50%+2px)]'}`}
          />
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 relative z-10 font-bold py-2.5 rounded-lg text-xs transition-colors duration-300 ${activeTab === 'active' ? 'text-black' : 'text-white hover:text-white'}`}
          >
            Active Tabs
          </button>
          <button 
            onClick={() => setActiveTab('settled')}
            className={`flex-1 relative z-10 font-bold py-2.5 rounded-lg text-xs transition-colors duration-300 ${activeTab === 'settled' ? 'text-black' : 'text-white hover:text-white'}`}
          >
            Settled
          </button>
        </section>

        {/* History List */}
        <section className="space-y-3">
          {displayedReceipts.map((item) => (
            <div 
              key={item.id}
              onClick={() => item.route && navigate(item.route)}
              className={`bg-[#111111] border border-white/5 rounded-2xl p-4 flex items-center justify-between transition-all duration-200 ${item.route ? 'group active:scale-[0.98] cursor-pointer' : 'opacity-60 cursor-default'}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center border border-white/10 shrink-0">
                  <span className={`font-black text-xl ${item.isYouOwe ? 'text-[#FF007F]' : item.isOwedToYou ? 'text-[#00FF87]' : 'text-white'}`}>{item.iconText}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm">{item.name}</h3>
                    <span className="text-[10px] text-white/60 font-medium">({item.type === 'host' ? 'Host' : 'Guest'})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.statusColor}`} />
                    <span className={`text-[10px] font-bold ${item.statusTextColor} uppercase tracking-tighter`}>{item.status}</span>
                  </div>
                  <p className="text-[10px] text-white/60 font-medium">{item.date} • {item.participants} Participants</p>
                </div>
              </div>
              <div className="flex flex-col items-end pl-2 shrink-0">
                <span className={`text-sm font-black tabular-nums ${item.isYouOwe ? 'text-[#FF007F]' : item.isOwedToYou ? 'text-[#00FF87]' : 'text-white'}`}>
                  RM {item.amount.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Floating Action Button */}
      <div className="absolute bottom-28 left-0 right-0 px-8 z-40 pointer-events-none">
        <button className="bg-[#FF007F] pointer-events-auto text-white w-full py-4 rounded-full shadow-[0_4px_24px_rgba(255,0,127,0.4)] flex items-center justify-center gap-2 active:scale-[0.98] transition-transform font-bold text-sm">
          <Camera className="w-5 h-5" />
          Scan Receipt
        </button>
      </div>

      {/* Bottom Nav */}
      <nav className="absolute bottom-0 w-full flex justify-around items-center px-6 pb-8 pt-4 bg-black/80 backdrop-blur-xl border-t border-white/5 z-50">
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center text-[#FF007F] active:scale-90 transition-transform">
          <Receipt className="w-6 h-6" />
          <span className="font-medium text-[10px] font-sans mt-1">Activity</span>
        </button>
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center text-white/60 hover:text-white transition-colors active:scale-90">
          <Users className="w-6 h-6" />
          <span className="font-medium text-[10px] font-sans mt-1">Groups</span>
        </button>
        <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center text-white/60 hover:text-white transition-colors active:scale-90">
          <UserPlus className="w-6 h-6" />
          <span className="font-medium text-[10px] font-sans mt-1">Friends</span>
        </button>
        <button onClick={() => navigate('/profile')} className="flex flex-col items-center justify-center text-white/60 hover:text-white transition-colors active:scale-90">
          <UserCircle className="w-6 h-6" />
          <span className="font-medium text-[10px] font-sans mt-1">Profile</span>
        </button>
      </nav>
    </div>
  );
}
