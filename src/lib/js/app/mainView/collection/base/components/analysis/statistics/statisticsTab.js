// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import Localization from '../../../../../../shared/localization.js';
import {
  GetS3Utils,
} from '../../../../../../shared/s3utils.js';
import MapData from '../../../../../../shared/analysis/mapData.js';
import MediaTypes from '../../../../../../shared/media/mediaTypes.js';
import BaseAnalysisTab from '../base/baseAnalysisTab.js';
import {
  AWSConsoleTranscribe,
} from '../../../../../../shared/awsConsole.js';

const {
  Messages: {
    StatisticsTab: TITLE,
    DownloadJson: MSG_DOWNLOAD_JSON,
    WorkflowHistory: MSG_WORKFLOW_HISTORY,
    Rekognition: MSG_REKOGNITION,
    Labels: MSG_LABELS,
    Transcribe: MSG_TRANSCRIBE,
    TranscriptionJob: MSG_TRANSCRIPTION_JOB,
    Comprehend: MSG_COMPREHEND,
    Textract: MSG_TEXTRACT,
    NoData: MSG_NO_DATA,
  },
  Tooltips: {
    DownloadFile: TOOLTIP_DOWNLOAD_FILE,
  },
} = Localization;

const COL_TAB = 'col-11';

export default class StatisticsTab extends BaseAnalysisTab {
  constructor(previewComponent) {
    super(TITLE, previewComponent);
  }

  async createWorkflowHistory(data) {
    const details = this.createGrouping(MSG_WORKFLOW_HISTORY);

    data.forEach((workflow) => {
      const dl = this.createTableList();
      const names = Object.keys(workflow).filter(x =>
        typeof workflow[x] !== 'object' && !Array.isArray(workflow[x]));
      names.forEach(name =>
        this.appendTableList(dl, name, this.readableValue(workflow, name)));
      details.append(this.createGrouping(workflow.type, 1)
        .append(dl));
    });
    return details;
  }

  async createRekognition(data) {
    const details = this.createGrouping(MSG_REKOGNITION);
    Object.keys(data).forEach(async (type) =>
      details.append(await this.iterateAndCreateRekognitionItemByType(data[type], type)));
    return details;
  }

  async iterateAndCreateRekognitionItemByType(data, type) {
    const iterators = [].concat(data);
    return Promise.all(iterators.map(x =>
      this.createRekognitionByType(x, type)));
  }

  async createRekognitionByType(data, type) {
    const bucket = this.media.getProxyBucket();
    const details = this.createGrouping(type, 1);

    const dl = this.createTableList();
    details.append(dl);

    /* common information */
    [
      'startTime',
      'endTime',
      'id',
      'customLabelModels',
    ].forEach(name =>
      data[name] && this.appendTableList(dl, name, this.readableValue(data, name)));

    /* render on details open */
    details.on('click', async () => {
      const wasOpen = details.prop('open');
      const rendered = details.data('rendered');
      if (!rendered && !wasOpen) {
        const mapData = await MapData.load(
          bucket,
          data.output
        );
        /* collect all labels */
        const labels = mapData.labels
          .map((label) =>
            this.createBadge(label)
              .addClass('text-captialize'));
        this.appendTableList(dl, MSG_LABELS, labels);

        /* collect all raw JSON */
        const lastIdx = data.output.lastIndexOf('/');
        const basename = data.output.substring(lastIdx + 1);
        const prefix = data.output.substring(0, lastIdx);
        const names = [
          ...mapData.files,
          basename,
        ];

        const s3utils = GetS3Utils();
        const jsons = names.map((name) => {
          const key = `${prefix}/${name}`;

          const badge = this.createBadge(
            name,
            'href',
            key
          );
          badge.ready(async () => {
            const signed = await s3utils.signUrl(
              bucket,
              key
            );

            badge.attr(
              'href',
              signed
            );
          });

          return badge;
        });

        this.appendTableList(dl, MSG_DOWNLOAD_JSON, jsons);
      }
    });

    return details;
  }

