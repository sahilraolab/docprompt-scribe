import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { FileText, ClipboardList, ShoppingCart, Receipt } from 'lucide-react';

export default function SupplierIndex() {
  const navigate = useNavigate();

  const cards = [
    {
      title: 'RFQs',
      desc: 'View open RFQs assigned to you',
      icon: ClipboardList,
      path: '/supplier/rfqs',
    },
    {
      title: 'Quotations',
      desc: 'Create & manage submitted quotations',
      icon: FileText,
      path: '/supplier/quotations',
    },
    {
      title: 'Purchase Orders',
      desc: 'View issued purchase orders',
      icon: ShoppingCart,
      path: '/supplier/pos',
    },
    {
      title: 'Bills & Payments',
      desc: 'Track bills and payment status',
      icon: Receipt,
      path: '/supplier/bills',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Supplier Portal</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <Card
            key={card.title}
            onClick={() => navigate(card.path)}
            className="p-6 cursor-pointer hover:shadow-md transition"
          >
            <card.icon className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-semibold">{card.title}</h3>
            <p className="text-sm text-muted-foreground">{card.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
