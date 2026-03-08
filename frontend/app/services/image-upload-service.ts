export const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('https://bananashop.onrender.com/api/upload-image', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Falha ao fazer upload da imagem');
        }

        const data = await response.json();
        return data.imageUrl;
    } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        throw error;
    }
};