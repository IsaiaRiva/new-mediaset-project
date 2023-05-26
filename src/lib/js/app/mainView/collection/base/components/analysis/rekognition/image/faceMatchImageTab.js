// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import AnalysisTypes from '../../../../../../../shared/analysis/analysisTypes.js';
import BaseRekognitionImageTab from './baseRekognitionImageTab.js';

export default class FaceMatchImageTab extends BaseRekognitionImageTab {
  constructor(previewComponent, data) {
    super(AnalysisTypes.Rekognition.FaceMatch, previewComponent, data);
  }
}
