<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Mail\Transport\SymfonyTransport;
use App\Mail\SendgridTransport;

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
        // Register SendGrid mailer
        \Illuminate\Support\Facades\Mail::extend('sendgrid', function ($app) {
            return new SymfonyTransport(
                new SendgridTransport(env('SENDGRID_API_KEY'))
            );
        });
    }
}
