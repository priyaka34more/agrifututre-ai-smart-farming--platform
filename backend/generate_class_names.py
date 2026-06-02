import os
import json

# IMPORTANT: point to TRAIN folder
DATASET_PATH = r"D:\disease_dataset\plantvillage dataset\New Plant Diseases Dataset(Augmented)\New Plant Diseases Dataset(Augmented)\train"
OUTPUT = "models/class_names.json"

classes = sorted([
    d for d in os.listdir(DATASET_PATH)
    if os.path.isdir(os.path.join(DATASET_PATH, d))
])

os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)

with open(OUTPUT, "w") as f:
    json.dump(classes, f, indent=2)

print("RESTORED SUCCESSFULLY")
print("Total classes:", len(classes))
print(classes)