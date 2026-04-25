import * as pdfjsLib from 'pdfjs-dist';
// Vite-specific import to properly load the worker
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Load the PDF document
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  // Loop through each page and extract the text
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Join the text items with a space
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
      
    fullText += pageText + '\n\n';
  }

  return fullText.trim();
}