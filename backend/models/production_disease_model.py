"""
🌱 PRODUCTION DISEASE DETECTION MODEL
=====================================
MobileNetV2 Transfer Learning for Production Accuracy

Features:
- Transfer Learning with MobileNetV2
- Data Augmentation (rotation, brightness, zoom)
- Proper preprocessing pipeline
- Confidence filtering
- Top-K predictions
"""

import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout, BatchNormalization
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
import numpy as np
import os
import logging

logger = logging.getLogger("ProductionModel")

class ProductionDiseaseModel:
    def __init__(self, num_classes=38, input_shape=(224, 224, 3)):
        self.num_classes = num_classes
        self.input_shape = input_shape
        self.model = None
        self.class_names = []
        
    def create_model(self):
        """Create MobileNetV2 transfer learning model"""
        try:
            # Load MobileNetV2 pre-trained on ImageNet
            base_model = MobileNetV2(
                weights='imagenet',
                include_top=False,
                input_shape=self.input_shape
            )
            
            # Freeze base model layers initially
            base_model.trainable = False
            
            # Add custom classification head
            x = base_model.output
            x = GlobalAveragePooling2D()(x)
            x = BatchNormalization()(x)
            x = Dropout(0.3)(x)
            x = Dense(256, activation='relu')(x)
            x = BatchNormalization()(x)
            x = Dropout(0.2)(x)
            predictions = Dense(self.num_classes, activation='softmax')(x)
            
            # Create final model
            self.model = Model(inputs=base_model.input, outputs=predictions)
            
            # Compile with appropriate optimizer
            self.model.compile(
                optimizer=Adam(learning_rate=0.001),
                loss='categorical_crossentropy',
                metrics=['accuracy', 'top_k_categorical_accuracy']
            )
            
            logger.info("✅ Production model created successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Model creation failed: {e}")
            return False
    
    def create_data_generators(self, train_dir, val_dir, batch_size=32):
        """Create augmented data generators for training"""
        try:
            # Training data generator with augmentation
            train_datagen = ImageDataGenerator(
                rescale=1./255,
                rotation_range=20,
                width_shift_range=0.2,
                height_shift_range=0.2,
                shear_range=0.2,
                zoom_range=0.2,
                horizontal_flip=True,
                vertical_flip=True,
                brightness_range=[0.8, 1.2],
                fill_mode='nearest',
                validation_split=0.2
            )
            
            # Validation data generator (no augmentation)
            val_datagen = ImageDataGenerator(
                rescale=1./255,
                validation_split=0.2
            )
            
            # Create generators
            train_generator = train_datagen.flow_from_directory(
                train_dir,
                target_size=(224, 224),
                batch_size=batch_size,
                class_mode='categorical',
                subset='training',
                shuffle=True
            )
            
            val_generator = val_datagen.flow_from_directory(
                val_dir,
                target_size=(224, 224),
                batch_size=batch_size,
                class_mode='categorical',
                subset='validation',
                shuffle=False
            )
            
            # Store class names
            self.class_names = list(train_generator.class_indices.keys())
            logger.info(f"📊 Classes loaded: {len(self.class_names)}")
            
            return train_generator, val_generator
            
        except Exception as e:
            logger.error(f"❌ Data generator creation failed: {e}")
            return None, None
    
    def train_model(self, train_generator, val_generator, epochs=50, model_save_path="models/production_disease_model.h5"):
        """Train the model with callbacks"""
        try:
            # Create callbacks
            callbacks = [
                EarlyStopping(
                    monitor='val_accuracy',
                    patience=10,
                    restore_best_weights=True,
                    verbose=1
                ),
                ReduceLROnPlateau(
                    monitor='val_loss',
                    factor=0.2,
                    patience=5,
                    min_lr=1e-7,
                    verbose=1
                ),
                ModelCheckpoint(
                    filepath=model_save_path,
                    monitor='val_accuracy',
                    save_best_only=True,
                    save_weights_only=False,
                    verbose=1
                )
            ]
            
            # Train initial phase (base model frozen)
            logger.info("🚀 Phase 1: Training with frozen base model")
            history = self.model.fit(
                train_generator,
                validation_data=val_generator,
                epochs=epochs//2,
                callbacks=callbacks,
                verbose=1
            )
            
            # Unfreeze some base model layers for fine-tuning
            logger.info("🔧 Phase 2: Fine-tuning with unfrozen layers")
            base_model = self.model.layers[0]
            base_model.trainable = True
            
            # Freeze early layers, unfreeze later layers
            for layer in base_model.layers[:100]:
                layer.trainable = False
            
            # Re-compile with lower learning rate
            self.model.compile(
                optimizer=Adam(learning_rate=0.0001),
                loss='categorical_crossentropy',
                metrics=['accuracy', 'top_k_categorical_accuracy']
            )
            
            # Continue training
            history_fine = self.model.fit(
                train_generator,
                validation_data=val_generator,
                epochs=epochs//2,
                callbacks=callbacks,
                verbose=1
            )
            
            # Save final model
            self.model.save(model_save_path)
            logger.info(f"💾 Model saved to {model_save_path}")
            
            return history, history_fine
            
        except Exception as e:
            logger.error(f"❌ Training failed: {e}")
            return None, None
    
    def predict_with_confidence(self, image_array, top_k=3):
        """Make prediction with confidence filtering"""
        try:
            if self.model is None:
                raise ValueError("Model not loaded")
            
            # Make prediction
            predictions = self.model.predict(image_array, verbose=0)[0]
            
            # Get top K predictions
            top_indices = predictions.argsort()[-top_k:][::-1]
            top_predictions = [
                {
                    'label': self.class_names[i],
                    'confidence': float(predictions[i])
                }
                for i in top_indices
            ]
            
            # Get best prediction
            best_prediction = top_predictions[0]
            
            return {
                'best_prediction': best_prediction,
                'top_predictions': top_predictions,
                'confidence': best_prediction['confidence'],
                'is_confident': best_prediction['confidence'] > 0.7
            }
            
        except Exception as e:
            logger.error(f"❌ Prediction failed: {e}")
            return None
    
    def load_model(self, model_path):
        """Load trained model"""
        try:
            self.model = tf.keras.models.load_model(model_path)
            logger.info(f"✅ Model loaded from {model_path}")
            return True
        except Exception as e:
            logger.error(f"❌ Model loading failed: {e}")
            return False
    
    def get_model_summary(self):
        """Get model architecture summary"""
        if self.model is None:
            return "Model not created yet"
        
        # Capture summary as string
        import io
        import sys
        old_stdout = sys.stdout
        sys.stdout = buffer = io.StringIO()
        self.model.summary()
        sys.stdout = old_stdout
        return buffer.getvalue()

# =========================
# 🚀 TRAINING SCRIPT
# =========================
def train_production_model():
    """Main training function"""
    try:
        # Initialize model
        model_trainer = ProductionDiseaseModel(num_classes=38)
        
        # Create model architecture
        if not model_trainer.create_model():
            return False
        
        # Setup data paths (adjust as needed)
        train_dir = "data/train"
        val_dir = "data/val"
        
        # Create data generators
        train_gen, val_gen = model_trainer.create_data_generators(train_dir, val_dir)
        if train_gen is None or val_gen is None:
            return False
        
        # Train model
        history, fine_history = model_trainer.train_model(train_gen, val_gen)
        
        if history is not None:
            logger.info("🎉 Production model training completed successfully!")
            return True
        else:
            logger.error("❌ Model training failed")
            return False
            
    except Exception as e:
        logger.error(f"❌ Training script failed: {e}")
        return False

if __name__ == "__main__":
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    
    # Train production model
    success = train_production_model()
    if success:
        print("✅ Production disease detection model ready!")
    else:
        print("❌ Model training failed. Check logs for details.")
