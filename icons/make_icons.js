// Renders the ASK Video icon (full-size black rounded square, white "ASK") to PNG with macOS AppKit.
// Run: osascript -l JavaScript icons/make_icons.js <output folder>
ObjC.import('AppKit');

function render(S, path) {
  const rep = $.NSBitmapImageRep.alloc.initWithBitmapDataPlanesPixelsWidePixelsHighBitsPerSampleSamplesPerPixelHasAlphaIsPlanarColorSpaceNameBytesPerRowBitsPerPixel(
    null, S, S, 8, 4, true, false, $.NSDeviceRGBColorSpace, 0, 0);
  const ctx = $.NSGraphicsContext.graphicsContextWithBitmapImageRep(rep);
  $.NSGraphicsContext.saveGraphicsState;
  $.NSGraphicsContext.setCurrentContext(ctx);

  // The plate fills the whole icon; the word spans most of its width.
  const k = S / 128;
  $.NSColor.blackColor.setFill;
  $.NSBezierPath.bezierPathWithRoundedRectXRadiusYRadius($.NSMakeRect(0, 0, S, S), 24 * k, 24 * k).fill;

  const text = $('ASK');
  const attrsFor = (fontSize) => {
    const a = $.NSMutableDictionary.alloc.init;
    a.setObjectForKey($.NSFont.systemFontOfSizeWeight(fontSize, $.NSFontWeightHeavy), $.NSFontAttributeName);
    a.setObjectForKey($.NSColor.whiteColor, $.NSForegroundColorAttributeName);
    a.setObjectForKey($(-0.02 * fontSize), $.NSKernAttributeName);
    return a;
  };
  // Size the font so the word is 84% of the icon width.
  const fontSize = 100 * (0.84 * S) / text.sizeWithAttributes(attrsFor(100)).width;
  const attrs = attrsFor(fontSize);
  const font = $.NSFont.systemFontOfSizeWeight(fontSize, $.NSFontWeightHeavy);
  const size = text.sizeWithAttributes(attrs);
  // Center the capitals optically: baseline sits half a cap height below the middle.
  const baseline = S / 2 - font.capHeight / 2;
  text.drawAtPointWithAttributes($.NSMakePoint((S - size.width) / 2 + 0.01 * fontSize, baseline + font.descender), attrs);

  $.NSGraphicsContext.restoreGraphicsState;
  const png = rep.representationUsingTypeProperties($.NSBitmapImageFileTypePNG, $());
  if (!png.writeToFileAtomically($(path), true)) throw new Error('could not write ' + path);
}

function run(argv) {
  const dir = argv[0];
  [16, 32, 48, 128].forEach((s) => render(s, `${dir}/icon${s}.png`));
  return 'ok';
}
