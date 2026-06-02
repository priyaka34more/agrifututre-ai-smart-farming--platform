#!/usr/bin/env python3
"""
🌿 AgriFuture AI - Disease Detection Model Training
MobileNetV2 based model for crop disease detection
"""

import os
import json
import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import GlobalAveragePooling2D, Dense, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import ModelCheckpoint, EarlyStopping, ReduceLROnPlateau
from sklearn.utils.class_weight import compute_class_weight
import cv2
from collections import Counter
import warnings
warnings.filterwarnings('ignore')

# 📊 CONFIGURATION
class Config:
    # Model parameters
    IMG_SIZE = (224, 224)
    BATCH_SIZE = 32
    EPOCHS = 20
    LEARNING_RATE = 0.001
    
    # Data paths
    DATASET_PATH = "backend/data/disease_dataset"
    MODEL_SAVE_PATH = "backend/models/disease_model.h5"
    CLASS_MAPPING_PATH = "backend/models/class_names.json"
    
    # Training parameters
    VALIDATION_SPLIT = 0.2
    TEST_SPLIT = 0.1
    
    # Data augmentation
    ROTATION_RANGE = 20
    ZOOM_RANGE = 0.2
    HORIZONTAL_FLIP = True
    
    # Early stopping
    PATIENCE = 5
    MIN_DELTA = 0.001

def create_data_generators(config):
    """Create training and validation data generators with augmentation"""
    
    # 🎨 Data augmentation for training
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=config.ROTATION_RANGE,
        zoom_range=config.ZOOM_RANGE,
        horizontal_flip=config.HORIZONTAL_FLIP,
        width_shift_range=0.1,
        height_shift_range=0.1,
        shear_range=0.1,
        fill_mode='nearest',
        validation_split=config.VALIDATION_SPLIT
    )
    
    # 📊 Validation data generator (no augmentation)
    val_datagen = ImageDataGenerator(
        rescale=1./255,
        validation_split=config.VALIDATION_SPLIT
    )
    
    # 🔄 Training generator
    train_generator = train_datagen.flow_from_directory(
        config.DATASET_PATH,
        target_size=config.IMG_SIZE,
        batch_size=config.BATCH_SIZE,
        class_mode='categorical',
        subset='training',
        shuffle=True
    )
    
    # 📊 Validation generator
    val_generator = val_datagen.flow_from_directory(
        config.DATASET_PATH,
        target_size=config.IMG_SIZE,
        batch_size=config.BATCH_SIZE,
        class_mode='categorical',
        subset='validation',
        shuffle=False
    )
    
    return train_generator, val_generator

def create_mobilenetv2_model(config, num_classes):
    """Create MobileNetV2 model with custom classification head"""
    
    # 🧠 Load pretrained MobileNetV2
    base_model = MobileNetV2(
        weights='imagenet',
        include_top=False,
        input_shape=(config.IMG_SIZE[0], config.IMG_SIZE[1], 3)
    )
    
    # 🔄 Freeze base model layers initially
    base_model.trainable = False
    
    # 🏗️ Custom classification head
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    x = BatchNormalization()(x)
    x = Dropout(0.3)(x)
    x = Dense(64, activation='relu')(x)
    x = BatchNormalization()(x)
    x = Dropout(0.2)(x)
    
    # 🎯 Output layer
    predictions = Dense(num_classes, activation='softmax')(x)
    
    # 🏭 Create model
    model = Model(inputs=base_model.input, outputs=predictions)
    
    return model, base_model

def calculate_class_weights(train_generator):
    """Calculate class weights for balanced training"""
    
    # 📊 Get class counts
    class_counts = Counter(train_generator.classes)
    total_samples = sum(class_counts.values())
    
    # 🧮 Calculate weights
    class_weights = {}
    for class_idx, count in class_counts.items():
        weight = total_samples / (len(class_counts) * count)
        class_weights[class_idx] = weight
    
    return class_weights

