"""
ML Model Training Script for College Attendance Predictor.
Trains Linear Regression and Random Forest models on generated data.
Saves the best model as a pickle file for Flask API usage.
"""
import json
import pickle
import numpy as np
import sys
sys.path.insert(0, '../dataset')

from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error

def load_data():
    """Load the generated dataset."""
    with open('../dataset/attendance_data.json', 'r') as f:
        data = json.load(f)
    return data

def prepare_features(data):
    """Extract features and target variable."""
    X = []
    y = []
    
    for record in data:
        features = [
            record['current_attendance_pct'],          # Current attendance %
            record['total_classes'],                    # Total classes so far
            record['attended_classes'],                 # Attended classes
            record['future_classes'],                   # Future classes upcoming
            record['min_requirement'],                  # Minimum requirement
            record['total_classes'] - record['attended_classes'],  # Missed so far
            record['attended_classes'] / max(record['total_classes'], 1),  # Attendance ratio
        ]
        X.append(features)
        y.append(record['predicted_attendance_pct'])
    
    return np.array(X), np.array(y)

def train_and_evaluate():
    """Train models and evaluate performance."""
    print("🔄 Loading dataset...")
    data = load_data()
    X, y = prepare_features(data)
    
    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print("🤖 Training Linear Regression model...")
    lr_model = LinearRegression()
    lr_model.fit(X_train_scaled, y_train)
    lr_preds = lr_model.predict(X_test_scaled)
    lr_r2 = r2_score(y_test, lr_preds)
    lr_mae = mean_absolute_error(y_test, lr_preds)
    lr_rmse = np.sqrt(mean_squared_error(y_test, lr_preds))
    
    print(f"   R² Score: {lr_r2:.4f}")
    print(f"   MAE: {lr_mae:.4f}")
    print(f"   RMSE: {lr_rmse:.4f}")
    
    print("\n🌲 Training Random Forest model...")
    rf_model = RandomForestRegressor(n_estimators=100, random_state=42, n_jobs=-1)
    rf_model.fit(X_train, y_train)
    rf_preds = rf_model.predict(X_test)
    rf_r2 = r2_score(y_test, rf_preds)
    rf_mae = mean_absolute_error(y_test, rf_preds)
    rf_rmse = np.sqrt(mean_squared_error(y_test, rf_preds))
    
    print(f"   R² Score: {rf_r2:.4f}")
    print(f"   MAE: {rf_mae:.4f}")
    print(f"   RMSE: {rf_rmse:.4f}")
    
    # Cross-validation
    cv_scores = cross_val_score(rf_model, X, y, cv=5, scoring='r2')
    print(f"\n📊 Cross-validation R² (RF): {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    
    # Use RF as primary model (better accuracy)
    best_model = rf_model
    best_r2 = rf_r2
    
    # Save model artifacts
    model_data = {
        'model': best_model,
        'scaler': scaler,
        'lr_model': lr_model,
        'metrics': {
            'linear_regression': {
                'r2_score': round(lr_r2, 4),
                'mae': round(lr_mae, 4),
                'rmse': round(lr_rmse, 4),
                'accuracy_pct': round(lr_r2 * 100, 2)
            },
            'random_forest': {
                'r2_score': round(rf_r2, 4),
                'mae': round(rf_mae, 4),
                'rmse': round(rf_rmse, 4),
                'accuracy_pct': round(rf_r2 * 100, 2),
                'cv_mean': round(cv_scores.mean(), 4),
                'cv_std': round(cv_scores.std(), 4)
            }
        },
        'feature_names': [
            'current_attendance_pct', 'total_classes', 'attended_classes',
            'future_classes', 'min_requirement', 'missed_classes', 'attendance_ratio'
        ]
    }
    
    with open('attendance_model.pkl', 'wb') as f:
        pickle.dump(model_data, f)
    
    # Save metrics as JSON for API
    with open('model_metrics.json', 'w') as f:
        json.dump(model_data['metrics'], f, indent=2)
    
    print(f"\n✅ Model saved: attendance_model.pkl")
    print(f"✅ Metrics saved: model_metrics.json")
    print(f"\n🏆 Best model: Random Forest (R²={best_r2:.4f})")
    
    return model_data

if __name__ == '__main__':
    train_and_evaluate()
