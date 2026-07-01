import { XMLParser } from 'fast-xml-parser';

export interface VideoChannel {
  id: string;
  name: string;
  rssUrl: string;
}

export interface VideoItem {
  channelId: string;
  channelName: string;
  title: string;
  link: string;
  published?: string;
  description?: string;
  thumbnail?: string;
}

export const videoChannels: VideoChannel[] = [
    {
      id: 'aloquevinimos',
      name: 'A lo que vinimos',
      rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC3AO_a1en2eP7Tz405e9Daw',
    },
  {
    id: 'florAndersen',
    name: 'Flor Andersen',
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCH2uku0woZGQ6IRtGIowDSA',
  },
  {
    id: 'albertfabrega',
    name: 'Albert Fabrega',
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCklUGqDiqiIak4PWh-qbhxQ',
  },
  {
    id: 'slicerF1',
    name: 'Slicer F1',
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC-SbQFXrNl6n76_GO9IwrCg',
  },
  {
    id: 'davidPerogil',
    name: 'David Perogil',
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCbsCmBNSW6mf9DGW3g5VlNA',
  },
  {
    id: 'f1TV',
    name: 'F1 Oficial',
    rssUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCB_qr75-ydFVKSF9Dmo6izg',
  },
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: '#text',
  parseAttributeValue: false,
  trimValues: true,
  maxNestedTags: 1000,
});

export function parseYouTubeRss(xmlText: string, channel: VideoChannel): VideoItem[] {
  const json = parser.parse(xmlText);
  const entries = json?.feed?.entry ?? [];

  const items = Array.isArray(entries) ? entries : [entries];

  // Exclude YouTube Shorts: their feed links typically include '/shorts/'
  const filtered = items.filter((entry: any) => {
    const link =
      entry.link?.href ||
      entry.link?.['#text'] ||
      entry['media:group']?.['media:player']?.url ||
      '';

    return !String(link).includes('/shorts/');
  });

  return filtered
    .map((entry: any) => {
      const link =
        entry.link?.href ||
        entry.link?.['#text'] ||
        entry['media:group']?.['media:player']?.url ||
        '';

      const thumbnail =
        entry['media:group']?.['media:thumbnail']?.url ||
        entry['media:group']?.['media:thumbnail']?.['#text'] ||
        undefined;

      const description =
        entry['media:group']?.['media:description']?.['#text'] ||
        entry.summary?.['#text'] ||
        entry.summary ||
        undefined;

      return {
        channelId: channel.id,
        channelName: channel.name,
        title: entry.title?.['#text'] ?? entry.title ?? 'Video sin título',
        link,
        published: entry.published,
        description,
        thumbnail,
      };
    })
    .filter((item) => Boolean(item.link));
}

export async function fetchLatestVideoForChannel(
  channel: VideoChannel,
): Promise<VideoItem | null> {
  try {
    const response = await fetch(channel.rssUrl, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch video feed for ${channel.name}`);
    }

    const xmlText = await response.text();
    const videoItems = parseYouTubeRss(xmlText, channel);
    return videoItems[0] ?? null;
  } catch {
    return {
      channelId: channel.id,
      channelName: channel.name,
      title: 'No se pudo cargar el último video',
      link: channel.rssUrl,
      description: 'Revisa el feed del canal o actualiza la configuración de canales.',
    };
  }
}

export async function fetchLatestVideos(): Promise<VideoItem[]> {
  const items = await Promise.all(
    videoChannels.map(async (channel) => {
        const video = await fetchLatestVideoForChannel(channel);
      return (
        video ?? {
          channelId: channel.id,
          channelName: channel.name,
          title: 'No hay video disponible',
          link: channel.rssUrl,
        }
      );
    }),
  );

  return items;
}
