import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store';
import { ShoppingCart, Check, AlertCircle } from 'lucide-react';

export default function UserShop() {
  const { user } = useAuthStore();
  const [points, setPoints] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'finished' | 'custom'>('finished');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (user) {
      fetch(`/api/points/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setPoints(data.points);
        });

      fetch('/api/products')
        .then(res => res.json())
        .then(data => {
          if (data.success) setProducts(data.products);
        });
    }
  }, [user]);

  const availablePoints = points ? points.total_points - points.used_points - points.reserved_points : 0;

  const handlePurchase = async (product: any) => {
    if (availablePoints < product.price) {
      setMessage({ text: '가용 포인트가 부족합니다.', type: 'error' });
      return;
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id,
          store_id: 's1', // Default store for prototype
          order_type: 'online',
          product_type: product.product_type,
          total_amount: product.price,
          items: [{ product_id: product.id, quantity: 1 }]
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ text: `주문이 완료되었습니다. (주문번호: ${data.order_number})`, type: 'success' });
        // Refresh points
        fetch(`/api/points/${user?.id}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) setPoints(data.points);
          });
      } else {
        setMessage({ text: data.error || '주문 실패', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: '서버 오류', type: 'error' });
    }
  };

  const filteredProducts = products.filter(p => p.product_type === activeTab);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">피복 쇼핑몰</h1>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 flex items-center">
          <span className="text-sm text-gray-500 mr-2">가용 포인트:</span>
          <span className="text-lg font-bold text-[#1D4ED8]">{availablePoints.toLocaleString()}원</span>
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'} flex items-center`}>
          {message.type === 'success' ? <Check className="h-5 w-5 mr-2" /> : <AlertCircle className="h-5 w-5 mr-2" />}
          {message.text}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('finished')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'finished'
                  ? 'border-[#1D4ED8] text-[#1D4ED8]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              완제품
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                activeTab === 'custom'
                  ? 'border-[#1D4ED8] text-[#1D4ED8]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              맞춤피복
            </button>
          </nav>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-w-3 aspect-h-2 bg-gray-200">
                  <img src={product.image_url} alt={product.name} className="object-cover w-full h-48" referrerPolicy="no-referrer" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{product.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">{product.price.toLocaleString()}원</span>
                    <button
                      onClick={() => handlePurchase(product)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-[#1D4ED8] hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1D4ED8]"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      구매하기
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500">
                등록된 상품이 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
