# Yuki ML

A Formula 1 focused machine learning model that predicts race outcomes for the 2025 season. Yuki ML leverages historical race data and qualifying times to make predictions about future race performances. (Because if anyone knows about qualifying, it's Yuki - the man who can find a gap that doesn't exist! 🏎️)

## Features

- Predicts race outcomes using machine learning models (with Yuki-level precision)
- Incorporates multiple features including:
  - Qualifying times (Yuki's specialty - just ask any driver who's been on the receiving end of his radio messages)
  - Sector times (because Yuki doesn't just drive fast, he drives ANGRY fast)
  - Historical race data (and by historical, we mean Yuki's legendary radio messages)
- Supports predictions for different Grand Prix events (especially the ones where Yuki's radio is working)
- Includes both experienced drivers and new drivers in predictions (but let's be real, we're all here for Yuki)

## Prerequisites

- Python 3.8 or higher (because Yuki doesn't do things the old way)
- pip (Python package installer)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/tumcuctom/yuki.git
cd yuki
```

2. Create and activate a virtual environment (recommended):
```bash
python -m venv .env
source .env/bin/activate  # On Windows, use `.env\Scripts\activate`
```

3. Install required packages:
```bash
pip install -r requirements.txt
```

4. Create the FastF1 cache directory:
```bash
mkdir f1_cache
```


## Project Structure

- `prediction1.py`: Basic prediction model using only qualifying times (Yuki's favorite)
- `prediction2.py`: Advanced prediction model using qualifying and sector times (for when Yuki is feeling extra spicy)
- `prediction2_nochange.py`: Same as prediction2 but with original model parameters (because sometimes even Yuki needs to calm down)
- `prediction2_olddrivers.py`: Prediction model for experienced drivers only (but we all know Yuki would still find a way to overtake them)
- `f1_cache/`: Directory for FastF1 data caching (where we store Yuki's radio messages for future reference)
- `requirements.txt`: Project dependencies (because even Yuki needs his tools)

## How It Works

1. The scripts fetch historical F1 race data using the FastF1 API (including Yuki's legendary radio messages)
2. They process qualifying times and sector times for each driver (Yuki's favorite part)
3. A Gradient Boosting Regressor model is trained on this data (because Yuki's driving style is too complex for simple models)
4. The model predicts race times based on qualifying performance (just like Yuki predicts gaps that don't exist)
5. Results are sorted and displayed with predicted finishing positions (spoiler alert: Yuki will probably be first)

## Dependencies

- fastf1: Formula 1 data access (and Yuki radio message access)
- pandas: Data manipulation (because even Yuki needs to organize his thoughts sometimes)
- numpy: Numerical operations (for calculating how many times Yuki says "WHAT THE HELL" per race)
- scikit-learn: Machine learning models (trained on Yuki's aggressive driving style)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. (But remember, if you're not driving like Yuki, you're not driving fast enough)

## Acknowledgments

- FastF1 library for providing Formula 1 data
- Formula 1 for making the data available
- Named in honor of Yuki Tsunoda, the Japanese Formula 1 driver who taught us that sometimes the best way to find a gap is to create one (and then complain about it on the radio)
