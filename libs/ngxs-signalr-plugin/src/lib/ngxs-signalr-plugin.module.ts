import { CommonModule } from '@angular/common';
import { InjectionToken, ModuleWithProviders, NgModule, inject, provideAppInitializer } from '@angular/core';
import { HttpTransportType, JsonHubProtocol } from '@microsoft/signalr';

import { SignalRHandler } from './signalr-handler';
import { NGXS_SIGNALR_OPTIONS, SignalROptions, noop } from './signalr-options';

export function signalrOptionsFactory(options: SignalROptions): SignalROptions {
  return {
    keepAliveIntervalInMilliseconds: 15000,
    serverTimeoutInMilliseconds: 30000,
    typeKey: 'type',
    automaticReconnect: true,
    transportType: HttpTransportType.WebSockets,
    protocol: new JsonHubProtocol(),
    ...options,
  };
}

export const NGXS_SIGNALR_USER_OPTIONS = new InjectionToken(
  'NGXS_SIGNALR_USER_OPTIONS'
);

@NgModule({
  imports: [CommonModule],
})
export class NgxsSignalrPluginModule {
  static forRoot(
    options?: SignalROptions
  ): ModuleWithProviders<NgxsSignalrPluginModule> {
    return {
      ngModule: NgxsSignalrPluginModule,
      providers: [
        SignalRHandler,
        {
          provide: NGXS_SIGNALR_USER_OPTIONS,
          useValue: options,
        },
        {
          provide: NGXS_SIGNALR_OPTIONS,
          useFactory: signalrOptionsFactory,
          deps: [NGXS_SIGNALR_USER_OPTIONS],
        },
        provideAppInitializer(() => {
        const initializerFn = (noop)(inject(SignalRHandler));
        return initializerFn();
      }),
      ],
    };
  }
}
