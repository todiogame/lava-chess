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
        if (this.downloadQueue.length === 0) {
            downloadCallback();
            return;
        }

        this.downloadQueue.forEach((path) => {
            const img = new Image();
            img.addEventListener("load", () => {
                this.successCount++;
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
            this.cache[path] = img;
        });
    }
}

module.exports = new AssetManager();
