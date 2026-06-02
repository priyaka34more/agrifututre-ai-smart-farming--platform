#!/usr/bin/env python3
"""
🌿 AgriFuture AI - Dataset Preparation Script
Organizes and validates disease detection dataset
"""

import os
import shutil
import json
import numpy as np
from PIL import Image
import cv2
from collections import defaultdict, Counter
import random
import warnings
warnings.filterwarnings('ignore')

class DatasetPreparer:
    def __init__(self, raw_data_path="backend/data/raw_disease_data", 
                 processed_path="backend/data/disease_dataset",
                 min_images_per_class=50,
                 max_images_per_class=500):
        self.raw_data_path = raw_data_path
        self.processed_path = processed_path
        self.min_images_per_class = min_images_per_class
        self.max_images_per_class = max_images_per_class
        
        # 🎯 Supported image formats
        self.supported_formats = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']
        
        # 📊 Statistics
        self.stats = {
            'total_classes': 0,
            'total_images': 0,
            'valid_classes': 0,
            'removed_images': 0,
            'class_distribution': {}
        }
    
    def is_valid_image(self, image_path):
        """Check if image is valid and not corrupted"""
        try:
            # 📖 Try to open with PIL
            with Image.open(image_path) as img:
                img.verify()
            
            # 🔍 Check with OpenCV
            img = cv2.imread(image_path)
            if img is None:
                return False
            
            # 📏 Check minimum size
            height, width = img.shape[:2]
            if width < 100 or height < 100:
                return False
            
            # 🌟 Check if not too blurry
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
            if blur_score < 10:  # Too blurry
                return False
            
            return True
            
        except Exception:
            return False
    
    def clean_class_name(self, class_name):
        """Clean and standardize class names"""
        # 🔄 Replace spaces and special characters
        clean_name = class_name.strip().lower()
        clean_name = clean_name.replace(' ', '_')
        clean_name = clean_name.replace('-', '_')
        clean_name = clean_name.replace('___', '_')
        
        # 🗑️ Remove multiple underscores
        while '__' in clean_name:
            clean_name = clean_name.replace('__', '_')
        
        return clean_name
    
    def balance_dataset(self, class_images):
        """Balance dataset by sampling images"""
        balanced_images = {}
        
        for class_name, images in class_images.items():
            if len(images) < self.min_images_per_class:
                print(f"⚠️ {class_name}: Only {len(images)} images (minimum {self.min_images_per_class})")
                continue
            
            # 🎲 Random sampling
            if len(images) > self.max_images_per_class:
                images = random.sample(images, self.max_images_per_class)
            
            balanced_images[class_name] = images
        
        return balanced_images
    
    def create_train_val_split(self, class_images, val_split=0.2):
        """Create train/validation split"""
        train_images = defaultdict(list)
        val_images = defaultdict(list)
        
        for class_name, images in class_images.items():
            # 🎲 Shuffle images
            random.shuffle(images)
            
            # 📊 Calculate split
            val_count = int(len(images) * val_split)
            val_set = images[:val_count]
            train_set = images[val_count:]
            
            train_images[class_name] = train_set
            val_images[class_name] = val_set
        
        return train_images, val_images
    
    def copy_images(self, class_images, split_name="train"):
        """Copy images to processed dataset directory"""
        split_path = os.path.join(self.processed_path, split_name)
        os.makedirs(split_path, exist_ok=True)
        
        copied_count = 0
        for class_name, images in class_images.items():
            class_path = os.path.join(split_path, class_name)
            os.makedirs(class_path, exist_ok=True)
            
            for img_path in images:
                try:
                    # 📋 Generate new filename
                    filename = f"{class_name}_{copied_count}_{os.path.basename(img_path)}"
                    dest_path = os.path.join(class_path, filename)
                    
                    # 📋 Copy image
                    shutil.copy2(img_path, dest_path)
                    copied_count += 1
                    
                except Exception as e:
                    print(f"❌ Failed to copy {img_path}: {str(e)}")
        
        return copied_count
    
    def prepare_dataset(self):
        """Main dataset preparation function"""
        print("🌿 AgriFuture AI Dataset Preparation")
        print("=" * 50)
        
        # 📁 Check raw data path
        if not os.path.exists(self.raw_data_path):
            print(f"❌ Raw data path not found: {self.raw_data_path}")
            return False
        
        # 🔍 Scan raw dataset
        print("🔍 Scanning raw dataset...")
        class_images = defaultdict(list)
        
        for root, dirs, files in os.walk(self.raw_data_path):
            for file in files:
                if any(file.lower().endswith(ext) for ext in self.supported_formats):
                    file_path = os.path.join(root, file)
                    class_name = os.path.basename(root)
                    
                    # 🧹 Clean class name
                    clean_class = self.clean_class_name(class_name)
                    
                    # ✅ Validate image
                    if self.is_valid_image(file_path):
                        class_images[clean_class].append(file_path)
                    else:
                        self.stats['removed_images'] += 1
        
        # 📊 Update statistics
        self.stats['total_classes'] = len(class_images)
        self.stats['total_images'] = sum(len(images) for images in class_images.values())
        
        print(f"📊 Found {self.stats['total_classes']} classes")
        print(f"📊 Total images: {self.stats['total_images']}")
        print(f"🗑️ Removed invalid images: {self.stats['removed_images']}")
        
        # 📊 Show class distribution
        print("\n📊 Class Distribution:")
        for class_name, images in sorted(class_images.items()):
            print(f"  {class_name}: {len(images)} images")
            self.stats['class_distribution'][class_name] = len(images)
        
        # ⚖️ Balance dataset
        print("\n⚖️ Balancing dataset...")
        balanced_images = self.balance_dataset(class_images)
        self.stats['valid_classes'] = len(balanced_images)
        
        if self.stats['valid_classes'] < 2:
            print("❌ Not enough valid classes for training")
            return False
        
        print(f"✅ Valid classes after balancing: {self.stats['valid_classes']}")
        
        # 🔄 Create train/validation split
        print("\n🔄 Creating train/validation split...")
        train_images, val_images = self.create_train_val_split(balanced_images)
        
        # 📁 Create processed dataset directory
        os.makedirs(self.processed_path, exist_ok=True)
        
        # 📋 Copy training images
        print("📋 Copying training images...")
        train_count = self.copy_images(train_images, "train")
        
        # 📋 Copy validation images
        print("📋 Copying validation images...")
        val_count = self.copy_images(val_images, "val")
        
        # 💾 Save statistics
        stats_path = os.path.join(self.processed_path, "dataset_stats.json")
        with open(stats_path, 'w') as f:
            json.dump(self.stats, f, indent=2)
        
        # 📊 Final report
        print("\n📊 Dataset Preparation Complete!")
        print("=" * 50)
        print(f"📁 Processed dataset: {self.processed_path}")
        print(f"📊 Valid classes: {self.stats['valid_classes']}")
        print(f"📋 Training images: {train_count}")
        print(f"📊 Validation images: {val_count}")
        print(f"📈 Total processed images: {train_count + val_count}")
        print(f"💾 Statistics saved to: {stats_path}")
        
        return True

