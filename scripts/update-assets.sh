#!/usr/bin/env bash
set -euo pipefail

# update-assets.sh
# Safely regenerate Android mipmap launcher icons (png + webp) from assets/images
# and regenerate a web favicon.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ASSETS_DIR="$ROOT/assets/images"
RES_DIR="$ROOT/android/app/src/main/res"

# required tools
for cmd in convert identify; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: ImageMagick ('convert' and 'identify') required. Install it (e.g. sudo apt install imagemagick)" >&2
    exit 2
  fi
done


# densities and sizes
declare -A sizes=( ["mipmap-mdpi"]=48 ["mipmap-hdpi"]=72 ["mipmap-xhdpi"]=96 ["mipmap-xxhdpi"]=144 ["mipmap-xxxhdpi"]=192 )

# Helper to generate one image into a folder with png+webp
generate_asset() {
  src="$1"
  dst_folder="$2"
  size="$3"
  name="$4" # basename to write, e.g. ic_launcher, ic_launcher_foreground

  mkdir -p "$dst_folder"
  if [ -f "$src" ]; then
    echo "Generating $dst_folder/$name.webp ($size x $size) from $src"
    convert "$src" -resize ${size}x${size} -background none -gravity center -extent ${size}x${size} "$dst_folder/${name}.png"
    # create webp version too
    convert "$dst_folder/${name}.png" -quality 80 "$dst_folder/${name}.webp"
    #unlink "$dst_folder/${name}.png" # remove png after webp created
  else
    echo "Warning: source $src not found. Skipping $name generation in $dst_folder" >&2
  fi
}

# Generate launcher assets per density
for folder in "${!sizes[@]}"; do
  size=${sizes[$folder]}
  dst="$RES_DIR/$folder"

  generate_asset "$ASSETS_DIR/icon.png" "$dst" "$size" "ic_launcher"
  generate_asset "$ASSETS_DIR/android-icon-foreground.png" "$dst" "$size" "ic_launcher_foreground"
  generate_asset "$ASSETS_DIR/android-icon-background.png" "$dst" "$size" "ic_launcher_background"
  generate_asset "$ASSETS_DIR/android-icon-monochrome.png" "$dst" "$size" "ic_launcher_monochrome"
done

# Regenerate web favicon (32x32) from favicon.png or icon.png
FAV_SRC=""
if [ -f "$ASSETS_DIR/favicon.png" ]; then
  FAV_SRC="$ASSETS_DIR/favicon.png"
elif [ -f "$ASSETS_DIR/icon.png" ]; then
  FAV_SRC="$ASSETS_DIR/icon.png"
fi

if [ -n "$FAV_SRC" ]; then
  echo "Generating web favicon from $FAV_SRC"
  mkdir -p "$ROOT/public"
  convert "$FAV_SRC" -resize 32x32 -background none -gravity center -extent 32x32 "$ROOT/public/favicon.png"
else
  echo "No favicon source found (favicon.png or icon.png). Skipping favicon generation." >&2
fi

echo "Next: inspect android/app/src/main/res/mipmap-*/ and then rebuild: npm run build:android"
