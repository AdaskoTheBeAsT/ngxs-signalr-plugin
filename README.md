# NGXS SignalR Plugin

Bind server SignalR events to Ngxs store actions.

This library is build based on [NGXS/WebSocket](https://www.ngxs.io/plugins/websocket).

## Instalation

```cmd
npm install @adaskothebeast/ngxs-signalr-plugin --save

# or if you are using yarn
yarn add @adaskothebeast/ngxs-signalr-plugin --save
```

## Configuration

If backend hub application is written in .net core.

```typescript
import { NgxsModule } from '@ngxs/store';
import { NgxsSignalRPluginModule } from '@adaskothebeast/ngxs-signal-plugin';

@NgModule({
  imports: [
    NgxsModule.forRoot([]),
    NgxsSignalRPluginModule.forRoot({
      url: 'http://localhost:8080/hub'
    })
  ]
})
export class AppModule {}
```

## Compatibility

- Angular 14.1.x
- SignalR 6.0.x
