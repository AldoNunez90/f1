import crypto from 'crypto';
import { load } from 'cheerio';
import connectDB from '@/lib/db/connection';
import FiaDocument from '@/lib/models/FiaDocument';
import { translateToSpanish } from '@/lib/services/translateService';

export interface FiaSourceDocument {
  url: string;
  title: string;
  source?: string;
}

export interface FiaDocumentSummary {
  url: string;
  title: string;
  summary: string;
  spanishSummary: string;
  fullText?: string;
  textExcerpt?: string;
  pageCount?: number;
  publishedAt?: string;
  lastFetched: string;
  checksum: string;
  etag?: string;
  lastModified?: string;
  metadata?: Record<string, unknown>;
}

// Estructuras de tipos para emular el retorno de pdf-parse sin usar explicit-any
interface PdfParseResult {
  text: string;
  numpages: number;
  info: Record<string, unknown>;
}

type PdfParseFunction = (buffer: Buffer, options?: Record<string, unknown>) => Promise<PdfParseResult>;

interface TextContentItem {
  str: string;
}

interface TextContent {
  items: TextContentItem[];
}

interface PageData {
  getTextContent: () => Promise<TextContent>;
}

// Estructura para tipar los documentos devueltos por Mongoose de forma segura
interface IFiaDocument {
  url: string;
  title: string;
  source: string;
  summary: string;
  spanishSummary: string;
  fullText?: string;
  textExcerpt?: string;
  pageCount?: number;
  publishedAt: Date;
  lastFetched: Date;
  checksum: string;
  etag?: string;
  lastModified?: Date;
  metadata?: Record<string, unknown>;
  removed: boolean;
}

const PDF_SOURCES: FiaSourceDocument[] = [
  {
    url: 'https://www.fia.com/documents/championships/fia-formula-one-world-championship-14/season/season-2026-2072',
    title: 'Index de documentos F1 (FIA) - 2026',
    source: 'FIA',
  },
];

interface PdfFetchResult {
  buffer: Buffer;
  etag?: string;
  lastModified?: string;
}

async function fetchPdf(url: string): Promise<PdfFetchResult> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/pdf',
    },
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch PDF from ${url}: ${response.status} ${response.statusText}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return {
    buffer,
    etag: response.headers.get('etag') ?? undefined,
    lastModified: response.headers.get('last-modified') ?? undefined,
  };
}

