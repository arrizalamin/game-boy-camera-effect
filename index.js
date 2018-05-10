const PIXEL_SCALE = 4;
const IMAGE_WIDTH = 128 * PIXEL_SCALE;
const IMAGE_HEIGHT = 112 * PIXEL_SCALE;
const input = document.getElementById('input');
input.value = '';
const source = document.getElementById('source');
source.width = IMAGE_WIDTH;
source.height = IMAGE_HEIGHT;
const sourceCtx = source.getContext('2d');
const target = document.getElementById('target');
target.width = IMAGE_WIDTH;
target.height = IMAGE_HEIGHT;
const targetCtx = target.getContext('2d');
const downloadButton = document.getElementById('download');

const convert8To2Bit = function(number) {
  if (number > 192) {
    return 255;
  }
  if (number > 128) {
    return 170;
  }
  if (number > 64) {
    return 85;
  }
  return 0;
}

const processImage = function(imageData) {
  var newImageData = imageData;
  const len = imageData.data.length
  for (var i = 0; i < len; i += 4) {
    const gray = 0.2989 * imageData.data[i] + 0.5870 * imageData.data[i+1] + 0.1140 * imageData.data[i+2];
    newImageData.data[i] = newImageData.data[i+1] = newImageData.data[i+2] = convert8To2Bit(gray);
  }
  return newImageData;
}

const getImageUrl = function(imageData) {
  const vc = document.createElement('canvas');
  const vctx = vc.getContext('2d');
  vc.width = imageData.width;
  vc.height = imageData.height;
  vctx.putImageData(imageData, 0, 0);
  return vc.toDataURL();
}

const scaleImagePixelated = function(imageData, scale) {
  const url = getImageUrl(imageData);
  return new Promise(function(resolve) {
    const img = new Image();
    img.addEventListener('load', function() {
      const vc = document.createElement('canvas');
      const vctx = vc.getContext('2d');
      const sw = vc.width = imageData.width * scale;
      const sh = vc.height = imageData.height * scale;
      vctx.imageSmoothingEnabled = false;
      vctx.drawImage(img, 0, 0, sw, sh);
      resolve(vctx.getImageData(0, 0, sw, sh))
    });
    img.src = url;
  });
}

input.addEventListener('change', function(e) {
  if (this.files.length < 1) {
    console.log("No files selected!");
  } else {
    const file = this.files[0];
    const img = new Image();
    img.src = window.URL.createObjectURL(file);
    img.addEventListener('load', e => {
      sourceCtx.drawImage(img, 0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
      const imageData = sourceCtx.getImageData(0, 0, IMAGE_WIDTH, IMAGE_HEIGHT);
      const newImageData = processImage(imageData);

      scaleImagePixelated(newImageData, 1 / PIXEL_SCALE)
      .then(i => scaleImagePixelated(i, PIXEL_SCALE))
      .then(i => {
        targetCtx.putImageData(i, 0, 0);
        downloadButton.setAttribute('href', getImageUrl(i));
        downloadButton.style.display = 'block';
      });
      img.style.display = 'none';
    });
  }
});
