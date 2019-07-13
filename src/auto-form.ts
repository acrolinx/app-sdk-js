import {ApiEvents, initApi} from './index';
import {hasParentWindow} from './raw';

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

function initAcrolinxAppAutoForm() {
  if (!hasParentWindow()) {
    return;
  }

  hideElements();

  const title = document.querySelector('title');
  const appTitle = getMetaValue('acrolinx-app-title') || (title && title.innerText);
  const acrolinxExtractedTextField = document.querySelector<HTMLTextAreaElement>('[data-acrolinx="extractedText"]');

  const appApi = initApi({
    title: appTitle || window.location.href,
    button: {
      text: getMetaValue('acrolinx-app-button-text') || 'Check',
      tooltip: getMetaValue('acrolinx-app-button-tooltip') || ''
    },
    requiredCommands: [],
    requiredEvents: acrolinxExtractedTextField ? [ApiEvents.textExtracted] : [],

  });

  if (acrolinxExtractedTextField) {
    appApi.events.textExtracted.addEventListener(event => {
        acrolinxExtractedTextField.value = event.text;
        acrolinxExtractedTextField.form!.submit();
      }
    );
  }

}

window.addEventListener('DOMContentLoaded', initAcrolinxAppAutoForm);