function computeChecksum(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function extractRelevantText(text: string): string {
  const cleaned = text
    .replace(/\s+/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .trim();

  const short = cleaned.split(' ').join(' ');
  return short;
}

function normalizeText(text: string): string {
  return text
    .replace(/\r\n|\r|\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildDocumentTextFromRaw(text: string): string {
  const normalized = normalizeText(text);

  if (!normalized) {
    return 'No se pudo extraer texto del PDF.';
  }

  return normalized
    .replace(/([.?!])\s+(?=[A-ZÁÉÍÓÚÑ])/g, '$1\n\n')
    .trim();
}

export async function parseFiaPdf(url: string, title: string) {
  const { buffer, etag, lastModified } = await fetchPdf(url);
  const checksum = computeChecksum(buffer);

  await connectDB();

  const existing = await FiaDocument.findOne({ url });
  if (existing && existing.checksum === checksum && existing.etag === etag && existing.lastModified === lastModified) {
    return existing;
  }

  const pdfParseModule = await import('pdf-parse-fork');  

  let pdfParse: PdfParseFunction | null = null;
  
  if (typeof pdfParseModule === 'function') {
    pdfParse = pdfParseModule as unknown as PdfParseFunction;
  } else if (pdfParseModule.default && typeof pdfParseModule.default === 'function') {
    pdfParse = pdfParseModule.default as unknown as PdfParseFunction;
  } else {
    const keys = Object.keys(pdfParseModule);
    for (const key of keys) {
      const target = (pdfParseModule as Record<string, unknown>)[key];
      if (typeof target === 'function') {
        pdfParse = target as unknown as PdfParseFunction;
        break;
      }
    }
  }

  if (!pdfParse) {
    try {
      const fallback = (pdfParseModule as Record<string, unknown>).pdfParse || pdfParseModule;
      pdfParse = fallback as unknown as PdfParseFunction;
    } catch {
      throw new Error('Could not resolve pdf-parse as a valid function within module keys.');
    }
  }

  
  const options = {
    pagerender: function(pageData: PageData): Promise<string> {
      return pageData.getTextContent()
        .then(function(textContent: TextContent) {
          return textContent.items.map((item: TextContentItem) => item.str).join(' ');
        });
    }
  };

  const data = await pdfParse(buffer, options);
  
  const rawText = data.text || '';
  const pageCount = data.numpages;
  const fullText = buildDocumentTextFromRaw(rawText);
  const textExcerpt = extractRelevantText(fullText);
  const summary = fullText;

  let spanishSummary = '';
  try {
    spanishSummary = await translateToSpanish(summary);
  } catch (translateErr) {
    console.error(`[FIA-SYNC] Error en el servicio de traducción. Usando sumario original en inglés como fallback.`, translateErr);
    spanishSummary = summary;
  }


  const publishedAt = lastModified ? new Date(lastModified) : new Date();
  const summaryData = {
    url,
    title,
    source: 'FIA',
    summary,
    spanishSummary,
    fullText,
    textExcerpt,
    pageCount,
    publishedAt,
    lastFetched: new Date(),
    checksum,
    etag,
    lastModified,
    metadata: {
      size: buffer.length,
      rawTextLength: rawText.length,
      pdfInfo: data.info,
    },
    removed: false,
  };

  const updated = await FiaDocument.findOneAndUpdate(
    { url },
    summaryData,
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return updated;
}

export async function syncFiaDocuments() {
  const documents: unknown[] = [];
  await connectDB();

  for (const source of PDF_SOURCES) {
    try {
      const resp = await fetch(source.url);
      if (!resp.ok) {
        console.warn(`Unable to fetch source index ${source.url}: ${resp.status}`);
        continue;
      }

      const contentType = resp.headers.get('content-type') ?? '';

      if (contentType.includes('text/html')) {
        const html = await resp.text();
        const links = discoverPdfLinksFromHtml(html, source.url);

        for (const link of links) {
          try {
            const existing = await FiaDocument.findOne({ url: link.url });
            if (existing) {
              documents.push(existing);
              continue;
            }

            const doc = await parseFiaPdf(link.url, link.title ?? source.title);
            documents.push(doc);
          } catch (pdfErr) {
            console.error(`Failed to parse discovered PDF ${link.url}:`, pdfErr);
          }
        }
      } else if (contentType.includes('application/pdf')) {
        const document = await parseFiaPdf(source.url, source.title);
        documents.push(document);
      } else {
        try {
          const document = await parseFiaPdf(source.url, source.title);
          documents.push(document);
        } catch (err) {
          console.warn(`Skipped source ${source.url} (unknown content-type: ${contentType}), error:`, err);
        }
      }
    } catch (error) {
      console.error(`Failed to sync FIA source ${source.url}:`, error);
    }
  }
  return documents;
}

function discoverPdfLinksFromHtml(html: string, baseUrl: string): { url: string; title?: string }[] {
  try {
    const $ = load(html);
    const anchors = $('a');
    const found = new Map<string, string>();

    anchors.each((_, el) => {
      const href = $(el).attr('href');
      if (!href) return;
      const hrefLower = href.toLowerCase();
      if (!hrefLower.endsWith('.pdf')) return;

      try {
        const absolute = new URL(href, baseUrl).toString();
        const title = ($(el).text() || '').trim() || undefined;
        if (!found.has(absolute)) {
          found.set(absolute, title ?? 'Documento FIA');
        }
      } catch (e) {
        console.warn(`Invalid URL found in HTML: ${e}`);
      }
    });

    return Array.from(found.entries()).map(([url, title]) => ({ url, title }));
  } catch (e) {
    console.error('Error discovering PDF links from HTML:', e);
    return [];
  }
}

export interface FiaDocumentSummariesResponse {
  documents: FiaDocumentSummary[];
  total: number;
}

export async function fetchFiaDocumentSummaries(
  options: { limit?: number; skip?: number } = {},
): Promise<FiaDocumentSummariesResponse> {
  await syncFiaDocuments();
  await connectDB();

  const limit = options.limit ?? 10;
  const skip = options.skip ?? 0;

  const [docs, total] = await Promise.all([
    FiaDocument.find({ removed: false })
      .sort({ publishedAt: 1, lastFetched: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    FiaDocument.countDocuments({ removed: false }),
  ]);

  return {
    documents: (docs as unknown as IFiaDocument[]).map((doc) => ({
      url: doc.url,
      title: doc.title,
      summary: doc.summary,
      spanishSummary: doc.spanishSummary,
      fullText: doc.fullText ?? doc.summary,
      pageCount: doc.pageCount,
      lastFetched: doc.lastFetched.toISOString(),
      publishedAt: doc.publishedAt?.toISOString(),
      lastModified: doc.lastModified?.toISOString(),
      checksum: doc.checksum,
    })),
    total,
  };
}