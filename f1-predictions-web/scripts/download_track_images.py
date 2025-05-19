import os
import requests
from PIL import Image
from io import BytesIO

# Create directories if they don't exist
os.makedirs("f1-predictions-web/public/tracks", exist_ok=True)

# Track image URLs (replace with actual URLs)
TRACK_IMAGES = {
    "bahrain": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Bahrain.png.transform/3col/image.png",
    "saudi-arabia": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Saudi%20Arabia.png.transform/3col/image.png",
    "australia": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Australia.png.transform/3col/image.png",
    "japan": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Japan.png.transform/3col/image.png",
    "china": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/China.png.transform/3col/image.png",
    "miami": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Miami.png.transform/3col/image.png",
    "emilia-romagna": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Emilia%20Romagna.png.transform/3col/image.png",
    "monaco": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Monaco.png.transform/3col/image.png",
    "canada": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Canada.png.transform/3col/image.png",
    "spain": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Spain.png.transform/3col/image.png",
    "austria": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Austria.png.transform/3col/image.png",
    "great-britain": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Great%20Britain.png.transform/3col/image.png",
    "hungary": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Hungary.png.transform/3col/image.png",
    "belgium": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Belgium.png.transform/3col/image.png",
    "netherlands": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Netherlands.png.transform/3col/image.png",
    "italy": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Italy.png.transform/3col/image.png",
    "azerbaijan": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Azerbaijan.png.transform/3col/image.png",
    "singapore": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Singapore.png.transform/3col/image.png",
    "united-states": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/United%20States.png.transform/3col/image.png",
    "mexico": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Mexico.png.transform/3col/image.png",
    "brazil": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Brazil.png.transform/3col/image.png",
    "las-vegas": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Las%20Vegas.png.transform/3col/image.png",
    "qatar": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Qatar.png.transform/3col/image.png",
    "abu-dhabi": "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/2018-redesign-assets/Track%20icons%204x3/Abu%20Dhabi.png.transform/3col/image.png"
}

def download_and_resize_image(url, filename, size=(800, 450)):
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        # Open image from response content
        img = Image.open(BytesIO(response.content))
        
        # Convert to RGB if necessary
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        
        # Resize image
        img = img.resize(size, Image.Resampling.LANCZOS)
        
        # Save image
        img.save(f"f1-predictions-web/public/tracks/{filename}.jpg", "JPEG", quality=85)
        print(f"Successfully downloaded and processed {filename}")
        
    except Exception as e:
        print(f"Error processing {filename}: {str(e)}")

def main():
    for track, url in TRACK_IMAGES.items():
        download_and_resize_image(url, track)

if __name__ == "__main__":
    main() 