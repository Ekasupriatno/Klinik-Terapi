<?php

namespace App\Jobs;

use App\Models\Doctor;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProcessDoctorImageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 120;

    protected $doctorId;
    protected $imagePath;
    protected $deleteOriginal;
    protected $oldImagePaths;

    /**
     * Create a new job instance.
     */
    public function __construct($doctorId, $imagePath, $deleteOriginal = false, array $oldImagePaths = [])
    {
        $this->doctorId = $doctorId;
        $this->imagePath = $imagePath;
        $this->deleteOriginal = $deleteOriginal;
        $this->oldImagePaths = $oldImagePaths;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $doctor = Doctor::find($this->doctorId);
            
            if (!$doctor) {
                Log::error("Doctor not found for image processing: {$this->doctorId}");
                Storage::disk('public')->delete(array_merge([$this->imagePath], $this->oldImagePaths));
                return;
            }

            // Read the image from storage
            $fullPath = Storage::disk('public')->path($this->imagePath);
            
            if (!file_exists($fullPath)) {
                throw new \RuntimeException("Image file not found: {$fullPath}");
            }

            // Get image info
            $imageInfo = getimagesize($fullPath);
            if (!$imageInfo) {
                throw new \RuntimeException("Invalid image file: {$fullPath}");
            }

            $type = $imageInfo[2];

            $sourceImage = null;
            try {
                switch ($type) {
                    case IMAGETYPE_JPEG:
                        $sourceImage = imagecreatefromjpeg($fullPath);
                        break;
                    case IMAGETYPE_PNG:
                        $sourceImage = imagecreatefrompng($fullPath);
                        break;
                    case IMAGETYPE_GIF:
                        $sourceImage = imagecreatefromgif($fullPath);
                        break;
                    case IMAGETYPE_WEBP:
                        $sourceImage = imagecreatefromwebp($fullPath);
                        break;
                    default:
                        throw new \RuntimeException("Unsupported image type: {$type}");
                }

                if (!$sourceImage) {
                    throw new \RuntimeException("Failed to create image resource from: {$fullPath}");
                }

                $imageName = pathinfo($this->imagePath, PATHINFO_FILENAME) . '.jpg';
                $thumbnailPath = 'doctors/thumbnails/' . $imageName;
                $thumbnail = $this->createThumbnail($sourceImage, 200, 200);
                if (!$thumbnail || !Storage::disk('public')->put($thumbnailPath, $thumbnail)) {
                    throw new \RuntimeException("Failed to write doctor thumbnail: {$thumbnailPath}");
                }
                $thumbnailUrl = asset('storage/' . $thumbnailPath);

                $mediumPath = 'doctors/medium/' . $imageName;
                $medium = $this->createThumbnail($sourceImage, 400, 400);
                if (!$medium || !Storage::disk('public')->put($mediumPath, $medium)) {
                    throw new \RuntimeException("Failed to write medium doctor image: {$mediumPath}");
                }
                $mediumUrl = asset('storage/' . $mediumPath);

                $optimizedPath = 'doctors/optimized/' . $imageName;
                $optimized = $this->optimizeImage($sourceImage, 800, 800);
                if (!$optimized || !Storage::disk('public')->put($optimizedPath, $optimized)) {
                    throw new \RuntimeException("Failed to write optimized doctor image: {$optimizedPath}");
                }
                $optimizedUrl = asset('storage/' . $optimizedPath);

                $doctor->update([
                    'image_url' => $optimizedUrl,
                    'image_thumbnail_url' => $thumbnailUrl,
                    'image_medium_url' => $mediumUrl,
                ]);
            } finally {
                if ($sourceImage) {
                    imagedestroy($sourceImage);
                }
            }

            // Delete original if requested
            if ($this->deleteOriginal) {
                Storage::disk('public')->delete($this->imagePath);
            }
            Storage::disk('public')->delete($this->oldImagePaths);

            Log::info("Doctor image processed successfully: Doctor ID {$this->doctorId}");

        } catch (\Throwable $e) {
            Log::error("Failed to process doctor image: " . $e->getMessage(), [
                'doctor_id' => $this->doctorId,
                'image_path' => $this->imagePath,
                'trace' => $e->getTraceAsString()
            ]);
            
            // Release the job for retry if it's a temporary failure
            if ($this->attempts() < $this->tries) {
                $this->release(60); // Release for 60 seconds
                return;
            }

            throw $e;
        }
    }

    /**
     * Create a thumbnail with center crop
     */
    protected function createThumbnail($sourceImage, $targetWidth, $targetHeight)
    {
        $sourceWidth = imagesx($sourceImage);
        $sourceHeight = imagesy($sourceImage);

        // Calculate crop position (center)
        $cropSize = min($sourceWidth, $sourceHeight);
        $cropX = (int) (($sourceWidth - $cropSize) / 2);
        $cropY = (int) (($sourceHeight - $cropSize) / 2);

        // Create new image
        $thumbnail = imagecreatetruecolor($targetWidth, $targetHeight);
        
        // Enable alpha blending and save alpha
        imagealphablending($thumbnail, false);
        imagesavealpha($thumbnail, true);

        // Copy and resize
        imagecopyresampled(
            $thumbnail,
            $sourceImage,
            0, 0,
            $cropX, $cropY,
            $targetWidth, $targetHeight,
            $cropSize,
            $cropSize
        );

        // Output to buffer
        ob_start();
        imagejpeg($thumbnail, null, 85);
        $imageData = ob_get_clean();
        
        imagedestroy($thumbnail);
        
        return $imageData;
    }

    /**
     * Optimize image with max dimensions
     */
    protected function optimizeImage($sourceImage, $maxWidth, $maxHeight)
    {
        $sourceWidth = imagesx($sourceImage);
        $sourceHeight = imagesy($sourceImage);

        // Calculate new dimensions maintaining aspect ratio
        if ($sourceWidth > $maxWidth || $sourceHeight > $maxHeight) {
            $ratio = min($maxWidth / $sourceWidth, $maxHeight / $sourceHeight);
            $newWidth = (int)($sourceWidth * $ratio);
            $newHeight = (int)($sourceHeight * $ratio);
        } else {
            $newWidth = $sourceWidth;
            $newHeight = $sourceHeight;
        }

        // Create new image
        $optimized = imagecreatetruecolor($newWidth, $newHeight);
        
        // Enable alpha blending and save alpha
        imagealphablending($optimized, false);
        imagesavealpha($optimized, true);

        // Copy and resize
        imagecopyresampled(
            $optimized,
            $sourceImage,
            0, 0,
            0, 0,
            $newWidth, $newHeight,
            $sourceWidth, $sourceHeight
        );

        // Output to buffer
        ob_start();
        imagejpeg($optimized, null, 85);
        $imageData = ob_get_clean();
        
        imagedestroy($optimized);
        
        return $imageData;
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("Doctor image processing job failed permanently: " . $exception->getMessage(), [
            'doctor_id' => $this->doctorId,
            'image_path' => $this->imagePath,
        ]);
    }
}