  async createTranscribe(data) {
    const s3utils = GetS3Utils();
    const bucket = this.media.getProxyBucket();
    const dl = this.createTableList();
    const details = this.createGrouping(MSG_TRANSCRIBE)
      .append(dl);

    const job = $('<a/>').addClass('mr-1')
      .attr('href', AWSConsoleTranscribe.getJobLink(data.jobId))
      .attr('target', '_blank')
      .html(data.name);
    this.appendTableList(dl, MSG_TRANSCRIPTION_JOB, job);

    [
      'startTime',
      'endTime',
    ].forEach(name =>
      this.appendTableList(dl, name, this.readableValue(data, name)));

    [
      'output',
      'vtt',
    ].forEach((x) => {
      if (data[x]) {
        const name = data[x].substring(
          data[x].lastIndexOf('/') + 1,
          data[x].length
        );

        const badge = this.createBadge(
          name,
          'placeholder',
          TOOLTIP_DOWNLOAD_FILE
        );

        badge.ready(async () => {
          const signed = await s3utils.signUrl(
            bucket,
            data[x]
          );
          badge.attr('href', signed);
        });

        this.appendTableList(dl, x, badge);
      }
    });

    return details;
  }

  async createComprehend(data) {
    const details = this.createGrouping(MSG_COMPREHEND);
    Object.keys(data).forEach(async (type) =>
      details.append(await this.createComprehendByType(data[type], type)));
    return details;
  }

  async createComprehendByType(data, type) {
    const s3utils = GetS3Utils();
    const bucket = this.media.getProxyBucket();
    const dl = this.createTableList();
    const details = this.createGrouping(type, 1)
      .append(dl);

    [
      'startTime',
      'endTime',
    ].forEach(name =>
      this.appendTableList(dl, name, this.readableValue(data, name)));

    [
      'output',
      'metadata',
    ].forEach((x) => {
      if (data[x]) {
        const name = data[x].substring(
          data[x].lastIndexOf('/') + 1,
          data[x].length
        );

        const badge = this.createBadge(
          name,
          'placeholder',
          TOOLTIP_DOWNLOAD_FILE
        );

        badge.ready(async () => {
          const signed = await s3utils.signUrl(
            bucket,
            data[x]
          );
          badge.attr('href', signed);
        });

        this.appendTableList(dl, x, badge);
      }
    });

    return details;
  }

  async createTextract(data) {
    const s3utils = GetS3Utils();
    const bucket = this.media.getProxyBucket();
    const dl = this.createTableList();
    const details = this.createGrouping(MSG_TEXTRACT)
      .append(dl);

    [
      'startTime',
      'endTime',
    ].forEach(name =>
      this.appendTableList(dl, name, this.readableValue(data, name)));

    [
      'output',
    ].forEach((x) => {
      const name = data[x].substring(
        data[x].lastIndexOf('/') + 1,
        data[x].length
      );

      const badge = this.createBadge(
        name,
        'placeholder',
        TOOLTIP_DOWNLOAD_FILE
      );

      badge.ready(async () => {
        const signed = await s3utils.signUrl(
          bucket,
          data[x]
        );
        badge.attr('href', signed);
      });

      this.appendTableList(dl, x, badge);
    });

    return details;
  }

  async createContent() {
    const col = $('<div/>').addClass(`${COL_TAB} my-4 max-h36r`);
    setTimeout(async () => {
      this.loading(true);
      const aimls = await this.media.getAnalysisResults();
      if (!aimls || !aimls.length) {
        col.html(MSG_NO_DATA);
        return this.loading(false);
      }
      col.append(await this.createWorkflowHistory(aimls));
      aimls.forEach(async (aiml) => {
        if (aiml.type === MediaTypes.Video && aiml.rekognition) {
          col.append(await this.createRekognition(aiml.rekognition));
        } else if (aiml.type === MediaTypes.Audio) {
          if (aiml.transcribe) {
            col.append(await this.createTranscribe(aiml.transcribe));
          }
          if (aiml.comprehend) {
            col.append(await this.createComprehend(aiml.comprehend));
          }
        } else if (aiml.type === MediaTypes.Image) {
          col.append(await this.createRekognition(aiml['rekog-image']));
        } else if (aiml.type === MediaTypes.Document) {
          col.append(await this.createTextract(aiml.textract));
        }
      });
      return this.loading(false);
    }, 10);
    return col;
  }
}
