export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    id: 'RAPIDINHAS_MENSAL',
    name: 'Rapidinhas Mensal',
    amount: 3299,
    description: 'O melhor do mundo HOT na palma da sua mão, acesso a melhores modelos da cena a qualquer momento do dia!',
    features: [
      'Download de qualquer vídeo',
      'Assista "Espiar" sem limtes',
      'Acesso a Aba "Famosas"'
    ]
  },
  LIFETIME: {
    id: 'RAPIDINHAS_VITALICIO',
    name: 'Rapidinhas Vitalício',
    amount: 4999,
    description: 'O melhor do mundo HOT na palma da sua mão PRA SEMPRE na plataforma!, acesso a melhores modelos da cena a qualquer momento do dia!',
    features: [
      'Download de qualquer vídeo',
      'Assista "Espiar" sem limtes',
      'Acesso a Aba "Famosas"',
      'Mentoria na cena do mundo HOT"'
    ]
  }
};

export const getPlanById = (planId) => {
  return Object.values(SUBSCRIPTION_PLANS).find(plan => plan.id === planId);
};

export const getAllPlans = () => {
  return Object.values(SUBSCRIPTION_PLANS);
};