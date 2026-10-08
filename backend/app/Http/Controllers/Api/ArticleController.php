<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArticleResource;
use App\Models\Article;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class ArticleController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Article::with('author');

        // Public: only show published articles
        if (!auth()->check() || !auth()->user()->isAdmin()) {
            $query->published();
        }

        if ($request->category) {
            $query->where('category', $request->category);
        }

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('content', 'like', '%' . $request->search . '%');
            });
        }

        return ArticleResource::collection($query->orderBy('published_at', 'desc')->paginate(20));
    }

    public function show(Article $article): ArticleResource
    {
        $article->load('author');

        // Increment view count
        $article->increment('view_count');

        return new ArticleResource($article);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:articles,slug',
            'content' => 'required|string',
            'excerpt' => 'nullable|string',
            'featured_image' => 'nullable|string',
            'author_id' => 'nullable|exists:users,id',
            'category' => 'nullable|string|max:100',
            'tags' => 'nullable|string',
            'is_published' => 'sometimes|boolean',
            'published_at' => 'nullable|date',
            'meta_title' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . time();
        }

        if ($validated['is_published'] ?? false && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $article = Article::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Artikel berhasil dibuat.',
            'data' => new ArticleResource($article->load('author')),
        ], 201);
    }

    public function update(Request $request, Article $article): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'slug' => 'nullable|string|max:255|unique:articles,slug,' . $article->id,
            'content' => 'sometimes|string',
            'excerpt' => 'nullable|string',
            'featured_image' => 'nullable|string',
            'author_id' => 'nullable|exists:users,id',
            'category' => 'nullable|string|max:100',
            'tags' => 'nullable|string',
            'is_published' => 'sometimes|boolean',
            'published_at' => 'nullable|date',
            'meta_title' => 'nullable|string',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string',
        ]);

        if (isset($validated['title']) && empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . time();
        }

        if (($validated['is_published'] ?? false) && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $article->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Artikel berhasil diperbarui.',
            'data' => new ArticleResource($article->load('author')),
        ]);
    }

    public function destroy(Article $article): JsonResponse
    {
        $article->delete();

        return response()->json([
            'success' => true,
            'message' => 'Artikel berhasil dihapus.',
        ]);
    }
}
