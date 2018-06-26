[![NPM version][npm-image]][npm-url]

this module work with grpc server side module 'gprc-server-ts'.

look here to see server side example : <a href='https://github.com/xuezier/grpc-server-ts'>https://github.com/xuezier/grpc-server-ts</a>

# Installation
```
npm install grpc-client-ts --save
```

## protobuf
hello.proto
```proto
syntax = "proto3";

option java_multiple_files = true;
option java_package = "io.grpc.service.test";
option objc_class_prefix ="RTG";

package hello;

service Hello {
  rpc say(stream Empty) returns (stream Word) {};
}

message Empty {

}

message Word {
  string word = 1;
}
```

## define a client
HelloRpc.ts
```ts
import { Route, Client } from 'grpc-client-ts';

@Client(__dirname + '/protobuf/Hello.proto')
export class Hello {
  @Route
  public async say(data, result) { }
}
```

## registry client grpc
```ts
import { RpcClientRegistry, Settings } from 'grpc-client-ts';

@Settings(settings)
class ClientRpc extends RpcClientRegistry { }
ClientRpc.start();
```

### settings
```js
{
  port: "3333",                            // listen port
  host: "localhost",                       // listen host
  ca: "runtime/rpc/ca.crt",                // ca file path
  client_cert: "runtime/rpc/server.crt",   // client_cert file path
  client_key: "runtime/rpc/server.key"     // client_key file path
}
```

## Full example with 'mvc-ts'
controller
```ts
import * as Express from 'express';

import { Inject, RestController, Get, Res } from "mvc-ts";
import { Hello } from 'HelloRpc.ts';

@RestController('/example')
export class HelloController {
  @Inject()
  private helloRpc: Hello;

  @Get('/hello')
  public async indexAction(@Res() res: Express.Response) {
    let result = await this.helloRpc.say({});
    res.json(result);
  }
}
```

index.ts
```ts
import { ApplicationLoader, ApplicationSettings, Inject, ConfigContainer } from 'mvc-ts';

import 'HelloController.ts';

import 'HelloRpc.ts';

@ApplicationSettings({ rootDir: `${__dirname}/../` })
class Application extends ApplicationLoader { }
const Application = new CpApplication();
Application.start(5566);

@Settings(settings)
class ClientRpc extends RpcClientRegistry { }
ClientRpc.start();
```
open browser visite *http://localhost:5566/example/hello* get result
```json
{
  "word": "hello world"
}
```



[npm-image]: https://img.shields.io/npm/v/grpc-client-ts.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/grpc-client-ts