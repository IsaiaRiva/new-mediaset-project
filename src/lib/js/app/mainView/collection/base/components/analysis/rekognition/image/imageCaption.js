// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import Localization from '../../../../../../../shared/localization.js';
import BaseAnalysisTab from '../../base/baseAnalysisTab.js';

const {
  Messages: {
    ImageCaptionTab: TITLE,
    ImageCaptionDesc: DESCRIPTION,
    NoData: MSG_NO_DATA,
  },
} = Localization;

export default class ImageCaptionTab extends BaseAnalysisTab {
  constructor(previewComponent) {
    super(TITLE, previewComponent);
  }

  async createContent() {
    const container = $('<div/>')
      .addClass('col-9 my-4 max-h36r');

    const caption = this.previewComponent.media.getImageAutoCaptioning()
      || MSG_NO_DATA;

    const desc = $('<p/>')
      .addClass('lead-sm font-italic')
      .append(DESCRIPTION);
    container.append(desc);

    const message = $('<p/>')
      .addClass('lead')
      .append(caption);
    container.append(message);

    return container;
  }
}
