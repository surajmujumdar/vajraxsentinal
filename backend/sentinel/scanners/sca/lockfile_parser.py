import os
import re
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class DependencyItem(BaseModel):
    name: str
    version: str
    ecosystem: str  # npm, PyPI, Maven, Go, RubyGems, Packagist, crates.io
    file_path: str
    is_direct: bool = True

def parse_package_json(path: Path, base_dir: Path) -> List[DependencyItem]:
    items = []
    try:
        data = json.loads(path.read_text(encoding="utf-8", errors="ignore"))
        rel_path = str(path.relative_to(base_dir)).replace("\\", "/")
        deps = data.get("dependencies", {})
        dev_deps = data.get("devDependencies", {})
        
        for name, ver in {**deps, **dev_deps}.items():
            clean_ver = re.sub(r'[\^~>=<]', '', ver).strip()
            if clean_ver:
                items.append(DependencyItem(name=name, version=clean_ver, ecosystem="npm", file_path=rel_path, is_direct=True))
    except Exception:
        pass
    return items

def parse_package_lock_json(path: Path, base_dir: Path) -> List[DependencyItem]:
    items = []
    try:
        data = json.loads(path.read_text(encoding="utf-8", errors="ignore"))
        rel_path = str(path.relative_to(base_dir)).replace("\\", "/")
        # npm lock v2/v3 has "packages"
        packages = data.get("packages", {})
        if packages:
            for pkg_path, pkg_info in packages.items():
                if not pkg_path:
                    continue
                name = pkg_info.get("name") or pkg_path.split("node_modules/")[-1]
                version = pkg_info.get("version")
                if name and version:
                    items.append(DependencyItem(name=name, version=version, ecosystem="npm", file_path=rel_path, is_direct=not pkg_path.startswith("node_modules/")))
        else:
            dependencies = data.get("dependencies", {})
            for name, info in dependencies.items():
                version = info.get("version")
                if version:
                    items.append(DependencyItem(name=name, version=version, ecosystem="npm", file_path=rel_path, is_direct=True))
    except Exception:
        pass
    return items

def parse_yarn_lock(path: Path, base_dir: Path) -> List[DependencyItem]:
    items = []
    try:
        content = path.read_text(encoding="utf-8", errors="ignore")
        rel_path = str(path.relative_to(base_dir)).replace("\\", "/")
        current_pkg = None
        for line in content.splitlines():
            line_str = line.strip()
            if line_str and not line_str.startswith("#") and ":" in line_str and not line.startswith(" "):
                # Package header line like `"@babel/core@^7.0.0":`
                match = re.match(r'^"?(@?[^@]+)@', line_str)
                if match:
                    current_pkg = match.group(1).strip('"')
            elif line_str.startswith("version ") and current_pkg:
                ver_match = re.search(r'version\s+"?([^"]+)"?', line_str)
                if ver_match:
                    version = ver_match.group(1)
                    items.append(DependencyItem(name=current_pkg, version=version, ecosystem="npm", file_path=rel_path, is_direct=True))
                    current_pkg = None
    except Exception:
        pass
    return items

def parse_requirements_txt(path: Path, base_dir: Path) -> List[DependencyItem]:
    items = []
    try:
        content = path.read_text(encoding="utf-8", errors="ignore")
        rel_path = str(path.relative_to(base_dir)).replace("\\", "/")
        for line in content.splitlines():
            line_str = line.strip()
            if not line_str or line_str.startswith("#") or line_str.startswith("-r"):
                continue
            match = re.match(r'^([a-zA-Z0-9_\-\.]+)\s*(?:==|>=|<=|~=|===)\s*([a-zA-Z0-9_\-\.]+)', line_str)
            if match:
                items.append(DependencyItem(name=match.group(1), version=match.group(2), ecosystem="PyPI", file_path=rel_path, is_direct=True))
            else:
                # Package name without pinned version
                pkg_match = re.match(r'^([a-zA-Z0-9_\-\.]+)', line_str)
                if pkg_match:
                    items.append(DependencyItem(name=pkg_match.group(1), version="latest", ecosystem="PyPI", file_path=rel_path, is_direct=True))
    except Exception:
        pass
    return items

def parse_poetry_lock(path: Path, base_dir: Path) -> List[DependencyItem]:
    items = []
    try:
        content = path.read_text(encoding="utf-8", errors="ignore")
        rel_path = str(path.relative_to(base_dir)).replace("\\", "/")
        packages = content.split("[[package]]")
        for block in packages[1:]:
            name_match = re.search(r'name\s*=\s*"([^"]+)"', block)
            ver_match = re.search(r'version\s*=\s*"([^"]+)"', block)
            if name_match and ver_match:
                items.append(DependencyItem(name=name_match.group(1), version=ver_match.group(1), ecosystem="PyPI", file_path=rel_path, is_direct=True))
    except Exception:
        pass
    return items

def parse_go_mod(path: Path, base_dir: Path) -> List[DependencyItem]:
    items = []
    try:
        content = path.read_text(encoding="utf-8", errors="ignore")
        rel_path = str(path.relative_to(base_dir)).replace("\\", "/")
        for line in content.splitlines():
            line_str = line.strip()
            if line_str.startswith("require ("):
                continue
            match = re.match(r'^\s*([a-zA-Z0-9\.\-_/]+)\s+v?([a-zA-Z0-9\.\-_+]+)', line_str)
            if match and not line_str.startswith("module") and not line_str.startswith("go "):
                name = match.group(1)
                ver = match.group(2)
                is_indirect = "// indirect" in line_str
                items.append(DependencyItem(name=name, version=ver, ecosystem="Go", file_path=rel_path, is_direct=not is_indirect))
    except Exception:
        pass
    return items

