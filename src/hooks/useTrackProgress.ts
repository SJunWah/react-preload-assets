import { useEffect, useState } from "react";

interface TrackProgressParamsInterface {
  onBeforeResourcesLoaded?: () => void | Promise<void>;
  onAllResourcesLoaded?: () => void | Promise<void>;
  isLoadAssets: {
    isLoadMusic?: boolean;
    isLoadVideo?: boolean;
    isLoadImage?: boolean;
  };
}

interface ProgressState {
  progress: number;
  currentResource?: number;
  totalResources?: number;
  currentResourceName?: string;
}

interface JsonDataInterface {
  nm: string;
  url: string;
  ext: string;
  ft: string;
}

export function useTrackProgress({
  onBeforeResourcesLoaded,
  onAllResourcesLoaded,
  isLoadAssets = {
    isLoadMusic: true,
    isLoadVideo: true,
    isLoadImage: true,
  },
}: TrackProgressParamsInterface): ProgressState {

  const [progressState, setProgressState] = useState<ProgressState>({
    progress: 0,
    currentResource: 0,
    totalResources: 0,
    currentResourceName: '',
  }); const [jsonData, setJsonData] = useState<JsonDataInterface[]>(null);

  useEffect(() => {
    const path = `${window.location.origin}/assetsList.json?v=${Date.now()}`;
    if (!path) return;
    fetch(path)
      .then((response) => response.json())
      .then((data) => setJsonData(data))
      .catch((error) => console.error("Error loading JSON:", error));

    return () => {
      setJsonData(null);
    };
  }, []);

  // Add a listener to check if all resources are loaded and update the progress bar
  useEffect(() => {
    let loadedAssets = 0;

    const assetsList = jsonData;
    const updateProgress = (currentResourceName: string) => {
      loadedAssets++;
      setProgressState(prev => ({
        ...prev,
        progress: Math.round((loadedAssets / assetsList.length) * 100),
        currentResource: loadedAssets,
        currentResourceName
      }));
    };
    const preloadAssets = async () => {
      try {
        onBeforeResourcesLoaded && onBeforeResourcesLoaded();

        const promises = assetsList.map(
          (asset: { nm: string; url: string; ext: string; ft: string }) => {
            return new Promise((resolve, reject) => {
              if (asset.ft === "video") {
                if (!isLoadAssets.isLoadVideo) {
                  updateProgress(asset.nm);
                  resolve(asset);
                }
                const video = document.createElement("video");
                video.onloadeddata = () => {
                  updateProgress(asset.nm);

                  resolve(asset);
                };
                video.onerror = () => {
                  reject(`Failed to load video: ${asset.url}`);
                };
                video.src = asset.url;
              } else if (asset.ft === "audio") {
                if (!isLoadAssets.isLoadMusic) {
                  updateProgress(asset.nm);

                  resolve(asset);
                }
                const audio = new Audio();
                audio.onloadeddata = () => {
                  updateProgress(asset.nm);

                  resolve(asset);
                };
                audio.onerror = () => {
                  reject(`Failed to load audio: ${asset.url}`);
                };
                audio.src = asset.url;
              } else if (asset.ft === "image") {
                if (!isLoadAssets.isLoadImage) {
                  updateProgress(asset.nm);

                  resolve(asset);
                }
                const img = new Image();
                img.onload = () => {
                  updateProgress(asset.nm);

                  resolve(asset);
                };
                img.onerror = () => {
                  reject(`Failed to load image: ${asset.url}`);
                };
                img.src = asset.url;
              }
            });
          }
        );
        await Promise.all(promises);
        setProgressState(prev => ({ ...prev, progress: 100 }));
        if (onAllResourcesLoaded) onAllResourcesLoaded();
      } catch (error) {
        console.error("Error preloading images:", error);
      }
    };

    if (
      jsonData &&
      assetsList &&
      Array.isArray(assetsList) &&
      assetsList.length > 0
    )
      preloadAssets();

    return () => {
      loadedAssets = 0;
      setProgressState({
        progress: 0,
        currentResource: 0,
        totalResources: 0,
        currentResourceName: '',
      });
    };
  }, [jsonData]);

  return {
    progress: progressState.progress,
    currentResource: progressState.currentResource,
    totalResources: jsonData?.length,
    currentResourceName: progressState.currentResourceName,
  };
}
