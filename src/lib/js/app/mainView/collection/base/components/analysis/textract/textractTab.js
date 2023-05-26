// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import Localization from '../../../../../../shared/localization.js';
import BaseAnalysisTab from '../base/baseAnalysisTab.js';

const {
  Messages: {
    TextractTab: TITLE,
  },
} = Localization;

export default class TextractTab extends BaseAnalysisTab {
  constructor(previewComponent) {
    super(TITLE, previewComponent);
  }

  async createContent() {
    const col = $('<div/>').addClass('col-12 my-4 max-h36r');
    const pageContainer = this.previewComponent.getPageControlContainer();
    if (!pageContainer) {
      return super.createContent();
    }
    return col.append(pageContainer);
  }
}
