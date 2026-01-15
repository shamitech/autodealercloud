<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('media_library', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('tenant_id');
            
            // File info
            $table->string('filename');
            $table->string('original_filename');
            $table->string('path');
            $table->string('url');
            $table->string('mime_type');
            $table->bigInteger('size'); // In bytes
            
            // Image dimensions (if applicable)
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            
            // Metadata
            $table->string('alt_text')->nullable();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            
            // Organization
            $table->string('folder')->default('/');
            $table->json('tags')->nullable();
            
            // Usage tracking
            $table->enum('type', ['image', 'video', 'document', 'other'])->default('image');
            $table->uuid('uploaded_by')->nullable();
            
            $table->timestamps();
            
            $table->foreign('tenant_id')->references('id')->on('tenants')->onDelete('cascade');
            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('set null');
            
            $table->index(['tenant_id', 'folder']);
            $table->index(['tenant_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('media_library');
    }
};
