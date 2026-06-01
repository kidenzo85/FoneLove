from PIL import Image
import os

def optimize_image():
    input_path = r"C:\Users\Administrateur\.gemini\antigravity\brain\7b949c7e-9708-4a69-841d-88b9a8d53e7e\fonelove_pack_crystal_1780149609310.png"
    output_path = r"C:\Users\Administrateur\Documents\project\Fonelove\public\images\fonelove-crystal.webp"
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    img = Image.open(input_path)
    
    # Resize to a very lightweight dimension suitable for icons (e.g. 512x512)
    img.thumbnail((512, 512), Image.Resampling.LANCZOS)
    
    # Save as WebP with high compression
    img.save(output_path, "WEBP", quality=75)
    print(f"Successfully optimized and saved to: {output_path}")

if __name__ == '__main__':
    optimize_image()
