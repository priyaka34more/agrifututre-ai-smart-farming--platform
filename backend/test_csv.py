import pandas as pd

df = pd.read_csv("data/advisory.csv")

print("Shape:", df.shape)
print("Columns:")
print(len(df.columns))
print(df.columns.tolist())