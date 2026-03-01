import { readFileSync } from "fs"
import { resolve } from "path"

/**
 * Vite plugin that injects a branding script into the admin HTML.
 * This ensures the Letscase logo and text appear on ALL admin pages,
 * including those without widget injection zones (invite, reset-password).
 */
export function letscaseBrandingPlugin() {
  // Read the logo base64 data from logo-data.ts at plugin init time
  let logoDataUrl = ""
  try {
    const logoDataPath = resolve(process.cwd(), "src/admin/widgets/logo-data.ts")
    const content = readFileSync(logoDataPath, "utf8")
    const match = content.match(/"(data:image[^"]+)"/)
    if (match) logoDataUrl = match[1]
  } catch {
    // Fallback: empty string means logo replacement is skipped
  }

  return {
    name: "letscase-branding",
    transformIndexHtml(html) {
      const script = `
<script>
(function() {
  var LOGO = "${logoDataUrl}";
  function replaceBranding() {
    // Replace Medusa SVG logos (AvatarBox 400x400 and LogoBox 36x38)
    var sels = ['svg[viewBox="0 0 400 400"]', 'svg[viewBox="0 0 36 38"]'];
    sels.forEach(function(sel) {
      document.querySelectorAll(sel).forEach(function(svg) {
        if (svg.getAttribute("data-lc-replaced")) return;
        var parent = svg.parentElement;
        if (!parent) return;
        if (LOGO) {
          var img = document.createElement("img");
          img.src = LOGO;
          img.alt = "Letscase";
          img.style.cssText = "width:100%;height:100%;object-fit:contain;border-radius:10px;";
          parent.insertBefore(img, svg);
        }
        svg.setAttribute("data-lc-replaced", "true");
        svg.style.display = "none";
      });
    });
    // Replace "Welcome to Medusa" text
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && node.nodeValue.indexOf("Welcome to Medusa") !== -1) {
        node.nodeValue = node.nodeValue.replace("Welcome to Medusa", "Welcome to Letscase");
      }
    }
  }
  // Run on DOMContentLoaded + delayed + persistent observer
  function init() {
    replaceBranding();
    setTimeout(replaceBranding, 200);
    setTimeout(replaceBranding, 800);
    setTimeout(replaceBranding, 2000);
    var observer = new MutationObserver(function() { replaceBranding(); });
    observer.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
</script>`
      // Inject before closing </body> tag
      return html.replace("</body>", script + "\n</body>")
    },
  }
}
