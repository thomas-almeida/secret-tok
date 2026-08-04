export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    id: 'monthly',
    name: 'Rapidinhas Mensal',
    amount: 2497,
    description: 'O melhor do mundo HOT na palma da sua mão, acesso a melhores modelos da cena a qualquer momento do dia!',
    features: [
      '✅ Assista "Espiar" sem limtes',
      '✅ Acesso a Aba "Famosas"'
    ]
  },
  LIFETIME: {
    id: 'lifetime',
    name: 'Rapidinhas Vitalício',
    amount: 4700,
    description: 'O melhor do mundo HOT na palma da sua mão PRA SEMPRE na plataforma!, acesso a melhores modelos da cena a qualquer momento do dia!',
    features: [
      '✅ Download de qualquer vídeo',
      '✅ Assista "Espiar" sem limtes',
      '✅ Acesso a Aba "Famosas"',
      '✅ Acesso a modelos Exclusivas"'
    ]
  }
};

export const CLOSE_FRIENDS_ORDER_BUMP = {
  id: 'close_friends',
  name: 'Close Friends',
  amount: 999,
  description: 'Acesso vitalício aos close friends de todas as modelos'
};

export const getPlanById = (planId) => {
  return Object.values(SUBSCRIPTION_PLANS).find(plan => plan.id === planId);
};

export const getAllPlans = () => {
  return Object.values(SUBSCRIPTION_PLANS);
};