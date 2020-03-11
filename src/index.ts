/*
 * Copyright 2019-present Acrolinx GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, softwareq
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { InternalEventEmitter, TypedEventEmitter } from './event-emitter';
import {
  AnalysisResultEvent,
  AppAccessTokenEvent,
  AppApiCapability,
  AppButtonConfig,
  configureAddon,
  EventForApp,
  getAppAccessToken,
  HttpGetRequest,
  OffsetRange,
  OffsetRangeWithReplacement,
  openWindow,
  replaceRanges,
  ReportType,
  selectRanges,
  SidebarAddonConfig
} from './raw';
import { exhaustiveSwitchCheck, includes, isOverlapping } from './utils';

export {
  OffsetRange,
  OffsetRangeWithReplacement,
  AppAccessTokenEvent,
  HttpGetRequest
};

/**
 * @public
 */
export const DEVELOPMENT_APP_SIGNATURE =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiS2lsbGVyIEFwcCIsImlkIjoiNGVlZDM3NjctMGYzMS00ZDVmLWI2MjktYzg2MWFiM2VkODUyIiwidHlwZSI6IkFQUCIsImlhdCI6MTU2MTE4ODI5M30.zlVJuGITMjAJ2p4nl-qtpj4N0p_8e4tenr-4dkrGdXg';

/**
 * @public
 */
export interface ExtractedTextEvent {
  languageId: string;
  text: string;
}

/**
 * @public
 */
export interface ExtractedTextLinkEvent {
  languageId: string;
  url: string;
}

/**
 * @public
 */
export interface TextRangesExpiredEvent {
  ranges: OffsetRange[];
}

/**
 * @public
 */
export interface AppAccessTokenResult {
  validationRequest: HttpGetRequest;
  appAccessToken: string;
}

/**
 * @public
 */
export enum RequiredCommands {
  selectRanges = 'selectRanges',
  replaceRanges = 'replaceRanges',
  openWindow = 'openWindow',
  getAppAccessToken = 'getAppAccessToken'
}

/**
 * @public
 */
export enum RequiredEvents {
  textExtracted = 'textExtracted',
  textExtractedLink = 'textExtractedLink',
  invalidRanges = 'invalidRanges'
}

/**
 * @internal
 */
const DEFAULT_CONFIG: SidebarAddonConfig = {
  appSignature: DEVELOPMENT_APP_SIGNATURE,
  title: 'Acrolinx App',
  requiredReportContent: [],
  requiredReportLinks: []
};

/**
 * @internal
 */
class AppApiConnection {
  private readonly _events = {
    textExtracted: new InternalEventEmitter<ExtractedTextEvent>(),
    textExtractedLink: new InternalEventEmitter<ExtractedTextLinkEvent>(),
    invalidRanges: new InternalEventEmitter<TextRangesExpiredEvent>()
  };

  private waitingAppAccessTokenResolvers: Array<
    (token: AppAccessTokenResult) => void
  > = [];

  private readonly _commands: AppCommands = {
    selectRanges,
    replaceRanges,
    openWindow,
    getAppAccessToken: () => this.getAppAccessToken()
  };

  get events(): AppEvents {
    return this._events;
  }

  get commands(): AppCommands {
    return this._commands;
  }

  constructor(config: ApiConfig) {
    const requiredReportLinks = [];
    if (includes(config.requiredEvents, RequiredEvents.textExtractedLink)) {
      requiredReportLinks.push(ReportType.extractedText);
    }

    const requiredReportContent = [];
    if (includes(config.requiredEvents, RequiredEvents.textExtracted)) {
      requiredReportContent.push(ReportType.extractedText);
    }

    configureAddon({
      ...DEFAULT_CONFIG,
      ...config,
      requiredReportLinks,
      requiredReportContent,
      requires: (config.requiredCommands as unknown) as AppApiCapability[]
    });

    window.addEventListener(
      'message',
      messageEvent => {
        const eventForApp: EventForApp | undefined = messageEvent.data;

        if (messageEvent.source !== window.parent || !eventForApp?.type) {
          // Message is probably not from the Sidebar. Ignore it.
          return;
        }

        console.log(
          'Got message from sidebar',
          messageEvent.data.type,
          messageEvent
        );

        switch (eventForApp.type) {
          case 'analysisResult':
            this.handleAnalysisResultEvent(eventForApp);
            break;
          case 'invalidRanges':
            this._events.invalidRanges.dispatchEvent(eventForApp);
            break;
          case 'appAccessToken':
            this.waitingAppAccessTokenResolvers.forEach(resolve => {
              resolve(eventForApp);
            });
            this.waitingAppAccessTokenResolvers = [];
            break;
          default:
            exhaustiveSwitchCheck(eventForApp, 'AppApiEvent');
        }
      },
      false
    );
  }

  private handleAnalysisResultEvent(analysisResult: AnalysisResultEvent) {
    const reports = analysisResult.reports;
    const textExtractedReport = reports[ReportType.extractedText] || {};

    if (textExtractedReport.url) {
      this._events.textExtractedLink.dispatchEvent({
        url: textExtractedReport.url,
        languageId: analysisResult.languageId
      });
    }

    if (typeof textExtractedReport.content === 'string') {
      this._events.textExtracted.dispatchEvent({
        text: textExtractedReport.content,
        languageId: analysisResult.languageId
      });
    }
  }

  private getAppAccessToken(): Promise<AppAccessTokenResult> {
    const promise = new Promise<AppAccessTokenResult>(resolve => {
      this.waitingAppAccessTokenResolvers.push(resolve);
    });
    getAppAccessToken();
    return promise;
  }
}

/**
 * @public
 */
export interface AppEvents {
  textExtracted: TypedEventEmitter<ExtractedTextEvent>;
  textExtractedLink: TypedEventEmitter<ExtractedTextLinkEvent>;
  invalidRanges: TypedEventEmitter<TextRangesExpiredEvent>;
}

/**
 * @public
 */
export interface AppCommands {
  selectRanges(ranges: OffsetRange[]): void;
  replaceRanges(ranges: OffsetRangeWithReplacement[]): void;
  openWindow(url: string): void;
  getAppAccessToken(): Promise<AppAccessTokenResult>;
}

/**
 * @public
 */
export interface AcrolinxAppApi {
  events: AppEvents;
  commands: AppCommands;
}

/**
 * @public
 */
export interface ApiConfig {
  title?: string;
  version?: string;
  appSignature?: string;
  button?: AppButtonConfig;
  requiredEvents: RequiredEvents[];
  requiredCommands: RequiredCommands[];
}

/**
 * @public
 */
export function initApi(conf: ApiConfig): AcrolinxAppApi {
  return new AppApiConnection(conf);
}

/**
 * @public
 */
export function isInvalid(
  event: TextRangesExpiredEvent,
  range: OffsetRange
): boolean {
  return event.ranges.some(inValidRange => isOverlapping(inValidRange, range));
}