def train_model(config):
    """Main training function"""
    
    print("🌿 Starting AgriFuture AI Disease Detection Model Training")
    print("=" * 60)
    
    # 📁 Check dataset path
    if not os.path.exists(config.DATASET_PATH):
        print(f"❌ Dataset path not found: {config.DATASET_PATH}")
        print("Please ensure the dataset is properly organized with class folders")
        return
    
    # 🔄 Create data generators
    print("📊 Creating data generators...")
    train_generator, val_generator = create_data_generators(config)
    
    # 📊 Get class information
    num_classes = len(train_generator.class_indices)
    class_names = list(train_generator.class_indices.keys())
    
    print(f"📋 Found {num_classes} classes:")
    for i, class_name in enumerate(class_names):
        print(f"  {i}: {class_name}")
    
    # 💾 Save class mapping
    class_mapping = {v: k for k, v in train_generator.class_indices.items()}
    with open(config.CLASS_MAPPING_PATH, 'w') as f:
        json.dump(class_mapping, f, indent=2)
    print(f"💾 Class mapping saved to {config.CLASS_MAPPING_PATH}")
    
    # 🧮 Calculate class weights
    class_weights = calculate_class_weights(train_generator)
    print("🎯 Class weights calculated for balanced training")
    
    # 🏗️ Create model
    print("🧠 Creating MobileNetV2 model...")
    model, base_model = create_mobilenetv2_model(config, num_classes)
    
    # 📊 Compile model
    model.compile(
        optimizer=Adam(learning_rate=config.LEARNING_RATE),
        loss='categorical_crossentropy',
        metrics=['accuracy', 'top_k_categorical_accuracy']
    )
    
    print("📊 Model architecture:")
    model.summary()
    
    # 🔄 Callbacks
    callbacks = [
        ModelCheckpoint(
            config.MODEL_SAVE_PATH,
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1
        ),
        EarlyStopping(
            monitor='val_accuracy',
            patience=config.PATIENCE,
            min_delta=config.MIN_DELTA,
            mode='max',
            verbose=1,
            restore_best_weights=True
        ),
        ReduceLROnPlateau(
            monitor='val_accuracy',
            factor=0.5,
            patience=3,
            min_lr=1e-7,
            mode='max',
            verbose=1
        )
    ]
    
    # 🏃‍♂️ Phase 1: Train with frozen base layers
    print("\n🔒 Phase 1: Training with frozen base layers...")
    history_phase1 = model.fit(
        train_generator,
        steps_per_epoch=len(train_generator),
        epochs=config.EPOCHS // 2,
        validation_data=val_generator,
        validation_steps=len(val_generator),
        class_weight=class_weights,
        callbacks=callbacks,
        verbose=1
    )
    
    # 🔄 Phase 2: Fine-tune with unfrozen layers
    print("\n🔓 Phase 2: Fine-tuning with unfrozen layers...")
    
    # Unfreeze top layers
    base_model.trainable = True
    # Freeze first 100 layers
    for layer in base_model.layers[:100]:
        layer.trainable = False
    
    # Recompile with lower learning rate
    model.compile(
        optimizer=Adam(learning_rate=config.LEARNING_RATE / 10),
        loss='categorical_crossentropy',
        metrics=['accuracy', 'top_k_categorical_accuracy']
    )
    
    # Continue training
    history_phase2 = model.fit(
        train_generator,
        steps_per_epoch=len(train_generator),
        epochs=config.EPOCHS // 2,
        validation_data=val_generator,
        validation_steps=len(val_generator),
        class_weight=class_weights,
        callbacks=callbacks,
        verbose=1
    )
    
    # 📊 Final evaluation
    print("\n📊 Final model evaluation:")
    loss, accuracy, top_k_accuracy = model.evaluate(val_generator, verbose=0)
    print(f"Validation Loss: {loss:.4f}")
    print(f"Validation Accuracy: {accuracy:.4f}")
    print(f"Top-5 Accuracy: {top_k_accuracy:.4f}")
    
    # 💾 Save final model
    model.save(config.MODEL_SAVE_PATH)
    print(f"💾 Model saved to {config.MODEL_SAVE_PATH}")
    
    print("\n🎉 Training completed successfully!")
    print("=" * 60)
    
    return model, history_phase1, history_phase2

def validate_dataset_structure(dataset_path):
    """Validate dataset structure and provide recommendations"""
    
    print("🔍 Validating dataset structure...")
    
    if not os.path.exists(dataset_path):
        print(f"❌ Dataset path does not exist: {dataset_path}")
        return False
    
    class_dirs = [d for d in os.listdir(dataset_path) 
                  if os.path.isdir(os.path.join(dataset_path, d))]
    
    if not class_dirs:
        print("❌ No class directories found")
        return False
    
    print(f"📁 Found {len(class_dirs)} class directories:")
    
    valid_classes = []
    for class_dir in class_dirs:
        class_path = os.path.join(dataset_path, class_dir)
        image_files = []
        
        for ext in ['.jpg', '.jpeg', '.png', '.bmp']:
            image_files.extend([f for f in os.listdir(class_path) 
                              if f.lower().endswith(ext)])
        
        if len(image_files) >= 10:  # Minimum 10 images per class
            valid_classes.append(class_dir)
            print(f"  ✅ {class_dir}: {len(image_files)} images")
        else:
            print(f"  ⚠️ {class_dir}: {len(image_files)} images (minimum 10 recommended)")
    
    if len(valid_classes) < 2:
        print("❌ Need at least 2 valid classes for training")
        return False
    
    print(f"✅ Found {len(valid_classes)} valid classes for training")
    return True

if __name__ == "__main__":
    config = Config()
    
    # 🔍 Validate dataset first
    if not validate_dataset_structure(config.DATASET_PATH):
        print("\n❌ Please fix dataset structure before training")
        exit(1)
    
    # 🏃‍♂️ Start training
    try:
        model, history1, history2 = train_model(config)
        print("\n🎉 Model training completed successfully!")
        print("📁 Model saved to:", config.MODEL_SAVE_PATH)
        print("📋 Class mapping saved to:", config.CLASS_MAPPING_PATH)
        
    except Exception as e:
        print(f"\n❌ Training failed: {str(e)}")
        import traceback
        traceback.print_exc()
