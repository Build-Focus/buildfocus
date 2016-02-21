import CellType = require("city/cell-type");
import CellShade = require("city/rendering/config/cell-shade");

export = <{ [cellType: string]: { [shade: string]: string } }> {
  [CellType.Grass]: {
    [CellShade.Dark]: "/images/city/grass/grass-dark.png",
    [CellShade.Normal]: "/images/city/grass/grass-normal.png",
    [CellShade.Light]: "/images/city/grass/grass-light.png"
  }
};