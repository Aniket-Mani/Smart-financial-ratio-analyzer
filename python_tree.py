import os

# folders to skip
EXCLUDE_DIRS = {"node_modules", "__pycache__", ".git", "dist", "build", "venv"}

def print_directory_tree(start_path=".", indent=""):
    items = sorted(os.listdir(start_path))
    for index, item in enumerate(items):
        path = os.path.join(start_path, item)
        is_last = index == len(items) - 1
        branch = "└── " if is_last else "├── "

        if os.path.isdir(path):
            if item in EXCLUDE_DIRS:
                continue
            print(indent + branch + item + "/")
            new_indent = indent + ("    " if is_last else "│   ")
            print_directory_tree(path, new_indent)
        else:
            print(indent + branch + item)

if __name__ == "__main__":
    print("\n📁 Project Directory Structure:\n")
    print_directory_tree(".")
