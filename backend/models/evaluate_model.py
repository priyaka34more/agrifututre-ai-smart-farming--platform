#!/usr/bin/env python3
"""
🌿 AgriFuture AI - Model Evaluation Script
Evaluates trained disease detection model performance
"""

import os
import json
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import load_model
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import matplotlib.pyplot as plt
import seaborn as sns
from PIL import Image
import cv2
import warnings
warnings.filterwarnings('ignore')

class ModelEvaluator:
    def __init__(self, model_path="backend/models/disease_model.h5",
                 class_mapping_path="backend/models/class_names.json",
                 test_data_path="backend/data/disease_dataset/val"):
        self.model_path = model_path
        self.class_mapping_path = class_mapping_path
        self.test_data_path = test_data_path
        self.model = None
        self.class_names = []
        self.class_mapping = {}
        
        # 📊 Evaluation results
        self.results = {
            'accuracy': 0,
            'top_3_accuracy': 0,
            'classification_report': {},
            'confusion_matrix': [],
            'per_class_metrics': {},
            'sample_predictions': []
        }
    
    def load_model_and_classes(self):
        """Load trained model and class mapping"""
        try:
            print("🧠 Loading trained model...")
            self.model = load_model(self.model_path)
            print(f"✅ Model loaded from {self.model_path}")
            
            print("📋 Loading class mapping...")
            with open(self.class_mapping_path, 'r') as f:
                self.class_mapping = json.load(f)
            
            # 🔄 Convert to list for consistent ordering
            self.class_names = [self.class_mapping[str(i)] for i in range(len(self.class_mapping))]
            print(f"✅ Loaded {len(self.class_names)} classes")
            
            return True
            
        except Exception as e:
            print(f"❌ Failed to load model: {str(e)}")
            return False
    
    def create_test_generator(self):
        """Create test data generator"""
        test_datagen = ImageDataGenerator(rescale=1./255)
        
        test_generator = test_datagen.flow_from_directory(
            self.test_data_path,
            target_size=(224, 224),
            batch_size=32,
            class_mode='categorical',
            shuffle=False
        )
        
        return test_generator
    
    def preprocess_image(self, image_path):
        """Preprocess single image for prediction"""
        try:
            # 📖 Load image
            img = Image.open(image_path).convert('RGB')
            img = img.resize((224, 224))
            
            # 🔄 Convert to array and normalize
            img_array = np.array(img, dtype=np.float32) / 255.0
            img_array = np.expand_dims(img_array, axis=0)
            
            return img_array
            
        except Exception as e:
            print(f"❌ Failed to preprocess {image_path}: {str(e)}")
            return None
    
    def predict_single_image(self, image_path):
        """Predict single image and return top 3 results"""
        if self.model is None:
            return None
        
        img_array = self.preprocess_image(image_path)
        if img_array is None:
            return None
        
        # 🧠 Get predictions
        predictions = self.model.predict(img_array, verbose=0)[0]
        
        # 🎯 Get top 3 predictions
        top_indices = predictions.argsort()[-3:][::-1]
        top_matches = [
            {
                "label": self.class_names[i],
                "confidence": round(float(predictions[i]) * 100, 2)
            }
            for i in top_indices
        ]
        
        return {
            "main_prediction": top_matches[0],
            "top_matches": top_matches,
            "all_probabilities": predictions.tolist()
        }
    
    def evaluate_model(self):
        """Comprehensive model evaluation"""
        if not self.load_model_and_classes():
            return False
        
        print("\n📊 Starting model evaluation...")
        print("=" * 50)
        
        # 🔄 Create test generator
        test_generator = self.create_test_generator()
        
        # 🧠 Get predictions
        print("🔮 Getting predictions...")
        predictions = self.model.predict(test_generator, verbose=0)
        predicted_classes = np.argmax(predictions, axis=1)
        true_classes = test_generator.classes
        
        # 📊 Calculate accuracy
        accuracy = accuracy_score(true_classes, predicted_classes)
        self.results['accuracy'] = accuracy
        
        # 🎯 Calculate top-3 accuracy
        top_3_correct = 0
        for i, pred_probs in enumerate(predictions):
            top_3_indices = pred_probs.argsort()[-3:][::-1]
            if true_classes[i] in top_3_indices:
                top_3_correct += 1
        
        top_3_accuracy = top_3_correct / len(true_classes)
        self.results['top_3_accuracy'] = top_3_accuracy
        
        print(f"📊 Overall Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")
        print(f"🎯 Top-3 Accuracy: {top_3_accuracy:.4f} ({top_3_accuracy*100:.2f}%)")
        
        # 📋 Classification report
        print("\n📋 Classification Report:")
        class_report = classification_report(
            true_classes, 
            predicted_classes, 
            target_names=self.class_names,
            output_dict=True
        )
        self.results['classification_report'] = class_report
        
        # 📊 Per-class metrics
        print("\n📊 Per-Class Performance:")
        for class_name in self.class_names:
            class_idx = list(self.class_mapping.values()).index(class_name)
            if class_idx < len(class_report):
                metrics = class_report[class_name]
                precision = metrics.get('precision', 0)
                recall = metrics.get('recall', 0)
                f1 = metrics.get('f1-score', 0)
                support = metrics.get('support', 0)
                
                self.results['per_class_metrics'][class_name] = {
                    'precision': precision,
                    'recall': recall,
                    'f1_score': f1,
                    'support': support
                }
                
                print(f"  {class_name}:")
                print(f"    Precision: {precision:.3f}")
                print(f"    Recall: {recall:.3f}")
                print(f"    F1-Score: {f1:.3f}")
                print(f"    Support: {support}")
        
        # 📊 Confusion matrix
        cm = confusion_matrix(true_classes, predicted_classes)
        self.results['confusion_matrix'] = cm.tolist()
        
        # 🎯 Sample predictions
        print("\n🎯 Sample Predictions:")
        sample_files = []
        for class_name in self.class_names[:5]:  # Test first 5 classes
            class_dir = os.path.join(self.test_data_path, class_name)
            if os.path.exists(class_dir):
                files = [f for f in os.listdir(class_dir) 
                        if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
                if files:
                    sample_files.append((os.path.join(class_dir, files[0]), class_name))
        
        for img_path, true_class in sample_files:
            prediction = self.predict_single_image(img_path)
            if prediction:
                main_pred = prediction['main_prediction']
                print(f"  📸 {true_class}:")
                print(f"    Predicted: {main_pred['label']} ({main_pred['confidence']}%)")
                print(f"    Correct: {'✅' if main_pred['label'] == true_class else '❌'}")
                
                self.results['sample_predictions'].append({
                    'image_path': img_path,
                    'true_class': true_class,
                    'predicted_class': main_pred['label'],
                    'confidence': main_pred['confidence'],
                    'top_matches': prediction['top_matches']
                })
        
        return True
    
    def test_low_confidence_handling(self):
        """Test low confidence prediction handling"""
        print("\n🔍 Testing Low Confidence Handling...")
        
        # 🎯 Find images with low confidence predictions
        low_confidence_samples = []
        
        for sample in self.results['sample_predictions']:
            if sample['confidence'] < 40:
                low_confidence_samples.append(sample)
        
        if low_confidence_samples:
            print(f"📊 Found {len(low_confidence_samples)} low confidence samples:")
            for sample in low_confidence_samples:
                print(f"  📸 {sample['true_class']}: {sample['predicted_class']} ({sample['confidence']}%)")
        else:
            print("✅ No low confidence samples found in test set")
        
        return low_confidence_samples
    
    def test_advisory_mapping(self):
        """Test advisory CSV mapping functionality"""
        print("\n📋 Testing Advisory Mapping...")
        
        try:
            advisory_df = pd.read_csv("backend/data/advisory.csv")
            print(f"✅ Advisory CSV loaded with {len(advisory_df)} entries")
            
            # 🎯 Test disease matching
            matched_diseases = 0
            for class_name in self.class_names:
                clean_name = class_name.lower().replace('___', '_').replace(' ', '_')
                exact_match = advisory_df[advisory_df["disease"] == clean_name]
                
                if not exact_match.empty:
                    matched_diseases += 1
                    print(f"  ✅ {class_name}: Found advisory")
                else:
                    # 🔄 Try partial match
                    partial_match = advisory_df[advisory_df["disease"].str.contains(clean_name.split('_')[-1], case=False, na=False)]
                    if not partial_match.empty:
                        matched_diseases += 1
                        print(f"  ⚠️ {class_name}: Partial match found")
                    else:
                        print(f"  ❌ {class_name}: No advisory found")
            
            coverage = (matched_diseases / len(self.class_names)) * 100
            print(f"\n📊 Advisory Coverage: {coverage:.1f}% ({matched_diseases}/{len(self.class_names)} classes)")
            
        except Exception as e:
            print(f"❌ Advisory mapping test failed: {str(e)}")
    
    def save_evaluation_report(self):
        """Save evaluation results to JSON file"""
        report_path = "backend/models/evaluation_report.json"
        
        try:
            with open(report_path, 'w') as f:
                json.dump(self.results, f, indent=2)
            print(f"\n💾 Evaluation report saved to {report_path}")
        except Exception as e:
            print(f"❌ Failed to save report: {str(e)}")
    
    def run_full_evaluation(self):
        """Run complete evaluation suite"""
        print("🌿 AgriFuture AI Model Evaluation")
        print("=" * 60)
        
        # 📊 Main evaluation
        if not self.evaluate_model():
            print("❌ Model evaluation failed")
            return False
        
        # 🔍 Low confidence test
        self.test_low_confidence_handling()
        
        # 📋 Advisory mapping test
        self.test_advisory_mapping()
        
        # 💾 Save report
        self.save_evaluation_report()
        
        print("\n🎉 Evaluation completed successfully!")
        print("=" * 60)
        
        return True

if __name__ == "__main__":
    evaluator = ModelEvaluator()
    evaluator.run_full_evaluation()
