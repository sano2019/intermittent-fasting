path = "/Users/sandernobel/Personal/Code/IntermittentFasting/src/main.ts"
with open(path) as f: lines = f.read().splitlines()
for i in range(136, 170):
    if i < len(lines):
        print(i+1, "|", lines[i])
