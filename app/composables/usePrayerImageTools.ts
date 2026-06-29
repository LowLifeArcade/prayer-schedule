let workerPromise: Promise<any> | null = null;

async function getOcrWorker() {
    if (!import.meta.client) {
        throw new Error('Image text import is only available in the browser.');
    }

    if (!workerPromise) {
        workerPromise = import('tesseract.js').then(({ createWorker }) => createWorker('eng'));
    }

    return workerPromise;
}

function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = src;
    });
}

async function fileToDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => reject(reader.error || new Error('Could not read this image.'));
        reader.readAsDataURL(file);
    });
}

async function compressImageDataUrl(file: File) {
    const dataUrl = await fileToDataUrl(file);
    const image = await loadImage(dataUrl);
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = width;
    canvas.height = height;
    context?.drawImage(image, 0, 0, width, height);

    return canvas.toDataURL('image/jpeg', 0.82);
}

export function usePrayerImageTools() {
    const ocrStatus = useState('prayer-image-ocr-status', () => '');

    async function imageFileToDataUrl(file: File) {
        if (!file.type.startsWith('image/')) {
            throw new Error('Please choose an image file.');
        }

        return compressImageDataUrl(file);
    }

    async function imageFileToText(file: File) {
        if (!file.type.startsWith('image/')) {
            throw new Error('Please choose an image file.');
        }

        ocrStatus.value = 'Reading image text...';
        if (import.meta.dev && window.__PRAYER_TEST_OCR_TEXT__) {
            const text = window.__PRAYER_TEST_OCR_TEXT__;
            ocrStatus.value = '';
            return text;
        }
        const worker = await getOcrWorker();
        const result = await worker.recognize(file);
        const text = result.data.text
            .replace(/[ \t]+\n/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        ocrStatus.value = '';

        if (!text) {
            throw new Error('No readable text was found in that image.');
        }

        return text;
    }

    function clearOcrStatus() {
        ocrStatus.value = '';
    }

    return {
        ocrStatus,
        clearOcrStatus,
        imageFileToDataUrl,
        imageFileToText,
    };
}
