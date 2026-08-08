(function () {
  var canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  var blobs = [];
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function createBlobs(width, height) {
    var palette = [
      [232, 84, 12],    // terracotta
      [15, 118, 110],   // teal
      [217, 154, 61],   // amber
      [129, 96, 196]    // soft violet
    ];
    var size = Math.min(width, height);
    var list = [];

    for (var i = 0; i < palette.length; i++) {
      list.push({
        x: rand(0, width),
        y: rand(0, height),
        radius: rand(size * 0.32, size * 0.6),
        vx: rand(-0.06, 0.06),
        vy: rand(-0.06, 0.06),
        color: palette[i],
        alpha: rand(0.08, 0.14),
      });
    }

    return list;
  }

  function draw(width, height) {
    ctx.clearRect(0, 0, width, height);

    for (var i = 0; i < blobs.length; i++) {
      var blob = blobs[i];

      if (!reducedMotion) {
        blob.x += blob.vx;
        blob.y += blob.vy;

        if (blob.x < 0 || blob.x > width) blob.vx *= -1;
        if (blob.y < 0 || blob.y > height) blob.vy *= -1;
      }

      var gradient = ctx.createRadialGradient(
        blob.x, blob.y, 0,
        blob.x, blob.y, blob.radius
      );
      gradient.addColorStop(0, "rgba(" + blob.color[0] + ", " + blob.color[1] + ", " + blob.color[2] + ", " + blob.alpha + ")");
      gradient.addColorStop(1, "rgba(" + blob.color[0] + ", " + blob.color[1] + ", " + blob.color[2] + ", 0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(blob.x - blob.radius, blob.y - blob.radius, blob.radius * 2, blob.radius * 2);
    }
  }

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = window.innerWidth;
    var height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    blobs = createBlobs(width, height);
    draw(width, height);
  }

  function animate() {
    draw(window.innerWidth, window.innerHeight);
    window.requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener("resize", resize);

  if (!reducedMotion) {
    animate();
  }
})();
