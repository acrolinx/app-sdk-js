/**
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
 *
 */

import { OffsetRange } from './raw';

/**
 * @packageDocumentation
 * @internal
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function includes<T>(array: T[] | undefined, element: any): boolean {
  if (!array) {
    return false;
  }
  return array.indexOf(element) >= 0;
}

export function getEmptyObjectIfIncluded<T>(
  array: T[],
  element: T
): {} | undefined {
  return includes(array, element) ? {} : undefined;
}

export function isOverlapping(
  range1: OffsetRange,
  range2: OffsetRange
): boolean {
  const isNotOverlapping =
    range2.begin >= range1.end || range2.end <= range1.begin;
  return !isNotOverlapping;
}

export function exhaustiveSwitchCheck(param: never, name: string): never {
  throw new Error(`Can't handle ${name} with value ${JSON.stringify(param)}`);
}
