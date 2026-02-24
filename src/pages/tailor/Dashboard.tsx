import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store';
import { Scissors, CheckCircle, Search } from 'lucide-react';

export default function TailorDashboard() {
  const { user } = useAuthStore();
  const [ticketNumber, setTicketNumber] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [tickets, setTickets] = useState<any[]>([]);

  const fetchTickets = async () => {
    const res = await fetch('/api/tickets');
    const data = await res.json();
    if (data.success) {
      setTickets(data.tickets.filter((t: any) => t.tailor_id === user?.tailor_id));
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    
    try {
      const res = await fetch('/api/tickets/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_number: ticketNumber, tailor_id: user?.tailor_id }),
      });
      
      const data = await res.json();
      if (data.success) {
        setMessage({ text: '체척권이 성공적으로 등록되었습니다.', type: 'success' });
        setTicketNumber('');
        fetchTickets();
      } else {
        setMessage({ text: data.error || '등록 실패', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: '서버 오류', type: 'error' });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">체척업체 대시보드</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">등록 체척권 수</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{tickets.length}건</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Scissors className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">당월 정산 예정액</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {(tickets.length * 250000).toLocaleString()}원
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">체척권 등록</h3>
          <form onSubmit={handleRegister} className="mt-2 flex sm:flex-row flex-col items-center gap-3">
            <div className="relative flex-grow max-w-md w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                required
                value={ticketNumber}
                onChange={(e) => setTicketNumber(e.target.value)}
                className="focus:ring-[#1D4ED8] focus:border-[#1D4ED8] block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                placeholder="TKT-YYYYMMDD-XXXXX"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-[#1D4ED8] hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1D4ED8] sm:text-sm"
            >
              조회 및 등록
            </button>
          </form>
          {message.text && (
            <div className={`mt-3 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">등록 체척권 현황</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">체척권 번호</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">등록일시</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.ticket_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      등록완료
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ticket.registered_at).toLocaleString()}</td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">등록된 체척권이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
