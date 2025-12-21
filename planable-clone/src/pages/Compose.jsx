import { useState, useEffect } from 'react';
import {
  Image,
  Video,
  Smile,
  Link2,
  Calendar,
  Clock,
  Send,
  X,
  Check,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  ExternalLink,
  Loader2,
} from 'lucide-react';

const extractUrl = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches ? matches[0] : null;
};

const getMockLinkPreview = (url) => {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace('www.', '');
    
    const previews = {
      'shopee': {
        title: 'Shopee Malaysia | Free Shipping Across Malaysia',
        description: 'Shopee Malaysia is the leading online shopping platform in Malaysia.',
        image: 'https://cf.shopee.com.my/file/my-50009109-8c088b86e00a2cd10d73f60ef5f7f554',
        siteName: 'Shopee Malaysia',
      },
      'lazada': {
        title: 'Lazada Malaysia | Best Prices & Deals',
        description: 'Shop the best deals and discounts on Lazada Malaysia.',
        image: 'https://lzd-img-global.slatic.net/g/tps/imgextra/i4/O1CN01ElVXUn1PGvXJnlrbi_!!6000000001815-2-tps-250-250.png',
        siteName: 'Lazada',
      },
      'youtube': {
        title: 'YouTube Video',
        description: 'Watch this video on YouTube.',
        image: 'https://www.youtube.com/img/desktop/yt_1200.png',
        siteName: 'YouTube',
      },
      'facebook': {
        title: 'Facebook Post',
        description: 'See this post on Facebook.',
        image: 'https://static.xx.fbcdn.net/rsrc.php/y1/r/4lCu2zih0ca.svg',
        siteName: 'Facebook',
      },
    };

    for (const [key, preview] of Object.entries(previews)) {
      if (domain.includes(key)) {
        return { ...preview, url, domain };
      }
    }

    return {
      title: `Link from ${domain}`,
      description: url,
      image: null,
      siteName: domain,
      url,
      domain,
    };
  } catch {
    return null;
  }
};

const platforms = [
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
  { id: 'twitter', name: 'Twitter / X', icon: Twitter, color: '#000000' },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2' },
];

export default function Compose() {
  const [content, setContent] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['facebook']);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [linkPreview, setLinkPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    const url = extractUrl(content);
    if (url) {
      setLoadingPreview(true);
      const timer = setTimeout(() => {
        const preview = getMockLinkPreview(url);
        setLinkPreview(preview);
        setLoadingPreview(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setLinkPreview(null);
    }
  }, [content]);

  const togglePlatform = (platformId) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };

  const charLimits = {
    facebook: 63206,
    instagram: 2200,
    twitter: 280,
    linkedin: 3000,
  };

  const getMinCharLimit = () => {
    if (selectedPlatforms.length === 0) return Infinity;
    return Math.min(...selectedPlatforms.map((p) => charLimits[p]));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Composer */}
      <div className="space-y-4">
        {/* Platform Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Select Platforms
          </h3>
          <div className="flex flex-wrap gap-2">
            {platforms.map((platform) => {
              const isSelected = selectedPlatforms.includes(platform.id);
              return (
                <button
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: platform.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {platform.name}
                  </span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-purple-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Editor */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Write your post here..."
            className="w-full h-48 resize-none border-0 focus:ring-0 text-gray-900 placeholder-gray-400 text-sm"
          />
          
          {/* Character Count */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Image className="w-5 h-5 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Video className="w-5 h-5 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Smile className="w-5 h-5 text-gray-500" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Link2 className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <span
              className={`text-sm ${
                content.length > getMinCharLimit()
                  ? 'text-red-500'
                  : 'text-gray-500'
              }`}
            >
              {content.length} / {getMinCharLimit()}
            </span>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Schedule</h3>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Time</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button className="flex-1 py-2.5 px-4 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Save as Draft
          </button>
          <button className="flex-1 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-colors">
            <Send className="w-4 h-4" />
            Schedule Post
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700">Preview</h3>
        
        {selectedPlatforms.map((platformId) => {
          const platform = platforms.find((p) => p.id === platformId);
          return (
            <div
              key={platformId}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <div
                className="px-4 py-2 text-white text-sm font-medium flex items-center gap-2"
                style={{ backgroundColor: platform.color }}
              >
                <span
                  className="w-3 h-3 rounded-full bg-white/30"
                />
                {platform.name}
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-gray-900">
                        Your Page Name
                      </span>
                      <span className="text-xs text-gray-500">Just now</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                      {content || 'Your post preview will appear here...'}
                    </p>

                    {/* Link Preview Card */}
                    {loadingPreview && (
                      <div className="mt-3 border border-gray-200 rounded-lg p-4 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                        <span className="ml-2 text-sm text-gray-500">Loading preview...</span>
                      </div>
                    )}

                    {linkPreview && !loadingPreview && (
                      <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden hover:bg-gray-50 cursor-pointer">
                        {linkPreview.image && (
                          <div className="w-full h-40 bg-gray-100 relative">
                            <img
                              src={linkPreview.image}
                              alt={linkPreview.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                        {!linkPreview.image && (
                          <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <ExternalLink className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="p-3 bg-gray-50">
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            {linkPreview.siteName || linkPreview.domain}
                          </p>
                          <p className="text-sm font-semibold text-gray-900 mt-1 line-clamp-2">
                            {linkPreview.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {linkPreview.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {selectedPlatforms.length === 0 && (
          <div className="bg-gray-100 rounded-xl p-8 text-center">
            <p className="text-gray-500 text-sm">
              Select at least one platform to see the preview
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
