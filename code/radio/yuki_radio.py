import fastf1
import pandas as pd
from datetime import datetime
import re

# Enable FastF1 caching
fastf1.Cache.enable_cache("f1_cache")

def get_yuki_radio_messages(year, gp_name):
    """
    Fetch Yuki's radio messages for a specific Grand Prix.
    
    Args:
        year (int): The year of the race
        gp_name (str): The name of the Grand Prix (e.g., "Australia", "Japan")
    """
    print(f"\n🎤 Fetching Yuki's radio messages from {year} {gp_name} GP 🎤\n")
    
    """
    TODO - get the data...
    """
    
    # Print messages with some fun formatting
    print("📻 Yuki's Radio Messages 📻")
    print("=" * 50)
    
    for _, message in yuki_radio.iterrows():
        # Add some fun emojis based on message content
        emoji = "😡" if any(word in message['Message'].lower() for word in ['what', 'hell', 'fuck', 'shit']) else "🏎️"
        print(f"\n{emoji} {message['Timestamp']} - {message['Message']}")
    
    # Some fun statistics
    total_messages = len(yuki_radio)
    angry_messages = len(yuki_radio[yuki_radio['Message'].str.contains('what|hell|fuck|shit', case=False, regex=True)])
    
    print("\n📊 Radio Statistics 📊")
    print("=" * 50)
    print(f"Total messages: {total_messages}")
    print(f"Angry messages: {angry_messages}")
    print(f"Anger ratio: {(angry_messages/total_messages)*100:.1f}%")
    
    # Save to CSV for future reference
    filename = f"yuki_radio_{year}_{gp_name.lower().replace(' ', '_')}.csv"
    yuki_radio.to_csv(filename, index=False)
    print(f"\n💾 Messages saved to {filename}")

def main():
    # Example usage
    races = [
        (2024, "Australia"),
        (2024, "Japan"),
        (2023, "Japan"),
        (2023, "Singapore")
    ]
    
    for year, gp in races:
        try:
            get_yuki_radio_messages(year, gp)
        except Exception as e:
            print(f"Error fetching data for {year} {gp}: {str(e)}")

if __name__ == "__main__":
    main() 