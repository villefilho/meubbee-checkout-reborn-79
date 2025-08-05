import { CheckoutData, PIXResponse, BoletoResponse } from '@/types/checkout';

// Configurações da API do Pagar.me
const PAGARME_API_URL = 'https://api.pagar.me/core/v5';
const PAGARME_API_KEY = 'sk_test_5ad1ae64dc3648c7ad8711325a43db49'; // Substitua pela sua chave
const PAGARME_RECEBEDOR = 're_cmdjcsrtb00lh0l9tq1vi5uja';

export interface PagarmeTransactionRequest {
  amount: number;
  currency: string;
  payment: {
    payment_method: string;
    card?: {
      holder_name: string;
      number: string;
      exp_month: string;
      exp_year: string;
      cvv: string;
    };
    pix?: {
      expires_in?: number;
    };
    boleto?: {
      expires_in?: number;
      instructions?: string;
    };
  };
  customer: {
    name: string;
    email: string;
    document: string;
    phones: {
      mobile_phone: {
        country_code: string;
        area_code: string;
        number: string;
      };
    };
    address: {
      country: string;
      state: string;
      city: string;
      neighborhood: string;
      street: string;
      street_number: string;
      zipcode: string;
      complement?: string;
    };
  };
  metadata?: Record<string, any>;
}

export class PagarmeService {
  private static formatPhone(phone: string) {
    const numbers = phone.replace(/\D/g, '');
    return {
      country_code: '55',
      area_code: numbers.substring(0, 2),
      number: numbers.substring(2),
    };
  }

  private static formatDocument(document: string): string {
    return document.replace(/\D/g, '');
  }

  private static buildTransactionRequest(data: CheckoutData): PagarmeTransactionRequest {
    const phoneFormatted = this.formatPhone(data.buyer.phone);
    
    const request: PagarmeTransactionRequest = {
      amount: data.amount,
      currency: 'BRL',
      payment: {
        payment_method: data.paymentMethod,
      },
      customer: {
        name: data.buyer.name,
        email: data.buyer.email,
        document: this.formatDocument(data.buyer.document),
        phones: {
          mobile_phone: phoneFormatted,
        },
        address: {
          country: data.address.country,
          state: data.address.state,
          city: data.address.city,
          neighborhood: data.address.neighborhood,
          street: data.address.street,
          street_number: data.address.streetNumber,
          zipcode: data.address.zipcode.replace(/\D/g, ''),
          complement: data.address.complement,
        },
      },
      metadata: {
        description: data.description,
      },
    };

    // Adicionar dados específicos do método de pagamento
    switch (data.paymentMethod) {
      case 'credit_card':
        if (data.card) {
          request.payment.card = {
            holder_name: data.card.holderName,
            number: data.card.number.replace(/\s/g, ''),
            exp_month: data.card.expirationMonth,
            exp_year: data.card.expirationYear,
            cvv: data.card.cvv,
          };
        }
        break;
      
      case 'pix':
        request.payment.pix = {
          expires_in: 1800, // 30 minutos
        };
        break;
      
      case 'boleto':
        request.payment.boleto = {
          expires_in: 259200, // 3 dias
          instructions: 'Pagamento referente ao presente do chá de bebê',
        };
        break;
    }

    return request;
  }

  static async createTransaction(data: CheckoutData): Promise<any> {
    try {
      const requestData = this.buildTransactionRequest(data);
      
      const response = await fetch(`${PAGARME_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(PAGARME_API_KEY + ':')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro na API: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      throw error;
    }
  }

  static async getTransactionStatus(transactionId: string): Promise<any> {
    try {
      const response = await fetch(`${PAGARME_API_URL}/orders/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(PAGARME_API_KEY + ':')}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao consultar status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao consultar status:', error);
      throw error;
    }
  }

  // Método para processar resposta específica do PIX
  static processPIXResponse(transactionResponse: any): PIXResponse {
    const charges = transactionResponse.charges;
    const pixCharge = charges.find((charge: any) => charge.payment_method === 'pix');
    
    if (pixCharge && pixCharge.last_transaction) {
      return {
        qrCode: pixCharge.last_transaction.qr_code,
        qrCodeUrl: pixCharge.last_transaction.qr_code_url,
        expiresAt: pixCharge.last_transaction.expires_at,
      };
    }
    
    throw new Error('Dados do PIX não encontrados na resposta');
  }

  // Método para processar resposta específica do Boleto
  static processBoletoResponse(transactionResponse: any): BoletoResponse {
    const charges = transactionResponse.charges;
    const boletoCharge = charges.find((charge: any) => charge.payment_method === 'boleto');
    
    if (boletoCharge && boletoCharge.last_transaction) {
      return {
        boletoUrl: boletoCharge.last_transaction.pdf,
        boletoBarcode: boletoCharge.last_transaction.barcode,
        expiresAt: boletoCharge.last_transaction.expires_at,
      };
    }
    
    throw new Error('Dados do Boleto não encontrados na resposta');
  }
}

/*
EXEMPLO DE USO:

import { PagarmeService } from '@/services/pagarme';

// Para criar uma transação
try {
  const result = await PagarmeService.createTransaction(checkoutData);
  
  if (checkoutData.paymentMethod === 'pix') {
    const pixData = PagarmeService.processPIXResponse(result);
    // Mostrar QR Code e código PIX
  } else if (checkoutData.paymentMethod === 'boleto') {
    const boletoData = PagarmeService.processBoletoResponse(result);
    // Mostrar link do boleto e código de barras
  } else {
    // Cartão de crédito - verificar status
    console.log('Status da transação:', result.status);
  }
} catch (error) {
  console.error('Erro no pagamento:', error);
}

NOTAS IMPORTANTES:

1. Substitua PAGARME_API_KEY pela sua chave real da API
2. Esta implementação é um exemplo - ajuste conforme a documentação atual
3. Para produção, implemente tratamento de erros mais robusto
4. Considere usar webhooks para atualizações de status em tempo real
5. Validações de CPF e outros dados devem ser feitas tanto no frontend quanto backend
6. Para cartão de crédito, considere usar tokenização para maior segurança

DOCUMENTAÇÃO OFICIAL:
https://docs.pagar.me/reference/criar-pedido
*/