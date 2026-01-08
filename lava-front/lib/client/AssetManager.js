class AssetManager {
    constructor() {
        this.cache = {};
        this.downloadQueue = [];
        this.successCount = 0;
        this.errorCount = 0;
    }

    queueDownload(path) {
        this.downloadQueue.push(path);
    }

    isDone() {
        return this.downloadQueue.length === this.successCount + this.errorCount;
    }

    getAsset(path) {
        return this.cache[path];
    }

    downloadAll(downloadCallback) {
        if (typeof window === "undefined") return; // SSR check

        if (this.downloadQueue.length === 0) {
            downloadCallback();
            return;
        }

        this.downloadQueue.forEach((originalPath) => {
            // Fix path for Next.js (ensure absolute path from public)
            const path = originalPath.startsWith('/') ? originalPath : '/' + originalPath;

            const img = new Image();
            img.addEventListener("load", () => {
                if (img.naturalWidth === 0) {
                    this.errorCount++;
                    console.error("Error loading (broken data) " + path);
                } else {
                    this.successCount++;
                }

                if (this.isDone()) {
                    downloadCallback();
                }
            });
            img.addEventListener("error", () => {
                this.errorCount++;
                console.error("Error loading " + path);
                if (this.isDone()) {
                    downloadCallback();
                }
            });
            img.src = path;
            // Cache by original path too so getAsset works
            this.cache[originalPath] = img;
            this.cache[path] = img;
        });
    }
}

module.exports = new AssetManager();
