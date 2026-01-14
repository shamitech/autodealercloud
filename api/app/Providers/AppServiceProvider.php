<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Symfony\Component\Mailer\Bridge\Sendgrid\Transport as SendgridTransport;
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
            $apiKey = $app['config']['services']['sendgrid']['secret'] ?? env('SENDGRID_API_KEY');
            
            return new \Symfony\Component\Mailer\Transport\SendgridApiTransport(
                $apiKey,
                $app['mailer.transport']
            );
        });
    }
}