def create_sample_dataset():
    """Create a sample dataset structure for testing"""
    print("📝 Creating sample dataset structure...")
    
    sample_path = "backend/data/raw_disease_data"
    os.makedirs(sample_path, exist_ok=True)
    
    # 🎯 Sample classes
    classes = [
        "Tomato___healthy",
        "Tomato___Early_blight", 
        "Tomato___Late_blight",
        "Potato___healthy",
        "Potato___Early_blight"
    ]
    
    for class_name in classes:
        class_path = os.path.join(sample_path, class_name)
        os.makedirs(class_path, exist_ok=True)
        
        # 📝 Create placeholder file
        placeholder = os.path.join(class_path, "placeholder.txt")
        with open(placeholder, 'w') as f:
            f.write(f"Placeholder for {class_name}\n")
            f.write("Add actual images here before running preparation script\n")
    
    print(f"📁 Sample structure created at: {sample_path}")
    print("📝 Please add actual images to each class folder")

if __name__ == "__main__":
    # 🎯 Check if raw dataset exists
    raw_path = "backend/data/raw_disease_data"
    if not os.path.exists(raw_path):
        print("❌ Raw dataset not found")
        print("📝 Creating sample dataset structure...")
        create_sample_dataset()
        print("\n📋 Please add your images to the class folders and run again")
    else:
        # 🏃‍♂️ Run dataset preparation
        preparer = DatasetPreparer()
        success = preparer.prepare_dataset()
        
        if success:
            print("\n🎉 Dataset is ready for training!")
            print("🏃‍♂️ Run: python backend/models/train_disease_model.py")
        else:
            print("\n❌ Dataset preparation failed")
            print("📋 Please fix the issues and try again")
