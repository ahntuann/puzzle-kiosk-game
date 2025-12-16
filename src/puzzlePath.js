export function generateJigsawGrid(cols, rows) {
  const pieces = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let top = 0, right = 0, bottom = 0, left = 0;
      if (y > 0) top = -pieces[(y - 1) * cols + x].bottom;
      if (x < cols - 1) right = Math.random() > 0.5 ? 1 : -1;
      if (y < rows - 1) bottom = Math.random() > 0.5 ? 1 : -1;
      if (x > 0) left = -pieces[y * cols + (x - 1)].right;
      pieces.push({ r: y, c: x, top, right, bottom, left });
    }
  }
  return pieces;
}

export function getPiecePath(width, height, topTab, rightTab, bottomTab, leftTab, pad) {
  const sX = pad;
  const sY = pad;
  const tabSize = Math.min(width, height) * 0.25;

  let p = `M ${sX} ${sY}`;

  if (topTab === 0) p += ` L ${sX + width} ${sY}`;
  else {
    p += ` L ${sX + width/2 - tabSize} ${sY}`;
    p += ` C ${sX + width/2 - tabSize} ${sY - tabSize * topTab},
            ${sX + width/2 + tabSize} ${sY - tabSize * topTab},
            ${sX + width/2 + tabSize} ${sY}`;
    p += ` L ${sX + width} ${sY}`;
  }

  if (rightTab === 0) p += ` L ${sX + width} ${sY + height}`;
  else {
    p += ` L ${sX + width} ${sY + height/2 - tabSize}`;
    p += ` C ${sX + width + tabSize * rightTab} ${sY + height/2 - tabSize},
            ${sX + width + tabSize * rightTab} ${sY + height/2 + tabSize},
            ${sX + width} ${sY + height/2 + tabSize}`;
    p += ` L ${sX + width} ${sY + height}`;
  }

  if (bottomTab === 0) p += ` L ${sX} ${sY + height}`;
  else {
    p += ` L ${sX + width/2 + tabSize} ${sY + height}`;
    p += ` C ${sX + width/2 + tabSize} ${sY + height + tabSize * bottomTab},
            ${sX + width/2 - tabSize} ${sY + height + tabSize * bottomTab},
            ${sX + width/2 - tabSize} ${sY + height}`;
    p += ` L ${sX} ${sY + height}`;
  }

  if (leftTab === 0) p += " Z";
  else {
    p += ` L ${sX} ${sY + height/2 + tabSize}`;
    p += ` C ${sX - tabSize * leftTab} ${sY + height/2 + tabSize},
            ${sX - tabSize * leftTab} ${sY + height/2 - tabSize},
            ${sX} ${sY + height/2 - tabSize}`;
    p += " Z";
  }

  return p;
}
