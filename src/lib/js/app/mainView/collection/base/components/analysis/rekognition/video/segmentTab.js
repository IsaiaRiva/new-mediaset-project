// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import Localization from '../../../../../../../shared/localization.js';
import AnalysisTypes from '../../../../../../../shared/analysis/analysisTypes.js';
import MapData from '../../../../../../../shared/analysis/mapData.js';
import BaseRekognitionTab from './baseRekognitionTab.js';

const DEFAULT_OUTPUT = '00000000.json';

export default class SegmentTab extends BaseRekognitionTab {
  constructor(previewComponent, data) {
    super(AnalysisTypes.Rekognition.Segment, previewComponent, data);
  }

  async createContent() {
    const col01 = await this.createButtonList();

    const col02 = $('<div/>')
      .addClass('col-12 m-0 p-0 my-4');

    const btnEdl = await this.createEDLButton();
    if (btnEdl) {
      const edlDesc = $('<p/>')
        .addClass('lead-sm')
        .append(Localization.Messages.DownloadEDLDesc);
      col02
        .append(edlDesc)
        .append(btnEdl);
    }
    const container = $('<div/>')
      .addClass('col-9 m-0 p-0 max-h36r')
      .append(col01)
      .append(col02);
    return container;
  }

  async createButtonList() {
    const col = $('<div/>')
      .addClass('col-12 m-0 p-0 my-4');
    const tracks = await this.createTrackButtons(this.category);
    if (!(tracks || []).length) {
      return col.html(Localization.Messages.NoData);
    }

    const enableAll = this.createEnableAll(tracks);
    col.append(enableAll);

    tracks.forEach((btn) =>
      col.append(btn));

    return col;
  }

  async createEDLButton() {
    const edl = (this.data || {}).edl;
    if (!edl) {
      return undefined;
    }

    const bucket = this.media.getProxyBucket();
    let name = `${AnalysisTypes.Rekognition.Segment}.zip`;
    let key = `${edl}${name}`;
    if (/zip$/.test(edl)) {
      name = edl.substring(edl.lastIndexOf('/') + 1);
      key = edl;
    }

    const href = await this.media.getUrl(bucket, key);
    const btnEdl = $('<a/>')
      .addClass('btn btn-sm btn-success text-capitalize mb-1 ml-1')
      .attr('href', href)
      .attr('target', '_blank')
      .attr('download', `${this.media.basename}-${name}`)
      .attr('role', 'button')
      .append(Localization.Buttons.DownloadEDL);
    return btnEdl;
  }

  onRender(tabContent) {
    tabContent.ready(async () => {
      console.log('SegmentTab.onReady');

      const bucket = this.media.getProxyBucket();
      const mapFile = this.data.output;

      if (/json$/.test(mapFile)) {
        this.mapData = await MapData.loadFromKey(
          bucket,
          mapFile
        );
      } else {
        this.mapData = await MapData.loadFromPrefix(
          bucket,
          this.data.vtt
        );
        this.mapData.files = [
          DEFAULT_OUTPUT,
        ];
      }

      // PRELOAD LOGIC
      /*
      const container = $('<div/>')
        .addClass('col-9 my-4 max-h36r');
      tabContent.append(container);

      container.ready(async () => {
        await this.delayContentLoad(container);
      });
      */
    });
  }
}
