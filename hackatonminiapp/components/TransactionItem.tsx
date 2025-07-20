'use client';

export default function TransactionItem({ tx }: { tx: any }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex justify-between">
      <div>
        <h4 className="font-medium">{tx.message_text}</h4>
        <p className="text-sm text-gray-400">Data: {new Date(tx.created_at).toLocaleDateString()}</p>
      </div>
      <span className={`${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'} font-semibold`}>
        R$ {tx.amount !== undefined ? tx.amount.toFixed(2) : '0.00'}
      </span>
    </div>
  );
}