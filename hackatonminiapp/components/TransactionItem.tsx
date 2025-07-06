'use client';
export default function TransactionItem({ tx }: { tx: any }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex justify-between">
      <div>
        <h4 className="font-medium">{tx.description}</h4>
        <p className="text-sm text-gray-500">{tx.from} → {tx.to}</p>
      </div>
      <span className={`${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'} font-semibold`}>R$ {tx.amount.toFixed(2)}</span>
    </div>
  );
}