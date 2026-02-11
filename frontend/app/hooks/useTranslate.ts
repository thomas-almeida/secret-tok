const glossary = {
    'PAID': 'PAGO',
    'PENDING': 'PENDENTE',
    'FAILED': 'FALHOU',
    'CANCELED': 'CANCELADO',
    'REFUNDED': 'REEMBOLSADO',
    'CHARGEBACK': 'ESTORNO',
    'AWAITING_PAYMENT': 'AGUARDANDO PAGAMENTO',
    'IN_ANALYSIS': 'EM ANÁLISE',
    'AUTHORIZED': 'AUTORIZADO',
    'REVERSED': 'REVERSO',
}

export function useTranslate() {
    const translateStatus = (status: string) => {
        return glossary[status as keyof typeof glossary] || status;
    }

    return { translateStatus }
}