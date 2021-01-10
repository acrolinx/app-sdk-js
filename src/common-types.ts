/*
 * Copyright 2020-present Acrolinx GmbH
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

export interface AppButtonConfig {
  text: string;
  tooltip?: string;
}

export interface CommonCapabilityAvailability {
  available: boolean;
  temporary: boolean;
}

export interface VisibilityEvent {
  type: 'visibility';
  visible: boolean;
}

type DocumentId = string;

export interface DocumentDescriptor {
  id: DocumentId;
}

export type DocumentChangeEvent = {
  type: 'documentChange';
} & DocumentDescriptor;

/**
 * @public
 */
export interface HttpGetRequest {
  url: string;
  headers: { [key: string]: string };
}
