export interface Testimonial {
    id: number;
    name: string;
    username: string;
    earnings: string;
    avatar: string;
    comment: string;
    date: string;
}

export const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "Carlos M.",
        username: "@carlos_market",
        earnings: "R$ 320,00 em 4 dias",
        avatar: "https://i.pravatar.cc/150?img=11",
        comment: "Levei menos de uma semana e já tirei meu primeiro lucro. O sistema de link automático é brutal, não preciso mais ficar mandando arquivos manualmente.",
        date: "2 dias atrás"
    },
    {
        id: 2,
        name: "FF do Hot.",
        username: "@rafael_afiliado",
        earnings: "R$ 2.400 em 1 mês",
        avatar: "https://i.pravatar.cc/150?img=12",
        comment: "Vim pelo The Hideout Hot e mudou minha visão de mercado HOT. Plataforma pronta, conteúdo variedade, só focar no tráfego.",
        date: "1 semana atrás"
    },
    {
        id: 3,
        name: "Diego R.",
        username: "@diego_hots",
        earnings: "R$ 780 em 1 semana",
        avatar: "https://i.pravatar.cc/150?img=33",
        comment: "Proposta clara, sem enrolação. Suporte funciona e gateway não cai, vai sem medo.",
        date: "3 dias atrás"
    },
    {
        id: 4,
        name: "Lucas A.",
        username: "@lucas_ofc",
        earnings: "R$ 400 em 36 horas",
        avatar: "https://i.pravatar.cc/150?img=15",
        comment: "To fazendo como secundário e ta rendendo demais.",
        date: "5 dias atrás"
    },
    {
        id: 5,
        name: "O Mágico.",
        username: "@bruno_kreison",
        earnings: "R$ 3.200 em 1 mês",
        avatar: "https://i.pravatar.cc/150?img=17",
        comment: "Pra começar no HOT rápido e validar é a melhor, não configurei nada e só foquei no tráfego",
        date: "1 dia atrás"
    },
    {
        id: 7,
        name: "Thiago J.",
        username: "@thiago_junior",
        earnings: "R$ 5.500 em 1 mês",
        avatar: "https://i.pravatar.cc/150?img=23",
        comment: "Mais fácil que isso, impossível. Mando o link, o cara assina, o dinheiro cai. Sem dor de cabeça.",
        date: "6 dias atrás"
    },
    {
        id: 8,
        name: "Gabriel L.",
        username: "@gab_lucas",
        earnings: "R$ 7.890 em 1 mês",
        avatar: "https://i.pravatar.cc/150?img=25",
        comment: "Confiável, prático e com um suporte que realmente ajuda. Já recomendei pros meus mentorados",
        date: "1 semana atrás"
    }
];
