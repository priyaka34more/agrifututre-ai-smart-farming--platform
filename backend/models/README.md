# 🌿 AgriFuture AI - Disease Detection System

## 📋 Overview

This directory contains the complete disease detection system for AgriFuture AI, including model training, evaluation, and deployment scripts.

## 🏗️ Architecture

- **MobileNetV2** base model with custom classification head
- **Top-3 predictions** with confidence percentages
- **Multi-language support** (English, Hindi, Marathi)
- **Advisory system** connected to CSV database
- **Memory system** for session tracking

## 📁 File Structure

```
backend/models/
├── train_disease_model.py      # Main training script
├── prepare_dataset.py          # Dataset preparation
├── evaluate_model.py           # Model evaluation
├── disease_model.h5            # Trained model (output)
├── class_names.json            # Class mapping (output)
├── evaluation_report.json      # Evaluation results (output)
└── README.md                   # This file
```

## 🚀 Quick Start

### 1. Prepare Dataset

```bash
# Create dataset structure
python backend/models/prepare_dataset.py

# This will:
# - Validate and clean images
# - Balance dataset (50-500 images per class)
# - Create train/val split
# - Generate statistics
```

### 2. Train Model

```bash
# Train MobileNetV2 model
python backend/models/train_disease_model.py

# This will:
# - Load MobileNetV2 with ImageNet weights
# - Add custom classification layers
# - Train with data augmentation
# - Save trained model and class mapping
```

### 3. Evaluate Model

```bash
# Evaluate trained model
python backend/models/evaluate_model.py

# This will:
# - Calculate accuracy metrics
# - Generate classification report
# - Test advisory mapping
# - Save evaluation report
```

## 📊 Dataset Requirements

### 📁 Directory Structure

```
backend/data/raw_disease_data/
├── Tomato___healthy/
│   ├── image1.jpg
│   ├── image2.png
│   └── ...
├── Tomato___Early_blight/
├── Potato___healthy/
└── ...
```

### 📋 Requirements

- **Minimum 50 images** per class
- **Maximum 500 images** per class (auto-balanced)
- **Supported formats**: .jpg, .jpeg, .png, .bmp, .tiff
- **Minimum size**: 100x100 pixels
- **Quality**: Not too blurry, good lighting

## 🧠 Model Architecture

### 🏗️ Base Model
- **MobileNetV2** (ImageNet pretrained)
- **Input shape**: (224, 224, 3)
- **Frozen base layers** (first 100 layers)

### 🎯 Custom Head
```
GlobalAveragePooling2D()
→ Dense(128, ReLU)
→ BatchNormalization()
→ Dropout(0.3)
→ Dense(64, ReLU)
→ BatchNormalization()
→ Dropout(0.2)
→ Dense(num_classes, Softmax)
```

### ⚙️ Training Parameters
- **Optimizer**: Adam (lr=0.001)
- **Loss**: Categorical Crossentropy
- **Batch size**: 32
- **Epochs**: 20 (10 frozen + 10 fine-tuned)
- **Data augmentation**: Rotation, zoom, flip, shift

## 📊 Evaluation Metrics

### 🎯 Key Metrics
- **Overall Accuracy**: Primary performance metric
- **Top-3 Accuracy**: Important for farming decisions
- **Per-class F1-score**: Balance for all diseases
- **Confusion Matrix**: Error analysis

### 📋 Sample Output
```json
{
  "accuracy": 0.8734,
  "top_3_accuracy": 0.9567,
  "per_class_metrics": {
    "Tomato___healthy": {
      "precision": 0.92,
      "recall": 0.89,
      "f1_score": 0.90
    }
  }
}
```

## 🔍 Prediction System

### 📊 Input Processing
1. **Image validation**: Size, blur, format check
2. **Preprocessing**: Resize (224x224), normalize
3. **Prediction**: Model inference
4. **Top-3 extraction**: Confidence ranking

### 🎯 Output Format
```json
{
  "status": "success",
  "disease": "Early Blight",
  "confidence": "82%",
  "message": "Your plant may have Early Blight disease",
  "risk": "Medium",
  "top_matches": [
    {"label": "early_blight", "confidence": "82.3"},
    {"label": "late_blight", "confidence": "12.1"},
    {"label": "healthy", "confidence": "5.6"}
  ],
  "advice": {
    "medicine": "Mancozeb",
    "dosage": "2g per liter water",
    "fertilizer": "Apply balanced fertilizer",
    "weather": "Avoid high humidity",
    "tips": "Check nearby plants and act early"
  }
}
```

## 🌐 Multi-Language Support

### 📋 Supported Languages
- **English** (en)
- **Hindi** (hi)
- **Marathi** (mr)

### 🔄 Translation System
- **Input**: `lang` parameter from frontend
- **Output**: Translated advice and messages
- **Fallback**: English if translation missing

### 📝 Example
```json
{
  "lang": "hi",
  "advice": {
    "medicine": "मैनकोजेब",
    "dosage": "2 ग्राम प्रति लीटर पानी",
    "tips": "नजदीकी पौधों की जांच करें और जल्द कार्रवाई करें"
  }
}
```

## 📋 Advisory System

