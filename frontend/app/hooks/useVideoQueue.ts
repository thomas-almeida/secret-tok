import { useEffect, useState, useCallback } from "react";
import { getModels } from "../services/model-service";
import { Model } from "../stores/model-store";

const CACHE_KEY = 'video_queue_cache';
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutos

interface CacheData {
    junkieModel: Model | null;
    premiumModels: Model[] | null;
    timestamp: number;
}

const getJunkieQueue = (models: Model[]): Model | undefined => {
    return models.find((model: Model) => model._id === '69892c371760043886588f42');
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

const getCache = (): CacheData | null => {
    if (typeof window === 'undefined') return null;
    
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    try {
        const data: CacheData = JSON.parse(cached);
        if (Date.now() - data.timestamp < CACHE_DURATION) {
            return data;
        }
    } catch (e) {
        console.error('Error parsing cache:', e);
    }
    return null;
};

const setCache = (junkieModel: Model | null, premiumModels: Model[] | null) => {
    if (typeof window === 'undefined') return;
    
    const data: CacheData = {
        junkieModel,
        premiumModels,
        timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
};

export const useVideoQueue = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [junkieModel, setJunkieModel] = useState<Model | null>(null)
    const [premiumModels, setPremiumModels] = useState<Model[] | null>(null)
    const [isRetrying, setIsRetrying] = useState(false);
    const [initialLoadComplete, setInitialLoadComplete] = useState(false);

    const loadVideos = useCallback(async (isRetry: boolean = false) => {
        try {
            if (isRetry) {
                setIsRetrying(true);
            }
            
            setLoading(true);
            const res = await getModels();

            const junkieModel = getJunkieQueue(res?.models)
            const premiumModelArr = getPremiumModels(res?.models)

            if (junkieModel) setJunkieModel(junkieModel)
            if (premiumModelArr) setPremiumModels(premiumModelArr)

            setCache(junkieModel || null, premiumModelArr || null);
            setInitialLoadComplete(true);
            setError(null);
        } catch (err) {
            const cached = getCache();
            if (cached) {
                console.log('Using cached data due to error');
                setJunkieModel(cached.junkieModel);
                setPremiumModels(cached.premiumModels);
                setInitialLoadComplete(true);
            } else {
                setError(err instanceof Error ? err.message : "Failed to load videos");
            }
        } finally {
            setLoading(false);
            setIsRetrying(false);
        }
    }, []);

    const retry = useCallback(() => {
        loadVideos(true);
    }, [loadVideos]);

    useEffect(() => {
        const cached = getCache();
        if (cached) {
            setJunkieModel(cached.junkieModel);
            setPremiumModels(cached.premiumModels);
            setInitialLoadComplete(true);
            setLoading(true);
        }

        loadVideos();
    }, [loadVideos]);

    return { 
        junkieModel, 
        premiumModels, 
        loading, 
        error,
        retry,
        isRetrying,
        initialLoadComplete
    };
};
