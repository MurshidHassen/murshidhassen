(function () {
  var canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  var nodes = [];
  var animationId = null;
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function createNodes(width, height) {
    var count = Math.floor((width * height) / 28000);
    var list = [];

    for (var i = 0; i < count; i++) {
      list.push({
        x: rand(0, width),
        y: rand(0, height),
        radius: rand(1.2, 3.4),
        vx: rand(-0.18, 0.18),
        vy: rand(-0.18, 0.18),
        hue: rand(185, 205),
        alpha: rand(0.08, 0.22),
      });
    }

    return list;
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

    nodes = createNodes(width, height);
    draw(width, height);
  }

  function drawGrid(width, height) {
    var spacing = 72;
    ctx.strokeStyle = "rgba(56, 189, 248, 0.045)";
    ctx.lineWidth = 1;

    for (var x = 0; x <= width; x += spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (var y = 0; y <= height; y += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  function drawMesh(width, height) {
    var gradient = ctx.createRadialGradient(
      width * 0.18,
      height * 0.12,
      0,
      width * 0.18,
      height * 0.12,
      width * 0.55
    );
    gradient.addColorStop(0, "rgba(56, 189, 248, 0.18)");
    gradient.addColorStop(1, "rgba(56, 189, 248, 0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    var gradientTwo = ctx.createRadialGradient(
      width * 0.82,
      height * 0.08,
      0,
      width * 0.82,
      height * 0.08,
      width * 0.42
    );
    gradientTwo.addColorStop(0, "rgba(52, 211, 153, 0.12)");
    gradientTwo.addColorStop(1, "rgba(52, 211, 153, 0)");

    ctx.fillStyle = gradientTwo;
    ctx.fillRect(0, 0, width, height);
  }

  function drawNodes(width, height) {
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];

      if (!prefersReducedMotion) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
      }

      var glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 8);
      glow.addColorStop(0, "hsla(" + node.hue + ", 90%, 65%, " + node.alpha + ")");
      glow.addColorStop(1, "hsla(" + node.hue + ", 90%, 65%, 0)");

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * 8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.strokeStyle = "rgba(125, 211, 252, 0.05)";
    ctx.lineWidth = 1;

    for (var a = 0; a < nodes.length; a++) {
      for (var b = a + 1; b < nodes.length; b++) {
        var dx = nodes[a].x - nodes[b].x;
        var dy = nodes[a].y - nodes[b].y;
        var distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 140) {
          ctx.globalAlpha = (1 - distance / 140) * 0.35;
          ctx.beginPath();
          ctx.moveTo(nodes[a].x, nodes[a].y);
          ctx.lineTo(nodes[b].x, nodes[b].y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
  }

  function draw(width, height) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0b0f14";
    ctx.fillRect(0, 0, width, height);
    drawMesh(width, height);
    drawGrid(width, height);
    drawNodes(width, height);
  }

  function animate() {
    draw(window.innerWidth, window.innerHeight);
    animationId = window.requestAnimationFrame(animate);
  }

  resize();
  window.addEventListener("resize", resize);

  if (!prefersReducedMotion) {
    animate();
  }
})();