### 🗂️ CSV Structure
```csv
disease,crop,medicine_en,medicine_hi,medicine_mr,dosage,action_en,action_hi,action_mr,weather_effect,farmer_tip_en,farmer_tip_hi,farmer_tip_mr
early_blight,Potato,Mancozeb,मैनकोजेब,मॅन्कोझेब,2g per liter water,Spray medicine and keep spacing,दवा छिड़कें और दूरी रखें,फवारणी करा आणि अंतर ठेवा,Avoid keeping leaves wet,Improve airflow between plants,हवा का प्रवाह बढ़ाएं,हवा खेळती ठेवा
```

### 🎯 Matching Logic
1. **Exact match**: `disease == class_name`
2. **Partial match**: Remove crop prefix and match
3. **Fallback**: Safe default advice

## 🧠 Memory System

### 📊 Session Tracking
- **Session ID**: `user_{user_id}_{date}`
- **Storage**: In-memory with 2-hour TTL
- **Data**: Disease predictions, confidence, advice

### 💾 Saved Information
```python
{
  "timestamp": 1640995200,
  "user_id": "user123",
  "disease": "Early Blight",
  "confidence": "82%",
  "risk": "Medium",
  "top_matches": [...],
  "advice": {...},
  "status": "success"
}
```

## 🔧 Configuration

### ⚙️ Training Config
```python
class Config:
    IMG_SIZE = (224, 224)
    BATCH_SIZE = 32
    EPOCHS = 20
    LEARNING_RATE = 0.001
    VALIDATION_SPLIT = 0.2
    ROTATION_RANGE = 20
    ZOOM_RANGE = 0.2
```

### 📊 Thresholds
- **Low confidence**: < 40%
- **Medium risk**: 60-80%
- **High risk**: > 80%
- **Image quality**: Blur score < 10

## 🚨 Error Handling

### 📸 Image Validation
- **Size check**: Minimum 100x100 pixels
- **Blur detection**: Laplacian variance < 10
- **Format validation**: Supported image types
- **Corruption check**: PIL/OpenCV verification

### 🧠 Model Errors
- **Loading fallback**: Use backup model if main fails
- **Prediction timeout**: 5-second limit
- **Memory management**: Clear cache after 100 predictions

## 📈 Performance Optimization

### ⚡ Inference Speed
- **Model size**: ~14MB (MobileNetV2)
- **Inference time**: ~50ms per image
- **Batch processing**: Support for multiple images
- **Memory usage**: < 100MB for single prediction

### 🔄 Caching
- **Model cache**: Load once, reuse
- **Class mapping**: In-memory storage
- **Advisory cache**: Pandas DataFrame caching

## 🔍 Testing

### 🧪 Unit Tests
```bash
# Test model loading
python -c "from models.train_disease_model import create_mobilenetv2_model; print('Model creation works')"

# Test data preprocessing
python -c "from models.prepare_dataset import DatasetPreparer; print('Dataset prep works')"

# Test prediction pipeline
python -c "from models.evaluate_model import ModelEvaluator; print('Evaluation works')"
```

### 📊 Integration Tests
- **End-to-end flow**: Image → Model → Advice
- **Multi-language**: Test all language outputs
- **Low confidence**: Test < 40% confidence handling
- **Advisory mapping**: Test CSV integration

## 🚀 Deployment

### 📋 Requirements
- **Python**: 3.8+
- **TensorFlow**: 2.8+
- **Pandas**: 1.3+
- **OpenCV**: 4.5+
- **PIL**: 8.0+

### 🔧 Installation
```bash
pip install tensorflow pandas opencv-python pillow scikit-learn matplotlib seaborn
```

### 🌐 API Integration
- **Endpoint**: `/api/v1/disease`
- **Method**: POST
- **Input**: Multipart form with image file
- **Output**: JSON response with predictions and advice

## 📞 Troubleshooting

### ❌ Common Issues

#### Model Loading Error
```bash
# Check model file exists
ls -la backend/models/disease_model.h5

# Verify TensorFlow version
python -c "import tensorflow as tf; print(tf.__version__)"
```

#### Dataset Issues
```bash
# Validate dataset structure
python backend/models/prepare_dataset.py

# Check image quality
python -c "
from PIL import Image
import os
for root, dirs, files in os.walk('backend/data/disease_dataset'):
    for f in files[:5]:  # Check first 5 files
        try:
            img = Image.open(os.path.join(root, f))
            print(f'✅ {f}: {img.size}')
        except:
            print(f'❌ {f}: Invalid')
"
```

#### Memory Issues
```bash
# Monitor memory usage
python -c "
import psutil
print(f'Memory: {psutil.virtual_memory().percent}%')
print(f'Available: {psutil.virtual_memory().available // (1024**3)}GB')
"
```

## 📚 References

- [MobileNetV2 Paper](https://arxiv.org/abs/1801.04381)
- [TensorFlow Keras Guide](https://www.tensorflow.org/guide/keras)
- [Plant Disease Detection Datasets](https://plantvillage.psu.edu/)

## 🤝 Contributing

1. **Add new disease classes**: Update dataset and retrain
2. **Improve accuracy**: Fine-tune hyperparameters
3. **Add languages**: Update advisory CSV translations
4. **Optimize performance**: Model quantization, pruning

## 📄 License

This project is part of AgriFuture AI and follows the same licensing terms.
