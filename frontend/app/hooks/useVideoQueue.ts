import { useEffect, useState } from "react";
import { getModels } from "../services/model-service";
import { Model } from "../stores/model-store";

const getJunkieQueue = (models: Model[]): Model | undefined => {
    return models.find((model: Model) => model._id === '697c4d124eb7932262b7dc68');
};

const getPremiumModels = (models: Model[]): Model[] => {

    let premiumModels: Model[] = []

    models.forEach((model: Model) => {
        if (model._id !== '69892c371760043886588f42') {
            premiumModels.push(model)
        }
    })

    return premiumModels
}

export const useVideoQueue = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [junkieModel, setJunkieModel] = useState<Model | null>(null)
    const [premiumModels, setPremiumModels] = useState<Model[] | null>(null)

    useEffect(() => {
        const loadVideos = async () => {
            try {
                setLoading(true);
                const res = await getModels();

                const junkieModel = getJunkieQueue(res?.models)
                if (junkieModel) setJunkieModel(junkieModel)

                const premiumModelArr = getPremiumModels(res?.models)
                if (premiumModelArr) setPremiumModels(premiumModelArr)

            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load videos");
            } finally {
                setLoading(false);
            }
        };

        loadVideos();
    }, []);

    return { junkieModel, premiumModels, loading, error };
};
