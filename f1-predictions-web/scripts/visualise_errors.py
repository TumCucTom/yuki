import json
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import numpy as np

def load_predictions():
    """Load predictions from the JSON file"""
    with open("../public/predictions/all_predictions.json", "r") as f:
        return json.load(f)

def create_error_visualisations():
    """Create visualisations of model errors across races"""
    predictions = load_predictions()
    
    # Create a DataFrame to store errors
    error_data = []
    for gp, models in predictions.items():
        for model_type, data in models.items():
            if "model_error" in data:
                error_data.append({
                    "Grand Prix": gp,
                    "Model Type": model_type,
                    "Error (seconds)": data["model_error"]
                })
    
    df = pd.DataFrame(error_data)
    
    # Set the style
    plt.style.use('ggplot')
    
    # Create figure with subplots
    fig = plt.figure(figsize=(20, 24))
    gs = fig.add_gridspec(4, 2)
    
    # Main title
    fig.suptitle('Model Error Analysis Across F1 2024 Races', fontsize=20, y=0.95)
    
    # Plot 1: Box plot of errors by model type
    ax1 = fig.add_subplot(gs[0, 0])
    sns.boxplot(data=df, x="Model Type", y="Error (seconds)", ax=ax1)
    ax1.set_title('Distribution of Prediction Errors by Model Type', fontsize=14)
    ax1.set_xticklabels(ax1.get_xticklabels(), rotation=45)
    
    # Plot 2: Line plot of errors across races
    ax2 = fig.add_subplot(gs[0, 1])
    for model_type in df["Model Type"].unique():
        model_data = df[df["Model Type"] == model_type]
        ax2.plot(model_data["Grand Prix"], model_data["Error (seconds)"], 
                marker='o', label=model_type)
    ax2.set_title('Prediction Errors Across Races', fontsize=14)
    ax2.set_xticklabels(ax2.get_xticklabels(), rotation=45, ha='right')
    ax2.legend()
    ax2.grid(True)
    
    # Plot 3: Heatmap of errors by race and model type
    ax3 = fig.add_subplot(gs[1, :])
    pivot_df = df.pivot(index="Grand Prix", columns="Model Type", values="Error (seconds)")
    sns.heatmap(pivot_df, annot=True, cmap="YlOrRd", fmt=".2f", ax=ax3)
    ax3.set_title('Error Heatmap by Race and Model Type', fontsize=14)
    
    # Plot 4: Correlation plot between model types
    ax4 = fig.add_subplot(gs[2, :])
    correlation = pivot_df.corr()
    sns.heatmap(correlation, annot=True, cmap="coolwarm", vmin=-1, vmax=1, ax=ax4)
    ax4.set_title('Correlation Between Model Types', fontsize=14)
    
    # Plot 5: Violin plot of error distributions
    ax5 = fig.add_subplot(gs[3, 0])
    sns.violinplot(data=df, x="Model Type", y="Error (seconds)", ax=ax5)
    ax5.set_title('Error Distribution by Model Type', fontsize=14)
    ax5.set_xticklabels(ax5.get_xticklabels(), rotation=45)
    
    # Plot 6: Scatter plot matrix
    ax6 = fig.add_subplot(gs[3, 1])
    sns.scatterplot(data=df, x="Grand Prix", y="Error (seconds)", 
                   hue="Model Type", style="Model Type", ax=ax6)
    ax6.set_title('Error Scatter Plot by Race', fontsize=14)
    ax6.set_xticklabels(ax6.get_xticklabels(), rotation=45, ha='right')
    
    # Adjust layout
    plt.tight_layout()
    
    # Save the figure
    plt.savefig("../public/predictions/model_errors.png", dpi=300, bbox_inches='tight')
    print("Error visualisation saved to public/predictions/model_errors.png")
    
    # Create summary statistics
    summary = df.groupby("Model Type")["Error (seconds)"].agg([
        "mean",
        "std",
        "min",
        "max",
        "median"
    ]).round(3)
    summary = summary.rename(columns={
        "mean": "Mean Error",
        "std": "Std Error",
        "min": "Min Error",
        "max": "Max Error",
        "median": "Median Error"
    })
    
    # Save summary to CSV
    summary.to_csv("../public/predictions/error_summary.csv")
    print("Error summary saved to public/predictions/error_summary.csv")
    
    # Save the processed data for the web component
    df.to_csv("../public/predictions/error_data.csv", index=False)
    pivot_df.to_csv("../public/predictions/error_pivot.csv")
    correlation.to_csv("../public/predictions/error_correlation.csv")
    
    return summary

def main():
    try:
        summary = create_error_visualisations()
        print("\nError Summary by Model Type:")
        print(summary)
    except Exception as e:
        print(f"Error creating visualisations: {str(e)}")

if __name__ == "__main__":
    main() 