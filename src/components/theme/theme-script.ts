/**
 * Runs before first paint (inline in <head>) so the page never flashes the
 * wrong theme. Reads the same `ocb.theme` key the original app used
 * ("system" | "light" | "dark", JSON-encoded) and runs the storage migration
 * marker check lazily elsewhere.
 */
export const themeScript = `(function(){try{var d=document.documentElement,p="system";try{var r=localStorage.getItem("ocb.theme");if(r)p=JSON.parse(r)}catch(e){}var dark=p==="dark"||(p!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);d.setAttribute("data-theme",dark?"dark":"light");d.style.colorScheme=dark?"dark":"light"}catch(e){}})();`;
