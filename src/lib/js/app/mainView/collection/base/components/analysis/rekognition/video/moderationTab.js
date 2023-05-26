// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import AnalysisTypes from '../../../../../../../shared/analysis/analysisTypes.js';
import BaseRekognitionTab from './baseRekognitionTab.js';

export default class ModerationTab extends BaseRekognitionTab {
  constructor(previewComponent, data) {
    super(AnalysisTypes.Rekognition.Moderation, previewComponent, data);
  }
}
