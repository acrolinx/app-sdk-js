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

import {AcrolinxAppApi, ApiCommands, ApiEvents, initApi, isInvalid} from './index';
import {hasParentWindow} from './raw';
import {includes} from './utils';

function getMetaValue(name: string) {
  const metaEl = document.querySelector(`meta[name=${name}]`);
  return metaEl && metaEl.getAttribute('value');
}

function hideElements() {
  const elementsToHide = document.querySelectorAll<HTMLElement>('[data-acrolinx="hide"]');
  for (const el of elementsToHide) {
    el.style.display = 'none';
  }
}

function findInPathToDocument(startElement: HTMLElement, dataAttribute: string): HTMLElement | undefined {
  let el = startElement;
  while (el && el !== document.body) {
    if (el.dataset[dataAttribute]) {
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

function addClickSelectRangeListener(appApi: AcrolinxAppApi<ApiCommands, ApiEvents>) {
  document.addEventListener('click', (ev) => {
    const elementWithSelectRange = findInPathToDocument(ev.target as HTMLElement, 'acrolinxSelectRange');
    if (!elementWithSelectRange || elementWithSelectRange.classList.contains(INVALID_RANGE_CLASS_NAME)) {
      return;
    }
    const offsetRangeString = elementWithSelectRange.dataset.acrolinxSelectRange!;
    const offsetRange = JSON.parse(offsetRangeString);

    removeClassName('acrolinx-selected-range');
    elementWithSelectRange.classList.add('acrolinx-selected-range');

    appApi.commands.selectRanges([offsetRange]);
  });
}

function initAcrolinxAppAutoForm() {
  if (hasParentWindow()) {
    hideElements();
  }

  const title = document.querySelector('title');
  const appTitle = getMetaValue('acrolinx-app-title') || (title && title.innerText);
  const acrolinxExtractedTextField = document.querySelector<HTMLTextAreaElement>('[data-acrolinx="extractedText"]');

  const requiredCommands = (getMetaValue('acrolinx-app-required-commands') || '').split(/, ?/);
  const requiredEvents = (getMetaValue('acrolinx-app-required-events') || '').split(/, ?/);
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
}

window.addEventListener('DOMContentLoaded', initAcrolinxAppAutoForm);

