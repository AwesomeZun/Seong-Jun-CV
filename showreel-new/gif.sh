#!/bin/sh
# Loop GIFs of the 15-second English cuts, made from the rendered MP4s (run render.mjs first).
# The reel is two inks on paper, so 48 colours without dithering keeps it sharp and smaller.
cd "$(dirname "$0")" && mkdir -p gif
for v in en-landscape-15:960 en-portrait-15:540; do
  n=${v%%:*}; w=${v##*:}
  ffmpeg -v error -y -i "mp4/$n.mp4" -map 0:v:0 \
    -vf "fps=15,scale=$w:-2:flags=lanczos,split[a][b];[a]palettegen=max_colors=48:stats_mode=full[p];[b][p]paletteuse=dither=none:diff_mode=rectangle" \
    -loop 0 "gif/$n.gif" && echo "gif/$n.gif"
done