def parse_pom_xml(path: Path, base_dir: Path) -> List[DependencyItem]:
    items = []
    try:
        content = path.read_text(encoding="utf-8", errors="ignore")
        rel_path = str(path.relative_to(base_dir)).replace("\\", "/")
        deps = re.findall(r'<dependency>(.*?)</dependency>', content, re.DOTALL)
        for dep in deps:
            group_m = re.search(r'<groupId>(.*?)</groupId>', dep)
            artifact_m = re.search(r'<artifactId>(.*?)</artifactId>', dep)
            version_m = re.search(r'<version>(.*?)</version>', dep)
            if group_m and artifact_m and version_m:
                full_name = f"{group_m.group(1).strip()}:{artifact_m.group(1).strip()}"
                items.append(DependencyItem(name=full_name, version=version_m.group(1).strip(), ecosystem="Maven", file_path=rel_path, is_direct=True))
    except Exception:
        pass
    return items

def parse_cargo_lock(path: Path, base_dir: Path) -> List[DependencyItem]:
    items = []
    try:
        content = path.read_text(encoding="utf-8", errors="ignore")
        rel_path = str(path.relative_to(base_dir)).replace("\\", "/")
        packages = content.split("[[package]]")
        for block in packages[1:]:
            name_m = re.search(r'name\s*=\s*"([^"]+)"', block)
            ver_m = re.search(r'version\s*=\s*"([^"]+)"', block)
            if name_m and ver_m:
                items.append(DependencyItem(name=name_m.group(1), version=ver_m.group(1), ecosystem="crates.io", file_path=rel_path, is_direct=True))
    except Exception:
        pass
    return items

def parse_gemfile_lock(path: Path, base_dir: Path) -> List[DependencyItem]:
    items = []
    try:
        content = path.read_text(encoding="utf-8", errors="ignore")
        rel_path = str(path.relative_to(base_dir)).replace("\\", "/")
        specs_idx = content.find("GEM")
        if specs_idx != -1:
            specs_content = content[specs_idx:]
            for line in specs_content.splitlines():
                line_str = line.strip()
                match = re.match(r'^([a-zA-Z0-9_\-\.]+)\s*\(([0-9a-zA-Z\.\-_]+)\)', line_str)
                if match and line.startswith("    "):
                    items.append(DependencyItem(name=match.group(1), version=match.group(2), ecosystem="RubyGems", file_path=rel_path, is_direct=True))
    except Exception:
        pass
    return items

def parse_composer_lock(path: Path, base_dir: Path) -> List[DependencyItem]:
    items = []
    try:
        data = json.loads(path.read_text(encoding="utf-8", errors="ignore"))
        rel_path = str(path.relative_to(base_dir)).replace("\\", "/")
        packages = data.get("packages", [])
        for pkg in packages:
            name = pkg.get("name")
            ver = pkg.get("version", "").lstrip("v")
            if name and ver:
                items.append(DependencyItem(name=name, version=ver, ecosystem="Packagist", file_path=rel_path, is_direct=True))
    except Exception:
        pass
    return items

def discover_all_dependencies(root_dir: Path) -> List[DependencyItem]:
    deps: List[DependencyItem] = []
    if not root_dir.exists():
        return deps

    for root, _, files in os.walk(root_dir):
        # Ignore nested dependency folders
        rel_root = str(Path(root).relative_to(root_dir)).replace("\\", "/")
        if any(ignored in rel_root for ignored in ["node_modules", "vendor", ".git", ".venv", "__pycache__"]):
            continue

        for f in files:
            file_path = Path(root) / f
            lower_name = f.lower()

            if lower_name == "package.json":
                deps.extend(parse_package_json(file_path, root_dir))
            elif lower_name == "package-lock.json":
                deps.extend(parse_package_lock_json(file_path, root_dir))
            elif lower_name == "yarn.lock":
                deps.extend(parse_yarn_lock(file_path, root_dir))
            elif lower_name == "requirements.txt" or lower_name.endswith(".requirements.txt"):
                deps.extend(parse_requirements_txt(file_path, root_dir))
            elif lower_name == "poetry.lock":
                deps.extend(parse_poetry_lock(file_path, root_dir))
            elif lower_name == "go.mod":
                deps.extend(parse_go_mod(file_path, root_dir))
            elif lower_name == "pom.xml":
                deps.extend(parse_pom_xml(file_path, root_dir))
            elif lower_name == "cargo.lock":
                deps.extend(parse_cargo_lock(file_path, root_dir))
            elif lower_name == "gemfile.lock":
                deps.extend(parse_gemfile_lock(file_path, root_dir))
            elif lower_name == "composer.lock":
                deps.extend(parse_composer_lock(file_path, root_dir))

    # Deduplicate dependencies
    seen = set()
    unique_deps = []
    for d in deps:
        key = (d.ecosystem, d.name, d.version)
        if key not in seen:
            seen.add(key)
            unique_deps.append(d)
    return unique_deps
