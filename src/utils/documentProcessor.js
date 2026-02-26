import * as pdfjsLib from 'pdfjs-dist';

// Map worker to the CDN (easiest for browser-only demos)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export const extractTextFromFile = async (file) => {
    if (file.type === 'text/plain') {
        return await file.text();
    } else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += `[Page ${i}] ${pageText}\n\n`;
        }
        return fullText;
    }
    return '';
};

export const chunkText = (text, fileName, chunkSize = 800) => {
    const chunks = [];
    let index = 0;

    // Simple chunking by approximate character count, respecting sentence boundaries if possible
    const sentences = text.split(/(?<=[.!?])\s+/);
    let currentChunk = '';

    for (const sentence of sentences) {
        if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
            chunks.push({
                id: `${fileName}-${index}`,
                content: currentChunk.trim(),
                source: fileName,
                offset: index
            });
            currentChunk = sentence;
            index++;
        } else {
            currentChunk += ' ' + sentence;
        }
    }

    if (currentChunk.trim().length > 0) {
        chunks.push({
            id: `${fileName}-${index}`,
            content: currentChunk.trim(),
            source: fileName,
            offset: index
        });
    }

    return chunks;
};
