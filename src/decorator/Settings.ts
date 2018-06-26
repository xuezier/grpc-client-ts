import { SettingRegistry } from "../SettingRegistry";
import { Settings } from "../interface/Settings";

export function Settings(settings: Settings) {
  return function (target: Function) {
    SettingRegistry.registry(settings);
  }
}