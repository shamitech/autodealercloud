<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

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
            return new \Symfony\Component\Mailer\Bridge\Sendgrid\Transport(
                new \Symfony\Component\HttpClient\HttpClient(),
                env('SENDGRID_API_KEY')
            );
        });
    }
}
