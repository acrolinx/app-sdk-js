/*
 *
 * * Copyright 2021-present Acrolinx GmbH
 * *
 * * Licensed under the Apache License, Version 2.0 (the "License");
 * * you may not use this file except in compliance with the License.
 * * You may obtain a copy of the License at
 * *
 * * http://www.apache.org/licenses/LICENSE-2.0
 * *
 * * Unless required by applicable law or agreed to in writing, software
 * * distributed under the License is distributed on an "AS IS" BASIS,
 * * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * * See the License for the specific language governing permissions and
 * * limitations under the License.
 * *
 * * For more information visit: https://www.acrolinx.com
 *
 */


var appUrlInput = document.getElementById('appUrlInput');
var appIFrame = document.getElementById('appIFrame');
var checkButton = document.getElementById('checkButton');

function sendMessageToApp(message) {
  appIFrame.contentWindow.postMessage(message, '*');

}

window.acrolinxSidebar = {
  checkGlobal: function(documentContent, _options) {
    sendMessageToApp({
      type: 'analysisResult',
      languageId: 'en',
      reports: { extractedText: { content: documentContent } }
    });
  },

  configure: function(configuration) {
  },

  init: function(initParameters) {
    console.log('initParameters', initParameters);
  },

  invalidateRanges: function(invalidCheckedDocumentRanges) {
  },

  onGlobalCheckRejected: function() {
  },

  onVisibleRangesChanged: function(checkedDocumentRanges) {
  },

  showMessage: function(message) {
  }
};

document.getElementById('appLoadForm').addEventListener('submit', function(event) {
  event.preventDefault();
  appIFrame.src = appUrlInput.value;
  localStorage.setItem('acrolinx.appDevTools.appUrl', appUrlInput.value);
});

var storedAppUrl = localStorage.getItem('acrolinx.appDevTools.appUrl');
if (storedAppUrl) {
  appIFrame.src = storedAppUrl;
  appUrlInput.value = storedAppUrl;
}

window.addEventListener('message', function(messageEvent) {
  if (appIFrame.contentWindow === messageEvent.source) {
    console.log('Message from app', messageEvent.data);
    switch (messageEvent.data.command) {
      case 'acrolinx.sidebar.requestAppAccessToken': {
        sendMessageToApp({
          type: 'appAccessToken',
          appAccessToken: 'dummyAccessToken',
          validationRequest: {
            url: location.href.slice(0, location.href.lastIndexOf('/')) + '/api/current-user.json',
            headers: {}
          }
        });
      }
    }
  }
});


checkButton.addEventListener('click', function() {
  window.acrolinxPlugin.requestGlobalCheck();
});


window.acrolinxPlugin.requestInit();


