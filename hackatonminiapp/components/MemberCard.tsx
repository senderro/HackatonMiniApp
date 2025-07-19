export default function MemberCard({ member, highlight }: { member: any; highlight?: boolean }) {
  return (
    <div className={`p-3 rounded-lg ${highlight ? 'bg-blue-50' : 'bg-white'} shadow`}>
      <h3 className="font-medium text-gray-800">{member.name}</h3>
      <p className={`${member.balance >= 0 ? 'text-green-600' : 'text-red-600'} font-semibold`}>
        R$ {member.balance !== undefined ? member.balance.toFixed(2) : '0.00'}
      </p>
    </div>
  );
}