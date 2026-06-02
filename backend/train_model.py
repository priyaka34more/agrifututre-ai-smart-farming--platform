import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
import os
import json

# ======================
# CONFIG
# ======================
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS_PHASE1 = 10
EPOCHS_PHASE2 = 5

BASE_DIR = "../dataset"
train_dir = os.path.join(BASE_DIR, "train")
valid_dir = os.path.join(BASE_DIR, "valid")

os.makedirs("models", exist_ok=True)

# ======================
# DATA GENERATORS
# ======================
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    zoom_range=0.2,
    horizontal_flip=True,
    brightness_range=[0.9, 1.1]
)

valid_datagen = ImageDataGenerator(rescale=1./255)

train_data = train_datagen.flow_from_directory(
    train_dir,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical"
)

valid_data = valid_datagen.flow_from_directory(
    valid_dir,
    target_size=IMG_SIZE,
    batch_size=BATCH_SIZE,
    class_mode="categorical"
)

NUM_CLASSES = train_data.num_classes
print("Classes:", train_data.class_indices)

# ======================
# SAVE CLASS NAMES
# ======================
class_names = list(train_data.class_indices.keys())

with open("models/class_names.json", "w") as f:
    json.dump(class_names, f, indent=2)

# ======================
# MODEL (TRANSFER LEARNING)
# ======================
base_model = tf.keras.applications.EfficientNetB0(
    include_top=False,
    weights="imagenet",
    input_shape=(224, 224, 3)
)

base_model.trainable = False  # Phase 1

x = tf.keras.layers.GlobalAveragePooling2D()(base_model.output)
x = tf.keras.layers.BatchNormalization()(x)
x = tf.keras.layers.Dense(256, activation="relu")(x)
x = tf.keras.layers.Dropout(0.4)(x)
output = tf.keras.layers.Dense(NUM_CLASSES, activation="softmax")(x)

model = tf.keras.Model(inputs=base_model.input, outputs=output)

# ======================
# COMPILE (PHASE 1)
# ======================
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.0001),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

# ======================
# CALLBACKS
# ======================
callbacks = [
    tf.keras.callbacks.EarlyStopping(
        patience=3,
        restore_best_weights=True
    ),
    tf.keras.callbacks.ModelCheckpoint(
        "models/best_model.keras",
        save_best_only=True,
        monitor="val_accuracy"
    )
]

# ======================
# TRAIN PHASE 1
# ======================
print("🚀 Training Phase 1 (Frozen base model)")
model.fit(
    train_data,
    validation_data=valid_data,
    epochs=EPOCHS_PHASE1,
    callbacks=callbacks
)

# ======================
# FINE-TUNING (PHASE 2)
# ======================
print("🚀 Training Phase 2 (Fine-tuning)")

base_model.trainable = True

# Freeze most layers, train last 30
for layer in base_model.layers[:-30]:
    layer.trainable = False

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=0.00001),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

model.fit(
    train_data,
    validation_data=valid_data,
    epochs=EPOCHS_PHASE2
)

# ======================
# SAVE FINAL MODEL
# ======================
model.save("models/disease_model.keras")

print("✅ TRAINING COMPLETE")