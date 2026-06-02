import os

# ✅ YOUR CORRECT DATASET PATH (FINAL)
BASE_PATH = "D:/disease_dataset/plantvillage dataset/New Plant Diseases Dataset(Augmented)/New Plant Diseases Dataset(Augmented)"

def check_split(split):
    path = os.path.join(BASE_PATH, split)

    print(f"\n📂 Checking: {split}")
    print("Path:", path)

    if not os.path.exists(path):
        print("❌ Folder missing!")
        return set()

    classes = os.listdir(path)
    print(f"Total classes: {len(classes)}")

    valid_classes = set()

    for cls in classes:
        cls_path = os.path.join(path, cls)

        if not os.path.isdir(cls_path):
            print(f"❌ Not a folder: {cls}")
            continue

        files = os.listdir(cls_path)

        if len(files) == 0:
            print(f"❌ Empty class: {cls}")
            continue

        image_count = sum(
            1 for f in files if f.lower().endswith((".jpg", ".jpeg", ".png"))
        )

        print(f"✅ {cls}: {image_count} images")

        valid_classes.add(cls)

    return valid_classes


# 🔍 Run checks
train_classes = check_split("train")
valid_classes = check_split("valid")

print("\n🔍 Comparing train vs valid...")

if not train_classes or not valid_classes:
    print("❌ ERROR: Dataset structure issue")
elif train_classes == valid_classes:
    print("✅ PERFECT: Classes match")
else:
    print("❌ ERROR: Class mismatch")
    print("Only in train:", train_classes - valid_classes)
    print("Only in valid:", valid_classes - train_classes)