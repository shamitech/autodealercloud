<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // PostgreSQL approach: extend the enum type
        if (DB::connection()->getDriverName() === 'pgsql') {
            DB::statement("ALTER TYPE role_type ADD VALUE 'superadmin' BEFORE 'admin'");
        }
        
        // Alternative: drop and recreate the column for other databases
        if (DB::connection()->getDriverName() !== 'pgsql') {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('role');
            });
            
            Schema::table('users', function (Blueprint $table) {
                $table->enum('role', ['superadmin', 'admin', 'editor', 'viewer', 'member'])->default('member')->after('email');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (DB::connection()->getDriverName() === 'pgsql') {
            // PostgreSQL doesn't support removing enum values easily
            // This is a limitation - just document it
        }
    }
};
