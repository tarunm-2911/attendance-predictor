"""
Dataset generation script for College Attendance Predictor.
Generates synthetic student attendance data for ML model training.
"""
import json
import random
import csv

random.seed(42)

def generate_dataset(n_samples=1000):
    """Generate synthetic attendance data with realistic patterns."""
    data = []
    
    for i in range(n_samples):
        total_classes = random.randint(20, 150)
        # Simulate various attendance behaviors
        behavior = random.choice(['good', 'average', 'poor', 'declining', 'improving'])
        
        if behavior == 'good':
            attendance_rate = random.uniform(0.80, 1.00)
        elif behavior == 'average':
            attendance_rate = random.uniform(0.65, 0.85)
        elif behavior == 'poor':
            attendance_rate = random.uniform(0.30, 0.65)
        elif behavior == 'declining':
            attendance_rate = random.uniform(0.50, 0.80)
        else:  # improving
            attendance_rate = random.uniform(0.60, 0.90)
        
        attended = int(total_classes * attendance_rate)
        attended = min(attended, total_classes)
        
        future_classes = random.randint(5, 40)
        min_requirement = random.choice([75, 80, 85])
        
        # Future attendance prediction logic
        if behavior == 'good':
            future_attend_rate = random.uniform(0.85, 1.00)
        elif behavior == 'improving':
            future_attend_rate = min(1.0, attendance_rate + random.uniform(0.05, 0.15))
        elif behavior == 'declining':
            future_attend_rate = max(0.3, attendance_rate - random.uniform(0.05, 0.20))
        else:
            future_attend_rate = attendance_rate + random.uniform(-0.05, 0.05)
        
        future_attend_rate = max(0.0, min(1.0, future_attend_rate))
        future_attended = int(future_classes * future_attend_rate)
        
        total_after = total_classes + future_classes
        attended_after = attended + future_attended
        predicted_pct = (attended_after / total_after * 100) if total_after > 0 else 0
        
        data.append({
            'student_id': i + 1,
            'total_classes': total_classes,
            'attended_classes': attended,
            'current_attendance_pct': round((attended / total_classes * 100) if total_classes > 0 else 0, 2),
            'future_classes': future_classes,
            'min_requirement': min_requirement,
            'behavior_pattern': behavior,
            'predicted_attendance_pct': round(predicted_pct, 2)
        })
    
    return data

def save_dataset(data):
    """Save dataset as both JSON and CSV."""
    # Save as JSON
    with open('attendance_data.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    # Save as CSV
    with open('attendance_data.csv', 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
    
    print(f"✅ Dataset generated: {len(data)} samples")
    print("   → attendance_data.json")
    print("   → attendance_data.csv")

if __name__ == '__main__':
    data = generate_dataset(1000)
    save_dataset(data)
    
    # Print stats
    good = sum(1 for d in data if d['behavior_pattern'] == 'good')
    print(f"\nDataset stats:")
    print(f"  Good attendance: {good}")
    print(f"  Avg current attendance: {sum(d['current_attendance_pct'] for d in data)/len(data):.1f}%")
