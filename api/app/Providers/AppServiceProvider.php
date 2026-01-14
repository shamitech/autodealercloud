<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Mail\Transport\SymfonyTransport;
use Symfony\Component\Mailer\Transport\Dsn;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        // Register SendGrid transport
        \Illuminate\Support\Facades\Mail::extend('sendgrid', function ($app) {
            $apiKey = env('SENDGRID_API_KEY');
            
            return new SymfonyTransport(
                new \Symfony\Component\Mailer\Bridge\Sendgrid\Transport(
                    new \Symfony\Component\HttpClient\HttpClient(),
                    $apiKey
                )
            );
        });
    }
}
