import React, { useState, useEffect } from 'react';
import { articleService } from '../services/api';
import {
  BookOpen,
  Calendar,
  User,
  Eye,
  Tag,
  Search,
  ArrowRight,
  Clock,
  Sparkles,
  Share2,
  Bookmark
} from 'lucide-react';

export const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [readingArticle, setReadingArticle] = useState(null);

  const categories = [
    'all',
    'Tumbuh Kembang',
    'Terapi Wicara',
    'Sensori Integrasi',
    'Okupasi Terapi',
    'Parenting Tips',
  ];

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }
      const res = await articleService.getAll(params);
      const list = res.data?.data || res.data || [];
      setArticles(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenArticle = async (article) => {
    setReadingArticle(article);
    try {
      // Trigger show endpoint to increment view counter
      const res = await articleService.getById(article.id);
      if (res.data?.data) {
        setReadingArticle(res.data.data);
      }
    } catch {
      // Fallback to local item
    }
  };

  const filteredArticles = articles.filter((art) => {
    const matchSearch =
      !search ||
      art.title?.toLowerCase().includes(search.toLowerCase()) ||
      art.excerpt?.toLowerCase().includes(search.toLowerCase()) ||
      art.content?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-teal-800 via-brand-700 to-indigo-900 text-white py-16 sm:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-teal-100 text-xs font-semibold mb-4 border border-white/20">
            <BookOpen className="w-3.5 h-3.5 text-teal-300" />
            Edukasi & Wawasan Terapi
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            Artikel Tumbuh Kembang & Panduan Orang Tua
          </h1>
          <p className="mt-4 text-base sm:text-lg text-teal-50 max-w-2xl mx-auto">
            Pelajari berbagai wawasan praktis, tips stimulasi motorik dan bahasa, serta panduan kesehatan psikologi anak langsung dari para praktisi ahli.
          </p>

          {/* Search bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari artikel seputar speech delay, sensori, tantrum..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-800 placeholder-slate-400 font-medium shadow-lg shadow-black/10 focus:outline-none focus:ring-4 focus:ring-white/30"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Category Pills */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-3 sm:p-4 mb-8 flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {cat === 'all' ? 'Semua Topik' : cat}
            </button>
          ))}
        </div>

        {/* Article Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-200 p-6 animate-pulse">
                <div className="h-40 bg-slate-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-3"></div>
                <div className="h-12 bg-slate-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
            <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">Belum Ada Artikel</h3>
            <p className="text-sm text-slate-500 mt-1">
              Tidak ada artikel yang sesuai dengan pencarian Anda saat ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <article
                key={article.id}
                onClick={() => handleOpenArticle(article)}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-brand-300 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                <div>
                  {/* Image or gradient header */}
                  {article.featured_image ? (
                    <div className="h-48 w-full overflow-hidden bg-slate-100">
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-tr from-brand-600/10 via-teal-500/10 to-indigo-500/10 flex items-center justify-center p-6 border-b border-slate-100">
                      <Sparkles className="w-8 h-8 text-brand-500 opacity-60" />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                      <span className="px-2.5 py-1 rounded-full font-semibold bg-brand-50 text-brand-700">
                        {article.category || 'Edukasi'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {article.published_at
                          ? new Date(article.published_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Terbaru'}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                      {article.title}
                    </h3>

                    <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {article.excerpt || article.content?.substring(0, 140) + '...'}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    {article.view_count || 0} pembaca
                  </span>
                  <span className="font-bold text-brand-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Baca Artikel <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Reader Modal */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700">
                {readingArticle.category || 'Artikel Edukasi'}
              </span>
              <button
                onClick={() => setReadingArticle(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 py-6 pr-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {readingArticle.title}
              </h2>

              <div className="flex items-center gap-4 text-xs text-slate-500 mt-3 mb-6 pb-4 border-b border-slate-100">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-brand-500" />
                  {readingArticle.author?.name || 'Tim Klinik Terapi'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {readingArticle.published_at
                    ? new Date(readingArticle.published_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '-'}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {readingArticle.view_count || 0} views
                </span>
              </div>

              {readingArticle.featured_image && (
                <img
                  src={readingArticle.featured_image}
                  alt={readingArticle.title}
                  className="w-full max-h-80 object-cover rounded-2xl mb-6"
                />
              )}

              {/* Formatted Content */}
              <div className="prose max-w-none text-slate-700 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line">
                {readingArticle.content}
              </div>

              {/* Tags */}
              {readingArticle.tags && (
                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <Tag className="w-4 h-4 text-slate-400" />
                  {readingArticle.tags.split(',').map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setReadingArticle(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition"
              >
                Tutup Bacaan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticlesPage;
