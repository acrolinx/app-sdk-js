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

import {isOverlapping} from '../src/utils';

describe('isOverlapping', () => {
  it('range1 overlaps with begin of range 2', () => {
    expect(isOverlapping({begin: 10, end: 15}, {begin: 13, end: 20})).toEqual(true);
  });

  it('range1 overlaps with end of range 2', () => {
    expect(isOverlapping({begin: 13, end: 20}, {begin: 10, end: 15})).toEqual(true);
  });

  it('range1 in inside of range2', () => {
    expect(isOverlapping({begin: 13, end: 15}, {begin: 10, end: 20})).toEqual(true);
  });

  it('range2 in inside of range1', () => {
    expect(isOverlapping({begin: 10, end: 20}, {begin: 13, end: 15})).toEqual(true);
  });

  it('does not overlap with distance > 0', () => {
    expect(isOverlapping({begin: 10, end: 15}, {begin: 16, end: 20})).toEqual(false);
    expect(isOverlapping({begin: 16, end: 20}, {begin: 10, end: 15})).toEqual(false);
  });

  it('does not overlap with distance 0', () => {
    expect(isOverlapping({begin: 10, end: 15}, {begin: 15, end: 20})).toEqual(false);
    expect(isOverlapping({begin: 15, end: 20}, {begin: 10, end: 15})).toEqual(false);
  });
});
