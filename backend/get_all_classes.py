import json

with open("models/class_names.json", "r") as f:

    classes = json.load(f)

print("\n✅ TOTAL CLASSES:\n")

print(len(classes))

print("\n========================\n")

for i, c in enumerate(classes, 1):

    print(f"{i}. {c}")