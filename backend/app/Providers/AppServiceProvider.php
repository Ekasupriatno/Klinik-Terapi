<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('login', function (Request $request): array {
            // Batasi kombinasi akun + IP untuk mencegah percobaan berulang pada
            // satu akun, sekaligus batasi IP untuk mencegah penyemprotan banyak akun.
            $email = Str::lower(trim((string) $request->input('email')));
            $ip = (string) $request->ip();

            return [
                Limit::perMinute(5)
                    ->by('login:credential:' . hash('sha256', $email . '|' . $ip))
                    ->response($this->tooManyLoginAttemptsResponse(...)),
                Limit::perMinute(20)
                    ->by('login:ip:' . hash('sha256', $ip))
                    ->response($this->tooManyLoginAttemptsResponse(...)),
            ];
        });
    }

    /**
     * Keep the response generic so it never reveals whether an account exists.
     */
    private function tooManyLoginAttemptsResponse(Request $request, array $headers)
    {
        return response()->json([
            'success' => false,
            'message' => 'Terlalu banyak percobaan masuk. Silakan coba kembali setelah 1 menit.',
        ], 429, $headers);
    }
}
