<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            // Add role column with default 'member'
            $table->enum('role', ['admin', 'editor', 'viewer', 'member'])->default('member')->after('email');
            
            // Add optional fields for tenant users
            $table->string('phone')->nullable()->after('password');
            $table->text('bio')->nullable()->after('phone');
            $table->boolean('is_active')->default(true)->after('bio');
            $table->timestamp('last_login_at')->nullable()->after('is_active');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'bio', 'is_active', 'last_login_at']);
        });
    }
};
