/**
 * @author Xuezi
 * @email xzj15859722542@hotmail.com
 * @create date 2018-06-22 11:49:57
 * @modify date 2018-06-22 11:49:57
 * @desc [description]
 */
import * as GRPC from 'grpc';
import * as protoLoader from '@grpc/proto-loader';
import { Property } from './interface/Property';

export class ClientContainer {
  static clients: { service: any, client?: GRPC.Client, target: any }[] = [];
  static routes: { target: any, property: Property, key: string }[] = [];

  static registryClient(target: any, path: string) {
    let packageDefinition = protoLoader.loadSync(path, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
    });
    let protoDescriptor = GRPC.loadPackageDefinition(packageDefinition);

    const packages = Object.keys(protoDescriptor);
    for (let packageKey of packages) {
      for (let key in protoDescriptor[packageKey]) {
        if (protoDescriptor[packageKey][key].hasOwnProperty('service')) {
          this.clients.push({ target, service: protoDescriptor[packageKey][key] });
        }
      }
    }
  }

  static registryRoute(target: any, property: Property, key: string) {
    this.routes.push({ target, property, key });
  }

  static generateRouteFunc(route: { target: any, property: Property, key: string }) {
    let func = this._generateRouteFunc(route.property.value, route.target, route.key);

    Object.defineProperty(route.target.constructor.prototype, route.key, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: func
    });
    // route.target.constructor.prototype[route.key] = func;
    route.property.value = func;
  }

  private static _generateRouteFunc(route: Function, target: any, key: string): Function {
    let clientContainer = this
    .getClient(target.constructor);
    let _func = clientContainer.client[key];
    let {requestStream, responseStream} = _func;

    let func;

    if (requestStream && responseStream) {

      func = async function(): Promise<any> {
        if (_func instanceof Function) {
          let _routeFunc = route;
          let _writeData = arguments[0] || {};

          let call = _func.call(clientContainer.client);
          return new Promise(async(resolve: Function, reject: Function) => {
            let result: any;
            let error: any;

            call.on('data', async(chunk) => {
              result = await _routeFunc(_writeData, chunk);
              if (!result) {
                result = chunk;
              }
              call.end();
            });

            call.on('error', e => {
              error = e;
              call.end();
            });

            call.on('end', () => {
              if (error) {
                return reject(error);
              }
              resolve(result);
            });

            call.write(_writeData);
          });
        }
      };
    } else if (requestStream && !responseStream) {
      func = async function(): Promise<any> {
        let _routeFunc = route;
        let _writeData = arguments[0] || {};

        return new Promise(async(resolve: Function, reject: Function) => {
          let call = _func.call(clientContainer.client, async(err, res) => {
            if (err) return reject(err);

            const result = await _routeFunc(_writeData, res);
            if (!result) {
              result = chunk;
            }
            resolve(result);
          });

          call.on('error', e => {
            reject(e);
            call.end && call.end();
          });

          call.write(_writeData);
          call.end();
        });
      };
    } else if (!requestStream && responseStream) {
      func = async function(): Promise<any> {
        let _routeFunc = route;
        let _writeData = arguments[0] || {};

        return new Promise((resolve: Function, reject: Function) => {
          let call = _func.call(clientContainer.client, _writeData);

          call.on('error', e => {
            reject(e);
            call.end && call.end();
          });

          call.on('end', () => {
            call.end && call.end();
          });

          call.on('data', async chunk => {
            const result = await _routeFunc(_writeData, chunk);
            if (!result) {
              result = chunk;
            }
            resolve(result);
          });
        });
      };

    } else if (!requestStream && !responseStream) {
      func = async function(): Promise<any> {
        let _routeFunc = route;
        let _writeData = arguments[0] || {};

        return new Promise((resolve, reject) => {
          _func.call(clientContainer.client, _writeData, async(err, res) => {
            if (err) return reject(err);

            const result = await _routeFunc(_writeData, res);
            if (!result) {
              result = chunk;
            }
            resolve(result);
          });
        });
      };
    }

    return func;
  }

  static getRoutes(target: any): { target: any, property: Property, key: string }[] {
    let routes = this.routes.filter(route => route.target.constructor === target);
    return routes;
  }

  static getRoute(target: any, key: string): { target: any, property: Property, key: string } {
    let route = this.routes.find(route => (route.key === key && route.target === target));
    return route;
  }

  static getClient(target: any) {
    let client = this.clients.find(client => client.target === target);
    return client;
  }
}
