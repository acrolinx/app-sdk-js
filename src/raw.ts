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

export interface AppButtonConfig {
  text: string;
  tooltip?: string;
}

export enum ReportType {
  extractedText = 'extractedText'
}

export enum RequiredAppApiCommand {
  selectRanges = 'selectRanges',
  replaceRanges = 'replaceRanges'
}

type AppApiEventConfig = {};

export interface SidebarAddonConfig {
  appSignature: string;
  title: string;
  version?: string;
  button?: AppButtonConfig;

  /**
   * Experimental.
   * Since Acrolinx 2020.4
   */
  processSelectionButton?: AppButtonConfig;

  requires?: RequiredAppApiCommand[];
  requiredEvents?: {
    visibility?: AppApiEventConfig;
    capabilities?: AppApiEventConfig;
  };
  requiredReportLinks: readonly ReportType[];
  requiredReportContent: readonly ReportType[];
}

export type ReportsForAddon = {
  [P in ReportType]?: ReportForAddon;
};

interface ReportForAddon {
  url?: string;
  content?: string;
}

export interface AnalysisResultEvent {
  type: 'analysisResult';
  languageId: string;

  /**
   * Experimental.
   * Since Acrolinx 2020.4
   */
  selection?: DocumentSelection;

  reports: ReportsForAddon;
}

/**
 * Experimental.
 * Since Acrolinx 2020.4
 */
export interface DocumentSelection {
  ranges: OffsetRange[];
}

interface InvalidateRangesEvent {
  type: 'invalidRanges';
  ranges: OffsetRange[];
}

export interface VisibilityEvent {
  type: 'visibility';
  visible: boolean;
}

export interface CommonCapabilityAvailability {
  available: boolean;
  temporary: boolean;
}

export interface CapabilitiesEventInternal {
  type: 'capabilities';
  events: {
    appAccessToken: CommonCapabilityAvailability;
    analysisResult: CommonCapabilityAvailability;
    invalidRanges: CommonCapabilityAvailability;
    visibility: CommonCapabilityAvailability;
    capabilities: CommonCapabilityAvailability;
  };
  commands: {
    configureAddon: CommonCapabilityAvailability;
    requestCapabilities: CommonCapabilityAvailability;
    openWindow: CommonCapabilityAvailability;
    requestAppAccessToken: CommonCapabilityAvailability;
    selectRanges: CommonCapabilityAvailability;
    replaceRanges: CommonCapabilityAvailability;
  };
}

/**
 * @internal
 */
export interface AppAccessTokenEvent {
  type: 'appAccessToken';
  validationRequest: HttpGetRequest;
  appAccessToken: string;
}

/**
 * @public
 */
export interface HttpGetRequest {
  url: string;
  headers: { [key: string]: string };
}

export type EventForApp =
  | AnalysisResultEvent
  | InvalidateRangesEvent
  | AppAccessTokenEvent
  | CapabilitiesEventInternal
  | VisibilityEvent;

/**
 * @public
 */
export interface OffsetRange {
  begin: number;
  end: number;
}

/**
 * @public
 */
export interface OffsetRangeWithReplacement {
  replacement: string;
  begin: number;
  end: number;
}

export function hasParentWindow() {
  return window.parent && window.parent !== window;
}

export function openWindow(url: string) {
  if (hasParentWindow()) {
    postMessageToSidebar({ command: 'acrolinx.sidebar.openWindow', url });
  } else {
    window.open(url);
  }
}

export function selectRanges(ranges: OffsetRange[]) {
  postMessageToSidebar({ command: 'acrolinx.sidebar.selectRanges', ranges });
}

export function replaceRanges(ranges: OffsetRangeWithReplacement[]) {
  postMessageToSidebar({ command: 'acrolinx.sidebar.replaceRanges', ranges });
}

export function configureAddon(config: SidebarAddonConfig) {
  postMessageToSidebar({ command: 'acrolinx.sidebar.configureAddon', config });
}

export function getAppAccessToken() {
  postMessageToSidebar({ command: 'acrolinx.sidebar.requestAppAccessToken' });
}

export function requestCapabilities() {
  postMessageToSidebar({ command: 'acrolinx.sidebar.requestCapabilities' });
}

function postMessageToSidebar<T extends { command: string }>(message: T) {
  if (hasParentWindow()) {
    window.parent.postMessage(message, '*');
  } else {
    console.warn('Missing parent window with sidebar.', message);
  }
}
