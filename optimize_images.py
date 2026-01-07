import os
import shutil
from PIL import Image
import sys

# Configuration
TARGET_DIR = "./public/pics"
BACKUP_DIR = "./public/pics_backup"
MAX_SIZE = (256, 256)
QUALITY = 80

def optimize_images():
    print(f"Starting optimization...")
    print(f"Target Directory: {TARGET_DIR}")
    print(f"Backup Directory: {BACKUP_DIR}")

    # Create backup directory if it doesn't exist
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
        print(f"Created backup directory: {BACKUP_DIR}")

    # Walk through the directory
    for root, dirs, files in os.walk(TARGET_DIR):
        # Determine relative path for backup structure
        rel_path = os.path.relpath(root, TARGET_DIR)
        backup_path = os.path.join(BACKUP_DIR, rel_path)

        if not os.path.exists(backup_path):
            os.makedirs(backup_path)

        for filename in files:
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                file_path = os.path.join(root, filename)
                backup_file_path = os.path.join(backup_path, filename)
                
                # Backup original file
                if not os.path.exists(backup_file_path):
                    shutil.copy2(file_path, backup_file_path)
                    print(f"Backed up: {filename}")

                try:
                    with Image.open(file_path) as img:
                        # Resize if larger than MAX_SIZE
                        if img.width > MAX_SIZE[0] or img.height > MAX_SIZE[1]:
                            img.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
                            print(f"Resized: {filename}")

                        # Convert to WebP
                        webp_filename = os.path.splitext(filename)[0] + '.webp'
                        webp_path = os.path.join(root, webp_filename)
                        
                        img.save(webp_path, 'WEBP', quality=QUALITY)
                        print(f"Converted to WebP: {webp_filename}")
                        
                        # Optional: Remove original png if you want to enforce webp only
                        os.remove(file_path) 
                        print(f"Removed original: {filename}") 
                        
                except Exception as e:
                    print(f"Error processing {filename}: {e}")

    print("\nOptimization complete!")
    print(f"Originals backed up to: {BACKUP_DIR}")

if __name__ == "__main__":
    try:
        import PIL
        optimize_images()
    except ImportError:
        print("Error: Pillow library not found.")
        print("Please install it running: pip install Pillow")
