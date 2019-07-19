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


/**
 * This module is highly experimental.
 */

import {AcrolinxAppApi, ApiCommands, ApiEvents, initApi, isInvalid, OffsetRange} from './index';
import {hasParentWindow} from './raw';
import {includes} from './utils';

function getMetaValue(name: string) {
  const metaEl = document.querySelector<HTMLMetaElement>(`meta[name=${name}]`);
  return metaEl && metaEl.content;
}

function hideElements() {
  const elementsToHide = document.querySelectorAll<HTMLElement>('[data-acrolinx="hide"]');
  for (const el of elementsToHide) {
    el.style.display = 'none';
  }
}

function findAncestorWithData(startElement: HTMLElement, dataAttribute: string): HTMLElement | undefined {
  return findAncestor(startElement, el => el.dataset[dataAttribute] !== undefined);
}

function findAncestor(startElement: HTMLElement, condition: (el: HTMLElement) => boolean): HTMLElement | undefined {
  let el = startElement;
  while (el && el !== document.body) {
    if (condition(el)) {
      return el;
    }
    el = el.parentElement!;
  }
  return undefined;
}

function removeClassName(className: string) {
  for (const el of document.getElementsByClassName(className)) {
    el.classList.remove(className);
  }
}

function compact<T>(array: Array<T | null>): T[] {
  return array.filter(el => el) as T[];
}

const INVALID_RANGE_CLASS_NAME = 'acrolinx-invalid-range';

function addInvalidRangesListener(appApi: AcrolinxAppApi<ApiCommands, ApiEvents>) {
  const invalidRangeTooltip = getMetaValue('acrolinx-app-invalid-range-tooltip');
  appApi.events.invalidRanges.addEventListener((invalidRangesEvent) => {
    const selectRangesElements = document.querySelectorAll<HTMLElement>('[data-acrolinx-select-range]');
    for (const el of selectRangesElements) {
      const offsetRange = JSON.parse(el.dataset.acrolinxSelectRange!);
      if (isInvalid(invalidRangesEvent, offsetRange)) {
        el.classList.add(INVALID_RANGE_CLASS_NAME);
        if (invalidRangeTooltip) {
          el.title = invalidRangeTooltip;
        }
      }
    }
  });
}

interface ElementWithRange {
  element: Element;
  range: OffsetRange;
}

function findAncestorWithValidSelectRange(startElement: HTMLElement): ElementWithRange | undefined {
  const elementWithSelectRange = findAncestorWithData(startElement, 'acrolinxSelectRange');
  if (!elementWithSelectRange || elementWithSelectRange.classList.contains(INVALID_RANGE_CLASS_NAME)) {
    return;
  }
  const offsetRangeString = elementWithSelectRange.dataset.acrolinxSelectRange!;
  return {element: elementWithSelectRange, range: JSON.parse(offsetRangeString)};
}

function addClickSelectRangeListener(appApi: AcrolinxAppApi<ApiCommands, ApiEvents>) {
  document.addEventListener('click', (ev) => {
    const elementWithRange = findAncestorWithValidSelectRange(ev.target as HTMLElement);
    if (!elementWithRange) {
      return;
    }

    removeClassName('acrolinx-selected-range');
    elementWithRange.element.classList.add('acrolinx-selected-range');

    appApi.commands.selectRanges([elementWithRange.range]);
  });
}

function addClickReplaceRangeListener(appApi: AcrolinxAppApi<ApiCommands, ApiEvents>) {
  document.addEventListener('click', (ev) => {
    const elementWithReplaceRange = findAncestorWithData(ev.target as HTMLElement, 'acrolinxReplaceRange');
    if (!elementWithReplaceRange) {
      return;
    }

    const replacement = elementWithReplaceRange.dataset.acrolinxReplaceRange!;

    const elementWithRange = findAncestorWithValidSelectRange(elementWithReplaceRange);
    if (!elementWithRange) {
      return;
    }

    elementWithRange.element.classList.add('acrolinx-replaced-range');

    appApi.commands.replaceRanges([{...elementWithRange.range, replacement}]);
  });
}

function initAcrolinxAppAutoForm() {
  if (hasParentWindow()) {
    hideElements();
  }

  const title = document.querySelector('title');
  const appTitle = getMetaValue('acrolinx-app-title') || (title && title.innerText);
  const acrolinxExtractedTextField = document.querySelector<HTMLTextAreaElement>('[data-acrolinx="extractedText"]');

  const requiredCommands = (getMetaValue('acrolinx-app-required-commands') || '').split(/, */);
  const requiredEvents = (getMetaValue('acrolinx-app-required-events') || '').split(/, *?/);
  const appApi = initApi({
    title: appTitle || window.location.href,
    button: {
      text: getMetaValue('acrolinx-app-button-text') || 'Check',
      tooltip: getMetaValue('acrolinx-app-button-tooltip') || ''
    },
    requiredCommands: requiredCommands as ApiCommands[],
    requiredEvents: compact([
      acrolinxExtractedTextField && ApiEvents.textExtracted,
      ...(requiredEvents as ApiEvents[])
    ]),
  });

  if (acrolinxExtractedTextField) {
    appApi.events.textExtracted.addEventListener(event => {
        acrolinxExtractedTextField.value = event.text;
        acrolinxExtractedTextField.form!.submit();
      }
    );
  }

  if (includes(requiredEvents, ApiEvents.invalidRanges)) {
    addInvalidRangesListener(appApi);
  }

  if (includes(requiredCommands, ApiCommands.selectRanges)) {
    addClickSelectRangeListener(appApi);
  }

  if (includes(requiredCommands, ApiCommands.replaceRanges)) {
    addClickReplaceRangeListener(appApi);
  }
}

window.addEventListener('DOMContentLoaded', initAcrolinxAppAutoForm);

