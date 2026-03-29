import sys

filepath = r'c:\Users\andyc\OneDrive\Documentos\GitHub\pelotify\amateur-football-mvp\src\app\canchas\page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# We want to find the lines for the button closing and add a </div> after it.
# Line 1418 in view_file is index 1417.
# 1416:                 {isSavingPrices ? 'Guardando...' : 'Guardar Todo'}
# 1417:              </button>
# 1418:           </div>

# We will look for this pattern:
target_pattern = "{isSavingPrices ? 'Guardando...' : 'Guardar Todo'}"

for i, line in enumerate(lines):
    if target_pattern in line:
        # Check if lines[i+1] is </button> and lines[i+2] is </div>
        if '</button>' in lines[i+1] and '</div>' in lines[i+2]:
            # This is our spot.
            # Insert </div> after lines[i+2]
            lines.insert(i+3, '        </div>\n')
            print(f"Found and inserted at line {i+4}")
            break

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)
