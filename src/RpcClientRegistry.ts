/**
 * @author Xuezi
 * @email xzj15859722542@hotmail.com
 * @create date 2018-06-22 11:50:05
 * @modify date 2018-06-22 11:50:05
 * @desc [description]
 */
import * as GRPC from "grpc";
import * as FS from "fs";
import { SettingRegistry } from "./SettingRegistry";
import { ClientContainer } from "./ClientContainer";

export class RpcClientRegistry {
  private static _credentials: GRPC.ChannelCredentials;
  private static _ca: string;
  private static _client_cert: string;
  private static _client_key: string;
  private static _port: number | string;
  private static _host: string;

  static get ca(): string {
    return this._ca;
  }
  static get client_cert(): string {
    return this._client_cert;
  }
  static get client_key(): string {
    return this._client_key;
  }
  static get port(): string | number {
    return this._port;
  }
  static get host(): string {
    return this._host;
  }

  static get credentials() {
    return this._credentials;
  }

  static start() {
    this._loadSettings();
    this._addAuth();
    this._registryClient();
  }

  private static _registryClient() {
    for (let clientContainer of ClientContainer.clients) {
      let client: GRPC.Client = new clientContainer.service(
        `${this.host}:${this.port}`,
        this.credentials
      );
      clientContainer.client = client;
      this._registryRoute(clientContainer);
    }
  }

  static _registryRoute(clientContainer: {
    client?: GRPC.Client;
    target: Function;
    service: any
  }) {
    let target = clientContainer.target;
    let routes = ClientContainer.getRoutes(target);
    for (let route of routes) {
      ClientContainer.generateRouteFunc(route);
    }
  }

  private static _loadSettings() {
    let { host, port, ca, client_key, client_cert } = SettingRegistry.settings;
    this._host = host;
    this._port = port;
    this._ca = ca;
    this._client_key = client_key;
    this._client_cert = client_cert;
  }

  private static _addAuth() {
    let ca = FS.readFileSync(this.ca);
    let cert = FS.readFileSync(this.client_cert);
    let key = FS.readFileSync(this.client_key);
    this._credentials = GRPC.credentials.createSsl(ca, key, cert);
  }
}
