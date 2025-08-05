import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CartItem } from '@/types/checkout';
import { formatCurrency } from '@/utils/formatters';

interface CartSummaryProps {
  items: CartItem[];
  total: number;
}

export const CartSummary = ({ items, total }: CartSummaryProps) => {
  if (items.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Carrinho</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhum item no carrinho</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Resumo do Pedido</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
            <div className="flex-1">
              <h4 className="font-medium">{item.name}</h4>
              <p className="text-sm text-muted-foreground">
                Qtd: {item.quantity} × {formatCurrency(item.price)}
              </p>
            </div>
            <div className="font-medium">
              {formatCurrency(item.price * item.quantity)}
            </div>
          </div>
        ))}
        <div className="flex justify-between items-center pt-4 border-t font-bold text-lg">
          <span>Total:</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </CardContent>
    </Card>
  );
};