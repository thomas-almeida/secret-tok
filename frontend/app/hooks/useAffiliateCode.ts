import { useEffect } from 'react'

export const useAffiliateCode = () => {
    useEffect(() => {
        // Verificar se estamos no cliente
        if (typeof window === 'undefined') return

        // Pegar os parâmetros da URL
        const searchParams = new URLSearchParams(window.location.search)
        const refCode = searchParams.get('ref')

        // Se houver o parâmetro ref, guardar em localStorage
        if (refCode) {
            console.log('Código de afiliado encontrado:', refCode)
            localStorage.setItem('afiliate-code', refCode)
        }
    }, [])
}
