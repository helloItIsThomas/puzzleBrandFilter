import Stats from "stats.js";
import { sv } from "./variables.js";

export function createStatsGUI() {
  sv.stats = new Stats();
  sv.stats.showPanel(0);

  sv.stats.dom.style.padding = "0px";

  var thisParent = document.getElementById("statsDisplay");
  thisParent.appendChild(sv.stats.domElement);

  // thisParent.style.position = "absolute";

  var statsALL = document
    .getElementById("statsDisplay")
    .querySelectorAll("canvas");

  for (var i = 0; i < statsALL.length; i++) {
    statsALL[i].style.position = "absolute";
    statsALL[i].style.zIndex = "10000";
    // statsALL[i].style.display = "none";
    // statsALL[i].style.width = "60px";
    // statsALL[i].style.height = "160px";
  }
}
