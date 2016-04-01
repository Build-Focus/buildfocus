import PomodoroState = require("app/scripts/pomodoro/pomodoro-state");
import serialization = require('app/scripts/city/serialization/serialization-format');
import Buildings = require('app/scripts/city/buildings/buildings');
import BuildingType = require('app/scripts/city/buildings/building-type');

var chromeStub = <typeof SinonChrome> <any> window.chrome;

function getLastSavedValue(valueKey: string, storageType: string = "local"): any {
  return _(chromeStub.storage[storageType].set.args).map(args => args[0][valueKey]).reject(_.isUndefined).last();
}

export var pomodoroTimeRemaining = () => <number> getLastSavedValue("pomodoro-service-time-remaining");
export var isPomodoroActive =      () => getLastSavedValue("pomodoro-service-state") === PomodoroState.Active;
export var isPomodoroPaused =      () => getLastSavedValue("pomodoro-service-state") === PomodoroState.Paused;
export var isBreakActive =         () => getLastSavedValue("pomodoro-service-state") === PomodoroState.Break;

export var currentCityData =       () => <serialization.CityData> getLastSavedValue("city-data");

export function currentCityValue() {
  var lastStoredCityData = currentCityData();

  var buildingPointsValue = {
    [BuildingType.BasicHouse]: 1,
    [BuildingType.NiceHouse]: 2,
    [BuildingType.FancyHouse]: 5
  };

  if (lastStoredCityData) {
    return _.sum(lastStoredCityData.map.buildings, (building: Buildings.Building) => {
      return buildingPointsValue[building.buildingType]
    });
  } else {
    return 0;
  }
}

export function currentCitySize() {
  var lastStoredCityData = currentCityData();
  if (lastStoredCityData) {
    return lastStoredCityData.map.buildings.length;
  } else {
    return 0;
  }
}
