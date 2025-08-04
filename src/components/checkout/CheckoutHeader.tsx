import { Heart, Shield, Lock } from 'lucide-react';

export const CheckoutHeader = () => {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-4">
        <Heart className="w-5 h-5 text-primary fill-current" />
        <span className="text-sm font-medium text-primary">meubbee</span>
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
        Finalizar Compra
      </h1>
      
      <p className="text-muted-foreground mb-6">
        Complete seus dados para receber seu presente especial
      </p>
      
      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-soft" />
          <span>Compra Segura</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-green-soft" />
          <span>Dados Protegidos</span>
        </div>
      </div>
    </div>
  );
};