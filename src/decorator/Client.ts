/**
 * @author Xuezi
 * @email xzj15859722542@hotmail.com
 * @create date 2018-06-22 11:50:15
 * @modify date 2018-06-22 11:50:15
 * @desc [description]
*/

import { ClientContainer } from "../ClientContainer";

export function Client(path: string) {
  return function (target: Function) {
    ClientContainer.registryClient(target, path);
  }
}