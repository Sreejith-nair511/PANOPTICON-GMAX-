'use client';

import { useState, useCallback } from 'react';
import { Search, Loader, Video, Image as ImageIcon, ExternalLink } from 'lucide-react';
import {
  searchForensicImages,
  searchForensicVideos,
  searchComprehensiveEvidence,
  type MediaSearchResult,
} from '@/lib/media-search';

interface MediaSearchPanelProps {
  onSelectMedia?: (media: MediaSearchResult) => void;
  initialQuery?: string;
}

export function MediaSearchPanel({
  onSelectMedia,
  initialQuery = 'crime scene evidence',
}: MediaSearchPanelProps) {
  const [query, setQuery] = useState(initialQuery);
  const [searchType, setSearchType] = useState<'all' | 'images' | 'videos'>('all');
  const [results, setResults] = useState<MediaSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaSearchResult | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      let searchResults: MediaSearchResult[] = [];

      if (searchType === 'all') {
        const { images, videos } = await searchComprehensiveEvidence(query);
        searchResults = [...images, ...videos];
      } else if (searchType === 'images') {
        searchResults = await searchForensicImages(query, 12);
      } else {
        searchResults = await searchForensicVideos(query, 8);
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  }, [query, searchType]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4 bg-var(--bg-surface) rounded-lg border border-var(--border)">
      {/* Search Bar */}
      <div className="space-y-3">
        <h3 className="font-semibold text-var(--text-primary)">Real Evidence Search</h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for evidence, scenes, or suspects..."
            className="flex-1 input-dark text-sm"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-var(--accent) hover:bg-var(--accent-bright) disabled:opacity-50 text-white rounded-md transition-colors flex items-center gap-2"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </div>

        {/* Search Type Filter */}
        <div className="flex gap-2">
          {(['all', 'images', 'videos'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSearchType(type)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                searchType === type
                  ? 'bg-var(--accent)/20 border border-var(--accent) text-var(--accent)'
                  : 'border border-var(--border) text-var(--text-secondary) hover:bg-var(--bg-overlay)'
              }`}
            >
              {type === 'all' && '📦 All'}
              {type === 'images' && '🖼️ Images'}
              {type === 'videos' && '🎬 Videos'}
            </button>
          ))}
        </div>
      </div>

      {/* Results Grid */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2">
              <Loader className="w-8 h-8 text-var(--accent) animate-spin" />
              <p className="text-sm text-var(--text-secondary)">Searching for evidence...</p>
            </div>
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <p className="text-var(--text-secondary) text-sm">
                {query ? 'No results found. Try a different search.' : 'Enter a search query to find evidence.'}
              </p>
            </div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 gap-3 auto-rows-max">
            {results.map((media) => (
              <div
                key={media.id}
                onClick={() => {
                  setSelectedMedia(media);
                  onSelectMedia?.(media);
                }}
                className={`relative group rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${
                  selectedMedia?.id === media.id
                    ? 'border-var(--accent) ring-2 ring-var(--accent)/50'
                    : 'border-var(--border) hover:border-var(--accent)/50'
                }`}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-var(--bg-overlay) overflow-hidden">
                  {media.thumbnailUrl && (
                    <img
                      src={media.thumbnailUrl}
                      alt={media.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                  {/* Type Badge */}
                  <div className="absolute top-2 right-2">
                    {media.type === 'video' ? (
                      <div className="flex items-center gap-1 px-2 py-1 bg-var(--danger)/80 rounded text-white text-xs font-medium">
                        <Video className="w-3 h-3" />
                        {media.duration}s
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 bg-var(--accent)/80 rounded text-white text-xs font-medium">
                        <ImageIcon className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Overlay Actions */}
                  <a
                    href={media.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 p-2 bg-var(--accent) rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Info */}
                <div className="p-2 bg-var(--bg-overlay)">
                  <p className="text-xs font-medium text-var(--text-primary) line-clamp-1">
                    {media.title}
                  </p>
                  <p className="text-2xs text-var(--text-dim)">{media.source}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      {selectedMedia && (
        <div className="p-3 border-t border-var(--border) space-y-2 bg-var(--bg-overlay) rounded">
          <p className="text-sm font-medium text-var(--text-primary)">{selectedMedia.title}</p>
          <p className="text-xs text-var(--text-secondary)">{selectedMedia.credit}</p>
          <a
            href={selectedMedia.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-var(--accent) hover:underline flex items-center gap-1"
          >
            View Full Resolution <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
}
