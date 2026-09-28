"""Vendor EZ-Tree from a local checkout (requires Pillow for texture baking).

Usage: python Browser/vendor-eztree.py path/to/ez-tree
Pinned upstream: dcf309bd86bd521083d9c70f01f2de45fdc7c457
"""
from pathlib import Path
import base64
import re
import shutil
import sys
from PIL import Image

source = Path(sys.argv[1])
dest = Path(__file__).parent / 'dist/vendor/ez-tree'
dest.mkdir(parents=True, exist_ok=True)
for path in (source / 'src/lib').rglob('*'):
    if path.suffix not in ('.js', '.json'):
        continue
    target = dest / path.relative_to(source / 'src/lib').with_suffix('.mjs')
    target.parent.mkdir(parents=True, exist_ok=True)
    content = path.read_text(encoding='utf-8')
    if path.suffix == '.json':
        content = 'export default ' + content.rstrip() + ';\n'
    else:
        content = content.replace("from 'three'", "from '../three.module.js'")
        content = re.sub(r"from '(\.[^']+)'", lambda m: "from '" + (m[1] if m[1].endswith('three.module.js') else re.sub(r'\.(json|js)$', '', m[1]) + '.mjs') + "'", content)
    target.write_text(content, encoding='utf-8', newline='\n')
shutil.copyfile(source / 'LICENSE', dest / 'LICENSE')
shutil.copyfile(source / 'src/app/public/textures/LICENSE.md', dest / 'TEXTURES-LICENSE.md')

# Synchronous DataTextures keep Node modelling, offline play, and the compiled
# scene on the same pixels. Flip to WebGL's bottom-up convention at bake time.
textures = source / 'src/app/public/textures'
entries = {}
for name, filename, size in [
    ('oak', 'leaves/oak.png', 256),
    ('bark', 'bark/Bark001_1K-JPG/Bark001_1K-JPG_Color.jpg', 128),
]:
    im = Image.open(textures / filename).convert('RGBA').resize((size, size), Image.Resampling.LANCZOS).transpose(Image.Transpose.FLIP_TOP_BOTTOM)
    entries[name] = (size, base64.b64encode(im.tobytes()).decode('ascii'))
output = '// Baked EZ-Tree textures; see vendor-eztree.py and TEXTURES-LICENSE.md.\n'
for name, (size, data) in entries.items():
    output += f"export const {name} = {{size:{size},rgba:'{data}'}};\n"
(dest / 'texture-data.mjs').write_text(output, encoding='utf-8', newline='\n')
print(f'Vendored EZ-Tree into {dest}')
